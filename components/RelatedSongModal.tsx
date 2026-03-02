import { Transition, Dialog } from "@headlessui/react";
import Fuse from "fuse.js";
import React, { Fragment, useState } from "react";
import toast from "react-hot-toast";

import { Text, TextField } from "./base";
import { SearchBy, SongType } from "../lib/constants";
import { generateSongSearches } from "../lib/songs/generateSongSearch";
import SelectSongCandidate from "../ts/types/selectSongCandidate.interface";
import SongMeta from "../ts/types/songMeta.interface";
import SongSearch from "../ts/types/songSearch.interface";
import HymnTag from "./HymnTag";
import SongItem from "./SongItem";
import SongSearchSelect from "./SongSearchSelect";
import HymnBookMeta from "../ts/types/hymnBookMeta.interface";

// regular fuse search (hymn, page number, and title)
const REG_FUSE_OPTIONS = {
  includeScore: true,
  threshold: 0.4,
  keys: [
    "name",
    "hymn",
    "pageNumber",
    "fullBookName",
    "bookAndPage",
    "fullBookAndPage",
  ],
};

/**
 * Finds the list of songs based on the input
 *
 * @param englishFuse English fuse for searching
 * @param chineseFuse Chinese fuse for searching
 * @param inputValue  Input Value used in the search
 * @param songType    song Type used to do searching
 * @returns           Promise of songs that are selected given the input
 */
const filterOptions = async (
  englishFuse: Fuse<SongSearch>,
  chineseFuse: Fuse<SongSearch>,
  inputValue: string,
  songType: SongType
): Promise<SelectSongCandidate[]> => {
  const input = inputValue.toLowerCase();

  // search for song based on whether it's chinese or english
  let results =
    songType === SongType.english
      ? englishFuse.search(input)
      : chineseFuse.search(input);
  // regular search
  return results.map((res) => ({
    label: res.item.name,
    value: res.item.name,
    data: res.item,
  }));
};

/**
 * Modal to add related song for the current song the user is at
 */
const RelatedSongModal = ({
  modalIsOpen,
  closeModal,
  songList,
  allBooks,
  currentSong,
  addCallback, // callback method whenever a related song is added
}: {
  modalIsOpen: boolean;
  closeModal: () => void;
  songList: SongMeta[];
  allBooks: { [key: string]: HymnBookMeta };
  currentSong: SongMeta;
  addCallback?: (song: SongMeta) => void;
}) => {
  const [songToAdd, setSongToAdd] = useState(null);
  const [primaryStanzaText, setPrimaryStanzaText] = useState("");
  const [secondaryStanzaText, setSecondaryStanzaText] = useState("");
  const [noteText, setNoteText] = useState("");

  const silentHandles = () => { };
  // generate searchable songs, we need to split between chinese and english songs
  // and create the fuses for them
  const songSearches: SongSearch[] =
    songList != null ? generateSongSearches(songList, allBooks) : [];


  const chineseSongs = songSearches.filter(
    (song) => song.songType == SongType.chinese
  );
  const englishSongs = songSearches.filter(
    (song) => song.songType == SongType.english
  )

  // for search api => chinese song slug
  const chineseSongByName = chineseSongs.reduce((obj, song) => {
    obj[song.name] = song;
    return obj;
  }, {});

  const chineseFuse = new Fuse(chineseSongs, REG_FUSE_OPTIONS);
  const englishFuse = new Fuse(englishSongs, REG_FUSE_OPTIONS);

  // create default song options for chinese and english
  const defaultChineseSongOptions: SelectSongCandidate[] = chineseSongs.map(
    (res) => ({
      label: res.name,
      value: res.name,
      data: res,
    })
  );
  const defaultEnglishSongOptions: SelectSongCandidate[] = englishSongs.map(
    (res) => ({
      label: res.name,
      value: res.name,
      data: res,
    })
  );

  /**
   * Method that handles when user clicks on a selectable item in the select.
   */
  const handleSelect = (e) => {
    if (e == null) {
      return;
    }
    setSongToAdd(e?.data);
  };

  const promiseOptions = (
    inputValue: string
  ): Promise<SelectSongCandidate[]> => {
    return filterOptions(
      englishFuse,
      chineseFuse,
      inputValue,
      SongType.english
    );
  };

  /**
   * Handle whenever new text is added to the primary stanzas textfield
   *
   * @param e event
   */
  const handlePrimaryStanzaTextChange = (e) => {
    setPrimaryStanzaText(e.target.value ?? "");
  };

  /**
   * Handle whenever new text is added to the secondary stanzas textfield
   *
   * @param e event
   */
  const handleSecondaryStanzaTextChange = (e) => {
    setSecondaryStanzaText(e.target.value ?? "");
  };

  /**
   * Handle whenever next text is added to the note textfield
   *
   * @param e event
   */
  const handleNoteTextChange = (e) => {
    setNoteText(e.target.value ?? "");
  };

  /**
   * Adds a related song, based on the songToAdd state
   */
  const addRelatedSong = async () => {
    if (songToAdd == null) {
      toast.error("Please choose a song to add");
      return;
    }

    if (!currentSong?.slug || !songToAdd?.slug) {
      toast.error("Something is wrong...");
      return;
    }

    // stanza text are null if empty string or with spaces
    const primaryStanzas = primaryStanzaText
      ? primaryStanzaText?.trim() == ""
        ? null
        : primaryStanzaText?.trim()
      : null;
    const secondaryStanzas = secondaryStanzaText
      ? secondaryStanzaText?.trim() == ""
        ? null
        : secondaryStanzaText?.trim()
      : null;

    try {
      await fetch("/api/related", {
        method: "PUT",
        body: JSON.stringify({
          primary: currentSong?.slug,
          primarySongType: currentSong?.songType,
          primaryStanzas,
          secondary: songToAdd?.slug,
          secondarySongType: songToAdd?.songType,
          secondaryStanzas,
          note: noteText ?? null,
        }),
      });
      toast.success("Successfully added.");
      addCallback ? addCallback(songToAdd) : null;
      setSongToAdd(null);
      setPrimaryStanzaText("");
      setSecondaryStanzaText("");
      setNoteText("");
      closeModal();
    } catch (error) {
      toast.error("Something is wrong with Server" + error.getMessage());
    }
  };

  return (
    <Transition appear show={modalIsOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-auto"
        onClose={closeModal}
      >
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-x-0 mx-auto top-16 xl:top-1/4 w-full max-w-md p-4 my-3 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl modal-box">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 mb-4"
              >
                Add a Related Song
              </Dialog.Title>

              <SongSearchSelect
                searchBy={SearchBy.default}
                promiseOptions={promiseOptions}
                onChange={handleSelect}
                handleMenuOpen={silentHandles}
                handleMenuClose={silentHandles}
                defaultEnglishSongOptions={defaultEnglishSongOptions}
                defaultChineseSongOptions={defaultChineseSongOptions}
              />
              <div className="h-30 mt-4 mb-6 block w-auto">
                {songToAdd ? (
                  <SongItem
                    song={songToAdd}
                    handleClick={silentHandles}
                    hasHover={false}
                  >
                    <Text as="p" className="pl-0.5">
                      <HymnTag
                        pageNumber={songToAdd?.pageNumber}
                        hymnBook={songToAdd?.hymn}
                        fullName={false}
                        allowLink={false}
                      />
                      <Text fontSize="16px" as="span" className="pt-1 pl-2">
                        {songToAdd?.name}
                      </Text>
                    </Text>
                  </SongItem>
                ) : (
                  <div className="h-10 my-10"></div>
                )}
              </div>
              {songToAdd && (
                <>
                  <div className="block w-auto">
                    <Text as="span" fontSize="14px" color="#444">
                      Current Song Stanzas
                    </Text>
                    <div className="textfield-box">
                      <TextField
                        aria-label="Enter current song stanzas"
                        autoComplete=""
                        id="primary-stanzas-input"
                        lines={1}
                        type="input"
                        placeholder="Stanzas for current song"
                        value={primaryStanzaText}
                        onChange={handlePrimaryStanzaTextChange}
                      />
                    </div>
                  </div>
                  <div className="block w-auto mt-2 mb-2">
                    <Text
                      as="span"
                      fontSize="14px"
                      color="#444"
                      className="mb-1"
                    >
                      Related Song Stanzas
                    </Text>
                    <div className="mt-1 textfield-box">
                      <TextField
                        aria-label="Enter related song stanzas"
                        autoComplete=""
                        id="secondary-stanzas-input"
                        lines={1}
                        type="input"
                        placeholder="Stanzas for related song"
                        value={secondaryStanzaText}
                        onChange={handleSecondaryStanzaTextChange}
                      />
                    </div>
                  </div>
                  <div className="block w-auto mt-2 mb-2">
                    <Text
                      as="span"
                      fontSize="14px"
                      color="#444"
                      className="mb-1"
                    >
                      Note
                    </Text>
                    <div className="mt-1 textfield-box">
                      <TextField
                        aria-label="Any notes?"
                        autoComplete=""
                        id="note-input"
                        lines={2}
                        type="textarea"
                        placeholder="Note for this relation"
                        value={noteText}
                        onChange={handleNoteTextChange}
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="mt-6">
                <button
                  type="button"
                  className={`inline-flex justify-center px-4 py-2 text-sm font-medium bg-green-700 ${songToAdd
                    ? "hover:shadow-md hover:drop-shadow-md"
                    : "opacity-40 cursor-not-allowed	"
                    } text-white border border-transparent rounded-md`}
                  onClick={addRelatedSong}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center ml-2 px-4 py-2 border border-gray-300 border-solid text-sm font-medium text-gray-900 bg-white hover:shadow-md hover:drop-shadow-md rounded-md"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
            <style jsx>{`
              .textfield-box {
                width: 100%;
                display: flex;
                font-size: 0.875rem;
                cursor: pointer;
              }

              // max height and scrollable content
              .modal-box {
                max-height: 560px;
                overflow-y: auto;
              }
            `}</style>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RelatedSongModal;

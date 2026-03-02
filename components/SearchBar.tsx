import Fuse from "fuse.js";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { isMobileOnly } from "react-device-detect";

import {
  getHymnBookKey,
  getSearchBy,
  HymnBook,
  OTHER_HYMN_BOOKS,
  SearchBy,
  SEARCH_BY_CONTENT_URL,
  SongType,
  userHasRoleOrAdmin,
  UserRole,
  ALLOWED_CHINESE_BOOKS,
} from "../lib/constants";
import { useBooks, useSongs, useUser } from "../lib/uiUtils";
import { SongTypeContext } from "./SongTypeProvider";

import { generateSongSearches } from "../lib/songs/generateSongSearch";
import { getSongPath } from "../lib/songs/getSongPath";
import { SelectSongCandidate } from "../ts/types/selectSongCandidate.interface";
import SongMeta from "../ts/types/songMeta.interface";
import SongSearch from "../ts/types/songSearch.interface";

import { Text, Box, Flex } from "./base";
import OptionPopup from "./OptionPopup";
import Row from "./row";
import ToggleDetails from "./ToggleDetails";
import SongSearchSelect from "./SongSearchSelect";
import { useSession } from "next-auth/react";
import HymnBookMeta from "../ts/types/hymnBookMeta.interface";
import { userCanSeeBilingual } from "../lib/users/role";

// localstorage key
const IS_CONTENT_SEARCH_LC_KEY = "isContentSearch";

// regular fuse search (hymn, page number, and title)
const REG_FUSE_OPTIONS = {
  includeScore: true,
  threshold: 0.4,
  keys: [
    "sanitizedName",
    "hymn",
    "pageNumber",
    "fullBookName",
    "bookAndPage",
    "fullBookAndPage",
    "otherPages",
    "name",
  ],
};

/**
 * Chinese book names sent by the search api we call for searching by lyrics. These book names are slightly different from
 * the HymnBook enum.
 */
enum ChineseBookNamesInSearchApi {
  愛的迥嚮 = HymnBook.EL,
  神家詩歌一冊 = HymnBook.H1,
  神家詩歌二冊 = HymnBook.H2,
  神家詩歌三冊 = HymnBook.H3,
  神家詩歌四冊 = HymnBook.H4,
  神家詩歌五冊 = HymnBook.H5,
  神家詩歌六冊 = HymnBook.H6,
  神家詩歌七冊 = HymnBook.H7,
  神家詩歌八冊 = HymnBook.H8,
  神家詩歌九冊 = HymnBook.H9,
  神家詩歌十冊 = HymnBook.H10,
  神家詩歌十一冊 = HymnBook.H11,
  神家詩歌十二冊 = HymnBook.H12,
  神家詩歌十三冊 = HymnBook.H13,
  神家詩歌十四冊 = HymnBook.H14,
  神家詩歌十五冊 = HymnBook.H15,
  神家詩歌十六冊 = HymnBook.H16,
  神家詩歌十七冊 = HymnBook.H17,
  神家詩歌十八冊 = HymnBook.H18,
  神家詩歌十九冊 = HymnBook.H19,
  神家詩歌二十冊 = HymnBook.H20,
  神家詩歌二十一冊 = HymnBook.H21,
}

/**
 * From {@link ChineseBookNamesInSearchApi} to the {@link HymnBook} enum
 */
const chineseBookNameToHymnBook = (bookName: string): string => {
  if (bookName in ChineseBookNamesInSearchApi) {
    return ChineseBookNamesInSearchApi[bookName];
  }
  return null;
};

/**
 * When dealing with the search api, we want to filter out books we do not know of. The search api
 * returns different data depending on whether it's an english or chinese songs, and we also need
 * a separate mapping for chinese book names {@see ChineseBookNamesInSearchApi}
 */
const hymnSearchApiFilter = (song, chineseSongByName) => {
  // english song books appear in category
  if (Object.keys(HymnBook).includes(song.category)) {
    return true;
  }
  // chinese songs have category, but that includes the page number there for some reason
  // but the book name appears in the `name` field which doesnt exist
  if (Object.keys(ChineseBookNamesInSearchApi).includes(song?.hymn ?? "none")) {
    if (song?.hymn && !chineseSongByName[song?.name]?.slug) {
      return false;
    }
    return true;
  }

  return false;
};

/**
 * Get the correct HymnBook key, like `H12` in a string value for the `song.hymn`
 *
 * @param song  Song from search api
 * @returns
 */
const getCorrectHymnBook = (song): string => {
  // chinese song has name but english song doesnt
  if (song?.hymn) {
    return getHymnBookKey(chineseBookNameToHymnBook(song?.hymn));
  }

  // english song
  return song?.category;
};

/**
 * Get the correct slug based on the song object from the search api.
 * If chinese: we find the correct slug based on it's name (since slugs can be like H12_0_0 if there are multiple songs in a page)
 * If english: behave like normal slug
 *
 * @param song \
 * @param chineseSongByName
 * @returns
 */
const getCorrectSlugFromSearch = (
  song,
  chineseSongByName: { [key: string]: SongMeta }
): string => {
  const hymnBook = getCorrectHymnBook(song);
  if (song?.hymn) {
    return chineseSongByName[song?.name]?.slug ?? "DNE";
  }

  // english
  return `${hymnBook}_${song.page}`;
};

/**
 * Method to provide the filtered list of songs based on the input value
 *
 * @param englishFuse     Fuse for english searching
 * @param chineseFuse     Fuse for chinese searching
 * @param inputValue      the input value
 * @param searchBy        searchBy value
 * @param songType        song's type defines whether to search chinese or english
 */
const filterOptions = async (
  englishFuse: Fuse<SongSearch>,
  chineseFuse: Fuse<SongSearch>,
  portugueseFuse: Fuse<SongSearch>,
  songsByName: { [key: string]: SongMeta },
  inputValue: string,
  searchBy: SearchBy,
  songType: SongType
): Promise<SelectSongCandidate[]> => {
  const input = transformInput(inputValue);

  // search by content instead
  if (searchBy === SearchBy.lyrics) {
    // if (songType == SongType.chinese) {
    //   const res = await fetch(`${SEARCH_BY_CONTENT_URL}?q=${inputValue}`);
    //   const jsonRes = await res.json();
    //   const songList = jsonRes.result;
    //   // 1) filter out songs that aren't in hymn books that are supported
    //   // 2) convert to SelectSongCandidate[]
    //   const chineseSongByName = songsByName;
    //   return songList
    //     .filter((song) => hymnSearchApiFilter(song, chineseSongByName))
    //     .map((song) => {
    //       return {
    //         label: song.name, // to show song name in dropdown
    //         value: "", // useless
    //         matchedText: song._highlightResult.lyricsText.value, // to show the matched text below the tag of the song
    //         data: {
    //           id: song.objectID, // ignore anyways
    //           hymn: getCorrectHymnBook(song), // used to show in dropdown. `hymn` field is only shown in chinese songs, and we don't want to use `category`, unless it's english
    //           pageNumber: song.page, // used to show in dropdown
    //           name: song.name,
    //           dataUrl: song.jianpu,
    //           markdownUrl: song.md,
    //           slug: getCorrectSlugFromSearch(song, chineseSongByName),
    //           songType: song?.hymn ? SongType.chinese : SongType.english,
    //         },
    //       };
    //     });
    // }

    const searchRes = await fetch(`/api/songs/search?searchQuery=${inputValue}&songType=${songType}`);
    const searchJson = await searchRes.json();
    const songList = searchJson.result

    const lyricSearchRes = songList
      .filter((song) => song.document.songType == songType)
      .map((song) => ({
        label: song.document.hymn,
        value: "", // useless
        newMatchedText: {
          positionIntervals: song.positionIntervals,
          content: song?.document?.content,
        },
        data: {
          id: song.id, // ignore anyways
          hymn: song?.document?.hymn,
          pageNumber: song?.document?.pageNumber, // used to show in dropdown
          name: song?.document?.name,
          slug: song?.document?.id,
          songType: song?.document?.songType,
        }
      }))

    return lyricSearchRes;
  }

  // search for song based on language
  let results;
  switch (songType) {
    case SongType.portuguese:
      results = portugueseFuse.search(input);
      break;
    case SongType.chinese:
      results = chineseFuse.search(input);
      break;
    case SongType.english:
    default:
      results = englishFuse.search(input);
  }

  // limit # of results to 50 for faster ui
  results = results.slice(0, Math.min(results.length, 50));

  // regular search
  return results.map((res) => ({
    label: res.item.name,
    value: res.item.name,
    data: res.item,
  }));
};

/**
 * Transform Input to nice regex string
 *
 * @param input input value
 */
const transformInput = (input: string): string => {
  // convert all special characters except empty space
  let newInput = input.toLowerCase();
  // newInput = newInput.replace(/\s\s+/g, ' ');
  // newInput = newInput.replace(/[^a-zA-Z ]/g, "|$&|")
  return newInput;
  // return newInput.replace(" ", "|")
};

/**
 * Search bar for songs. We generate a regex string for the user input to search for and match
 *
 * @param songList list of songs
 */
export const SearchBar = (): JSX.Element => {
  const router = useRouter();
  const [searchBy, toggleSearchBy] = useState(SearchBy.default);
  const [popupOn, togglePopup] = useState(false);
  const [isMenuOpen, toggleMenuOpen] = useState(false);
  const { songType: songTypeCtxValue } = useContext(SongTypeContext);
  const [inputVal, setInputVal] = useState("");
  const { data: session, status } = useSession();
  const user = useUser(session?.user?.email, status);

  const songs: { [key: string]: SongMeta } = useSongs();
  const books: { [key: string]: HymnBookMeta } = useBooks();

  let songList: SongMeta[] = songs ? Object.values(songs) : [];
  if (!userHasRoleOrAdmin(user, UserRole.readOtherSongs)) {
    songList = songList.filter(book => !OTHER_HYMN_BOOKS.includes(book.hymn))
  }

  // ref to the button, so we know the absolute dimensions of it
  const buttonRef = useRef(null);
  const btnPos = buttonRef.current && buttonRef.current.getBoundingClientRect();

  /**
   * Set default searchBy value
   */
  useEffect(() => {
    // default to -1 if it is not available
    let localStorageSearchBy =
      localStorage.getItem(IS_CONTENT_SEARCH_LC_KEY) ??
      SearchBy.default.toString();

    // ensure backwards comptability (previous it was a number)
    if (!(localStorageSearchBy in SearchBy)) {
      localStorageSearchBy = SearchBy.default.toString();
      localStorage.setItem(IS_CONTENT_SEARCH_LC_KEY, localStorageSearchBy);
    }
    toggleSearchBy(getSearchBy(localStorageSearchBy));
  });

  /**
   * Method that handles when user clicks on a selectable item in the search bar.
   *
   * @param e
   * @returns
   */
  const changeVal = (e) => {
    if (e == null) {
      return;
    }

    setInputVal("");
    router.push(getSongPath(e?.data));
  };

  /**
   * Called whenever the Select bar is opened
   */
  const handleMenuOpen = () => {
    toggleMenuOpen(true);
  };

  /**
   * Called whenever the Select bar is closed
   */
  const handleMenuClose = () => {
    toggleMenuOpen(false);
  };

  /**
   * Handle when the filter button is clicked
   *
   * @param e
   */
  const handlePopupClick = (e) => {
    togglePopup(!popupOn);
  };

  // handles clicks on isContentSearch icon
  const handleSearchByClick = (e) => {
    // update localStorage
    const newSearchBy =
      searchBy === SearchBy.default ? SearchBy.lyrics : SearchBy.default;

    toggleSearchBy(newSearchBy);
    localStorage.setItem(IS_CONTENT_SEARCH_LC_KEY, newSearchBy.toString());
  };

  // generate searchable songs, we need to split between chinese and english songs
  // and create the fuses for them
  const songSearches: SongSearch[] =
    songList != null ? generateSongSearches(songList, books) : [];

  const chineseSongs = songSearches.filter(
    (song) => song.songType == SongType.chinese
  ).filter(song => {
    if (userHasRoleOrAdmin(user, UserRole.readChineseSongs)) {
      return true;
    }
    return ALLOWED_CHINESE_BOOKS.includes(song.hymn)
  });
  let englishSongs = songSearches.filter(
    (song) => song.songType == SongType.english
  );

  let portugueseSongs = songSearches.filter(
    (song) => song.songType == SongType.portuguese
  );

  // for search api => chinese song slug
  const songsByName = chineseSongs.reduce((obj, song) => {
    obj[song.name] = song;
    return obj;
  }, {});

  const chineseFuse = new Fuse(chineseSongs, REG_FUSE_OPTIONS);
  const englishFuse = new Fuse(englishSongs, REG_FUSE_OPTIONS);
  const portugueseFuse = new Fuse(portugueseSongs, REG_FUSE_OPTIONS);

  // create default song options for chinese and english
  const defaultChineseSongOptions: SelectSongCandidate[] = chineseSongs
    .slice(0, 100)
    .map((res) => ({
      label: res.name,
      value: res.name,
      data: res,
    }));
  const defaultEnglishSongOptions: SelectSongCandidate[] = englishSongs.map(
    (res) => ({
      label: res.name,
      value: res.name,
      data: res,
    })
  );
  const defaultPortugueseSongOptions: SelectSongCandidate[] = portugueseSongs.map(
    (res) => ({
      label: res.name,
      value: res.name,
      data: res,
    })
  );

  const promiseOptions = (
    inputValue: string
  ): Promise<SelectSongCandidate[]> => {
    return filterOptions(
      englishFuse,
      chineseFuse,
      portugueseFuse,
      songsByName,
      inputValue,
      searchBy,
      songTypeCtxValue as SongType
    );
  };

  let suggestionText;
  switch (songTypeCtxValue) {
    case SongType.chinese:
      suggestionText = "Search by title, book (shortcut or full name), page number. Try `h2 5` or `歌2 5` or `在十架` or `h13` etc.";
      break;
    case SongType.portuguese:
      suggestionText = "Search by title, book (shortcut or full name), page number. Try `p1 53` or `amor 1 53` or `Somente Jesus` or `p1` etc.";
      break;
    default:
      suggestionText = "Search by title, book (shortcut or full name), page number. Try `sol1 94` or `only jesus` or `Songs of love 1 94`";
  }
  if (searchBy === SearchBy.lyrics) {
    suggestionText = "Search by lyrics of a song or its title";
  }

  return (
    <Box width="100%">
      <Row className="w-full justify-start">
        <Box className="pr-3 flex-[2] grow-[20] w-full">
          <SongSearchSelect
            isDisabled={popupOn}
            searchBy={searchBy}
            promiseOptions={promiseOptions}
            onChange={changeVal}
            handleMenuOpen={handleMenuOpen}
            handleMenuClose={handleMenuClose}
            defaultEnglishSongOptions={defaultEnglishSongOptions}
            defaultChineseSongOptions={defaultChineseSongOptions}
            defaultPortugueseSongOptions={defaultPortugueseSongOptions}
          />
        </Box>
        {(isMobileOnly && !isMenuOpen) || !isMobileOnly ? (
          <Flex className="flex-1 shrink-0">
            <img
              ref={buttonRef}
              src={
                searchBy == SearchBy.lyrics ||
                  songTypeCtxValue == SongType.chinese
                  ? "/sliders-success.svg"
                  : "/sliders.svg"
              }
              width="24px"
              onClick={handlePopupClick}
              className="is-content-search-icon"
              title="Search settings"
              alt="Change search settings"
            />
          </Flex>
        ) : null}
      </Row>
      {popupOn && (
        <OptionPopup
          popUpOn={popupOn}
          togglePopup={togglePopup}
          btnPos={btnPos}
          searchBy={searchBy}
          toggleSearchBy={handleSearchByClick}
        />
      )}
      <Text
        as="p"
        fontSize="12px"
        color="#8B9199"
        className="ml-0.5 mt-2 mb-1"
        lineHeight="1.2"
      >
        {suggestionText}
      </Text>
      <ToggleDetails toggleText="More tips">
        <Box className="ml-6 overflow-hidden">
          <Text as="span" fontSize="12px" color="#8B9199">
            <>
              Use the icon on the right to toggle between searching by the
              content of songs. <br />
              <br />
              Some Shortcuts in normal mode: <br />· Hymnal 1 {"=>"} h1
              <br />· Songs of love 2 {"=>"} sol2 <br />· Gods beautiful heart{" "}
              {"=>"} gbh <br />· 神家詩歌 1 {"=>"} h1 <br />· for SOL1 32, you
              can filter out most with `1 32`
            </>
          </Text>
        </Box>
      </ToggleDetails>
      <style jsx>{`
        .is-content-search-icon {
          cursor: pointer;
          min-width: 24px;
        }
        .pre-tip {
          width: 100%;
        }
      `}</style>
    </Box>
  );
};

export default SearchBar;

import React, { useState } from "react";
import SongMeta from "../../ts/types/songMeta.interface";
import { Button, Text, TextField } from "../base";
import GenericModal from "../GenericModal";
import { addNote, EMAIL_TYPE_ENUM, SONG_NOTE_INDEX_NAME, SONG_TYPE_ENUM } from "../../lib/generic-entries/songNotes";
import { useSession } from "next-auth/react";
import { useUser } from "../../lib/uiUtils";
import UserInfo from "../../ts/types/userInfo.interface";
import toast from "react-hot-toast";
import { mutate } from "swr";
import HymnTag from "../HymnTag";

/**
 * Modal for Adding song notes
 */
const AddNoteModal = ({
  song,
  isOpen,
  closeModal
}: {
  song: SongMeta; // song to add note for
  isOpen: boolean;  // is modal open
  closeModal: () => void;  // method to close modal
}) => {
  const { data: session, status } = useSession();
  const email: string | null | undefined = session?.user?.email;
  const user: UserInfo | null = useUser(email, status);

  const [note, setNote] = useState("");

  /**
   * Handle adding note
   */
  const handleAddNote = async () => {
    await addNote(song?.slug, email as string, note);
    setNote("");
    toast.success("Added note!");

    mutate(`/api/generic-entry?pk=${song?.slug}&pType=${SONG_TYPE_ENUM}&sk=${session?.user?.email}&sType=${EMAIL_TYPE_ENUM}&indexName=${SONG_NOTE_INDEX_NAME}`);
    closeModal();
  }

  return (
    <GenericModal
      modalIsOpen={isOpen}
      closeModal={closeModal}
      title={<>Add Song Note</>}
      className="top-2 md:top-1/4"
    >
      <div className="flex mt-3 w-full">
        <div className="flex flex-col w-full">
          <div className="mt-2 pb-3 border-b w-full border-[#e1e4e8]">
            <HymnTag
              pageNumber={song?.pageNumber}
              hymnBook={song?.hymn}
              fullName={false}
              allowLink={false}
            />
            <Text fontSize="16px" as="span" className="pt-1 pl-2">
              {song?.name}
            </Text>
          </div>
          <Text className="mt-3">Note:</Text>
          <TextField
            ariaLabel="Enter Notes"
            autoComplete=""
            id="song-note-input"
            lines={4}
            type="textarea"
            placeholder={"Enter any thoughts on this song..."}
            value={note}
            onChange={(e) => { setNote(e?.target?.value ?? "") }}
          />
          <div className="mt-3">
            <Button
              className={`bg-sky-700`}
              onClick={handleAddNote}
            >
              Add
            </Button>
            <Button
              shadow={false}
              className="ml-2"
              outline={true}
              onClick={closeModal}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </GenericModal>
  )
}

export default AddNoteModal;
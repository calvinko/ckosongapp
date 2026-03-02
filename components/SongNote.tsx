import { useSession } from "next-auth/react";
import React from "react";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { Text } from "../components/base"
import { getShortenedDateToMin } from "../lib/dateUtils";
import { deleteNote, EMAIL_TYPE_ENUM, SONG_NOTE_INDEX_NAME, SONG_TYPE_ENUM } from "../lib/generic-entries/songNotes";
import SongMeta from "../ts/types/songMeta.interface";
import { SongNote } from "../ts/types/songNote.interface"
import HymnTag from "./HymnTag";

/**
 * Component for Song Notes
 */
const SongNoteBox = ({
  songNote,
  song,
  withSong = false
}: {
  songNote: SongNote, // the note itself
  song?: SongMeta,    // song metadata the note is on
  withSong?: boolean  // if we show the song or not (for cases where the note is shown without song in context)
}) => {
  const { data: session, status: _ } = useSession();

  /**
   * Remove current song note
   */
  const removeNote = async () => {
    deleteNote(songNote?.id);
    mutate(`/api/generic-entry?pk=${song?.slug}&pType=${SONG_TYPE_ENUM}&sk=${session?.user?.email}&sType=${EMAIL_TYPE_ENUM}&indexName=${SONG_NOTE_INDEX_NAME}`);
    mutate(`/api/generic-entry?sk=${session?.user?.email}&sType=${EMAIL_TYPE_ENUM}&indexName=${SONG_NOTE_INDEX_NAME}`);
    toast.success("Removed note");
  }

  return (
    <div className="block bg-white rounded-lg border border-sky-100 w-full mb-2">
      <div className={`rounded-t-md bg-sky-100 pl-2 flex items-center ${withSong ? "p-2" : "p-1"}`}>
        <div>
          {withSong ?
            <div className="flex items-center">
              <div>
                <HymnTag
                  pageNumber={song?.pageNumber}
                  hymnBook={song?.hymn as string}
                  fullName={false}
                  allowLink
                />
              </div>
              <div>
                <Text fontSize="14px" as="p" className="pl-2" lineHeight="1">
                  {song?.name}
                </Text>
                <Text as="p" fontSize="11px" color="#8B9199" className="pl-2 pt-2" lineHeight="1">{getShortenedDateToMin(songNote?.createdAt)}</Text>
              </div>
            </div>
            :
            <div className="flex items-center">
              <div style={{ fontSize: "10px", lineHeight: "1" }}>
                <img
                  src={session?.user?.image ?? "/unknown-user.jpeg"}
                  alt="profile picture"
                  className="profile-img-sm"
                />
              </div>
              <div className="pl-2 mt-1">
                <Text fontSize="14px" as="p" lineHeight="1">{session?.user?.name}</Text>
                <Text as="p" fontSize="11px" color="#8B9199">{getShortenedDateToMin(songNote?.createdAt)}</Text>
              </div>
            </div>
          }
        </div>
        <div className="ml-auto">
          <img
            src="/x-inactive.svg"
            onMouseOver={(e) => (e.currentTarget.src = "/x.svg")}
            onMouseOut={(e) => (e.currentTarget.src = "/x-inactive.svg")}
            width="20px"
            className="mr-2 cursor-pointer"
            onClick={removeNote}
          />
        </div>
      </div>
      <div className="p-4">
        <Text as="p" color="#666B72" className="whitespace-pre-wrap" lineHeight="1.2">
          {songNote?.note}
        </Text>
      </div>
    </div>
  )
}

export default SongNoteBox;
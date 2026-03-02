import { GenericEntry, GenericEntryCreate } from "../../ts/types/genericEntry.interface"
import SongMeta from "../../ts/types/songMeta.interface"
import { SearchableSongNote, SongNote } from "../../ts/types/songNote.interface"
import UserInfo from "../../ts/types/userInfo.interface"
import { userHasRoleOrAdmin, UserRole } from "../constants"
import { getDay } from "../dateUtils"
import { createEntry, deleteEntry, useEntriesForSk, useEntriesWithAccess } from "./generic-entry-adapter"


/**
 * Fuse for searching SongNotes. On the type SearchableSongNote
 */
export const NOTE_SEARCH_FUSE_OPTIONS = {
  includeScore: true,
  threshold: 0.3,
  keys: [
    { name: "note", weight: 4 },
    "slug",
    "song.name",
    "song.pageNumber",
    { name: "createdAtFullDate", weight: 2 },
    { name: "createdAtShortDate", weight: 2 }
  ],
};

/**
 * The Index Name for Song Notes. SongNotes are stored in the GenericEntry table and this defines the index to use
 */
export const SONG_NOTE_INDEX_NAME = "songNotes"
/**
 * Song type
 */
export const SONG_TYPE_ENUM = "SONG" // pk type
/**
 * Email type
 */
export const EMAIL_TYPE_ENUM = "EMAIL" // sk type

/**
 * Add/Create a Song Note
 * 
 * @param slug  slug of the song
 * @param email email of the user adding this song
 * @param note  note to add 
 * @returns     SongNote
 */
export const addNote = async (slug: string, email: string, note: string): Promise<SongNote> => {
  const entry: GenericEntryCreate = {
    indexName: SONG_NOTE_INDEX_NAME,
    pk: slug,
    pType: SONG_TYPE_ENUM,
    sk: email,
    sType: EMAIL_TYPE_ENUM,
    payload: {
      note: note
    }
  }

  const newEntry = await createEntry(entry)
  return toSongNote(newEntry);
}

/**
 * Hook to get all notes the user wrote for the song
 * 
 * @param slug  song's slug
 * @param user  user
 * @returns     list of SongNotes, null if error, undefined if not loaded
 */
export const useNotesForSongAndUser = (slug: string | null | undefined, user: UserInfo | null | undefined): SongNote[] => {
  const entries = useEntriesWithAccess(SONG_NOTE_INDEX_NAME, slug, SONG_TYPE_ENUM, user?.email, EMAIL_TYPE_ENUM, userHasRoleOrAdmin(user, UserRole.songNotes));
  if (entries == undefined) {
    return undefined;
  }
  if (entries == null) {
    return null;
  }
  return entries.map(e => toSongNote(e));
}

/**
 * Hook to get all notes the user wrote
 * 
 * @param email   user's email
 * @returns       list of SongNotes, null if error
 */
export const useNotesForUser = (email: string | null | undefined): { songNotes: SongNote[] | undefined | null, isLoading: boolean } => {
  const { entries, isLoading } = useEntriesForSk(SONG_NOTE_INDEX_NAME, email, EMAIL_TYPE_ENUM)
  if (entries == undefined) {
    return { songNotes: undefined, isLoading };
  }
  if (entries == null) {
    return { songNotes: null, isLoading }
  };

  return { songNotes: entries.map(e => toSongNote(e)), isLoading };
}

/**
 * Delete an existing note
 * 
 * @param id note's id
 */
export const deleteNote = async (id: string) => {
  await deleteEntry(id);
}

/**
 * Convert GenericEntry to SongNote
 * 
 * @param entry GenericEntry
 * @returns     SongNote
 */
export const toSongNote = (entry: GenericEntry): SongNote => {
  return {
    id: entry._id,
    slug: entry.pk,
    email: entry.sk,
    note: entry.payload.note,
    createdAt: Date.parse(entry.createdAt), // Date is a number in milliseconds
    updatedAt: Date.parse(entry.updatedAt)
  }
}

/**
 * Convert SongNote to searchable version
 * 
 * @param note  Song Note
 * @param song  Song of the song note
 * @returns     SearchableSongNote
 */
export const toSearchableSongNote = (note: SongNote, song: SongMeta): SearchableSongNote => {
  return {
    ...note,
    song,
    createdAtFullDate: getDay(note.createdAt, false, false),
    createdAtShortDate: getDay(note.createdAt, true, true)
  }
}
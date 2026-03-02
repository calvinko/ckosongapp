import SongMeta from "./songMeta.interface";

/**
 * A Note on a Song, stored as a GenericEntry. A song note is a note on a song and also on the user
 * @see GenericEntry
 */
export interface SongNote {
  // id of the song note (mongodb id)
  id: string
  // the song slug
  slug: string;
  // the email of the user
  email: string;
  // the note
  note: string;
  // the timestamp of when the note was created
  createdAt: number;
  // the timestamp of when the note was last updated
  updatedAt: number
}

/**
 * Searchable Song Note (includes extra data for search)
 */
export interface SearchableSongNote extends SongNote {
  // the song note's song
  song: SongMeta
  // full date like "October 1, 2021"
  createdAtFullDate: string
  // short date like "Oct 1, 21"
  createdAtShortDate: string
}
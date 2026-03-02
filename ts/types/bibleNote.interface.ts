
/**
 * Note on the bible (this is not a feature of the song app but separate)
 */
export interface BibleNote {
  // id of the bible note (mongodb id)
  id: string
  // the email of the user
  email: string;
  // the bible reference this note is on
  bibleRef: string;
  // text of the bible reference this note is on
  bibleText: string;
  // the note
  note: string;
  // the timestamp of when the note was created
  createdAt: number;
  // the timestamp of when the note was last updated
  updatedAt: number
}
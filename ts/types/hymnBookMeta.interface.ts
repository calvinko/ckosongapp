import { SongType } from "../../lib/constants";

/**
 * Metadata for Hymn books
 */
export interface HymnBookMeta {
  // the full name of the hymn book (ex: "Songs of Love 1")
  bookFullName: string;
  // the short name, reference to hymn (ex: "SOL1")
  hymnBook: string;
  // whether or not the hymn book supports individual sheet music per song
  hasOwnSheetPdf?: boolean;
  songType: SongType;
  // relative url for hymn book cover image
  imageUrl?: string;
  // relative url for hymn book album cover image
  albumCoverUrl?: string;

  tagSort?: string[];
  // # of pages (starting from 1), referencing the page number of the last page of the last song
  pageSize?: number;
  // no typed lyrics, only song sheet available
  onlySongSheet?: boolean;
  // page offset between song page number and actual chord song sheet pdf page number
  chordSheetOffset?: number;
  // whether the book can be found via search or in the list of hymn books table of contents
  isSearchable?: boolean;
  // the slug of the translated book - if the book has a direct translated book
  translatedBook?: string
}

export default HymnBookMeta;

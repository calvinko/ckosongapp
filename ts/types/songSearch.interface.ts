import SongMeta from "./songMeta.interface";

/**
 * Searchable songs with additional fields for indexing
 */
export default interface SongSearch extends SongMeta {
  sanitizedName: string; // sanitized song name
  fullBookName: string; // ex: Songs of Love 1
  bookAndPage: string; // ex: sol1 22
  fullBookAndPage: string; // ex: Songs of Love 1 22
  otherPages?: string[] | null; // This is the field for songs with multiple pages ex: song with pages 22 and 23. Then this would be ["23"]
}

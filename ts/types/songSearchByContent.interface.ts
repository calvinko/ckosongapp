import SongSearch from "./songSearch.interface";

/**
 * Type for searching songs by it's content (text)
 */
export default interface SongSearchByContent extends SongSearch {
  text: string; // song's content
}

import SongSearch from "./songSearch.interface";

/**
 * Types for React-select
 */
export interface SelectSongCandidate {
  value: string; // value for react-select
  label: string; // label for react-select
  data: SongSearch; // data to index over (see SearchBar.tsx)
}

export default SelectSongCandidate;

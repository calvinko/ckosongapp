import SelectSongCandidate from "../../ts/types/selectSongCandidate.interface";
import Song from "../../ts/types/song.interface";
import SongMeta from "../../ts/types/songMeta.interface";
import { getHymnBook } from "../constants";

// Currently, this isnt used but keeping this for legacy.

/**
 * Create a regex to match an individual song
 *
 * @param song the song's metadata
 */
export const createSongRegex = (song: SongMeta): string => {
  const { name, hymn, pageNumber } = song;

  // basic metadata in lower case
  const songName = name.toLowerCase().replace(/[^a-zA-Z ]/g, "");
  const songHymn = hymn.toLowerCase();
  const hymnFullName = getHymnBook(hymn).toLowerCase();

  const songHymnPgWithSpace = `${songHymn} ${pageNumber}`;
  const songHymnPgWithoutSpace = `${songHymn}${pageNumber}`;

  // songs of love 1 32
  const songFullHymnPgWithSpace = `${hymnFullName} ${pageNumber}`;
  // songs of love 132
  const songFullHymnPgWithoutSpace = `${hymnFullName}${pageNumber}`;

  // songsoflove1
  const songFullHymnNoSpace = hymnFullName.replace(/\s/g, "");
  // songsoflove1 32
  const songFullHymnNoSpacePgWithSpace = `${songFullHymnNoSpace} ${pageNumber}`;
  const songFullHymnNoSpacePgWithoutSpace = `${songFullHymnNoSpace}${pageNumber}`;

  // sol1 => sol 1
  const songHymnWithSpace = songHymn.replace(/\d+/, " $&");
  // sol 1 32
  const songHymnWithSpacePgWithSpace = `${songHymnWithSpace} ${pageNumber}`;
  // sol 132
  const songHymnWithSpacePgWithoutSpace = `${songHymnWithSpace}${pageNumber}`;

  return `${songName} ${name} ${songHymn} ${hymnFullName} ${songHymnPgWithSpace} ${songHymnPgWithoutSpace} ${songFullHymnPgWithSpace} ${songFullHymnPgWithoutSpace} ${songHymnWithSpace} ${songHymnWithSpacePgWithSpace} ${songHymnWithSpacePgWithoutSpace} ${songFullHymnNoSpacePgWithSpace} ${songFullHymnNoSpacePgWithoutSpace}`;
};

/**
 * Generate Select Regex objects for song search matching, given a list of song metadata
 *
 * @param songs Song metadata
 */
export const generateSongRegex = (songs: SongMeta[]): SelectSongCandidate[] => {
  return songs.map((song) => ({
    label: song.name,
    value: createSongRegex(song),
    data: {
      ...song,
      fullBookName: getHymnBook(song.hymn),
      bookAndPage: `${song.hymn} ${song.pageNumber}`,
      fullBookAndPage: `${getHymnBook(song.hymn)} ${song.pageNumber}`,
    },
  }));
};

export default generateSongRegex;

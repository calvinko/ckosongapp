import { truncate } from "fs";
import HymnBookMeta from "../../ts/types/hymnBookMeta.interface";
import SongMeta from "../../ts/types/songMeta.interface";
import SongSearch from "../../ts/types/songSearch.interface";
import { getHymnBook } from "../constants";
import { getSongsByBookFromList } from "./getSongsByBook";
import range from "lodash/range";

/**
 * Hymn Books that are getting hit too often
 */
const FILTERED_HYMN = ["CHC1", "CHC2", "CHC3"]

/**
 * Generate SongSearch for fuse to index over and search
 *
 * @param songs list of songs
 * @returns   list of SelectSongCandidate
 */
export const generateSongSearches = (songs: SongMeta[], books: { [key: string]: HymnBookMeta }): SongSearch[] => {
  const songsByBook = getSongsByBookFromList(songs);

  let filteredSongs = songs.filter((song) => books[song.hymn]?.isSearchable == null || books[song.hymn]?.isSearchable === true);

  return filteredSongs.map((song) => generateSongSearch(song, songsByBook));
};

/**
 * Generate SongSearch given a song
 *
 * @param song
 * @returns
 */
export const generateSongSearch = (
  song: SongMeta,
  songsByBook: { [key: string]: SongMeta[] }
): SongSearch => {
  const songSlugsInSameBook: SongMeta[] = songsByBook[song?.hymn];

  // find the current song and it's index in the sorted list
  const currentSongSlugIndex = songSlugsInSameBook.findIndex(
    (s) => s.slug === song.slug
  );

  // if last index, it is null
  const nextSong =
    currentSongSlugIndex < songSlugsInSameBook.length - 1 &&
      currentSongSlugIndex != -1
      ? songSlugsInSameBook[currentSongSlugIndex + 1]
      : null;

  // if the song has more than one page
  let otherPages: string[] = null;
  const nextSongPageNum = nextSong?.pageNumber
    ? Number(nextSong?.pageNumber)
    : null;
  const currSongPageNum = Number(song?.pageNumber);
  if (nextSongPageNum && nextSongPageNum - currSongPageNum > 1) {
    otherPages = [];
    range(currSongPageNum + 1, nextSongPageNum).forEach((pageNum: Number) =>
      otherPages.push(pageNum.toString())
    );
  }

  const songNameWithNoSpecialChar = song?.name.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

  return {
    ...song,
    sanitizedName: songNameWithNoSpecialChar,
    fullBookName: getHymnBook(song.hymn),
    bookAndPage: FILTERED_HYMN.includes(song.hymn) ? null : `${song.hymn} ${song.pageNumber}`,
    fullBookAndPage: `${getHymnBook(song.hymn)} ${song.pageNumber}`,
    otherPages: otherPages,
  };
};

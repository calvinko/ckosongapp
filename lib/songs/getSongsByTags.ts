import HymnBookMeta from "../../ts/types/hymnBookMeta.interface";
import SongMeta from "../../ts/types/songMeta.interface";
import { SongType } from "../constants";

// Tags are shown as "Categories" to users

/**
 * Get Songs grouped by the tags it has (ex: 'Abba') Each key is a tag (string) and each value is a list of songs grouped by the tag. A Song can have multiple tags.
 * If song doesn't have any tags, it will be put in the 'No Tags' list.
 *
 * @param songs songs in a dict groupbed by its slug
 * @returns songs grouped by tags
 */
export const getSongsByTags = (songs: {
  [key: string]: SongMeta;
}): { [key: string]: SongMeta[] } => {
  return getSongsbyTagsFromList(Object.values(songs));
};

/**
 * Get Songs grouped by the tags it has (ex: 'Abba') Each key is a tag (string) and each value is a list of songs grouped by the tag. A Song can have multiple tags.
 * If song doesn't have any tags, it will be put in the 'No Tags' list.
 *
 * @param songList list of songs
 * @returns songs grouped by tags
 */
export const getSongsbyTagsFromList = (
  songList: SongMeta[]
): { [key: string]: SongMeta[] } => {
  const songsByTags: {
    [key: string]: SongMeta[]
  } = {};

  // loop through and put each song in it's respective list of songs for each tag
  songList.forEach((song) => {
    const tags = song?.tags ?? [];

    if (!tags || tags.length === 0) {
      if ("No Tags" in songsByTags) {
        songsByTags["No Tags"].push(song);
        return;
      }
      songsByTags["No Tags"] = [song];
      return;
    }

    tags?.forEach((tag) => {
      if (tag in songsByTags) {
        songsByTags[tag].push(song);
        return;
      }
      songsByTags[tag] = [song];
    });
  });

  // for each book, sort it's songs by slug
  Object.keys(songsByTags).forEach((key) => {
    const songs: SongMeta[] = songsByTags[key];
    songs?.sort((songA, songB) => {
      const slugA = songA.slug;
      const slugB = songB.slug;

      const aBook = slugA.split("_")[0];
      const bBook = slugB.split("_")[0];
      if (aBook > bBook) {
        return 1;
      } else if (bBook > aBook) {
        return -1;
      }

      // same book
      // compare page numbers, cannot just compare slug strings because SOL1_100 is < SOL1_3 in string comparison

      const aPg = parseInt(slugA.split("_")[1]);
      const bPg = parseInt(slugB.split("_")[1]);
      if (aPg > bPg) {
        return 1;
      } else if (bPg > aPg) {
        return -1;
      }
      return 0;
    });
  });

  // "sort the keys"
  return Object.keys(songsByTags).sort()
    .reduce((acc, c) => { acc[c] = songsByTags[c]; return acc }, {})
};

/**
 * Give list of songs, return sorted list of tags and object of tag to songs
 * 
 * @param songList list of songs
 * @returns  tuple of sorted list of tags from input + tag to songs object
 */
export const getTagsAndSongs = (
  songList: SongMeta[],
  book?: HymnBookMeta
): [string[], { [key: string]: SongMeta[] }] => {
  const songsByTags = getSongsbyTagsFromList(songList);

  let tagsInSongs = Object.keys(songsByTags) ?? [];
  tagsInSongs.sort();
  const bookTagSort: string[] = book?.tagSort ?? [];
  tagsInSongs = [...bookTagSort, ...tagsInSongs.filter((tag) => !bookTagSort.includes(tag))]
  if (tagsInSongs.includes("No Tags")) {
    // move "No Tags" to the end of the list
    tagsInSongs.push(
      tagsInSongs.splice(tagsInSongs.indexOf("No Tags"), 1)[0]
    );
  }

  return [tagsInSongs, songsByTags];
}

/**
 * Get All Tags from a list of songs
 * 
 * @param songs     object of songs by slug
 * @param songType  song type, if null we dont filter
 * @returns         list of tags as strings
 */
export const getAllTags = (songs: { [key: string]: SongMeta }, songType?: SongType): string[] => {
  let tags: string[] = [];
  Object.values(songs)
    .filter((song) => songType != null ? song.songType === songType : true)
    .forEach((song) => {
      tags = tags.concat(song?.tags ?? []);
    });
  return [...new Set(tags)];
}

/**
 * Get list of songs by tag
 * 
 * @param tag     Tag to filter by
 * @param songs   object of songs by slug
 * @returns       list of songs with the tag
 */
export const getSongsByTag = (tag: string, songs: { [key: string]: SongMeta }): SongMeta[] => {
  return Object.values(songs)
    // .filter((song) => song.songType === songType)
    .filter((song) => song?.tags?.includes(tag));
}

export default getSongsByTags;

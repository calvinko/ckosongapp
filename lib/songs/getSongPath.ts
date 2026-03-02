import SongMeta from "../../ts/types/songMeta.interface";
import { SongType } from "../constants";

/**
 * Get the song path, given the song. If for api, you need add in the additional /api/ before
 *
 * @param song Song Metadata
 */
export const getSongPath = (song: SongMeta | null): string => {
  if (song == null) {
    return "";
  }
  return getSongPathBySlug(song.songType, song.slug);
};

/**
 * Get a Song's Path by it's slug and it's song type. For example, a chinese song of slug H2_12 is "/songs/chinese/H2_12". Remember
 * to get slug from SongMeta#slug. Use getSongPath unless you know what you are doing
 *
 * @param songType
 * @param slug
 * @returns
 */
export const getSongPathBySlug = (songType: SongType, slug: string): string => {
  return `/songs/${songType.toString()}/${slug}`;
};

/**
 * Get Path for book name (e.g. CHC1)
 * 
 * @param bookName  CHC1
 * @returns         book path
 */
export const getBookPath = (bookName: string): string => {
  return `/books/${bookName}`;
}
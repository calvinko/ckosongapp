// import fetch from '../fetch'
import { SongMeta } from "../../ts/types/songMeta.interface";
import fetchSongs from "./fetchSongs";
import { SongResponseDTO } from "../../ts/types/songResponseDTO.interface";

import fetchSongContent from "./fetchSongContent";
import { SongType } from "../constants";
import getSongsByBook from "./getSongsByBook";

/**
 * Fetch a song's individual data and markdown text
 *
 * @param songType  song type (either english or chinese)
 * @param songSlug  song's slug
 */
export const fetchSong = async (
  songType: SongType,
  songSlug: string
): Promise<SongResponseDTO> => {
  const fullMeta = await fetchSongs(songType);
  const songList = fullMeta?.songs;

  const songMetadata: SongMeta = songList[songSlug];
  if (typeof songMetadata == "undefined" || !songMetadata) {
    throw new Error(songSlug + "doesn't exist in list of songs.");
  }

  // can be undefined since we dont have metadata for chinese hymn books
  const songBook = fullMeta?.hymnBooks[songMetadata?.hymn];

  try {
    const { text } = await fetchSongContent(songSlug, songType, songBook);

    return {
      slug: songSlug,
      hymn: songMetadata.hymn,
      pageNumber: songMetadata.pageNumber,
      metadata: songMetadata,
      text: text,
      songsInBook: getSongsByBook(songList)[songMetadata.hymn],
      hasOwnSheetPdf: songBook?.hasOwnSheetPdf ?? false,
    };
  } catch (e) {
    throw new Error(`Error reading song content for ${songMetadata.slug} ` + e);
  }
};

export default fetchSong;

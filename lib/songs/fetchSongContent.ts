import path from "path";
import { SongType } from "../constants";
import readFile from "../readFile";
import HymnBookMeta from "../../ts/types/hymnBookMeta.interface";

/**
 * Fetch a song's content
 *
 * @param songSlug  song's slug e.g. SOL1_32 or H3_32_0 (see lib/songs/getSongSlug and scripts/chineseSongs/process_db.py for chinese songs)
 * @param songType  type of song (SongType)
 * @returns         object of song's slug and song's content as a string
 */
export const fetchSongContent = async (
  songSlug: string,
  songType: SongType,
  songBook: HymnBookMeta
): Promise<{ songSlug: string; text: string }> => {
  try {
    // read it from the file
    const songPath = path.join(
      process.cwd(),
      `songContent/${songType.toString()}/${songSlug}.md`
    );
    const songText = await readFile(songPath);
    // make text look prettier by adding space after every period
    let transformedSongText =
      songType == "chinese" ? songText.replace(/\./g, ". ") : songText;

    const titleIndex = transformedSongText.indexOf("\n");
    transformedSongText = transformedSongText.slice(
      titleIndex,
      transformedSongText.length
    );

    return { songSlug: songSlug, text: transformedSongText };
  } catch (e) {
    if (songBook.onlySongSheet) {
      return { songSlug: songSlug, text: "" };
    }
    return { songSlug: songSlug, text: "" };
    // throw new Error(`Error fetching content for ${songSlug}` + e.message);
  }
};

export default fetchSongContent;

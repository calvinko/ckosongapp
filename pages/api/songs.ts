import { NextApiRequest, NextApiResponse } from "next";
import fetchSongs from "../../lib/songs/fetchSongs";
import getSongsByBook from "../../lib/songs/getSongsByBook";
import { fetchSongsWithFullContent } from "../../lib/songs/fetchSongsWithContent";
import { FullMeta } from "../../ts/types/songMeta.interface";

/**
 * Handles /api/songs. Gets list of songs
 *
 * Ex:
 *  /api/songs -> returns object of songs with key as the slug of the song (SOL1_32)
 *
 *  /api/songs?byBook=true -> returns an Object of two sets.
 *    1) ("songs") the original object of songs by its slug, and book meta. See FullMeta.interface.ts
 *    2) ("songsByBook") list of songs grouped by the book
 *
 * /api/songs?withContent=true -> returns object of songs by it's slug + content of songs in the metadata (this request will take longer)
 *
 * @param req
 * @param res
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  // get byBook query, if it DNE, it is undefined
  const {
    query: { byBook, withContent },
  } = req;

  try {
    const allMeta: FullMeta = await fetchSongs();
    // default to just returning list of songs grouped by its slug
    res.setHeader(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=600, stale-if-error=1000"
    );

    if (withContent && withContent === "true") {
      const songsWithContent = await fetchSongsWithFullContent(allMeta?.songs);
      return res.status(200).json(songsWithContent);
    }

    // return list of songs grouped by book
    if (byBook != null && byBook === "true") {
      return res.status(200).json({
        songs: allMeta?.songs,
        songsByBook: getSongsByBook(allMeta?.songs),
        books: allMeta?.songs,
      });
    }

    return res.status(200).json(allMeta);
  } catch (err) {
    console.error(`${err} ${err.stack}`);
    res.status(500).json({
      errors: [
        {
          message: `Failed to fetch list of songs with error ${err} ${err.lineNumber}`,
        },
      ],
    });
  }
};

export default handler;

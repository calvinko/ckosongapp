import dbConnect from "../../../lib/dbConnect";
import { NextApiRequest, NextApiResponse } from "next";
import RelatedSong from "../../../models/RelatedSong";

/**
 * Handler to get all the related songs, given a song's slug
 *
 * GET /api/related/{slug}
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end();
  }

  const {
    query: { slug },
  } = req;

  await dbConnect();

  try {
    const relatedSongs = await RelatedSong.find({ primary: slug });
    res.status(200).json(relatedSongs);
  } catch (error) {
    console.error("Could not get related songs for " + slug, error);
    res.status(500).json({ success: false, error });
  }
};
export default handler;

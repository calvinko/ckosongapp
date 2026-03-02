import dbConnect from "../../../lib/dbConnect";
import { NextApiRequest, NextApiResponse } from "next";
import RelatedSong from "../../../models/RelatedSong";
import { SongType } from "../../../lib/constants";

/**
 * Handler for a separate admin api to make a GET call but add in a related song index. Assumes english for now.
 *
 * GET /api/related?primary=SOL1_2&secondary=SOL2_23
 *
 * query param: remove=true performs remove
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end();
  }

  const {
    query: { primary, secondary, remove },
  } = req;

  await dbConnect();

  const timestamp = new Date();

  try {
    if (remove && remove === "true") {
      // do remove operation instead
      await RelatedSong.deleteOne({ primary, secondary });
      return res.status(201).json({ success: true });
    }

    const exists = await RelatedSong.find({ primary, secondary }).exec();
    if (exists != null && exists.length > 0) {
      return res
        .status(200)
        .json({ success: true, message: "Index already exists" });
    }

    // we do not create an index the other way because related songs are one after the other (a directed graph but not acyclic)
    const related = new RelatedSong({
      timestamp,
      primary,
      primarySongType: SongType.english,
      secondary,
      secondarySongType: SongType.english,
    });

    await related.save();
    return res.status(201).json({ success: true, data: related });
  } catch (error) {
    console.error(
      "Could not add new index primary=",
      primary,
      " secondary=",
      secondary,
      "remove",
      remove,
      error
    );
    return res.status(500).json({ success: false, error });
  }
};

export default handler;

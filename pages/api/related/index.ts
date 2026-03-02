import dbConnect from "../../../lib/dbConnect";
import { NextApiRequest, NextApiResponse } from "next";
import RelatedSong from "../../../models/RelatedSong";

/**
 * Handler for generic management of related songs
 *
 * GET /api/related : gets all related song indices
 * PUT /api/related {primary: "SOL1_72", secondary: "SOL2_88", "primarySongType": "english", "secondarySongType": "english"} : create related song index
 * DELETE /api/related {primary: "SO1_72", secondary: "SOL2_88"} : delete related song index
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method !== "GET" && method != "PUT" && method !== "DELETE") {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end();
  }

  await dbConnect();

  const timestamp = new Date();

  const { body } = req;
  try {
    switch (method) {
      case "PUT":
        const bodyObj = JSON.parse(body);
        const {
          primary,
          secondary,
          primarySongType,
          secondarySongType,
          primaryStanzas,
          secondaryStanzas,
          note,
        } = bodyObj;

        const exists = await RelatedSong.find({
          primary,
          primarySongType,
          primaryStanzas,
          secondary,
          secondaryStanzas,
          secondarySongType,
        }).exec();
        if (exists != null && exists.length > 0) {
          return res
            .status(200)
            .json({ success: true, message: "Index already exists" });
        }

        // we do not create an index the other way because related songs are one after the other (a directed graph but not acyclic)
        const related = new RelatedSong({
          timestamp,
          primary,
          primarySongType,
          primaryStanzas,
          secondary,
          secondarySongType,
          secondaryStanzas,
          note,
        });

        await related.save();
        return res.status(201).json({ success: true, data: related });
      case "GET":
        const relatedSongs = await RelatedSong.find({});
        return res.status(200).json({ success: true, data: relatedSongs });
      case "DELETE":
        const {
          primary: primaryDelete,
          primaryStanzas: primaryStanzasDelete,
          secondary: secondaryDelete,
          secondaryStanzas: secondaryStanzasDelete,
        } = JSON.parse(body);

        await RelatedSong.findOneAndDelete({
          primary: primaryDelete,
          primaryStanzas: primaryStanzasDelete,
          secondary: secondaryDelete,
          secondaryStanzas: secondaryStanzasDelete,
        });
        return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error("Error handling related songs method=", method, error);
    return res.status(500).json({ success: false, error });
  }
};

export default handler;

import dbConnect from "../../../../lib/dbConnect";
import { NextApiRequest, NextApiResponse } from "next";
import Property from "../../../../models/Property";

/**
 * Handler to get/update the properties given it's key. In order to create property, you need to create it in the mongodb UI
 *
 * GET /api/admin/properties/[key]
 * PUT /api/admin/properties/[key]?value={string value here}
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method !== "GET" && method !== "PUT") {
    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).end();
  }

  const {
    query: { key, value },
  } = req;

  await dbConnect();

  try {
    let property = await Property.findOne({ key });
    if (property == null) {
      return res.status(404).json({ message: "Not Found" });
    }

    switch (method) {
      case "GET":
        res.setHeader(
          "Cache-Control",
          "public, s-max-age=60, stale-while-revalidate=100, stale-if-error=600"
        );
        return res.status(200).json(property);
      case "PUT":
        var timestamp = new Date();
        const ret = await Property.updateOne(
          { key },
          { $set: { value, lastModifiedAt: timestamp } }
        );
        return res.status(200).json(ret);
    }
  } catch (error) {
    console.error("Could not get/update property for " + key, error);
    res.status(500).json({ success: false, error: error });
  }
};
export default handler;

import dbConnect from "../../../lib/dbConnect";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import UserProfile from "../../../models/UserProfile";

import { AUTH_OPTIONS } from "../auth/[...nextauth]";

/**
 * Handler for user favorites. User must be in the next-auth session to add favorites
 *
 * Instead of just adding/removing one song at a time, updating favorites are treated like pure functions. To "update"
 * favorite, we just override the previous favorites. Most of the logic to do this is in /lib/favorites.ts which handles
 * logic between localStorage and Mongo (using this api). We had the local favorites done before this new user-based favorites
 * was added, hence why we have this "override" logic to update favorites.
 *
 * POST /api/users/favorites { "favorites": [ { "songSlug": "SOL1_59", "timestamp": "utc timestamp"}]}
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }

  // check for session
  const session = await getServerSession(req, res, AUTH_OPTIONS);
  if (!session) {
    console.error("/api/users/favorites No session for user.");
    return res.status(401).json({
      errors: [
        {
          message: `No session for user. Please log in.`,
        },
      ],
    });
  }

  await dbConnect();

  switch (method) {
    case "POST":
      const { body } = req;
      try {
        const bodyObj = JSON.parse(body);
        const { favorites } = bodyObj;
        const email = session?.user?.email;

        // check for valid request
        if (email == null || favorites == null) {
          return res.status(400).json({
            errors: [
              {
                message: `User session doesn't have user email or favorites is not included.`,
              },
            ],
          });
        }

        // valid request, let's perform the db transaction

        const isoString = new Date().toISOString();

        // @ts-ignore
        const userInfo = await UserProfile.findOneAndUpdate(
          { email: email },
          { favorites: favorites, favoritesLastUpdate: isoString },
          { upsert: true, new: true }
        );
        return res.status(201).json({ success: true, data: userInfo });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error });
      }
  }
};

export default handler;

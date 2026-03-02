import { timeStamp } from "console";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { userHasRole, userHasRoleOrAdmin, UserRole } from "../../../lib/constants";

import dbConnect from "../../../lib/dbConnect";
import UserProfile from "../../../models/UserProfile";
import UserInfo from "../../../ts/types/userInfo.interface";

import { AUTH_OPTIONS } from "../auth/[...nextauth]";

/**
 * Endpoint to get user info. If it doesn't exist, we create one.
 *
 * GET call gets all users (only if you're an admin and logged in)
 *
 * GET /api/users?email=timothy.l.ko@gmail.com (for self, or creates one if it doesn't exist)
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method !== "POST" && method !== "GET" && method !== "PUT") {
    res.setHeader("Allow", ["POST", "GET", "PUT"]);
    return res.status(405).end();
  }

  const session = await getServerSession(req, res, AUTH_OPTIONS);
  if (!session) {
    console.error("No session for user.");
    return res.status(404).json({
      errors: [
        {
          message: `No session for user. Please log in.`,
        },
      ],
    });
  }

  await dbConnect();

  const timestamp = new Date();

  const {
    query: { email },
    body
  } = req;

  const sessionEmail = session?.user?.email;
  if (method == "GET") {
    try {
      const fullName = session?.user?.name;
      let currentUser = await UserProfile.findOne({
        email: sessionEmail,
      }).exec();

      // create user if it doesn't exist
      if (currentUser == null) {
        currentUser = new UserProfile({
          email: email,
          name: fullName,
          createdAt: timestamp,
          lastModifiedAt: timestamp,
          lastValidatedAt: timestamp
        });
        await currentUser.save();
      }
      else {
        currentUser = await touchValidatedAt(currentUser, timestamp);
      }

      // return current user if user is not admin or the user is what the user is looking for (same email)
      if (currentUser?.email === email) {
        return res.status(200).json(currentUser);
      }

      const canSeeAllUsers = currentUser?.isAdmin || userHasRole(currentUser, UserRole.vanTeam);
      if (!canSeeAllUsers) {
        return res.status(401).json({
          errors: [
            {
              message: `User not authenticated. Must be same email. userEmail=${session?.user?.email}`,
            },
          ],
        });
      }

      // BELOW IS ADMIN SPECIFIC
      // only return single user if email query param is provided
      if (email) {
        let retUser = await UserProfile.findOne({ email }).exec();
        return res.status(200).json(retUser);
      }

      // return all users
      const allUsers = await UserProfile.find().exec();
      return res.status(200).json(allUsers);
    } catch (error) {
      console.error("Error with GET users", error);
      return res.status(500).json({ success: false, error });
    }
  }

  // PUT - update user
  if (method === "PUT") {
    try {
      let currentUser = await UserProfile.findOne({
        email: sessionEmail,
      }).exec();
      // if session user doesn't exist or session user is not admin
      // check if they are updating themselves, if not, unauthorized
      if ((currentUser == null || !userHasRoleOrAdmin(currentUser, UserRole.vanTeam)) && sessionEmail !== email) {
        return res.status(401).json({
          errors: [
            {
              message: `User not authenticated. Must be same email. userEmail=${session?.user?.email}`,
            },
          ],
        });
      }
      const bodyObj = JSON.parse(body);
      const location = bodyObj?.location
      const status = bodyObj?.status;
      if (location != null && status != null) {
        await UserProfile.findOneAndUpdate({ email }, { location, status, lastModifiedAt: timestamp }).exec();
      }
      else if (location != null) {
        await UserProfile.findOneAndUpdate({ email }, { location, lastModifiedAt: timestamp }).exec();
      }
      else if (status != null) {
        await UserProfile.findOneAndUpdate({ email }, { status, lastModifiedAt: timestamp }).exec();
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error with PUT users", error);
      return res.status(500).json({ success: false, error });
    }
  }

  // POST 
  if (method === "POST") {
    try {
      if (email === "undefined" || email === "null") {
        return res
          .status(400)
          .json({ errors: [{ message: `email is undefined.` }] });
      }

      if (session?.user?.email !== email) {
        return res.status(401).json({
          errors: [
            {
              message: `User not authenticated. Must be same email. userEmail=${session?.user?.email}`,
            },
          ],
        });
      }

      // find the user, and if it doesn't exist, we create one.
      let userProfile = await UserProfile.findOne({ email }).exec();
      const fullName = session?.user?.name;
      if (userProfile == null) {
        userProfile = new UserProfile({
          email: email,
          name: fullName,
          createdAt: timestamp,
          lastModifiedAt: timestamp,
          lastValidatedAt: timestamp
        });
        await userProfile.save();
      }
      else {
        userProfile = await touchValidatedAt(userProfile?.email, timestamp);
      }

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Cache-Control",
        "private, s-max-age=10, stale-while-revalidate=20, stale-if-error=40"
      );
      return res.status(200).json(userProfile);
    } catch (error) {
      console.error("Error with POST users", error);
      return res.status(500).json({ success: false, error });
    }
  }

  // default 500 internal error
  return res.status(500).json({ success: false });
};

/**
 * Touch the `lastValidatedAt` timestamp of the UserProfile. This is when the last time the user was last validated at
 * 
 * @param user    the user
 * @returns       the timestamp set as the lastValidatedAt
 */
export const touchValidatedAt = async (user: UserInfo, timestamp: Date): Promise<UserInfo> => {
  const ret = await UserProfile.findByIdAndUpdate(
    { _id: user._id },
    { $set: { lastValidatedAt: timestamp } }
  );
  return ret;
}

export default handler;

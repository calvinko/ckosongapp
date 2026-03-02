import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import dbConnect from "../../../lib/dbConnect";
import UserProfile from "../../../models/UserProfile";
import TokenUser from "../../../models/TokenUser";
import UserInfo from "../../../ts/types/userInfo.interface";
import { userHasRole, UserRole } from "../../../lib/constants";

import { AUTH_OPTIONS } from "../auth/[...nextauth]";

/**
 * Endpoint to handle user roles. If it doesn't exist, we throw error. Roles provided in body
 * will overwrite the current roles in the user profile. 
 * 
 * This api also handles token user roles, if the query param `token` is provided instead of email
 *
 * POST /api/users/roles?email=timothy.l.ko@gmail.com
 *
 * {
 *    "roles": ["addRelatedSong"]
 * }
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end();
  }
  const {
    query: { email, token },
    body
  } = req;

  const session = await getServerSession(req, res, AUTH_OPTIONS);
  if (!session) {
    console.error(`/api/users/roles No session for user. email=${email}`);
    return res.status(404).json({
      errors: [
        {
          message: `No session for user. Please log in.`,
        },
      ],
    });
  }

  await dbConnect();

  let userProfile: UserInfo = await UserProfile.findOne({
    email: session?.user?.email,
  }).exec();
  const timestamp = new Date();

  const hasAccess = userProfile.isAdmin || userHasRole(userProfile, UserRole.vanTeam);
  if (userProfile == null || !hasAccess) {
    console.error(
      "User is not admin. Somehow this user got access to modifying roles."
    );
    return res.status(401).json({
      errors: [
        {
          message: `Unauthorized.`,
        },
      ],
    });
  }

  switch (method) {
    case "PUT":

      const bodyObj = JSON.parse(body);
      const roles = bodyObj?.roles;
      if (token) {
        if (token == null || roles == null) {
          return res.status(400).json({
            errors: [
              { message: "Payload doesn't have token or roles" }
            ]
          })
        }

        // valid request
        try {
          const tokenUser = await TokenUser.findOneAndUpdate(
            { _id: token },
            { roles: roles, lastModifiedAt: timestamp },
            { upsert: true, new: true }
          )
          return res.status(201).json({ success: true, data: tokenUser })
        } catch (err) {
          console.error("Error update tokenUser. ", err);
          return res.status(500).json({ success: false });
        }
        return res.status(500).json({ success: false })
      }
      else if (email) {
        try {
          // check for valid request
          if (email == null || roles == null) {
            return res.status(400).json({
              errors: [
                { message: "User session doesn't have user email or roles is not included." },
              ],
            });
          }

          // valid request, let's perform the db transaction

          // @ts-ignore
          const userInfo = await UserProfile.findOneAndUpdate(
            { email: email },
            { roles: roles, lastModifiedAt: timestamp },
            { upsert: true, new: true }
          );
          return res.status(201).json({ success: true, data: userInfo });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ success: false, error });
        }
      }
    default:
      return;
  }
};

export default handler;

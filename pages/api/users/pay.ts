import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { UserRole } from "../../../lib/constants";
import dbConnect from "../../../lib/dbConnect";
import GenericEntry from "../../../models/GenericEntry";
import UserProfile from "../../../models/UserProfile";
import { Payment } from "../../../ts/types/payment.interface";
import UserInfo from "../../../ts/types/userInfo.interface";

import { AUTH_OPTIONS } from "../auth/[...nextauth]";

/**
 * User paid for access. Now let's give them access 
 * 
 * POST /api/users/pay?email=someemail@gmail.com
 * 
 * {
 *    payment: {
 *       see payment.interface.ts
 *    }
 * }
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }
  const {
    query: { email, skip },
    body
  } = req;

  const session = await getServerSession(req, res, AUTH_OPTIONS);
  if (!session) {
    console.error(`/api/users/pay. No session for user. email=${email}`);
    return res.status(404).json({
      errors: [
        {
          message: `No session for user. Please log in.`,
        },
      ],
    });
  }

  try {
    await dbConnect();

    let userProfile: UserInfo = await UserProfile.findOne({
      email: session?.user?.email,
    }).exec();

    if (!userProfile) {
      console.error(`/api/users/pay. User doesn't exist. email=${email}`);
      return res.status(404).json({
        errors: [
          {
            message: `User doesn't exist.`,
          },
        ],
      });
    }

    const timestamp = new Date();

    if (skip) {
      const skipUserRoles = userProfile?.roles;
      addProperRoles(skipUserRoles);
      // save user
      const skipUserInfo = await UserProfile.findOneAndUpdate(
        { email: email },
        { roles: skipUserRoles, lastModifiedAt: timestamp },
        { upsert: true, new: true }
      );
      return res.status(200).json({ success: true, data: skipUserInfo });
    }

    const bodyObj = JSON.parse(body);
    const { payment }: { payment: Payment } = bodyObj;

    // if payment exists, let's save it and add roles to user
    if (payment && payment.paymentId) {
      // save entry first
      const newEntry = new GenericEntry({
        indexName: "PAYPAL_PAYMENTS",
        pk: email,
        pType: "EMAIL",
        sk: payment?.paymentId,
        sType: "PAYMENT",
        payload: JSON.stringify(payment)
      });
      await newEntry.save();

      // check if user already has roles or not
      const roles = userProfile?.roles;
      if (roles?.includes(UserRole.useApp) && roles?.includes(UserRole.readEnglishSongs) && roles?.includes(UserRole.readSongSheet)) {
        return res.status(200).json({ success: true, data: userProfile });
      }

      addProperRoles(roles);

      // save user
      const userInfo = await UserProfile.findOneAndUpdate(
        { email: email },
        { roles: roles, lastModifiedAt: timestamp },
        { upsert: true, new: true }
      );

      return res.status(200).json({ success: true, data: userInfo })
    }

    console.error("No payment was sent for /api/users/pay. email=", email, " body=", body);
    return res.status(400).json({ success: false, message: "No payment sent." })

  } catch (ex) {
    console.error("Error on /api/users/pay. email=", email, " exceptionMsg=", ex?.message, " body=", body);
    return res.status(500).json({ success: false, message: "Something failed" })
  }
}

const addProperRoles = (roles: UserRole[]) => {
  // default to add useApp and readEnglishSongs and readSongSheet
  if (!roles.includes(UserRole.useApp)) {
    roles.push(UserRole.useApp);
  }
  if (!roles.includes(UserRole.readEnglishSongs)) {
    roles.push(UserRole.readEnglishSongs);
  }
  if (!roles.includes(UserRole.readSongSheet)) {
    roles.push(UserRole.readSongSheet);
  }
}

export default handler;
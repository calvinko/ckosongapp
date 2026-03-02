import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { UserRole, UserStatus } from "../../../lib/constants";
import dbConnect from "../../../lib/dbConnect";
import GenericEntry from "../../../models/GenericEntry";
import UserProfile from "../../../models/UserProfile";
import { ZeffyDonation } from "../../../ts/types/zeffy.interface";
import UserInfo from "../../../ts/types/userInfo.interface";

import { AUTH_OPTIONS } from "../auth/[...nextauth]";

export const runtime = 'nodejs';

const APP_ACCESS_FORM_ID: string = "6884c604-48e8-4b5f-80be-51c16420ec39"
const STORED_FORM_ID = ["6884c604-48e8-4b5f-80be-51c16420ec39", "85def07d-6fdc-4ca9-bf33-17a9931f673b"]
/**
 * User paid for access. Now let's give them access 
 * 
 * POST /api/zeffy/donation
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
        body
    } = req;

    try {
        await dbConnect();

        const timestamp = new Date();

        // const bodyObj: ZeffyDonation = JSON.parse(body);
        const bodyObj: ZeffyDonation = body;

        console.log(`/api/zeffy/donation bodyObj=${JSON.stringify(bodyObj)}`);

        // We are getting all form donations but we only want to save the ones we want
        // just keeping track of the app access form and the ebook form
        if (STORED_FORM_ID.indexOf(bodyObj?.formId) === -1) {
            console.log(`/api/zeffy/donation. Not saving Form because formId doesn't match. formId=${bodyObj?.formId} bodyObj=${JSON.stringify(bodyObj)}`);
            return res.status(200).json({
                errors: [
                    {
                        message: `Not saving Form because formId doesn't match.`,
                    },
                ],
            });
        }

        const email = bodyObj?.email;
        const newEntry = new GenericEntry({
            indexName: "ZEFFY_DONATIONS",
            pk: email,
            pType: "EMAIL",
            sk: bodyObj.id,
            sType: "DONATION",
            payload: JSON.stringify(bodyObj)
        });
        await newEntry.save();

        // We only want to give access to user if it's the app access form, not the ebook form
        if (APP_ACCESS_FORM_ID !== bodyObj?.formId) {
            console.log(`/api/zeffy/donation. Saving Form but not App Access Form. email=${email} bodyObj=${JSON.stringify(bodyObj)}`);
            return res.status(200).json({
                errors: [
                    {
                        message: `Not App Access Form`,
                    },
                ],
            });
        }
        let userProfile: UserInfo = await UserProfile.findOne({
            email
        }).exec();

        if (!userProfile) {
            console.error(`/api/zeffy/donation. User doesn't exist. email=${email} bodyObj=${bodyObj}`);
            return res.status(200).json({
                errors: [
                    {
                        message: `User doesn't exist.`,
                    },
                ],
            });
        }

        // check if user already has roles or not

        const roles = userProfile?.roles;
        if (roles?.includes(UserRole.useApp) && roles?.includes(UserRole.paid)) {
            return res.status(200).json({ success: true, data: userProfile });
        }

        addProperRoles(roles);

        // save user
        const userInfo = await UserProfile.findOneAndUpdate(
            { email: email },
            { roles: roles, status: UserStatus.paid, lastModifiedAt: timestamp },
            { upsert: true, new: true }
        );

        return res.status(200).json({ success: true, data: userInfo })
    }
    catch (ex: any) {
        console.error(`Error on /api/zeffy/donation. body=` + JSON.stringify(body.toString()) + `exceptionMsg=${ex?.message}`);
        return res.status(500).json({ success: false, message: "Something failed " + ex?.message })
    }
}

const addProperRoles = (roles: UserRole[]) => {
    // default to add useApp and readEnglishSongs and readSongSheet
    // if (!roles.includes(UserRole.useApp)) {
    //     roles.push(UserRole.useApp);
    // }
    if (!roles.includes(UserRole.readEnglishSongs)) {
        roles.push(UserRole.readEnglishSongs);
    }
    if (!roles.includes(UserRole.readSongSheet)) {
        roles.push(UserRole.readSongSheet);
    }
    if (!roles.includes(UserRole.paid)) {
        roles.push(UserRole.paid);
    }
}

export default handler;
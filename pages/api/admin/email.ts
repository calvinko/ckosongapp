import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { AdminRequestNotification } from '../../../emails/AdminRequestNotification'
import { ApprovalNotification } from '../../../emails/ApprovalNotification'
import dbConnect from '../../../lib/dbConnect';
import { AUTH_OPTIONS } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import UserProfile from '../../../models/UserProfile';
import { userHasRoleOrAdmin, UserRole } from '../../../lib/constants';

const resendClient = new Resend(process.env.RESEND_API_KEY);

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { method } = req;
        if (method !== "POST") {
            res.setHeader("Allow", ["POST"]);
            return res.status(405).end();
        }

        // check for session
        const session = await getServerSession(req, res, AUTH_OPTIONS);
        if (!session) {
            console.error("/api/email No session for user.");
            return res.status(401).json({
                errors: [
                    {
                        message: `No session for user. Please log in.`,
                    },
                ],
            });
        }

        await dbConnect();
        const { body } = req;
        const bodyObj = body;
        // const bodyObj = JSON.parse(body); // no need to use if you pass content type application/json from client
        const { template } = bodyObj;
        console.log(`Received request to send email with template ${template} and body ${JSON.stringify(body)}`);

        if (template === "AdminRequestNotification") {
            // Sent by user when requesting access. 
            const { requestingUserFullName, requestingUserEmail } = bodyObj;
            const createdAt = new Date().getTime();

            const { data, error } = await resendClient.emails.send({
                from: 'Song App <onboarding@timothyko.org>',
                to: ['timothy.l.ko@gmail.com'],
                subject: 'Song App User Request',
                react: AdminRequestNotification({
                    requestingUserFullName,
                    requestingUserEmail,
                    createdAt
                }),
            });

            if (error) {
                console.error(`Error sending AdminRequestNotification email. error=${error} bodyObj=${JSON.stringify(req.body)}`);
                res.status(400).json({ error });
            }
            res.status(200).json({ data });
        }
        else if (template === "ApprovalNotification") {
            // Sends email to user to approve their request. Only if session user is admin
            let currentUser = await UserProfile.findOne({
                email: session?.user?.email,
            }).exec();
            if ((currentUser == null || !userHasRoleOrAdmin(currentUser, UserRole.vanTeam))) {
                // session user doesn't exist or session user is not admin
                return res.status(401).json({
                    errors: [
                        {
                            message: `User not authenticated. Must be same email. userEmail=${session?.user?.email}`,
                        },
                    ],
                });
            }

            const { email, fullName } = bodyObj;
            const { data, error } = await resendClient.emails.send({
                from: 'Song App <onboarding@timothyko.org>',
                to: [email],
                subject: 'Your Song App Request Has Been Approved!',
                react: ApprovalNotification({
                    fullName,
                    email
                }),
            });
            if (error) {
                console.error(`Error sending ApprovalNotification email. error=${error} bodyObj=${JSON.stringify(req.body)}`);
                res.status(400).json({ error });
            }
            res.status(200).json({ data });
        } else {
            res.status(400).json({ error: "Invalid template" });
        }
    } catch (error) {
        console.error(`Error sending email. error=${error} bodyObj=${JSON.stringify(req.body)}`);
        res.status(500).json({ error });
    }
}
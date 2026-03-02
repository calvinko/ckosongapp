import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import { getToken, getTokenUser, touchValidatedAt } from "../../../lib/tokens/token";
import TokenUser from "../../../models/TokenUser";
import TokenUserType from "../../../ts/types/tokenUser.interface";

/**
 * POST /api/users/token
 * 
 * {
 *   "token": "{token string here}"
 * }
 * 
 * returns json of either 200 or 401. 401 if token is invalid.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }
  await dbConnect();

  const { body } = req
  const { token } = body;

  res.setHeader(
    "Cache-Control",
    "public, s-max-age=300, stale-while-revalidate=600, stale-if-error=1000"
  );
  // special case for now
  if (token === getEnvToken()) {
    return res.status(200)
      .json({
        message: "Success",
        data: { token: token, tokenUser: { name: "Special Token", _id: token } },
        success: true
      });
  }

  // regular case, check if user exists for token (id)
  const tokenUser: TokenUserType | null = await getTokenUser(token);

  if (!tokenUser) {
    // doesn't exist. No Access.
    return res.status(401).json({ message: "No access", success: false })
  }
  else {
    // exists! Let's touch the lastValidatedAt timestamp and then return
    const timestamp = await touchValidatedAt(token);
    return res.status(200).json({
      message: "Success",
      data: {
        token: getToken(tokenUser),
        tokenUser: {
          ...tokenUser._doc,
          lastValidatedAt: timestamp.valueOf()
        }
      },
      success: true
    });
  }
}

/**
 * Current way of getting valid token which is through environment variable which is set in vercel as well
 */
export const getEnvToken = (): string => { return process.env.TOKEN; }

export default handler;
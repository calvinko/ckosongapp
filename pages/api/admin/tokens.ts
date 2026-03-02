import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import { createTokenUser, deleteTokenUser, getToken } from "../../../lib/tokens/token"
import TokenUser from "../../../models/TokenUser";

/**
 * Admin API for token users
 * 
 * POST /api/admin/tokens
 * 
 * {
 *   "name": "Timothy Ko",
 *   "location": "San Jose",
 *   "roles": []
 * }
 * returns json of the created token user
 * 
 * GET /api/admin/tokens
 * returns json of all token users
 * 
 * DELETE /api/admin/tokens
 * {
 *    "token": "1234"
 * }
 * deletes the token user with the given token
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method !== "POST" && method !== "GET" && method !== "DELETE") {
    res.setHeader("Allow", ["POST", "GET", "DELETE"]);
    return res.status(405).end();
  }
  await dbConnect();

  if (method === "GET") {
    const tokenUsers = await TokenUser.find().exec();
    res.setHeader(
      "Cache-Control",
      "public, s-max-age=300, stale-while-revalidate=600, stale-if-error=1000"
    );
    return res.status(200).json(tokenUsers)
  }
  else if (method === "POST") {
    const { body } = req
    const { name, location, roles } = body;

    res.setHeader(
      "Cache-Control",
      "public, s-max-age=300, stale-while-revalidate=600, stale-if-error=1000"
    );

    const tokenUser = await createTokenUser(name, location, roles);

    return res.status(200).json({ message: "Success", data: { token: getToken(tokenUser), tokenUser }, success: true });
  }
  else if (method === "DELETE") {
    const { body } = req
    const { token } = body;

    try {
      await deleteTokenUser(token as string);
      return res.status(200).json({ message: "Successfully deleted token user. token=" + token, success: true })
    } catch (err) {
      console.error("Could not delete Token User with token=" + token + ". " + err);
    }
  }
  return res.status(500).json({ message: "Internal Server Error", success: false })
}


export default handler;
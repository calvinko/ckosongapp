import dbConnect from "../../lib/dbConnect";
import { NextApiRequest, NextApiResponse } from "next";
import Feedback from "../../models/Feedback";
// CORS configuration
const ALLOWED_ORIGINS = [
  "http://kosolution.net",
  "http://localhost:3000",
  "https://msongapp.vercel.app",
  "https://m-songapp.vercel.app",
];

/**
 * Feedback handler. If GET, returns all feedback. If POST, creates feedback post on mongodb requires body of
 * {
 *    timestamp: Number,
 *    feedbackText: String,
 *    page: String
 * }
 *
 * @see components/Feedback.tsx
 *
 * @param req
 * @param res
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { method } = req;
  if (method !== "GET" && method !== "POST" && method !== "DELETE") {
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).end();
  }
  await dbConnect();

  switch (method) {
    // get all feedback
    case "GET":
      try {
        const feedbacks = await Feedback.find(
          {}
        ); /* find all the data in our database */
        res.status(200).json({ success: true, data: feedbacks });
      } catch (error) {
        res.status(400).json({ success: false, error });
      }
      break;

    // we create a feedback
    case "POST":
      const { body } = req;
      try {
        const bodyObj = JSON.parse(body);
        const { timestamp, feedbackText, page, email } = bodyObj;

        let newFeedback = new Feedback({
          timestamp,
          feedbackText,
          page,
          email,
        });
        await newFeedback.save();
        return res.status(201).json({ success: true, data: newFeedback });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error });
      }
    case "DELETE":
      const { query } = req;
      const id = query?.id;
      if (id == undefined) {
        res.status(400).json({ success: false, error: "provide id" });
        return;
      }

      try {
        await Feedback.deleteOne({ _id: id });
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error });
      }
  }
};

export default handler;

import mongoose from "mongoose";

/**
 * Mongoose Schema for Feedback
 */
const Feedback = new mongoose.Schema({
  /**
   * epoch timestamp in milliseconds
   */
  timestamp: Number,
  /**
   * Optional Email
   */
  email: String,
  /**
   * Page user was on when sending feedback
   */
  page: String,
  /**
   * Feedback Text given
   */
  feedbackText: String,
});

export default mongoose.models.Feedback || mongoose.model("Feedback", Feedback);

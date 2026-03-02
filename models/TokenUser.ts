import mongoose from "mongoose";

/**
 * Token User Schema. Represents a user that has access via a token, which is via their MongoDB _id.
 */
const TokenUser = new mongoose.Schema({
  /**
   * Full name of the user
   */
  name: { type: String, required: false },

  /**
   * epoch timestamp in milliseconds
   */
  createdAt: Number,

  /**
   * epoch timestamp in milliseconds
   */
  lastModifiedAt: Number,

  /**
   * epoch timestamp in milliseconds. When the user last validated their token
   */
  lastValidatedAt: Number,

  /**
   * City/Location of the token user, just for metadata sake
   */
  location: { type: String, required: false },

  /**
   * Whether or not the user is an admin. This must be modified internally in the Mongo DB UI
   */
  isAdmin: { type: Boolean, default: false },

  /**
   * Roles this user has. See lib/constants#UserRole enum for list of roles available
   */
  roles: { type: [String], default: [] }
});

export default mongoose.models?.TokenUser || mongoose.model("TokenUser", TokenUser);

import mongoose from "mongoose";

export const runtime = 'nodejs'; // Use the Node.js runtime


/**
 * A Favorite song a user may add
 */
export const FavoriteSong = new mongoose.Schema({
  /**
   * Slug of the song
   */
  songSlug: String,

  /**
   * epoch timestamp in UTC Timestamp, to stick with how we did initially in localStorage
   */
  timestamp: String,
});

/**
 * Mongoose Schema for User Profile information
 */
const UserProfile = new mongoose.Schema({
  /**
   * Email of the user this list of favorites belongs to
   */
  email: { type: String, required: true, unique: true },

  /**
   * Full name of the user
   */
  name: { type: String, required: false },

  /**
   * List of favorite songs this user has added
   */
  favorites: [FavoriteSong],

  /**
   * UTC Timestamp (ISO 8601 format) of the timestamp favorites was last updated to db
   */
  favoritesLastUpdate: { type: String, default: null },

  /**
   * Whether or not the user is an admin. This must be modified internally in the Mongo DB UI
   */
  isAdmin: { type: Boolean, default: false },

  /**
   * Roles this user has. See lib/constants#UserRole enum for list of roles available
   */
  roles: { type: [String], default: [] },

  /**
   * Location/City of User
   */
  location: { type: String, default: null },

  /**
   * Status of User (in access)
   */
  status: { type: String, default: null },

  /**
   * epoch timestamp of when UserProfile was created - in milliseconds
   */
  createdAt: Number,

  /**
   * epoch timestamp of when UserProfile was last modified - in milliseconds, except when favorites is updated (see favoritesLastUpdate)
   */
  lastModifiedAt: Number,

  /**
   * epoch timestamp in milliseconds. When the user last validated their token
   */
  lastValidatedAt: Number,
});

// no need since we make it required above
// UserProfile.index({ email: 1 });

export default mongoose.models?.UserProfile ||
  mongoose.model("UserProfile", UserProfile);

import { UserRole } from "../../lib/constants";
import Favorite from "./favorite.interface";

/**
 * Object type in which we store a User and their info. This is a google user
 *
 * @see /models/UserProfile
 */
export interface UserInfo {
  /**
   * mongo object id of the user
   */
  _id: string;

  /**
   * If user is an admin
   */
  isAdmin?: boolean;
  /**
   * Full name of the user
   */
  name?: string | null;

  /**
   * Email linked to the user (should be google account)
   */
  email: string;

  /**
   * When the favorites was last modified
   */
  favoritesLastUpdate?: string | null;

  /**
   * List of favorites
   */
  favorites: Favorite[];

  /**
   * Roles of the user
   */
  roles: UserRole[];

  /**
   * City/Location of the user
   */
  location?: string | null;

  /**
   * Status of User (in access)
   */
  status: string | null | undefined;

  /**
   * epoch timestamp of when UserProfile was created - in milliseconds
   */
  createdAt: number;

  /**
   * epoch timestamp of when UserProfile was last modified - in milliseconds
   */
  lastModifiedAt: number;

  /**
   * epoch timestamp in milliseconds on when the last time this token was validated at
   */
  lastValidatedAt: number;
}

export default UserInfo;

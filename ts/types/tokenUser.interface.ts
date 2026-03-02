import { UserRole } from "../../lib/constants";

/**
 * User that is represented by its token. The User doesn't log in. Instead,
 * they are given this token.
 */
export interface TokenUser {
  /**
   * The mongodb object id of this user. This is the the same as the user's token
   */
  _id: string;

  /**
 * Full name of the user
 */
  name?: string;

  /**
   * Location/city the user is from
   */
  location?: string;

  /**
   * epoch timestamp in milliseconds
   */
  createdAt: number;

  /**
   * epoch timestamp in milliseconds
   */
  lastModifiedAt: number;

  /**
   * epoch timestamp in milliseconds on when the last time this token was validated at
   */
  lastValidatedAt: number;

  /**
   * Whether or not the user is an admin. This must be modified internally in the Mongo DB UI
   */
  isAdmin: boolean;

  /**
   * Roles this user has. See lib/constants#UserRole enum for list of roles available
   */
  roles?: UserRole[]
}

export default TokenUser;
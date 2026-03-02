import UserInfo from "../../ts/types/userInfo.interface";
import { userHasRole, userHasRoleOrAdmin, UserRole } from "../constants";

/**
 * Whether user can see both english and chinese songs, which would enable the toggles for it
 * 
 * @param user user info, null if not logged in
 * @returns   if user can see both english and chinese songs and false if it doesn't exist
 */
export const userCanSeeBilingual = (user: UserInfo | null | undefined): boolean => {
  if (!user) {
    return false;
  }
  return userHasRoleOrAdmin(user, UserRole.readEnglishSongs) && userHasRoleOrAdmin(user, UserRole.readChineseSongs);
}
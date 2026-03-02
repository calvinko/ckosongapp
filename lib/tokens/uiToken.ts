import TokenUser from "../../ts/types/tokenUser.interface";
import { UserRole } from "../constants";

/**
 * Helper method to validate the token by calling the server
 *  
 * @param token the token to validate
 * @returns     returns true or false if the token is valid or not
 */
export const validateToken = async (token: string | null | undefined): Promise<TokenUser | null> => {

  // if token is empty/null/undefined, immediately return false
  if (!token) {
    return null;
  }

  try {
    const res = await fetch("/api/users/token", {
      method: "POST",
      body: JSON.stringify({ token }),
      headers: {
        'Content-Type': 'application/json'
      },
    });

    // check on the status
    const status = res?.status;
    const resJson = await res?.json()
    const tokenUser = resJson?.data?.tokenUser;
    if (status == 200 && tokenUser) {
      return tokenUser;
    }
  } catch (err) {
    console.error("Token " + token + " is not valid." + err);
  }

  // return false by default
  return null;
}

/**
 * Creates new Token User (only for admins)
 * 
 * @param name     name of the token user
 * @param location location/city of the token user
 * @param roles    roles token user has
 * @returns        TokenUser if successful or throws error
 */
export const createTokenUser = async (name: string, location: string, roles: UserRole[]): Promise<TokenUser> => {
  try {
    const res = await fetch("/api/admin/tokens", {
      method: "POST",
      body: JSON.stringify({ name, location, roles }),
      headers: {
        'Content-Type': 'application/json'
      },
    });

    // check on the status
    const status = res?.status;
    const resJson = await res?.json()
    const tokenUser = resJson?.data?.tokenUser;
    if (status == 200 && tokenUser) {
      return tokenUser;
    }
  } catch (err) {
    console.error("Could not create user for " + name + ". " + err);
    throw err;
  }
}

/**
 * Delete token user given token
 * 
 * @param token   token of user to delete
 * @returns       boolean if success or not. Success means it was deleted or not found. Failure means there was an error.
 */
export const deleteTokenUser = async (token: string): Promise<boolean> => {
  try {
    const res = await fetch("/api/admin/tokens", {
      method: "DELETE",
      body: JSON.stringify({ token }),
      headers: {
        'Content-Type': 'application/json'
      },
    });

    const status = res?.status;
    if (status != 200) {
      return false;
    }
    return true;
  } catch (err) {
    console.error("Could not delete user with token=" + token + ". " + err);
    return false;
  }
}
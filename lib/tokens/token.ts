import TokenUser from "../../models/TokenUser";
import TokenUserType from "../../ts/types/tokenUser.interface";

// File handling token users, which users will use the app based off of a token

/**
 * Create a Token User 
 * 
 * @param name      name of user
 * @param location  location/city user is from
 * @param roles     roles user has 
 * @returns         TokenUser
 */
export const createTokenUser = async (name: string, location: string, roles: string[]): Promise<TokenUserType> => {
  var timestamp = new Date();
  const user = new TokenUser({
    name,
    location,
    roles,
    createdAt: timestamp,
    lastModifiedAt: timestamp,
    lastValidatedAt: timestamp,
  });
  await user.save();

  return user;
}

/**
 * Get The Token from a TokenUser
 * 
 * @param tokenUser   TokenUser to get token from
 * @returns           Token in string
 */
export const getToken = (tokenUser: TokenUserType): string | null => {
  if (!tokenUser) {
    return null;
  }

  // currently just the mongodb object id
  return tokenUser?._id;
}

/**
 * Get the token user based off of its token (_id)
 * 
 * @param token token
 * @returns   TokenUser, and null if it doesn't exist
 */
export const getTokenUser = async (token: string): Promise<TokenUserType | null> => {
  const tokenUser = await TokenUser.findById(token);
  return tokenUser;
}

/**
 * Touch the `lastValidatedAt` timestamp of the TokenUser. This is when the last time the user was last validated at
 * 
 * @param token   token as a string
 * @returns       the timestamp set as the lastValidatedAt
 */
export const touchValidatedAt = async (token: string): Promise<Date> => {
  var timestamp = new Date();
  const ret = await TokenUser.updateOne(
    { _id: token },
    { $set: { lastValidatedAt: timestamp } }
  );
  return timestamp;
}

/**
 * Delete Token User
 * 
 * @param token   token of token user to delete
 * @returns       true if successful (including not found), false otherwise
 */
export const deleteTokenUser = async (token: string): Promise<boolean> => {
  if (!token) {
    return true;
  }
  try {
    await TokenUser.deleteOne({ _id: token }).exec();
    return true;
  }
  catch (err) {
    console.error("Error deleting token user with token=" + token + ". ", err);
    return false;
  }

}

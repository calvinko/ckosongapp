import store from "store2";
import UserProfile from "../models/UserProfile";
import Favorite from "../ts/types/favorite.interface";
import UserInfo from "../ts/types/userInfo.interface";
import dbConnect from "./dbConnect";
import { useFavorite } from "./uiUtils";

const BOOKMARK_KEY = "bookmark_v1";
// Manages Favorites or otherwise called Stars or bookmarks. We store favorites in both localStorage and mongo, if the user is logged in.

/**
 * Get Favorites from local storage. If email is valid, we fetch for favorites for the user. If the local and db favorites are different, we converge them.
 *
 * @returns list of Favorites
 */
const getFavoritesWithUser = (user: UserInfo, email: string): Favorite[] => {
  const rawOldFavorites = store(BOOKMARK_KEY);
  let oldFavorites: Favorite[];
  if (rawOldFavorites == null || rawOldFavorites.length === 0) {
    oldFavorites = new Array();
  } else {
    oldFavorites = JSON.parse(rawOldFavorites);
  }

  if (user?.favoritesLastUpdate) {
    const favoritesLastUpdatedTs = new Date(
      user?.favoritesLastUpdate
    ).getTime();
    oldFavorites = oldFavorites.filter(
      (fav) => new Date(fav.timestamp).getTime() >= favoritesLastUpdatedTs
    );
  }

  let combinedBookmarks = [...oldFavorites];

  let dbFavorites = user?.favorites ?? [];
  // add favorites from db to the oldBookmarks and then just include the fields in "Favorite" type
  dbFavorites.forEach((favorite) => {
    // we place in front so the ids are also saved
    combinedBookmarks.unshift({
      _id: favorite._id,
      songSlug: favorite.songSlug,
      timestamp: favorite.timestamp,
    });
  });

  combinedBookmarks.sort((a, b) => {
    const aTimestamp = a?.timestamp ? new Date(a?.timestamp) : new Date();
    const bTimestamp = b?.timestamp ? new Date(b?.timestamp) : new Date();
    return aTimestamp.getTime() - bTimestamp.getTime();
  });

  // remove duplicates
  let convergedBookmarks = convergeLocalAndDb(combinedBookmarks);

  // if the local and db bookmarks are different (with valid email), we update them
  if (isValidEmail(email) && convergedBookmarks.length !== dbFavorites.length) {
    try {
      store.set(BOOKMARK_KEY, JSON.stringify(convergedBookmarks));

      // async update, but we return the converged Bookmarks for the UI to render
      setFavoritesInDb(convergedBookmarks);
    } catch (err) {
      console.error(
        `Error updating db. email=${email} list=${convergedBookmarks}`
      );
    }
  }
  return convergedBookmarks;
};

/**
 * Get Favorites from the database (if the user exists - main source of truth)
 *
 * @param email email of the user
 * @returns     List of Favorites
 */
const getFavoritesFromDb = async (email: string): Promise<Favorite[]> => {
  const user = await getUserFromDb(email);
  return getFavoritesWithUser(user, email);
};

/**
 * Store a song's slug as a favorite (star it). If it's already added, we don't add it.
 * Timestamp of the first time favoriting it is stored
 */
const addFavorites = async (
  slug: string,
  email: string
): Promise<Favorite[]> => {
  const bookmarks: Favorite[] = await getFavoritesFromDb(email);

  // if song already exists
  if (bookmarks.findIndex((song) => song.songSlug === slug) != -1) {
    return;
  }

  var now = new Date();
  bookmarks.push({ songSlug: slug, timestamp: now.toISOString() });

  // store in db async, if valid email
  if (isValidEmail(email)) {
    try {
      const newDbFavorites = await setFavoritesInDb(bookmarks);
      store.set(BOOKMARK_KEY, JSON.stringify(newDbFavorites));

      return newDbFavorites;
    } catch (err) {
      console.error(
        `Something went wrong adding favorites to user. email=${email} songSlug=${slug} list=${bookmarks}`
      );
    }
  } else {
    store.set(BOOKMARK_KEY, JSON.stringify(bookmarks));
  }

  return bookmarks;
};

/**
 * Hook to get Favorites in the format of an Object of the song slugs to a Favorite. Same logic for local and db favorites to get email as {@link getFavorites}
 * @returns
 */
const useFavoritesByName = (
  email: string | null | undefined,
  status: string
): { [key: string]: Favorite } => {
  const ret = {};
  const favorites = useFavorite(email, status) ?? [];
  favorites?.forEach((favSong) => {
    ret[favSong.songSlug] = favSong;
  });
  return ret;
};

/**
 * Remove a slug from the favorites list, if it exists, from local and db
 *
 * @param slug  Song's slug
 * @returns     new list of favorites
 */
const removeFavorites = async (
  slug: string,
  email: string
): Promise<Favorite[]> => {
  const bookmarks: Favorite[] = await getFavoritesFromDb(email);
  const newBookmarks = bookmarks.filter((elm) => elm?.songSlug !== slug);

  if (isValidEmail(email)) {
    try {
      const newDbFavorites = await setFavoritesInDb(newBookmarks);
      store.set(BOOKMARK_KEY, JSON.stringify(newDbFavorites));
      return newDbFavorites;
    } catch (err) {
      console.error(
        `Something went wrong removing favorites to user. email=${email} songSlug=${slug} list=${bookmarks}`
      );
    }
  } else {
    store.set(BOOKMARK_KEY, JSON.stringify(newBookmarks));
  }

  return newBookmarks;
};

/**
 * Get User Info from Mongo. If invalid email, we return empty list without calling the api.
 *
 * @param email The email of the user to get favorites for
 * @returns list of favorites
 */
const getUserFromDb = async (email: string): Promise<UserInfo> => {
  if (!isValidEmail(email)) {
    return null;
  }
  // this creates a new user profile, if it doesn't exist
  let res = await fetch(`/api/users?email=${email}`, { method: "GET" });
  const userInfo: UserInfo = await res.json();

  return userInfo;
};

/**
 * Set to add list of favorites to mongo. If exception occurs, it would be swallowed or thrown
 *
 * @param favorites list of favorites to add to db
 */
const setFavoritesInDb = async (favorites: Favorite[]): Promise<Favorite[]> => {
  const res = await fetch("/api/users/favorites", {
    method: "POST",
    body: JSON.stringify({ favorites: favorites }),
  });

  const data = await res.json();
  return data?.data?.favorites;
};

/**
 * Handle the duplicate lists of local bookmarks with the db ones. We remove the duplicates.
 *
 * TODO: handle getting the earliest timestamp
 * @param favorites list of favorites which may have duplicates
 * @returns  de-duplicated list of favorites
 */
const convergeLocalAndDb = (favorites: Favorite[]): Favorite[] => {
  let u = {},
    a = [];
  for (var i = 0, l = favorites.length; i < l; ++i) {
    if (!u.hasOwnProperty(favorites[i].songSlug)) {
      a.push(favorites[i]);
      u[favorites[i].songSlug] = 1;
    }
  }
  return a;
};

/**
 * Checks if email is valid or not
 *
 * @param email email string (null or undefined too)
 * @returns boolean
 */
const isValidEmail = (email: string | null | undefined): boolean => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return (
    email !== undefined &&
    email !== null &&
    email != "undefined" &&
    email != "null" &&
    re.test(String(email).toLowerCase())
  );
};


export {
  getFavoritesWithUser,
  addFavorites,
  removeFavorites,
  useFavoritesByName,
  getFavoritesFromDb,
  isValidEmail,
};

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SongMeta, { FullSongMetaWithContent, SongMetaWithContent } from "../ts/types/songMeta.interface";
import UserInfo from "../ts/types/userInfo.interface";
import { isValidEmail } from "./favorites";
import {
  loadFavorites,
  loadSongs,
  loadUserInfo,
  removeUser,
  revalidateToken,
} from "./redux/actions";
import { RootState } from "./redux/store";
import {
  FAVORITES_STATE_VERSION,
  SONG_STATE_VERSION,
  TOKEN_STATE_VERSION,
  USER_STATE_VERSION,
} from "./redux/reducers";
import HymnBookMeta from "../ts/types/hymnBookMeta.interface";
import Favorite from "../ts/types/favorite.interface";
import TokenUser from "../ts/types/tokenUser.interface";
import { MelodyCluster } from "../ts/types/melodyCluster.interface";
import { Session } from "next-auth";
import { userHasRole, userHasRoleOrAdmin, UserRole } from "./constants";

const actualSongList = require("./generated/actualSongList.json")

/**
 * Hook that listens to clicks outside of the passed ref (the popup). We toggle the popup
 */
export const useOutsideAlerter = (
  ref: React.MutableRefObject<any>,
  popupOn: boolean,
  togglePopup: Function
) => {
  useEffect(() => {
    /**
     * toggle feedback state if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        togglePopup(!popupOn);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, popupOn]);
};

/**
 * Hook to load songs if it's not in redux yet
 *
 * @returns map of slug to song meta
 */
export const useSongs = (): { [key: string]: SongMetaWithContent } => {
  return actualSongList?.songs;
  // const dispatch = useDispatch();
  // const songs: { [key: string]: SongMetaWithContent } = useSelector(
  //   (state: RootState) => state?.songs?.details
  // );

  // if (typeof window === "undefined") return songs;

  // // we check if the version of the song reducer is
  // const version: string = useSelector(
  //   (state: RootState) => state?.songs?.version
  // );
  // if (version != SONG_STATE_VERSION) {
  //   dispatch(loadSongs());
  // } else if (!songs || songs == undefined) {
  //   dispatch(loadSongs());
  // }

  // return songs;
};

/**
 * Hook to load hymn books
 *
 * @returns map of book shortname to book meta
 */
export const useBooks = (): { [key: string]: HymnBookMeta } => {
  return actualSongList?.hymnBooks;
};

/**
 * Hook to load melody clusters
 * 
 * @returns map of base slug to cluster 
 */
export const useMelodyClusters = (): { [key: string]: MelodyCluster } => {
  return actualSongList?.melodyClusters;
}

/**
 * Hook to load User Info with additional info on access & loading
 * 
 * @param session session from next-auth
 * @param status  status of loading the session
 * @returns       the user, whether user has access or not, and whether we are still loading (the session or user)
 */
export const useUserOrNoAccess = (
  session: Session | null | undefined, status: string
): { user: UserInfo | null, noAccess: boolean, loading: boolean } => {
  const user = useUser(session?.user?.email, status);

  return {
    user: user,
    // - unauthenticated OR
    // - not loading session (so either authenticated/unauthenticated) and user doesn't exist OR
    // - user exists and doesn't have role
    // - user is blocked
    noAccess: status === "unauthenticated" ||
      (!userHasRoleOrAdmin(user, UserRole.paid)) ||
      userHasRole(user, UserRole.block),

    // we should render loading if we are loading session and cached user doesn't exist OR user is null but we authenticated the session (meaning we are pulling user details)
    // this is special logic on loading session - we find that loading session may be very slow and usually
    // if the cached user info exists, it most likely means the user has a proper session but it's just loading
    // so let's just bypass the loading
    loading: (status === "loading" && !user) || (!user && status === "authenticated")
  }
}

/**
 * Hook to load User Info given a user's email. Gets it from redux or loads it
 *
 * @param email User's email
 * @param status the sessions status https://next-auth.js.org/getting-started/client#usesession
 * @returns   UserInfo or null if email is invalid or user DNE
 */
export const useUser = (
  email: string | null | undefined,
  status: string
): UserInfo | null => {
  const isLoading: boolean = status == "loading";

  const dispatch = useDispatch();
  const userInfo: UserInfo = useSelector(
    (state: RootState) => state?.users?.details
  );

  // we check if the version of the user reducer is an older version and if so we also load and update
  const version: string = useSelector(
    (state: RootState) => state?.users?.version
  );

  const isAlreadyLoadingUser: boolean = useSelector(
    (state: RootState) => state?.users.isLoading
  );

  const lastUpdated: Date = useSelector(
    (state: RootState) => state?.users.lastUpdated
  );

  try {

    // if we dont have an email and we are done loading the session (no user is logged in) then we clear the redux user
    if (!email && !isLoading && userInfo) {
      dispatch(removeUser());
      return null;
    }

    // force load user info
    // if (force && isValidEmail(email)) {
    //   dispatch(loadUserInfo(email, false));
    //   return userInfo;
    // }

    // session is loading but we already have user info
    // if session isn't loading, it will end up being returned in:
    // `if (!isAlreadyLoadingUser && userInfo)`
    if (!email && isLoading && userInfo) {
      return userInfo;
    }

    // if not loading and we already have the user, just return
    if (!isAlreadyLoadingUser && userInfo) {
      return userInfo;
    }

    // if not valid email, something is off or it's still loading
    if (!isValidEmail(email)) {
      return null;
    }

    // if we updated this before, then let's also check if we are currently loading the user
    // and if we are, we don't load since we are currently loading
    // however, there's a weird case where it gets stuck in "loading"
    // and so this makes sure that we don't get stuck there for over 20 seconds
    if (lastUpdated && lastUpdated instanceof Date && lastUpdated?.getTime()) {
      const currTime = new Date();
      const secondsSinceUpdate =
        Math.abs(currTime.getTime() - lastUpdated.getTime()) / 1000;
      // if already loading user in redux, we skip
      if (isAlreadyLoadingUser && secondsSinceUpdate < 20) {
        return userInfo;
      }
    }

    // load user if it doesnt exist and email is valid or if version is older
    if (version != USER_STATE_VERSION || !userInfo || userInfo == undefined) {
      dispatch(loadUserInfo(email, isAlreadyLoadingUser));
    }

    return userInfo;
  } catch (e) {
    console.error("Error getting user from redux. ", e.message);
    dispatch(loadUserInfo(email, isAlreadyLoadingUser));
  }

  return userInfo;
};

/**
 * Hook to get the user's favorite songs, either from database or local storage
 * 
 * @param email  user's email, if available
 * @param status the status of the session https://next-auth.js.org/getting-started/client#usesession
 * @returns list of favorites
 */
export const useFavorite = (
  email: string | null | undefined,
  status: string
): Favorite[] => {
  const dispatch = useDispatch();
  const favorites: Favorite[] = useSelector(
    (state: RootState) => state?.favorites?.favorites
  );

  const error: any = useSelector((state: RootState) => state?.favorites?.error);

  // we check if the version of the favorites reducer is an older version and if so we also load and update
  const version: string = useSelector(
    (state: RootState) => state?.favorites?.version
  );

  const isLoadingFavs: boolean = useSelector(
    (state: RootState) => state?.favorites?.isLoading
  );

  if (status == "loading") {
    return favorites;
  }

  // if already loading favs in redux, we skip
  if (isLoadingFavs) {
    return favorites;
  }

  // whenever empty (probably on every page load since we dont cache favorites locally)
  if (!error && (version != FAVORITES_STATE_VERSION || !favorites)) {
    dispatch(loadFavorites(email));
  }

  return favorites;
};

/**
 * Hook to load the user inputted token, if available. `null` if not entered in.
 */
export const useToken = (): string | null => {
  // user inputted token
  const tokenValue: string | null = useSelector(
    (state: RootState) => state?.userOptions?.details.token
  );

  return tokenValue ?? null;
}

/**
 * Hook to load whether the user has a valid token or not. The validity is cached
 * for a sometime in redux-store and this handles the re-validation if necessary.
 */
export const useTokenUser = (): TokenUser => {
  const dispatch = useDispatch();

  // load `tokens` reducers data. this data gets deleted
  // ever so often, so we need to re-validate the token
  const isLoadingValidToken: boolean | null = useSelector(
    (state: RootState) => state?.tokens?.isLoading
  ) ?? false;
  const isValidToken: boolean = useSelector(
    (state: RootState) => state?.tokens?.isValidToken
  ) ?? false;
  const tokenUser: TokenUser | null = useSelector(
    (state: RootState) => state?.tokens?.tokenUser
  ) ?? null;
  const tokenStateVal: string | null = useSelector(
    (state: RootState) => state?.tokens?.token
  ) ?? null;
  const version: string | null = useSelector(
    (state: RootState) => state?.tokens?.version
  );

  // user inputted token that doesn't expire
  const tokenValue: string | null = useSelector(
    (state: RootState) => state?.userOptions?.details.token
  );

  // no inputted token to validate
  if (!tokenValue) {
    return null;
  }

  // user inputted token... so let's check if we need to re-validate
  // so let's look at the tokens reducer data...

  // check if it's loading and if so we short circuit
  if (isLoadingValidToken) {
    return tokenUser ?? null;
  }

  // expired token is not loading so it may be available

  // let's first check if the reducer version is old and immediately revalidate and refresh if so
  if (version != TOKEN_STATE_VERSION) {
    dispatch(revalidateToken(tokenValue));
    return tokenUser;
  }

  // check if the token from the token reducer is the same as the user inputted token (it should be)
  // if tokens are different (it could be the token reducer has expired), we should re-validate
  if (tokenStateVal !== tokenValue) {
    // the token reducer + user option reducer are out of sync
    // or the token reducer has expired so we need to refresh
    dispatch(revalidateToken(tokenValue));

    // return false as default since either it's out of sync or it needs to revalidate
    return null;
  }

  // if we have the token value but we dont have the isValidToken from the token reducer
  // then we need to refresh
  if (tokenValue && isValidToken == null) {
    dispatch(revalidateToken(tokenValue));
  }

  return tokenUser;
}

const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}
import React, { useEffect, useState } from "react";
import { getSongType, SongType, userHasRole, UserRole } from "../lib/constants";
import { userCanSeeBilingual } from "../lib/users/role";
import UserInfo from "../ts/types/userInfo.interface";

/**
 * Local storage key for song type
 */
const SONG_TYPE_OPTION_KEY = "song-type";

/**
 * Song Type Context. Includes method to update it
 */
export const SongTypeContext = React.createContext({
  songType: SongType.english,
  changeSongType: (songType: SongType) => { },
});

/**
 * React Context Provider for Song Types
 *
 * @see constants#SongType
 * @param children
 */
const SongTypeProvider = ({ children, user }: { children?: JSX.Element, user?: UserInfo }) => {
  const [songType, setSongType] = useState(SongType.english);

  /**
   * To update the song type value in the context
   *
   * @param songType  song type to change to
   */
  const changeSongType = (songType: SongType) => {
    localStorage.setItem(SONG_TYPE_OPTION_KEY, songType.toString());
    setSongType(songType);
  };

  // to get local storage details
  useEffect(() => {
    // default to -1 if it is not available
    const localStorageSongType =
      localStorage.getItem(SONG_TYPE_OPTION_KEY) ?? "english";
    setSongType(getSongType(localStorageSongType));
  });

  return (
    <SongTypeContext.Provider value={{ songType, changeSongType }}>
      {children}
    </SongTypeContext.Provider>
  );
};

export const SongTypeConsumer = SongTypeContext.Consumer;

export default SongTypeProvider;

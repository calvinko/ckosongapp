import UserInfo from "../../ts/types/userInfo.interface";
import { FavoriteSongSortBy, HymnContentSortBy, SongSheetType, SongType } from "../constants";
import {
  isValidEmail,
  removeFavorites,
  addFavorites,
  getFavoritesWithUser,
} from "../favorites";
import { fetchWithTimeout } from "../fetcher";
import { ActionType } from "./types";
import actualSongList from "../generated/actualSongList.json"
import { validateToken } from "../tokens/uiToken";
import { getNextSong } from "../audio-player/playerLib"
import SongMeta, { SongMetaWithContent } from "../../ts/types/songMeta.interface";
import { AudioPlayerState } from "./reducers";
import { AudioPlayerQueueItem } from "../../ts/types/audioPlayerQueueItem.interface";
import HymnBookMeta from "../../ts/types/hymnBookMeta.interface";
import { dispatch } from "react-hot-toast";
/**
 * Redux thunk method for loading all songs
 */
export const loadSongs = () => async (dispatch) => {
  if (typeof window === "undefined") return;

  dispatch({
    type: ActionType.SONG_LOAD_REQUESTED,
  });
  try {
    // const res = await fetch(`/api/songs`, {
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Cache-Control":
    //       "public, max-age=60, stale-while-revalidate=100, stale-if-error=600",
    //   },
    // });
    // const jsonRes = await res.json();
    const jsonRes = actualSongList;
    dispatch({
      type: ActionType.SONG_LOAD_COMPLETED,
      payload: {
        songs: jsonRes?.songs,
        books: jsonRes?.hymnBooks,
        error: null,
      },
    });
  } catch (err) {
    console.error("Error loading songs..", err);
    dispatch({
      type: ActionType.SONG_LOAD_COMPLETED,
      payload: {
        error: err,
        songs: null,
      },
    });
  }
};

/**
 * Redux thunk method for loading user info given email
 */
export const loadUserInfo = (
  email: string,
  isAlreadyLoadingUser: boolean
) => async (dispatch) => {
  if (typeof window === "undefined") return;

  if (!isValidEmail(email)) {
    return;
  }

  try {
    if (!isAlreadyLoadingUser) {
      dispatch({
        type: ActionType.USER_INFO_LOAD_REQUESTED,
      });
    }

    const res = await fetch(`/api/users?email=${email}`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "public, max-age=10, stale-while-revalidate=30, stale-if-error=60",
      },
    });

    if (!res.ok || res.status > 400) {
      dispatch({
        type: ActionType.USER_INFO_LOAD_COMPLETED,
        payload: {
          error: "Response error code from api",
          user: null,
        },
      });
      return;
    }

    const user: UserInfo = await res.json();
    dispatch({
      type: ActionType.USER_INFO_LOAD_COMPLETED,
      payload: {
        user,
        error: null,
      },
    });
  } catch (err) {
    console.error("Error loading user.. email=", email, err);
    dispatch({
      type: ActionType.USER_INFO_LOAD_COMPLETED,
      payload: {
        error: "Error loading user" + err,
        user: null,
      },
    });
  }
};

/**
 * Remove user for sign out purposes
 */
export const removeUser = () => async (dispatch) => {
  if (typeof window === "undefined") return;

  dispatch({
    type: ActionType.USER_INFO_REMOVE,
  });
};

/**
 * Redux thunk action to remove a favorite song
 *
 * @param slug  song's slug
 * @param email user's email to remove from
 */
export const removeFavoriteAction = (
  slug: string,
  email?: string | null | undefined
) => async (dispatch) => {
  dispatch({
    type: ActionType.REMOVE_FAVORITES_REQUESTED,
  });

  try {
    const favorites = await removeFavorites(slug, email);
    dispatch({
      type: ActionType.REMOVE_FAVORITES_COMPLETED,
      payload: {
        favorites,
        error: null,
      },
    });
  } catch (err) {
    console.error(
      "Error removing favorites. slug=",
      slug,
      " email=",
      email,
      err
    );
    dispatch({
      type: ActionType.REMOVE_FAVORITES_COMPLETED,
      payload: {
        error: err,
      },
    });
  }
};

/**
 * Redux thunk to add favorite song
 *
 * @param slug  song's slug
 * @param email user's email
 */
export const addFavoriteAction = (
  slug: string,
  email: string | null | undefined
) => async (dispatch) => {
  dispatch({
    type: ActionType.ADD_FAVORITES_REQUESTED,
  });

  try {
    const favorites = await addFavorites(slug, email);
    dispatch({
      type: ActionType.ADD_FAVORITES_COMPLETED,
      payload: {
        favorites,
        error: null,
      },
    });
  } catch (err) {
    console.error("Error adding favorites. slug=", slug, " email=", email, err);
    dispatch({
      type: ActionType.ADD_FAVORITES_COMPLETED,
      payload: {
        error: err,
      },
    });
  }
};

/**
 * Redux thunk to load favorites given a user's email
 *
 * @param email email of user if it exists
 */
export const loadFavorites = (email: string) => async (dispatch) => {
  dispatch({
    type: ActionType.LOAD_FAVORITES_REQUESTED,
  });

  if (!isValidEmail(email)) {
    const favorites = getFavoritesWithUser(null, email);
    dispatch({
      type: ActionType.LOAD_FAVORITES_COMPLETED,
      payload: {
        favorites,
      },
    });
    return;
  }

  try {
    const res = await fetchWithTimeout(`/api/users/?email=${email}`, {
      method: "GET",
      headers: {
        "Cache-Control":
          "public, max-age=10, stale-while-revalidate=20, stale-if-error=40",
      },
    });
    const user: UserInfo = await res.json();
    const favorites = getFavoritesWithUser(user, email);
    dispatch({
      type: ActionType.LOAD_FAVORITES_COMPLETED,
      payload: { favorites },
    });

    // refresh the user redux store as a bonus
    if (user) {
      dispatch({
        type: ActionType.USER_INFO_LOAD_COMPLETED,
        payload: {
          user,
          error: null,
        },
      });
    }

  } catch (err) {
    console.error("Error loading user and favorites. email=", email, err);
    dispatch({
      type: ActionType.LOAD_FAVORITES_COMPLETED,
      payload: {
        favorites: null,
        error: err,
      },
    });
  }
};

/**
 * Redux thunk to update "embedSongSheet" for user, showing the song sheet with song notes instead of the written lyrics.
 *
 * @param embed   whether to embed or not
 */
export const updateEmbedSongSheetAction = (embed: boolean) => async (
  dispatch
) => {
  dispatch({
    type: ActionType.UPDATE_EMBED_SONG_SHEET,
    payload: {
      embedSongSheet: embed,
      error: null,
    },
  });
};


/**
 * Redux thunk to update the song types (languages) to show to toggle between 
 */
export const updateDisplaySongTypesAction = (displaySongTypes: SongType[]) => async (
  dispatch
) => {
  dispatch({
    type: ActionType.UPDATE_DISPLAY_SONG_TYPES,
    payload: {
      displaySongTypes: displaySongTypes,
      error: null,
    },
  });
};



/**
 * Redux think to update Song Sheet Type User Options in redux
 * 
 * @param songSheetType song sheet type to update to 
 */
export const updateSongSheetTypeAction = (songSheetType: SongSheetType) => async (
  dispatch
) => {
  dispatch({
    type: ActionType.UPDATE_SONG_SHEET_TYPE,
    payload: {
      songSheetType: songSheetType,
      error: null,
    },
  });
};


/**
 * Redux thunk to update "favoritesSortBy" for user, the sort by property for favorites.
 *
 * @param sortBy Favorite Sort By (default dateAdded)
 */
export const updateFavoritesSortByAction = (
  sortBy: FavoriteSongSortBy
) => async (dispatch) => {
  dispatch({
    type: ActionType.UPDATE_FAVORITES_SORT_BY,
    payload: {
      favoritesSortBy: sortBy ?? FavoriteSongSortBy.dateAdded,
      error: null,
    },
  });
};

/**
 * Redux thunk to update "deviceShowRelated" for user, the local device property to show related songs
 *
 * @param deviceShowRelated boolean
 */
export const updateDeviceShowRelatedAction = (
  deviceShowRelated: boolean
) => async (dispatch) => {
  dispatch({
    type: ActionType.UPDATE_DEVICE_SHOW_RELATED,
    payload: {
      deviceShowRelated: deviceShowRelated,
      error: null,
    },
  });
};

export const updateTokenValue = (
  token: string | null | undefined
) => async (dispatch) => {
  dispatch({
    type: ActionType.UPDATE_USER_LOCAL_DEVICE_TOKEN,
    payload: {
      token
    }
  });

  dispatch(revalidateToken(token));
}

export const revalidateToken = (
  token: string | null | undefined
) => async (dispatch) => {
  if (!token) {
    dispatch({
      type: ActionType.UPDATE_TOKEN_IS_VALID,
      payload: {
        token,
        isValidToken: false,
        tokenUser: null
      }
    })
    return;
  }

  dispatch({
    type: ActionType.UPDATE_TOKEN_IS_LOADING,
    payload: {}
  });

  const tokenUser = await validateToken(token);

  dispatch({
    type: ActionType.UPDATE_TOKEN_IS_VALID,
    payload: {
      token,
      isValidToken: tokenUser != null,
      tokenUser
    }
  })
}

/**
 * Redux thunk to update "bookSortBy" for user, the sort by property when looking at hymn book content.
 *
 * @param sortBy Hymn Book Content Sort By (default dateAdded)
 */
export const updateHymnContentSortByAction = (
  sortBy: HymnContentSortBy
) => async (dispatch) => {
  dispatch({
    type: ActionType.UPDATE_HYMN_CONTENT_SORT_BY,
    payload: {
      hymnContentSortBy: sortBy ?? HymnContentSortBy.byPage,
      error: null,
    },
  });
};

/**
 * Redux thunk to trigger next song
 *
 * @param nextSongSlug    whether user chose next song
 * @param isShuffle       whether we should shuffle if no song in queue
 * @param songsWithAudio  lists of songs with audio for shuffle
 * @param state           audioPlayer state
 */
export const triggerNextSong = (
  { nextSongSlug, songsWithAudio, queue, playedQueue, currSong, isShuffle, isRepeat, shuffleBook }:
    { nextSongSlug?: string, songsWithAudio: SongMeta[], queue: AudioPlayerQueueItem[], playedQueue: AudioPlayerQueueItem[], currSong: SongMeta | null, isShuffle: boolean, isRepeat: boolean, shuffleBook: string | null }
) => async (dispatch) => {

  const { queue: newQueue, playedQueue: newPlayedQueue, song } = getNextSong({ nextSongSlug, songsWithAudio, queue, playedQueue, currSong, isShuffle, isRepeat, shuffleBook })
  // console.log("triggerNextSong res", playedQueue, "new,", newPlayedQueue, song)

  dispatch({
    type: ActionType.AUDIO_PLAYER_SET_SONG,
    payload: {
      queue: newQueue,
      playedQueue: newPlayedQueue,
      song
    }
  });
};

/**
 * Trigger Previous Song
 * 
 * @param state audioPlayer state
 * @returns 
 */
export const triggerPrevSong = (
  { queue, playedQueue }: { queue: AudioPlayerQueueItem[], playedQueue: AudioPlayerQueueItem[] }
) => async (dispatch) => {

  // console.log("triggerPrevSong")
  if (playedQueue.length <= 0) {
    return;
  }
  let tmpPlayedQueue = [...playedQueue]
  const latestSong = tmpPlayedQueue.shift()

  dispatch({
    type: ActionType.AUDIO_PLAYER_SET_SONG,
    payload: {
      queue,
      playedQueue: tmpPlayedQueue,
      song: latestSong?.slug
    }
  });
};

/**
 * Add Song to Queue
 */
export const addToQueue = (
  { songSlug, queue, index }: { songSlug: string, queue: AudioPlayerQueueItem[], index: number }
) => async (dispatch) => {
  dispatch({
    type: ActionType.AUDIO_PLAYER_QUEUE_NEXT,
    payload: {
      queue: [...queue, { slug: songSlug, id: `${index}-${songSlug}` }],
      index: index + 1
    }
  });
}


/**
 * Play or pause Audio Player
 */
export const setAudioIsPlaying = ({ isPlaying }: { isPlaying: boolean }) => async (dispatch) => {
  dispatch({
    type: isPlaying ? ActionType.AUDIO_PLAYER_PLAY : ActionType.AUDIO_PLAYER_PAUSE,
    payload: {}
  });
}


/**
 * Set Current Song Duration
 */
export const updateCurrSongDuration = ({ duration }: { duration: number }) => async (dispatch) => {
  dispatch({
    type: ActionType.AUDIO_PLAYER_SET_DURATION,
    payload: {
      songDuration: duration
    }
  });
}

/**
 * Set Audio Player Repeat Song
 */
export const toggleAudioPlayerRepeat = ({ currIsRepeat }: { currIsRepeat: boolean }) => async (dispatch) => {
  dispatch({
    type: ActionType.AUDIO_PLAYER_REPEAT,
    payload: {
      isRepeat: !currIsRepeat,
    }
  });
}

export const toggleAudioPlayerShuffle = ({ currIsShuffle }: { currIsShuffle: boolean }) => async (dispatch) => {
  dispatch(setAudioPlayerShuffle({ isShuffle: !currIsShuffle, shuffleBook: null }));
}

export const setAudioPlayerShuffle = ({ isShuffle, shuffleBook }: { isShuffle: boolean, shuffleBook?: string | null | undefined }) => async (dispatch) => {
  dispatch({
    type: ActionType.AUDIO_PLAYER_SHUFFLE,
    payload: {
      isShuffle: isShuffle,
    }
  });

  if (shuffleBook !== undefined) {
    dispatch({
      type: ActionType.AUDIO_PLAYER_SHUFFLE_BOOK,
      payload: {
        shuffleBook: shuffleBook
      }
    })
  }
}

export const setAudioPlayerShuffleBook = ({ shuffleBook }: { shuffleBook: string | null }) => async (dispatch) => {
  dispatch({
    type: ActionType.AUDIO_PLAYER_SHUFFLE_BOOK,
    payload: {
      shuffleBook: shuffleBook
    }
  })
}

import { combineReducers } from "redux";
import Favorite from "../../ts/types/favorite.interface";
import HymnBookMeta from "../../ts/types/hymnBookMeta.interface";
import { SongMetaWithContent } from "../../ts/types/songMeta.interface";
import TokenUser from "../../ts/types/tokenUser.interface";
import UserInfo from "../../ts/types/userInfo.interface";
import UserOptions from "../../ts/types/userOptions.interface";
import { FavoriteSongSortBy, HymnContentSortBy, SongSheetType, SongType } from "../constants";
import { ActionType } from "./types";
import { AudioPlayerQueueItem } from "../../ts/types/audioPlayerQueueItem.interface";
import storage from 'redux-persist/lib/storage'
import { persistReducer } from "redux-persist";


// These versions force the refresh of the local redux cache

// *******************************************
// NO NEED TO SET THIS - will remove soon
export const SONG_STATE_VERSION = "1.3.59"; // NO NEED ANYMORE
// *******************************************

export const USER_OPTION_STATE_VERSION = "0.0.8";
export const USER_STATE_VERSION = "0.0.23";
export const FAVORITES_STATE_VERSION = "0.0.7";
export const TOKEN_STATE_VERSION = "0.0.3";
export const AUDIO_PLAYER_STATE_VERSION = "0.0.1";

const initialSongState = {
  isLoading: false,
  details: null,
  bookDetails: null,
  error: null,
  lastUpdated: null,
  version: SONG_STATE_VERSION,
};

interface SongLoadPayload {
  songs: { [key: string]: SongMetaWithContent };
  books: { [key: string]: HymnBookMeta };
  error: Error;
}

interface SongLoadState {
  isLoading: boolean;
  details: any | null;
  bookDetails: any | null;
  error: any;
  lastUpdated?: any;
  version: string;
}

/**
 * Reducer for Songs
 */
export const songReducer = (
  state = initialSongState,
  { type, payload }: { type: ActionType; payload: SongLoadPayload }
): SongLoadState => {
  switch (type) {
    case ActionType.SONG_LOAD_REQUESTED:
      return {
        ...state,
        isLoading: true,
        lastUpdated: new Date(),
        version: SONG_STATE_VERSION,
      };
    case ActionType.SONG_LOAD_COMPLETED:
      return {
        ...state,
        isLoading: false,
        details: payload?.songs,
        bookDetails: payload?.books,
        error: payload?.error,
        lastUpdated: new Date(),
        version: SONG_STATE_VERSION,
      };
    default:
      return state;
  }
};

// users

const initialUserState = {
  isLoading: false,
  details: null,
  error: null,
  lastUpdated: null,
  version: USER_STATE_VERSION,
};

interface UserPayload {
  details: UserInfo | null;
  error?: any | null;
  lastUpdated?: any;
}

/**
 * State for User Reducer
 */
interface UserState {
  isLoading: boolean;
  details: UserInfo | null;
  error?: any | null;
  lastUpdated?: Date;
  version: string;
}

/**
 * Reducer for Users
 */
export const userReducer = (
  state = initialUserState,
  { type, payload }: { type: ActionType; payload: any }
): UserState => {
  switch (type) {
    case ActionType.USER_INFO_LOAD_REQUESTED:
      return {
        ...state,
        isLoading: true,
        lastUpdated: new Date(),
        version: USER_STATE_VERSION,
      };
    case ActionType.USER_INFO_LOAD_COMPLETED:
      if (payload?.error) {
        return {
          ...state,
          isLoading: false,
          details: null,
          error: "Load error: " + payload?.error,
          lastUpdated: new Date(),
          version: USER_STATE_VERSION,
        };
      }
      return {
        ...state,
        isLoading: false,
        details: payload?.user,
        error: null,
        lastUpdated: new Date(),
        version: USER_STATE_VERSION,
      };
    case ActionType.USER_INFO_REMOVE:
      return {
        ...state,
        isLoading: false,
        details: null,
        error: null,
        lastUpdated: new Date(),
        version: USER_STATE_VERSION,
      };
    default:
      return state;
  }
};

// User options
// see userOptions.interface.ts
const initialUserOptionsState = {
  isLoading: false,
  details: {
    embedSongSheet: true,
    displaySongTypes: [SongType.english, SongType.chinese],
    favoritesSortBy: FavoriteSongSortBy.dateAdded,
    hymnContentSortBy: HymnContentSortBy.byPage,
    deviceShowRelated: false,
    token: null
  },
  error: null,
  lastUpdated: null,
  version: USER_OPTION_STATE_VERSION,
  songSheetType: SongSheetType.default
};

interface UserOptionsPayload {
  embedSongSheet?: boolean;
  displaySongTypes?: SongType[]
  favoritesSortBy?: FavoriteSongSortBy;
  hymnContentSortBy?: HymnContentSortBy;
  deviceShowRelated?: boolean;
  error?: any | null;
  lastUpdated?: any;
  token?: string | null;
  songSheetType?: SongSheetType | null
}

/**
 * State for User Options Reducer
 */
interface UserOptionState {
  details: UserOptions;
  isLoading: boolean;
  lastUpdated?: any;
  version: string;
  error?: string;
}

export const userOptionsReducer = (
  state = initialUserOptionsState,
  { type, payload }: { type: ActionType; payload: UserOptionsPayload }
): UserOptionState => {
  switch (type) {
    case ActionType.UPDATE_EMBED_SONG_SHEET:
      if (payload?.error) {
        return {
          ...state,
          isLoading: false,
          lastUpdated: new Date(),
          error: "Updating Embed song sheet option: " + payload?.error,
        };
      }
      return {
        ...state,
        isLoading: false,
        lastUpdated: new Date(),
        details:
          state?.details == null
            ? null
            : { ...state?.details, embedSongSheet: payload?.embedSongSheet },
      };
    case ActionType.UPDATE_DISPLAY_SONG_TYPES:
      if (payload?.error) {
        return {
          ...state,
          isLoading: false,
          lastUpdated: new Date(),
          error: "Updating Display Song Types List: " + payload?.error,
        };
      }
      return {
        ...state,
        isLoading: false,
        lastUpdated: new Date(),
        details:
          state?.details == null
            ? null
            : { ...state?.details, displaySongTypes: payload?.displaySongTypes },
      };
    case ActionType.UPDATE_SONG_SHEET_TYPE:
      if (payload?.error) {
        return {
          ...state,
          isLoading: false,
          lastUpdated: new Date(),
          error: "Updating song sheet type option: " + payload?.error,
        };
      }
      return {
        ...state,
        isLoading: false,
        lastUpdated: new Date(),
        details:
          state?.details == null
            ? null
            : { ...state?.details, songSheetType: payload?.songSheetType },
      };
    case ActionType.UPDATE_FAVORITES_SORT_BY:
      return {
        ...state,
        isLoading: false,
        lastUpdated: new Date(),
        details:
          state?.details == null
            ? null
            : { ...state?.details, favoritesSortBy: payload?.favoritesSortBy },
      };
    case ActionType.UPDATE_DEVICE_SHOW_RELATED:
      return {
        ...state,
        isLoading: false,
        lastUpdated: new Date(),
        details:
          state?.details == null
            ? null
            : {
              ...state?.details,
              deviceShowRelated: payload?.deviceShowRelated,
            },
      };
    case ActionType.UPDATE_USER_LOCAL_DEVICE_TOKEN:
      return {
        ...state,
        lastUpdated: new Date(),
        details: state?.details == null
          ? null :
          { ...state?.details, token: payload?.token },
      }
    case ActionType.UPDATE_HYMN_CONTENT_SORT_BY:
      return {
        ...state,
        lastUpdated: new Date(),
        details: state?.details == null
          ? null :
          { ...state?.details, hymnContentSortBy: payload?.hymnContentSortBy },
      }
    default:
      return state;
  }
};

// favorites
const initialFavoritesState = {
  isLoading: false,
  favorites: null,
  error: null,
  version: FAVORITES_STATE_VERSION,
  lastUpdated: new Date(),
};

interface FavoritePayload {
  favorites: Favorite[];
  error?: any | null;
}

interface FavoritesState {
  isLoading: boolean;
  favorites: Favorite[] | null;
  error: any | null;
  version: string;
  lastUpdated: Date;
}

export const favoritesReducer = (
  state = initialFavoritesState,
  { type, payload }: { type: ActionType; payload: FavoritePayload }
): FavoritesState => {
  if (
    type == ActionType.ADD_FAVORITES_REQUESTED ||
    type == ActionType.LOAD_FAVORITES_REQUESTED ||
    type == ActionType.REMOVE_FAVORITES_REQUESTED
  ) {
    return {
      ...state,
      isLoading: true,
      lastUpdated: new Date(),
    };
  }
  if (
    type == ActionType.ADD_FAVORITES_COMPLETED ||
    type == ActionType.LOAD_FAVORITES_COMPLETED ||
    type == ActionType.REMOVE_FAVORITES_COMPLETED
  ) {
    if (payload?.error) {
      return {
        ...state,
        isLoading: false,
        error: "Updating Embed song sheet option: " + payload?.error,
        favorites: null,
        lastUpdated: new Date(),
      };
    }
    return {
      ...state,
      isLoading: false,
      favorites: payload?.favorites ?? null,
      lastUpdated: new Date(),
    };
  }
  return state;
};

const initalTokenState = {
  isLoading: false,
  isValidToken: null,
  token: null,
  tokenUser: null,
  error: null,
  version: TOKEN_STATE_VERSION,
  lastUpdated: new Date(),
};

interface TokenPayload {
  token: string | null;
  isValidToken: boolean;
  tokenUser: TokenUser | null;
  error?: any | null;
}

interface TokenState {
  isLoading: boolean;
  isValidToken: boolean | null;
  token: string | null;
  tokenUser: TokenUser | null;
  error: any | null;
  version: string;
  lastUpdated: Date;
}

/**
 * Reducer for managing tokens and token validation. This should be cached locally so
 * we don't always call the server to validate the token. However, we would need
 * to refresh this data once in a way to re-validate.
 */
export const tokenReducer = (
  state = initalTokenState,
  { type, payload }: { type: ActionType; payload: TokenPayload },
): TokenState => {
  switch (type) {
    case ActionType.UPDATE_TOKEN_IS_LOADING:
      return {
        ...state,
        isLoading: true,
        lastUpdated: new Date(),
        version: TOKEN_STATE_VERSION
      }
    case ActionType.UPDATE_TOKEN_IS_VALID:
      return {
        ...state,
        isLoading: false,
        isValidToken: payload?.isValidToken,
        token: payload?.token,
        tokenUser: payload?.tokenUser,
        error: payload?.error,
        lastUpdated: new Date(),
        version: TOKEN_STATE_VERSION,
      }
    default:
      return state;
  }
}

export const audioPlayerReducer = (
  state = initialAudioPlayerState,
  { type, payload }: { type: ActionType; payload: AudioPlayerPayload },
): AudioPlayerState => {
  switch (type) {
    case ActionType.AUDIO_PLAYER_QUEUE_NEXT:
      return {
        ...state,
        queue: payload?.queue,
        index: payload.index,
        version: AUDIO_PLAYER_STATE_VERSION,
        lastUpdated: new Date(),
      }
    case ActionType.AUDIO_PLAYER_SET_SONG:
      return {
        ...state,
        currSong: payload.song,
        playedQueue: [...payload.playedQueue],
        queue: [...payload.queue],
        version: AUDIO_PLAYER_STATE_VERSION,
        lastUpdated: new Date(),
      }
    case ActionType.AUDIO_PLAYER_SET_DURATION:
      return {
        ...state,
        songDuration: payload.songDuration
      }
    case ActionType.AUDIO_PLAYER_PLAY:
      return {
        ...state,
        isPlaying: true,
        version: AUDIO_PLAYER_STATE_VERSION,
        lastUpdated: new Date()
      }
    case ActionType.AUDIO_PLAYER_PAUSE:
      return {
        ...state,
        isPlaying: false,
        version: AUDIO_PLAYER_STATE_VERSION,
        lastUpdated: new Date()
      }
    case ActionType.AUDIO_PLAYER_SET_TIME_PROGRESS:
      return {
        ...state,
        timeProgress: payload.timeProgress,
        version: AUDIO_PLAYER_STATE_VERSION,
        lastUpdated: new Date()
      }
    case ActionType.AUDIO_PLAYER_REPEAT:
      return {
        ...state,
        isRepeat: payload.isRepeat,
        isShuffle: payload.isRepeat == true ? false : state.isShuffle,
        version: AUDIO_PLAYER_STATE_VERSION,
        lastUpdated: new Date()
      }
    case ActionType.AUDIO_PLAYER_SHUFFLE:
      return {
        ...state,
        isShuffle: payload.isShuffle,
        isRepeat: payload.isShuffle == true ? false : state.isRepeat, // set it off if shuffle is turned on, otherwise same value
        version: AUDIO_PLAYER_STATE_VERSION,
        lastUpdated: new Date()
      }
    case ActionType.AUDIO_PLAYER_SHUFFLE_BOOK:
      return {
        ...state,
        shuffleBook: payload.shuffleBook,
        version: AUDIO_PLAYER_STATE_VERSION,
        lastUpdated: new Date()
      }
    default:
      return state;
  }
}

const initialAudioPlayerState = {
  index: 0,
  currSong: "",
  songDuration: null,
  isPlaying: false,
  timeProgress: 0,
  queue: [],
  playedQueue: [],
  isRepeat: false,
  isShuffle: false,
  shuffleBook: null,
  version: AUDIO_PLAYER_STATE_VERSION,
  lastUpdated: new Date()
}

interface AudioPlayerPayload {
  index: number
  song: string

  songDuration: number | null;
  isPlaying: boolean;
  timeProgress: number;

  queue: AudioPlayerQueueItem[]
  playedQueue: AudioPlayerQueueItem[]
  isRepeat: boolean;
  isShuffle: boolean;
  shuffleBook: boolean | null;
}

export interface AudioPlayerState {
  index: number
  currSong: string
  songDuration: number;
  isPlaying: boolean;
  timeProgress: number;

  queue: AudioPlayerQueueItem[]
  playedQueue: AudioPlayerQueueItem[]
  isRepeat: boolean;
  isShuffle: boolean;
  shuffleBook: boolean | null;

  version: string;
  lastUpdated: Date;
}

// redux store config for audio player
const audioPlayerConfig = {
  key: "audioPlayer",
  storage: storage,
  blacklist: ["isPlaying", "shuffleBook"] // we dont want isPlaying to be stored so it always defaults to false
}

// COMBINE REDUCERS
const reducers = {
  songs: songReducer,
  users: userReducer,
  userOptions: userOptionsReducer,
  favorites: favoritesReducer,
  tokens: tokenReducer,
  audioPlayer: persistReducer(audioPlayerConfig, audioPlayerReducer)
};

export default combineReducers(reducers);

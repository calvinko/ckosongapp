import { FavoriteSongSortBy, HymnContentSortBy, SongSheetType, SongType } from "../../lib/constants";

/**
 * Object type for a UserOptions - a set of properties that are user specific. This is separate from roles, which are given by admins.
 */
export interface UserOptions {
  /**
   * Whether or not to embed the song sheet instead of showing the lyrics
   */
  embedSongSheet: boolean;

  /**
   * List of Song Types (languages) that user can choose from in the main menus
   */
  displaySongTypes?: SongType[] | null

  /**
   * Type of song sheet to show when embedding it
   */
  songSheetType?: SongSheetType | null;

  /**
   * Favorites Sort By Option for viewing favorite songs in the favorites page
   */
  favoritesSortBy: FavoriteSongSortBy;

  /**
   * Hymn Book Content Sort By Option for viewing hymn book's songs
   */
  hymnContentSortBy: HymnContentSortBy;

  /**
   * User Property for local device on whether to show related songs or not. May be overriden by global property set by admin.
   */
  deviceShowRelated: boolean;

  /**
   * User inputted value of the token. This is just the value the user entered and is not validated. It will be validated via another action and put on the `tokens` reducer.
   */
  token?: string | null;
}

export default UserOptions;

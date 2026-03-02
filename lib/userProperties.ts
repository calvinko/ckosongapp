import { useSelector } from "react-redux";
import { Dispatch } from "redux";
import { FavoriteSongSortBy, HymnContentSortBy, SongSheetType, SongType } from "./constants";
import {
  updateDeviceShowRelatedAction,
  updateEmbedSongSheetAction,
  updateFavoritesSortByAction,
  updateHymnContentSortByAction,
  updateSongSheetTypeAction,
  updateDisplaySongTypesAction
} from "./redux/actions";
import { RootState } from "./redux/store";

/**
 * UI Util to update whether user wants to embed song sheet or not. Currently saved in locally per browser.
 *
 * @param embed   whether to embed song sheet or not
 * @returns       embedSongSheet value
 */
export const updateEmbedSongSheet = (
  embed: boolean,
  dispatch: Dispatch<any>
): boolean => {
  dispatch(updateEmbedSongSheetAction(embed));
  return embed;
};

/**
 * Access user options embedSongSheet
 *
 * @returns boolean
 */
export const useIsEmbedSongSheet = (): boolean => {
  const embedSongSheet: boolean = useSelector(
    (state: RootState) => state?.userOptions?.details?.embedSongSheet
  );
  return embedSongSheet ?? false;
};

/**
 * Update the list of Song Types (languages) to display and toggle between
 */
export const updateDisplaySongTypes = (
  songTypes: SongType[],
  dispatch: Dispatch<any>
): string[] => {
  dispatch(updateDisplaySongTypesAction(songTypes));
  return songTypes;
}

/**
 * Access the list of Song Types (languages) to display and toggle between
 */
export const useDisplaySongTypes = (): SongType[] => {
  const displaySongTypes: SongType[] = useSelector(
    (state: RootState) => state?.userOptions?.details?.displaySongTypes
  );
  return displaySongTypes ?? [SongType.english, SongType.chinese];
};


/**
 * UI Util to update the sort by options for favorites page
 *
 * @param sortBy  sortBy value to set
 * @param dispatch react dispatch
 * @returns       sortBy value
 */
export const updateFavoritesSortBy = (
  sortBy: FavoriteSongSortBy,
  dispatch: Dispatch<any>
): FavoriteSongSortBy => {
  dispatch(updateFavoritesSortByAction(sortBy));
  return sortBy;
};

/**
 * Access user options favorites sort by option
 *
 * @returns boolean
 */
export const useFavoritesSortBy = (): FavoriteSongSortBy => {
  const favoritesSortBy: FavoriteSongSortBy | null | undefined = useSelector(
    (state: RootState) => state?.userOptions?.details?.favoritesSortBy
  );
  return favoritesSortBy ?? FavoriteSongSortBy.dateAdded;
};

/**
 * UI Util to update the sort by options for hymn book content page
 *
 * @param sortBy  sortBy value to set
 * @param dispatch react dispatch
 * @returns       sortBy value
 */
export const updateHymnContentSortBy = (
  sortBy: HymnContentSortBy,
  dispatch: Dispatch<any>
): HymnContentSortBy => {
  dispatch(updateHymnContentSortByAction(sortBy));
  return sortBy;
};

/**
 * Access user options hymn book content sort by option
 *
 * @returns boolean
 */
export const useHymnContentSortBy = (): HymnContentSortBy => {
  const hymnBookSortBy: HymnContentSortBy | null | undefined = useSelector(
    (state: RootState) => state?.userOptions?.details?.hymnContentSortBy
  );
  return hymnBookSortBy ?? HymnContentSortBy.byPage;
};

/**
 * UI Util to update the deviceShowRelated, the show related song property for the local device, which overrides the global one, unless global is "off".
 *
 * @param deviceShowRelated   whether to show related songs or not locally
 * @param dispatch react dispatch
 * @returns                   deviceShowRelated
 */
export const updateDeviceShowRelated = (
  deviceShowRelated: boolean,
  dispatch: Dispatch<any>
): boolean => {
  dispatch(updateDeviceShowRelatedAction(deviceShowRelated));
  return deviceShowRelated;
};

/**
 * Access user option's deviceShowRelated property (show related songs for the local device). Defaults to false.
 *
 * @returns boolean
 */
export const useDeviceShowRelated = (): boolean => {
  const deviceShowRelated: boolean = useSelector(
    (state: RootState) => state?.userOptions?.details?.deviceShowRelated
  );
  return deviceShowRelated ?? false;
};

/**
 * UI Util to update the song sheet type to show 
 *
 * @param embed   song sheet type to show
 * @returns       updated SongSheetType 
 */
export const updateSongSheetType = (
  songSheetType: SongSheetType,
  dispatch: Dispatch<any>
): SongSheetType => {
  dispatch(updateSongSheetTypeAction(songSheetType));
  return songSheetType;
};

/**
 * Access user options songSheetType
 *
 * @returns SongSheetType
 */
export const useSongSheetType = (): SongSheetType => {
  const songSheetType: SongSheetType = useSelector(
    (state: RootState) => state?.userOptions?.details?.songSheetType
  );
  return songSheetType ?? SongSheetType.default;
};
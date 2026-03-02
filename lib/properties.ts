import useSWR from "swr";
import Property from "../ts/types/property.interface";
import fetcher, { DEFAULT_SWR_OPTIONS, fetcherWithMaxAge } from "./fetcher";

const ADD_RELATED_PROPERTY = "feature.addRelatedSong.enabled";
const SHOW_RELATED_PROPERTY = "feature.showRelatedSong.enabled";
const ALLOW_SONG_SHEET_QUERY_PROPERTY = "feature.allowSongSheetByQuery.enabled";

/**
 * Basic function to get a property from our api.
 *
 * @param key the key of the property
 * @returns Property
 */
const getProperty = async (key: string): Promise<Property> => {
  const res = await fetch(`/api/admin/properties/${key}`);
  const json = await res.json();
  return json;
};

/**
 * Set value of existing property (404 if not found)
 *
 * @param key key of the property
 * @param value value of the property
 * @returns response json
 */
const setProperty = async (key: string, value: string): Promise<any> => {
  const res = await fetch(`/api/admin/properties/${key}?value=${value}`, {
    method: "PUT",
  });
  const json = await res.json();
  return json;
};

/**
 * Basic Hook to get a property from our api. Use helper hook methods instead of this method as you can.
 *
 * @param key the key of the property
 * @returns Property
 */
const getPropertyHook = (key: string): Property => {
  const { data: property } = useSWR(
    `/api/admin/properties/${key}`,
    fetcherWithMaxAge,
    DEFAULT_SWR_OPTIONS
  );
  return property;
};

/**
 * Hook to get addRelatedSong property on whether it's enabled or not
 */
const useAddRelatedSongEnabled = (): Property => {
  return getPropertyHook(ADD_RELATED_PROPERTY);
};

/**
 * Hook to get showRelatedSong property on whether it's enabled or not
 */
const useShowRelatedSongEnabled = (): Property => {
  return getPropertyHook(SHOW_RELATED_PROPERTY);
};

/**
 *  Hook to get allow song sheet by query property on whether it's enabled or not
 */
const useAllowSongSheetQueryEnabled = (): Property => {
  return getPropertyHook(ALLOW_SONG_SHEET_QUERY_PROPERTY);
};

export {
  getProperty,
  useAddRelatedSongEnabled,
  setProperty,
  ADD_RELATED_PROPERTY,
  SHOW_RELATED_PROPERTY,
  useShowRelatedSongEnabled,
  useAllowSongSheetQueryEnabled,
  ALLOW_SONG_SHEET_QUERY_PROPERTY,
};

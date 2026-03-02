/**
 * Object type in which we store a favorite/starred song
 */
export interface Favorite {
  _id?: string;
  songSlug: string;
  timestamp: string; // utc is8601 string
}

export default Favorite;

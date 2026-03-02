import SongMeta from "./songMeta.interface";

/**
 * Type that includes data about the song and the text
 */
export interface Song {
  slug: string;
  hymn: string;
  pageNumber: number;
  metadata: SongMeta;
  text?: string;
}

export default Song;

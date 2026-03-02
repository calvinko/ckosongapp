import Song from "./song.interface";
import SongMeta from "./songMeta.interface";

/**
 * The JSON Response of /api/songs/{slug}
 */
export interface SongResponseDTO extends Song {
  /**
   * Songs that are in the same hymn book as the song
   */
  songsInBook: SongMeta[];

  /**
   * If song has individual song sheet
   */
  hasOwnSheetPdf: boolean;
}

import { SongType } from "../../lib/constants";
import HymnBookMeta from "./hymnBookMeta.interface";
import { MelodyCluster, MelodyClusterRef } from "./melodyCluster.interface";

/**
 * Metadata about a song
 */
export interface SongMeta {
  hymn: string;
  pageNumber: number;
  name: string;
  dataUrl?: string;
  songType: SongType;
  slug: string; // chinese songs may have an additional suffix like, H1_32_0. The suffix at the end describes the song index of that page since there may be multiple songs on the same page
  markdownUrl?: string;
  imageUrl?: string;
  mp3?: string;
  instrumentalMp3?: string;
  pianoMp3?: string;
  startKey?: string; // singable start key
  key?: string; // original key in song sheets
  reference?: string[]; // slug of the related songs (english or chinese version of this song)
  referenceSongs?: ReferenceSong[]; // reference song objects. not SongMeta due to circular references
  hasOwnSheetPdf?: boolean; // if song has a sheet music pdf (see public/books/individual-pages)

  lyricsBy?: string;
  musicBy?: string;
  translatedBy?: string;

  metaToDisplay?: DisplayableMetadata[]; // displayable metadata in the song's page as key value pairs
  tags?: string[]; // tags for the song

  melodyCluster?: MelodyClusterRef;
}

export interface ReferenceSong {
  hymn: string;
  pageNumber: number;
  name: string;
  songType: SongType;
  slug: string;
}

/**
 * Key value pairs to display in the Song's page
 */
export interface DisplayableMetadata {
  key: string;
  value: string;
  /**
   * Optional Link that would link the the value
   */
  href?: string;
}

/**
 * Metadata on all hymn books and songs
 */
export interface FullMeta {
  songs: { [key: string]: SongMeta };
  hymnBooks: { [key: string]: HymnBookMeta };
  melodyClusters: { [key: string]: MelodyCluster };
}

/**
 * Metadata on all hymn books and songs + song content
 */
export interface FullMetaWithContent {
  songs: { [key: string]: SongMetaWithContent };
  hymnBooks: { [key: string]: HymnBookMeta };
  melodyClusters: { [key: string]: MelodyCluster };
}

export interface FullSongMetaWithContent extends SongMeta {
  content: string;
  songsInBook: SongMeta[];
}

export interface SongMetaWithContent extends SongMeta {
  content: string;
}

export default SongMeta;

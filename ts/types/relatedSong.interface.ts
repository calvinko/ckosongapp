/**
 * RelatedSong Type, representing a song that is related to the primary key. This should match the Mongoose schema model RelatedSong
 */
export interface RelatedSong {
  /**
   * Id from mongo if it's a mongo entry
   */
  _id?: string;

  timestamp: number;

  /**
   * slug of the primary song
   */
  primary: string;

  /**
   * song type of the primary song
   */
  primarySongType: string;

  /**
   * The stanza of the primary song that's related
   */
  primaryStanzas?: string;

  /**
   * slug of the secondary song
   */
  secondary: string;

  /**
   * song type of the secondary song
   */
  secondarySongType: string;

  /**
   * The stanza of the secondary song that's related
   */
  secondaryStanzas?: string;

  /**
   * Any note on this relation
   */
  note?: string;
}

export default RelatedSong;

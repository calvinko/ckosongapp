import mongoose from "mongoose";

/**
 * A Related Song document. Imagine relations as a directed graph, but not acyclic
 */
const RelatedSong = new mongoose.Schema({
  /**
   * epoch timestamp in milliseconds
   */
  timestamp: Number,

  /**
   * slug of the primary song
   */
  primary: { type: String, required: true },

  /**
   * song type of the primary song
   */
  primarySongType: { type: String, required: true },

  /**
   * The stanza of the primary song that's related
   */
  primaryStanzas: { type: String, required: false },

  /**
   * slug of the secondary song
   */
  secondary: { type: String, required: true },

  /**
   * song type of the secondary song
   */
  secondarySongType: { type: String, required: true },

  /**
   * The stanza of the secondary song that's related
   */
  secondaryStanzas: { type: String, required: false },

  /**
   * Any note on this relation
   */
  note: { type: String, required: false },
});

RelatedSong.index({ primary: 1 });
RelatedSong.index({ secondary: 1 });

export default mongoose.models.RelatedSong ||
  mongoose.model("RelatedSong", RelatedSong);

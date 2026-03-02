import mongoose from "mongoose";

/**
 * Generic Entry table. Stores different types of data, like SongNotes.
 */
const GenericEntry = new mongoose.Schema({

  // the index name, defining the type of entry
  indexName: { type: String, required: true },

  // primary key
  pk: { type: String, required: true },

  // primary key type
  pType: { type: String, required: true },

  // secondary key
  sk: { type: String, required: true },

  // secondary key type
  sType: { type: String, required: true },

  /**
   * payload as json string
   */
  payload: String

}, { timestamps: true }); // includes createdAt and updatedAt fields

GenericEntry.index({ indexName: 1 });
GenericEntry.index({ indexName: 1, pk: 1 });
GenericEntry.index({ indexName: 1, pk: 1, pType: 1 });
GenericEntry.index({ indexName: 1, sk: 1 });
GenericEntry.index({ indexName: 1, sk: 1, sType: 1 });
GenericEntry.index({ indexName: 1, pk: 1, pType: 1, sk: 1, sType: 1 });

export default mongoose.models.GenericEntry || mongoose.model("GenericEntry", GenericEntry);
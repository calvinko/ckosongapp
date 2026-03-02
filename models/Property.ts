import mongoose from "mongoose";

/**
 * Mongoose Schema for Properties (usages: feature flags)
 */
const Property = new mongoose.Schema({
  /**
   * epoch timestamp in milliseconds
   */
  createdAt: Number,

  /**
   * epoch timestamp in milliseconds
   */
  lastModifiedAt: Number,

  /**
   * Optional Email
   */
  key: { type: String, required: true },

  /**
   * Value of the property
   */
  value: { type: String, required: true },
});

Property.index({ key: 1 });

export default mongoose.models.Property || mongoose.model("Property", Property);

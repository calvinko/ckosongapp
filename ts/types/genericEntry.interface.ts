
/**
 * Generic Entry type. Stores different types of data, like SongNotes.
 * @see models/GenericEntry
 */
export interface GenericEntry {
  /**
   * MongoDB row id
   */
  _id: string;
  // indexName of the entry
  indexName: string;
  // primary key
  pk: string;
  // primary key type
  pType: string;
  // secondary key
  sk: string;
  // secondary key type
  sType: string;
  // payload as an object (stored as json string and api parses it out)
  payload: any;
  // createdAt timestamp
  createdAt: string;
  // last updatedAt timestamp
  updatedAt: string;
}

/**
 * Create DTO for GenericEntry
 */
export interface GenericEntryCreate {
  // indexName of the entry
  indexName: string;
  // primary key
  pk: string;
  // primary key type
  pType: string;
  // secondary key
  sk: string;
  // secondary key type
  sType: string;
  // payload as an object 
  payload: any;
}
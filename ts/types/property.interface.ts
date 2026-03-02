/**
 * Object type for a Property (properties to define features enable/disable etc)
 */
export interface Property {
  createdAt: number;
  lastModifiedAt: number;
  /**
   * Key of the property (primary key)
   */
  key: string;

  /**
   * Value of the property as a string
   */
  value: string;
}

export default Property;

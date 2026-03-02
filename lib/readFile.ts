import fs from "fs";
import util from "util";

/**
 * Helper method to read a file and promisify it for async/await
 *
 * @param fileName
 */
export const readFile = (fileName: string): Promise<string> =>
  util.promisify(fs.readFile)(fileName, "utf8");

export default readFile;

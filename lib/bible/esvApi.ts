
const BASE_URL: string = "https://api.esv.org";
const VERSE_PATH: string = "/v3/passage/text";

/**
 * Load Verse from ESV API
 * 
 * @param verse  The verse to search for. see https://api.esv.org/docs/passage-text/
 * @returns    The canonical verse and the passages
 */
export const loadVerse = async (verse: string): Promise<[string, string[]]> => {
  try {
    const res = await fetch(`${BASE_URL}${VERSE_PATH}?q=${verse}&include-verse-numbers=false&include-passage-references=false&include-footnotes=false&include-short-copyright=false&include-headings=false&indent-poetry=false`, {
      headers: {
        "Authorization": `Token 221cd49c8584117eec3edd0c5bd2b3ceb50176be`
      }
    });
    if (res.status >= 400) {
      return [null, null];
    }

    const data = await res.json();

    return [data?.canonical, data?.passages]
  } catch (e) {
    return [null, null];
  }
}
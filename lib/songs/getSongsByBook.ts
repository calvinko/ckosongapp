import SongMeta from "../../ts/types/songMeta.interface";

/**
 * Get Songs grouped by Hymn Book (ex: SOL1). Each key is a hymn and each value is a list of songs grouped by the book
 *
 * @param songs songs in a dict groupbed by its slug
 */
export const getSongsByBook = (songs: {
  [key: string]: SongMeta;
}): { [key: string]: SongMeta[] } => {
  return getSongsByBookFromList(Object.values(songs));
};

/**
 * Get Songs grouped by Hymn Book (ex: SOL1). Each key is a hymn and each value is a list of songs grouped by the book
 *
 * @param songList list of songs
 */
export const getSongsByBookFromList = (
  songList: SongMeta[]
): { [key: string]: SongMeta[] } => {
  const songsByBooks = {};

  // loop through and put each song in it's respective list of songs by book
  songList.forEach((song) => {
    const book = song.hymn;
    if (book in songsByBooks) {
      songsByBooks[book].push(song);
      return;
    }
    songsByBooks[book] = [song];
  });

  // for each book, sort it's songs by slug (including page number)
  Object.keys(songsByBooks).forEach((key) => {
    const songs: SongMeta[] = songsByBooks[key];
    songs?.sort((songA, songB) => {
      // compare page numbers, cannot just compare slug strings because SOL1_100 is < SOL1_3 in string comparison
      const slugA = songA.slug;
      const slugB = songB.slug;
      const aPg = parseInt(slugA.split("_")[1]);
      const bPg = parseInt(slugB.split("_")[1]);
      if (aPg > bPg) {
        return 1;
      } else if (bPg > aPg) {
        return -1;
      }
      return 0;
    });
  });

  return songsByBooks;
};

export default getSongsByBook;

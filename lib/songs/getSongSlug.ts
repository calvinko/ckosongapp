/**
 * Standard way of getting song slugs. Do not use this to resolve slugs given a song. Use SongMeta#slug, which is already generated
 *
 * @param book        the hymn book
 * @param pageNumber  page Number
 */
export const getSongSlug = (book: string, pageNumber: string): string => {
  return book + "_" + pageNumber;
};

export default getSongSlug;

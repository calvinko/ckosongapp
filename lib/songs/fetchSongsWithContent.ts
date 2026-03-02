import HymnBookMeta from "../../ts/types/hymnBookMeta.interface";
import SongMeta, {
  FullMeta,
  FullMetaWithContent,
  FullSongMetaWithContent,
  SongMetaWithContent,
} from "../../ts/types/songMeta.interface";
import fetchSongContent from "./fetchSongContent";
import fetchSongs from "./fetchSongs";
import getSongsByBook from "./getSongsByBook";

export const getAllSongsWithContent = async (): Promise<FullMetaWithContent> => {
  const allMeta: FullMeta = await fetchSongs();

  const songsWithContent = await fetchSongsWithContent(allMeta?.songs, allMeta?.hymnBooks)
  return {
    songs: songsWithContent,
    hymnBooks: allMeta?.hymnBooks,
    melodyClusters: allMeta?.melodyClusters,
  }
}

export const fetchSongsWithFullContent = async (songs: { [key: string]: SongMeta; }, books: { [key: string]: HymnBookMeta }): Promise<{ [key: string]: FullSongMetaWithContent }> => {
  let ret = {};
  for (const slug in songs) {
    const songMetadata: SongMeta = songs[slug];
    const book = books[songMetadata.hymn];
    const { text } = await fetchSongContent(slug, songMetadata?.songType, book);

    const songWithContent: FullSongMetaWithContent = {
      content: text,
      songsInBook: getSongsByBook(songs)[songMetadata.hymn],
      ...songMetadata,
    };
    ret[slug] = songWithContent;
  }

  return ret;
};

export const fetchSongsWithContent = async (songs: { [key: string]: SongMeta; }, books: { [key: string]: HymnBookMeta }): Promise<{ [key: string]: SongMetaWithContent }> => {
  let ret = {};
  for (const slug in songs) {
    const songMetadata: SongMeta = songs[slug];

    const book = books[songMetadata.hymn];
    const { text } = await fetchSongContent(slug, songMetadata?.songType, book);

    const songWithContent: SongMetaWithContent = {
      content: text,
      ...songMetadata,
    };
    ret[slug] = songWithContent;
  }

  return ret;
}

export default fetchSongsWithContent;

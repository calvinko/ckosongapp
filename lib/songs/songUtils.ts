import SongMeta, { SongMetaWithContent } from "../../ts/types/songMeta.interface";
import getSongsByBook from "./getSongsByBook";


export const getAdjacentSongs = (
    { song, allSongs }:
        { song: SongMetaWithContent, allSongs: { [key: string]: SongMetaWithContent } }
): { nextSong: SongMeta, previousSong: SongMeta } => {
    const songList: SongMeta[] = getSongsByBook(allSongs)[song.hymn];

    return getAdjacentSongsWithSongsInBook({ songSlug: song.slug, songsInBook: songList });
}

export const getAdjacentSongsWithSongsInBook = (
    { songSlug, songsInBook }:
        { songSlug: string, songsInBook: SongMeta[] }
): { nextSong: SongMeta, previousSong: SongMeta } => {

    // find next song and previous song slugs
    // songs in the same book
    const songSlugsInSameBook = songsInBook?.sort((songA, songB) => {
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

    // find the current song and it's index in the sorted list
    const currentSongSlugIndex = songSlugsInSameBook.findIndex(
        (s) => s.slug === songSlug
    );

    // if last index, it is null
    const nextSong =
        currentSongSlugIndex < songSlugsInSameBook.length - 1 &&
            currentSongSlugIndex != -1
            ? songSlugsInSameBook[currentSongSlugIndex + 1]
            : null;
    // if first index, it is null
    const previousSong =
        currentSongSlugIndex > 0 && currentSongSlugIndex != -1
            ? songSlugsInSameBook[currentSongSlugIndex - 1]
            : null;

    return { nextSong, previousSong }
}
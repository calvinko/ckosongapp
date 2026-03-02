import { AudioPlayerQueueItem } from "../../ts/types/audioPlayerQueueItem.interface"
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useBooks } from "../uiUtils";
import SongMeta, { SongMetaWithContent } from "../../ts/types/songMeta.interface";
import { AudioPlayerState } from "../redux/reducers";
import { getAdjacentSongs, getAdjacentSongsWithSongsInBook } from "../songs/songUtils";
import { getSongsByBookFromList } from "../songs/getSongsByBook";
import next from "next";
import HymnBookMeta from "../../ts/types/hymnBookMeta.interface";

// Truncate played queue up to this size - 1 before we add a new one
const MAX_PLAYED_QUEUE_SIZE = 10

/**
 * Gets next song based on parameters. 
 * 
 * 1. if nextSongSlug is provided, then it overrides everything
 * 2. if queue has songs in it, let's play it
 * 3. if shuffle then we pick a random song
 * 4. do nothing
 * 
 * Returns payload for redux to change in audioPlayer
 */
export const getNextSong = (
    { nextSongSlug, songsWithAudio, queue, playedQueue, currSong, isShuffle, isRepeat, shuffleBook }:
        { nextSongSlug?: string, songsWithAudio: SongMeta[], queue: AudioPlayerQueueItem[], playedQueue: AudioPlayerQueueItem[], currSong: SongMeta, isShuffle: boolean, isRepeat: boolean, shuffleBook: string }
): {
    queue: AudioPlayerQueueItem[],
    playedQueue: AudioPlayerQueueItem[],
    song: string
} => {

    let truncatedPlayedQueue = playedQueue;
    if (playedQueue.length > MAX_PLAYED_QUEUE_SIZE) {
        truncatedPlayedQueue = playedQueue.slice(0, MAX_PLAYED_QUEUE_SIZE)
    }
    // add the curr song to the front of the list
    const newPlayedQueue = currSong != null ? [{ slug: currSong.slug, id: `old-${currSong.slug}` }, ...truncatedPlayedQueue] : playedQueue
    if (nextSongSlug) {
        return {
            queue,
            playedQueue: newPlayedQueue,
            song: nextSongSlug
        }
    }

    if (isRepeat && currSong != null) {
        return {
            queue,
            playedQueue,
            song: currSong?.slug
        }
    }

    if (queue?.length > 0) {
        const tmpQueue = [...queue]
        const firstElem = tmpQueue.shift()
        return {
            queue: tmpQueue,
            playedQueue: newPlayedQueue,
            song: firstElem.slug
        }
    }

    // shuffle
    if (isShuffle) {
        if (shuffleBook != null) {
            const songsInBook: SongMeta[] = getSongsByBookFromList(songsWithAudio)[shuffleBook]
            const randomIdx = Math.floor(Math.random() * (songsInBook.length + 1));
            return {
                queue,
                playedQueue: newPlayedQueue,
                song: songsInBook[randomIdx]?.slug
            }
        }

        const randomIdx = Math.floor(Math.random() * (songsWithAudio.length + 1));
        return {
            queue,
            playedQueue: newPlayedQueue,
            song: songsWithAudio[randomIdx]?.slug
        }
    }

    // get next song in the book
    if (currSong != null) {
        const songsInBook: SongMeta[] = getSongsByBookFromList(songsWithAudio)[currSong.hymn]
        const { nextSong } = getAdjacentSongsWithSongsInBook({ songSlug: currSong.slug, songsInBook })
        if (nextSong) {
            return {
                queue,
                playedQueue: newPlayedQueue,
                song: nextSong.slug
            }
        } else {
            // otherwise loop back to the first song of the book
            return {
                queue,
                playedQueue: newPlayedQueue,
                song: songsInBook[0].slug
            }
        }
    }

    return {
        queue,
        playedQueue,
        song: currSong?.slug
    }
}

/**
 * Get the song's mp3. If piano allowed, then we also go to the piano mp3 or instrumental if mp3 not available. Otherwise null
 * 
 * @param song the song
 * @returns mp3 path
 */
export const getSongMp3WithContext = (song: SongMeta | null, allowPiano: boolean): string | null => {
    if (song == null) {
        return null;
    }

    const songMp3 = song.mp3
    if (songMp3) {
        return songMp3;
    }

    if (!allowPiano) {
        return null;
    }

    return song.pianoMp3 ?? song.instrumentalMp3 ?? null;
}

/**
 * Filter song list based on the state context
 * 
 * @param songList          Song list (most likely the list of songs in the book)
 * @param allowPiano        Whether we also want to include songs from piano
 * @param onlySongsWithAudio Whether we only want to show songs with audio (or still include it in the list)
 * @returns 
 */
export const filterSongsWithContext = (songList: SongMeta[], allBooks: { [key: string]: HymnBookMeta }, allowPiano: boolean, onlySongsWithAudio: boolean): SongMeta[] => {
    return songList.filter(song => {
        if (!onlySongsWithAudio) {
            return true;
        }
        // we only want songs with audio here, so let's see if the song has one
        const songMp3: string | null = getSongMp3WithContext(song, allowPiano);
        return songMp3; // true if song has audio (non null/blank mp3)
    })
        .filter(song => allBooks[song.hymn].isSearchable)
}
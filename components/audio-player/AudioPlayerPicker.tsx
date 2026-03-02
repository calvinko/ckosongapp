import React, { useContext, useEffect, useState } from "react"
import { Box, Flex, Heading, Link, Text, } from "../base";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "../../lib/redux/store";
import { useAudioPlayerCtx } from "../../lib/audio-player/AudioPlayerContext";
import SongMeta, { SongMetaWithContent } from "../../ts/types/songMeta.interface";
import { useBooks, useSongs } from "../../lib/uiUtils";
import getSongsByBook, { getSongsByBookFromList } from "../../lib/songs/getSongsByBook";
import { SongTypeContext } from "../SongTypeProvider";
import { BOOK_REQUIRES_BORDER, SongType } from "../../lib/constants";
import HymnBookMeta from "../../ts/types/hymnBookMeta.interface";
import { addToQueue, setAudioIsPlaying, setAudioPlayerShuffle, setAudioPlayerShuffleBook, triggerNextSong } from "../../lib/redux/actions";
import { ChevronLeft } from "react-feather";
import HymnTag from "../HymnTag";
import PlayCircleIcon from "../icons/PlayCircleIcon";
import { filterSongsWithContext, getSongMp3WithContext } from "../../lib/audio-player/playerLib";
import ShuffleIcon from "../icons/ShuffleIcon";
import toast from "react-hot-toast"
import { AudioPlayerQueueItem } from "../../ts/types/audioPlayerQueueItem.interface";
import PauseCircleIcon from "../icons/PauseCircleIcon";
import QueueListIcon from "../icons/QueueListIcon";
import QueueAddIcon from "../icons/QueueAddIcon";
import PianoIcon from "../icons/PianoIcon";

const AudioPlayerPicker = ({ }) => {
    const [chosenBook, setChosenBook] = useState<string | null>(null); // UI Element - chosen book that is shown to user
    const [shuffleOnBook, setShuffleOnBook] = useState(false); // UI Element - whether the shuffle icon is enabled on the book
    const [bookPlay, setBookPlay] = useState<string | null>(null); // the playing book (user has selected to play on this book, if shuffle was on then shuffleBook=bookPlay)

    // redux
    const dispatch = useDispatch();
    const isShuffle: boolean = useSelector((state: RootState) => state?.audioPlayer.isShuffle);
    const isPlaying: boolean = useSelector((state: RootState) => state?.audioPlayer.isPlaying);
    const currSlug: string = useSelector((state: RootState) => state?.audioPlayer.currSong);
    const audioPlayerIndex: number = useSelector((state: RootState) => state?.audioPlayer.index);
    const isRepeat: boolean = useSelector((state: RootState) => state?.audioPlayer.isRepeat);
    const shuffleBook: string = useSelector((state: RootState) => state?.audioPlayer.shuffleBook);
    const queue: AudioPlayerQueueItem[] = useSelector((state: RootState) => state?.audioPlayer.queue, shallowEqual)
    const playedQueue: AudioPlayerQueueItem[] = useSelector((state: RootState) => state?.audioPlayer.playedQueue, shallowEqual)
    const { allowPiano, showPlayerUI, onlySongsWithAudio } = useAudioPlayerCtx();

    const allSongs: { [key: string]: SongMetaWithContent } = useSongs();
    const allBooks: { [key: string]: HymnBookMeta } = useBooks();
    const currSong: SongMetaWithContent | null = currSlug != null ? allSongs[currSlug] : null;
    const songsWithAudio = filterSongsWithContext(Object.values(allSongs), allBooks, allowPiano, true);
    const songsByBook: { [key: string]: SongMeta[] } | null = getSongsByBook(
        allSongs
    );
    const { songType, changeSongType: toggleSongType } = useContext(SongTypeContext);
    const englishBookMeta = Object.values(allBooks).filter(book => book?.songType === "english").filter(book => book.isSearchable);
    const chineseBookMeta = Object.values(allBooks).filter(book => book?.songType === "chinese").filter(book => book.isSearchable);

    const bookListToShow = songType == SongType.english ? englishBookMeta : chineseBookMeta;
    const currBook: HymnBookMeta | null = chosenBook ? allBooks[chosenBook] : null
    const songsToShow = chosenBook && currBook ? filterSongsWithContext(songsByBook[chosenBook], allBooks, allowPiano, onlySongsWithAudio) : []

    useEffect(() => {
        if (shuffleBook == chosenBook) {
            setShuffleOnBook(true);
        }
        else {
            setShuffleOnBook(false);
        }
    }, [shuffleBook, chosenBook])

    const handleShuffleOnBook = () => {
        const shuffleOnBookVal = !shuffleOnBook
        setShuffleOnBook(shuffleOnBookVal)
        if (!shuffleOnBookVal) {
            dispatch(setAudioPlayerShuffleBook({ shuffleBook: null }))
        }
    }

    const handleBack = () => {
        setChosenBook(null)
        setShuffleOnBook(false);
    }

    const handleSongPick = (song: SongMeta) => {
        dispatch(triggerNextSong({
            songsWithAudio, nextSongSlug: song?.slug, queue, playedQueue, currSong, isShuffle, isRepeat, shuffleBook: shuffleBook
        }))
        setBookPlay(null);
    }

    const handleAddToQueue = (e: any, song: SongMeta) => {
        e.stopPropagation();
        dispatch(addToQueue({ songSlug: song.slug, queue, index: audioPlayerIndex }));
        toast.success("Added to queue", { duration: 600 });
    }

    const handleBookPlay = (hymnBook: HymnBookMeta, isShuffle: boolean) => {
        const hymnsWithAudioInBook = getSongsByBookFromList(songsWithAudio)[hymnBook.hymnBook];
        const randomIdx = Math.floor(Math.random() * (hymnsWithAudioInBook.length + 1));
        setBookPlay(hymnBook.hymnBook);
        if (isShuffle) {
            dispatch(setAudioPlayerShuffle({ isShuffle: true, shuffleBook: hymnBook?.hymnBook }))
            dispatch(triggerNextSong({ songsWithAudio, nextSongSlug: hymnsWithAudioInBook[randomIdx]?.slug, queue, playedQueue, currSong, isShuffle, isRepeat, shuffleBook: hymnBook.hymnBook }))
            if (!isPlaying) {
                dispatch(setAudioIsPlaying({ isPlaying: true }))
            }
            return;
        }

        dispatch(triggerNextSong({ songsWithAudio, nextSongSlug: hymnsWithAudioInBook[0]?.slug, queue, playedQueue, currSong, isShuffle, isRepeat, shuffleBook: hymnBook.hymnBook }))
        dispatch(setAudioPlayerShuffle({ isShuffle: false, shuffleBook: null }))
        dispatch(setAudioIsPlaying({ isPlaying: true }))
    }

    const handleBookPause = (hymnBook: HymnBookMeta) => {
        setBookPlay(null);
        dispatch(setAudioPlayerShuffleBook({ shuffleBook: null }))
        dispatch(setAudioIsPlaying({ isPlaying: false }));
    }

    return (
        <Box className={`mt-4 ${showPlayerUI ? 'hidden' : ''}`}>
            {chosenBook && currBook
                ?
                <div>
                    <div className="mb-4 ml-2">
                        <Link
                            onClick={() => handleBack()}
                        >
                            <>
                                <ChevronLeft className="inline arrow-icon" />
                                Back
                            </>
                        </Link>
                        <Flex
                            flexDirection="row"
                            className="gap-x-4 mt-4"
                        >
                            <div className="h-[120px] w-[120px]">
                                <img
                                    src={currBook?.albumCoverUrl ?? currBook?.imageUrl ?? ""}
                                    className={`rounded w-full h-full ${BOOK_REQUIRES_BORDER.includes(currBook.hymnBook) ? "border border-[#eaeaea]" : ""}`}
                                />
                            </div>
                            <Flex
                                flexDirection="column"
                                className=""
                            >
                                <Heading as="h4" type="h4">
                                    {currBook?.bookFullName}
                                </Heading>
                                <Box className="">
                                    <HymnTag
                                        allowLink={false}
                                        hymnBook={chosenBook}
                                        fullName={false}
                                    />
                                </Box>
                                <Flex
                                    flexDirection="row"
                                    className="justify-items-center mt-4 items-center gap-x-3"
                                >
                                    {bookPlay == chosenBook ?
                                        <PauseCircleIcon
                                            className="w-14 h-14 cursor-pointer hover:fill-[#528AC7]"
                                            fill="#3F7DC1"
                                            onClick={() => handleBookPause(currBook)}
                                        />
                                        : <PlayCircleIcon
                                            className="w-14 h-14 cursor-pointer hover:fill-[#528AC7]"
                                            fill="#3F7DC1"
                                            onClick={() => handleBookPlay(currBook, shuffleOnBook)}
                                        />
                                    }
                                    <ShuffleIcon
                                        className={`w-5 h-5 cursor-pointer ${!shuffleOnBook ? "hover:stroke-[#6b6b6b]" : "hover:stroke-[#3F7DC1]"}`}
                                        color={`${shuffleOnBook ? '#3F7DC1' : '#999'}`}
                                        onClick={() => handleShuffleOnBook()}
                                    />
                                </Flex>
                            </Flex>
                        </Flex>
                    </div>
                    <div className={`${showPlayerUI ? 'overflow-hidden' : ''}`}>
                        {songsToShow.map((song) => (
                            <div
                                className={`song-item ${!getSongMp3WithContext(song, allowPiano) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                key={`song-${song?.slug}`}
                                onClick={(e) => { if (getSongMp3WithContext(song, allowPiano)) { handleSongPick(song) } }}
                            >
                                <Flex
                                    flexDirection="row"
                                    className="pl-0.5 items-center"
                                >
                                    <div className="w-12 block">
                                        <Text
                                            className="pl-1"
                                            fontSize="16px"
                                            fontWeight="500"
                                            color={!getSongMp3WithContext(song, allowPiano) ? '#B3B3B3' : ''}
                                        >
                                            {song.pageNumber + ".  "}
                                        </Text>
                                    </div>
                                    <div className="w-full">

                                        <Text
                                            fontSize="16px"
                                            className="block pl-1"
                                            fontWeight={!getSongMp3WithContext(song, allowPiano) ? '400' : currSlug === song?.slug ? "500" : ''}
                                            color={!getSongMp3WithContext(song, allowPiano) ? '#B3B3B3' : currSlug === song?.slug ? "#3F7DC1" : ''}
                                        >
                                            <>
                                                {song.name}
                                                {(!song?.mp3 && (song?.instrumentalMp3 || song?.pianoMp3)) && (
                                                    <PianoIcon
                                                        className="w-3 inline ml-2"
                                                        alt="has music or audio"
                                                    />
                                                )}
                                            </>
                                        </Text>
                                    </div>
                                    {getSongMp3WithContext(song, allowPiano) &&
                                        <div className="inline-block ml-auto">
                                            <div className="pl-3 pr-1">
                                                <QueueAddIcon
                                                    onClick={e => handleAddToQueue(e, song)}
                                                    className="inline queue-add w-6 hover:stroke-[#6b6b6b]"
                                                />
                                            </div>
                                        </div>
                                    }
                                </Flex>
                            </div>
                        ))
                        }
                    </div>
                </div>
                :
                <div>
                    {/* <Heading as="h4" type="h4" className="mb-2 ml-2">
                        Choose Hymn Book
                    </Heading> */}
                    <Flex
                        flexDirection="row"
                        className="justify-center content-center flex-wrap w-full sm:w-[90%] gap-x-4 gap-y-3">
                        {bookListToShow.map((book) => (
                            <AudioPlayerHymnBook
                                hymnBook={book}
                                setChosenBook={setChosenBook}
                                key={`book-select-${book.hymnBook}`}
                            />
                            // <div
                            //     className="song-item cursor-pointer"
                            //     onClick={() => setChosenBook(book.hymnBook)}
                            //     key={`book-${book.hymnBook}`}
                            // >
                            //     <Text as="p" className="px-4" fontSize="16px">
                            //         {book.bookFullName}
                            //     </Text>
                            // </div>
                        ))
                        }
                    </Flex>
                </div>
            }
            <style jsx>{`
                .song-item {
                    width: 100%;
                    padding: 8px 0;
                    border-bottom: 1px solid #eaeaea;
                }
                .queue-add {
                    vertical-align: middle;
                    height: 20px;
                    // padding-bottom: 2px;
                }
            `}</style>
        </Box >
    )
}

const AudioPlayerHymnBook = ({ hymnBook, setChosenBook }: { hymnBook: HymnBookMeta, setChosenBook: Function }) => {
    return (
        <div>
            <div
                className="audio-hymn-book rounded-md"
                onClick={() => setChosenBook(hymnBook.hymnBook)}
            >
                <Flex flexDirection="column" className=" p-2 content-center justify-center justify-items-center">
                    <img
                        src={hymnBook?.albumCoverUrl ?? hymnBook?.imageUrl ?? ""}
                        width="124px"
                        height="124px"
                        className="audio-hymn-album-cover rounded-md"
                    />
                    <div className="mt-1 w-[120px]">
                        <Text as="p" lineHeight="16px">{hymnBook?.bookFullName}</Text>
                    </div>
                </Flex>
            </div>
            <style jsx>{`
                .audio-hymn-book {
                    // margin: 0.8rem;
                    text-decoration: none;
                    width: 140px;

                    transition: color 0.15s ease, border-color 0.15s ease;
                    cursor: pointer;
                    padding-bottom: 4px;
                }

                .audio-hymn-book:hover {
                    background-color: rgb(241 245 249);
                }
            
            `}</style>
        </div>

    )
}

export default AudioPlayerPicker;
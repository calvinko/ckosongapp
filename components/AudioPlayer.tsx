import React, { createRef, useCallback, useContext, useEffect, useRef, useState } from "react";
import AudioPlayer from 'react-h5-audio-player';
import Image from "next/image"

import { useSession } from "next-auth/react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import toast from "react-hot-toast";

import SongMeta, { SongMetaWithContent } from "../ts/types/songMeta.interface";
import { useBooks, useSongs, useUserOrNoAccess, useWindowDimensions } from "../lib/uiUtils";
import { Box, Text, Link, Heading, Flex, Button } from "../components/base";
import HymnTag from "./HymnTag";
import { SongTypeContext } from "./SongTypeProvider";
import { SongType } from "../lib/constants";
import HymnBookMeta from "../ts/types/hymnBookMeta.interface";
import getSongsByBook, { getSongsByBookFromList } from "../lib/songs/getSongsByBook";
import Head from "next/head";
import { addToQueue, setAudioIsPlaying, setAudioPlayerShuffle, setAudioPlayerShuffleBook, toggleAudioPlayerRepeat, toggleAudioPlayerShuffle, triggerNextSong, triggerPrevSong, updateCurrSongDuration } from "../lib/redux/actions";
import { RootState } from "../lib/redux/store";
import { ChevronDown, ChevronLeft, PlusSquare, Repeat } from 'react-feather';

import { AudioPlayerQueueItem } from "../ts/types/audioPlayerQueueItem.interface";
import AudioPlayerLyrics from "./audio-player/AudioPlayerLyrics"
import ProgressBar from "./audio-player/ProgressBar";
import { useAudioPlayerCtx } from "../lib/audio-player/AudioPlayerContext";
import { getSongMp3WithContext } from "../lib/audio-player/playerLib";
import PlayCircleIcon from "./icons/PlayCircleIcon";
import ShuffleIcon from "./icons/ShuffleIcon";
import PauseCircleIcon from "./icons/PauseCircleIcon"
import QueueView from "./audio-player/QueueView";
import AudioBackwardIcon from "./icons/AudioBackwardIcon";
import AudioForwardIcon from "./icons/AudioForwardIcon";
import QueueListIcon from "./icons/QueueListIcon";

const silence =
    "data:audio/mpeg;base64,//NAxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEWwAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==";

const START_HEIGHT_PLAYER_PX = 600;

/**
 * Audio Player Component
 * 
 * Includes pop up of audio player and also the sticky bottom player. The actual audio element is here too.
 */
const AudioPlayerComponent = () => {
    const { data: session, status } = useSession();
    const dispatch = useDispatch();

    const currSlug: string = useSelector((state: RootState) => state?.audioPlayer.currSong);
    const { height, width } = useWindowDimensions();
    // const [isPlaying, setIsPlaying] = useState(false);
    const duration: number = useSelector((state: RootState) => state?.audioPlayer.songDuration)
    const isPlaying: boolean = useSelector((state: RootState) => state?.audioPlayer.isPlaying)
    const isShuffle: boolean = useSelector((state: RootState) => state?.audioPlayer.isShuffle)
    const isRepeat: boolean = useSelector((state: RootState) => state?.audioPlayer.isRepeat)
    const queue: AudioPlayerQueueItem[] = useSelector((state: RootState) => state?.audioPlayer.queue, shallowEqual)
    const playedQueue: AudioPlayerQueueItem[] = useSelector((state: RootState) => state?.audioPlayer.playedQueue, shallowEqual)
    const audioPlayerIndex: number = useSelector((state: RootState) => state?.audioPlayer.index)
    const shuffleBook: string = useSelector((state: RootState) => state?.audioPlayer.shuffleBook)
    const [isViewQueue, setIsViewQueue] = useState(false);
    const [showLyrics, setShowLyrics] = useState(false);
    const { audioRef, progressBarRef, timeProgress, setTimeProgress, allowPiano, setAllowPiano, showPlayerUI, setShowPlayerUI } = useAudioPlayerCtx();
    const playAnimationRef = useRef<number | null>(null);

    const setIsPlaying = (isPlayingVal: boolean) => {
        dispatch(setAudioIsPlaying({ isPlaying: isPlayingVal }))
    }

    const updateProgress = useCallback(() => {
        if (audioRef.current && progressBarRef.current && duration) {
            const currentTime = audioRef.current.currentTime;
            setTimeProgress(currentTime);

            progressBarRef.current.value = currentTime.toString();
            progressBarRef.current.style.setProperty(
                '--range-progress',
                `${(currentTime / duration) * 100}%`
            );
        }
    }, [duration, audioRef, progressBarRef, dispatch]);

    const startAnimation = useCallback(() => {
        if (audioRef.current && progressBarRef.current && duration) {
            const animate = () => {
                updateProgress();
                playAnimationRef.current = requestAnimationFrame(animate);
            };
            playAnimationRef.current = requestAnimationFrame(animate);
        }
    }, [updateProgress, duration, audioRef, progressBarRef]);

    useEffect(() => {
        if (isPlaying) {
            audioRef.current?.play();
            startAnimation();
        } else {
            audioRef.current?.pause();
            if (playAnimationRef.current !== null) {
                cancelAnimationFrame(playAnimationRef.current);
                playAnimationRef.current = null;
            }
            updateProgress(); // Ensure progress is updated immediately when paused
        }

        return () => {
            if (playAnimationRef.current !== null) {
                cancelAnimationFrame(playAnimationRef.current);
            }
        };
    }, [isPlaying, startAnimation, updateProgress, audioRef]);


    const allSongs: { [key: string]: SongMetaWithContent } = useSongs();
    const allBooks: { [key: string]: HymnBookMeta } = useBooks();

    const songsWithAudio = Object.values(allSongs)
        .filter((song) => song.songType == SongType.english)
        .filter((song) => getSongMp3WithContext(song, allowPiano))
        .filter((song) => allBooks[song.hymn].isSearchable)

    const currSong: SongMetaWithContent | null = currSlug != null ? allSongs[currSlug] : null;
    const currBook: HymnBookMeta | null = currSong != null ? allBooks[currSong.hymn] : null;
    const source = createRef<HTMLSourceElement>();

    useEffect(() => {
        if (currSlug != null) {
            const currSong: SongMetaWithContent = allSongs[currSlug]
            if (currSong != null) {
                const title = `${currSong?.pageNumber} - ${currSong?.name}`;
                audioRef?.current?.setAttribute("title", title)
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: title,
                    album: allBooks[currSong.hymn]?.bookFullName,
                    artwork: [
                        { src: allBooks[currSong.hymn]?.albumCoverUrl ?? allBooks[currSong.hymn]?.imageUrl ?? "", type: 'image/png' },
                    ]
                });
                audioRef?.current?.load()
                audioRef?.current?.play()
            }
        }
    }, [currSlug])

    // useEffect(() => {
    //     if (audioRef?.current) {
    //         if (isPlaying) {
    //             audioRef.current.play();
    //         }
    //         else {
    //             audioRef.current.pause();
    //         }
    //     }
    // }, [isPlaying])

    // https://stackoverflow.com/questions/44418606/how-do-i-set-a-thumbnail-when-playing-audio-in-ios-safari
    // https://developer.chrome.com/blog/media-session

    useEffect(() => {
        audioRef.current?.addEventListener('play', () => {
            setIsPlaying(true);
        })
        audioRef.current?.addEventListener('pause', () => {
            // console.log("pause")
            setIsPlaying(false);
        })

        audioRef.current?.addEventListener('playing', () => {
            setIsPlaying(true);
        })
        audioRef.current?.addEventListener('canplay', () => {
            // setIsPlaying(true);
        })
    }, [audioRef, currSlug, isRepeat])


    useEffect(() => {
        // navigator.mediaSession.setActionHandler('pause', function () {
        //     audio?.current?.audio?.current?.play()
        // });
        // media session
        audioRef.current?.addEventListener('ended', () => {
            // console.log("ended")
            setTimeProgress(0);
            handleNextClick();
            if (isRepeat) {
                // if repeat, we already loaded the song so play again
                setIsPlaying(true);
            }
        })
        navigator.mediaSession.setActionHandler('play', () => {
            audioRef?.current?.play();
            setIsPlaying(true);
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            audioRef?.current?.pause();
            setIsPlaying(false);
        });
        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (!audioRef?.current?.duration) {
                return;
            }
            if (audioRef?.current) {
                audioRef.current.currentTime = details.seekTime ?? 0;
                // .fastSeek(details.seekTime ?? 0);
            }
        });

        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            dispatch(triggerPrevSong({ queue, playedQueue }))
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            const currSongVar: SongMetaWithContent = allSongs[currSlug]
            dispatch(triggerNextSong({
                songsWithAudio, queue, playedQueue, currSong: currSongVar, isShuffle, isRepeat, shuffleBook: shuffleBook
            }))
        });

        // return () => {
        //     navigator.mediaSession.removeActionHandler('previoustrack', () => { /* Code excerpted. */ });
        //     navigator.mediaSession.setActionHandler('nexttrack', () => { /* Code excerpted. */ });
        // };
    }, [audioRef, currSlug, queue, playedQueue, isShuffle, isRepeat, shuffleBook])

    if (currSlug != null && currSong == null) {
        // toast.error("No Song exists.")
    }

    if (currSong != null && getSongMp3WithContext(currSong, true) == null) {
        toast.error("No Song exists.")
    }


    const handleSongPick = (song) => {
        dispatch(triggerNextSong({
            songsWithAudio, nextSongSlug: song?.slug, queue, playedQueue, currSong, isShuffle, isRepeat, shuffleBook: shuffleBook
        }))
    }

    const handleNextClick = (e?: any) => {
        if (e) {
            e.stopPropagation();
        }
        if (isRepeat) {
            setTimeProgress(0);
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
        else {
            dispatch(triggerNextSong({
                songsWithAudio, queue, playedQueue, currSong, isShuffle, isRepeat, shuffleBook: shuffleBook
            }))
        }
        // console.log("handleNextClick", queue, playedQueue, "currslug:", currSlug, isShuffle, isRepeat)
    }

    const handlePrevClick = (e: any) => {
        e.stopPropagation();
        dispatch(triggerPrevSong({ queue, playedQueue }))
    }

    const handlePlay = (e: any) => {
        e.stopPropagation();
        if (!currSong) {
            return;
        }
        setIsPlaying(true);
        audioRef?.current?.play();
    }

    const handlePause = (e: any) => {
        e.stopPropagation();
        setIsPlaying(false);
        audioRef?.current?.pause();
    }

    const onLoadedMetadata = () => {
        const seconds = audioRef.current?.duration
        if (seconds) {
            dispatch(updateCurrSongDuration({ duration: seconds }));
            if (progressBarRef.current) {
                progressBarRef.current.max = seconds.toString();
            }
        }
    };

    const handleShowPlayerUI = (showPlayerUIVal: boolean) => {
        if (!currSong) {
            return;
        }
        setShowPlayerUI(showPlayerUIVal);
    }

    const title = currSong ? `${currSong?.pageNumber} - ${currSong?.name}` : "Audio Player";

    // console.log("currSlug", currSlug)
    return (
        <Box className="w-full">
            <Head>
                <title>
                    {title}
                </title>
                <meta
                    property="og:title"
                    content={title}
                    key="title"
                />
            </Head>
            <aside className={`w-full ${showPlayerUI ? 'visible' : 'hidden'}`}>
                <Flex
                    className="border rounded-lg pb-2 w-full left-0 top-0 right-0 bottom-0 fixed z-40 h-screen min-h-screen bg-white items-center"
                    flexDirection="column"
                >
                    <Flex
                        flexDirection="column"
                        className="max-w-xl sm:min-w-[576px] w-full"
                    >
                        <Flex
                            flexDirection="row"
                            className={`p-2 w-full ${height > START_HEIGHT_PLAYER_PX ? 'mt-4' : 'mt-0'}`}
                        >
                            <ChevronDown
                                className="w-10 h-10 cursor-pointer"
                                color="#c1c1c1"
                                onClick={() => { handleShowPlayerUI(false); setIsViewQueue(false); }}
                            />
                            <Flex className="justify-items-end ml-auto items-center">
                                <Button
                                    outline
                                    type="small"
                                    shadow={false}
                                    onClick={() => { setIsViewQueue(false); setShowLyrics(!showLyrics); }}
                                    className={`mr-2 ${showLyrics && 'border-[#3F7DC1] text-[#3F7DC1] hover:border-[#3F7DC1] active:border-[#3F7DC1]'}`}
                                >
                                    {showLyrics ? 'Lyrics' : 'Lyrics'}
                                </Button>
                                <Button
                                    className={`${isViewQueue && 'border-[#3F7DC1] text-[#3F7DC1] hover:border-[#3F7DC1] active:border-[#3F7DC1]'}`}
                                    outline
                                    type="small"
                                    shadow={false}
                                    onClick={() => { setIsViewQueue(!isViewQueue); }}
                                >
                                    <QueueListIcon
                                        className={`w-4 h-4 ${isViewQueue ? "stroke-[#3F7DC1]" : ""}`}
                                        alt="queue"
                                    />
                                </Button>
                            </Flex>

                        </Flex>
                        {
                            isViewQueue ?
                                <QueueView />
                                :
                                <Flex className="mt-auto w-full items-center" flexDirection="column">
                                    <Flex className="w-[90%] max-w-md" flexDirection="column">
                                        {
                                            !showLyrics ? currSong ?
                                                <Box className={`${height > START_HEIGHT_PLAYER_PX ? 'mb-8 mt-12' : 'mb-4 mt-4'}`}>
                                                    <Flex className={`${height > START_HEIGHT_PLAYER_PX ? 'gap-y-12' : 'gap-y-6'}`} flexDirection="column">
                                                        <Flex className="w-full items-center justify-center" flexDirection="row">
                                                            <div className="image-box">
                                                                {currBook?.albumCoverUrl || currBook?.imageUrl ?
                                                                    <img
                                                                        src={currBook?.albumCoverUrl ?? currBook?.imageUrl ?? ""}
                                                                        alt="Song book cover"
                                                                        width="100%"
                                                                        className="cursor-default"
                                                                    // height="100%"
                                                                    /> :
                                                                    <Flex
                                                                        className="content-center justify-center min-h-full"
                                                                        flexDirection="column"
                                                                    >
                                                                        <Text as="p" fontSize="10px" className="text-center">
                                                                            {currBook?.bookFullName}
                                                                        </Text>
                                                                    </Flex>
                                                                }
                                                            </div>
                                                        </Flex>
                                                        <Box className="">
                                                            <Heading
                                                                as="h4"
                                                                fontSize="22px"
                                                                lineHeight="24px"
                                                                className="mb-2"
                                                            >
                                                                {currSong.name}
                                                            </Heading>
                                                            <HymnTag
                                                                hymnBook={currSong.hymn}
                                                                pageNumber={currSong.pageNumber}
                                                                hidePageNumber={true}
                                                                allowLink={false}
                                                            />
                                                            <Text as="span" className="pl-2" fontSize="14px" color="#666B72">
                                                                {"pg " + currSong.pageNumber}
                                                            </Text>
                                                        </Box>
                                                    </Flex>
                                                </Box>
                                                :
                                                <div className="mt-5">
                                                    {currSlug ?
                                                        <Text>
                                                            No Song for {currSlug}
                                                        </Text>
                                                        : <Text className="pl-2">Please pick a song</Text>
                                                    }
                                                </div>
                                                : null
                                        }
                                        {
                                            showLyrics && currSong &&
                                            <AudioPlayerLyrics currSong={currSong} />
                                        }
                                        <Flex className="gap-y-4 mt-auto" flexDirection="column">
                                            <ProgressBar
                                                className=""
                                                inputref={progressBarRef}
                                            />
                                            <Flex flexDirection="row" className="justify-between items-center gap-x-6">
                                                <ShuffleIcon
                                                    color={`${isShuffle ? '#44403c' : '#999'}`}
                                                    className="cursor-pointer w-6 h-6 mx-2 hover:stroke-[#6b6b6b]"
                                                    onClick={() => dispatch(toggleAudioPlayerShuffle({ currIsShuffle: isShuffle }))}
                                                />
                                                <AudioBackwardIcon className="w-10 cursor-pointer hover:fill-[#010101]" onClick={handlePrevClick} />
                                                {isPlaying ?
                                                    <PauseCircleIcon className="w-16 cursor-pointer hover:fill-[#010101]" onClick={handlePause} />
                                                    : <PlayCircleIcon className="w-16 cursor-pointer hover:fill-[#010101]" onClick={handlePlay} />
                                                }
                                                <AudioForwardIcon className="w-10 cursor-pointer hover:fill-[#010101]" onClick={handleNextClick} />
                                                <Repeat
                                                    color={`${isRepeat ? '#44403c' : '#999'}`}
                                                    className="cursor-pointer w-9 hover:stroke-[#6b6b6b]"
                                                    onClick={() => dispatch(toggleAudioPlayerRepeat({ currIsRepeat: isRepeat }))}
                                                />
                                            </Flex>
                                        </Flex>
                                    </Flex>
                                    {/* <AudioPlayer
                    autoPlay
                    src={getSongMp3WithContext(currSong) ?? ""}
                    showSkipControls
                    showJumpControls={false}
                    customVolumeControls={[]}
                    onEnded={e => handleNextClick()}
                    onClickNext={e => handleNextClick()}
                    onClickPrevious={e => handlePrevClick()}
                /> */}
                                </Flex>

                        }
                    </Flex>
                </Flex>
            </aside>
            <audio
                className="invisible"
                ref={audioRef}
                controls
                autoPlay={true}
                onLoadedMetadata={onLoadedMetadata}
            >
                <source
                    ref={source}
                    src={getSongMp3WithContext(currSong, allowPiano) ?? ""}
                />
            </audio>
            {
                !showPlayerUI &&
                <Box
                    className="w-full fixed bottom-0 left-0 right-0 z-40 bg-[#f9fafb] border-t h-14 cursor-pointer"
                    onClick={() => handleShowPlayerUI(true)}
                >
                    <Flex
                        className="global-player w-full justify-center"
                        flexDirection="row"
                    >
                        <Flex className={`px-4 py-1 w-full flex-row justify-between gap-x-2 sm:min-w-[576px] sm:min-w-[576px] max-w-lg`}>
                            {currSong ?
                                <Flex flexDirection="row" className="items-center gap-x-2">
                                    <img
                                        src={allBooks[currSong.hymn].albumCoverUrl ?? allBooks[currSong.hymn].imageUrl}
                                        className={`w-10 h-10 rounded`}
                                    />
                                    {/* <HymnTag
                                    hymnBook={currSong?.hymn}
                                    pageNumber={currSong?.pageNumber}
                                    fullName={false}
                                /> */}
                                    <Flex className="gap-y-2" flexDirection="column">
                                        <Text
                                            as="span"
                                            fontSize="13px"
                                            lineHeight="13px"
                                            fontWeight="500"
                                            className=" max-w-42"
                                        >
                                            {`${currSong?.name?.substring(0, Math.min(24, currSong?.name?.length)).trim()}${currSong.name?.length > 24 ? "..." : ""}`}
                                        </Text>
                                        <Text
                                            as="span"
                                            fontSize="12px"
                                            lineHeight="12px"
                                            fontWeight="400"
                                            className=" max-w-40"
                                        >
                                            {currSong?.hymn} {currSong.pageNumber}
                                        </Text>
                                    </Flex>
                                </Flex>
                                :
                                <Flex flexDirection="row" className="items-center gap-x-2">
                                    <Box className="w-10 h-10 bg-gray-300 rounded" />
                                    <Text
                                        as="span"
                                        fontSize="13px"
                                        lineHeight="13px"
                                    >
                                        No Song to play
                                    </Text>
                                </Flex>
                            }
                            <Flex flexDirection="row" className="items-center gap-x-2">
                                <AudioBackwardIcon className="w-7 cursor-pointer hover:fill-[#010101]" onClick={handlePrevClick} />
                                {isPlaying ?
                                    <PauseCircleIcon className="w-11 cursor-pointer hover:fill-[#010101]" onClick={handlePause} />
                                    : <PlayCircleIcon className="w-11 cursor-pointer hover:fill-[#010101]" onClick={handlePlay} />
                                }
                                <AudioForwardIcon className="w-7 cursor-pointer hover:fill-[#010101]" onClick={handleNextClick} />
                            </Flex>
                        </Flex>
                    </Flex>
                </Box>
            }

            <style jsx>{`
                .global-player {

                }
                .image-box {
                    height: ${height > START_HEIGHT_PLAYER_PX ? '240px' : '140px'};
                    width: ${height > START_HEIGHT_PLAYER_PX ? '240px' : '140px'};
                    min-width: 120px;
                    box-shadow: 0 0.5px 0.5px 0 rgba(0, 0, 0, 0.24);
                    overflow: hidden;
                    cursor: pointer;

                    border-radius: 4px;
                    border: ${currBook?.imageUrl != null
                    ? "none"
                    : "1px solid #eaeaea"};
                }
            
            `}</style>
        </Box >
    )
}

export default AudioPlayerComponent;
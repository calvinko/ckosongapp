import React, { useContext, useEffect, useState } from 'react';
import Head from "next/head";

import NavBar from "../components/NavBar";
import Placeholder from "../components/Placeholder";

import { X } from 'react-feather';
import { Box, Text, Link, Heading, Flex, Button, TextField } from "../components/base";
import toast, { Toaster } from "react-hot-toast";
import AudioPlayer from '../components/AudioPlayer';
import { AudioPlayerProvider, useAudioPlayerCtx } from '../lib/audio-player/AudioPlayerContext';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../lib/redux/store';
import SongMeta, { SongMetaWithContent } from '../ts/types/songMeta.interface';
import { useBooks, useSongs, useUserOrNoAccess } from '../lib/uiUtils';
import HymnBookMeta from '../ts/types/hymnBookMeta.interface';
import SongSearch from '../ts/types/songSearch.interface';
import { generateSongSearches } from '../lib/songs/generateSongSearch';
import { getOtherSongType, isInRegistrationWhitelist, isWhitelisted, SongType, userHasRole, userHasRoleOrAdmin, UserRole } from '../lib/constants';
import Fuse from 'fuse.js';
import { SongTypeContext } from '../components/SongTypeProvider';
import HymnTag from '../components/HymnTag';
import AudioPlayerPicker from '../components/audio-player/AudioPlayerPicker';
import { addToQueue, triggerNextSong } from '../lib/redux/actions';
import { filterSongsWithContext, getSongMp3WithContext } from '../lib/audio-player/playerLib';
import { AudioPlayerQueueItem } from '../ts/types/audioPlayerQueueItem.interface';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import UserInfo from '../ts/types/userInfo.interface';
import PianoIcon from "../components/icons/PianoIcon"
import QueueAddIcon from '../components/icons/QueueAddIcon';
import { useSWRConfig } from 'swr';

const REG_FUSE_OPTIONS = {
    includeScore: true,
    threshold: 0.4,
    keys: [
        "sanitizedName",
        "hymn",
        "pageNumber",
        "fullBookName",
        "bookAndPage",
        "fullBookAndPage",
        "name",
    ],
};


const AudioPage = ({ headers }) => {
    const { data: session, status } = useSession();
    const { user, noAccess, loading: loadingSession } = useUserOrNoAccess(session, status);
    const router = useRouter();
    const { mutate } = useSWRConfig();
    const [handledUser, setHandledUser] = useState(false);

    // useEffect(() => {
    //     const handleNewUser = async () => {
    //         if (user != null && !handledUser) {
    //             if (!userHasRole(user, UserRole.audioPlayer)) {
    //                 const userRoles = user.roles ?? []
    //                 const newUserRoles = userRoles.concat([UserRole.audioPlayer]);
    //                 const res = await fetch(`/api/users/roles?email=${user?.email}`, {
    //                     method: "PUT",
    //                     body: JSON.stringify({
    //                         roles: newUserRoles
    //                     }),
    //                 });
    //                 console.log("set user role", newUserRoles)
    //                 const json = await res.json();
    //                 // mutate in component
    //                 mutate("/api/users");
    //             }
    //             setHandledUser(true);
    //         }
    //     }
    //     handleNewUser();
    // }, [session, user])

    if (loadingSession) {
        return (
            <Box className="max-w-[95%] md:max-w-lg my-16 mx-4 md:mx-auto">
                <Head>
                    <title>Hymn Player</title>
                    <link rel="icon" href="/favicon.ico" />
                    <meta property="og:title" content={`404`} key="title" />
                </Head>
                <Placeholder fluid>
                    <Placeholder.Header>
                        <Placeholder.Line />
                        <Placeholder.Line />
                    </Placeholder.Header>
                    {[...Array(5)].map((e, index) => (
                        <Placeholder.Paragraph key={`placeholder-${index}`}>
                            <Placeholder.Line />
                            <Placeholder.Line />
                            <Placeholder.Line />
                            <Placeholder.Line />
                        </Placeholder.Paragraph>
                    ))}
                </Placeholder>
            </Box>
        );
    }

    // if (
    //     (!isInRegistrationWhitelist(country, city) && (status === "unauthenticated" || user == null || !userHasRoleOrAdmin(user, UserRole.useApp)))
    //     || userHasRole(user, UserRole.block)) {
    //     router.push("/access");
    //     return (<></>);
    // }

    if (status !== "authenticated") {
        return (
            <Flex
                className="min-h-screen	sm:p-0 my-8 sm:mx-2 px-4 sm:items-center"
                flexDirection="column"
            >
                <Head>
                    <title>Hymn Player</title>
                    <link rel="icon" href="/favicon.ico" />
                    <meta property="og:title" content={`404`} key="title" />
                </Head>
                <Flex className="flex-1" flexDirection="column">
                    <Toaster />
                    <Box className="max-w-xl md:min-w-[576px]">
                        <Heading as="h4" type="h4" className="mb-3">Sign In</Heading>
                        <Button
                            className="bg-blue-500"
                            onClick={() => signIn("google")}
                        >
                            Log in with Google
                        </Button>
                    </Box>
                </Flex>
            </Flex>
        )
    }

    return (
        <Flex
            className="min-h-screen	items-center sm:p-0 mt-8 mx-3 sm:mx-2 items-center"
            flexDirection="column"
        >
            <Head>
                <title>Hymn Player</title>
                <link rel="icon" href="/favicon.ico" />
                <meta property="og:title" content="Hymn Player" key="title" />
            </Head>
            <Toaster />
            <AudioPlayerProvider>
                <Flex className="w-full max-w-xl sm:min-w-[576px]" flexDirection="column">
                    <Box className="">
                        {!noAccess && <NavBar />}
                        {/* <SearchBar /> */}
                        <Heading as="h4" type="h4">
                            Audio Player
                        </Heading>
                        <AudioPageInCtx user={user} />
                    </Box>
                </Flex>
            </AudioPlayerProvider>
        </Flex>
    )
}

const AudioPageInCtx = ({ user }: { user: UserInfo | null }) => {
    const [searchVal, setSearchVal] = useState("");
    const dispatch = useDispatch();
    const router = useRouter();

    const { songType: songTypeCtxValue, changeSongType } = useContext(SongTypeContext);
    const currSlug: string = useSelector((state: RootState) => state?.audioPlayer.currSong);
    const isShuffle: boolean = useSelector((state: RootState) => state?.audioPlayer.isShuffle);
    const isRepeat: boolean = useSelector((state: RootState) => state?.audioPlayer.isRepeat);
    const shuffleBook: string = useSelector((state: RootState) => state?.audioPlayer.shuffleBook);
    const audioPlayerIndex: number = useSelector((state: RootState) => state?.audioPlayer.index);
    const queue: AudioPlayerQueueItem[] = useSelector((state: RootState) => state?.audioPlayer.queue, shallowEqual)
    const playedQueue: AudioPlayerQueueItem[] = useSelector((state: RootState) => state?.audioPlayer.playedQueue, shallowEqual)
    const { allowPiano, onlySongsWithAudio, setAllowPiano, setOnlySongsWithAudio } = useAudioPlayerCtx();

    useEffect(() => {
        router.beforePopState(({ as }) => {
            const currentPath = router.asPath;
            if (as !== currentPath) {
                // Will run when leaving the current page; on back/forward actions
                // Add your logic here, like toggling the modal state
                // for example           
                if (confirm("Are you sure?")) {
                    return true;
                }
                else {
                    window.history.pushState(null, "", currentPath);
                    return false;
                }
            }
            return true;
        });

        return () => {
            router.beforePopState(() => true);
        };
    }, [router]); // Add any state variables to dependencies array if needed.

    const allSongs: { [key: string]: SongMetaWithContent } = useSongs();
    const books: { [key: string]: HymnBookMeta } = useBooks();

    const currSong: SongMetaWithContent | null = currSlug != null ? allSongs[currSlug] : null;
    const songsWithAudio = filterSongsWithContext(Object.values(allSongs), books, allowPiano, true);

    const songSearches: SongSearch[] = generateSongSearches(songsWithAudio, books)

    const chineseSongs = songSearches.filter(
        (song) => song.songType == SongType.chinese
    );
    let englishSongs = songSearches.filter(
        (song) => song.songType == SongType.english
    );

    const chineseFuse = new Fuse(chineseSongs, REG_FUSE_OPTIONS);
    const englishFuse = new Fuse(englishSongs, REG_FUSE_OPTIONS);

    let results =
        songTypeCtxValue === SongType.english
            ? englishFuse.search(searchVal)
            : chineseFuse.search(searchVal);

    // limit # of results to 50 for faster ui
    results = results.slice(0, Math.min(results.length, 50));

    const handleSongPick = (song: SongMeta) => {
        dispatch(triggerNextSong({
            songsWithAudio, nextSongSlug: song?.slug, queue, playedQueue, currSong, isShuffle, isRepeat, shuffleBook: shuffleBook
        }))
    }

    const handleAddToQueue = (e: any, song: SongMeta) => {
        e.stopPropagation();
        dispatch(addToQueue({ songSlug: song.slug, queue, index: audioPlayerIndex }));
        toast.success("Added to queue", { duration: 600 });
    }

    return (
        <Box
            className="w-full flex-wrap"
        >
            <Box className='mt-4'>
                {
                    <Box>
                        <TextField
                            aria-label="Search Songs"
                            autoComplete=""
                            id="search-song-audio-input"
                            lines={1}
                            type="input"
                            inputClassName="leading-none"
                            placeholder="Search songs"
                            value={searchVal}
                            onChange={(e) => { setSearchVal(e?.target?.value ?? "") }}
                        >
                            <Flex className="ml-auto justify-end items-center">
                                <X className="w-7 h-7 cursor-pointer" color="#999" onClick={() => setSearchVal("")} />
                            </Flex>
                        </TextField>
                        <Flex className="my-2 items-center gap-x-1">
                            {userHasRoleOrAdmin(user, UserRole.readChineseSongs) && <Button
                                className={`${songTypeCtxValue == SongType.english ? '' : 'border-[#3F7DC1] text-[#3F7DC1] hover:border-[#3F7DC1]'}`}
                                type="small"
                                outline
                                shadow={false}
                                onClick={() => changeSongType(getOtherSongType(songTypeCtxValue))}
                            >
                                Chinese
                            </Button>}
                            <Button
                                className={`py-1.5 ${allowPiano && 'border-[#3F7DC1] text-[#3F7DC1] hover:border-[#3F7DC1]'}`}
                                type="small"
                                outline
                                shadow={false}
                                onClick={() => setAllowPiano(!allowPiano)}
                            >
                                <PianoIcon
                                    className={`w-3 ${allowPiano ? "fill-[#3F7DC1]" : ""}`}
                                />
                            </Button>
                            <Button
                                className={`${onlySongsWithAudio && 'border-[#3F7DC1] text-[#3F7DC1] hover:border-[#3F7DC1]'}`}
                                type="small"
                                outline
                                shadow={false}
                                onClick={() => setOnlySongsWithAudio(!onlySongsWithAudio)}
                            >
                                {onlySongsWithAudio ? "Songs with audio" : "Songs with audio"}
                            </Button>
                        </Flex>
                    </Box>

                    // <Button outline onClick={() => setShowSearch(!showSearch)}>
                    //     <Flex flexDirection="row" className='justify-center items-center'>
                    //         Search Songs <Search className="w-4 h-4 ml-2" />
                    //     </Flex>
                    // </Button>
                }
            </Box>
            <Box className="">
                {
                    results != null && searchVal ?
                        <Box className="">
                            {
                                results.map(songRes => (
                                    <Flex
                                        key={`song-result-audio-${songRes.item.bookAndPage}`}
                                        flexDirection="row"
                                        className={`items-center gap-x-4 mx-2 py-2 border-b ${!getSongMp3WithContext(songRes.item, allowPiano) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                        onClick={() => handleSongPick(songRes.item)}
                                    >
                                        <HymnTag
                                            hymnBook={songRes.item.hymn}
                                            fullName={false}
                                            pageNumber={songRes.item.pageNumber}
                                            allowLink={false}
                                        />
                                        <Text
                                            as="p"
                                            fontSize="14px"
                                            fontWeight={!getSongMp3WithContext(songRes.item, allowPiano) ? '300' : currSlug === songRes.item?.slug ? "500" : ''}
                                            color={!getSongMp3WithContext(songRes.item, allowPiano) ? '#B3B3B3' : currSlug === songRes.item?.slug ? "#3F7DC1" : ''}
                                        >
                                            <>
                                                {songRes.item.name}
                                                {(!songRes.item?.mp3 && (songRes.item?.instrumentalMp3 || songRes.item?.pianoMp3)) && (
                                                    <PianoIcon
                                                        className="w-3 inline ml-2"
                                                        alt="has music/audio"
                                                    />
                                                )}
                                            </>
                                        </Text>
                                        {getSongMp3WithContext(songRes.item, allowPiano) &&
                                            <div className="inline-block ml-auto">
                                                <div className="pl-3 pr-1">
                                                    <QueueAddIcon
                                                        onClick={e => { handleAddToQueue(e, songRes.item) }}
                                                        className={`inline queue-add w-6 hover:stroke-[#6b6b6b]`}
                                                    />
                                                </div>
                                            </div>
                                        }
                                    </Flex>
                                ))
                            }
                        </Box>
                        :
                        <AudioPlayerPicker />
                }
                <Box className='mt-6 w-full'>
                    <AudioPlayer />
                </Box>
            </Box>
        </Box >
    )
}

export default AudioPage;
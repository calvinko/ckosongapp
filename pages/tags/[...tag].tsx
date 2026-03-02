import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { useSession } from "next-auth/react";

import Placeholder from "../../components/Placeholder";
import { useSongs, useUserOrNoAccess } from "../../lib/uiUtils";
import SongMeta, { SongMetaWithContent } from "../../ts/types/songMeta.interface";
import { getAllTags, getSongsByTag } from "../../lib/songs/getSongsByTags"
import { Box, Flex, Heading, Text, Link } from "../../components/base";
import SearchBar from "../../components/SearchBar";
import NavBar from "../../components/NavBar";
import SongItem from "../../components/SongItem";
import HymnTag from "../../components/HymnTag";
import { useFavoritesByName } from "../../lib/favorites";
import { getSongPath } from "../../lib/songs/getSongPath";
import Favorite from "../../ts/types/favorite.interface";
import { UserRole, userHasRoleOrAdmin } from "../../lib/constants";
import { ChevronLeft } from "react-feather";
import MusicIcon from "../../components/icons/MusicIcon";

/**
 * Page to show songs by tag. This is shown as "Categories" to the user
 */
export const TagPage = (): JSX.Element => {
    const router = useRouter();
    const { query } = router;
    const { tag } = query

    const { data: session, status } = useSession();
    const { user, loading: loadingSession } = useUserOrNoAccess(session, status);

    const allSongs: { [key: string]: SongMetaWithContent } = useSongs();
    const favoritesBySlug = useFavoritesByName(session?.user?.email, status);

    const allTags = getAllTags(allSongs);
    const foundTag = allTags.find((t) => t == tag) as string;

    const songs = getSongsByTag(foundTag, allSongs)

    if (loadingSession) {
        return (
            <Box className="max-w-[95%] md:max-w-lg my-16 mx-3 md:mx-auto">
                <Head>
                    <title>Tag | {tag}</title>
                    <meta property="og:title" content={`Tag | ${tag}`} key="title" />
                </Head>
                <Placeholder fluid>
                    <Placeholder.Header>
                        <Placeholder.Line />
                    </Placeholder.Header>
                    {[...Array(10)].map((e, index) => (
                        <Placeholder.Paragraph key={`tags-${tag}-placeholder-${index}`}>
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


    // if no tag
    if (foundTag == undefined) {
        return (
            <Flex
                m="20% 0"
                className="items-center justify-center w-full h-10"
                flexDirection="row"
            >
                <Box width="320px">
                    <Text as="p" fontSize="16px">
                        Sorry, the category {tag as string} doesn't exist. 😕
                    </Text>
                    <Link onClick={() => router.back()}>Go back</Link>
                </Box>
            </Flex>
        )
    }

    const onBackClick = (e) => {
        router.push("/tags");
    };

    const handleSongClick = (song: SongMeta) => {
        router.push(getSongPath(song))
    }

    return (
        <Flex
            className="flex-wrap w-screen min-h-screen"
            flexDirection="column"
        >
            <Head>
                <title>Category | {tag}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Flex className="box-border flex-1 w-screen sm:max-w-xl sm:min-w-[576px] sm:mx-auto px-3 py-8 sm:px-0 w-full" flexDirection="column">
                <Box className="">
                    <NavBar />
                    <SearchBar />
                    <Box className="mt-8">
                        <Link className="cursor-pointer" lineHeight="0" onClick={onBackClick}>
                            <>
                                <ChevronLeft className="inline arrow-icon" />
                                All Categories
                            </>
                        </Link>
                        <Heading as="h4" type="h4" className="mb-2 mt-3">
                            Category - {foundTag}
                        </Heading>
                        <Box>
                            {
                                songs.map((song, i) => (
                                    <TagSongItem song={song} favoritesBySlug={favoritesBySlug} handleClick={handleSongClick} />
                                ))
                            }
                        </Box>
                    </Box>
                </Box>
            </Flex>
        </Flex>
    )
};

const TagSongItem = (
    { song, favoritesBySlug, handleClick }:
        { song: SongMeta, favoritesBySlug: { [key: string]: Favorite }, handleClick: Function }
) => {
    return (
        <SongItem key={song?.slug} song={song} handleClick={() => handleClick(song)}>
            <Flex className="pl-0.5 pr-2 items-center" flexDirection="row">
                <HymnTag
                    pageNumber={song.pageNumber}
                    hymnBook={song.hymn}
                    fullName={false}
                    allowLink={false}
                />
                <Text className="pl-2" fontSize="16px">
                    {song.name}
                    {(song?.mp3 || song?.instrumentalMp3 || song?.pianoMp3) && (
                        <MusicIcon
                            className="pl-2 pb-0.5 h-3 inline"
                        />
                    )}
                    {favoritesBySlug[song?.slug] && (
                        <img src="/star-filled.svg" className="song-icon inline" alt="is favorited" />
                    )}
                </Text>
            </Flex>
            <style jsx>{`
                .song-icon {
                    padding-left: 8px;
                    padding-bottom: 3px;
                    height: 14px;
                }
            `}</style>
        </SongItem>
    )
}

export default TagPage;
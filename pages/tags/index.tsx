import Head from "next/head";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";

import Placeholder from "../../components/Placeholder";
import { useSongs, useUserOrNoAccess } from "../../lib/uiUtils";
import { SongMetaWithContent } from "../../ts/types/songMeta.interface";
import { getAllTags } from "../../lib/songs/getSongsByTags"
import { SongType, UserRole, userHasRoleOrAdmin } from "../../lib/constants";
import { Box, Flex, Heading, Text, Link } from "../../components/base";
import SearchBar from "../../components/SearchBar";
import NavBar from "../../components/NavBar";
import { SongTypeContext } from "../../components/SongTypeProvider";
import { userCanSeeBilingual } from "../../lib/users/role";
import ToggleButton from "../../components/ToggleButton";

const ENGLISH_SORTED_TAGS = [
    "God and His Love",
    "Abba, Father",
    "Father's Name",
    "Father and the Lord",
    "Father, Son, and Holy Spirit",
    "The Lord",
    "Beloved Lord",
    "The Holy Spirit",
    "Love Journey of the Lord",
    "Father Sent the Lord to Come",
    "The Lord Came From Heaven to Earth",
    "The Lord Died on the Cross",
    "The Lord's Resurrection",
    "The Lord's Ascension",
    "Forever United with the Lord",
    "The Lord's Return",
    "Millennium and Brilliant Eternity",
    "Draw Close to God and Experience Him",
    "Fruit of the Cross. Glorious Salvation",
    "Salvation of the Cross, Spirit Set Free",
    "Victoriously Overcome Satan. Spirit Set Free",
    "Glorious Commission",
    "Our Love Response",
    "Cowork with the Lord, Finish His Commission",
    "Walk on the Everlasting Way",
    "Our Journey Following the Lord",
    "God's Family",
    "Revival and Renewal",
    "Hope in the Lord's Coming",
    "Hymn from Scriptures"
]

// TODO: make it the same as english ones
const CHINESE_SORTED_TAGS = [
    "神和祂的愛",
    "阿爸，父",
    "父與主",
    "主",
    "聖靈",
    "主愛歷程",
    "父差主來",
    "主降世",
    "主釘十架",
    "主復活",
    "主升天",
    "主與我永聯合",
    "主再來",
    "千禧年國與燦爛永恆",
    "親近經歷神",
    "十架果效，榮耀救贖",
    "勝過仇敵，心靈釋放",
    "榮耀託付",
    "我們的回應",
    "征途詩歌",
    "神的家",
    "復興與更新",
    "經文詩歌",
    "父、子、聖靈",
    "父的名",
    "父和主",
    "愛主",
    "聖靈",
    "主的愛路",
    "十架救恩、心靈釋放",
    "回應",
    "同走永生的道路",
    "主再來的盼望",
    "與主同工，完成託付",
    "征途詩歌",
    "經文詩歌"
]

/**
 * Page to show list of tags. This is shown as "Categories" to the user
 */
export const TagsListPage = (): JSX.Element => {
    const router = useRouter();

    const { data: session, status } = useSession();
    const { user, loading: loadingSession } = useUserOrNoAccess(session, status);
    const { songType, changeSongType: toggleSongType } = useContext(SongTypeContext);

    if (loadingSession) {
        return (
            <Box className="max-w-[95%] md:max-w-lg my-16 mx-3 md:mx-auto">
                <Head>
                    <title>Tags</title>
                    <meta property="og:title" content={`Tags`} key="title" />
                </Head>
                <Placeholder fluid>
                    <Placeholder.Header>
                        <Placeholder.Line />
                    </Placeholder.Header>
                    {[...Array(10)].map((e, index) => (
                        <Placeholder.Paragraph key={`tags-placeholder-${index}`}>
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


    const allSongs: { [key: string]: SongMetaWithContent } = useSongs();
    const allTags = getAllTags(allSongs, songType);

    let tagsToShow: string[] = []
    if (songType == SongType.english) {
        tagsToShow = [...ENGLISH_SORTED_TAGS, ...allTags.filter((tag) => !ENGLISH_SORTED_TAGS.includes(tag))]
    }
    else {
        tagsToShow = [...CHINESE_SORTED_TAGS, ...allTags.filter((tag) => !CHINESE_SORTED_TAGS.includes(tag))]
    }

    const handleTagClick = (tag: string) => {
        router.push(`/tags/${tag}`);
    }

    return (
        <Flex
            className="flex-wrap w-screen min-h-screen"
            flexDirection="column"
        >
            <Head>
                <title>Categories</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Flex className="box-border flex-1 w-screen sm:max-w-xl sm:min-w-[576px] sm:mx-auto px-3 my-8 sm:px-0 w-full" flexDirection="column">
                <Box className="">
                    <NavBar />
                    <SearchBar />
                    <Box className="mt-8">
                        <Heading as="h4" type="h4" className="mb-2">
                            Categories
                        </Heading>
                        {
                            <Flex flexDirection="row">
                                <div className="notice-card mb-4 mt-2">
                                    <Flex className="p-4" flexDirection="col">
                                        <img src="/info.svg" width="16px" height="16px" flex={1} />
                                        <Text as="p" fontSize="14px" color="#8B9199" className="ml-4">
                                            Categories are groups of songs. English ones are translated from the chinese collection books.
                                        </Text>
                                    </Flex>
                                </div>
                            </Flex>
                        }
                        {
                            userCanSeeBilingual(user) &&
                            <Box width="120px">
                                <ToggleButton
                                    name1={SongType.english}
                                    option1="English"
                                    name2={SongType.chinese}
                                    option2="Chinese"
                                    active={songType}
                                    toggleActive={toggleSongType}
                                />
                            </Box>
                        }
                        <Box className="mt-3">
                            {tagsToShow.map((tag, i) => (
                                <div className="item" onClick={() => handleTagClick(tag)}>
                                    {tag}
                                </div>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Flex>
            <style jsx>{`
                .item {
                    width: 100%;
                    padding: 8px 4px;
                    border-bottom: 1px solid #eaeaea;
                    cursor: pointer;
                }
                .item:hover {
                    background: ${"#b4d8fa"};
                    border-radius: 4px;
                }
            `}</style>
        </Flex >
    )
}

export default TagsListPage;
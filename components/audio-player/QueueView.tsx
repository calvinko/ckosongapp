import React from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useBooks, useSongs } from "../../lib/uiUtils";
import { AudioPlayerQueueItem } from "../../ts/types/audioPlayerQueueItem.interface"
import { SongMetaWithContent } from "../../ts/types/songMeta.interface"
import { Text, Heading, Flex, Box } from "../base"
import { RootState } from "../../lib/redux/store";
import HymnTag from "../HymnTag";
import { getSongMp3WithContext } from "../../lib/audio-player/playerLib";
import HymnBookMeta from "../../ts/types/hymnBookMeta.interface";
import { X } from "react-feather";

const QueueView = () => {

    const dispatch = useDispatch();

    const allSongs: { [key: string]: SongMetaWithContent } = useSongs();
    const allBooks = useBooks();
    const currSlug: string = useSelector((state: RootState) => state?.audioPlayer.currSong);
    const queue: AudioPlayerQueueItem[] = useSelector((state: RootState) => state?.audioPlayer.queue, shallowEqual)
    const playedQueue: AudioPlayerQueueItem[] = useSelector((state: RootState) => state?.audioPlayer.playedQueue, shallowEqual)

    const currSong: SongMetaWithContent | null = currSlug != null ? allSongs[currSlug] : null;
    const currBook: HymnBookMeta | null = currSong != null ? allBooks[currSong.hymn] : null;

    return (
        <div>
            <div className="max-h-[400px] overflow-y-scroll mb-5">
                <Flex flexDirection="column" className="items-center justify-center">
                    <Heading
                        as="h4"
                        type="h4"
                        fontSize="16px"
                        className=""
                    >
                        Queue
                    </Heading>
                </Flex>
                {currSong &&
                    <Box className="px-4 mb-3">
                        <Heading
                            as="h4"
                            type="h4"
                            fontSize="14px"
                        >
                            Now Playing
                        </Heading>
                        <Flex flexDirection="row" className="items-center gap-x-2 mt-3">
                            <img
                                src={allBooks[currSong.hymn].albumCoverUrl ?? allBooks[currSong.hymn].imageUrl}
                                className="w-10 h-10 rounded"
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
                                    {`${currSong?.name?.substring(0, Math.min(40, currSong?.name?.length)).trim()}${currSong.name?.length > 40 ? "..." : ""}`}
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
                    </Box>
                }
                <Heading
                    as="h4"
                    type="h4"
                    fontSize="14px"
                    className="px-4"
                >
                    Next
                </Heading>
                <Box className="px-4">
                    {
                        queue.map((item) => (
                            <div
                                className={`song-item cursor-not-allowed`}
                                key={`queue-${item?.slug}`}
                            >
                                <Flex
                                    flexDirection="row"
                                    className="items-center gap-2"
                                >
                                    <div className="">
                                        <HymnTag
                                            hymnBook={allSongs[item.slug].hymn}
                                            pageNumber={allSongs[item.slug].pageNumber}
                                            allowLink={false}
                                            fullName={false}
                                        />
                                    </div>
                                    <Text
                                        fontSize="14px"
                                        color={getSongMp3WithContext(allSongs[item.slug], true) ? "" : "#B3B3B3"}
                                    >
                                        {allSongs[item.slug].name}
                                    </Text>
                                    {getSongMp3WithContext(allSongs[item.slug], true) &&
                                        <div className="inline-block ml-auto">
                                            <div className="px-4">
                                                {/* <X
                                                color="#999"
                                                onClick={e => handleAddToQueue(e, song)}
                                                className="inline queue-add"
                                            /> */}
                                            </div>
                                        </div>
                                    }
                                </Flex>
                            </div>
                        ))
                    }
                    {queue.length == 0 &&
                        <div className="my-5">
                            <Text className="text-center">No Queue Items</Text>
                        </div>
                    }
                </Box>
            </div>
            <style jsx>{`
                .song-item {
                    width: 100%;
                    padding: 8px 0;
                    border-bottom: 1px solid #eaeaea;
                }
            `}</style>
        </div >
    )
}

export default QueueView
import React from "react"
import { SongMetaWithContent } from "../../ts/types/songMeta.interface"
import { Heading, Text, Flex, Box } from "../base"
import { getHymnBook } from "../../lib/constants"

/**
 * Component that displays Audio Player Lyrics if asked for
 */
const AudioPlayerLyrics = ({ currSong }: { currSong: SongMetaWithContent | null }) => {
    return (
        <Flex
            className="items-center justify-center mt-2 mb-10"
            flexDirection="column"
        >
            {
                currSong != null ?
                    <>
                        <Heading
                            as="p"
                            fontSize="16px"
                            lineHeight="16px"
                        >
                            {currSong?.name}
                        </Heading>
                        <Text
                            fontSize="12px"
                            color="#999"
                            className="pt-1 pb-4"
                        >
                            {getHymnBook(currSong?.hymn)} pg {currSong?.pageNumber}
                        </Text>
                        <Box className="px-1 w-full max-h-80 min-h-80 overflow-y-scroll lyric-box">
                            <pre className="pre-body text-wrap">
                                <Text as="p" className="pb-14" fontSize="16px">
                                    {currSong?.content?.trim()}
                                </Text>
                            </pre>
                        </Box>
                    </>
                    : <Text>No Song</Text>
            }
            <style jsx>{`
                .lyric-box {
                    box-shadow: inset 40px 40px 40px 40px #DBA632;
                }
            `}</style>
        </Flex>
    )
}

export default AudioPlayerLyrics;
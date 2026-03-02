import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import Fuse from "fuse.js";
import range from "lodash/range";
import { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";

import { Box, Heading, Link, TextField, Text, Button, Flex } from "../../../components/base";
import NavBar from "../../../components/NavBar";
import SearchBar from "../../../components/SearchBar";
import { useUser } from "../../../lib/uiUtils";
import UserInfo from "../../../ts/types/userInfo.interface";
import Placeholder from "../../../components/Placeholder";
import { UserRole, userHasRoleOrAdmin } from "../../../lib/constants";
import { ChevronLeft, ChevronRight } from "react-feather";

const episodeList = require("../../../scripts/treasures_for_the_soul/data/episodes.json")
const reversedEpisodeList = episodeList.reverse();

const EPISODE_SEARCH_FUSE_OPTIONS = {
  includeScore: true,
  threshold: 0.3,
  keys: [
    "title"
  ],
};

/**
 * Page for Bible notes, separate from the main app
 */
const TreasuresForTheSoulPage = () => {
  const router = useRouter()
  const { query } = router;
  const { data: session, status } = useSession();
  const loadingSession = status == "loading";

  const [episodeId, setEpisodeId] = useState(query.episodeId as string || "-1");
  const [page, setPage] = useState(0);
  const [episodeSearchText, setEpisodeSearchText] = useState("");

  const email: string | null | undefined = session?.user?.email;
  const user: UserInfo | null = useUser(email, status);

  const episodeById = {}
  for (let episode of episodeList) {
    episodeById[episode.id] = episode
  }

  useEffect(() => {
    setEpisodeId(router.query.episodeId as string || "-1")
  }, [router.query.episodeId])

  /**
   * Go back to the previous page
   */
  const onBackClick = () => {
    router.back();
  }

  if (loadingSession) {
    return (
      <Box className="max-w-[95%] md:max-w-lg my-16 mx-4 md:mx-auto">
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

  if (!userHasRoleOrAdmin(user, UserRole.readTFTS)) {
    return (
      <Flex
        m="20% 0"
        className="items-center justify-center w-full h-10"
        flexDirection="row"
      >
        <Box width="320px">
          <Text as="p">Sorry, not available. 😕</Text>
          <Link href="/" underline>Go back home</Link>
        </Box>
      </Flex>
    )
  }

  const goToEpisodeList = (e) => {
    e.preventDefault();
    router.push(`/profile/treasures-for-the-soul`, undefined, { shallow: true })
  }

  const onEpisodeSearchChange = (e) => {
    setEpisodeSearchText(e.target.value);
    setPage(0);
  }

  const goToEpisode = (e, pageNum) => {
    e.preventDefault();
    router.push(`/profile/treasures-for-the-soul/?episodeId=EP${pageNum}`, undefined, { shallow: true })
  }

  let episodesToShow = reversedEpisodeList
  // ?.sort((a, b) => {
  //   // reverse
  //   if (parseInt(a.number) < parseInt(b.number)) {
  //     return 1;
  //   }
  //   if (parseInt(a.number) > parseInt(b.number)) {
  //     return -1;
  //   }
  //   return 0;
  // });
  const episodeSearchFuse = new Fuse(episodesToShow, EPISODE_SEARCH_FUSE_OPTIONS);
  if (episodeSearchText) {
    episodesToShow = episodeSearchFuse.search(episodeSearchText).map((res) => res.item);
  }

  let chunkedEpisodesToShow = [];
  for (let i = 0; i < episodesToShow.length; i += 40) {
    let chunk = episodesToShow.slice(i, i + 40)
    chunk = chunk.reverse()
    chunkedEpisodesToShow.push(chunk);
  }

  const currEpisode = episodeById != "-1" ? episodeById[episodeId] : null;

  const nextEp = currEpisode != null ? Number(currEpisode.number) < episodeList.length ? Number(currEpisode?.number) + 1 : null : null
  const prevEp = currEpisode != null ? Number(currEpisode.number) > 0 ? Number(currEpisode?.number) - 1 : null : null

  const episodes_in_page = chunkedEpisodesToShow[page]

  return (
    <Flex
      className="min-h-screen	items-center sm:p-0 my-8 mx-3 sm:mx-2"
      flexDirection="column"
    >
      <Head>
        <title>心靈珍寶</title>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={`心靈珍寶`} key="title" />
      </Head>
      <Flex className="max-w-lg sm:min-w-[576px]" flexDirection="column">
        <Toaster />
        <Box className="">
          <NavBar />
          <SearchBar />
          <div className="mt-6 w-full">
            {
              currEpisode == null ?
                <Link className="cursor-pointer" lineHeight="0" onClick={onBackClick}>
                  <>
                    <ChevronLeft className="inline arrow-icon" />
                    Back
                  </>
                </Link>
                :
                <Link className="cursor-pointer" lineHeight="0" onClick={goToEpisodeList}>
                  <>
                    <ChevronLeft className="inline arrow-icon" />
                    All Episodes
                  </>
                </Link>
            }
            <Flex className="w-full mt-4">
              <Flex className="flex-1 w-1/2 flex-col">
                {prevEp != null ? (
                  <Box
                    className="text-sm cursor-pointer overflow-hidden"
                    onClick={(e) => {
                      goToEpisode(e, prevEp)
                      window.scrollTo(0, 0);
                    }}
                  >
                    <Link
                    >
                      <ChevronLeft
                        className="arrow-icon inline"
                      />
                      Prev
                    </Link>
                  </Box>
                ) : (
                  <></>
                )}
              </Flex>
              <Flex
                className="flex-1 w-1/2 pr-2 sm:pr-0 justify-end mr-0"
              >
                {nextEp && (
                  <Flex
                    className="text-sm cursor-pointer overflow-hidden flex-col"
                    onClick={(e) => {
                      goToEpisode(e, nextEp);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <Link
                      className="ml-auto"
                    >
                      Next
                      <ChevronRight
                        className="arrow-icon inline"
                      />
                    </Link>
                  </Flex>
                )}
              </Flex>
            </Flex>
            <Heading as="h3" type="h3" className="mb-1">
              {currEpisode == null ? "心靈珍寶" : `${currEpisode?.title}`}
            </Heading>
          </div>
          {currEpisode == null &&
            <div className="mt-4 pb-2 w-full md:max-w-[376px]">
              <TextField
                aria-label="Search episode by number or name"
                autoComplete=""
                id="search-episodes-input"
                lines={1}
                type="input"
                inputClassName="leading-none"
                placeholder="Search Episode by number or name"
                value={episodeSearchText}
                onChange={(e) => { onEpisodeSearchChange(e) }}
              />
            </div>
          }
          <Flex className="w-full mb-1 mt-2 flex-wrap">
            {
              currEpisode == null ?
                <>
                  <div className="mt-1 w-full">
                    <div className="flex flex-col-reverse w-full">
                      {Number(page) < chunkedEpisodesToShow.length ?
                        episodes_in_page.map((episode) => (
                          <div
                            className="item hover:bg-gray-100 hover:rounded-md"
                            onClick={(e) => {
                              router.push(`/profile/treasures-for-the-soul/?episodeId=${episode.id}`, undefined, { shallow: true })
                              window.scrollTo(0, 0);
                            }}>
                            <span className="text-[#155DA1] pl-2">{episode.title}</span>
                          </div>
                        )) :
                        Number(page) == 0 ?
                          <Text>No Results</Text>
                          :
                          <Text>Invalid Page</Text>
                      }
                    </div>
                    <div className="mt-7 pt-2 w-full flex flex-row flex-wrap">
                      {
                        range(0, chunkedEpisodesToShow.length).map((num) =>
                          <div className={`text-[12px] border rounded-md mx-1 my-1 p-2 cursor-pointer ${num == Number(page) ? 'bg-gray-200' : ''}`} onClick={(e) => setPage(num)}>
                            {num + 1}
                          </div>
                        )
                      }
                    </div>
                  </div>
                </>
                :
                <>
                  <div className="pb-2 w-full">
                    <div className="">
                      <div className="flex flex-col">
                        <Link
                          className="mb-3"
                          fontSize="14px"
                          href={currEpisode.cogLink}
                        >
                          Church of God Link
                        </Link>
                        <Heading color="#46a0df" as="h3" type="h3" fontSize="30px" fontWeight="600" className="pb-3 pt-2">引言</Heading>
                        <Text fontSize="16px" className="mb-4" lineHeight="1.5" color="#373737">{currEpisode?.introText}</Text>

                        <Heading color="#46a0df" as="h3" type="h3" fontSize="30px" fontWeight="600" className="pb-3 pt-2">信息</Heading>
                        <iframe src={currEpisode?.episodeLink} frameBorder="0" scrolling="no" height={102} className="mb-8 w-full" />
                        {currEpisode?.content.map((line) => (
                          <Text fontSize="16px" className="mb-4" lineHeight="1.5" color="#373737">{line}</Text>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Flex className="flex-1 w-1/2 flex-col">
                    {prevEp != null ? (
                      <Box
                        className="text-xs cursor-pointer overflow-hidden"
                        onClick={(e) => {
                          goToEpisode(e, prevEp)
                          window.scrollTo(0, 0);
                        }}
                      >
                        <Link
                        >
                          <ChevronLeft
                            className="arrow-icon inline"
                          />
                          Prev
                        </Link>
                        <Text color="#155DA1" fontSize="12px" className="pl-1 whitespace-nowrap overflow-hidden text-ellipsis">{episodeById[`EP${prevEp}`]?.title}</Text>
                      </Box>
                    ) : (
                      <></>
                    )}
                  </Flex>
                  <Flex
                    className="flex-1 w-1/2 pr-2 sm:pr-0 justify-end"
                  >
                    {nextEp && (
                      <Flex
                        className="text-xs cursor-pointer overflow-hidden flex-col"
                        onClick={(e) => {
                          goToEpisode(e, nextEp);
                          window.scrollTo(0, 0);
                        }}
                      >
                        <Link
                          fontSize="12px"
                          className="ml-auto"
                        >
                          Next
                          <ChevronRight
                            className="arrow-icon inline"
                          />
                        </Link>
                        <Text color="#155DA1" fontSize="12px" className="float-right whitespace-nowrap overflow-hidden text-ellipsis">{episodeById[`EP${nextEp}`]?.title}</Text>
                      </Flex>
                    )}
                  </Flex>
                </>
            }
          </Flex>
        </Box>
        <Flex className="flex-wrap">
          <Box className="h-8	mb-4 w-full"></Box>
        </Flex>
      </Flex>
      <style jsx>{`
          .pagination-btn {
            height: 20px;
            width: 20px;
            border: 1px solid #eaeaea;
          }
          .item {
            width: 100%;
            padding: 8px 0;
            border-bottom: 1px solid #eaeaea;
            cursor: pointer;
          }
      `}</style>
    </Flex >
  )
}

export default TreasuresForTheSoulPage;
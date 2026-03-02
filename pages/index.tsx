import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";

import AiQuestion from "../components/AiQuestion"
import SearchBar from "../components/SearchBar";
import HymnNavigator from "../components/HymnNavigator";
import NavBar from "../components/NavBar";
import { useSongs, useUserOrNoAccess } from "../lib/uiUtils";
import { Box, Flex, Heading, Link } from "../components/base";
import { useSession } from "next-auth/react";
import Placeholder from "../components/Placeholder";
import { getServerSideProps } from "../lib/gateServerSideProps"
import SongMeta from "../ts/types/songMeta.interface";
import { userHasRole, userHasRoleOrAdmin, UserRole } from "../lib/constants";

// for server side props
// export { getServerSideProps };

/**
 * Home page with search bar and song navigation
 */
export const Home = (): JSX.Element => {
  const router = useRouter();
  const songs: { [key: string]: SongMeta } = useSongs();
  const { data: session, status } = useSession();
  const { user, noAccess, loading } = useUserOrNoAccess(session, status)

  if (loading) {
    return (
      <Box className="max-w-[95%] md:max-w-lg my-16 mx-3 md:mx-auto">
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

  if (user == null || noAccess) {
    router.push("/signIn");
    return;
  }

  return (
    <Flex
      className="min-h-screen	items-center sm:p-0 my-8 mx-3 sm:mx-2 items-center"
      flexDirection="column"
    >
      <Head>
        <title>Hymns</title>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Hymns" key="title" />
        <meta property="og:description" content="Hymns" />
      </Head>
      <Toaster />
      <Flex className="flex-1" flexDirection="column">
        <Box className="max-w-xl sm:min-w-[576px]">
          <NavBar />
          <SearchBar />
          <HymnNavigator songs={songs} />
          <Box className="mt-8 mb-4 pt-4 border-t border-[#e1e4e8]">
            <Heading as="h4" type="h4" className="mb-2">
              Quick Links
            </Heading>
            <Box className="mt-5">
              <Box className="border-t border-slate-100 py-3 pl-3">
                <Link href="/tags" fontSize="14px" underline>
                  Song Categories
                </Link>
              </Box>
              <Box className="border-y border-slate-100 py-3 pl-3">
                <Link href="/audio" fontSize="14px" underline>
                  Audio Player
                </Link>
              </Box>
              {userHasRole(user, UserRole.songNotes) &&
                <div className="border-t border-slate-100 py-3 pl-3">
                  <Link href="/profile/notes" fontSize="14px" underline>Song Notes</Link>
                </div>
              }
            </Box>
          </Box>
          {
            userHasRoleOrAdmin(user, UserRole.aiAccess) && (
              <Box className="mt-8 mb-4 pt-4 border-t border-[#e1e4e8]">
                <Flex
                  flexDirection="row"
                  className="pl-0.5 items-center content-center	w-full mb-2 gap-2"
                >
                  <Heading as="h4" type="h4" className="">
                    Ask AI
                  </Heading>
                  <div className="px-1 h-content rounded bg-orange-400 text-white text-[12px]">
                    Beta
                  </div>
                </Flex>
                <AiQuestion />
              </Box>
            )
          }
        </Box>
      </Flex>
    </Flex>
  );
};

export default Home;

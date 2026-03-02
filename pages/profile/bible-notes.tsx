import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";

import { Box, Heading, Link, TextField, Text, Button, Flex } from "../../components/base";
import NavBar from "../../components/NavBar";
import SearchBar from "../../components/SearchBar";
import { useUser } from "../../lib/uiUtils";
import { loadVerse } from "../../lib/bible/esvApi";
import UserInfo from "../../ts/types/userInfo.interface";
import Placeholder from "../../components/Placeholder";
import { UserRole, userHasRoleOrAdmin } from "../../lib/constants";
import { ChevronLeft } from "react-feather";

/**
 * Page for Bible notes, separate from the main app
 */
const BibleNotesPage = () => {
  const router = useRouter()
  const { data: session, status } = useSession();
  const loadingSession = status == "loading";

  const [verseSearchVal, setVerseSearchVal] = useState("");
  const [verseText, setVerseText] = useState<string[]>([]);
  const [canonicalVerse, setCanonicalVerse] = useState("");
  const [loadingVerse, setLoadingVerse] = useState(false);

  const email: string | null | undefined = session?.user?.email;
  const user: UserInfo | null = useUser(email, status);

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

  if (!userHasRoleOrAdmin(user, UserRole.bibleNotes)) {
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

  const searchVerse = async () => {
    setLoadingVerse(true);
    const [canonicalVerseVal, verseTextVal] = await loadVerse(verseSearchVal);
    setLoadingVerse(false);
    setCanonicalVerse(canonicalVerseVal)
    setVerseText(verseTextVal)
  }

  const fullVerseText = `"${verseText.map(x => x.trim().replace(/(^\s*(?!.+)\n+)|(\n+\s+(?!.+)$)/g, '')).join("...")}" ${canonicalVerse}`

  return (
    <Flex
      className="min-h-screen	items-center sm:p-0 my-8 mx-3 sm:mx-2 items-center"
      flexDirection="column"
    >
      <Head>
        <title>Bible Notes</title>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={`Song Notes`} key="title" />
      </Head>
      <Flex className="flex-1" flexDirection="column">
        <Toaster />
        <Box className="max-w-lg md:min-w-[576px]">
          <NavBar />
          <SearchBar />
          <div className="mt-6">
            <Link className="cursor-pointer" lineHeight="0" onClick={onBackClick}>
              <>
                <ChevronLeft className="inline arrow-icon" />
                Back
              </>
            </Link>
            <Heading as="h3" type="h3" className="mt-1 mb-1">
              Notes
            </Heading>
          </div>
          <Flex className="mt-2 mb-2 w-full items-center justify-center" flexDirection="row">
            <Box className="flex-1">
              <TextField
                aria-label="Search Bible verse "
                autoComplete=""
                id="search-bible-input"
                lines={1}
                type="input"
                inputClassName="leading-none"
                placeholder="Search bible verse"
                value={verseSearchVal}
                onChange={(e) => { setVerseSearchVal(e?.target?.value ?? "") }}
                onKeyDown={(e) => {
                  if (e?.key === 'Enter') {
                    searchVerse()
                  }
                }}
              />
            </Box>
            <Box>
              <Button type="medium" onClick={searchVerse} className="ml-2">
                Find
              </Button>
            </Box>
          </Flex>
          {
            loadingVerse &&
            <div className="mt-3 pt-4">
              <Placeholder fluid>
                {[...Array(3)].map((e, index) => (
                  <Placeholder.Paragraph key={`loading-placeholder-${index}`}>
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                  </Placeholder.Paragraph>
                ))}
              </Placeholder>
            </div>
          }
          {
            !loadingVerse && canonicalVerse &&
            <div className="mt-1">
              <div className="flex flex-col-reverse w-full">
                <div className="flex flex-row-reverse my-2 items-center">
                  <Button type="small" outline shadow={false} className="float-right" onClick={() => { navigator.clipboard.writeText(fullVerseText) }}>
                    Copy
                  </Button>
                </div>
              </div>
              <div className="border-l-2 pl-3 border-rose-700">
                <Text fontSize="16px">
                  "{verseText.map(x => x.trim()).join("...")}" {canonicalVerse}
                </Text>
              </div>
            </div>
          }
        </Box>
      </Flex>
    </Flex >
  )

}

export default BibleNotesPage;
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { useSession } from "next-auth/react";

import { Box, Text, Link, Flex } from "../../components/base";
import Placeholder from "../../components/Placeholder";
import { getHymnBook, HymnBook } from "../../lib/constants";
import HymnBookContents from "../../components/HymnBookContents";
import SearchBar from "../../components/SearchBar";
import NavBar from "../../components/NavBar";
import { useSongs, useUserOrNoAccess } from "../../lib/uiUtils";
import getSongsByBook from "../../lib/songs/getSongsByBook";
import SongMeta from "../../ts/types/songMeta.interface";

/**
 * Invalid Book Error jsx
 */
const InvalidError = ({ bookName }): JSX.Element => (
  <Flex
    m="20% 0"
    className="items-center justify-center w-full h-10"
    flexDirection="row"
  >
    <Box width="320px">
      <Text as="p" fontSize="16px">
        Sorry, Hymn Book `{bookName}` doesn't exist or is not supported. 😕
      </Text>
      <Link href="/">Go back home</Link>
    </Box>
  </Flex>
);

/**
 * Book Content Page. Shows the songs in a Hymn Book
 *
 * @param props
 */
export const BookContentPage = (): JSX.Element => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { noAccess, loading } = useUserOrNoAccess(session, status);
  const { query } = router;
  const { bookName } = query;

  const songs = useSongs();

  // if data is null, which maybe because it isn't fetched, we return a placeholder
  if (loading) {
    return (
      <Box className="max-w-[95%] md:max-w-lg my-16 mx-3 md:mx-auto">
        <Head>
          <title>{bookName}</title>
          <meta property="og:title" content={`${bookName}`} key="title" />
          <meta property="og:description" content={`Hymn Book ${bookName}`} key="description" />
        </Head>
        <Placeholder fluid>
          <Placeholder.Header>
            <Placeholder.Line />
          </Placeholder.Header>
          {[...Array(10)].map((e, index) => (
            <Placeholder.Paragraph key={`bookName-placeholder-${index}`}>
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

  // we return error page if book name query is invalid or there is an error to the api
  if (
    (bookName as string) == null ||
    !Object.keys(HymnBook).includes(bookName as string)
  ) {
    return <InvalidError bookName={bookName} />;
  }

  const songsByBook: { [key: string]: SongMeta[] } | null = getSongsByBook(
    songs
  );

  // if api returns invalid data, we return error
  if (!((bookName as string) in songsByBook)) {
    return <InvalidError bookName={bookName} />;
  }

  if (noAccess) {
    router.push("/signIn");
    return (<></>);
  }

  // when we click back and we should go back to the list of books
  const onBackClick = (e) => {
    router.push("/");
  };

  return (
    <Flex
      className="min-h-screen	items-center sm:p-0 my-8 mx-3 sm:mx-auto"
      flexDirection="column"
    >
      <Head>
        <title>
          {bookName} - {getHymnBook(bookName as string)}
        </title>
        <meta
          property="og:title"
          content={`${bookName} - ${getHymnBook(bookName as string)}`}
          key="title"
        />
        <meta property="og:description" content={`Hymn Book ${bookName}`} key="description" />
      </Head>
      <Box
        className="flex-1 md:mx-auto max-w-xl w-full"
      >
        <NavBar />
        <SearchBar />
        <Box className="my-6 mx-0 content-start">
          <HymnBookContents
            songs={songsByBook[bookName as string]}
            hymnBook={bookName}
            onBackClick={onBackClick}
          />
        </Box>
      </Box>
    </Flex>
  );
};

export default BookContentPage;

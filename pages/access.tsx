import React from 'react';
import Head from "next/head";
import { useSession } from "next-auth/react";
import { Toaster } from "react-hot-toast";

import { Flex, Box, Text } from "../components/base";

const Access = () => {

  const { data: session, status } = useSession();

  return (
    <Flex
      className="min-h-screen	sm:p-0 my-8 sm:mx-2 px-4 sm:items-center"
      flexDirection="column"
    >
      <Head>
        <title>4</title>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={`4`} key="title" />
      </Head>
      <Flex className="flex-1" flexDirection="column">
        <Toaster />
        <Box className="max-w-lg md:min-w-[576px]">
          <Flex
            m="20% 0"
            className="items-center justify-center w-full h-10"
            flexDirection="row"
          >
            <Box width="320px">
              <Text fontWeight={500}>404 | Page not found</Text>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  )

}

export default Access;
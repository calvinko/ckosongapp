import React, { useEffect } from "react"
import Head from "next/head";
import { useRouter } from "next/router"
import { signIn, signOut, useSession } from "next-auth/react"
import { Toaster, toast } from "react-hot-toast"
import { useDispatch } from "react-redux";

import { loadUserInfo, removeUser } from "../lib/redux/actions";
import { useUserOrNoAccess } from "../lib/uiUtils";
import { isInKilledPlace, isWhitelisted, userHasRole, userHasRoleOrAdmin, UserRole } from "../lib/constants"
import Placeholder from "../components/Placeholder";
import { Box, Heading, Flex, Link, Text, Button } from "../components/base"
import SearchBar from "../components/SearchBar";
import NavBar from "../components/NavBar";

import Feedback from "../components/Feedback";
import { isValidEmail } from "../lib/favorites";
import { ChevronLeft } from "react-feather";


export const getServerSideProps = async ({ req, res, query }) => {
  return {
    props: {
      query,
    }
  }
}

/**
 * Sign in page to gate access to the app
 */
const SignInPage = ({ query: { country, city } }) => {
  const router = useRouter();
  const { query } = router
  const { data: session, status } = useSession();
  const { user, noAccess, loading } = useUserOrNoAccess(session, status);
  const { error } = query;
  const dispatch = useDispatch();
  let is404 = error != null;

  const handleLogOutAction = () => {
    signOut();
    dispatch(removeUser());
  };

  const email = session?.user?.email;

  // reload the user info if the email is valid
  // or it changes (from null -> existing email -> sign out (null))
  useEffect(() => {
    if (isValidEmail(email)) {
      dispatch(loadUserInfo(email as string, false))
    }
  }, [email])

  if (loading) {
    return (
      <Box className="max-w-[95%] md:max-w-lg my-16 mx-4 md:mx-auto">
        <Placeholder fluid>
          <Placeholder.Header>
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Header>
          {[...Array(5)].map((e, index) => (
            <Placeholder.Paragraph key={`placeholder - ${index} `}>
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

  if ((userHasRole(user, UserRole.useApp) || user?.status != null) && !userHasRole(user, UserRole.paid)) {
    router.push("/register")
    return (<></>)
  }

  // if country/city not whitelisted, redirect to access page
  // or blocked
  if (
    (!isWhitelisted(country, city) && (status === "unauthenticated" || user == null || !(userHasRoleOrAdmin(user, UserRole.useApp) || userHasRoleOrAdmin(user, UserRole.paid))))
    || userHasRole(user, UserRole.block)) {
    router.push("/access");
    return (<></>);
  }

  return (
    <Flex
      className="min-h-screen	sm:p-0 my-8 sm:mx-2 px-4 sm:items-center"
      flexDirection="column"
    >
      <Head>
        <title>404</title>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={`404`} key="title" />
      </Head>
      <Flex className="flex-1" flexDirection="column">
        <Toaster />
        <Box className="max-w-lg md:min-w-[576px]">
          {
            user && noAccess || is404 || (isInKilledPlace(country, city) && !(userHasRoleOrAdmin(user, UserRole.useApp) || userHasRoleOrAdmin(user, UserRole.paid))) ?
              <Box>
                <div className="flex flex-row-reverse">
                  <Feedback buttonText="I need help" placeholder="Let us know what you need help with and we will get back to you shortly" />
                </div>
                <Flex
                  m="20% 0"
                  className="items-center justify-center w-full h-10"
                  flexDirection="column"
                >

                  {userHasRole(user, UserRole.useApp) && !userHasRole(user, UserRole.paid) && <Link>Please register again</Link>}
                  <Box width="320px">
                    {isInKilledPlace(country, city) ?
                      <Text fontWeight={500}>404 | Page not found</Text>
                      :
                      <Text fontWeight={500} className="pb-2">
                        Unavailable.
                      </Text>
                    }
                    {
                      (user && !is404) && (
                        <Link
                          underline
                          onClick={handleLogOutAction}
                          className="cursor-pointer"
                        >
                          Log out
                        </Link>
                      )
                    }
                  </Box>
                </Flex>
              </Box>
              :
              <div>
                {
                  userHasRoleOrAdmin(user, UserRole.paid) || userHasRoleOrAdmin(user, UserRole.useApp) ?
                    <>
                      <NavBar />
                      <SearchBar />
                    </> :
                    user ?
                      <div className="flex flex-row-reverse">
                        <Feedback />
                      </div> : <></>
                }
                <Flex className="mt-4" flexDirection="column">
                  {(userHasRoleOrAdmin(user, UserRole.paid) || userHasRoleOrAdmin(user, UserRole.useApp)) &&
                    <Link className="cursor-pointer mb-2 mt-4" lineHeight="0" onClick={() => router.back()}>
                      <>
                        <ChevronLeft className="inline arrow-icon" />
                        Back
                      </>
                    </Link>}
                  <Heading as="h4" type="h4" className="mb-3">Sign In</Heading>
                  {
                    user ?
                      <div>
                        <Text className="mb-1">You are signed in and have access to the app.</Text>
                        <div className="pt-1 pb-3">
                          <Link className="cursor-pointer" href="/" underline>
                            Click here to go home
                          </Link>
                        </div>
                        <div className="mt-12">
                          <Button
                            onClick={handleLogOutAction}
                            className="cursor-pointer bg-rose-500	"
                          >
                            Log out
                          </Button>
                        </div>
                      </div>
                      :
                      (
                        <div>
                          <Button
                            className="bg-blue-500"
                            onClick={() => signIn("google")}
                          >
                            Log in with Google
                          </Button>
                        </div>
                      )
                  }
                </Flex>
              </div>
          }
        </Box >
      </Flex >
      <style jsx>{`
          .card-notice {
            border: 1px solid #ebeef2;
            border-radius: 6px;
          }
          .currency-pill {
            border-radius: 6px;
            background-color: #64748b;
            padding: 0px 4px;
            display: inline-flex;
            vertical-align: middle;
            align-items: center;
            height: 20px;
            white-space: nowrap;
          }
          .red-card-notice {
            border: 1px solid rgb(252 165 165);
            background-color: rgb(254 226 226);
            border-radius: 6px;
          }
        `}</style>
    </Flex >
  )
}

export default SignInPage;

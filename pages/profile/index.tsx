import React, { useEffect, useState } from "react";

import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";

import NavBar from "../../components/NavBar";
import SearchBar from "../../components/SearchBar";
import Placeholder from "../../components/Placeholder";
import AdminBox from "../../components/AdminBox";
import { Text, Link, Box, Flex } from "../../components/base";
import DeviceControls from "../../components/DeviceControls";

import { useTokenUser, useUserOrNoAccess } from "../../lib/uiUtils";
import { loadUserInfo, removeUser, updateTokenValue } from "../../lib/redux/actions";

import { validateToken } from "../../lib/tokens/uiToken";
import TokenUser from "../../ts/types/tokenUser.interface";
import { userHasRole, userHasRoleOrAdmin, UserRole } from "../../lib/constants";
import { isValidEmail } from "../../lib/favorites";

/**
 * Profile page for the user
 */
const Profile = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  const { query } = router;
  const { installToken, debug } = query;
  const isDebug = (debug != null && debug === "true") ?? false;
  const tokenVal = installToken ? installToken as string : null;
  const tokenUser: TokenUser = useTokenUser();

  const email: string | null | undefined = session?.user?.email;
  const { user, noAccess, loading } = useUserOrNoAccess(session, status);


  // manage the special query param of installToken
  // this is a simple way to install the token by sharing a link
  useEffect(() => {
    async function asyncValidateToken() {
      if (!tokenVal) {
        return;
      }
      const validToken = await validateToken(tokenVal);
      if (validToken) {
        dispatch(updateTokenValue(tokenVal));
        toast.success("Successfully added token!");
      }
    }
    asyncValidateToken()
  }, [tokenVal])

  // reload the user info if the email is valid
  // or it changes (from null -> existing email -> sign out (null))
  useEffect(() => {
    if (isValidEmail(email)) {
      dispatch(loadUserInfo(email as string, false))
    }
  }, [email])

  // if loading and user doesn't exist yet
  // if not loading (even if user exists or not), we should continue
  if (loading) {
    return (
      <Box className="max-w-[95%] md:max-w-lg my-16 mx-3 md:mx-auto">
        <Head>
          <title>Profile</title>
          <meta property="og:title" content={`Profile`} key="title" />
        </Head>
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
            </Placeholder.Paragraph>
          ))}
        </Placeholder>
      </Box>
    );
  }

  if (noAccess) {
    router.push("/signIn");
    return (<></>);
  }

  /**
   * Handle the logging out action, which also includes removing the user from redux
   */
  const handleLogOutAction = () => {
    signOut();
    dispatch(removeUser());
    router.push("/signIn");
  };

  return (
    <Flex
      className="min-h-screen	items-center sm:p-0 my-8 mx-3 sm:mx-2"
      flexDirection="column"
    >
      <Head>
        <title>Profile</title>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={`Profile`} key="title" />
      </Head>
      <Flex flexDirection="column">
        <Toaster />
        <Box className="max-w-lg sm:min-w-[576px]">
          <NavBar />
          <SearchBar />
          <Flex className="mt-8 pt-1" flexDirection="column">
            {/* {!user ? <div className="card-notice mb-8">
              <Box className="p-4">
                <Text as="p" fontSize="14px" color="#8B9199">
                  Sign in with your Google account 🎉! You can sync favorite
                  songs across multiple devices!
                </Text>
              </Box>
            </div> : null} */}
            {session?.user && status == "authenticated" ? (
              <>
                <Flex flexDirection="row" style={{ fontSize: "10px", lineHeight: "1" }}>
                  <img
                    src={session?.user?.image ?? ""}
                    alt="profile picture"
                    className="profile-img"
                  />
                  <Flex className="pl-2 items-center">
                    <Text as="p" fontWeight="600" fontSize="18px">
                      {session?.user?.name}
                    </Text>
                  </Flex>
                </Flex>
                <Flex flexDirection="row" className="pb-3">
                  <Flex flexDirection="row" className="mt-5">
                    <img src="/mail.svg" width="20px" alt="email icon" />
                    <Text
                      as="p"
                      color="#8B9199"
                      fontSize="14px"
                      className="pl-1.5"
                    >
                      {email}
                    </Text>
                  </Flex>
                </Flex>
                {
                  <div className="">
                    {/* <Heading as="h4" type="h4" fontSize="18px">
                      Links
                    </Heading> */}
                    <div className="w-full">
                      {userHasRole(user, UserRole.songNotes) &&
                        <div className="border-t border-slate-100 py-3 pl-3">
                          <Link href="/profile/notes" fontSize="14px" underline>Song Notes</Link>
                        </div>
                      }
                      {
                        <div className="border-b border-t border-slate-100 py-3 pl-3">
                          <Link href="/tags" fontSize="14px" underline>Song Categories</Link>
                        </div>
                      }
                      {
                        userHasRoleOrAdmin(user, UserRole.vanTeam) &&
                        <div className="border-b border-t border-slate-100 py-3 pl-3">
                          <Link href="/van-team/manage-users" fontSize="14px" underline>Vancouver Team Manage Users</Link>
                        </div>
                      }
                      {
                        userHasRoleOrAdmin(user, UserRole.bibleNotes) &&
                        <div className="border-b border-t border-slate-100 py-3 pl-3">
                          <Link href="/profile/bible-notes" fontSize="14px" underline>Bible Notes</Link>
                        </div>
                      }
                      {
                        userHasRoleOrAdmin(user, UserRole.readTFTS) &&
                        <div className="border-b border-t border-slate-100 py-3 pl-3">
                          <Link href="/profile/treasures-for-the-soul" fontSize="14px" underline>Treasures for the Soul</Link>
                        </div>
                      }
                      {
                        <div className="border-b border-t border-slate-100 py-3 pl-3">
                          <Link href="/audio" fontSize="14px" underline>Audio Player</Link>
                        </div>
                      }
                    </div>
                  </div>
                }
                <div className="pt-3">
                  {userHasRole(user, UserRole.vanTeam) &&
                    <div className="flex flex-row items-center">
                      <CheckmarkIcon /> <Text className="pl-2">Vancouver Admin Team</Text>
                    </div>
                  }
                  {userHasRole(user, UserRole.readEnglishSongs) &&
                    <div className="flex flex-row items-center">
                      <CheckmarkIcon /> <Text className="pl-2">English Hymnals</Text>
                    </div>
                  }
                  {userHasRole(user, UserRole.readChineseSongs) &&
                    <div className="flex flex-row items-center">
                      <CheckmarkIcon /> <Text className="pl-2">Chinese Hymnals</Text>
                    </div>
                  }
                  {userHasRole(user, UserRole.paid) &&
                    <div className="flex flex-row items-center">
                      <CheckmarkIcon /> <Text className="pl-2">Donated</Text>
                    </div>
                  }
                  {userHasRole(user, UserRole.readSongSheet) &&
                    <div className="flex flex-row items-center">
                      <CheckmarkIcon /> <Text className="pl-2">View Song Sheets</Text>
                    </div>
                  }
                  {userHasRole(user, UserRole.songNotes) &&
                    <div className="flex flex-row items-center">
                      <CheckmarkIcon /> <Text className="pl-2">Song Notes</Text>
                    </div>
                  }
                  {
                    <div className="flex flex-row items-center">
                      <CheckmarkIcon /> <Text className="pl-2">Similar Melody Songs</Text>
                    </div>
                  }
                  {
                    <div className="flex flex-row items-center">
                      <CheckmarkIcon /> <Text className="pl-2">Song Categories</Text>
                    </div>
                  }
                  {userHasRole(user, UserRole.readRelatedSong) &&
                    <div className="flex flex-row items-center">
                      <CheckmarkIcon /> <Text className="pl-2">See Related Songs</Text>
                    </div>
                  }
                  {userHasRole(user, UserRole.musicTeam) &&
                    <div className="flex flex-row items-center">
                      <CheckmarkIcon /> <Text className="pl-2">Music Team</Text>
                    </div>
                  }
                  {userHasRole(user, UserRole.bibleNotes) &&
                    <div className="flex flex-row items-center">
                      <CheckmarkIcon /> <Text className="pl-2">Bible Notes</Text>
                    </div>
                  }
                </div>
              </>
            ) : (
              status === "loading" ?
                <Placeholder fluid>
                  <Placeholder.Header>
                    <Placeholder.Line />
                    <Placeholder.Line />
                  </Placeholder.Header>
                  {[...Array(4)].map((e, index) => (
                    <Placeholder.Paragraph key={`placeholder-${index}`}>
                      <Placeholder.Line />
                      <Placeholder.Line />
                    </Placeholder.Paragraph>
                  ))}
                </Placeholder>
                :
                <Flex className="w-full h-10" flexDirection="column">
                  <Box>
                    <Link
                      underline
                      className="cursor-pointer"
                      onClick={() => signIn("google")}
                    >
                      Log in or create account with Google
                    </Link>
                  </Box>
                  <DeviceControls
                    user={user}
                    isDebug={isDebug}
                    session={session}
                  />
                </Flex>
            )
            }
            <DeviceControls
              isDebug={isDebug}
              user={user}
              session={session}
            />
            {user?.isAdmin && <AdminBox toast={toast} />}
            <Flex flexDirection="row">
              <Box className="mt-14">
                <Link
                  underline
                  onClick={handleLogOutAction}
                  className="cursor-pointer"
                >
                  Log out
                </Link>
              </Box>
            </Flex>
          </Flex>
        </Box>
      </Flex >
      <style jsx>
        {`
          .card-notice {
            width: 90%;
            border: 1px solid #ebeef2;
            border-radius: 6px;
          }
        `}
      </style>
    </Flex >
  );
};

export const CheckmarkIcon = (
  { props, height = "16", width = "16" }:
    { props?: any, height?: string, width?: string }
) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={width}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#16a34a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="feather feather-check-circle"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  )

}

export default Profile;

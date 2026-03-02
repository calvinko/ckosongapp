import Fuse from "fuse.js";
import { useSession } from "next-auth/react";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import useSWR, { mutate } from "swr";

import { Heading, Text, Button, Link, TextField, Box, Flex } from "../../components/base";
import GenericModal from "../../components/GenericModal";
import NavBar from "../../components/NavBar";
import Placeholder from "../../components/Placeholder";
import { HymnBook, userHasRole, userHasRoleOrAdmin, UserRole, UserStatus } from "../../lib/constants";
import { fetcherWithShortMaxAge } from "../../lib/fetcher";
import { useUser } from "../../lib/uiUtils";
import UserInfo from "../../ts/types/userInfo.interface";
import { useRouter } from "next/router";

// UserInfo type search
const USER_SEARCH_FUSE_OPTIONS = {
  includeScore: true,
  threshold: 0.1,
  keys: [
    "name",
    "email",
    "location",
  ],
};

/**
 * Managing Users for Vancouver team
 */
const VanTeamUsersPage = () => {
  const router = useRouter();
  const { pathname, query } = router
  const { data: session, status } = useSession();
  const { userEmail } = query;
  const email = session?.user?.email;
  const user: UserInfo | null = useUser(email, status);
  const loadingSession = status == "loading";

  const [searchUserVal, setSearchUserVal] = useState("");
  const [locationTextVal, setLocationTextVal] = useState("");
  const [grantCurrUser, setGrantCurrUser] = useState<UserInfo | null>(null);
  const [grantUserModalOpen, setGrantUserModalOpen] = useState(false);
  const [revokeUserModalOpen, setRevokeUserModalOpen] = useState(false);
  const { data: users, error } = useSWR(`/api/users`, fetcherWithShortMaxAge);

  const validUsers: UserInfo[] = users?.length > 0 ? users?.filter((user) => !userHasRole(user, UserRole.hideFromTeam)) : []

  const userFromQuery = validUsers?.find((u) => u.email === userEmail);
  useEffect(() => {
    if (userEmail && userFromQuery) {
      setGrantCurrUser(userFromQuery);
      setGrantUserModalOpen(true);
    }
  }, [userEmail, userFromQuery])

  let usersToShow: UserInfo[] = validUsers;

  const userSearchFuse = new Fuse(validUsers, USER_SEARCH_FUSE_OPTIONS);

  if (searchUserVal) {
    usersToShow = userSearchFuse.search(searchUserVal).map((res) => res.item);
  }

  usersToShow = usersToShow
    ?.sort((a, b) => -1 * a?.name?.localeCompare(b?.name ?? ""))
    ?.sort((a, b) => userHasRole(b, UserRole.paid) ? 1 : -1)
    // add sort where if user is pending approval then show on top
    ?.sort((a, b) => {
      const aPending = a?.status === UserStatus.pendingApproval;
      const bPending = b?.status === UserStatus.pendingApproval;

      if (aPending && !bPending) {
        return -1;
      }
      else if (!aPending && bPending) {
        return 1;
      }
      else {
        return 0;
      }
    });

  const setBookAccess = async (HymnBook: HymnBook, grant: boolean) => {
    const currRoles: UserRole[] = grantCurrUser?.roles ?? [];
    // only HC3 for now
    if (grant) {
      const newUserRoles = currRoles?.includes(UserRole.readHC3) ? currRoles : [...currRoles, UserRole.readHC3];
      const res = await fetch(`/api/users/roles?email=${grantCurrUser?.email}`, {
        method: "PUT",
        body: JSON.stringify({
          roles: newUserRoles
        }),
      });

      if (res.status >= 400) {
        console.error("Error granting user HC3 access. " + res?.text);
        toast.error("Error granting user HC3 access.");
        return;
      }

      toast.success(`Granted HC3 access for ${grantCurrUser?.name}`);
      mutate("/api/users");
      setLocationTextVal("");
      setGrantUserModalOpen(false);
      return;
    }
    else {
      const newUserRoles = currRoles.filter((r) => r != UserRole.readHC3);
      const res = await fetch(`/api/users/roles?email=${grantCurrUser?.email}`, {
        method: "PUT",
        body: JSON.stringify({
          roles: newUserRoles
        }),
      });

      if (res.status >= 400) {
        console.error("Error revoking user HC3 access. " + res?.text);
        toast.error("Error revoking user HC3 access.");
        return;
      }

      toast.success(`Revoked HC3 access for ${grantCurrUser?.name}`);
      mutate("/api/users");
      setLocationTextVal("");
      setGrantUserModalOpen(false);
      return;
    }

  }

  /**
   * Set the Song Sheet Read Access
   * 
   * @param grant true if granting access, false if revoking access
   */
  const setReadAccess = async (grant: boolean) => {
    if (!grantCurrUser) {
      toast.error("No user selected.");
      return;
    }

    const currRoles: UserRole[] = grantCurrUser?.roles ?? [];
    if (grant) {
      const hasLocation = grantCurrUser?.location != null && grantCurrUser?.location?.length > 0;

      if (!locationTextVal && !hasLocation) {
        toast.error("Cannot grant without location.")
        return;
      }

      const newUserRoles = currRoles?.includes(UserRole.paid) ? currRoles : [...currRoles, UserRole.paid, UserRole.readEnglishSongs, UserRole.readSongSheet];
      const res = await fetch(`/api/users/roles?email=${grantCurrUser?.email}`, {
        method: "PUT",
        body: JSON.stringify({
          roles: newUserRoles
        }),
      });

      if (res.status >= 400) {
        console.error("Error granting user read access. " + res?.text);
        toast.error("Error granting user read access.");
        return;
      }

      // if user doesn't have location then we add location
      if (grantCurrUser?.location == null || grantCurrUser?.location?.length <= 0) {
        await fetch(`/api/users?email=${grantCurrUser?.email}`, {
          method: "PUT",
          body: JSON.stringify({
            location: locationTextVal
          }),
        });
      }

      toast.success(`Granted for ${grantCurrUser?.name}`);
      mutate("/api/users");
      setLocationTextVal("");
      setGrantUserModalOpen(false);
      return;
    }

    // revoke
    const newUserRoles = currRoles.filter((r) => r != UserRole.readSongSheet && r != UserRole.paid && r != UserRole.readEnglishSongs);
    const res = await fetch(`/api/users/roles?email=${grantCurrUser?.email}`, {
      method: "PUT",
      body: JSON.stringify({
        roles: newUserRoles
      }),
    });

    if (res.status >= 400) {
      console.error("Error revoking user read access. " + res?.text);
      toast.error("Error granting user read access.");
      return;
    }

    toast.success(`Revoked ${grantCurrUser?.name}`);
    mutate("/api/users");
    setRevokeUserModalOpen(false);
  }

  const setStatus = async (status: UserStatus) => {
    if (!grantCurrUser) {
      toast.error("No user selected.");
      return;
    }

    const res = await fetch(`/api/users?email=${grantCurrUser?.email}`, {
      method: "PUT",
      body: JSON.stringify({
        status
      }),
    });

    if (res?.status >= 400) {
      console.error("Error setting user status. " + res?.text);
      toast.error("Error setting user status.");
      return;
    }

    mutate("/api/users");
    toast.success(`Set status to ${status} for ${grantCurrUser?.name}`);
    setRevokeUserModalOpen(false);
    setGrantUserModalOpen(false);
  }

  /**
   * Open Grant or Revoke Modal for User
   * 
   * @param userForModal  user to open modal for
   */
  const openModalForUser = (userForModal: UserInfo) => {
    setGrantCurrUser(userForModal);
    if (userHasRole(userForModal, UserRole.paid)) {
      setRevokeUserModalOpen(true);
    }
    else {
      setGrantUserModalOpen(true);
    }
  }

  if (loadingSession) {
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

  const hasAccess = userHasRoleOrAdmin(user, UserRole.vanTeam);
  if (!user || !hasAccess) {
    return (
      <Flex
        m="20% 0"
        flexDirection="row"
        className="items-center justify-center w-full h-10"
      >
        <Box width="320px">
          <Text as="p">Sorry, not available. 😕</Text>
          <Link href="/">Go back home</Link>
        </Box>
      </Flex>
    )
  }

  return (
    <Flex
      className="min-h-screen	items-center sm:p-0 my-8 mx-3 sm:mx-2"
      flexDirection="column"
    >
      <Head>
        <title>Manage users</title>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={`Profile`} key="title" />
      </Head>
      <Toaster />
      <GrantAccessModal
        isOpen={grantUserModalOpen}
        closeModal={() => {
          setGrantUserModalOpen(false);
          if (userEmail) {
            delete query["userEmail"];
            router.replace({ pathname, query }, undefined, { shallow: true });
          }
        }}
        user={grantCurrUser}
        locationTextVal={locationTextVal}
        setReadAccess={setReadAccess}
        setStatus={setStatus}
        setLocationTextVal={setLocationTextVal}
        setBookAccess={setBookAccess}
      />
      <RevokeUserModal
        isOpen={revokeUserModalOpen}
        closeModal={() => {
          setRevokeUserModalOpen(false);
          if (userEmail) {
            delete query["userEmail"];
            router.replace({ pathname, query }, undefined, { shallow: true });
          }
        }}
        user={grantCurrUser}
        setReadAccess={setReadAccess}
        setBookAccess={setBookAccess}
      />
      <Box
        className="max-w-lg sm:min-w-[576px]"
      >
        <NavBar />
        <Heading as="h4" type="h4" className="mb-2">
          Manage Users
        </Heading>
        <div className="notice-card mb-8">
          <Box className="p-4">
            <Text as="p" fontSize="14px" color="#8B9199">
              This is used to manage all users to grant/revoke access.
            </Text>

            <div>
              <Text as="p" color="#8B9199">Colors:</Text>
              <div className="mt-2 ml-4 text-white bg-cyan-700 w-fit px-2 py-1 rounded-md text-sm">
                Users have access to app.
              </div>
              <div className="mt-2 ml-4 text-white bg-green-700 w-fit px-2 py-1 rounded-md text-sm">
                Users don't have access to app.
              </div>
            </div>
          </Box>
        </div>
        {
          users == null ?
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
            :
            <div>
              <div className="mb-4">
                <div className="flex flex-row">
                  <div>
                    <p className="text-sm	font-medium">
                      <span className="text-sm text-gray-500">TOTAL:</span> {validUsers?.length ?? "Unknown"}
                    </p>
                  </div>
                  <div className="pl-2">
                    <p className="text-sm	font-medium">
                      <span className="text-sm text-gray-500">USE APP:</span> {validUsers?.filter(u => userHasRole(u, UserRole.paid))?.length ?? "Unknown"}
                    </p>
                  </div>
                  <div className="pl-2">
                    <p className="text-sm	font-medium">
                      <span className="text-sm text-gray-500">SONG SHEET:</span> {validUsers?.filter(u => userHasRole(u, UserRole.readSongSheet))?.length ?? "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pb-2">
                <TextField
                  aria-label="Search user by name/email"
                  autoComplete=""
                  id="search-user-input"
                  lines={1}
                  type="input"
                  inputClassName="leading-none"
                  placeholder="Search by name/email/location"
                  value={searchUserVal}
                  onChange={(e) => { setSearchUserVal(e?.target?.value ?? "") }}
                />
              </div>
              <Flex className="flex-wrap">
                <Flex flexDirection="column" className="w-full">
                  {usersToShow &&
                    usersToShow?.map((user) => (
                      <div key={user?.email} className="item">
                        <Flex
                          flexDirection="row"
                          className="pl-0.5 items-center content-center"
                        >
                          <Text as="span" fontSize="12px" className="">
                            {user?.name} <Text as="span" fontSize="12px" color="#8B9199">({user?.email})</Text>
                          </Text>
                          <div className="ml-auto right-box flex flex-row items-center">
                            <Text
                              color="#8B9199"
                              fontSize="12px"
                              className="pr-2 ml-auto"
                              lineHeight="1"
                            >
                              {user?.location}
                            </Text>
                            {
                              userHasRole(user, UserRole.paid) ?
                                <Button
                                  type="small"
                                  className={`ml-auto bg-cyan-700 rounded-md px-2 py-1`}
                                  onClick={() => openModalForUser(user)}
                                >
                                  Edit
                                </Button>
                                :
                                <Button
                                  type="small"
                                  className={`ml-auto rounded-md px-2 py-1 bg-green-700`}
                                  onClick={() => openModalForUser(user)}
                                >
                                  Edit
                                </Button>
                            }
                          </div>
                        </Flex>
                      </div>
                    ))}
                </Flex>
              </Flex>
            </div>
        }
      </Box>
      <style jsx>{`
      .item {
        padding: 4px 0;
        border-bottom: 1px solid #eaeaea;
        width: 100%;
      }
      .right-box {
        text-align: right;
        min-width: 140px;
        width: 140px;
      }
      `}</style>
    </Flex >
  )
}

/**
 * Modal to Grant User Access to song sheets. Should be similar to the Revoke User Access Modal
 */
const GrantAccessModal = ({
  isOpen,
  closeModal,
  setReadAccess,
  setStatus,
  user,
  locationTextVal,
  setLocationTextVal,
  setBookAccess
}: {
  isOpen: boolean;
  closeModal: () => void;
  setStatus: (status: UserStatus) => void;
  setReadAccess: (grant: boolean) => void;
  user: UserInfo | null;
  locationTextVal: string;
  setLocationTextVal: (val: string) => void;
  setBookAccess: (HymnBook: HymnBook, grant: boolean) => void;
}) => {

  const hasLocation = user?.location?.length > 0 ?? false;

  const status = user?.status

  return (
    <GenericModal
      modalIsOpen={isOpen}
      closeModal={closeModal}
      title={<>App Access ({user?.name})</>}
      className="top-14"
    >
      <div className="flex mt-3 w-full">
        <div className="flex flex-col w-full">
          <Text lineHeight="1.25" fontSize="12px" className="mt-1">
            Email: {user?.email}
          </Text>
          <Text lineHeight="1.25" fontSize="12px" className="mt-1">
            Location: {user?.location ?? "Unknown"}
          </Text>
          <Text lineHeight="1.25" fontSize="12px" className="mt-1">
            Registration Status: {user?.status ?? "Unknown"}
          </Text>
          {/* <Text className="mt-3">Enter City</Text>
          <TextField
            ariaLabel="Enter Location"
            autoComplete=""
            id="location-input"
            lines={1}
            type="input"
            placeholder={hasLocation ? user?.location : "Enter your city (e.g. San Jose or Vancouver)"}
            value={locationTextVal}
            disabled={hasLocation}
            onChange={(e) => { setLocationTextVal(e?.target?.value ?? "") }}
          />
          <Text color="#8B9199" lineHeight="1.25" fontSize="12px" className="mt-1">
            {
              !hasLocation ?
                "You must provide a city this brother/sister is in to grant them app access."
                :
                "Brother/Sister is already linked to a city. Contact me if you want to change."
            }
          </Text> */}
          <div className="mt-3">
            <Text fontWeight={800} className="">Registration Approval:</Text>
            <Text color="#8B9199" fontSize="12px" className=" mb-2">This is Step 1. User needs to be approved in order to continue</Text>
            <Button
              className=""
              onClick={() => setStatus(UserStatus.approved)}
              disabled={status != null && status !== UserStatus.pendingApproval}
              shadow={status != null && status !== UserStatus.pendingApproval}
            >
              Approve Request
            </Button>
            <Button
              className="bg-red-700 ml-2"
              onClick={() => setStatus(UserStatus.denied)}
              disabled={status != null && status !== UserStatus.pendingApproval}
              shadow={status != null && status !== UserStatus.pendingApproval}
            >
              Deny
            </Button>
          </div>

          <div className="mt-10">
            <Text fontWeight={800} className="">Grant App Access:</Text>
            <Text color="#8B9199" fontSize="12px" className=" mb-2">This is after approval and skips the donation step.</Text>
            <Button
              onClick={() => setReadAccess(true)}
              disabled={status != null && status !== UserStatus.approved && !userHasRole(user, UserRole.paid)}
              shadow={status != null && status !== UserStatus.approved && !userHasRole(user, UserRole.paid)}
            >
              Grant Access
            </Button>
          </div>
          <Box className="border-t border-gray mt-5 pt-4">
            <Button
              shadow={false}
              className=""
              outline={true}
              onClick={closeModal}
            >
              Close
            </Button>
          </Box>
        </div>
      </div>
    </GenericModal >
  )
}

/**
 * Modal to Revoke User Access to song sheets. Should be similar to the Grant User Access Modal
 */
const RevokeUserModal = ({
  isOpen,
  closeModal,
  user,
  setReadAccess,
  setBookAccess
}: {
  isOpen: boolean;
  closeModal: () => void;
  user: UserInfo | null;
  setReadAccess: (grant: boolean) => void;
  setBookAccess: (HymnBook: HymnBook, grant: boolean) => void;
}) => {
  return (
    <GenericModal
      modalIsOpen={isOpen}
      closeModal={closeModal}
      title={<>App Access ({user?.name})</>}
      className="top-14"
    >
      <div className="flex mt-3 w-full">
        <div className="flex flex-col w-full">
          <Text lineHeight="1.25" fontSize="12px" className="mt-1">
            Email: {user?.email}
          </Text>
          <Text lineHeight="1.25" fontSize="12px" className="mt-1">
            Location: {user?.location ?? "Unknown"}
          </Text>
          {/* <div className="mt-4">
            <Text fontWeight={800} className="mb-2">Hymn Book Access:</Text>
            N/A
            {
              userHasRoleOrAdmin(user, UserRole.readHC3)
                ? <Button
                  className={`bg-red-700`}
                  type="medium"
                  onClick={() => setBookAccess(false)}
                >
                  Revoke HC3 Access
                </Button>
                :
                <Button
                  className={`bg-green-700`}
                  onClick={() => setBookAccess(true)}
                >
                  Grant HC3 Access
                </Button>
            }
          </div> */}

          <Text fontWeight={800} className="mt-5">App Access:</Text>
          <Text color="#8B9199" lineHeight="1.25" fontSize="12px" className="mt-1">
            Please make sure you are revoking app access to the correct person.
          </Text>
          <div className="mt-3">
            <Button
              className={`bg-red-700`}
              onClick={() => setReadAccess(false)}
            >
              Revoke
            </Button>
            <Button
              shadow={false}
              className="ml-2"
              outline={true}
              onClick={closeModal}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </GenericModal >
  )
}
export default VanTeamUsersPage;
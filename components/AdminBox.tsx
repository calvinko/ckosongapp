import { Switch } from "@headlessui/react";
import React, { useState } from "react";
import useSWR, { mutate } from "swr";

import {
  ADD_RELATED_PROPERTY,
  SHOW_RELATED_PROPERTY,
  useShowRelatedSongEnabled,
  useAddRelatedSongEnabled,
  setProperty,
  ALLOW_SONG_SHEET_QUERY_PROPERTY,
  useAllowSongSheetQueryEnabled,
} from "../lib/properties";
import { fetcherWithShortMaxAge } from "../lib/fetcher";
import { userHasRole, UserRole, UserSortBy, UserType } from "../lib/constants";
import { getDateString, getDateToMinString, getShortenedDateToMin } from "../lib/dateUtils"

import { Text, Link, Heading, Box, Button, TextField, Flex } from "./base";
import CreateTokenUserModal from "./CreateTokenUserModal";
import ModifyUserModal from "./ModifyUserModal";

import Property from "../ts/types/property.interface";
import UserInfo from "../ts/types/userInfo.interface";
import SortPopup from "./SortPopup";
import Fuse from "fuse.js";
import { useAllEntriesOnIndex } from "../lib/generic-entries/generic-entry-adapter";
import { ZeffyDonation } from "../ts/types/zeffy.interface";
import GreenRedCircle from "./icons/GreenRedCircle";
import { CheckmarkIcon } from "react-hot-toast";
import { Check, CheckCircle } from "react-feather";

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

const APP_ACCESS_FORM_ID: string = "6884c604-48e8-4b5f-80be-51c16420ec39"
const EBOOK_ACCESS_FORM_ID: string = "85def07d-6fdc-4ca9-bf33-17a9931f673b"

/**
 * The Component in profile page that holds all the admin functionality. This should only be visible for admin users
 */
const AdminBox = ({ toast }) => {

  // modifiying user modal open state
  const [modifyUserModalIsOpen, setModifyUserModalIsOpen] = useState(false);
  const [modifyingUser, setModifyingUser] = useState(null);

  // modifiying token user modal open state
  const [modifyTokenUserModalIsOpen, setModifyTokenUserModalIsOpen] = useState(false);
  const [modifyingTokenUser, setModifyingTokenUser] = useState(null);

  // the create token user modal open state
  const [createTokenUserModalIsOpen, setCreateTokenUserModalIsOpen] = useState(false);

  const [searchUserVal, setSearchUserVal] = useState("");

  const addRelatedSongProperty: Property = useAddRelatedSongEnabled();
  const showRelatedSongProperty: Property = useShowRelatedSongEnabled();
  const allowSongSheetQueryProperty: Property = useAllowSongSheetQueryEnabled();

  const [showFeedback, setShowFeedback] = useState(true);
  const [showUsers, setShowUsers] = useState(true);
  const [showDonations, setShowDonations] = useState(true);
  const [showTokenUsers, setShowTokenUsers] = useState(true);

  const [userSortPopupOn, setUserSortPopupOn] = useState(false);
  const [userSortBy, setUserSortBy] = useState(UserSortBy.default);

  const { data: feedbackRes } = useSWR(`api/feedback`, fetcherWithShortMaxAge);
  const feedback = feedbackRes?.data;
  const { data: rawUsers } = useSWR(`/api/users`, fetcherWithShortMaxAge);
  const { data: tokenUsers } = useSWR(`/api/admin/tokens`, fetcherWithShortMaxAge);
  const allDonations = useAllEntriesOnIndex("ZEFFY_DONATIONS");

  let donationsToShow = allDonations?.sort((a, b) => {
    return Date.parse(b?.createdAt) - Date.parse(a?.createdAt)
  })

  let users: UserInfo[] = rawUsers ?? []

  let usersByEmail: { [email: string]: UserInfo } = {};
  users.forEach((user) => {
    usersByEmail[user.email] = user;
  });

  if (userSortBy == UserSortBy.default) {
    // sort the users
    users = rawUsers?.sort((a, b) => {
      const aProp = userHasRole(a, UserRole.hideFromTeam)
      const bProp = userHasRole(b, UserRole.hideFromTeam)
      // both are or are not "hide from team", sort by alpha them
      if ((aProp && bProp) || (!aProp && !bProp)) {
        return a?.name?.localeCompare(b?.name)
      }
      return aProp ? -1 : 1;
    }) ?? []
  }
  else if (userSortBy == UserSortBy.lastValidatedAt) {
    users = rawUsers?.sort((a, b) => {
      if (a?.lastValidatedAt === b?.lastValidatedAt) {
        return 0;
      }

      // nulls/undefined sort after anything else
      if (a.lastValidatedAt == null) {
        return 1;
      }
      if (b.lastValidatedAt == null) {
        return -1;
      }
      if (a.lastValidatedAt == null && b.lastValidatedAt == null) {
        return 0
      }

      // otherwise, if we're ascending, lowest sorts first
      // if (ascending) {
      //   return a < b ? -1 : 1;
      // }

      // if descending, highest sorts first
      return b.lastValidatedAt - a.lastValidatedAt;
    }) ?? []
  }
  else if (userSortBy == UserSortBy.createdAt) {
    users = rawUsers?.sort((a, b) => {
      if (a?.createdAt === b?.createdAt) {
        return 0;
      }

      // nulls/undefined sort after anything else
      if (a.createdAt == null) {
        return 1;
      }
      if (b.createdAt == null) {
        return -1;
      }
      if (a.createdAt == null && b.createdAt == null) {
        return 0;
      }

      // if descending, highest sorts first
      return b.createdAt - a.createdAt;
    }) ?? []
  }

  let usersToShow: UserInfo[] = users;

  const userSearchFuse = new Fuse(users, USER_SEARCH_FUSE_OPTIONS);

  if (searchUserVal) {
    usersToShow = userSearchFuse.search(searchUserVal).map((res) => res.item);
  }

  /**
   * Method to set "add related songs" property
   *
   * @param enabled whether to enable add related songs
   */
  const setAddRelatedProperty = (enabled: Boolean) => {
    try {
      mutate(
        `/api/admin/properties/${ADD_RELATED_PROPERTY}`,
        { ...addRelatedSongProperty, value: enabled.toString() },
        false
      );
      setProperty(ADD_RELATED_PROPERTY, enabled.toString());
      toast.success("Success!");
    } catch (err) {
      toast.error("Could not set add related song property");
    }
  };

  /**
   * Method to set "show related songs" property
   *
   * @param enabled whether or not to enable this property
   */
  const setShowRelatedProperty = (enabled: Boolean) => {
    try {
      mutate(
        `/api/admin/properties/${SHOW_RELATED_PROPERTY}`,
        { ...showRelatedSongProperty, value: enabled.toString() },
        false
      );
      setProperty(SHOW_RELATED_PROPERTY, enabled.toString());
      toast.success("Success!");
    } catch (err) {
      toast.error("Could not set show related song property");
    }
  };

  /**
   * Method to set "allow song sheet query" property, enabling query parameter to show song sheet regardless of user access
   *
   * @param enabled whether or not to enable this property
   */
  const setAllowSongSheetQueryProperty = (enabled: Boolean) => {
    try {
      mutate(
        `/api/admin/properties/${ALLOW_SONG_SHEET_QUERY_PROPERTY}`,
        { ...allowSongSheetQueryProperty, value: enabled.toString() },
        false
      );
      setProperty(ALLOW_SONG_SHEET_QUERY_PROPERTY, enabled.toString());
      toast.success("Success!");
    } catch (err) {
      toast.error("Could not set show make a melody property");
    }
  };

  /**
   * Method to remove feedback from database
   * 
   * @param id  id of the feedback
   */
  const removeFeedback = async (e, id: string) => {
    try {
      await fetch(`api/feedback?id=${id}`, { method: "DELETE" });
      mutate(
        `api/feedback`,
        { success: true, data: feedback.filter((entry) => entry._id != id) },
        true
      );
      toast.success("Success!");
    } catch (err) {
      toast.error("Could not remove feedback");
    }
  };

  const closeModifyUserModal = () => {
    setModifyUserModalIsOpen(false);
  };

  const openModifyUserModal = (user) => {
    setModifyingUser(user);
    setModifyUserModalIsOpen(true);
  };

  const closeModifyTokenUserModal = () => {
    setModifyTokenUserModalIsOpen(false);
  };

  const openModifyTokenUserModal = (user) => {
    setModifyingTokenUser(user);
    setModifyTokenUserModalIsOpen(true);
  };

  const handleUserSortByClick = () => {
    setUserSortPopupOn(!userSortPopupOn)
  }

  const addRelated = addRelatedSongProperty?.value === "true";
  const showRelated = showRelatedSongProperty?.value === "true";
  const allowSongSheetQuery = allowSongSheetQueryProperty?.value === "true";

  return (
    <Flex flexDirection="row">
      <ModifyUserModal
        modalIsOpen={modifyUserModalIsOpen}
        closeModal={closeModifyUserModal}
        user={modifyingUser}
        userType={UserType.google}
      />
      <ModifyUserModal
        modalIsOpen={modifyTokenUserModalIsOpen}
        closeModal={closeModifyTokenUserModal}
        tokenUser={modifyingTokenUser}
        userType={UserType.token}
      />
      <CreateTokenUserModal
        modalIsOpen={createTokenUserModalIsOpen}
        closeModal={() => { setCreateTokenUserModalIsOpen(false) }}
      />
      <Box className="mt-5" width="100%">
        <div className="mt-4">
          <Heading as="h4" type="h4" fontSize="24px" className="mb-2">
            Admin
          </Heading>
          <div className="mt-2 mb-3 pb-4">
            <Text fontWeight="bold" className="mb-2">Links:</Text>
            <div className="border-y border-slate-100 py-3 pl-3">
              <Link href="/register?s1=true" fontSize="14px" underline>Register Stage 1</Link>
            </div>
            <div className="border-y border-slate-100 py-3 pl-3">
              <Link href="/register?s2=true" fontSize="14px" underline>Register Stage 2</Link>
            </div>
            <div className="border-y border-slate-100 py-3 pl-3">
              <Link href="/signIn" fontSize="14px" underline>Sign In</Link>
            </div>
          </div>
          <Flex flexDirection="column">
            <Flex className="items-center mb-4">
              <Switch
                checked={addRelated}
                onChange={setAddRelatedProperty}
                className={`${addRelated ? "bg-blue-600" : "bg-gray-200"
                  } inline inline-flex items-center h-6 rounded-full w-11`}
              >
                <span className="sr-only">Turn on adding related song</span>
                <span
                  className={`${addRelated ? "translate-x-6" : "translate-x-1"
                    } inline-block w-4 h-4 transform bg-white rounded-full`}
                />
              </Switch>
              <Text as="span" fontSize="14px" className="pl-2">
                Turn on adding related song
              </Text>
            </Flex>
            <Flex className="items-center mb-4">
              <Switch
                checked={showRelated}
                onChange={setShowRelatedProperty}
                className={`${showRelated ? "bg-blue-600" : "bg-gray-200"
                  } inline inline-flex items-center h-6 rounded-full w-11`}
              >
                <span className="sr-only">Turn on showing related songs</span>
                <span
                  className={`${showRelated ? "translate-x-6" : "translate-x-1"
                    } inline-block w-4 h-4 transform bg-white rounded-full`}
                />
              </Switch>
              <Text as="span" fontSize="14px" className="pl-2">
                Turn on showing related songs
              </Text>
            </Flex>
            <Flex className="items-center mb-4">
              <Switch
                checked={allowSongSheetQuery}
                onChange={setAllowSongSheetQueryProperty}
                className={`${allowSongSheetQuery ? "bg-blue-600" : "bg-gray-200"
                  } inline inline-flex items-center h-6 rounded-full w-11`}
              >
                <span className="sr-only">Allow View Song Sheet By Query</span>
                <span
                  className={`${allowSongSheetQuery ? "translate-x-6" : "translate-x-1"
                    } inline-block w-4 h-4 transform bg-white rounded-full`}
                />
              </Switch>
              <Text as="span" fontSize="14px" className="pl-2">
                Allow View Song Sheet By Query
              </Text>
            </Flex>
            <Flex flexDirection="row" className="items-center">
              <Heading as="h4" type="h4" fontSize="16px">
                Feedback
              </Heading>
              <Button
                type="small"
                shadow={false}
                outline
                className="ml-2"
                onClick={() => { setShowFeedback(!showFeedback) }}
              >
                {showFeedback ? 'Hide' : 'Show'}
              </Button>
            </Flex>
            <Flex flexDirection="column" className="w-full">
              {showFeedback && feedback?.map((entry) => (
                <div key={entry?.timestamp} className="feedback-item max-w-full overflow-hidden" >
                  <Flex
                    flexDirection="row"
                    className="pl-0.5 max-w-full w-full items-center justify-between gap-x-1"
                  >
                    <Flex
                      flexDirection="column"
                      className="w-11/12 max-w-11/12"
                    >
                      <Text color="#8B9199" fontSize="12px" as="span" className="block" lineHeight="18px">
                        {" "}
                        {getDateString(entry?.timestamp)} - {entry?.email} (
                        <Link href={entry?.page}>{entry?.page}</Link>)
                      </Text>{" "}
                      <Box className="text-wrap">
                        <Text fontSize="14px" className="text-wrap w-full break-all" as="p">
                          {entry?.feedbackText}
                        </Text>
                      </Box>
                    </Flex>
                    <Box className="justify-self-end w-[20px]">
                      <img
                        src="/x-inactive.svg"
                        onMouseOver={(e) => (e.currentTarget.src = "/x.svg")}
                        onMouseOut={(e) =>
                          (e.currentTarget.src = "/x-inactive.svg")
                        }
                        width="20px"
                        className="mr-2 remove-icon action-icon"
                        onClick={(e) => removeFeedback(e, entry?._id)}
                      />
                    </Box>
                  </Flex>
                </div>
              ))}
            </Flex>
            <Flex flexDirection="row" className="mt-6 items-center">
              <Heading as="h4" type="h4" fontSize="16px">
                Users
              </Heading>
              <Button
                type="small"
                shadow={false}
                outline
                className="ml-2"
                onClick={() => { setShowUsers(!showUsers) }}
              >
                {showUsers ? 'Hide' : 'Show'}
              </Button>
            </Flex>
            <Flex flexDirection="column" className="w-full">
              <div className="flex flex-row my-2 items-center">
                <p className="text-sm	font-medium">
                  <span className="text-sm text-gray-500">TOTAL:</span> {users?.length ?? "Unknown"}
                </p>
                <p className="text-sm	font-medium pl-2">
                  <span className="text-sm text-gray-500">SONG SHEET:</span> {users?.filter(u => userHasRole(u, UserRole.readSongSheet))?.length ?? "Unknown"}
                </p>
                <p className="text-sm	font-medium pl-2">
                  <span className="text-sm text-gray-500">ACCESS:</span> {users?.filter(u => userHasRole(u, UserRole.useApp))?.length ?? "Unknown"}
                </p>
                <p className="text-sm	font-medium pl-2">
                  <span className="text-sm text-gray-500">PAID:</span> {users?.filter(u => userHasRole(u, UserRole.paid))?.length ?? "Unknown"}
                </p>
                <p className="text-sm	font-medium pl-2">
                  <span className="text-sm text-gray-500">HIDDEN:</span> {users?.filter(u => userHasRole(u, UserRole.hideFromTeam))?.length ?? "Unknown"}
                </p>
              </div>
              <Flex flexDirection="column" className="w-full">
                <div className="mb-2">
                  <Button type="small" outline onClick={handleUserSortByClick}>Sort By</Button>
                  {userSortPopupOn && <SortPopup
                    popUpOn={userSortPopupOn}
                    togglePopup={setUserSortPopupOn}
                    currSortBy={userSortBy}
                    updateSortBy={(sortBy, dispatch) => { setUserSortBy(sortBy as UserSortBy) }}
                    options={[
                      { value: UserSortBy.default, label: "Default" },
                      { value: UserSortBy.lastValidatedAt, label: "Validated At" },
                      { value: UserSortBy.createdAt, label: "Created At" },
                    ]}
                  />
                  }
                </div>
              </Flex>
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
              <div className="overflow-y-scroll h-[42rem]">
                {showUsers && usersToShow &&
                  usersToShow?.map((user) => (
                    <div key={user?.email} className="feedback-item">
                      <Flex
                        flexDirection="row"
                        className="pl-0.5 items-center content-center	w-full"
                      >
                        <div className="pb-1">
                          <Flex
                            flexDirection="row"
                            className="pl-0.5 items-center content-center w-full"
                          >
                            <Text fontSize="12px" lineHeight="1" className="py-1">
                              {user?.name} ({user?.email})
                            </Text>
                            {userHasRole(user, UserRole.readChineseSongs) &&
                              <div className={`ml-2 py-0.5 px-1 font-normal rounded text-[10px] bg-green-100 text-green-800`}>
                                Chinese
                              </div>
                            }
                            {userHasRole(user, UserRole.readOtherLang) &&
                              <div className={`ml-2 py-0.5 px-1 font-normal rounded text-[10px] bg-blue-100 text-blue-800`}>
                                Other
                              </div>
                            }
                          </Flex>
                          <div>
                            <Text as="p" fontSize="12px" color="#8B9199" lineHeight="1">
                              {
                                user?.lastValidatedAt && getShortenedDateToMin(user?.lastValidatedAt)
                              }
                              {user?.lastValidatedAt && user?.location &&
                                <Text
                                  as="span"
                                  lineHeight="1"
                                  className="px-1"
                                  color="#8B9199"
                                  fontSize="14px"
                                >
                                  •
                                </Text>
                              }
                              {user?.location?.substring(0, 25)}{user?.location?.length > 25 && "..."}
                            </Text>
                          </div>
                        </div>
                        <div className="ml-auto manage-role-box">
                          <div className="flex flex-row-reverse">
                            <Button
                              type="small"
                              className={`${userHasRole(user, UserRole.hideFromTeam) ? "bg-purple-700" : userHasRole(user, UserRole.paid) ? "bg-fuchsia-700" : "bg-green-700"} px-1 py-1 rounded-md`}
                              onClick={() => openModifyUserModal(user)}
                            >
                              Modify
                            </Button>
                            <Text
                              as="span"
                              color="#8B9199"
                              fontSize="12px"
                              className="pr-2"
                            >
                              {user?.roles?.length} roles
                            </Text>
                          </div>
                        </div>
                      </Flex>
                    </div>
                  ))
                }
              </div>
            </Flex>
            <Flex flexDirection="row" className="mt-6 items-center">
              <Heading as="h4" type="h4" fontSize="16px">
                Donations
              </Heading>
              <Button
                type="small"
                shadow={false}
                outline
                className="ml-2"
                onClick={() => { setShowDonations(!showDonations) }}
              >
                {showDonations ? 'Hide' : 'Show'}
              </Button>
            </Flex>
            <div className="overflow-y-scroll h-[42rem]">
              <Flex flexDirection="=row" className="my-2 items-center">
                <p className="text-sm	font-medium">
                  <span className="text-sm text-gray-500">TOTAL APP:</span> {donationsToShow?.filter(d => d?.payload?.formId === APP_ACCESS_FORM_ID)?.length ?? "Unknown"}
                </p>
              </Flex>
              <Flex flexDirection="column" className="w-full">
                {allDonations?.map((donation: { payload: ZeffyDonation, _id: string }, i) => (
                  <div key={donation?._id ?? i} className="feedback-item max-w-full overflow-hidden">
                    {donation?.payload && (
                      <Box className="pb-0.5">
                        <Flex
                          flexDirection="row"
                          className="pl-0.5 items-center content-center	w-full"
                        >
                          <Flex
                            flexDirection="row"
                            className="pl-0.5 items-center content-center w-full"
                          >
                            <Text as="span" fontSize="12px" className="user-name-box pr-1" lineHeight="1">
                              {donation?.payload?.firstName} {donation?.payload?.lastName}
                            </Text>
                            {usersByEmail[donation?.payload?.email] && (
                              <GreenRedCircle isGreen={true} />
                            )}
                            <Text className="pl-2" fontSize="12px" lineHeight="1">
                              (${donation?.payload?.amount} CAD)
                            </Text>
                            <div className={`ml-2 py-0.5 px-1 font-normal rounded text-[10px] ${donation?.payload?.formId === APP_ACCESS_FORM_ID ? "bg-green-100 text-green-800" : donation?.payload?.formId === EBOOK_ACCESS_FORM_ID ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                              {donation?.payload?.formId === APP_ACCESS_FORM_ID ? "App Access" : donation?.payload?.formId === EBOOK_ACCESS_FORM_ID ? "Ebook Form" : "Other Form"}
                            </div>
                            {
                              donation?.payload?.email && usersByEmail[donation?.payload?.email] && userHasRole(usersByEmail[donation?.payload?.email], UserRole.paid) &&
                              <CheckCircle
                                color={"green"}
                                className="ml-2"
                                size={14}
                              />
                            }
                          </Flex>
                        </Flex>
                        <Text fontSize="12px" color="#8B9199" className="pl-1 pb-1" lineHeight="1">
                          {donation?.payload?.email}
                        </Text>
                        <Flex
                          flexDirection="row"
                          className="pl-0.5 items-center w-full"
                        >
                          <Text fontSize="12px" color="#8B9199" className="pl-1" lineHeight="1">
                            {getShortenedDateToMin(donation?.payload?.createdDate ? Date.parse(donation?.payload?.createdDate) ?? null : null)}
                          </Text>
                          <Text
                            as="span"
                            lineHeight="1"
                            className="px-1"
                            color="#8B9199"
                            fontSize="14px"
                          >
                            •
                          </Text>
                          <Text fontSize="12px" color="#8B9199" className="pl-1" lineHeight="1">
                            {donation?.payload?.city ? + `${donation?.payload?.city}, ` : ""}{donation?.payload?.country}
                          </Text>
                        </Flex>
                      </Box>
                    )}
                  </div>
                ))}
              </Flex>
            </div>
            <Flex flexDirection="row" className="mt-6 items-center">
              <Heading as="h4" type="h4" fontSize="16px">
                Token Users
                <img
                  src="/plus-circle.svg"
                  width="16px"
                  className="ml-2 inline action-icon"
                  onClick={(e) => setCreateTokenUserModalIsOpen(true)}
                />
              </Heading>
              <Button
                type="small"
                shadow={false}
                outline
                className="ml-2"
                onClick={() => { setShowTokenUsers(!showTokenUsers) }}
              >
                {showTokenUsers ? 'Hide' : 'Show'}
              </Button>
            </Flex>
            <Flex flexDirection="column" className="w-full">
              {showTokenUsers && tokenUsers &&
                tokenUsers?.map((user) => (
                  <div key={user?._id} className="feedback-item">
                    <Flex
                      flexDirection="row"
                      className="pl-0.5 items-center content-center	w-full"
                    >
                      <Text as="span" fontSize="12px" className="user-name-box">
                        {user?.name} ({user?._id})
                      </Text>
                      <div className="ml-auto manage-role-box">
                        {user?.roles?.length >= 0 ? (
                          <Text
                            as="span"
                            color="#8B9199"
                            fontSize="12px"
                            className="pr-2"
                          >
                            {user?.roles?.length} roles
                          </Text>
                        ) : null}
                        <button
                          type="button"
                          className={`bg-green-700 inline-flex justify-center px-1 py-1 text-xs font-medium hover:shadow-md hover:drop-shadow-md text-white border border-transparent rounded-md`}
                          onClick={() => openModifyTokenUserModal(user)}
                        >
                          Modify
                        </button>
                      </div>
                    </Flex>
                    <Flex
                      flexDirection="row"
                      className="pl-0.5 items-center w-full"
                    >
                      <Text fontSize="12px" as="span" color="#666B72" lineHeight="1.5">Created:</Text>
                      <Text fontSize="12px" color="#8B9199" as="span" className="pl-1" lineHeight="1.5"> {getDateToMinString(user?.createdAt)}</Text>
                    </Flex>
                    <Flex
                      flexDirection="row"
                      className="pl-0.5 items-center w-full"
                    >
                      <Text fontSize="12px" color="#666B72" lineHeight="1,5">Last Validated:</Text>
                      <Text fontSize="12px" color="#8B9199" as="span" className="pl-1" lineHeight="1.5">{getDateToMinString(user?.lastValidatedAt)}</Text>
                    </Flex>
                  </div>
                ))}
            </Flex>
          </Flex >
        </div >
      </Box >
      <style jsx>{`
        .feedback-item {
          padding: 4px 0;
          border-bottom: 1px solid #eaeaea;
          width: 100%;
        }
        // .remove-icon {
        //   align-self: center;
        // }
        .action-icon:hover {
          cursor: pointer;
        }
        .manage-role-box {
          min-width: 120px;
          width: 120px;
        }
      `}</style>
    </Flex >
  );
};

export default AdminBox;

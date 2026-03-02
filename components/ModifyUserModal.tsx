import { Transition, Dialog } from "@headlessui/react";
import React, { Fragment, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
import { Listbox } from "@headlessui/react";


import UserInfo from "../ts/types/userInfo.interface";
import { Box, Text, Heading, Button, TextField, Flex } from "./base";
import { getActiveRoles, userHasRole, userHasRoleOrAdmin, UserRole, UserStatusOptions, UserType } from "../lib/constants";
import TokenUser from "../ts/types/tokenUser.interface";
import { deleteTokenUser } from "../lib/tokens/uiToken";
import GreenRedCircle from "./icons/GreenRedCircle";
import { getDateToMinString, getDateToSecString } from "../lib/dateUtils";

/**
 * Modal for editing user profiles. Only for admins.
 */
const ModifyUserModal = ({
  modalIsOpen,
  closeModal,
  user,
  tokenUser,
  userType,
}: {
  modalIsOpen: boolean;
  closeModal: () => void;
  user?: UserInfo | null | undefined;
  tokenUser?: TokenUser | null | undefined;
  userType: UserType;
}) => {
  const { mutate } = useSWRConfig();
  const [userRoles, setUserRoles] = useState<UserRole[]>((userType == UserType.google ? user?.roles : tokenUser?.roles) ?? []);

  const [locationTextVal, setLocationTextVal] = useState((userType == UserType.google ? user?.location : tokenUser?.location) ?? "");
  const [location, setLocation] = useState((userType == UserType.google ? user?.location : tokenUser?.location) ?? "Unknown");
  const initRef = useRef(null);
  const userStatus = user?.status ?? null;
  const [userStatusText, setUserStatusText] = useState(user?.status ?? null)

  useEffect(() => {
    setLocationTextVal((userType == UserType.google ? user?.location : tokenUser?.location) ?? "");
    setLocation((userType == UserType.google ? user?.location : tokenUser?.location) ?? "Unknown");
    setUserStatusText(user?.status ?? null);
  }, [user])

  useEffect(() => {
    setLocationTextVal((userType == UserType.google ? user?.location : tokenUser?.location) ?? "");
    setLocation((userType == UserType.google ? user?.location : tokenUser?.location) ?? "Unknown");
  }, [tokenUser])

  /**
   * Remove role for the user
   *
   * @param role role as a string
   */
  const removeRole = async (role) => {
    if (userRoles.length == 0) {
      toast.error("Shouldn't happen! User doesn't have role.");
      return;
    }
    // make server call with all roles without this role
    // api just replaces the list of roles with this new list of roles (immutable list)
    const rolesToSubmit = userRoles.filter((r) => r != role);
    let res;
    if (userType == UserType.google) {
      res = await fetch(`/api/users/roles?email=${user?.email}`, {
        method: "PUT",
        body: JSON.stringify({
          roles: rolesToSubmit
        }),
      });
    } else {
      res = await fetch(`/api/users/roles?token=${tokenUser?._id}`, {
        method: "PUT",
        body: JSON.stringify({
          roles: rolesToSubmit
        }),
      });
    }
    const json = await res.json();

    if (res.status > 300) {
      toast.error(`Error removing role: ${role}`);
      return;
    }
    // mutate in component
    setUserRoles(json?.data?.roles);
    mutate("/api/users");
    toast.success("Successfully removed role");
  };

  /**
   * Add role to user
   *
   * @param role role as a string
   */
  const addRole = async (role) => {
    // add role to list of current roles
    // api just replaces the list of roles with this new list of roles (immutable list)
    const newUserRoles = userRoles.concat([role]);
    let res;
    if (userType == UserType.google) {
      res = await fetch(`/api/users/roles?email=${user?.email}`, {
        method: "PUT",
        body: JSON.stringify({
          roles: newUserRoles
        }),
      });
    } else {
      res = await fetch(`/api/users/roles?token=${tokenUser?._id}`, {
        method: "PUT",
        body: JSON.stringify({
          roles: newUserRoles
        }),
      });
    }
    const json = await res.json();

    if (res.status > 300) {
      toast.error(`Error adding role: ${role}`);
      return;
    }
    // mutate in component
    setUserRoles(json?.data?.roles);
    mutate("/api/users");
    toast.success(`Successfully added role: ${role}`);
  };

  // whenever the user to modify changes, we change the state with set of roles
  useEffect(() => {
    if (userType == UserType.google) {
      setUserRoles(user?.roles ?? []);
    }
  }, [user]);

  // for token user
  useEffect(() => {
    if (userType == UserType.token) {
      setUserRoles(tokenUser?.roles ?? []);
    }
  }, [tokenUser]);

  const handleDeleteTokenUser = async () => {
    if (userType !== UserType.token) {
      return;
    }

    const token = tokenUser?._id;
    const name = tokenUser?.name;
    if (!token) {
      return;
    }
    const success = await deleteTokenUser(token);
    if (success) {
      toast.success("Successfully deleted token user " + name);
      closeModal();
      mutate("/api/admin/tokens");
      return;
    }
    toast.error("Failed to delete token user " + name);
  }

  /**
   * Update google user location
   */
  const updateUserLocation = async () => {
    if (userType !== UserType.google) {
      return;
    }
    if (!locationTextVal) {
      return;
    }
    const res = await fetch(`/api/users?email=${user?.email}`, {
      method: "PUT",
      body: JSON.stringify({
        location: locationTextVal
      }),
    });

    if (res.status >= 400) {
      toast.error("Could not update user location.")
      return;
    }

    mutate("/api/users")
    setLocation(locationTextVal);
    toast.success("Updated location.")
  }

  const changeUserStatus = async () => {
    if (userType !== UserType.google) {
      return;
    }
    // check if status text is valid - UserStatus, allow null
    if (!UserStatusOptions.some((option) => option.value === userStatusText)) {
      return;
    }
    const res = await fetch(`/api/users?email=${user?.email}`, {
      method: "PUT",
      body: JSON.stringify({
        status: userStatusText
      }),
    });

    if (res.status >= 400) {
      toast.error("Could not update user status.")
      return;
    }

    mutate("/api/users")
    toast.success("Updated status.")
  }

  // get roles that the user doesn't have and can add
  const rolesToAdd: UserRole[] = getActiveRoles().filter((role) => {
    return userRoles?.indexOf(role) == -1;
  });

  const userHasLocation = user?.location != null && user?.location?.length > 0;

  return (
    <Transition appear show={modalIsOpen} as={Fragment}>
      <Dialog
        as="div"
        open={modalIsOpen}
        className="fixed inset-0 z-1000 overflow-auto max-h-full"
        onClose={closeModal}
        initialFocus={initRef}
      >
        {/* <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" /> */}
        <div
          className="px-4 text-center data-enter:ease-out data-enter-duration-300 data-enter-from-opacity-0 data-enter-to-opacity-100 data-leave:ease-in data-leave-duration-200 data-leave-from-opacity-100 data-leave-to-opacity-0">
          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div ref={initRef} className="fixed inset-x-0 mx-auto top-0 sm:top-14 w-full max-w-md p-5 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 mb-1"
              >
                {userType === UserType.google ? user?.name : tokenUser?.name}
                <Text
                  as="span"
                  color="#8B9199"
                  fontSize="14px"
                  className="pl-3"
                >
                  <>{userType === UserType.google ? `( ${user?.email} )` : ""}</>
                </Text>
              </Dialog.Title>
              <div className="overflow-y-scroll max-h-[34rem] md:max-h-fit mb-3">
                <Flex flexDirection="column" className="w-full">
                  <div className="flex flex-row w-full">
                    <Text fontSize="12px" lineHeight="1.5" color="#8B9199" className="flex-1">
                      Created: {userType == UserType.google ? getDateToMinString(user?.createdAt) : getDateToMinString(tokenUser?.createdAt)}
                    </Text>
                    <Text fontSize="12px" lineHeight="1.5" color="#8B9199" className="flex-1 pl-2 ml-auto">
                      Modified: {userType == UserType.google ? getDateToMinString(user?.lastModifiedAt) : getDateToMinString(tokenUser?.lastModifiedAt)}
                    </Text>
                  </div>
                  <Text fontSize="12px" lineHeight="1.5" color="#8B9199">
                    Validated: {userType == UserType.google ? getDateToSecString(user?.lastValidatedAt) : getDateToSecString(tokenUser?.lastValidatedAt)}
                  </Text>
                  <div className="flex flex-row w-full">
                    <Text fontSize="12px" lineHeight="1.5" color="#8B9199" className="flex-1">Location: {location}</Text>
                    <Text fontSize="12px" lineHeight="1.5" color="#8B9199" className="flex-1 pl-2 ml-auto">User type: {userType}</Text>
                  </div>
                  {userType === UserType.token ? <Text fontSize="12px" lineHeight="1.5" color="#8B9199">Token: {tokenUser?._id}</Text> : null}
                  <Flex
                    flexDirection="row"
                    className="mt-2 pl-0.5 pb-0.5 w-full"
                  >
                    <Flex
                      flexDirection="column"
                      className="mt-2 pl-0.5 pb-0.5 w-full"
                    >
                      <Flex
                        flexDirection="row"
                        className="mt-2 pl-0.5 pb-0.5 items-center content-center w-full"
                      >
                        <Box className="mr-2">
                          {<GreenRedCircle isGreen={user?.isAdmin} />}
                        </Box>
                        <Text fontSize="12px" lineHeight="1.2">Admin</Text>
                      </Flex>
                      <Flex
                        flexDirection="row"
                        className="pl-0.5 pb-0.5 items-center content-center w-full"
                      >
                        <Box className="mr-2">
                          {<GreenRedCircle isGreen={userHasRole(user, UserRole.paid)} />}
                        </Box>
                        <Text fontSize="12px" lineHeight="1.2">App Access</Text>
                      </Flex>
                      <Flex
                        flexDirection="row"
                        className="pl-0.5 pb-0.5 items-center content-center w-full"
                      >
                        <Box className="mr-2">
                          {<GreenRedCircle isGreen={userHasRole(user, UserRole.readEnglishSongs)} />}
                        </Box>
                        <Text fontSize="12px" lineHeight="1.2">English</Text>
                      </Flex>
                      <Flex
                        flexDirection="row"
                        className="pl-0.5 pb-0.5 items-center content-center w-full"
                      >
                        <Box className="mr-2">
                          {<GreenRedCircle isGreen={userHasRole(user, UserRole.readChineseSongs)} />}
                        </Box>
                        <Text fontSize="12px" lineHeight="1.2">Chinese</Text>
                      </Flex>
                    </Flex>
                    <Flex
                      flexDirection="column"
                      className="mt-2 pl-0.5 pb-0.5 w-full"
                    >
                      <Flex
                        flexDirection="row"
                        className="mt-2 pl-0.5 pb-0.5 items-center content-center w-full"
                      >
                        <Box className="mr-2">
                          {<GreenRedCircle isGreen={userHasRole(user, UserRole.paid)} />}
                        </Box>
                        <Text fontSize="12px" lineHeight="1.2">Paid</Text>
                      </Flex>
                    </Flex>
                  </Flex>

                  <Heading as="h4" type="h4" fontSize="14px" fontWeight={500}>
                    Status
                  </Heading>
                  <Flex flexDirection="row" className="w-full items-center gap-x-2 mb-4">
                    <Box className="w-52">
                      <Listbox value={userStatusText} onChange={setUserStatusText} >
                        <Listbox.Button className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-left focus:outline-none">
                          {UserStatusOptions.find((option) => option.value === userStatusText)?.label ?? "Null"}
                        </Listbox.Button>

                        <Listbox.Options className="w-(--button-width) rounded-xl border p-1">
                          {UserStatusOptions.map((option) => (
                            <Listbox.Option
                              key={option.value}
                              value={option.value}
                              className={`group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none ${option.value === userStatusText ? "bg-blue-500 text-white hover:bg-blue-600" : "hover:bg-gray-50"}`}
                            >
                              {option.label}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Listbox>
                    </Box>
                    <Box>
                      <Button
                        disabled={userStatusText === userStatus}
                        onClick={changeUserStatus}
                      >
                        Submit
                      </Button>
                    </Box>
                  </Flex>

                  <Heading as="h4" type="h4" fontSize="14px" fontWeight={500}>
                    Roles
                  </Heading>
                  <div className="border p-4 rounded-md">
                    <Heading as="h4" type="h4" fontSize="14px" fontWeight={500} lineHeight="1" className="mb-2">
                      Current Roles ({userRoles?.length})
                    </Heading>
                    <Flex flexDirection="column" className="w-full mb-2 overflow-y-scroll">
                      {userRoles.map((role) => (
                        <div key={role} className="row-item">
                          <Flex
                            flexDirection="row"
                            className="pl-0.5 items-center content-center w-full"
                          >
                            <Text as="span" fontSize="12px">
                              {role}
                            </Text>
                            <Box className="ml-auto">
                              <img
                                src="/x-inactive.svg"
                                onMouseOver={(e) =>
                                  (e.currentTarget.src = "/x.svg")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.src = "/x-inactive.svg")
                                }
                                width="20px"
                                className="mr-2 action-icon"
                                onClick={(e) => removeRole(role)}
                              />
                            </Box>
                          </Flex>
                        </div>
                      ))}
                    </Flex>
                    {rolesToAdd?.length > 0 && (
                      <div className="">
                        <Heading as="h4" type="h4" fontSize="14px" fontWeight={500}>
                          Add new role
                        </Heading>
                        <Flex flexDirection="column" className="w-full mb-2 overflow-y-scroll h-[20rem]">
                          {rolesToAdd?.map((role) => (
                            <div key={role} className="row-item">
                              <Flex
                                className="pl-0.5 items-center content-center w-full"
                                flexDirection="row"
                              >
                                <Text as="span" fontSize="12px">
                                  {role}
                                </Text>
                                <Box className="ml-auto">
                                  <img
                                    src="/plus-circle.svg"
                                    width="20px"
                                    className="mr-2 action-icon"
                                    onClick={(e) => addRole(role)}
                                  />
                                </Box>
                              </Flex>
                            </div>
                          ))}
                        </Flex>
                      </div>
                    )}
                  </div>
                </Flex>
                {userType === "google" &&
                  <div className="mb-3">
                    <Text className="mt-3">Enter City</Text>
                    <div className="flex flex-row items-center">
                      <TextField
                        aria-label="Enter Location"
                        id="location-input"
                        lines={1}
                        type="input"
                        placeholder={userHasLocation ? "Location already provided" : "Enter your city (e.g. San Jose or Vancouver)"}
                        value={locationTextVal}
                        onChange={(e) => { setLocationTextVal(e?.target?.value ?? "") }}
                      />
                      <div className="ml-2">
                        <Button
                          onClick={updateUserLocation}
                          className="bg-sky-700"
                          disabled={!locationTextVal || locationTextVal === user?.location}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                }
              </div>
              <Button
                shadow={false}
                outline
                onClick={closeModal}
              >
                Close
              </Button>
              {
                userType === UserType.token ?
                  <Button
                    className="text-white bg-red-600 ml-2"
                    onClick={handleDeleteTokenUser}
                  >
                    Delete
                  </Button>
                  : null
              }
            </div>
          </Transition.Child>
        </div>
        <style jsx>{`
          .row-item {
            padding: 4px 0;
            border-bottom: 1px solid #eaeaea;
            width: 100%;
          }
          .action-icon:hover {
            cursor: pointer;
          }
          .is-admin-circle {
            align-self: center;
            padding: 0;
            margin: 0;
            height: 8px;
            width: 8px;
          }
        `}</style>
      </Dialog>
    </Transition>
  );
};

export default ModifyUserModal;

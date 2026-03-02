import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../lib/redux/store";
import { Switch } from "@headlessui/react";
import toast from "react-hot-toast"

import { SongType, userHasRole, userHasRoleOrAdmin, UserRole } from "../lib/constants";
import { useShowRelatedSongEnabled } from "../lib/properties";
import { useTokenUser, useToken } from "../lib/uiUtils";
import { updateDeviceShowRelated, updateDisplaySongTypes, updateEmbedSongSheet, useDeviceShowRelated, useDisplaySongTypes, useIsEmbedSongSheet } from "../lib/userProperties";
import { updateTokenValue } from "../lib/redux/actions";
import { validateToken } from "../lib/tokens/uiToken";

import { Text, Heading, TextField, Box, Flex } from "../components/base";

import Property from "../ts/types/property.interface";
import UserInfo from "../ts/types/userInfo.interface";
import TokenUser from "../ts/types/tokenUser.interface";

import { getDateToSecString } from "../lib/dateUtils";

/**
   * Local Device Controls Component for no user and logged in user
   */
const DeviceControls = ({
  user,
  isDebug,
  session
}: {
  user: UserInfo | null; // user info, null if not signed in, haven't loaded yet
  isDebug: boolean | undefined | null | ""; // whether or not to show debug info
  session: any; // next auth session obj
}): JSX.Element => {
  const dispatch = useDispatch();
  const userStateLastUpdated = useSelector(
    (state: RootState) => state?.users?.lastUpdated
  )
  const userOptionsStateLastUpdated = useSelector(
    (state: RootState) => state?.userOptions?.lastUpdated
  )
  const favStateLastUpdated = useSelector(
    (state: RootState) => state?.favorites?.lastUpdated
  )


  const token = useToken() ?? "";
  const tokenUser: TokenUser = useTokenUser();

  const [tokenText, setTokenText] = useState(token);
  const [tokenFieldOpen, setTokenFieldOpen] = useState(false);
  const [enteredInvalidToken, setEnteredInvalidToken] = useState(false);
  const [tokenValidationLoading, setTokenValidationLoading] = useState(false);

  const userPropertyEmbedSongSheet = useIsEmbedSongSheet();

  const userDisplaySongTypes = useDisplaySongTypes();
  const [showPort, setShowPort] = useState(userDisplaySongTypes.includes(SongType.portuguese));
  const displayPortEnabled = userDisplaySongTypes.includes(SongType.portuguese);

  const canReadSongSheet = user?.roles.find((x) => x == UserRole.readSongSheet) !== undefined || user?.isAdmin || tokenUser;
  const canReadOtherLang = userHasRoleOrAdmin(user, UserRole.readOtherLang)

  // device show related song property
  const deviceShowRelatedSong: boolean = useDeviceShowRelated();

  // global show related song property. If off, user cannot set deviceShowRelated songs.
  const globalShowRelatedSongProperty: Property = useShowRelatedSongEnabled();
  const globalShowRelated = globalShowRelatedSongProperty?.value === "true";
  const userCanReadRelated = userHasRole(tokenUser, UserRole.readRelatedSong) || userHasRole(user, UserRole.readRelatedSong) || user?.isAdmin;

  const showRelated = globalShowRelated || userCanReadRelated;

  /**
   * Toggle the deviceShowRelated property in Redux (this is the local show related song property)
   *
   * @param enabled not used but used by the switch component
   * @returns     void
   */
  const setDeviceShowRelatedProperty = (enabled: boolean): void => {
    if (!showRelated) {
      // if global show related is disabled or user doesnt have role,
      // then we can't set the device show related property
      // ignore clicks
      return;
    }

    updateDeviceShowRelated(!deviceShowRelatedSong, dispatch);
    toast.success("Success!");
  };

  /**
  * Method to toggle the user property Embed Song Sheet and update in redux for global update
  */
  const toggleEmbedSongSheet = () => {
    if (userPropertyEmbedSongSheet) {
      updateEmbedSongSheet(false, dispatch);
      toast.success("Turned off song sheets!");
      return;
    } else {
      updateEmbedSongSheet(true, dispatch);
      toast.success("Turned on song sheets!");
      return;
    }
  }

  const toggleShowPortuguese = (showPortVal: boolean) => {
    if (showPortVal && !userDisplaySongTypes.includes(SongType.portuguese)) {
      setShowPort(true);
      updateDisplaySongTypes([...userDisplaySongTypes, SongType.portuguese], dispatch);
      toast.success("Enabled showing Portuguese Songs");
    } else {
      setShowPort(false)
      updateDisplaySongTypes(userDisplaySongTypes.filter(type => type !== SongType.portuguese), dispatch);
      toast.success("Disabled showing Portuguese Songs");
    }
  }

  /**
   * Handle Token form text change. Updates state.
   * 
   * @param e event
   */
  const handleTokenFormText = (e) => {
    setTokenText(e.target.value);
  };

  /**
   * Handle Token Submission. Checks if token is valid.
   */
  const handleTokenSubmit = async (e): Promise<void> => {
    const tokenUser: TokenUser | null = await validateToken(tokenText);

    if (tokenUser) {
      setTokenValidationLoading(true);
      dispatch(updateTokenValue(tokenText));
      setEnteredInvalidToken(false);
      setTokenFieldOpen(false);
      setTokenText("");
      toast.success("Successfully added token!");
      setTokenValidationLoading(false);
      return;
    }

    // invalid token
    dispatch(updateTokenValue(""));
    setEnteredInvalidToken(true);
    toast.error("Invalid token.");
  }

  /**
   * Clear the Redux cache store from redux persist
   */
  const clearCache = () => {
    // just remove the item in local storage since we store in local storage
    localStorage?.removeItem("persist:root");
    toast.success("Cleared Cache!");
  };

  /**
   * Handle when the token button is clicked which could be revoking or opening textfield to enter token
   */
  const handleTokenBtnClick = (e) => {
    // if token user already exists (token already inputted), we revoke the token
    if (tokenUser) {
      dispatch(updateTokenValue(""));
      toast.success("Removed token!");
      return;
    }

    // token not set, let's open textfield for user to enter token
    setTokenFieldOpen(true)
  }

  // only show token option if they arent logged in
  // or if admin 
  const showTokenOption = user?.isAdmin || !user

  return (
    <div className="mt-2 pt-2">
      <Heading as="h4" type="h4" fontSize="18px">
        Settings
      </Heading>
      <Flex
        className={`items-center mb-1 mt-2 ${showRelated ? "" : "pointer-events-none"}`}
      >
        <Switch
          checked={deviceShowRelatedSong}
          onChange={setDeviceShowRelatedProperty}
          className={`${deviceShowRelatedSong && showRelated ? "bg-blue-600" : "bg-gray-200"} inline inline-flex items-center h-6 rounded-full w-11 ${showRelated
            ? "cursor-pointer"
            : "opacity-30 cursor-not-allowed"
            }`}
        >
          <span className="sr-only"></span>
          <span
            className={`${deviceShowRelatedSong ? "translate-x-6" : "translate-x-1"
              } inline-block w-4 h-4 transform bg-white rounded-full`}
          />
        </Switch>
        <Text
          as="span"
          fontSize="14px"
          className={`pl-2 ${showRelated
            ? ""
            : "opacity-30 cursor-not-allowed line-through"
            }`}
        >
          Show related songs
        </Text>
        {!showRelated && (
          <Text
            as="span"
            fontSize="14px"
            className={`pl-2 opacity-30 cursor-not-allowed`}
          >
            (Feature not granted)
          </Text>
        )}
      </Flex>
      <Flex
        className={`mb-1 mt-2 ${canReadSongSheet ? "" : "pointer-events-none"}`}
      >
        <Switch
          checked={userPropertyEmbedSongSheet}
          onChange={toggleEmbedSongSheet}
          className={`${userPropertyEmbedSongSheet && canReadSongSheet ? "bg-blue-600" : "bg-gray-200"} inline inline-flex items-center h-6 rounded-full w-11 cursor-pointer ${canReadSongSheet
            ? "cursor-pointer"
            : "opacity-30 cursor-not-allowed"
            }`
          }
        >
          <span className="sr-only"></span>
          <span
            className={`${userPropertyEmbedSongSheet ? "translate-x-6" : "translate-x-1"
              } inline-block w-4 h-4 transform bg-white rounded-full`}
          />
        </Switch>
        <Flex flexDirection="column" className={`pl-2`}>
          <Box>
            <Text
              as="span"
              fontSize="14px"
              className={`${canReadSongSheet ? "" : "opacity-30 cursor-not-allowed line-through"}`}
            >
              Embed Song Sheet
            </Text>
            {!canReadSongSheet && (
              <Text
                className={`pl-2 ${canReadSongSheet ? "" : "opacity-30 cursor-not-allowed"}`}
                as="span"
                fontSize="14px"
              >
                (Feature not allowed)
              </Text>
            )}
          </Box>
          {canReadSongSheet && <Text as="p" fontSize="12px" color="#669966" fontWeight="600" lineHeight="1.2">You have access to song sheets.</Text>}
        </Flex>
      </Flex>
      <Flex
        className={`mb-1 mt-2 ${canReadOtherLang ? "" : "pointer-events-none"}`}
      >
        <Switch
          checked={displayPortEnabled}
          onChange={() => toggleShowPortuguese(!showPort)}
          className={`${displayPortEnabled && canReadOtherLang ? "bg-blue-600" : "bg-gray-200"} inline inline-flex items-center h-6 rounded-full w-11 cursor-pointer ${canReadOtherLang
            ? "cursor-pointer"
            : "opacity-30 cursor-not-allowed"
            }`
          }
        >
          <span className="sr-only"></span>
          <span
            className={`${displayPortEnabled ? "translate-x-6" : "translate-x-1"
              } inline-block w-4 h-4 transform bg-white rounded-full`}
          />
        </Switch>
        <Flex flexDirection="column" className={`pl-2`}>
          <Box>
            <Text
              as="span"
              fontSize="14px"
              className={`${canReadOtherLang ? "" : "opacity-30 cursor-not-allowed line-through"}`}
            >
              Show Portuguese Hymns
            </Text>
            {!canReadOtherLang && (
              <Text
                className={`pl-2 ${canReadOtherLang ? "" : "opacity-30 cursor-not-allowed"}`}
                as="span"
                fontSize="14px"
              >
                (Feature not allowed)
              </Text>
            )}
          </Box>
          {canReadOtherLang && <Text as="p" fontSize="12px" color="#669966" fontWeight="600" lineHeight="1.2">You have access to other languages.</Text>}
        </Flex>
      </Flex>
      <Flex className="mt-3 w-full" flexDirection="column">
        <Text as="p" fontSize="14px" fontWeight="500">
          Clear your device's local cache if things aren't working properly.
        </Text>
        <button className="setting-btn normal-btn" onClick={clearCache}>
          Clear Cache
        </button>
        <Text as="p" fontSize="12px" color="#8B9199" lineHeight="1.2" className="pt-1">
          Your user details are cached on your device for 24 hours.
        </Text>
      </Flex>
      {
        showTokenOption && <Flex className="mt-4 w-full" flexDirection="column">
          <Text as="p" fontSize="14px" className="mt-1" fontWeight="500">
            Token for more hymnals + song sheets.
          </Text>
          <div className="mt-1">
            {
              tokenFieldOpen ?
                <Flex flexDirection="row" className="items-center">
                  <div className="pr-2 block flex-1">
                    <TextField
                      ariaLabel="Enter token"
                      autoComplete=""
                      id="token-input"
                      type="input"
                      lines={1}
                      placeholder="Enter token"
                      value={tokenText}
                      onChange={handleTokenFormText}
                    />
                  </div>
                  <div className="block">
                    <button
                      type="button"
                      className={`inline-flex justify-center px-4 py-2 text-sm font-medium bg-green-700 ${tokenText?.length > 0
                        ? "hover:shadow-md hover:drop-shadow-md"
                        : "opacity-40 cursor-not-allowed"
                        } text-white border border-transparent rounded-md`}
                      onClick={handleTokenSubmit}
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center ml-2 px-4 py-2 border border-gray-300 border-solid text-sm font-medium text-gray-900 bg-white hover:shadow-md hover:drop-shadow-md rounded-md"
                      onClick={(e) => setTokenFieldOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Flex>
                :
                <button
                  className={`setting-btn ${tokenUser ? "with-valid-token" : "normal-btn"}`}
                  onClick={handleTokenBtnClick}
                >
                  {tokenUser ? "Remove Token" : "Add Token"}
                </button>
            }
          </div >
          {
            tokenUser ?
              <Text as="p" fontSize="12px" className="mt-1" color="rgb(22 163 74)" lineHeight="1.2">Welcome, {tokenUser?.name}. You may see hidden hymnals & song sheets.Please keep token to yourself.</Text >
              : enteredInvalidToken && tokenFieldOpen ?
                <Text as="p" fontSize="12px" className="mt-1" color="rgb(255 0 0)">The token you entered is invalid.</Text> :
                token && !tokenValidationLoading ?
                  <Text as="p" fontSize="12px" className="mt-1" color="rgb(255 0 0)">The token you have is invalid.</Text> :
                  null
          }

        </Flex >
      }
      {
        (user?.isAdmin || isDebug) &&
        <Flex className="mt-3 w-full" flexDirection="column">
          <Text as="p" fontSize="14px" fontWeight="500">
            Debugging Details
          </Text>
          <Flex flexDirection="row">
            <Text as="span" fontWeight="500" fontSize="12px" color="#666B72" lineHeight="1.5">User Cache Last Updated:</Text>
            <Text fontSize="12px" color="#666B72" lineHeight="1.5" className="pl-1"> {getDateToSecString(userStateLastUpdated)}</Text>
          </Flex>
          <Flex flexDirection="row">
            <Text as="span" fontWeight="500" fontSize="12px" color="#666B72" lineHeight="1.5">User Options Last Updated: </Text>
            <Text fontSize="12px" color="#666B72" lineHeight="1.5" className="pl-1">{getDateToSecString(userOptionsStateLastUpdated)}</Text>
          </Flex>
          <Flex flexDirection="row">
            <Text as="span" fontWeight="500" fontSize="12px" color="#666B72" lineHeight="1.5">Favorites Last Updated: </Text>
            <Text fontSize="12px" color="#666B72" lineHeight="1.5" className="pl-1">{getDateToSecString(favStateLastUpdated)}</Text>
          </Flex>
          <Flex flexDirection="row">
            <Text as="span" fontWeight="500" fontSize="12px" color="#666B72" lineHeight="1.5">Roles:</Text>
            <Text fontSize="12px" color="#666B72" lineHeight="1.5" className="pl-2">{user ? user?.roles?.join(", ") : "Not logged in"}</Text>
          </Flex>
          <Flex flexDirection="row">
            <Text as="span" fontWeight="500" fontSize="12px" color="#666B72" lineHeight="1.5">Session Expiration:</Text>
            <Text fontSize="12px" color="#666B72" lineHeight="1.5" className="pl-2">{session ? session.expires : "Not logged in"}</Text>
          </Flex>
        </Flex>
      }

      <style jsx>{`
        .setting-btn {
          border-radius: 6px;
          padding: 6px 10px;
          font-family: HKGrotesk;
          font-size: 14px;
          font-weight: 400;
          width: max-content;
        }

        .normal-btn {
          color: #999;
          background: #fff;
          border: 1px solid #eaeaea;
        }

        .with-valid-token {
          color: #D1595F;
          background: #fff;
          border: 1px solid #D1595F;
        }
      `}</style>
    </div>
  );
};

export default DeviceControls;
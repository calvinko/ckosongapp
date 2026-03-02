import React, { useContext, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";

import { Text, Box, Flex } from "./base";
import { useTokenUser, useOutsideAlerter, useUser } from "../lib/uiUtils";
import Row from "./row";
import ToggleButton from "./ToggleButton";
import { SongTypeConsumer, SongTypeContext } from "./SongTypeProvider";
import { getSongSheetType, SearchBy, SongSheetType, SongType, userHasRole, userHasRoleOrAdmin, UserRole } from "../lib/constants";
import {
  updateEmbedSongSheet,
  updateSongSheetType,
  useDisplaySongTypes,
  useIsEmbedSongSheet,
  useSongSheetType,
} from "../lib/userProperties";
import TokenUser from "../ts/types/tokenUser.interface";
import { userCanSeeBilingual } from "../lib/users/role";
import LanguagePill from "./LanguagePills";

enum EmbedSongSheet {
  embed = "embed",
  dontEmbed = "dontEmbed",
  embedAnnotations = "embedAnnotations"
}

const getEmbedSongSheet = (embedStr: string): EmbedSongSheet => {
  if (embedStr in EmbedSongSheet) {
    return EmbedSongSheet[embedStr as keyof typeof EmbedSongSheet];
  }
  return null;
};

/**
 * Popup options for the user to filter
 *
 * @param   popUpOn       whether the popup is on or not
 * @param   togglePopup   method toggle the popup on and off
 * @param   btnPos        Button Position to place popup
 * @param   searchBy      Search by value
 * @param   toggleSearchBy method to toggle the search by value
 * @returns
 */
const OptionPopup = ({
  popUpOn,
  togglePopup,
  btnPos,
  searchBy,
  toggleSearchBy,
}: {
  popUpOn: boolean;
  togglePopup: Function;
  btnPos: any;
  searchBy: SearchBy;
  toggleSearchBy: (arg0: any) => void;
}) => {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const user = useUser(session?.user?.email, status);
  const tokenUser: TokenUser = useTokenUser();
  const displaySongTypes: SongType[] = useDisplaySongTypes();

  /**
   * Toggle the user property Embed Song Sheet and update in redux
   *
   * @param embedVal EmbedSongSheet value
   */
  const toggleEmbedSongSheet = (embedVal: string) => {
    const embed = getEmbedSongSheet(embedVal);
    if (embed == EmbedSongSheet.embed) {
      updateEmbedSongSheet(true, dispatch);
      return;
    }
    updateEmbedSongSheet(false, dispatch);
  };
  const userPropertyEmbedSongSheet: boolean = useIsEmbedSongSheet();

  const toggleMusicSheetType = (sheetTypeStr: string) => {
    const sheetType = getSongSheetType(sheetTypeStr);

    if (sheetType != null) {
      updateSongSheetType(sheetType, dispatch)
    }
  };
  const userPropertySongSheetType: SongSheetType = useSongSheetType();

  // ref to settings popup
  const popupRef = useRef(null);
  useOutsideAlerter(popupRef, popUpOn, togglePopup);

  const allowSongSheetOption: boolean =
    userHasRoleOrAdmin(user, UserRole.readSongSheet) ||
    userHasRole(tokenUser, UserRole.readSongSheet);

  const allowChordSheetOption: boolean = userHasRoleOrAdmin(user, UserRole.musicTeam);

  return (
    <div className="settings-popup-box" ref={popupRef}>
      <Flex className="pr-1 pb-1 border-b border-[#d1d5da] min-h-[22px]">
        <Box className="mr-auto">
          <Text as="p" fontSize="14px" color="#444">
            OPTIONS
          </Text>
        </Box>
        <Box className="ml-auto">
          <img
            style={{ marginTop: "2px", cursor: "pointer" }}
            onClick={() => togglePopup(!popUpOn)}
            src="/x-inactive.svg"
            onMouseOver={(e) => (e.currentTarget.src = "/x.svg")}
            onMouseOut={(e) => (e.currentTarget.src = "/x-inactive.svg")}
            width="20px"
            height="20px"
          />
        </Box>
      </Flex>
      {
        <Row className="pb-2">
          <Text
            as="p"
            fontSize="10px"
            fontWeight="500"
            className="mt-1 mb-0 mx-0"
          >
            Song Type
          </Text>
          <Flex className={`w-full ${displaySongTypes?.length > 2 ? 'justify-center' : 'justify-start'}`}>
            <LanguagePill user={user} />
            {/* <SongTypeConsumer>
              {({ songType, changeSongType: setSongType }) => (
                <ToggleButton
                  name1={SongType.english}
                  option1="English"
                  name2={SongType.chinese}
                  option2="Chinese"
                  active={songType}
                  toggleActive={setSongType}
                />
              )}
            </SongTypeConsumer> */}
          </Flex>
        </Row>
      }
      <Row className="pb-2 border-t border-[#d1d5da]">
        <Text
          as="p"
          fontSize="10px"
          className="mt-1 mb-0 mx-0"
          fontWeight="500"
        >
          Search by
        </Text>
        <Flex className="w-full justify-center">
          <ToggleButton
            name1={SearchBy.default}
            option1="Default"
            name2={SearchBy.lyrics}
            option2="Lyrics"
            active={searchBy}
            toggleActive={toggleSearchBy}
          />
        </Flex>
      </Row>
      {
        allowSongSheetOption ? (
          <Row className="pb-2 border-t border-[#d1d5da]">
            <Text
              as="p"
              fontSize="10px"
              className="mt-1 mb-0 mx-0"
              fontWeight="500"
            >
              Embed Song Sheet
            </Text>
            <Flex className="w-full justify-center">
              <ToggleButton
                name1={EmbedSongSheet.embed}
                option1="Yes"
                name2={EmbedSongSheet.dontEmbed}
                option2="No"
                active={
                  userPropertyEmbedSongSheet === true
                    ? EmbedSongSheet.embed
                    : EmbedSongSheet.dontEmbed
                }
                toggleActive={toggleEmbedSongSheet}
              />
            </Flex>
          </Row>
        ) : null
      }
      {
        allowChordSheetOption ? (
          <Row className="pb-2 border-t border-[#d1d5da]">
            <Text
              as="p"
              fontSize="10px"
              className="mt-1 mb-0 mx-0"
              fontWeight="500"
            >
              Song Sheet Type
            </Text>
            <Flex className="w-full justify-center">
              <ToggleButton
                name1={SongSheetType.default}
                option1="Default"
                name2={SongSheetType.chords}
                option2="Chords"
                active={
                  userPropertySongSheetType === SongSheetType.default
                    ? SongSheetType.default
                    : SongSheetType.chords
                }
                toggleActive={toggleMusicSheetType}
              />
            </Flex>
          </Row>
        ) : null
      }
      <style jsx>{`
          .settings-popup-box {
            transition: all 0.2s ease-in-out, border-radius 0.2s step-start,
            border 0.2s ease-in-out;
            width: 180px;
            border-radius: 6px;
            position: absolute;
            z-index: 100;

            // to place over the button but to the left
            left: ${btnPos && Math.floor(btnPos.right) - 178}px;
            top: ${btnPos && Math.floor(btnPos.top)}px;

            background: #fff;
            padding: 8px;
            box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
          }

          .line {
            border: 1px solid #d1d5da;
            border-bottom: 0px;
          }
      `}</style>
    </div >
  );
};

export default OptionPopup;

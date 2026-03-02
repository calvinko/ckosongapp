import React, { useRef } from "react";

import { useOutsideAlerter } from "../utils/utils";
import ToggleButton from "./MinToggleButton";
import { getSecondLanguageOptions, SongType } from "../utils/constants";
import { SongTypeConsumer, EmbedSongSheetContext, EmbedSongSheetConsumer } from "../utils/utils"

import xIcon from "../assets/x.svg";
import xInActiveIcon from "../assets/x-inactive.svg";
import LanguagePill from "./MinLanguagePill";

const SECOND_LANGUAGE = process.env.REACT_APP_SECOND_LANGUAGE

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
const MinOptionPopup = ({
  popUpOn,
  togglePopup,
  btnPos,
}: {
  popUpOn: boolean;
  togglePopup: Function;
  btnPos: any;
}) => {
  // ref to settings popup
  const popupRef = useRef(null);
  useOutsideAlerter(popupRef, popUpOn, togglePopup);

  const { secondLanguageName, secondLanguageOption } = getSecondLanguageOptions();

  return (
    <div className="settings-popup-box" ref={popupRef} style={{
      "left": `${btnPos && Math.floor(btnPos.right) - 178}px`,
      "top": `${btnPos && Math.floor(btnPos.top)}px`
    }}>
      <div className="settings-inner-box">
        <div className="mr-auto">
          <p className="text-sm" color="#444">
            OPTIONS
          </p>
        </div>
        <div className="ml-auto">
          <img
            style={{ marginTop: "2px", cursor: "pointer" }}
            onClick={() => togglePopup(!popUpOn)}
            src={xInActiveIcon}
            onMouseOver={(e) => (e.currentTarget.src = xIcon)}
            onMouseOut={(e) => (e.currentTarget.src = xInActiveIcon)}
            width="20px"
            height="20px"
            alt=""
          />
        </div>
      </div>
      <div className="flex-wrap flex">
        <p className="text-xs pt-1">
          Song Type
        </p>
        <div className="flex justify-items-center w-full pt-1 flex-wrap">
          <LanguagePill />
        </div>
      </div >
      {/* <div className="flex flex-wrap line mt-3 pt-1" >
        <p className="text-xs pt-1">
          Embed Song Sheet
        </p>
        <div className="flex justify-items-center w-full pt-1">
          <EmbedSongSheetConsumer>
            {({ embed, setEmbed }) => (
              <ToggleButton
                name1={"true"}
                option1="Yes"
                name2={"false"}
                option2="No"
                active={embed.toString()}
                toggleActive={setEmbed}
              />
            )}
          </EmbedSongSheetConsumer>
        </div>
      </div> */}
    </div>
  );
};

export default MinOptionPopup;

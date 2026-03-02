import AsyncSelect from "react-select/async";
import React, { useContext, useRef, useState } from "react";
import HymnTag from "./MinHymnTag";
import { SongType } from "../utils/constants";
import { SongTypeConsumer, SongTypeContext } from "../utils/utils";
import successSliderIcon from "../assets/sliders-success.svg";
import sliderIcon from "../assets/sliders.svg";
import MinOptionPopup from "./MinOptionPopup";

const SECOND_LANGUAGE = process.env.REACT_APP_SECOND_LANGUAGE

// import HymnTag from "./HymnTag";

/**
 * A custom dropdown option to show the HymnTag and song name
 *
 * @param props
 */
const Option = (props: any) => {
  const { className, cx, getStyles, innerRef, innerProps, data } = props;
  const { data: song } = data;

  return (
    <div
      ref={innerRef}
      css={getStyles("option", props)}
      className={`search-option-box ${cx(className)}`}
      {...innerProps}
    >
      <div className="w-full py-2 px-3">
        <p className="mb-2 text-base">{song?.name}</p>
        <HymnTag
          hymnBook={song.hymn}
          pageNumber={song.pageNumber}
          allowLink={false}
        />
      </div>
    </div>
  );
};

/**
 * The select component for searching songs for mini song app
 *
 * Props:
 *  - promiseOptions: method that returns a promise of a list of SelectSongCandidate, given the input
 *  - onChange: method to handle whenever one of the elements in the select gets clicked
 */
const MinSongSearchSelect = ({
  promiseOptions,
  onChange,
  handleMenuOpen,
  handleMenuClose,
  defaultEnglishSongOptions,
  defaultSecondLanguageSongOptions,
}: {
  promiseOptions: (inputValue: string) => Promise<any[]>;
  onChange: any;
  handleMenuOpen: () => void;
  handleMenuClose: () => void;
  defaultEnglishSongOptions: any[];
  defaultSecondLanguageSongOptions: any[];
}) => {

  const [popupOn, togglePopup] = useState(false);
  const { songType: songTypeCtxValue } = useContext(SongTypeContext);
  // ref to the button, so we know the absolute dimensions of it
  const buttonRef = useRef<HTMLImageElement>(null);
  const btnPos = buttonRef?.current && buttonRef?.current?.getBoundingClientRect();

  const handlePopupClick = (e) => {
    togglePopup(!popupOn);
  };

  let placeholderTxt = "";
  switch (songTypeCtxValue) {
    case SongType.tamil:
      placeholderTxt = "Try `tml1 5` or `I love your appearing`";
      break;
    case SongType.chinese:
      placeholderTxt = "Try `h2 5` or `歌2 5` or `在十架`";
      break;
    case SongType.portuguese:
      placeholderTxt = "Try `p1 15` or `O Amor do Pai`";
      break;
    case SongType.english:
    default:
      placeholderTxt = "Try `sol1 16` or `in the cross`";
  }

  return (
    <div className="flex-wrap flex">
      <div className="flex-[20_0_0%] pr-3">
        <AsyncSelect
          isClearable
          isDisabled={popupOn}
          isSearchable
          components={{ Option }}
          name="hymn-search"
          loadOptions={promiseOptions}
          onChange={onChange}
          cacheOptions
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
          defaultOptions={songTypeCtxValue == SongType.english ? defaultEnglishSongOptions : defaultSecondLanguageSongOptions}
          styles={{
            input: (provided, state) => ({
              ...provided,
              fontFamily: "HkGrotesk",
            }),
            option: (base) => ({
              ...base,
              fontFamily: "HkGrotesk",
            }),
          }}
          placeholder={placeholderTxt}
        />
      </div>
      <div className="flex flex-[1_0_0%]">
        <img
          ref={buttonRef}
          src={
            songTypeCtxValue != SongType.english
              ? successSliderIcon
              : sliderIcon
          }
          width="24px"
          onClick={handlePopupClick}
          className="is-content-search-icon"
          title="Search Options"
          alt="Change Search Options"
        />
      </div>
      {popupOn ? <MinOptionPopup popUpOn={popupOn} togglePopup={togglePopup} btnPos={btnPos} /> : null}
    </div>
  );
};

export default MinSongSearchSelect;

import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import React, { useContext, useState } from "react";
import AsyncSelect from "react-select/async";
import { SearchBy, SongType } from "../lib/constants";
import SelectSongCandidate from "../ts/types/selectSongCandidate.interface";
import { SongTypeContext } from "./SongTypeProvider";
import { Box, Text } from "./base"
import HymnTag from "./HymnTag";

/**
 * Renderers for displaying markdown, whenever searching via lyrics
 */
const renderers = {
  paragraph: ({ children }) => (
    <Text as="span" className="m-0" lineHeight="1.3" fontWeight="300" fontSize="13px">
      {children}
    </Text>
  ),
  emphasis: ({ children }) => (
    <Text as="span" className="m-0" lineHeight="1.4" fontWeight="700" fontSize="13px">
      {children} EM
    </Text>
  ),
  strong: ({ children }) => (
    <Text as="span" className="m-0" lineHeight="1.4" fontWeight="700" fontSize="13px">
      {children}
    </Text>
  ),
  text: ({ children }) => (
    <Text as="span" className="m-0" lineHeight="1.4" fontWeight="inherit " fontSize="13px">
      {children}
    </Text>
  ),
  root: ({ children
  }) => (
    <Text className="mt-1.5" as="p" lineHeight="1.3" fontWeight="300" fontSize="13px">
      {children}
    </Text>
  ),
};

/**
 * A custom dropdown option to show the HymnTag and song name
 *
 * @param props
 */
const Option = (props): JSX.Element => {
  const {
    children,
    className,
    cx,
    getStyles,
    isDisabled,
    isFocused,
    isSelected,
    innerRef,
    innerProps,
    data,
  } = props;

  const { data: song, matchedText, newMatchedText } = data;

  // get show text for text that matches the input value, if it exists
  let showText = "";
  if (matchedText) {
    const withoutHeaderText = matchedText.replace("#", "");
    const firstEm = withoutHeaderText.indexOf("<em>");
    if (song.songType == SongType.chinese) {
      showText = withoutHeaderText.slice(0, 100);
      if (firstEm > 100) {
        // start showing 200 characters of lyrics 20 characters before the first <em>
        showText = withoutHeaderText.slice(firstEm - 20, firstEm + 80);
      }
    } else {
      showText = withoutHeaderText.slice(0, 200);
      if (firstEm > 200) {
        // start showing 200 characters of lyrics 20 characters before the first <em>
        showText = withoutHeaderText.slice(firstEm - 20, firstEm + 180);
      }
    }
  }

  let newShowText = []
  if (newMatchedText) {
    let isCutShort = false;
    showText = newMatchedText?.content

    // positionIntervals look like:
    // [ [ 322, 329 ], [ 330, 338 ] ]
    // which should be non-overlapping intervals (see /api/songs/search.js)
    const positionIntervals = newMatchedText.positionIntervals; // [][]
    if (positionIntervals?.length > 0) {
      let firstPos = positionIntervals[0][0]
      let currInterval = 0;

      // for every matched interval, let's bold the text
      for (let i = 0; i < positionIntervals.length; i++) {
        let interval = positionIntervals[i];

        // if interval is 20 characters before the first interval, then let's not add it
        if (interval[1] < firstPos - 20) {
          currInterval = interval[1];
          continue;
        }
        // if interval is 250 characters after teh first interval, then let's cut it short
        if (interval[1] > firstPos + 250) {
          currInterval = interval[1];
          isCutShort = true;
          break;
        }

        // else add the text
        newShowText.push(
          <span className="m-0 p-0">
            {showText.slice(Math.max(currInterval, firstPos - 20), interval[0])}
          </span>
        );
        newShowText.push(
          <span className="m-0 p-0 font-bold">
            {showText.slice(interval[0], interval[1])}
          </span>
        );

        currInterval = interval[1];
      }
      // we are done looping through the intervals, or we cut short
      // based on this, let's add the rest of the text
      // or 150 characters more from the current interval we cut short on, to provide more context
      if (currInterval < showText.length || isCutShort) {
        newShowText.push(
          <span className="m-0 p-0">
            {showText.slice(currInterval, Math.min(currInterval + 150, showText.length))}
          </span>
        )
      }
    }
    else {
      // if no positions given (the matcher plugin doesn't show positions if the results are based off of tolerance 
      // e.g. doesn't show when search query has typos but we have results)
      // we just add the first 250 characters of the song
      newShowText.push(
        <span className="m-0 p-0">
          {showText.slice(0, 250)}
        </span>
      )
    }
  }

  return (
    <div
      ref={innerRef}
      css={getStyles("option", props)}
      className={cx(className)}
      {...innerProps}
    >
      <Box width="100%">
        <Text as="p" className="mb-1" fontSize="16px">
          {song.name}
        </Text>
        <HymnTag
          hymnBook={song.hymn}
          pageNumber={song.pageNumber}
          allowLink={false}
        />
        <Box>
          <p className="m-1.5 p-0 text-xs leading-5 text-[#0A162A]">
            {newMatchedText && newShowText}
          </p>
        </Box>
        {(matchedText) && (
          <Markdown
            components={renderers}
            rehypePlugins={[rehypeRaw]}
          >
            {showText}
          </Markdown>
        )}
      </Box>
    </div>
  );
};

/**
 * The select component for searching songs
 *
 * Props:
 *  - searchBy: SearchBy argument for searching via lyrics or by default (name, book, page number)
 *  - promiseOptions: method that returns a promise of a list of SelectSongCandidate, given the input
 *  - onChange: method to handle whenever one of the elements in the select gets clicked
 *  - isDisabled: if the select component is disabled
 */
const SongSearchSelect = ({
  searchBy,
  promiseOptions,
  onChange,
  handleMenuOpen,
  handleMenuClose,
  defaultEnglishSongOptions,
  defaultChineseSongOptions,
  defaultPortugueseSongOptions,
  isDisabled = false,
}: {
  searchBy: SearchBy;
  promiseOptions: (inputValue: string) => Promise<SelectSongCandidate[]>;
  onChange: Function;
  handleMenuOpen: Function;
  handleMenuClose: Function;
  defaultEnglishSongOptions: SelectSongCandidate[];
  defaultChineseSongOptions: SelectSongCandidate[];
  defaultPortugueseSongOptions: SelectSongCandidate[];
  isDisabled?: boolean;
}) => {
  const { songType: songTypeCtxValue } = useContext(SongTypeContext);

  let placeholderTxt = "Search by page or song name";
  if (searchBy == SearchBy.lyrics) {
    switch (songTypeCtxValue) {
      case SongType.chinese:
        placeholderTxt = "Try `何等興奮`";
        break;
      case SongType.portuguese:
        placeholderTxt = "Try `Com braços abertos`";
        break;
      case SongType.english:
      default:
        placeholderTxt = "Try `my Abba stretches out`";
    }
  }

  let defaultOptions;
  switch (songTypeCtxValue) {
    case SongType.chinese:
      defaultOptions = defaultChineseSongOptions;
      break;
    case SongType.portuguese:
      defaultOptions = defaultPortugueseSongOptions;
      break;
    case SongType.english:
    default:
      defaultOptions = defaultEnglishSongOptions;
  }

  return (
    <AsyncSelect
      isDisabled={isDisabled}
      isClearable
      isSearchable
      components={{ Option }}
      name="hymn-search"
      cacheOptions={false}
      loadOptions={promiseOptions}
      onChange={onChange}
      onMenuOpen={handleMenuOpen}
      onMenuClose={handleMenuClose}
      defaultOptions={defaultOptions}
      styles={{
        input: (provided) => ({
          ...provided,
          gridTemplateColumns: "0 minmax(min-content, 1fr)"
        }),
        placeholder: (base) => {
          return {
            ...base,
            pointerEvents: "none",
            userSelect: "none",
            MozUserSelect: "none",
            WebkitUserSelect: "none",
            msUserSelect: "none"
          };
        },
      }}
      placeholder={placeholderTxt}
      blurInputOnSelect={true}
      value={null} // this is a hack to clear the input value
    />
  );
};

export default SongSearchSelect;

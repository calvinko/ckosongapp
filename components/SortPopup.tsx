import React from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";

import { FavoriteSongSortBy, HymnContentSortBy, UserSortBy } from "../lib/constants";
import { Popup, Text, Box, Flex } from "./base";
import Row from "./row";

interface SortByOptionType {
  label: string;
  value: FavoriteSongSortBy | HymnContentSortBy | UserSortBy;
  showOption?: () => boolean | undefined;
}

/**
 * Popup for Sorting Favorite songs
 */
const SortPopup = ({
  popUpOn,
  togglePopup,
  btnPos,
  currSortBy,
  updateSortBy,
  options,
}: {
  popUpOn: boolean; // whether pop up is on or off
  togglePopup: Function; // method to toggle pop up on and off in parent component
  btnPos?: any; // button position to place pop up
  currSortBy: FavoriteSongSortBy | HymnContentSortBy | UserSortBy; // current sort by
  updateSortBy?: (
    sortBy: FavoriteSongSortBy | HymnContentSortBy | UserSortBy,
    dispatch: Dispatch<any>
  ) => void; // method to update sort by
  options: SortByOptionType[];
}): JSX.Element => {
  const dispatch = useDispatch();

  const handleSortByClick = (sortBy: FavoriteSongSortBy | HymnContentSortBy | UserSortBy) => {
    // call given update method if it exists
    updateSortBy ? updateSortBy(sortBy, dispatch) : null;
    // close popup after update
    togglePopup(!popUpOn);
  };

  return (
    <Popup
      popUpOn={popUpOn}
      togglePopup={togglePopup}
      btnPos={btnPos}
      width={"120px"}
    >
      <Flex className="pb-1 min-h-[22px] border-b border-[#d1d5da]">
        <Box className="mr-auto">
          <Text as="p" fontSize="14px" color="#444">
            Sort By
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
      <>
        {options.map(
          (option, index) =>
            (option?.showOption ? option?.showOption() : true) && (
              <Row key={"sort-by-option-" + index} className={`${index === 0 ? "pt-0.5" : "pt-0"}`}>
                <SortByOption
                  handleSortByClick={handleSortByClick}
                  sortByName={option?.label ?? "Unknown"}
                  sortBy={option?.value}
                  currSortBy={currSortBy}
                />
              </Row>
            )
        )}
      </>
      <style jsx>{``}</style>
    </Popup >
  );
};

/**
 * Individual Sort By Option
 */
const SortByOption = ({
  currSortBy,
  sortBy,
  sortByName,
  handleSortByClick,
}: {
  currSortBy: FavoriteSongSortBy | HymnContentSortBy; // the current sort by (which should be selected)
  sortBy: FavoriteSongSortBy | HymnContentSortBy; // sort by option for this component
  sortByName: string; // name of the sort by option
  handleSortByClick: Function; // method to handle sort by click
}): JSX.Element => {
  return (
    <div className="sort-option" onClick={() => handleSortByClick(sortBy)}>
      <p className="sort-option-name">{sortByName}</p>
      <style jsx>{`
        .sort-option-name {
          color: ${currSortBy == sortBy ? "#ffffff" : "#00000"};
          font-size: 12px;
          font-weight: 500;
        }
        .sort-option {
          cursor: pointer;
          width: 100%;
          padding-left: 4px;
          padding-top: 6px;
          padding-bottom: 6px;
          margin: 2px 0;
          border-radius: 4px;
          background-color: ${currSortBy == sortBy ? "#155da1" : "transparent"};
        }
        .sort-option:hover {
          background-color: ${currSortBy == sortBy ? "#3E87CD" : "#f5f5f5"};
        }
      `}</style>
    </div>
  );
};

export default SortPopup;

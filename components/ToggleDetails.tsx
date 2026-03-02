// @ts-nocheck
import React from "react";
import { useState } from "react";

import { Box, Flex } from "./base"
import ArrowDownIcon from "./icons/ArrowDownIcon"
import ArrowRightIcon from "./icons/ArrowRightIcon"

/**
 * Details that opens up after a click
 */
const ToggleDetails = ({
  toggleText,
  textStyle,
  iconStyle,
  children,
}: {
  toggleText: JSX.Element | JSX.Element[] | string;
  textStyle?: React.CSSProperties;
  iconStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  children: JSX.Element;
}): JSX.Element => {
  const [detailsOpened, toggleDetails] = useState(false);

  // toggles more details
  const openDetails = (e) => {
    toggleDetails(!detailsOpened);
  };

  return (
    <Box>
      <Flex
        className="items-center cursor-pointer gap-x-0.5"
        onClick={openDetails}
      >
        {
          detailsOpened ?
            <ArrowDownIcon
              className="detail-icon inline-block"
              alt="Click to toggle details"
              height="8px"
              weight="8px"
              fill="#8b9199"
            />
            : <ArrowRightIcon
              className="detail-icon inline-block	"
              alt="Click to toggle details"
              height="8px"
              weight="8px"
              fill="#8b9199"
            />
        }
        <p className="detail-text" style={{ ...textStyle }}>
          {toggleText}
        </p>
      </Flex>
      {detailsOpened && children}
      <style jsx>
        {`
          .detail-text {
            margin-left: 2px;
            font-size: 12px;
            color: #8b9199;
            cursor: pointer;
          }
          .detail-icon {
            color: #8b9199;
            padding-right: 4px;
            display: inline-block;
            height: 8px;
          }
        `}
      </style>
    </Box>
  );
};

export default ToggleDetails;

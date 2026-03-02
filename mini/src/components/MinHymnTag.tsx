import React from "react";
import { useNavigate } from "react-router-dom";

import { getHymnBook } from "../utils/constants";

/**
 * Background Color of the tag for every HymnBook
 *
 *  This needs to be up to date to lib/constants#HymnBook
 */
enum HymnBookToTagColor {
  GBH = "#577590",
  GFH1 = "#F9C74F",
  GFH2 = "#F8961E",
  SOL1 = "#43AA8B",
  SOL2 = "#90BE6D",
  SOL3 = "#E98980",
  SOMH1 = "#e63946",
  SOMH2 = "#740e15",
  GFH = "#F3722C",
  MAM = "#0081AF",
  MAM2 = "#197278",
  MAM3 = "#194378",
  SOS = "#70066e",
  VanMusicTeam = "#F94144",
  HC1 = "#5F9EA0",
  HC2 = "#a05f9e",
  HC3 = "#247ba0",

  P1 = "#2F0A28",
  P2 = "#90BE6D",
  P2025 = "#00897B",
  P2026 = "#F9C74F",

  S1 = "#2F0A28",
  S2 = "#00897B",
  CHC1 = "#5F9EA0",
  CHC2 = "#a05f9e",
  EL = "#577590",
  H1 = "#F9C74F",
  H2 = "#F8961E",
  H3 = "#43AA8B",
  H4 = "#90BE6D",
  H5 = "#e63946",
  H6 = "#F3722C",
  H7 = "#F94144",
  H8 = "#fc5185",
  H9 = "#E2943F",
  H10 = "#3fc1c9",
  H11 = "#364f6b",
  H12 = "#b56576",
  H13 = "#eaac8b",
  H14 = "#bbd0ff",
  H15 = "#d1495b",
  H16 = "#546667",
  H17 = "#22AEBA",
  H18 = "#8694DE",
  H19 = "#DECE6C",
  H20 = "#BDAA92",
  H21 = "#6B9AC4",
  H22 = "#9E4784",
  H23 = "#194378",

  SOSC = "#9E4784",
  MAM3C = "#194378",
}

/**
 * Get the tag's color based on the hymn book's slug
 *
 * @param hymnBook Hymn Book's slug
 * @returns the color in hex
 */
const getTagColor = (hymnBook: string): string => {
  if (hymnBook in HymnBookToTagColor) {
    return HymnBookToTagColor[hymnBook];
  }

  // default
  return "#247ba0";
};

/**
 * A Tag, given a hymn. Renders style based on the hymn (ex: SOL1), for the mini song app
 *
 * @param hymnBook shorthand of the hymn (@see lib/constants#HymnBook)
 */
export const HymnTag = ({
  hymnBook,
  pageNumber,
  style,
  className,
  fullName = true,
  allowLink = true,
}: {
  hymnBook: string;
  style?: React.CSSProperties;
  pageNumber?: number;
  fullName?: boolean;
  allowLink?: boolean;
  className?: string;
}): JSX.Element => {
  const navigate = useNavigate();
  const color = getTagColor(hymnBook);

  const handleTagClick = (e) => {
    navigate(`/books/${hymnBook}`);
  };

  return (
    <div
      style={{
        ...style,
        background: color,
        cursor: allowLink ? "pointer" : "default",
      }}
      className={`tag ${className ? className : ""}`}
      color={color}
      onClick={(e) => (allowLink ? handleTagClick(e) : (e) => { })}
    >
      <>
        {fullName ? getHymnBook(hymnBook) : hymnBook} {pageNumber}
      </>
    </div>
  );
};

export default HymnTag;

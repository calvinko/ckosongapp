import React from "react";
import { Text, Flex } from "./base";
import { BOOK_REQUIRES_BORDER } from "../lib/constants"

/**
 * A Hymn Book, with cover image and title. We have custom images for select books, since they are higher quality cover images
 *
 * @see lib/constants#HymnBook for supported HymnBooks
 */
export const HymnBookComponent = ({
  children,
  name,
  handleClick,
  imageUrl,
}): JSX.Element => {
  // custom logic to change book image url, for better quality
  if (name === "EL") {
    imageUrl = "/book-covers/elcover.jpg";
  } else if (name.length >= 2 && name[0] == "H") {
    imageUrl = `/book-covers/${name.toLowerCase()}cover.jpg`;
  }

  return (
    <div className="hymn-book" onClick={(e) => handleClick(e, name)}>
      <div className="image-box">
        {imageUrl ? (
          <img
            src={imageUrl}
            className="book-cover"
            height="100%"
            width="100%"
          />
        ) : (
          <Flex
            className="content-center justify-center min-h-full"
            flexDirection="column"
          >
            <Text as="p" fontSize="10px" className="text-center">
              {children}
            </Text>
          </Flex>
        )}
      </div>
      <Text as="p" fontSize="13px" className="py-1 px-0 mt-1" lineHeight="16px">
        {children}
      </Text>
      <style jsx>{`
        .hymn-book {
          margin: 0.8rem;
          text-decoration: none;
          width: 120px;

          transition: color 0.15s ease, border-color 0.15s ease;
          cursor: pointer;
        }

        .image-box {
          height: 160px;
          box-shadow: 0 0.5px 0.5px 0 rgba(0, 0, 0, 0.24);
          overflow: hidden;
          cursor: pointer;

          border-radius: 4px;
          border: ${imageUrl && BOOK_REQUIRES_BORDER.includes(name)
          ? "1px solid #eaeaea"
          : "none"
        };
        }

        .book-cover {
          display: block;
        }
      `}</style>
    </div>
  );
};

export default HymnBookComponent;

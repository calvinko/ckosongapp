import React, { useContext } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import HymnBookComponent from "./HymnBookComponent";
import ToggleButton from "./ToggleButton";
import LanguagePills from "./LanguagePills"
import { Heading, Box, Flex, Button, Text } from "./base";
import { SongTypeContext } from "./SongTypeProvider";

import { HymnBook, getHymnBook, SongType, userHasRoleOrAdmin, UserRole, OTHER_HYMN_BOOKS, ALLOWED_CHINESE_BOOKS } from "../lib/constants";
import { useBooks, useTokenUser, useUser } from "../lib/uiUtils";

import SongMeta from "../ts/types/songMeta.interface";
import TokenUser from "../ts/types/tokenUser.interface";
import { userCanSeeBilingual } from "../lib/users/role";

const NumberCharacterRegex = new RegExp("([0-9]+)|([a-zA-Z]+)", "g");

/**
 * Navigates the hymns from book -> list of songs
 *
 * @param songs list of songs
 */
export const HymnNavigator = ({
  songs,
}: {
  songs: { [key: string]: SongMeta };
}) => {
  const router = useRouter();
  const [showOldBooks, setShowOldBooks] = React.useState(false);
  const { data: session, status } = useSession();
  const user = useUser(session?.user?.email, status);
  const { songType, changeSongType: toggleSongType } = useContext(SongTypeContext);
  const books = useBooks();
  const tokenUser: TokenUser = useTokenUser();

  let chineseBookMeta = [];
  let englishBookMeta = [];
  let portugueseBookMeta = [];

  // note that HymnBookComponent also overrides the images for some books, for better quality images
  if (books != undefined) {
    englishBookMeta = Object.values(books).filter(book => book?.songType == SongType.english);
    chineseBookMeta = Object.values(books).filter(book => book?.songType == SongType.chinese);
    portugueseBookMeta = Object.values(books).filter(book => book?.songType == SongType.portuguese);
  }

  // filter out other books unless given access
  if (!userHasRoleOrAdmin(user, UserRole.readOtherSongs)) {
    englishBookMeta = englishBookMeta.filter(book => !OTHER_HYMN_BOOKS.includes(book.hymnBook))
    chineseBookMeta = chineseBookMeta.filter(book => !OTHER_HYMN_BOOKS.includes(book.hymnBook))
    portugueseBookMeta = portugueseBookMeta.filter(book => !OTHER_HYMN_BOOKS.includes(book.hymnBook))
  }

  if (!userCanSeeBilingual(user)) {
    chineseBookMeta = chineseBookMeta.filter(book => ALLOWED_CHINESE_BOOKS.includes(book.hymnBook));
  }

  // commented out for future filtering if needed
  // if (!userHasRoleOrAdmin(user, UserRole.readHC3)) {
  //   englishBookMeta = englishBookMeta.filter(book => !["HC3", "CHC3"].includes(book.hymnBook))
  //   chineseBookMeta = chineseBookMeta.filter(book => !["HC3", "CHC3"].includes(book.hymnBook))
  // }

  chineseBookMeta.sort((a, b) => {
    // Prioritize S1 and S2 first
    const aIsS = a.hymnBook?.startsWith("S");
    const bIsS = b.hymnBook?.startsWith("S");

    if (aIsS && !bIsS) return -1;
    if (!aIsS && bIsS) return 1;

    // if H11, split it into ["H", 11]
    const aSplit = a.hymnBook?.match(NumberCharacterRegex);
    const bSplit = b.hymnBook?.match(NumberCharacterRegex);

    if (aSplit[0].localeCompare(bSplit[0]) == 0) {
      return aSplit[1] - bSplit[1];
    }
    return aSplit[0].localeCompare(bSplit[0]);
  });

  let bookMeta: any[];
  let notSearchableMeta: any[];
  switch (songType) {
    case SongType.english:
      bookMeta = englishBookMeta.filter(book => book.isSearchable)
      notSearchableMeta = englishBookMeta.filter(book => !book.isSearchable)
      break;
    case SongType.portuguese:
      bookMeta = portugueseBookMeta.filter(book => book.isSearchable);
      notSearchableMeta = portugueseBookMeta.filter(book => !book.isSearchable);
      break;
    case SongType.chinese:
    default:
      bookMeta = chineseBookMeta.filter(book => book.isSearchable);
      notSearchableMeta = chineseBookMeta.filter(book => !book.isSearchable);
      break;
  }

  const hasNotSearchableMeta = notSearchableMeta?.length > 0;

  /**
   * when a book is clicked, we go to list of songs for that book
   * @see pages/books/[bookName].tsx
   */
  const handleBookClick = (e, name) => {
    router.push(`/books/${name}`);
  };

  return (
    <Box className="mt-8">
      <Heading as="h4" type="h4" className="mb-2">
        Navigate Songs By Book
      </Heading>
      {
        <Box width="w-full">
          <LanguagePills user={user} />
          {/* <ToggleButton
            name1={SongType.english}
            option1="English"
            name2={SongType.chinese}
            option2="Chinese"
            active={songType}
            toggleActive={toggleSongType}
          /> */}
        </Box>
      }
      {/* {(
        <Flex flexDirection="row">
          <div className="notice-card mb-4 mt-4">
            <Box className="p-4">
              <Text as="p" fontSize="14px" color="#8B9199">
                New! 🎉 You can view song sheets for each song! 
                Create an account and leave Feedback with your email requesting
              </Text>
            </Box>
          </div>
        </Flex>
      )} */}
      <Flex
        flexDirection="row"
        className="justify-center	flex-wrap my-3 w-full sm:w-[90%]"
      >
        {bookMeta.map((book) => {
          return (
            <HymnBookComponent
              name={book.hymnBook}
              handleClick={handleBookClick}
              imageUrl={book.imageUrl}
              key={book.hymnBook}
            >
              {book.bookFullName}
            </HymnBookComponent>
          );
        })}
      </Flex>
      <Flex flexDirection="row">
        {
          hasNotSearchableMeta &&
          <Button
            onClick={(e) => { setShowOldBooks(!showOldBooks) }}
            outline
            shadow={false}
            type="small"
          >
            {showOldBooks ? 'Hide Old Books' : 'Show Old Books'}
          </Button>
        }
      </Flex>
      {
        showOldBooks && hasNotSearchableMeta &&
        <>
          <Flex flexDirection="row">
            <div className="notice-card mb-4 mt-4">
              <Box className="p-4">
                <Text as="p" fontSize="14px" color="#8B9199">
                  These Hymn Books are not searchable as they are legacy ones.
                </Text>
              </Box>
            </div>
          </Flex>
          <Flex
            flexDirection="row"
            className="justify-center	flex-wrap my-3 w-full sm:w-[90%]"
          >
            {
              notSearchableMeta.map((book) => {
                return (
                  <HymnBookComponent
                    name={book.hymnBook}
                    handleClick={handleBookClick}
                    imageUrl={book.imageUrl}
                    key={book.hymnBook}
                  >
                    {book.bookFullName}
                  </HymnBookComponent>
                );
              })
            }
          </Flex>
        </>
      }
      <style jsx>{`
      `}</style>
    </Box>
  );
};

export default HymnNavigator;

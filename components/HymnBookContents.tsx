import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { Text, Box, Flex } from "./base";
import { useFavoritesByName } from "../lib/favorites";
import { getHymnBook, HymnContentSortBy, SongType, userHasRoleOrAdmin, UserRole } from "../lib/constants";
import { getBookPath, getSongPath } from "../lib/songs/getSongPath";
import SongMeta from "../ts/types/songMeta.interface";
import HymnTag from "./HymnTag";
import Row from "./row";
import { Heading, Link } from "./base";
import SortPopup from "./SortPopup";
import UserInfo from "../ts/types/userInfo.interface";
import { useBooks, useUser } from "../lib/uiUtils";
import { getSongsbyTagsFromList, getTagsAndSongs } from "../lib/songs/getSongsByTags";
import SongItem from "./SongItem";
import { updateHymnContentSortBy, useHymnContentSortBy } from "../lib/userProperties";
import { useDispatch } from "react-redux";
import HymnBookMeta from "../ts/types/hymnBookMeta.interface";
import { ChevronLeft } from "react-feather";
import { userCanSeeBilingual } from "../lib/users/role";
import PianoIcon from "./icons/PianoIcon";
import MusicIcon from "./icons/MusicIcon";

/**
 * Displays the list of songs in a specific hymn book
 *
 * @param songs the list of songs
 * @param hymnBook needs to be the short name of the hymn book. e.g. SOL1
 * @param onBackClick method that handles when going back (should go to list of books) @see HymnNavigator
 */
export const HymnBookContents = ({
  songs,
  hymnBook,
  onBackClick,
}: {
  songs: SongMeta[];
  hymnBook: any;
  onBackClick: any;
}): JSX.Element => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const user: UserInfo | null = useUser(session?.user?.email, status);
  const allBooks = useBooks();

  const [popupOn, togglePopup] = useState(false);
  const sortBy: HymnContentSortBy = useHymnContentSortBy();

  const buttonRef = useRef(null);
  const btnPos = buttonRef?.current && buttonRef?.current.getBoundingClientRect();

  // get favorites
  const favoritesBySlug = useFavoritesByName(session?.user?.email, status);

  if (songs == undefined) {
    return <Text> No songs for {getHymnBook(hymnBook)}</Text>;
  }

  const currentBook: HymnBookMeta = allBooks[hymnBook];
  const translatedBook: HymnBookMeta | null = currentBook?.translatedBook ? allBooks[currentBook?.translatedBook] : null;

  /**
   * Update the sort by for all hymn book content pages
   * 
   * @param newSortBy the sort by option that was selected
   */
  const updateSortBy = (newSortBy: HymnContentSortBy) => {
    updateHymnContentSortBy(newSortBy, dispatch);
  }

  /**
   * Handle whenever a song is clicked
   */
  const handleClick = (e, song: SongMeta) => {
    if (e == null) {
      return;
    }
    e.preventDefault();
    // @see /pages/songs/[slug].tsx
    router.push(getSongPath(song), undefined, {
      shallow: true,
    });
  };

  songs.sort((a, b) => a.pageNumber - b.pageNumber);

  // sort by alphabetical
  if (sortBy == HymnContentSortBy.alphabetical) {
    songs.sort((a, b) => a?.name?.localeCompare(b?.name));
  }

  // group favorite songs by tags
  const [allTagsInBook, songsByTags] = getTagsAndSongs(songs, currentBook);

  return (
    <Box className="max-w-full min-w-[320px] md:min-w-[567px] min-h-full">
      <div className="mb-3">
        <Link className="cursor-pointer" lineHeight="0" onClick={onBackClick}>
          <>
            <ChevronLeft className="inline arrow-icon" />
            Back
          </>
        </Link>
      </div>
      {translatedBook && userCanSeeBilingual(user) &&
        <div>
          <Link href={getBookPath(translatedBook.hymnBook)} fontSize="14px">
            {`${translatedBook.hymnBook} | ${translatedBook.bookFullName}`}
            <img
              className="arrow-right-icon inline"
              src="/arrow-right-thin.svg"
              alt={`Go to ${translatedBook?.hymnBook}`}
            />
          </Link>
        </div>
      }
      <Heading as="h3" type="h3" className="mb-1">
        {getHymnBook(hymnBook)}
      </Heading>
      <HymnTag hymnBook={hymnBook} fullName={false} />
      {popupOn && (
        <SortPopup
          popUpOn={popupOn}
          togglePopup={togglePopup}
          btnPos={btnPos}
          currSortBy={sortBy}
          updateSortBy={(sortBy, dispatch) =>
            updateSortBy(sortBy as HymnContentSortBy)
          }
          options={[
            { value: HymnContentSortBy.byPage, label: "Page" },
            { value: HymnContentSortBy.alphabetical, label: "Alphabetical" },
            {
              value: HymnContentSortBy.tags,
              label: "Categories",
              showOption: () => userHasRoleOrAdmin(user, UserRole.readTags),
            },
          ]}
        />
      )}
      <Row className="pt-2 w-[300px]">
        <button className="sort-by-btn" onClick={() => togglePopup(!popupOn)}>
          Sort By
        </button>
      </Row>
      <Flex flexDirection="column" className="mt-3">
        {sortBy == HymnContentSortBy.tags || (sortBy == HymnContentSortBy.byPage && currentBook.hymnBook == "S1" || currentBook.hymnBook == "S2")
          ? allTagsInBook.filter(tag => songsByTags[tag]).map((tag, i) => (
            <Row
              key={`${tag}+${i}`}
              className={`flex-1 ${i !== 0 ? "pt-6" : ""}`}
              flexDirection="column"
            >
              <Text as="p" fontSize="20px" fontWeight={500} className="mt-1">
                {tag}
              </Text>
              {songsByTags[tag]?.map((song) => (
                <HymnBookSongItem
                  key={"hymn-book-item-" + song?.slug}
                  song={song}
                  handleClick={handleClick}
                  isFavorited={favoritesBySlug[song.slug] != null}
                />
              ))}
            </Row>
          ))
          : songs.map((song: SongMeta) => (
            <HymnBookSongItem
              key={"hymn-book-item-" + song?.slug}
              song={song}
              handleClick={handleClick}
              isFavorited={favoritesBySlug[song.slug] != null}
            />
          ))}
      </Flex>
      <style jsx>{`
        .page-num-text {
          min-width: 40px;
          width: 40px;
        }
        .sort-by-btn {
          padding: 2px 8px;
          cursor: pointer;
          border-radius: 4px;
          border: 1px solid #eaeaea;

          font-family: HKGrotesk;
          font-size: 12px;
          color: #999;
          line-height: 24px;
          letter-spacing: 0.3px;
        }
        .sort-by-btn:hover {
          border: 1px solid #888;
        }
        .arrow-right-icon {
          width: 14px;
          height: 14px;
          vertical-align: middle;
          padding-bottom: 2px;
        }
      `}</style>
    </Box>
  );
};

const HymnBookSongItem = ({
  song,
  handleClick,
  isFavorited,
}: {
  song: SongMeta;
  handleClick: Function;
  isFavorited: boolean;
}) => {

  const hasTranslation = () => {
    if (song?.songType != SongType.chinese) {
      return false;
    }

    // show translation globe icon if there is an english translation
    if (song?.referenceSongs && song?.referenceSongs?.length > 0) {
      return song?.referenceSongs?.filter(s => s?.songType == SongType.english)?.length > 0;
    }
  }

  return (
    <>
      <SongItem
        song={song}
        handleClick={handleClick}
        key={`song-item-${song?.slug}`}
      >
        <div className="pl-1 pr-1">
          <div className="w-10 inline-block">
            <Text fontSize="16px" fontWeight="500">
              {song.pageNumber + ".  "}
            </Text>
          </div>
          <Text fontSize="16px" className="inline">
            {song.name}
          </Text>
          {(song?.mp3 || song?.instrumentalMp3 || song?.pianoMp3) && (

            song?.mp3 || song?.instrumentalMp3 ?
              <MusicIcon
                className="pl-2 pb-0.5 h-3 inline"
                alt="has music/audio"
              />

              :
              <PianoIcon
                className="pl-2 pb-0.5 h-3 inline"
                alt="has piano instrumental"
              />
          )}
          {(hasTranslation()) && (
            <img
              src={
                "/globe.svg"
              }
              className="song-icon inline"
              alt="is translated"
            />
          )}
          {isFavorited && (
            <img src="/star-filled.svg" className="song-icon inline" alt="is favorited" />
          )}
        </div>
      </SongItem>
      <style jsx>{`
        .song-icon {
          padding-left: 8px;
          padding-bottom: 3px;
          height: 14px;
        }
      `}</style>
    </>
  );
};

export default HymnBookContents;

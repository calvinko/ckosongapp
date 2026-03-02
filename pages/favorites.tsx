import Head from "next/head";
import router from "next/router";
import { useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import React, { useRef, useState } from "react";

import SongMeta from "../ts/types/songMeta.interface";
import Favorite from "../ts/types/favorite.interface";

import SortPopup from "../components/SortPopup";
import Placeholder from "../components/Placeholder";
import NavBar from "../components/NavBar";
import SearchBar from "../components/SearchBar";
import { getSongPath } from "../lib/songs/getSongPath";
import HymnTag from "../components/HymnTag";
import SongItem from "../components/SongItem";
import { Text, Link, Heading, Box, Flex } from "../components/base";
import Row from "../components/row";

import { useBooks, useFavorite, useSongs, useUserOrNoAccess } from "../lib/uiUtils";
import { RootState } from "../lib/redux/store";
import { FavoriteSongSortBy, userHasRoleOrAdmin, UserRole } from "../lib/constants";
import { getSongsByBookFromList } from "../lib/songs/getSongsByBook";
import { getHymnBook } from "../lib/constants";
import {
  updateFavoritesSortBy,
  useFavoritesSortBy,
} from "../lib/userProperties";
import { getTagsAndSongs } from "../lib/songs/getSongsByTags";
import MusicIcon from "../components/icons/MusicIcon";

/**
 * Favorites or Starred hymns page
 */
const Favorites = () => {
  const { data: session, status } = useSession();

  const [popupOn, togglePopup] = useState(false);
  const sortBy: FavoriteSongSortBy = useFavoritesSortBy();

  const buttonRef = useRef(null);
  const btnPos = buttonRef.current && buttonRef.current.getBoundingClientRect();

  const songs: { [key: string]: SongMeta } = useSongs();

  const email: string | null | undefined = session?.user?.email;
  const { user, noAccess, loading } = useUserOrNoAccess(session, status);

  const favorites: Favorite[] | null = useFavorite(email, status);
  const allBooks = useBooks();

  const isLoadingFavorites: boolean = useSelector(
    (state: RootState) => state?.favorites?.isLoading
  );

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

  // show loading screen if still loading songs or user (if it exists)
  // also show loading screen if favorites are still loading, unless user (which is cached in redis) exists
  // the user might have favorites that are out of date but it'll be fixed once the favorites finishes loading
  if (loading) {
    return (
      <Box className="max-w-[95%] md:max-w-lg my-16 mx-5 md:mx-auto">
        <Head>
          <title>Favorites</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Placeholder fluid>
          <Placeholder.Header>
            <Placeholder.Line />
          </Placeholder.Header>
          {[...Array(10)].map((e, index) => (
            <Placeholder.Paragraph key={`favorite-placeholder-${index}`}>
              <Placeholder.Line />
              <Placeholder.Line />
              <Placeholder.Line />
              <Placeholder.Line />
            </Placeholder.Paragraph>
          ))}
        </Placeholder>
      </Box>
    );
  }

  if (noAccess) {
    router.push("/signIn");
    return (<></>);
  }

  // find effective favorites, which is if favorites hasn't fully loaded yet, then we use the user's favorites (if the user exists)
  // user favorites is cached in redis, which may be out of date but will be the temporary list until favorites finishes loading
  // this optimizes for immeidate user ui generation
  const effectiveFavorites: Favorite[] =
    favorites == null || isLoadingFavorites ? user?.favorites ?? [] : favorites;
  const favoriteSongs: SongMeta[] = effectiveFavorites
    ?.map((favoriteSong) => songs[favoriteSong.songSlug])
    .filter((x) => x != null);

  // The following is for sorting favorite songs. We just sort/group everything
  // and then render the songs based on the sortBy

  // default is sorting by date added (how the favorites are stored)
  if (sortBy == FavoriteSongSortBy.name) {
    // sort by name
    favoriteSongs.sort((a, b) => a?.name.localeCompare(b?.name));
  }
  // books will have natural ordering, which is the same as the front page ordering
  const favoriteSongsByBook = getSongsByBookFromList(favoriteSongs);

  // group favorite songs by tags
  // the different tags the favorite songs are in. This will be used to display the favorites is sortBy is by tags.
  const [allTagsInFav, favoriteSongsByTags] = getTagsAndSongs(favoriteSongs);

  const showSortByTagsOption: boolean = true;

  return (
    <Flex
      className="flex-wrap w-screen min-h-screen"
      flexDirection="column"
    >
      <Head>
        <title>Favorites</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          property="og:title"
          content={`Favorites`}
          key="title"
        />
        <meta property="og:description" content={`User Favorite Hymns`} key="description" />
      </Head>
      <Flex className="box-border flex-1 w-screen sm:max-w-xl sm:min-w-[576px] sm:mx-auto px-3 py-8 sm:px-0 w-full" flexDirection="column">
        <Box className="">
          <NavBar />
          <SearchBar />
          <Box className="mt-8">
            <Heading as="h4" type="h4" className="mb-2">
              {`Favorites/Stars`}{" "}
              {favoriteSongs ? `(${favoriteSongs.length})` : ""}
            </Heading>
            {!user && (
              <div className="card-notice mb-2">
                <Box className="p-[18px]">
                  <Text as="p" fontSize="14px" color="#8B9199">
                    Sign in with your Google account to save your favorites
                    across devices! 🎉
                  </Text>
                </Box>
              </div>
            )}
            {popupOn && (
              <SortPopup
                popUpOn={popupOn}
                togglePopup={togglePopup}
                btnPos={btnPos}
                currSortBy={sortBy}
                updateSortBy={(sortBy, dispatch) =>
                  updateFavoritesSortBy(sortBy as FavoriteSongSortBy, dispatch)
                }
                options={[
                  { value: FavoriteSongSortBy.dateAdded, label: "Date Added" },
                  { value: FavoriteSongSortBy.name, label: "Name" },
                  { value: FavoriteSongSortBy.hymnBook, label: "Hymn Book" },
                  {
                    value: FavoriteSongSortBy.tags,
                    label: "Categories",
                    showOption: () => showSortByTagsOption,
                  },
                ]}
              />
            )}
            <button
              className="sort-by-btn"
              onClick={() => togglePopup(!popupOn)}
            >
              Sort By
            </button>
            {!favorites && isLoadingFavorites ?
              <Box className="mt-3 min-h-full max-h-full pt-1">
                <Placeholder fluid>
                  <Placeholder.Header>
                    <Placeholder.Line />
                  </Placeholder.Header>
                  {[...Array(10)].map((e, index) => (
                    <Placeholder.Paragraph key={`favorite-placeholder-${index}`}>
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                    </Placeholder.Paragraph>
                  ))}
                </Placeholder>
              </Box>
              : <Box
                className="mt-3 min-h-full max-h-full"
              >
                {favoriteSongs?.length > 0 ? (
                  sortBy == FavoriteSongSortBy.dateAdded ||
                    sortBy == FavoriteSongSortBy.name ? (
                    favoriteSongs.map((song) => (
                      <FavoriteSongItem song={song} handleClick={handleClick} />
                    ))
                  ) : sortBy == FavoriteSongSortBy.hymnBook ? (
                    Object.keys(favoriteSongsByBook).map((book, i) => (
                      <Flex
                        key={book}
                        className={`flex-1 flex-wrap ${i !== 0 ? "pt-6" : "pt-0"}`}
                        flexDirection="column"
                      >
                        <Text
                          as="p"
                          fontSize="14px"
                          fontWeight={500}
                          className="mt-1"
                        >
                          {getHymnBook(book)}
                        </Text>
                        {favoriteSongsByBook[book].map((song) => (
                          <FavoriteSongItem
                            song={song}
                            key={song.slug}
                            handleClick={handleClick}
                          />
                        ))}
                      </Flex>
                    ))
                  ) : (
                    allTagsInFav.map((tag, i) => (
                      <Flex
                        key={tag}
                        className={`flex-1 flex-wrap ${i !== 0 ? "pt-6" : "pt-0"}`}
                        flexDirection="column"
                      >
                        <Text
                          as="p"
                          fontSize="14px"
                          fontWeight={500}
                          className="mt-1"
                        >
                          {tag}
                        </Text>
                        {favoriteSongsByTags[tag].map((song) => (
                          <FavoriteSongItem
                            song={song}
                            key={song.slug}
                            handleClick={handleClick}
                          />
                        ))}
                      </Flex>
                    ))
                  )
                ) : (
                  <Flex
                    m="20% 0"
                    className="items-center justify-center w-full h-10"
                    flexDirection="row"
                  >
                    <Box>
                      <Text as="p" fontSize="16px">
                        No Favorites.
                      </Text>
                      <Link href="/">Go back home</Link>
                    </Box>
                  </Flex>
                )}
              </Box>
            }
          </Box>
        </Box>
      </Flex>
      <style jsx>{`
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
        .card-notice {
          border: 1px solid #ebeef2;
          border-radius: 6px;
        }
      `}</style>
    </Flex>
  );
};

/**
 * Individual song item in the favorites list
 */
const FavoriteSongItem = ({
  song,
  handleClick,
}: {
  song: SongMeta; // song
  handleClick: (e: any, song: SongMeta) => void; // handling click on song
}): JSX.Element => {
  return (
    <SongItem key={song?.slug} song={song} handleClick={handleClick}>
      <Flex className="pl-0.5 pr-2 items-center" flexDirection="row">
        <HymnTag
          pageNumber={song.pageNumber}
          hymnBook={song.hymn}
          fullName={false}
          allowLink={false}
        />
        <Text className="pl-2" fontSize="16px">
          {song.name}
          {(song?.mp3 || song?.instrumentalMp3 || song?.pianoMp3) && (
            <MusicIcon
              className="pl-2 pb-0.5 h-3 inline"
            />
          )}
        </Text>
      </Flex>
      <style jsx>{`
        .song-item {
          padding: 8px 0;
          border-bottom: 1px solid #eaeaea;
          cursor: pointer;
        }
        .song-item:hover {
          background: #b4d8fa;
          border-radius: 4px;
        }
      `}</style>
    </SongItem>
  );
};

export default Favorites;

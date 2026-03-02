import Head from "next/head";
import { useRouter } from "next/router";
import React, { ReactEventHandler, useEffect, useRef, useState } from "react";
import Placeholder from "../../components/Placeholder";
import toast, { Toaster } from "react-hot-toast";
import useSWR, { mutate } from "swr";
import { useSession } from "next-auth/react";
import groupBy from "lodash/groupBy";
import range from "lodash/range"
import DOMPurify from 'dompurify';

import {
  useAllowSongSheetQueryEnabled,
  useShowRelatedSongEnabled,
} from "../../lib/properties";
import HymnTag from "../../components/HymnTag";
import Row from "../../components/row";
import SearchBar from "../../components/SearchBar";
import ToggleDetails from "../../components/ToggleDetails";
import {
  getOtherSongType,
  UserRole,
  userHasRole,
  userHasRoleOrAdmin,
  SongSheetType,
  SongType,
  ALLOWED_BOOKS_TO_SEE_TRANSLATION,
} from "../../lib/constants";
import {
  DEFAULT_SWR_OPTIONS,
  fetcherWithMaxAge,
} from "../../lib/fetcher";
import { getSongPath, getSongPathBySlug } from "../../lib/songs/getSongPath";
import SongMeta, { ReferenceSong, SongMetaWithContent } from "../../ts/types/songMeta.interface";
import RelatedSong from "../../ts/types/relatedSong.interface";
import NavBar from "../../components/NavBar";
import SongItem from "../../components/SongItem";
import RelatedSongModal from "../../components/RelatedSongModal";
import { useDispatch } from "react-redux";
import { useBooks, useFavorite, useMelodyClusters, useSongs, useTokenUser, useUserOrNoAccess } from "../../lib/uiUtils";
import {
  addFavoriteAction,
  removeFavoriteAction,
} from "../../lib/redux/actions";
import UserInfo from "../../ts/types/userInfo.interface";
import {
  useDeviceShowRelated,
  useIsEmbedSongSheet,
  useSongSheetType,
} from "../../lib/userProperties";

import { Document, Page } from "react-pdf";
import { Box, Text, Link, Heading, Flex } from "../../components/base";
import getSongsByBook from "../../lib/songs/getSongsByBook";
import { getAdjacentSongs } from "../../lib/songs/songUtils"
import TokenUser from "../../ts/types/tokenUser.interface";
import AddNoteModal from "../../components/modals/AddNoteModal";
import { useNotesForSongAndUser } from "../../lib/generic-entries/songNotes";
import SongNote from "../../components/SongNote";
import { MelodyCluster, MelodyClusterSong } from "../../ts/types/melodyCluster.interface";
import { userCanSeeBilingual } from "../../lib/users/role";
import { ChevronLeft, ChevronRight, Edit3, Info, X } from "react-feather";
import PianoIcon from "../../components/icons/PianoIcon";
import MusicIcon from "../../components/icons/MusicIcon";
import OptionPopup from "../../components/OptionPopup";
import ToggleButton from "../../components/ToggleButton";
import Pill from "../../components/base/Pill";

/**
 * Page to show a song's details and its contents
 *
 * @param props
 */
export const SongPage = (): JSX.Element => {
  const router = useRouter();
  const { query } = router;
  const { slugs, embedSongSheet: embedSongSheetQuery, share } = query;

  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const email = session?.user?.email;
  const { user, noAccess, loading: loadingSession } = useUserOrNoAccess(session, status);

  let [modalIsOpen, setModalIsOpen] = useState(false);
  let [addNoteModalIsOpen, setAddNoteModalIsOpen] = useState(false);
  const tokenUser: TokenUser = useTokenUser();
  const allowSongSheetByQueryProperty = useAllowSongSheetQueryEnabled();
  const userPropertySongSheetType: SongSheetType = useSongSheetType();

  // for embedding song sheet
  const [numPdfPages, setNumPdfPages] = useState(null);
  // on load of pdf, set num pages of pdf
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPdfPages(numPages);
  };

  const displayBoxWidthRef = useRef(null);
  const userPropertyEmbedSongSheet = useIsEmbedSongSheet();
  const [pageEmbedSongSheet, setPageEmbedSongSheet] = useState(
    userPropertyEmbedSongSheet
  );

  const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void;
  const allSongs: { [key: string]: SongMetaWithContent } = useSongs();
  const melodyClusters: { [key: string]: MelodyCluster } = useMelodyClusters();
  const allBooks = useBooks();
  // const { data: song, error } = useSWR(
  //   () =>
  //     slugs && slugs.length == 2 ? `/api/songs/${slugs[0]}/${slugs[1]}` : null,
  //   fetcherLongMaxAge,
  //   DEFAULT_SWR_OPTIONS
  // );
  const { data: relatedSongIndex } = useSWR(
    slugs && slugs.length == 2 ? `/api/related/${slugs[1]}` : null,
    fetcherWithMaxAge,
    DEFAULT_SWR_OPTIONS
  );
  // const addRelatedSongProperty = useAddRelatedSongEnabled();
  const showRelatedSongProperty = useShowRelatedSongEnabled();
  const deviceShowRelatedSong: boolean = useDeviceShowRelated();
  const { data: secondarySongIndex, error: secondaryIndexErr } = useSWR(
    slugs && slugs.length == 2 ? `/api/related/secondary/${slugs[1]}` : null,
    fetcherWithMaxAge,
    DEFAULT_SWR_OPTIONS
  );

  const favoritesList = useFavorite(email, status) ?? [];
  let isFavoritedTemp = false;
  // see whether user has favorited this song
  if (slugs && slugs.length == 2) {
    isFavoritedTemp =
      favoritesList?.findIndex((song) => song.songSlug === slugs[1]) != -1;
  }
  let [isFavorited, setIsFavorite] = useState(isFavoritedTemp);
  const isLoadingFavorites = favoritesList == null ? true : false;
  const songNotes = useNotesForSongAndUser(slugs && slugs.length == 2 ? slugs[1] : null, user);

  // if isFavoritedTemp changes, we update the states so it renders on the UI
  useEffect(() => {
    setIsFavorite(isFavoritedTemp);
  }, [isFavoritedTemp]);

  useEffect(() => {
    setPageEmbedSongSheet(userPropertyEmbedSongSheet);
  }, [userPropertyEmbedSongSheet]);

  useEffect(() => {
    // whenever page changes, we reset the state for embedding song sheets based on the global user device property
    setPageEmbedSongSheet(userPropertyEmbedSongSheet);
  }, [slugs]);

  const song: SongMetaWithContent | null = slugs && slugs?.length == 2 ? allSongs[slugs[1]] : null;
  // if the song just doesn't exist, we show error
  // there's a weird condition where slugs would be `undefined` and so not ready yet
  if (slugs !== undefined && (slugs?.length != 2 || (!song && allSongs != null))) {
    return (
      <Flex
        m="20% 0"
        className="items-center justify-center w-full h-10"
        flexDirection="row"
      >
        <Box width="320px">
          <Text as="p">Sorry, Lyrics Not Available 😕</Text>
          <Link href="/">Go back home</Link>
        </Box>
      </Flex>
    );
  }

  const slug = slugs?.length == 2 ? slugs[1].split("_") : null;
  const bookShort = slug?.length == 2 ? slug[0] : "";
  const pageNum = slug?.length == 2 ? slug[1] : "";

  // placeholder for when we are still loading the song
  if (song == null || loadingSession) { //|| song.songsInBook == isNullLiteral
    return (
      <Box className="max-w-[95%] md:max-w-lg my-16 mx-3 md:mx-auto">
        <Head>
          <title>
            {bookShort} {pageNum}
          </title>
          <meta
            property="og:title"
            content={`${bookShort} ${pageNum}`}
            key="title"
          />
          <meta
            property="og:description"
            content={`${bookShort} ${pageNum}`}
            key="description"
          />
        </Head>
        <Placeholder fluid>
          <Placeholder.Header>
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Header>
          {[...Array(5)].map((e, index) => (
            <Placeholder.Paragraph key={`placeholder-${index}`}>
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

  if (noAccess && !share) {
    router.push("/signIn");
    return (<>
      <Head>
        <title>
          {bookShort} {pageNum}
        </title>
        <meta
          property="og:title"
          content={`${bookShort} ${pageNum}`}
          key="title"
        />
      </Head>
    </>);
  }

  const metadata: SongMetaWithContent = song;

  const currentBook = allBooks[metadata?.hymn];

  const { nextSong, previousSong } = getAdjacentSongs({ song: metadata, allSongs });
  const nextSongSlug = nextSong ? nextSong?.slug : null;
  const previousSongSlug = previousSong ? previousSong?.slug : null;

  // find the end page number on the chord pdf sheet. If next song exists, use its page number, otherwise use the current book's page size
  // then add offset
  const endPage = Number(nextSong ? nextSong?.pageNumber : currentBook.pageSize + 1) + currentBook.chordSheetOffset;

  const referenceSongs: ReferenceSong[] = metadata?.referenceSongs ?? [];
  let firstReferenceSong: ReferenceSong | null | undefined = null;
  let otherTranslations: ReferenceSong[] = [];
  if (referenceSongs?.length > 0) {
    const coll_song = referenceSongs
      .filter(s => s.songType == SongType.chinese || s.songType == SongType.english)
      .filter(s => s.hymn == "S1" || s.hymn == "S2")
      .pop()
    const non_coll_songs = referenceSongs
      .filter(s => {
        if (userHasRoleOrAdmin(user, UserRole.readOtherLang)) {
          return true;
        }
        return s.songType == SongType.chinese || s.songType == SongType.english;
      })
      .filter(s => s.songType)
      .filter(s => s.hymn != "S1" && s.hymn != "S2");
    if (coll_song != undefined) {
      // Collection Book Translation exists so we show that on the top
      firstReferenceSong = coll_song;
      // other translations we show in the detail section
      otherTranslations = non_coll_songs.length > 0 ? non_coll_songs : [];
    }
    else {
      // only have the first reference song be chinese or english
      // and put the others in the detail section
      const withoutOtherLangRefSongs = referenceSongs.filter(s => s.songType == SongType.chinese || s.songType == SongType.english);
      const otherLangRefSongs = referenceSongs.filter(s => s.songType != SongType.chinese && s.songType != SongType.english);
      firstReferenceSong = withoutOtherLangRefSongs?.length > 0 ? withoutOtherLangRefSongs[0] : null;
      if (referenceSongs.length > 1 || otherLangRefSongs.length > 0) {
        otherTranslations = referenceSongs
          .filter(s => firstReferenceSong == null || s.slug != firstReferenceSong.slug)
          .filter(s => {
            if (userHasRoleOrAdmin(user, UserRole.readOtherLang)) {
              return true;
            }
            return s.songType == SongType.chinese || s.songType == SongType.english;
          });
      }
    }
  }

  const baseUrlPath = window.location.origin + getSongPathBySlug(metadata?.songType, metadata?.slug);
  const handleShareClick = (e) => {
    // share with embedSongSheet query param if user is admin and has enabled embedding song sheets
    const urlToShare = embedSongSheet && user?.isAdmin ? baseUrlPath + '?embedSongSheet=true&share=true' : baseUrlPath;
    navigator.share({
      title: `${metadata.hymn} ${metadata.pageNumber} | ${metadata.name}`,
      url: urlToShare,
    });
  };

  const handleCopyClick = (e) => {
    const urlToShare = embedSongSheet && user?.isAdmin ? baseUrlPath + '?embedSongSheet=true&share=true' : baseUrlPath;
    navigator.clipboard.writeText(urlToShare);
    toast.success("Copied link!");
  };

  /**
   * Add song to favorites and send out success toast
   */
  const addToFavorites = (e) => {
    dispatch(addFavoriteAction(metadata.slug, email));
    toast.success("Starred song!");
    setIsFavorite(true);
    // forceUpdate();
  };

  /**
   * Remove song from favorites and send out success toast
   */
  const removeFromFavorites = (e) => {
    dispatch(removeFavoriteAction(metadata.slug, email));
    toast.success("Unstarred song!");
    setIsFavorite(false);
    // forceUpdate();
  };

  /**
   * Handle whenever a song is clicked
   */
  const handleRelatedSongClick = (e, song: SongMeta) => {
    if (e == null) {
      return;
    }
    e.preventDefault();
    router.push(getSongPath(song), undefined, {
      shallow: true,
    });
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeAddNoteModal = () => {
    setAddNoteModalIsOpen(false);
  }

  /**
   * Callback method once related song is added from RelatedSongModal
   *
   * @param song song that was added
   */
  const addRelatedSongCallback = (song: SongMeta) => {
    mutate(`/api/related/${metadata?.slug}`);
  };

  /**
   * Remove a related song
   *
   * @param e     the event
   * @param song  the song to remove from related
   */
  const removeRelatedSong = async (
    e,
    song: SongMeta,
    relatedSong?: RelatedSong
  ) => {
    // do not propagate to SongItem onClick
    e.stopPropagation();
    try {
      // we include the stanzas if it's there, otherwise we put it as undefined so the api handles the song without the stanzas
      // you can have relations to the same song but for different stanzas (on both primary and secondary)
      await fetch("/api/related", {
        method: "DELETE",
        body: JSON.stringify({
          primary: metadata?.slug,
          secondary: song?.slug,
          primaryStanzas: relatedSong?.primaryStanzas ?? undefined,
          secondaryStanzas: relatedSong?.secondaryStanzas ?? undefined,
        }),
      });
      toast.success("Successfully deleted.");
    } catch (error) {
      toast.error("Something is wrong with Server" + error.getMessage());
      return;
    }

    // mutate the state for related songs so it immediately goes into effect for the user
    const newRelatedSongIndex: RelatedSong[] =
      relatedSongIndex?.filter(
        (songIndex: RelatedSong) =>
          songIndex?.secondary === song?.slug &&
          songIndex?.primaryStanzas == relatedSong?.primaryStanzas &&
          songIndex?.secondaryStanzas == relatedSong?.secondaryStanzas
      ) ?? [];

    mutate(`/api/related/${metadata?.slug}`, newRelatedSongIndex ?? []);
  };

  /**
   * Toggle the user property Embed Song Sheet without updating redux
   *
   * @param toEmbed whether to embed or not
   */
  const toggleEmbedSongSheet = (toEmbed: boolean) => {
    setPageEmbedSongSheet(toEmbed);
  };

  // create related song groupings (since we group them by primary stanzas)
  const relatedSongGroupBy: { [key: string]: RelatedSong[] } =
    groupBy(relatedSongIndex ?? [], "primaryStanzas") ?? {};

  const undefinedStanza = relatedSongGroupBy["undefined"] ?? [];
  const nullStanza = relatedSongGroupBy["null"] ?? [];
  const noStanzaRelatedSongs: { song: SongMeta; relatedSong: RelatedSong }[] =
    undefinedStanza
      .concat(nullStanza)
      ?.map((songIndex: RelatedSong) => ({
        song: allSongs[songIndex?.secondary],
        relatedSong: songIndex,
      }))
      ?.filter((x) => x !== undefined && x && x !== null)
      ?.sort((a, b) => a?.song?.slug.localeCompare(b?.song?.slug)) ?? [];

  delete relatedSongGroupBy["undefined"];
  delete relatedSongGroupBy["null"];

  let relatedSongsPerStanzas: {
    primaryStanza: string;
    songs: { song: SongMeta; relatedSong: RelatedSong }[];
  }[] = Object.entries(relatedSongGroupBy)?.map(([key, value]) => {
    return {
      primaryStanza: key,
      songs:
        value
          ?.map((songIndex: RelatedSong) => ({
            song: allSongs[songIndex?.secondary],
            relatedSong: songIndex,
          }))
          ?.filter((x) => x !== undefined && x && x !== null)
          ?.sort((a, b) => a?.song?.slug.localeCompare(b?.song?.slug)) ?? [],
    };
  });

  // for showing songs have direct relation edges to this current song
  const secondarySongs: {
    song: SongMeta;
    relatedSong: RelatedSong;
  }[] =
    secondarySongIndex && !secondaryIndexErr
      ? secondarySongIndex?.map((songIndex: RelatedSong) => ({
        song: allSongs[songIndex.primary],
        relatedSong: songIndex,
      }))
      : [];

  // need to be admin to add or if the property is on
  const addRelatedSongEnabled: boolean | undefined =
    // addRelatedSongProperty?.value === "true" ||
    user?.isAdmin ||
    user?.roles.find((x) => x == UserRole.addRelatedSong) !== undefined;

  const showRelatedSongEnabled: boolean =
    showRelatedSongProperty?.value === "true";

  const userCanReadRelated: boolean = showRelatedSongEnabled || userHasRoleOrAdmin(user, UserRole.readRelatedSong) || userHasRoleOrAdmin(tokenUser, UserRole.readRelatedSong);

  // whether or not to show the related songs section
  // Only if the global "showing" related songs property is enabled and the local deviceShowRelated property is enabled
  // then, if true, show, if there are related songs.
  // If "adding" related songs is on, also show (this generally is off and only enabled for admins)
  const showRelatedSongs =
    (deviceShowRelatedSong &&
      userCanReadRelated &&
      (noStanzaRelatedSongs?.length > 0 || relatedSongsPerStanzas?.length > 0)) ||
    addRelatedSongEnabled;

  const showNotes = userHasRoleOrAdmin(user, UserRole.songNotes);

  const title = `${metadata.hymn} ${metadata.pageNumber} | ${metadata.name}`;

  // we also allow users to see song sheet, if they have the query parameter and property is turned on
  // so we check for the property
  const allowSongSheetByQuery: boolean = allowSongSheetByQueryProperty?.value === "true";
  // whether you can read the song sheet from pdf if you have role or are admin or you have token
  const userCanReadSongSheet = userHasRoleOrAdmin(user, UserRole.readSongSheet) || userHasRoleOrAdmin(tokenUser, UserRole.readSongSheet);

  //whether the user has role to read song sheet
  const canReadSongSheet = userCanReadSongSheet;

  // only embed song sheet if there's a sheet for it and the user can read song sheet
  // and if the device user prop is on OR the individual page's prop is on
  // Alternatively, there is a special case based on the query param `embedSongSheetQuery`. If it's true (only when admin shares) and global property is on, then we show it
  // overriding the user's preference (since in these cases, the user may not have access to song sheets so cannot even choose to show song sheet or not)
  const embedSongSheet =
    metadata?.hasOwnSheetPdf && (
      (allowSongSheetByQuery && embedSongSheetQuery === "true") || (canReadSongSheet && pageEmbedSongSheet)
    );

  // show tags in the metadata section if there are tags in the song and the user
  // has access to read tags
  const showTagsInSong: boolean | undefined =
    metadata?.tags && metadata?.tags?.length > 0 &&
    (currentBook?.tagSort != null);

  const clusterBaseSong: SongMetaWithContent | null = metadata?.melodyCluster?.baseSong ? allSongs[metadata?.melodyCluster?.baseSong] : null;
  const cluster: MelodyCluster | null = metadata?.melodyCluster?.baseSong ? melodyClusters[metadata?.melodyCluster?.baseSong] : null;

  // set proper song sheet link
  const showChordSheet = userHasRoleOrAdmin(user, UserRole.musicTeam) && userPropertySongSheetType == SongSheetType.chords;
  let songSheetLink = `/books/individual-pages/${metadata?.songType}/${metadata?.slug}.pdf`
  if (showChordSheet) {
    // if in music team and selected to see chords, then show pdf with chords instead
    // songSheetLink = `/books/individual-pages/${metadata?.songType}/${metadata?.slug}_chords.pdf`
    songSheetLink = `/books/${metadata?.hymn}_chords.pdf`
  }

  // the song's starting page number on the chord pdf sheet
  const startingChordSheetPageNum = Number(metadata.pageNumber) + currentBook?.chordSheetOffset

  const onAudioLoadedMetadata = () => {
    if (metadata != null && currentBook != null) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        album: currentBook?.bookFullName,
        artwork: [
          { src: currentBook?.albumCoverUrl ?? currentBook?.imageUrl ?? "", type: 'image/png' },
        ]
      });
    }
  }

  const getOtherVersionForLang = (songType: SongType) => {
    switch (songType) {
      case SongType.tamil:
        return "Tamil Version:"
      case SongType.portuguese:
        return "Portuguese Version:"
      case SongType.chinese:
      case SongType.english:
      default:
        return "Other Version:"
    }
  }

  return (
    <Flex
      className="flex-wrap w-screen min-h-screen"
      flexDirection="column"
    >
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} key="title" />
        <meta property="og:description" content={title} key="description" />
      </Head >
      <Toaster />
      <Box
        className="box-border flex-1 w-screen sm:max-w-xl sm:min-w-[576px] sm:mx-auto py-8 px-3 sm:px-0 w-full"
      >
        <NavBar />
        <RelatedSongModal
          modalIsOpen={modalIsOpen}
          closeModal={closeModal}
          currentSong={metadata}
          songList={Object.values(allSongs)}
          allBooks={allBooks}
          addCallback={addRelatedSongCallback}
        />
        <AddNoteModal
          isOpen={addNoteModalIsOpen}
          closeModal={closeAddNoteModal}
          song={metadata}
        />
        <Flex className="w-full mb-3 flex-wrap">
          <Flex className="flex-1 w-1/2">
            {previousSongSlug != null ? (
              <Link
                href={getSongPathBySlug(metadata.songType, previousSongSlug)}
              >
                <ChevronLeft
                  className="arrow-icon inline"
                />
                Prev
              </Link>
            ) : (
              <></>
            )}
          </Flex>
          <Flex
            className="flex-1 w-1/2 pr-2 sm:pr-0 justify-end"
          >
            {nextSongSlug && (
              <Link
                style={{ float: "right" }}
                href={getSongPathBySlug(metadata.songType, nextSongSlug)}
              >
                Next
                <ChevronRight
                  className="arrow-icon inline"
                />
              </Link>
            )}
          </Flex>
        </Flex>
        <Row className="mb-2">
          <SearchBar />
        </Row>
        <Flex className="flex-wrap items-center mt-4">
          <div className="w-full" ref={displayBoxWidthRef}>
            {metadata?.reference && firstReferenceSong && (userCanSeeBilingual(user) || ALLOWED_BOOKS_TO_SEE_TRANSLATION.includes(firstReferenceSong.hymn)) && (
              <Link
                fontSize="12px"
                href={getSongPathBySlug(
                  getOtherSongType(metadata?.songType),
                  firstReferenceSong?.slug
                )}
              >
                {firstReferenceSong?.hymn} {firstReferenceSong?.pageNumber} |{" "}
                {firstReferenceSong?.name}
                <img
                  className="arrow-right-icon inline"
                  src="/arrow-right-thin.svg"
                  alt={`go to ${firstReferenceSong?.name}`}
                />
              </Link>
            )}
            <Heading className="mb-1 mt-0" fontSize="24px" as="h4" type="h4">
              {metadata.name}{" "}
              {navigator?.share ? (
                <img
                  onClick={handleShareClick}
                  src="/share.svg"
                  className="share-icon click-icon inline"
                  alt="Share link to hymn"
                />
              ) : (
                <img
                  onClick={handleCopyClick}
                  src="/copy.svg"
                  className="share-icon click-icon inline"
                  alt="Copy link to hymn"
                />
              )}
            </Heading>
            <Flex className="mb-2 items-center" flexDirection="row">
              <HymnTag hymnBook={metadata.hymn} />{" "}
              <Text as="span" className="pl-2" fontSize="14px" color="#666B72">
                {"pg " + metadata.pageNumber}
              </Text>
              {!isLoadingFavorites && !loadingSession && (
                <Flex>
                  <Text
                    as="span"
                    className="px-1"
                    color="#666B72"
                    fontSize="14px"
                  >
                    •
                  </Text>
                  <span
                    className="favorite-text inline"
                    onClick={isFavorited ? removeFromFavorites : addToFavorites}
                  >
                    <img
                      className="favorite-icon click-icon inline"
                      src={isFavorited ? "/star-filled.svg" : "/star.svg"}
                      title="star or unstar song"
                      alt="star or unstar song"
                    />
                    <Text as="span" fontSize="14px" color="#666B72">
                      {isFavorited ? "Unstar" : "Star"}
                    </Text>
                  </span>
                </Flex>
              )}
            </Flex>
            <SongAudio metadata={metadata} onAudioLoadedMetadata={onAudioLoadedMetadata} />
            {embedSongSheet ? (
              <div className="pt-4 pdf-container">
                <Document
                  file={songSheetLink}
                  onLoadSuccess={onDocumentLoadSuccess}
                  error={
                    <Box className="pb-3 max-w-[96%]">
                      <Flex
                        m="20% 0"
                        className="items-center justify-center pb-3 max-w-[96%]"
                        flexDirection="row"
                      >
                        <Box width="320px">
                          <Text as="p">Sorry, PDF Not Available</Text>
                        </Box>
                      </Flex>
                    </Box>
                  }
                  loading={
                    <Box className="pb-3 max-w-[96%]">
                      <Placeholder fluid>
                        <Placeholder.Header>
                          <Placeholder.Line />
                          <Placeholder.Line />
                        </Placeholder.Header>
                        {[...Array(5)].map((e, index) => (
                          <Placeholder.Paragraph key={`placeholder-${index}`}>
                            <Placeholder.Line />
                            <Placeholder.Line />
                            <Placeholder.Line />
                            <Placeholder.Line />
                          </Placeholder.Paragraph>
                        ))}
                      </Placeholder>
                    </Box>
                  }
                >
                  {showChordSheet ?
                    range(startingChordSheetPageNum, endPage).map((index) => (
                      <Page
                        width={displayBoxWidthRef?.current?.offsetWidth ?? "460"}
                        padding={0}
                        margin={0}
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        renderAnnotationLayer={false}
                        loading={
                          <Box className="pb-3 max-w-[96%]">
                            <Placeholder fluid>
                              <Placeholder.Header>
                                <Placeholder.Line />
                                <Placeholder.Line />
                              </Placeholder.Header>
                              {[...Array(5)].map((e, index) => (
                                <Placeholder.Paragraph key={`placeholder-${index}`}>
                                  <Placeholder.Line />
                                  <Placeholder.Line />
                                  <Placeholder.Line />
                                  <Placeholder.Line />
                                </Placeholder.Paragraph>
                              ))}
                            </Placeholder>
                          </Box>
                        }
                      />
                    ))
                    :
                    Array.from(new Array(numPdfPages), (el, index) => (
                      <Page
                        width={displayBoxWidthRef?.current?.offsetWidth ?? "460"}
                        padding={0}
                        margin={0}
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                      />
                    ))
                  }
                </Document>
              </div>
            ) : (
              currentBook?.onlySongSheet ?
                <Flex flexDirection="row">
                  <div className="notice-card mb-4 mt-4">
                    <Box className="p-4">
                      <Text as="p" fontSize="14px" color="#8B9199">
                        {
                          userHasRoleOrAdmin(user, UserRole.readSongSheet) ?
                            "Hymn only has song sheet." :
                            "Hymn only has song sheet. Please contact church leaders to get access to song sheet."
                        }
                      </Text>
                    </Box>
                  </div>
                </Flex>
                :
                <pre className="pre-body">
                  <Text
                    as="p"
                    className="pt-8 pb-14"
                    fontSize="16px"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(song.content?.trim() || "") }}
                  >
                  </Text>
                </pre>
            )}
            {/* <Flex className="items-center w-full justify-center gap-0.5 mb-5">
              <Box width="225px">

                <ToggleButton
                  name1={SongType.english}
                  option1="View Song Sheet"
                  name2={SongType.chinese}
                  option2="View Lyrics Only"
                  active={SongType.english}
                  toggleActive={() => { }}
                />
              </Box>
            </Flex> */}
          </div>
        </Flex>
        {
          (metadata?.startKey ||
            metadata?.key ||
            metadata?.metaToDisplay?.length > 0 ||
            showTagsInSong ||
            metadata?.melodyCluster ||
            referenceSongs?.length > 1 ||
            otherTranslations?.length > 0
          ) && (
            <Row className="mb-3">
              <div className="card-info">
                <Box className="p-3">
                  <Text as="p" fontWeight="500" fontSize="16px" className="mb-2">
                    Details
                  </Text>
                  {metadata?.key && (
                    <Text as="p" fontSize="14px" color="#666B72">
                      <>
                        <MusicIcon
                          className="mr-4 inline"
                          alt="Song's original key"
                          height="16px"
                          width="16px"
                        />
                        Original Key: {metadata?.key}
                      </>
                    </Text>
                  )}
                  {metadata?.startKey && (
                    <Text as="p" fontSize="14px" color="#666B72">
                      <>
                        <MusicIcon
                          className="mr-4 inline"
                          alt="Song's singable key"
                          height="16px"
                          width="16px"
                        />
                        Singing Key: {metadata?.startKey}
                      </>
                    </Text>
                  )}
                  {
                    metadata?.lyricsBy || metadata?.musicBy || metadata?.translatedBy ? (
                      <div className="flex flex-row items-top">
                        <Edit3
                          className="mr-4 inline mt-1"
                          color="#8b9199"
                          width="16px"
                          height="16px"
                        />
                        <Text as="p" fontSize="14px" color="#666B72">
                          Credits
                          <ToggleDetails
                            toggleText={
                              <span>
                                Show Credits
                              </span>
                            }
                          >
                            <div>
                              {metadata?.lyricsBy && (
                                <Text as="p" fontSize="14px" color="#666B72">
                                  Lyrics By: {metadata?.lyricsBy}
                                </Text>
                              )}
                              {metadata?.musicBy && (
                                <Text as="p" fontSize="14px" color="#666B72">
                                  Music By: {metadata?.musicBy}
                                </Text>
                              )}
                              {metadata?.translatedBy && (
                                <Text as="p" fontSize="14px" color="#666B72">
                                  Translated By: {metadata?.translatedBy}
                                </Text>
                              )}
                            </div>
                          </ToggleDetails>
                        </Text>
                      </div>
                    )
                      : null
                  }
                  {metadata?.metaToDisplay?.map((m) => (
                    <Text key={m?.key} as="p" fontSize="14px" color="#666B72">
                      <>
                        <img
                          className="details-icon pr-4 inline"
                          src="/info.svg"
                          alt={`Info on song's ${m?.key}`}
                        />
                        <>{m?.key}: {m?.href ? <Link href={m?.href} underline fontSize="inherit">{m?.value}</Link> : <>{m?.value}</>}</>
                      </>
                    </Text>
                  ))
                  }
                  {showTagsInSong && metadata?.tags?.length > 0 && (
                    <Text as="p" fontSize="14px" color="#666B72">
                      <>
                        <img
                          className="details-icon pr-4 inline"
                          src="/info.svg"
                          alt={`Song tags`}
                        />
                        Categories: {
                          metadata?.tags?.map((tag, i) => (
                            <Link
                              key={tag}
                              href={`/tags/${tag}`}
                              fontSize="inherit"
                            >
                              <>{tag}
                                {i < metadata?.tags?.length - 1 && ", "}
                              </>
                            </Link>
                          ))
                        }
                      </>
                    </Text>
                  )}
                  {userCanSeeBilingual(user) && otherTranslations?.length > 0 && (
                    otherTranslations
                      .filter(refSong => refSong?.songType != null)
                      .map(refSong => (
                        <Text key={refSong?.slug} as="p" fontSize="14px" color="#666B72">
                          <>
                            <img
                              className="details-icon pr-4 inline"
                              src="/globe.svg"
                              alt={`Other Translations`}
                            />
                            {getOtherVersionForLang(refSong?.songType)}{" "}
                            <Link href={getSongPathBySlug(
                              refSong?.songType,
                              refSong?.slug
                            )}>{refSong?.hymn} {refSong?.pageNumber} {refSong?.name}</Link>
                          </>
                        </Text>
                      ))
                  )}
                  {
                    metadata?.melodyCluster && (
                      <div>
                        <div className="flex flex-row items-top">
                          <MusicIcon
                            className="mr-4 inline mt-1"
                            alt="Song's similar melody songs"
                            height="16px"
                            width="16px"
                          />
                          <div>
                            <Text as="p" fontSize="14px" color="#666B72">
                              Similar Melody: <Link href={getSongPath(clusterBaseSong)}><>{clusterBaseSong?.hymn} {clusterBaseSong?.pageNumber} {clusterBaseSong?.name}</></Link>
                            </Text>
                            <Text as="p" color="#8b9199" fontSize="12px" lineHeight="1.2">
                              {cluster?.cluster?.description}
                            </Text>
                            <Text as="span" fontSize="14px" color="#666B72">
                              <ToggleDetails
                                toggleText={
                                  <span>
                                    Show Cluster ({cluster?.songs?.filter((c) => c?.slug != metadata?.slug)?.length ?? 0})
                                  </span>
                                }
                              >
                                <div>
                                  {
                                    cluster?.songs?.filter((c) => c?.slug != metadata?.slug)?.map((clusterSong: MelodyClusterSong) => {
                                      const clusterSongMeta = allSongs[clusterSong.slug]
                                      return (
                                        <Text lineHeight="1.4" className="py-1" key={clusterSong?.slug}>
                                          <Link
                                            lineHeight="1.4"
                                            href={getSongPath(clusterSongMeta)}
                                          >
                                            <>{clusterSongMeta?.hymn} {clusterSongMeta?.pageNumber} {clusterSongMeta?.name}</>
                                          </Link>
                                          {
                                            clusterSong?.note &&
                                            <Text
                                              as="span"
                                              color="#666B72"
                                              fontSize="12px"
                                              lineHeight="1"
                                              className="ml-1.5"
                                            >
                                              ({clusterSong?.note})
                                            </Text>
                                          }
                                        </Text>
                                      )
                                    })
                                  }
                                </div>
                              </ToggleDetails>
                            </Text>
                          </div>
                        </div>
                      </div>
                    )
                  }
                </Box>
              </div>
            </Row>
          )
        }
        {canReadSongSheet && (
          <Box className="mb-5">
            <Text className="text-center" color="#8B9199" fontSize="10px">
              Toggle Song Content View
            </Text>
            <Flex className="items-center w-full justify-center gap-0.5">
              <Pill className="" isActive={embedSongSheet} onClick={() => toggleEmbedSongSheet(!embedSongSheet)}>
                View Song Sheet
              </Pill>
              <Pill isActive={!embedSongSheet} onClick={() => toggleEmbedSongSheet(!embedSongSheet)}>
                Lyrics Only
              </Pill>
            </Flex>
          </Box>
        )}
        <Flex
          flexDirection="row"
          className={`pb-4 ${showRelatedSongs || showNotes ? "border-b border-[#e1e4e8]" : ""}`}
        >
          <Link
            underline
            href={`https://github.com/tko22/song-app/tree/main/songContent/${metadata.songType}/${metadata.slug}.md`}
            fontSize="14px"
          >
            Edit on Github
          </Link>
          {/* {canReadSongSheet && (
            <>
              <Text
                as="span"
                color="#666B72"
                fontSize="14px"
                className="px-1"
              >
                •
              </Text>
              <Text
                as="span"
                className="underline cursor-pointer"
                color="#155DA1"
                fontSize="14px"
                onClick={() => toggleEmbedSongSheet(!embedSongSheet)}
              >
                {embedSongSheet ? "Lyrics Only" : "View Song Sheet"}
              </Text>
            </>
          )} */}
        </Flex>
        {
          showNotes &&
          (
            <Row className={`mt-2 ${showRelatedSongs ? "pb-4 border-b w-full border-[#e1e4e8]" : ""}`}>
              <div className="mb-2 flex items-center w-full">
                <div>
                  <Heading as="h4" type="h4" fontSize="20px">
                    Notes
                    <img
                      src="/plus-circle.svg"
                      width="16px"
                      className="ml-4 inline cursor-pointer"
                      onClick={() => setAddNoteModalIsOpen(true)}
                    />
                  </Heading>
                </div>
                <div className="ml-auto mr-1">
                  <Link href="/profile/notes" fontSize="14px" underline lineHeight="1">All Notes</Link>
                </div>
              </div>
              {
                songNotes && songNotes.length > 0 ?
                  songNotes?.sort((a, b) => b.createdAt - a.createdAt)?.map((note) => (
                    <SongNote
                      songNote={note}
                      song={metadata}
                    />
                  ))
                  :
                  <Box className="mt-3">
                    <Text as="p" fontSize="14px" color="#8B9199">
                      No Notes.
                    </Text>
                  </Box>
              }
            </Row>
          )
        }
        <Flex className="flex-wrap flex-1" flexDirection="column">
          {showRelatedSongs && (
            <Box className="mb-5 pt-2">
              <Heading as="h4" type="h4" fontSize="20px" className="mb-0">
                Related Songs
                {addRelatedSongEnabled && (
                  <img
                    src="/plus-circle.svg"
                    width="16px"
                    className="ml-4 inline cursor-pointer"
                    onClick={openModal}
                  />
                )}
              </Heading>
              <Box width="100%">
                {noStanzaRelatedSongs?.length > 0 ? (
                  noStanzaRelatedSongs.map(
                    (song: { song: SongMeta; relatedSong: RelatedSong }) => (
                      <RelatedSongItem
                        key={`${song?.song?.slug}+${song?.relatedSong?._id}`}
                        relatedSong={song?.song}
                        relatedSongIndex={song?.relatedSong}
                        addRelatedSongEnabled={addRelatedSongEnabled}
                        handleRelatedSongClick={handleRelatedSongClick}
                        removeRelatedSong={removeRelatedSong}
                        primaryRelation={true}
                        user={user}
                      />
                    )
                  )
                ) : (
                  <></>
                )}
                {relatedSongsPerStanzas.map((songAndStanza, i) => (
                  <Row
                    key={songAndStanza?.primaryStanza + i}
                    className="flex-1"
                    flexDirection="column"
                  >
                    <Text
                      as="p"
                      fontSize="14px"
                      fontWeight={500}
                      className="mt-2.5"
                    >
                      {getCorrectStanzaText(songAndStanza?.primaryStanza)}
                    </Text>
                    {songAndStanza?.songs.map(
                      (song: { song: SongMeta; relatedSong: RelatedSong }) => (
                        <RelatedSongItem
                          key={`${song?.song?.slug}+${song?.relatedSong?._id}`}
                          relatedSong={song?.song}
                          relatedSongIndex={song?.relatedSong}
                          addRelatedSongEnabled={addRelatedSongEnabled}
                          handleRelatedSongClick={handleRelatedSongClick}
                          removeRelatedSong={removeRelatedSong}
                          primaryRelation={true}
                          user={user}
                        />
                      )
                    )}
                  </Row>
                ))}
                {noStanzaRelatedSongs?.length <= 0 &&
                  relatedSongsPerStanzas?.length <= 0 ? (
                  <Text as="p" fontSize="14px" color="#8B9199" className="mt-3">
                    No Songs. 🙁
                  </Text>
                ) : null}
              </Box>
              {userHasRoleOrAdmin(user, UserRole.readSecondaryRelatedSong) && secondarySongs && secondarySongs?.length > 0 && (
                <Box className="mt-5">
                  <Text
                    as="p"
                    fontSize="14px"
                    fontWeight={500}
                    className="mt-2.5"
                  >
                    Secondary relations to this song
                  </Text>
                  {secondarySongs
                    ?.filter(
                      (song: { song: SongMeta; relatedSong: RelatedSong }) =>
                        song?.song.slug !== metadata?.slug
                    )
                    ?.filter((song) => song?.song != null)
                    .map(
                      (song: { song: SongMeta; relatedSong: RelatedSong }) => (
                        <RelatedSongItem
                          key={`${song?.song?.slug}+${song?.relatedSong?._id}`}
                          relatedSong={song?.song}
                          relatedSongIndex={song?.relatedSong}
                          addRelatedSongEnabled={false}
                          handleRelatedSongClick={handleRelatedSongClick}
                          removeRelatedSong={null}
                          primaryRelation={false}
                          user={user}
                        />
                      )
                    )}
                </Box>
              )}
            </Box>
          )}
        </Flex>
        <Flex className="flex-wrap">
          <Box className="h-8	mb-4 w-full"></Box>
        </Flex>
      </Box >
      <style jsx>{`
        .pre-body {
          overflow-x: auto;
          white-space: pre-wrap;
          white-space: -moz-pre-wrap;
          white-space: -pre-wrap;
          white-space: -o-pre-wrap;
          word-wrap: break-word;
        }
        .audio-player:focus {
          outline: none;
        }
        .arrow-right-icon {
          vertical-align: middle;
          height: 16px;
          padding-bottom: 2px;
        }
        .details-icon {
          vertical-align: middle;
          height: 18px;
          padding-bottom: 2px;
        }
        .music-icon {
          padding-right: 6px;
        }
        .share-icon {
          margin-left: 4px;
        }
        .remove-related-song-icon {
          align-self: center;
        }
        .favorite-text {
          color: #8b9199;
          cursor: pointer;
        }
        .favorite-icon {
          margin-left: 4px;
          margin-right: 4px;
          vertical-align: middle;
          margin-bottom: 2px;
        }
        .click-icon {
          width: 16px;
          cursor: pointer;
        }
        .card-info {
          border: 1px solid #ebeef2;
          border-radius: 6px;
          width: 100%;
          font-size: 12px;
        }
        .pdf-container {
          box-sizing: border-box;
        }
      `}</style>
    </Flex >
  );
};

/**
 * Component for Related Song Entry item
 */
const RelatedSongItem = ({
  relatedSong,
  relatedSongIndex,
  addRelatedSongEnabled,
  handleRelatedSongClick,
  removeRelatedSong,
  primaryRelation = true,
  user,
}: {
  relatedSong: SongMeta;
  relatedSongIndex: RelatedSong | null;
  addRelatedSongEnabled: boolean;
  handleRelatedSongClick: any;
  removeRelatedSong: any;
  primaryRelation: boolean; // if it's a relation of song a => song b, where song a is what we are looking at
  user?: UserInfo | null;
}): JSX.Element => {
  return (
    <SongItem
      key={relatedSong?.slug + relatedSongIndex?._id}
      song={relatedSong}
      handleClick={handleRelatedSongClick}
    >
      <Flex
        flexDirection="row"
        className="pl-0.5 items-center content-center"
      >
        <HymnTag
          style={{ width: "min-content" }}
          className="inline"
          pageNumber={relatedSong?.pageNumber}
          hymnBook={relatedSong?.hymn}
          fullName={false}
          allowLink={false}
        />
        <div className="pt-1 pl-2">
          <>
            <Text as="span" fontSize="16px">
              {relatedSong?.name}{" "}
            </Text>
            {primaryRelation && relatedSongIndex?.secondaryStanzas ? (
              <Text as="span" color="#8B9199" fontSize="12px" lineHeight="0">
                ({getCorrectStanzaText(relatedSongIndex?.secondaryStanzas)})
              </Text>
            ) : null}
            {!primaryRelation && (relatedSongIndex?.primaryStanzas || relatedSongIndex?.secondaryStanzas) ? (
              <Text as="span" color="#8B9199" fontSize="12px" lineHeight="0">
                ({relatedSongIndex?.primaryStanzas && <>{getCorrectStanzaText(relatedSongIndex?.primaryStanzas)}</>}{relatedSongIndex?.secondaryStanzas && <>
                  <img
                    className="inline related-song-to-icon"
                    src="/arrow-right-thin-gray.svg"
                    alt={`to stanza`}
                  /> {getCorrectStanzaText(relatedSongIndex?.secondaryStanzas)}</>})
              </Text>
            ) : null}
            {(user?.isAdmin ||
              userHasRole(user, UserRole.readRelatedSongNotes)) &&
              relatedSongIndex?.note ? (
              <>
                <Text as="p" color="#8B9199" fontSize="12px" lineHeight="16px">
                  {relatedSongIndex?.note}
                </Text>
              </>
            ) : null}
          </>
        </div>
        <Box className="ml-auto">
          {addRelatedSongEnabled && removeRelatedSong && (
            <img
              src="/x-inactive.svg"
              onMouseOver={(e) => (e.currentTarget.src = "/x.svg")}
              onMouseOut={(e) => (e.currentTarget.src = "/x-inactive.svg")}
              width="20px"
              className="mr-2 remove-related-song-icon"
              onClick={(e) =>
                removeRelatedSong(e, relatedSong, relatedSongIndex)
              }
            />
          )}
        </Box>
      </Flex>
      <style jsx>{`
        .related-song-to-icon {
          vertical-align: middle;
          height: 12px;
          width: 12px;
        }
        `}
      </style>
    </SongItem >
  );
};

/**
 * Get correct text to display for stanzas text. If the stanzas text has spaces (after trim),
 * it probably means there's more than one stanza, so we have "Stanzas". If there's no space, like
 * 1 or 12, then we assume there's only one stanza.
 *
 * @param stanzasText   the stanzas text from the RelatedSong
 * @returns             Stanzas text to display
 */
const getCorrectStanzaText = (stanzasText: string): string | null => {
  if (stanzasText !== null && stanzasText !== undefined) {
    // if doesn't include number
    if (!/\d/.test(stanzasText)) {
      return stanzasText.trim();
    }
    if (stanzasText?.trim().includes(" ")) {
      return `Stanzas ${stanzasText}`;
    }
    return `Stanza ${stanzasText}`;
  }
  return null;
};

/**
 * Component to show Song Audio Player with toggle
 */
const SongAudio = ({ metadata, onAudioLoadedMetadata }: { metadata: SongMeta, onAudioLoadedMetadata: ReactEventHandler<HTMLAudioElement> }): JSX.Element => {
  return (
    <>
      {metadata.mp3 && (
        <ToggleDetails
          toggleText={
            <span>
              <MusicIcon
                className="inline align-middle h-4 w-4 mr-1 pb-0.5"
                alt="toggle music player"
              />
              Audio
            </span>
          }
        >
          <audio controls className="audio-player" src={metadata.mp3} onLoadedMetadata={onAudioLoadedMetadata} />
        </ToggleDetails>
      )}
      {
        // show piano if the normal mp3 doesn't exist
        (metadata?.mp3 == "" || !metadata?.mp3) && metadata?.pianoMp3 && (
          <ToggleDetails
            toggleText={
              <span>
                <PianoIcon
                  className="inline align-middle h-4 pr-1 pb-0.5"
                  alt="toggle piano music player"
                />
                Piano
              </span>
            }
          >
            <audio controls className="audio-player" src={metadata?.pianoMp3} onLoadedMetadata={onAudioLoadedMetadata} />
          </ToggleDetails>
        )
      }
      {
        // show instrumental if the normal mp3 or piano mp3 doesn't exist and we have instrumentals for it
        (metadata?.mp3 == "" ||
          !metadata?.mp3 ||
          metadata?.pianoMp3 == "" ||
          !metadata?.pianoMp3) &&
        metadata?.instrumentalMp3 && (
          <ToggleDetails
            toggleText={
              <span>
                <MusicIcon
                  className="inline align-middle h-4 w-4 mr-1 pb-0.5"
                  alt="toggle music player"
                />
                Instrumental
              </span>
            }
          >
            <audio
              controls
              className="audio-player"
              src={metadata?.instrumentalMp3}
              onLoadedMetadata={onAudioLoadedMetadata}
            />
          </ToggleDetails>
        )
      }
      <style jsx>{`
        .music-icon {
          vertical-align: middle;
          height: 16px;
          padding-right: 6px;
          padding-bottom: 2px;
        }
      `}</style>
    </>
  );
};

export default SongPage;

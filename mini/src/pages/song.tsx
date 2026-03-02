import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Document, Page } from "react-pdf";
import { Helmet } from "react-helmet";
import DOMPurify from 'dompurify';


import { EmbedSongSheetContext } from "../utils/utils";

import NavBar from "../components/MinNavBar";
import SearchBar from "../components/MinSearchBar";
import HymnTag from "../components/MinHymnTag";
import Placeholder from "../components/MinPlaceholder";

import songMeta from "../data/miniSongList.json";
import ChevronLeftSvg from "../assets/chevron-left.svg";
import ChevronRightSvg from "../assets/chevron-right.svg";
import ArrowRightSvg from "../assets/arrow-right-thin.svg";
import MusicSvg from "../assets/music.svg";
import ToggleDetails from "../components/ToggleDetails";
import { SongType } from "../utils/constants";

const SECOND_LANGUAGE = process.env.REACT_APP_SECOND_LANGUAGE


/**
 * Individual Song Page for the mini app
 */
const MinSongPage = () => {
  let { songType, slug } = useParams();
  const { embed: embedSongSheetCtxVal } = useContext(EmbedSongSheetContext);
  const [embedSongSheet, setEmbedSongSheet] = useState(embedSongSheetCtxVal);
  const displayBoxWidthRef = useRef<HTMLDivElement>(null);

  // for embedding song sheet
  const [numPdfPages, setNumPdfPages] = useState(null);
  // on load of pdf, set num pages of pdf
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPdfPages(numPages);
  };

  useEffect(() => {
    setEmbedSongSheet(embedSongSheetCtxVal);
  }, [embedSongSheetCtxVal])

  const toggleEmbedSongSheet = () => {
    setEmbedSongSheet(!embedSongSheet);
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (!slug || !songType) {
    return (
      <div className="body-box">
        <div className="my-[20%] flex content-cente justify-center flex-row	w-full h-10">
          <Helmet>
            <title>Unknown Song</title>
          </Helmet>
          <div className="w-80">
            <p>Sorry, Song isn't available 😕</p>
            <Link to="/">Go back home</Link>
          </div>
        </div>
      </div>
    );
  }

  const hymnBooks = Object.values(songMeta?.hymnBooks);
  const songs: { [key: string]: any } = songMeta?.songs;
  const songList = Object.values(songs);
  let metadata: any = songs[slug];

  if (metadata == null) {
    return (
      <div className="body-box">
        <Helmet>
          <title>Unknown Song</title>
        </Helmet>
        <div className="my-[20%] flex content-center	justify-center flex-row	w-full h-10">
          <div className="w-80">
            <p>Sorry, Song isn't available 😕</p>
            <Link to="/">Go back home</Link>
          </div>
        </div>
      </div>
    );
  }

  // find next song and previous song slugs
  // songs in the same book
  const songSlugsInSameBook = songList
    ?.filter((song) => song?.hymn === metadata?.hymn)
    ?.sort((songA, songB) => {
      // compare page numbers, cannot just compare slug strings because SOL1_100 is < SOL1_3 in string comparison
      const slugA = songA.slug;
      const slugB = songB.slug;
      const aPg = parseInt(slugA.split("_")[1]);
      const bPg = parseInt(slugB.split("_")[1]);
      if (aPg > bPg) {
        return 1;
      } else if (bPg > aPg) {
        return -1;
      }
      return 0;
    });

  // find the current song and it's index in the sorted list
  const currentSongSlugIndex = songSlugsInSameBook.findIndex(
    (song) => song.slug === metadata.slug
  );

  // if last index, it is null
  const nextSongSlug =
    currentSongSlugIndex < songSlugsInSameBook.length - 1 &&
      currentSongSlugIndex !== -1
      ? songSlugsInSameBook[currentSongSlugIndex + 1].slug
      : null;
  // if first index, it is null
  const previousSongSlug =
    currentSongSlugIndex > 0 && currentSongSlugIndex !== -1
      ? songSlugsInSameBook[currentSongSlugIndex - 1].slug
      : null;

  const title = `${metadata.hymn} ${metadata.pageNumber} | ${metadata.name}`;

  const actualEmbedSongSheet = metadata.hasOwnSheetPdf;
  const shouldEmbed = embedSongSheet && actualEmbedSongSheet;

  const getRefSongPath = (hymn, pageNumber, songType) => {
    return `/songs/${songType}/${hymn}_${pageNumber}`;
  }

  const mp3Link = metadata.mp3 ? `https://songapp.vercel.app${metadata.mp3}` : metadata.instrumentalMp3 ? `https://songapp.vercel.app${metadata.instrumentalMp3}` : metadata.pianoMp3 ? `https://songapp.vercel.app${metadata.pianoMp3}` : null;

  let refSong;
  if (metadata?.referenceSongs && metadata?.referenceSongs.length > 0) {
    const filteredRefSongList = metadata?.referenceSongs.filter(s => s.songType == SongType.english || s.songType == SECOND_LANGUAGE)
    if (filteredRefSongList.length > 0) {
      refSong = filteredRefSongList[0];
    }
    else {
      refSong = metadata?.referenceSongs[0];
    }
  };

  return (
    <div className="body-box">
      <Helmet>
        <title>{title}</title>
        <meta property="og:title" content={title} key="title" />
      </Helmet>
      <div className="main-container sm:px-1">
        <NavBar />

        <div className="row w-full">
          <div className="flex flex-1 w-6/12 mt-2">
            {previousSongSlug ? (
              <Link
                className="link"
                to={`/songs/${songType}/${previousSongSlug}`}
              >
                <img
                  className="inline arrow-icon"
                  src={ChevronLeftSvg}
                  alt="Previous song"
                />
                Prev
              </Link>
            ) : (
              <></>
            )}
          </div>
          <div className="flex flex-1 w-6/12 justify-end">
            {nextSongSlug ? (
              <Link className="link" to={`/songs/${songType}/${nextSongSlug}`}>
                Next
                <img
                  className="inline arrow-icon"
                  src={ChevronRightSvg}
                  alt="Next song"
                />
              </Link>
            ) : (
              <></>
            )}
          </div>
        </div>
        <SearchBar />

        <div className="pt-4 mt-1" ref={displayBoxWidthRef}>
          <div className="text-xs">
            {refSong && (
              <Link className="text-base-blue link" to={getRefSongPath(refSong?.hymn, refSong?.pageNumber, refSong.songType)}>
                {refSong?.hymn} {refSong?.pageNumber} |{" "}
                {refSong?.name}
                <img
                  className="arrow-right-icon inline"
                  src={ArrowRightSvg}
                  alt={`go to ${refSong?.name}`}
                />
              </Link>
            )}
          </div>
          <h2 className="text-2xl mb-1">{metadata.name} </h2>
          <div>
            <HymnTag hymnBook={metadata?.hymn} allowLink={true} />
            <span className="text-[14px] text-gray pl-2">
              pg {metadata?.pageNumber}
            </span>
          </div>
          {mp3Link && (
            <ToggleDetails
              className="mt-1"
              toggleText={
                <span>
                  <img
                    className="music-icon inline"
                    src={MusicSvg}
                    alt="toggle music player"
                  />
                  Audio
                </span>
              }
            >
              <audio controls className="audio-player" src={`${mp3Link}`} />
            </ToggleDetails>
          )}
          <div className="mt-8 w-full">
            {shouldEmbed ? (
              <Document
                file={`https://songs.timothyko.org/books/individual-pages/${metadata?.songType}/${metadata?.slug}.pdf`}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="py-3 pdf-viewer">
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
                  </div>
                }
              >
                {Array.from(new Array(numPdfPages), (el, index) => (
                  <Page
                    // @ts-ignore
                    width={displayBoxWidthRef?.current?.offsetWidth ?? "460"}
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                  />
                ))}
              </Document>
            ) : (
              <pre className="pre-body">
                <p
                  className="text-base"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(metadata?.content?.trim() || "") }}
                >
                </p>
              </pre>
            )}
          </div>
        </div>
        <div className="mt-10 text-sm">
          {

            SECOND_LANGUAGE == SongType.portuguese &&
            <Link
              className="link underline"
              to={`https://github.com/tko22/song-app/tree/main/songContent/${metadata.songType}/${metadata.slug}.md`}
            >
              Edit on Github
            </Link>
          }
        </div>
        <div className="mb-4 w-full h-6"></div>
        {/* <div className="pt-2 text-[14px]">
          {actualEmbedSongSheet ?
            <p
              className="link underline cursor-pointer	"
              onClick={toggleEmbedSongSheet}
            >
              {embedSongSheet ? "Lyrics Only" : "Song Sheet"}
            </p> : null
          }
        </div> */}
      </div>
      <div className="row">
        <div className="mb-4 w-full h-8"></div>
      </div>
    </div >
  );
};

export default MinSongPage;

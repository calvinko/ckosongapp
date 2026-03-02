import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

import NavBar from "../components/MinNavBar";
import SearchBar from "../components/MinSearchBar";
import HymnTag from "../components/MinHymnTag";

import englishMeta from "../data/miniSongList.json";
import ChevronLeftSvg from "../assets/chevron-left.svg";
import GlobeSvg from "../assets/globe.svg";
import MusicSvg from "../assets/music.svg";
import { SongType } from "../utils/constants";
import song from "./song";

const SECOND_LANGUAGE = process.env.REACT_APP_SECOND_LANGUAGE


/**
 * Book page for a specific hymn book for the mini song app
 */
const MinBookPage = () => {
  const { hymnBook } = useParams();
  const navigate = useNavigate();

  if (!hymnBook) {
    return (
      <div className="body-box">
        <Helmet>
          <title>Unknown Hymn Book</title>
        </Helmet>
        <div className="my-[20%] flex content-center	justify-center flex-row	w-full h-10">
          <div className="w-80">
            <p>Sorry, Book isn't available 😕</p>
            <Link to="/">Go back home</Link>
          </div>
        </div>
      </div>
    );
  }

  const englishSongs = englishMeta?.songs;
  const hymnBookMeta = Object.values(englishMeta?.hymnBooks)?.find(
    (book) => book.hymnBook === hymnBook
  );

  const songsInBook = Object.values(englishSongs)
    ?.filter((song) => song?.hymn === hymnBook)
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

  const title = `${hymnBookMeta?.hymnBook} - ${hymnBookMeta?.bookFullName}`;

  const hasSecondLanguageTranslation = (song) => {
    const songReferences = song?.referenceSongs
    if (!songReferences) {
      return false;
    }

    if (songReferences?.length > 0) {
      return songReferences.filter((ref) => ref.songType === SECOND_LANGUAGE).length > 0;
    }

    return false;
  }

  return (
    <div className="body-box">
      <Helmet>
        <title>{title}</title>
        <meta property="og:title" content={title} key="title" />
      </Helmet>
      <div className="main-container sm:px-1">
        <NavBar />
        <SearchBar />

        <div className="mt-5">
          <Link className="link" to="/">
            <img
              className="inline arrow-icon"
              src={ChevronLeftSvg}
              alt="Back home"
            />
            Back
          </Link>
          <h2 className="text-3xl pb-2 mt-3">{hymnBookMeta?.bookFullName}</h2>
          <HymnTag fullName={false} hymnBook={hymnBook} allowLink={false} />
          <div className="mt-3">
            {songsInBook?.map((song: any) => (
              <div
                key={song?.slug}
                className="song-item"
                onClick={() =>
                  navigate(`/songs/${song?.songType}/${song?.slug}`)
                }
              >
                <p className="text-base pl-1">
                  <span className="font-medium w-10">{song?.pageNumber}.</span>{" "}
                  {song.name}
                  {song?.mp3 && (
                    <img
                      src={
                        MusicSvg
                      }
                      className="song-icon inline"
                      alt="has mp3"
                    />
                  )}
                  {(song?.songType === SongType.english && hasSecondLanguageTranslation(song)) && (
                    <img
                      src={
                        GlobeSvg
                      }
                      className="song-icon inline"
                      alt="is translated"
                    />
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinBookPage;

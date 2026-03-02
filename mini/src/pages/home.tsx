// @ts-ignore
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

import songMeta from "../data/miniSongList.json";
import NavBar from "../components/MinNavBar";
import SearchBar from "../components/MinSearchBar";
import { SongTypeContext } from "../utils/utils";
import { SongType } from "../utils/constants";
import MinLanguagePill from "../components/MinLanguagePill";

const SECOND_LANGUAGE = process.env.REACT_APP_SECOND_LANGUAGE
/**
 * Home page for the mini song app
 */
function HomePage() {
  const navigate = useNavigate();
  const { songType } = useContext(SongTypeContext);
  const songs = songMeta.songs;
  const books = songMeta.hymnBooks;

  let chineseBookMeta: any[] = [];
  let englishBookMeta: any[] = [];
  let tamilBookMeta: any[] = [];
  let portugueseBookMeta: any[] = [];

  if (books != undefined) {
    englishBookMeta = Object.values(books).filter(book => book?.songType === "english");
    chineseBookMeta = Object.values(books).filter(book => book?.songType === "chinese");
    tamilBookMeta = Object.values(books).filter(book => book?.songType === "tamil");
    portugueseBookMeta = Object.values(books).filter(book => book?.songType === "portuguese");
  }

  // let chineseBookMeta: any[] = [];
  // const booksIncluded: string[] = [];
  // Object.values(songs).forEach((song) => {
  //   const book = song.hymn;
  //   // keep track of books that were added or all books are included already
  //   if (
  //     booksIncluded.includes(book) ||
  //     booksIncluded.length == Object.keys(HymnBook).length
  //   ) {
  //     return;
  //   }
  //   booksIncluded.push(book);

  //   if (song.songType == SongType.chinese) {
  //     chineseBookMeta.push({
  //       hymnBook: book,
  //       bookFullName: getHymnBook(book),
  //       songType: SongType.chinese,
  //     });
  //   }
  // });

  // chineseBookMeta.sort((a, b) => {
  //   // if H11, split it into ["H", 11]
  //   const aSplit = a.hymnBook?.match(NumberCharacterRegex);
  //   const bSplit = b.hymnBook?.match(NumberCharacterRegex);

  //   if (aSplit[0].localeCompare(bSplit[0]) == 0) {
  //     return aSplit[1] - bSplit[1];
  //   }
  //   return aSplit[0].localeCompare(bSplit[0]);
  // });

  let bookListToShow;
  switch (songType) {
    case SongType.english:
      bookListToShow = englishBookMeta;
      break;
    case SongType.portuguese:
      bookListToShow = portugueseBookMeta;
      break;
    case SongType.tamil:
      bookListToShow = tamilBookMeta;
      break;
    case SongType.chinese:
    default:
      bookListToShow = chineseBookMeta;
      break;
  }

  let secondLanguageName;
  let secondLanguageOption;
  switch (SECOND_LANGUAGE) {
    case SongType.tamil:
      secondLanguageName = SongType.tamil.toString();
      secondLanguageOption = "Tamil"
      break;
    case SongType.portuguese:
      secondLanguageName = SongType.portuguese.toString();
      secondLanguageOption = "Portuguese"
      break;
    case SongType.chinese:
    default:
      secondLanguageName = SongType.chinese.toString();
      secondLanguageOption = "Chinese"
      break;
  }

  const title = secondLanguageName !== "Chinese" ? `${secondLanguageOption} Hymns` : "Mini Hymns";

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
          <h2 className="text-2xl">Navigate Songs By Book</h2>
          <div className="flex justify-items-center w-full pt-1">
            <MinLanguagePill />
          </div>
          <div className="mt-3">
            {bookListToShow?.map((book) => (
              <div
                key={book.hymnBook}
                className="song-item"
                onClick={() => navigate(`/books/${book?.hymnBook}`)}
              >
                <div className="pl-1">
                  <p className="text-base">{book.bookFullName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

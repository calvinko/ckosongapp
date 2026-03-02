import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { pdfjs } from "react-pdf";

import Home from "./pages/home";
import SongPage from "./pages/song";
import BookPage from "./pages/book";
import "./index.css";

import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { EmbedSongSheetContext, EMBED_SHEET_OPTION_KEY, SongTypeContext, SONG_TYPE_OPTION_KEY } from "./utils/utils";
import { getSongType, SongType, WHITELIST_COUNTRIES } from "./utils/constants";

// for react-pdf to work
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const Main = () => {
  const [songType, setSongType] = useState(SongType.english);
  const [embedSheet, setEmbedSheet] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  /**
   * To update the song type value in the context
   *
   * @param songType  song type to change to
   */
  const changeSongType = (songType: SongType) => {
    localStorage.setItem(SONG_TYPE_OPTION_KEY, songType.toString());
    setSongType(songType);
  };

  const changeEmbedSongSheet = (embed: boolean) => {
    let actualEmbed: boolean = embed;
    if (typeof embed === "string") {
      actualEmbed = embed === "true";
    }
    localStorage.setItem(EMBED_SHEET_OPTION_KEY, actualEmbed.toString());
    setEmbedSheet(actualEmbed);
  }

  // to get local storage details
  useEffect(() => {
    // default to -1 if it is not available
    const localStorageSongType =
      localStorage.getItem(SONG_TYPE_OPTION_KEY) ?? "english";
    setSongType(getSongType(localStorageSongType));

    const localStorageEmbedSheet =
      localStorage.getItem(EMBED_SHEET_OPTION_KEY) ?? "false";
    setEmbedSheet(localStorageEmbedSheet === "true");
  }, []);

  useEffect(() => {
    // get user location data
    const fetchData = async () => {
      const res = await fetch(`https://geolocation-db.com/json/`)
        .then((res) => res.json());
      const countryCode = res?.country_code;
      const userHasAccess = !countryCode || WHITELIST_COUNTRIES.includes(countryCode);
      // setHasAccess(userHasAccess)
    }

    fetchData();
  }, []);

  return (
    <React.StrictMode>
      <SongTypeContext.Provider value={{ songType, setSongType: changeSongType }}>
        <EmbedSongSheetContext.Provider value={{ embed: embedSheet, setEmbed: changeEmbedSongSheet }}>
          <BrowserRouter>
            {
              !hasAccess ?
                <div className="mx-auto max-w-lg md:min-w-[576px]">
                  <div
                    className="flex flex-row items-center justify-center w-full h-10"
                  >
                    <div className="w-[320px]">
                      <p>404 | Page not found</p>
                    </div>
                  </div>
                </div>
                :
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/songs/:songType/:slug" element={<SongPage />} />
                  <Route path="/books/:hymnBook" element={<BookPage />} />
                </Routes>
            }
          </BrowserRouter>
        </EmbedSongSheetContext.Provider>
      </SongTypeContext.Provider>
    </React.StrictMode >
  )
}

root.render(
  <Main />
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

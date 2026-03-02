import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";

import songMeta from "../data/miniSongList.json";
import { getHymnBook, SongType } from "../utils/constants";
import SongSearchSelect from "./MinSongSearchSelect";
import { SongTypeContext } from "../utils/utils";

const REG_FUSE_OPTIONS = {
  includeScore: true,
  threshold: 0.4,
  keys: [
    "name",
    "hymn",
    "pageNumber",
    "bookAndPage",
    "fullBookAndPage",
  ],
};

/**
 * SearchBar for the mini song app. Only supports searching by name, book
 */
const SearchBar = () => {
  const navigate = useNavigate();
  const [_, toggleMenuOpen] = useState(false);
  const { songType } = useContext(SongTypeContext);

  /**
   * Called whenever the Select bar is opened
   */
  const handleMenuOpen = () => {
    toggleMenuOpen(true);
  };

  /**
   * Called whenever the Select bar is closed
   */
  const handleMenuClose = () => {
    toggleMenuOpen(false);
  };

  /**
   * Method that handles when user clicks on a selectable item in the search bar.
   *
   * @param e
   * @returns
   */
  const changeVal = (e) => {
    if (e == null) {
      return;
    }

    navigate(
      `/songs/${e?.data?.songType}/${e?.data?.hymn}_${e?.data?.pageNumber}`
    );
  };

  const songList = Object.values(songMeta?.songs);
  const songSearches = songList.map((song) => ({
    name: song?.name,
    hymn: song?.hymn,
    pageNumber: song?.pageNumber,
    songType: song?.songType,
    fullBookName: getHymnBook(song?.hymn),
    bookAndPage: `${song?.hymn} ${song.pageNumber}`,
    fullBookAndPage: `${getHymnBook(song?.hymn)} ${song?.pageNumber}`,
  }));

  let englishSongs = songSearches.filter((song) => song.songType === "english");
  let chineseSongs = songSearches.filter((song) => song.songType === "chinese");
  let tamilSongs = songSearches.filter((song) => song.songType === "tamil");
  let portugueseSongs = songSearches.filter((song) => song.songType === "portuguese");

  const englishFuse = new Fuse(englishSongs, REG_FUSE_OPTIONS);
  const chineseFuse = new Fuse(chineseSongs, REG_FUSE_OPTIONS);
  const tamilFuse = new Fuse(tamilSongs, REG_FUSE_OPTIONS);
  const portugueseFuse = new Fuse(portugueseSongs, REG_FUSE_OPTIONS);
  const defaultEnglishSongOptions = englishSongs.map((res) => ({
    label: res.name,
    value: res.name,
    data: res,
  }));
  const defaultChineseSongOptions = chineseSongs.map((res) => ({
    label: res.name,
    value: res.name,
    data: res,
  }));
  const defaultTamilSongOptions = tamilSongs.map((res) => ({
    label: res.name,
    value: res.name,
    data: res,
  }));
  const defaultPortugueseSongOptions = tamilSongs.map((res) => ({
    label: res.name,
    value: res.name,
    data: res,
  }));

  let helperText: string;
  let defaultSecondLanguageSongOptions: any[] = [];
  switch (songType) {
    case SongType.english:
      helperText = "Search by title, book (shortcut or full name), page number. Try `Songs of love 1 16`"
      break;
    case SongType.tamil:
      helperText = "Search by title, book (shortcut or full name), page number. Try `8`"
      defaultSecondLanguageSongOptions = defaultTamilSongOptions;
      break;
    case SongType.portuguese:
      defaultSecondLanguageSongOptions = defaultPortugueseSongOptions;
      helperText = "Search by title, book (shortcut or full name), page number. Try `de amor 1`"
      break;
    case SongType.chinese:
    default:
      helperText = "Search by title, book (shortcut or full name), page number. Try `h2 5` `在十架` or `h13` etc."
      defaultSecondLanguageSongOptions = defaultChineseSongOptions;
  }

  const promiseOptions = (inputValue: string): any => {
    let results;
    switch (songType) {
      case (SongType.english):
        results = englishFuse.search(inputValue);
        break;
      case (SongType.chinese):
        results = chineseFuse.search(inputValue);
        break;
      case (SongType.tamil):
        results = tamilFuse.search(inputValue);
        break;
      case (SongType.portuguese):
        results = portugueseFuse.search(inputValue);
        break;
    }
    // limit # of results to 50 for faster ui
    results = results.slice(0, Math.min(results.length, 50));

    // regular search
    return new Promise((resolve) => {
      resolve(
        results.map((res) => ({
          label: res.item.name,
          value: res.item.name,
          data: res.item,
        }))
      );
    });
  };

  return (
    <div className="mt-2">
      <SongSearchSelect
        promiseOptions={promiseOptions}
        onChange={changeVal}
        handleMenuOpen={handleMenuOpen}
        handleMenuClose={handleMenuClose}
        defaultEnglishSongOptions={defaultEnglishSongOptions}
        defaultSecondLanguageSongOptions={defaultSecondLanguageSongOptions}
      />
      <p className="text-light-gray text-[12px] max-w-[90%]">
        {helperText}
      </p>
    </div>
  );
};

export default SearchBar;

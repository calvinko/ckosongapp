import React, { useState } from "react";
import { useEffect } from "react";
import { getSongType, SongType } from "./constants";

/**
 * Hook that listens to clicks outside of the passed ref (the popup). We toggle the popup
 */
export const useOutsideAlerter = (
  ref: React.MutableRefObject<any>,
  popupOn: boolean,
  togglePopup: Function
) => {
  useEffect(() => {
    /**
     * toggle feedback state if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        togglePopup(!popupOn);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, popupOn]);
};


export const EMBED_SHEET_OPTION_KEY = "embed-sheet";

export const EmbedSongSheetContext = React.createContext({
  embed: true,
  setEmbed: (embed) => { }
});

export const EmbedSongSheetConsumer = EmbedSongSheetContext.Consumer


/**
 * Local storage key for song type
 */
export const SONG_TYPE_OPTION_KEY = "song-type";

export const SongTypeContext = React.createContext({ songType: SongType.english, setSongType: (setSong) => { } });

export const SongTypeConsumer = SongTypeContext.Consumer;
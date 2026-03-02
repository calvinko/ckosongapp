
import { createContext, useReducer, useRef, RefObject, useContext, useState, SetStateAction, Dispatch, useEffect } from 'react';

export const AudioPlayerContext = createContext<AudioPlayerContextType>(null);

/**
 * Local storage key for allow piano
 */
const AUDIO_ALLOW_PIANO_OPTION_KEY = "audio-allow-piano";

/**
 * Provider for AudioPlayerContext
 */
export const AudioPlayerProvider = ({ children }): JSX.Element => {

    const audioRef = useRef<HTMLAudioElement>(null);
    const progressBarRef = useRef<HTMLInputElement>(null);
    const [timeProgress, setTimeProgress] = useState(0);
    const [allowPiano, setAllowPianoState] = useState(false);
    const [onlySongsWithAudio, setOnlySongsWithAudio] = useState(true);
    const [showPlayerUI, setShowPlayerUI] = useState(false);

    const setAllowPiano = (allowVal: boolean) => {
        localStorage.setItem(AUDIO_ALLOW_PIANO_OPTION_KEY, allowVal.toString());
        setAllowPianoState(allowVal)
    }

    // to get local storage details
    useEffect(() => {
        // default to -1 if it is not available
        const localStorageAllowPiano =
            localStorage.getItem(AUDIO_ALLOW_PIANO_OPTION_KEY) ?? "false";
        setAllowPianoState(localStorageAllowPiano === "true");
    });

    return (
        <AudioPlayerContext.Provider value={
            { audioRef, progressBarRef, timeProgress, setTimeProgress, allowPiano, setAllowPiano, onlySongsWithAudio, setOnlySongsWithAudio, showPlayerUI, setShowPlayerUI }
        }>
            {children}
        </AudioPlayerContext.Provider>
    );
}

/**
 * Type for AudioPlayerContext
 */
interface AudioPlayerContextType {
    audioRef: RefObject<HTMLAudioElement>;
    progressBarRef: RefObject<HTMLInputElement>;
    timeProgress: number;
    setTimeProgress: Dispatch<SetStateAction<number>>;
    allowPiano: boolean;
    setAllowPiano: Dispatch<SetStateAction<boolean>>;
    onlySongsWithAudio: boolean;
    setOnlySongsWithAudio: Dispatch<SetStateAction<boolean>>;
    showPlayerUI: boolean
    setShowPlayerUI: Dispatch<SetStateAction<boolean>>;
}

/**
 * Hook to get AudioPlayerContext. Ensure provider was injected in the same component or parent component
 */
export const useAudioPlayerCtx = (): AudioPlayerContextType => {
    const context = useContext(AudioPlayerContext);

    if (context === undefined) {
        throw new Error(
            'useAudioPlayerCtx must be used within an AudioPlayerProvider'
        );
    }

    return context;
};
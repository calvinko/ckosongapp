import React from 'react';
import { twMerge } from 'tailwind-merge';
import { useAudioPlayerCtx } from '../../lib/audio-player/AudioPlayerContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../lib/redux/store';

const ProgressBar = ({ className, ...props }) => {
    const dispatch = useDispatch();
    const { audioRef, progressBarRef, timeProgress, setTimeProgress } = useAudioPlayerCtx();
    const duration: number = useSelector((state: RootState) => state?.audioPlayer.songDuration);

    const handleProgressChange = () => {
        if (audioRef.current && progressBarRef.current) {
            const newTime = Number(progressBarRef.current.value);
            audioRef.current.currentTime = newTime;

            setTimeProgress(newTime)

            // if progress bar changes while audio is on pause
            progressBarRef.current.style.setProperty(
                '--range-progress',
                `${(newTime / duration) * 100}%`
            );
        }
    };

    const formatTime = (time: number | undefined): string => {
        if (typeof time === 'number' && !isNaN(time)) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);

            // Convert to string and pad with leading zeros if necessary
            const formatMinutes = minutes.toString().padStart(1, '0');
            const formatSeconds = seconds.toString().padStart(2, '0');

            return `${formatMinutes}:${formatSeconds}`;
        }
        return '0:00';
    };

    return (
        <div {...props} className={twMerge("flex flex-col items-center justify-center w-full", className)}>
            <div className='w-full flex justify-center items-center'>
                <input
                    ref={progressBarRef}
                    className="bg-gray-300"
                    type="range"
                    defaultValue={0}
                    onChange={handleProgressChange}
                />
            </div>
            <div className='flex flex-row justify-between w-full text-xs font-normal text-[#999] pt-1'>
                <div>
                    <span>{formatTime(timeProgress)}</span>
                </div>
                <div>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div >
    );
};

export default ProgressBar;
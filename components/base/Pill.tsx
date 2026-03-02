import React from 'react';
import { twMerge } from 'tailwind-merge';

const ACTIVE_STYLE = `bg-[#3F7DC1] text-white`;
const INACTIVE_STYLE = `border border-gray-200 text-gray-500 hover:bg-slate-300/50`;

interface PillProps {
    onClick: () => void;
    children: React.ReactNode;
    isActive?: boolean;
    className?: string;
}

const Pill = ({ onClick, children, isActive = false, className = '' }: PillProps) => {
    return (
        <button
            onClick={onClick}
            className={twMerge(`px-2 py-1 rounded-md text-[12px] ${isActive ? ACTIVE_STYLE : INACTIVE_STYLE}`, className)}
        >
            {children}
        </button>
    );
};


export default Pill;

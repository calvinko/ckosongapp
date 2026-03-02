// @ts-nocheck
import React from "react";
import { useState } from "react";

import ArrowDown from "../assets/arrow-down.svg";
import ArrowRight from "../assets/arrow-right.svg";
/**
 * Details that opens up after a click
 */
const ToggleDetails = ({
    toggleText,
    textStyle,
    iconStyle,
    children,
    className
}: {
    toggleText: JSX.Element | JSX.Element[] | string;
    textStyle?: React.CSSProperties;
    iconStyle?: React.CSSProperties;
    style?: React.CSSProperties;
    children: JSX.Element;
    className: string;
}): JSX.Element => {
    const [detailsOpened, toggleDetails] = useState(false);

    // toggles more details
    const openDetails = (e) => {
        toggleDetails(!detailsOpened);
    };

    return (
        <div>
            <div
                className={`items-center cursor-pointer flex ${className}`}
                onClick={openDetails}
            >
                <img
                    src={detailsOpened ? ArrowDown : ArrowRight}
                    height="8px"
                    className="detail-icon"
                    style={{ ...iconStyle }}
                    alt="Click to toggle details"
                />
                <p className="detail-text" style={{ ...textStyle }}>
                    {toggleText}
                </p>
            </div>
            {detailsOpened && children}
        </div>
    );
};

export default ToggleDetails;

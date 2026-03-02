import React from "react";

const ArrowDownIcon = (props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className="triangle"
            fill="#8B9199"
            style={{
                backfaceVisibility: "hidden",
                transition: "transform 200ms ease-out 0s",
                transform: "rotateZ(180deg)",
                opacity: 1
            }}
            {...props}
        >
            <polygon points="5.9,88.2 50,11.8 94.1,88.2 " />
        </svg>

    )
}

export default ArrowDownIcon;
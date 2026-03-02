import React, { useRef } from "react";
import { useOutsideAlerter } from "../../lib/uiUtils";

/**
 * Base Popup component
 */
const Popup = ({
  popUpOn,
  togglePopup,
  btnPos,
  width,
  children,
}: {
  popUpOn: boolean; // whether pop up is on or off
  togglePopup: Function; // toggle pop up on and off in parent component
  btnPos: any; // button position to place pop up
  width: string; // width of the pop up (default 180px)
  children?:
    | (JSX.Element | HTMLElement | string | number)[]
    | JSX.Element
    | string
    | (string | Element)[];
}) => {
  // ref to settings popup
  const popupRef = useRef(null);
  useOutsideAlerter(popupRef, popUpOn, togglePopup);

  return (
    <div className="popup-box" ref={popupRef}>
      {children}
      <style jsx>{`
        .popup-box {
          transition: all 0.2s ease-in-out, border-radius 0.2s step-start,
            border 0.2s ease-in-out;
          width: ${width ?? "180px"};
          border-radius: 6px;
          position: absolute;
          z-index: 100;

          // to place over the button but to the left
          left: ${btnPos && Math.floor(btnPos.right) - 178}px;
          top: ${btnPos && Math.floor(btnPos.top)}px;

          background: #fff;
          padding: 8px;
          box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
        }

        .line {
          border: 1px solid #d1d5da;
          border-bottom: 0px;
        }
      `}</style>
    </div>
  );
};

export default Popup;

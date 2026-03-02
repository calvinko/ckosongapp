import React from "react";

const ACTIVE_COLOR = "#3F7DC1";
const INACTIVE_COLOR = "text-zinc-400";
const WHITE = "text-white";

/**
 * Button to toggle between two options
 *
 * @param name1           name for option 1 (used to determine that option 1 is active)
 * @param option1         display value for option 1
 * @param name2           same as name 1 but for option2
 * @param option2         display value for option2
 * @param active          name1 or name2 depending on which one is active
 * @param toggleActive    method that recieves of the name props as an argument and toggles the active
 * @returns
 */
const MinToggleButton = ({
  name1,
  option1,
  name2,
  option2,
  active,
  toggleActive,
  className,
}: {
  name1: string;
  option1: string;
  name2: string;
  option2: string;
  active: any;
  toggleActive: any; // void single argument method
  className?: string;
}) => {
  return (
    <div className={`toggle-btn ${className ? className : ""}`}>
      <div
        className={`toggle-left-btn ${active === name1 ? "active" : "inactive"}`}
        onClick={() => toggleActive(name1)}
      >
        <p
          className={`${active === name1 ? WHITE : INACTIVE_COLOR} text-xs py-1 px-2`}
        >
          {option1}
        </p>
      </div>
      <div
        className={`toggle-right-btn ${active === name2 ? "active" : "inactive"}`}
        onClick={() => toggleActive(name2)}
      >
        <p className={`${active === name2 ? WHITE : INACTIVE_COLOR} text-xs py-1 px-2`}>
          {option2}
        </p>
      </div>
    </div >
  );
};

export default MinToggleButton;

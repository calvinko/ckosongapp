import React from "react";

import { Text } from "./base";

const ACTIVE_COLOR = "#3F7DC1";
const INACTIVE_COLOR = "#B3B3B3";
const WHITE = "#FFFFFF";

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
const ToggleButton = ({
  name1,
  option1,
  name2,
  option2,
  active,
  toggleActive,
  className,
  fitContent,
}: {
  name1: string;
  option1: string;
  name2: string;
  option2: string;
  active: any;
  toggleActive: any; // void single argument method
  className?: string;
  fitContent?: boolean;
}) => {
  return (
    <div className={`toggle-btn ${className ? className : ""}`}>
      <div
        className={`toggle-left-btn ${active === name1 ? "active" : "inactive"
          }`}
        onClick={() => toggleActive(name1)}
      >
        <Text
          as="p"
          fontSize="12px"
          color={active === name1 ? WHITE : INACTIVE_COLOR}
        >
          {option1}
        </Text>
      </div>
      <div
        className={`toggle-right-btn ${active === name2 ? "active" : "inactive"
          }`}
        onClick={() => toggleActive(name2)}
      >
        <Text
          as="p"
          fontSize="12px"
          color={active === name2 ? WHITE : INACTIVE_COLOR}
        >
          {option2}
        </Text>
      </div>
      <style jsx>{`
        .toggle-btn {
          display: flex;
          cursor: pointer;
          flex-direction: row;
          border: none;
          border-radius: 6px;
          flex: 1;
          ${fitContent ? "max-width: fit-content" : ""};
        }

        .active {
          border: 1px solid ${ACTIVE_COLOR};
          background-color: ${ACTIVE_COLOR};
        }

        .inactive {
          border: 1px solid ${INACTIVE_COLOR};
        }

        .toggle-left-btn {
          flex: 1;
          border-right: none;
          border-bottom-left-radius: 6px;
          border-top-left-radius: 6px;
          text-align: center;
          padding: 0 8px;
        }

        .toggle-right-btn {
          flex: 1;
          border-left: none;
          border-bottom-right-radius: 6px;
          border-top-right-radius: 6px;
          text-align: center;
          padding: 0 8px;
        }
      `}</style>
    </div>
  );
};

export default ToggleButton;

import React from "react";
import { twMerge } from 'tailwind-merge'

/**
 * Base Button
 */
const Button = ({
  onClick,
  children,
  className,
  style,
  type = "medium",
  outline = false,
  disabled = false,
  shadow = true
}: {
  onClick: (e) => void;    // on click method
  children?: JSX.Element | JSX.Element[] | string | null, // children for button
  className?: string | null;  // class names, these will override the classname styles
  style?: React.CSSProperties | null; // styles to override
  outline?: boolean; // outline button
  disabled?: boolean; // disabled button
  shadow?: boolean;  // shadow on hover
  type?: "small" | "medium" | "large"; // size of button
}) => {

  let paddingClasses = "px-4 py-2";
  let fontClasses = "text-sm font-medium";
  let borderClasses = "rounded-md"
  if (type == "small") {
    paddingClasses = "py-1 px-2";
    fontClasses = "text-xs font-normal";
    borderClasses = "rounded"
  }

  // only have hover, when hover is specifically `true`
  let actualShadow = shadow ? shadow : !outline;

  // generate base class names
  // if there are custom class names, they will be added *after*, hence overriding the base class names
  let classNamesList = [
    "inline-flex justify-center",
    borderClasses,
    actualShadow ? "hover:shadow-md hover:drop-shadow-md" : "",
    paddingClasses,
    fontClasses,
    outline ? "border-[#eaeaea] text-[#999] bg-white border border-solid hover:border-[#888]" : "text-white bg-green-700",
    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
  ]

  const finalClassNames = twMerge(classNamesList.join(' '), className ?? "")

  // TODO support other sizes of buttons

  return (
    <button
      type="button"
      className={finalClassNames}
      style={style ?? {}}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>

  )
}

export default Button;
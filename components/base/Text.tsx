import React from "react";

/**
 * Text component with easy to use props
 *
 * @returns Text object
 */
const Text = ({
  as = "p",
  className,
  fontSize = "14px",
  fontWeight = "400",
  letterSpacing = "0.3px",
  lineHeight = "24px",
  color = "#0A162A",
  onClick = null,
  children,
  ...otherParams
}: {
  as?: string;
  className?: string;
  fontSize?: string;
  fontWeight?: string | number;
  letterSpacing?: string;
  lineHeight?: string;
  color?: string;
  onClick?: () => void;
  children?:
  | (JSX.Element | HTMLElement | string | number | Element | null | undefined)[]
  | string[]
  | JSX.Element
  | string
  | null
  | undefined;
}): JSX.Element => {
  return (
    <>
      {as == "span" ? (
        <span
          className={`text-comp ${className ? className : ""}`}
          onClick={() => { onClick != null ? onClick() : null; }}
        >
          {children}
        </span>
      ) : (
        <p
          className={`text-comp ${className ? className : ""}`}
          onClick={() => { onClick != null ? onClick() : null; }}
          {...otherParams}
        >{children}
        </p>
      )}
      <style jsx>
        {`
          .text-comp {
            font-family: HKGrotesk;
            font-size: ${fontSize};
            font-weight: ${fontWeight};
            letter-spacing: ${letterSpacing};
            line-height: ${lineHeight};
            color: ${color};
          }
        `}
      </style>
    </>
  );
};

export default Text;

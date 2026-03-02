import React from "react";

const REGULAR_FONT_WEIGHT = 400;
const CHIVO = "Chivo";

const letterSpacings = {
  zero: "0",
  third: "0.3px",
  half: "0.5px",
  one: "1px",
  two: "2px",
  negFifteen: "-0.15px",
};

/**
 * Heading styles per heading type
 */
const HEADING_STYLES = {
  h1: {
    fontFamily: CHIVO,
    fontWeight: REGULAR_FONT_WEIGHT,
    fontSize: "60px",
    letterSpacing: letterSpacings.third, // 0.3px
    lineHeight: "88px",
  },
  h2: {
    fontFamily: CHIVO,
    fontWeight: REGULAR_FONT_WEIGHT,
    fontSize: "44px",
    letterSpacing: letterSpacings.half, // 0.5px
    lineHeight: "64px",
  },
  h3: {
    fontFamily: CHIVO,
    fontWeight: REGULAR_FONT_WEIGHT,
    fontSize: "32px",
    letterSpacing: letterSpacings.zero, // 0
    lineHeight: "48px",
  },
  h4: {
    fontFamily: CHIVO,
    fontWeight: REGULAR_FONT_WEIGHT,
    fontSize: "24px",
    letterSpacing: letterSpacings.negFifteen, // -0.15
    lineHeight: "36px",
  },
};

/**
 * Heading component with easy to use props
 *
 * @returns Heading object
 */
const Heading = ({
  as = "h2",
  type = "h2",
  className,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  color = "#0A162A",
  children,
}: {
  as?: string;
  type?: string;
  className?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  letterSpacing?: string;
  lineHeight?: string;
  color?: string;
  children?:
  | (JSX.Element | HTMLElement | string | number | boolean)[]
  | string[]
  | JSX.Element
  | string | null
  | (string | Element)[]
  | null
  | undefined
  | boolean;
}): JSX.Element => {
  // default h2
  const headingStyle = HEADING_STYLES[type] ?? HEADING_STYLES["h2"];

  // we do this if else within the jsx in order for style jsx to work
  return (
    <>
      {as === "h1" ? (
        <h1 className={`header-comp ${className ?? ""}`}>{children}</h1>
      ) : as === "h3" ? (
        <h3 className={`header-comp ${className ?? ""}`}>{children}</h3>
      ) : as === "h4" ? (
        <h4 className={`header-comp ${className ?? ""}`}>{children}</h4>
      ) : as === "span" ? (
        <span className={`header-comp ${className ?? ""}`}>{children}</span>
      ) : as === "p" ? (
        <p className={`header-comp ${className ?? ""}`}>{children}</p>
      ) : (
        <h2 className={`header-comp ${className ?? ""}`}>{children}</h2>
      )}
      <style jsx>
        {`
          .header-comp {
            font-family: ${fontFamily ? fontFamily : headingStyle.fontFamily};
            font-size: ${fontSize ? fontSize : headingStyle.fontSize};
            font-weight: ${fontWeight ? fontWeight : headingStyle.fontWeight};
            letter-spacing: ${letterSpacing
            ? letterSpacing
            : headingStyle.letterSpacing};
            line-height: ${lineHeight ? lineHeight : headingStyle.lineHeight};
            color: ${color};
          }
        `}
      </style>
    </>
  );
};

export default Heading;

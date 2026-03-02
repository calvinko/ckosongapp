import React from "react";
import { default as NextLink } from "next/link"

interface LinkProps extends React.LinkHTMLAttributes<HTMLLinkElement> {
  as?: string;
  href?: string;
  className?: string;
  fontSize?: string;
  fontWeight?: string | number;
  lineHeight?: string;
  letterSpacing?: string;
  color?: string;
  hoverColor?: string;
  underline?: boolean;
  children?:
  | (JSX.Element | HTMLElement | string | number | undefined)[]
  | JSX.Element
  | string
  | (string | Element)[];
}

/**
 * Link component with easy to use props
 *
 * @returns Link object
 */
const Link: React.FC<LinkProps> = ({
  as = "a",
  className,
  href = "#",
  fontSize = "inherit",
  fontWeight = "inherit",
  letterSpacing = "inherit",
  lineHeight = "inherit",
  color = "#155DA1",
  hoverColor = "#0E4E8A",
  underline = false,
  children,
  ...props
}): JSX.Element => {
  return (
    <>
      <NextLink
        href={href}
        passHref
        legacyBehavior
        shallow={true}
      >
        <a className={`anchor-comp ${className ? className : ""}`} {...props}>{children}</a>
      </NextLink>
      <style jsx>
        {`
          .anchor-comp {
            font-family: HKGrotesk;
            font-size: ${fontSize};
            font-weight: ${fontWeight};
            letter-spacing: ${letterSpacing};
            line-height: ${lineHeight};
            color: ${color};
            text-decoration: ${underline ? "underline" : "none"};
          }

          .anchor-comp:hover {
            text-decoration: underline;
            color: ${hoverColor};
          }

          .anchor-comp:active {
            text-decoration: underline;
            color: ${hoverColor};
          }
        `}
      </style>
    </>
  );
};

export default Link;

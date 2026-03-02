import { MouseEventHandler } from "react";

/**
 * A Tag
 *
 * @see HymnTag, which is dependent on this
 *
 * @param children      Children to render
 * @param color         color of the tag background
 * @param textColor     Color of the tag text
 * @param onClick       onClick handler
 */
export const Tag = ({
  children,
  color,
  textColor,
  onClick,
  className,
  style,
  ...props
}: {
  children: JSX.Element | JSX.Element[];
  color: string;
  textColor?: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
}): JSX.Element => {
  return (
    <div
      className={`tag ${className}`}
      onClick={onClick}
      style={style}
      {...props}
    >
      {children}
      <style jsx>{`
        .tag {
          font-family: HkGrotesk;
          font-size: 12px;
          line-height: 0;
          white-space: nowrap;

          color: ${textColor || "#fff"};
          border-radius: 10px;
          display: inline-flex;
          vertical-align: middle;
          align-items: center;
          padding: 0px 8px;
          height: 28px;
          background: ${color};

          cursor: ${onClick ? "pointer" : "default"};
        }
        .tag:hover {
          opacity: ${onClick ? ".85" : "1"};
        }
      `}</style>
    </div>
  );
};

export default Tag;

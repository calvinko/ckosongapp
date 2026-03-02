const useKeyOnly = (val, key) => val && key;

/**
 * Follows Semantic UI Placeholders. We only use the Placeholder element from Semantic UI so we just copied this over
 * instead of including the entire bundle.
 *
 * We also copied the placeholder.min.css for the css classes (/assets/css/placeholder.min.css)
 *
 * https://github.com/Semantic-Org/Semantic-UI-React/blob/master/src/elements/Placeholder/Placeholder.js
 *
 * Props:
 * - fluid: A fluid placeholder takes up the width of its container.
 * - inverted: A placeholder can have their colors inverted.
 */
const Placeholder = (props) => {
  const { children, className, fluid, inverted } = props;

  return (
    <div
      className={`ui placeholder ${useKeyOnly(fluid, "fluid")} ${useKeyOnly(
        inverted,
        "inverted"
      )} ${className ?? ""}`}
    >
      {children}
    </div>
  );
};

const PlaceholderHeader = (props) => {
  const { children, className, image } = props;
  return (
    <div className={`header ${useKeyOnly(image, "image")} ${className ?? ""}`}>
      {children}
    </div>
  );
};

/**
 * Placeholder Image
 *
 * Props:
 * - square: An image can modify size correctly with responsive styles.
 * - rectangular: An image can modify size correctly with responsive styles.
 */
const PlaceholderImage = (props) => {
  const { className, square, rectangular } = props;

  return (
    <div
      className={`image ${useKeyOnly(square, "square")} ${useKeyOnly(
        rectangular,
        "rectangular"
      )} ${className ?? ""}`}
    ></div>
  );
};

/**
 * Placeholder line
 *
 * Props:
 * length: ['full', 'very long', 'long', 'medium', 'short', 'very short']
 */
const PlaceholderLine = (props) => {
  const { className, length } = props;
  return <div className={`line ${length ?? ""} ${className ?? ""}`} />;
};

const PlaceholderParagraph = (props) => {
  const { children, className } = props;
  return <div className={`paragraph ${className ?? ""}`}>{children}</div>;
};

Placeholder.Header = PlaceholderHeader;
Placeholder.Image = PlaceholderImage;
Placeholder.Line = PlaceholderLine;
Placeholder.Paragraph = PlaceholderParagraph;

export default Placeholder;

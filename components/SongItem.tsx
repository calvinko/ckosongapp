import SongMeta from "../ts/types/songMeta.interface";

/**
 * A song item in a list of songs
 */
export const SongItem = ({
  song,
  handleClick,
  children,
  hasHover = true,
}: {
  song: SongMeta;
  handleClick: Function;
  children: JSX.Element | JSX.Element[];
  hasHover?: boolean;
}) => {
  return (
    <>
      <div className="song-item" onClick={(e) => handleClick(e, song)}>
        {children}
      </div>
      <style jsx>
        {`
          .song-item {
            width: 100%;
            padding: 8px 0;
            border-bottom: 1px solid #eaeaea;
            cursor: pointer;
          }
          .song-item:hover {
            background: ${hasHover && "#b4d8fa"};
            border-radius: 4px;
          }
        `}
      </style>
    </>
  );
};

export default SongItem;

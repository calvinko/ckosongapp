const tamilSongs = require("./lib/song-list/tamilSongList.json");

const generateTamilEnglishMapping = () => {
  const mapping = [];

  tamilSongs.songs.forEach((tamilSong) => {
    if (tamilSong.englishMapping && tamilSong.englishMapping.length > 0) {
      tamilSong.englishMapping.forEach((englishKey) => {
        mapping.push({
          englishKey: englishKey,
          tamilKey: tamilSong.slug
        });
      });
    }
  });

  return mapping;
};

console.log(JSON.stringify(generateTamilEnglishMapping(), null, 2));

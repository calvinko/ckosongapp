import pickBy from "lodash/pickBy";
import path from "path";
import HymnBookMeta from "../../ts/types/hymnBookMeta.interface";
import { MelodyCluster } from "../../ts/types/melodyCluster.interface";
import SongMeta, { FullMeta } from "../../ts/types/songMeta.interface";
import chineseSongs from "../chineseSongList.json";
import { SongType } from "../constants";
import mappingIndex from "../mappingIndex.json";
import melodyClusters from "../melodyClusters.json";
import readFile from "../readFile";
import englishSongs from "../songList.json";
import tamilSongs from "../song-list/tamilSongList.json";
import portugueseSongs from "../song-list/portugueseSongList.json";
import getSongSlug from "./getSongSlug";

const SONG_LIST_URL =
  "https://yted5wtsb0.execute-api.us-east-1.amazonaws.com/dev/googlesheet/1DSDm5bC-BXStA15HJIQqsGKEDZdS9gJ-tyZgIfPYdz4/Sheet1";

/**
 * Special Type to define whether you want a SongType or ALL
 */
type SongTypeAndAll = SongType.english | SongType.chinese | SongType.tamil | SongType.portuguese | "ALL";

const DUAL_MAPPING_INDEX = mappingIndex.reduce((obj, v) => {
  obj[v.englishKey] = v.englishKey in obj ? [...obj[v.englishKey], v.chineseKey] : [v.chineseKey];
  obj[v.chineseKey] = v.chineseKey in obj ? [...obj[v.chineseKey], v.englishKey] : [v.englishKey];
  return obj;
}, {});

const MULTI_LANGUAGE_MAPPING = mappingIndex.reduce((obj, mappingEntry) => {
  const keyValues = Object.values(mappingEntry);

  // For each key in this mapping entry
  keyValues.forEach((key) => {
    // Get all OTHER keys from the same entry
    const relatedValues = keyValues.filter(v => v !== key);
    // Add them to the mapping
    obj[key] = [...(obj[key] || []), ...relatedValues];
  });

  return obj;
}, {});

/**
 * Fetch list of songs and the metadata with it
 *
 * @param songType  Song types you want to fetch
 */
export const fetchSongs = async (
  songType?: SongTypeAndAll
): Promise<FullMeta> => {
  const type: SongTypeAndAll = songType ?? "ALL";

  // const englishSongs = await readJSON("lib/songList.json");
  const processedEnglish = processSongList(englishSongs);

  // const chineseSongs = await readJSON("lib/chineseSongList.json");
  const processedChinese = processChineseSongList(chineseSongs);

  const processedTamil = processSongList(tamilSongs, SongType.tamil);

  const processedPortuguese = processSongList(portugueseSongs, SongType.portuguese);

  const combinedSongs = {
    ...processedEnglish,
    ...processedChinese,
    ...processedTamil,
    ...processedPortuguese
  };

  const englishBookMeta: HymnBookMeta[] = englishSongs?.hymnBooks.map(
    (book) => ({
      ...book,
      songType: SongType.english,
    })
  );

  const chineseBookMeta: HymnBookMeta[] = chineseSongs?.hymnBooks.map(
    (book) => ({
      ...book,
      songType: SongType.chinese,
    })
  );

  const tamilBookMeta: HymnBookMeta[] = tamilSongs?.hymnBooks.map(
    (book) => ({
      ...book,
      songType: SongType.tamil,
    })
  );

  const portugueseBookMeta: HymnBookMeta[] = portugueseSongs?.hymnBooks.map(
    (book) => ({
      ...book,
      songType: SongType.portuguese,
    })
  );

  injectReferenceData(combinedSongs);
  injectMelodyClusters(combinedSongs);

  if (type === SongType.english) {
    return toReturnFullMeta(
      pickBy(combinedSongs, (song) => song.songType === SongType.english),
      englishBookMeta
    );
  } else if (type === SongType.chinese) {
    return toReturnFullMeta(
      pickBy(combinedSongs, (song) => song.songType === SongType.chinese),
      chineseBookMeta
    );
  } else if (type === SongType.tamil) {
    return toReturnFullMeta(
      pickBy(combinedSongs, (song) => song.songType === SongType.tamil),
      tamilBookMeta
    );
  } else if (type === SongType.portuguese) {
    return toReturnFullMeta(
      pickBy(combinedSongs, (song) => song.songType === SongType.portuguese),
      portugueseBookMeta
    );
  }

  return toReturnFullMeta(combinedSongs, [...englishBookMeta, ...chineseBookMeta, ...tamilBookMeta, ...portugueseBookMeta]);
};

const readJSON = async (pathStr: string): Promise<any[]> => {
  const songListPath = path.join(process.cwd(), pathStr);
  const songListRaw = await readFile(songListPath);
  const songs: any[] = JSON.parse(songListRaw);
  return songs;
};

/**
 * Process original list of songs from vancouver (includes primary english translated songs)
 *
 * @param songs list of songs
 */
const processSongList = (
  fullMeta: {
    songs: any[];
    hymnBooks: any[];
  },
  songType: SongType = SongType.english
): { [key: string]: SongMeta } => {
  let songsBySlug: { [key: string]: SongMeta } = {};
  fullMeta?.songs.sort((a, b) => a.page_number - b.page_number);

  const hymnBooksByName = {};
  fullMeta?.hymnBooks.forEach(
    (book) => {
      // default to true if not defined
      if (book.isSearchable == undefined) {
        book.isSearchable = true
      }
      if (book.onlySongSheet == undefined) {
        book.onlySongSheet = false;
      }
      hymnBooksByName[book.hymnBook] = book
    }
  );

  fullMeta?.songs
    // remove songs from GFH and VanMusicTeam
    .filter((song) => song.hymn != "GFH" && song.hymn != "VanMusicTeam")
    .forEach((song) => {
      songsBySlug[getSongSlug(song.hymn, song.page_number)] = {
        hymn: song.hymn,
        pageNumber: song.page_number,
        name: song.name,
        dataUrl: song.abcnotation,
        songType: songType,
        slug: getSongSlug(song.hymn, song.page_number),
        markdownUrl: song.md,
        imageUrl: song.image,
        mp3: song.mp3,
        startKey: song.start_key,
        key: song.key,
        reference:
          MULTI_LANGUAGE_MAPPING[getSongSlug(song.hymn, song.page_number)] ?? null,
        instrumentalMp3: song?.instrumentalMp3 ?? null,
        pianoMp3: song?.pianoMp3 ?? null,
        hasOwnSheetPdf: hymnBooksByName[song.hymn]?.hasOwnSheetPdf ?? false,
        metaToDisplay: song?.metaToDisplay ?? [],
        tags: song?.tags ?? [],
        translatedBy: song?.translatedBy ?? null,
        lyricsBy: song?.lyricsBy ?? null,
        musicBy: song?.musicBy ?? null,
      };
    });
  // remove song because no lyrics and it shows up first
  delete songsBySlug["VanMusicTeam_1"];
  return songsBySlug;
};

/**
 * Process list of chinese songs from Dad (kosolution.net mysql db)
 *
 * @param songs List of songs in processed db format (chineseSongList.json)
 */
const processChineseSongList = (fullMeta: { songs: any[]; hymnBooks: any[]; }): { [key: string]: SongMeta } => {
  let songsBySlug: { [key: string]: SongMeta } = {};
  fullMeta?.songs.sort((a, b) => a.slug - b.slug);

  const hymnBooksByName = {};
  fullMeta?.hymnBooks.forEach(
    (book) => {
      // default to true if not defined
      if (book.isSearchable == undefined) {
        book.isSearchable = true
      }
      hymnBooksByName[book.hymnBook] = book
    }
  );

  fullMeta?.songs.forEach((song) => {
    songsBySlug[song.slug] = {
      hymn: song.hymn,
      pageNumber: song.page_number,
      name: song.name,
      songType: SongType.chinese,
      slug: song.slug, // already added slug (see scripts/chinese_songs/process_db.py)
      reference: MULTI_LANGUAGE_MAPPING[song.slug] ?? null,
      startKey: song.start_key,
      key: song.key,
      mp3: song?.mp3 ?? null,
      hasOwnSheetPdf: hymnBooksByName[song.hymn]?.hasOwnSheetPdf ?? false,
      instrumentalMp3: song?.instrumentalMp3 ?? null,
      pianoMp3: song?.pianoMp3 ?? null,
      metaToDisplay: song?.metaToDisplay ?? [],
      tags: song?.tags ?? [],
      translatedBy: song?.translatedBy ?? null,
      lyricsBy: song?.lyricsBy ?? null,
      musicBy: song?.musicBy ?? null,
    };
  });
  return songsBySlug;
};

/**
 * Add in reference data (mapping from chinese <=> english)
 *
 * @param songsBySlug
 */
const injectReferenceData = (songsBySlug: { [key: string]: SongMeta }) => {
  Object.values(songsBySlug)
    .filter((song) => song?.reference)
    .forEach((song) => {
      song.referenceSongs = song?.reference.map(ref => {
        const referenceSong: SongMeta = songsBySlug[ref];
        return {
          name: referenceSong?.name,
          hymn: referenceSong?.hymn,
          pageNumber: referenceSong?.pageNumber,
          songType: referenceSong?.songType,
          slug: referenceSong?.slug
        };
      }) ?? [];
    });
};

const injectMelodyClusters = (songsBySlug: { [key: string]: SongMeta }) => {
  const clustersByBaseSlug: { [key: string]: MelodyCluster } = {};
  melodyClusters.forEach((cluster) => {
    const baseSlug = cluster?.cluster?.baseSong;
    clustersByBaseSlug[baseSlug] = cluster;
  });

  Object.entries(clustersByBaseSlug).forEach(([baseSlug, cluster]) => {
    const baseSong = songsBySlug[baseSlug];
    if (!baseSong) {
      console.log(`No base song found for ${baseSlug}`);
      return;
    }
    cluster?.songs?.forEach(clusterSong => {
      const songRef = songsBySlug[clusterSong?.slug];
      if (!songRef) {
        console.log(`No song found for ${songRef}`);
        return;
      }
      songRef.melodyCluster = {
        baseSong: baseSlug,
        node: clusterSong
      };
    });
  })
}

/**
 * Converting the list of songs to the supposed Return value
 *
 * @param songsBySlug   dictionary of songs (slug => song)
 * @param bookMeta      (book meta list - currently only for english hymn books)
 * @returns             FullMeta
 */
const toReturnFullMeta = (
  songsBySlug: { [key: string]: SongMeta },
  bookMeta: HymnBookMeta[]
): FullMeta => {
  const books: { [key: string]: HymnBookMeta } = {};
  bookMeta.forEach((book) => {
    books[book.hymnBook] = book;
  });

  const clustersByBaseSlug: { [key: string]: MelodyCluster } = {};
  melodyClusters.forEach((cluster) => {
    const baseSlug = cluster?.cluster?.baseSong;
    clustersByBaseSlug[baseSlug] = cluster;
  });

  return {
    hymnBooks: books,
    songs: songsBySlug,
    melodyClusters: clustersByBaseSlug,
  };
};

export default fetchSongs;

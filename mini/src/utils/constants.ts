import React from 'react'
// for mini song app

export const WHITELIST_COUNTRIES = ["US", "CA", "SG", "IN", "NP", "PH", "MY", "ZA", "BR", "ID", "PL", "CN-TW", "TW", "LK", "ID", "HN", "HK"]

const SECOND_LANGUAGE = process.env.REACT_APP_SECOND_LANGUAGE

/**
 * Hymn Book shortname to actual name
 */
enum HymnBook {
  GBH = "God's Beautiful Heart",
  GFH1 = "Hymnal 1",
  GFH2 = "Hymnal 2",
  SOL1 = "Songs of Love 1",
  SOL2 = "Songs of Love 2",
  SOL3 = "Songs of Love 3",
  SOMH1 = "Songs of my Heart 1",
  SOMH2 = "Songs of my Heart 2",
  GFH = "God's Family Hymnal",
  VanMusicTeam = "Vancouver Music Team",
  MAM = "Make a Melody",
  MAM2 = "Make a Melody 2",
  MAM3 = "Make a Melody 3",
  SOS = "Song of Solomon",
  HC1 = "Hymnal Collection",
  HC2 = "Hymnal Collection 2",

  // chinese hymn books
  S1 = "神家詩歌合訂本 1",
  S2 = "神家詩歌合訂本 2",
  CHC1 = "詩歌選集",
  CHC2 = "詩歌選集 24",
  EL = "愛的迥嚮",
  H1 = "神家詩歌 1",
  H2 = "神家詩歌 2",
  H3 = "神家詩歌 3",
  H4 = "神家詩歌 4",
  H5 = "神家詩歌 5",
  H6 = "神家詩歌 6",
  H7 = "神家詩歌 7",
  H8 = "神家詩歌 8",
  H9 = "神家詩歌 9",
  H10 = "神家詩歌 10",
  H11 = "神家詩歌 11",
  H12 = "神家詩歌 12",
  H13 = "神家詩歌 13",
  H14 = "神家詩歌 14",
  H15 = "神家詩歌 15",
  H16 = "神家詩歌 16",
  H17 = "神家詩歌 17",
  H18 = "神家詩歌 18",
  H19 = "神家詩歌 19",
  H20 = "神家詩歌 20",
  H21 = "神家詩歌 21",
  H22 = "神家詩歌 22",
  H23 = "神家詩歌 23",

  SOSC = "雅歌",
  MAM3C = "向主歌唱",

  TM1 = "Tamil Hymnal 1",

  P1 = "Canções de amor 1",
  P2025 = "Canções de amor (Novas 2025)",
  P2026 = "Canções de amor (Novas 2026)",
  P2 = "Músicas Verdades bíblicas"
}

/**
 * Get the full name of a hymn book, if it exists in the enum
 *
 * @param acronym
 */
export const getHymnBook = (acronym: string): string => {
  if (acronym in HymnBook) {
    // @ts-ignore
    return HymnBook[acronym];
  }
  return "";
};

enum SongType {
  english = "english",
  chinese = "chinese",
  tamil = "tamil",
  portuguese = "portuguese"
}

/**
 * Get the SongType enum given the string value
 *
 * @param songTypeStr string to map to SongType
 * @returns SongType, null if no match
 */
const getSongType = (songTypeStr: string): SongType => {
  if (songTypeStr in SongType) {
    return SongType[songTypeStr as keyof typeof SongType];
  }
  return SongType.english;
};

const getSecondLanguageOptions = (): { secondLanguageName: string, secondLanguageOption: string } => {
  let secondLanguageName;
  let secondLanguageOption;
  switch (SECOND_LANGUAGE) {
    case SongType.tamil:
      secondLanguageName = SongType.tamil.toString();
      secondLanguageOption = "Tamil"
      break;
    case SongType.portuguese:
      secondLanguageName = SongType.portuguese.toString();
      secondLanguageOption = "Portuguese"
      break;
    case SongType.chinese:
    default:
      secondLanguageName = SongType.chinese.toString();
      secondLanguageOption = "Chinese"
      break;
  }
  return { secondLanguageName, secondLanguageOption };
}

export { HymnBook, SongType, getSongType, getSecondLanguageOptions };

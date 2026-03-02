import TokenUser from "../ts/types/tokenUser.interface";
import UserInfo from "../ts/types/userInfo.interface";

// countries that are allowed to access the site - which are the following:
export const WHITELIST_COUNTRIES = ["US", "CA", "SG", "IN", "NP", "PH", "MY", "ZA", "BR", "ID", "PL", "CN-TW", "TW", "LK", "ID", "HN", "VN", "HK", "ZM", "MZ", "BW", "HN", "KH"]
export const WHITELIST_CITIES = []

export const REGISTRATION_WHITELIST_COUNTRIES = ["US", "CA", "SG", "IN", "NP", "PH", "MY", "ZA", "BR", "ID", "PL", "CN-TW", "TW", "LK", "ID", "HN", "VN", "ZM", "HK", "KH"]
export const REGISTRATION_WHITELIST_CITIES = ["san jose", "santa clara", "san francisco", "fremont", "saratoga", "vancouver", "hong kong"]

export const KILLED_CITIES = ["zabrze", "new york", "sacramento", "elk grove", "san diego"]
export const KILLED_COUNTRIES = []

/**
 * Is in Killed Place
 * 
 * @param country Country ISO 2 char code
 * @param city    city as lowercase
 * @returns       true if in killed place
 */
export const isInKilledPlace = (country: string | null, city: string | null) => {
  return KILLED_CITIES.includes(city);
}

/**
 * Is in whitelisted place
 * 
 * @param country Country ISO 2 char code
 * @param city    city as lowercase
 * @returns       true if in whitelisted place
 */
export const isWhitelisted = (country: string | null, city: string | null) => {
  return WHITELIST_COUNTRIES.includes(country) || WHITELIST_CITIES.includes(city);
}

/**
 * Is in registration whitelisted place (/register page open)
 * 
 * @param country Country ISO 2 char code
 * @param city    city as lowercase
 * @returns       true if in registration whitelisted place
 */
export const isInRegistrationWhitelist = (country: string | null, city: string | null) => {
  return REGISTRATION_WHITELIST_COUNTRIES.includes(country) || REGISTRATION_WHITELIST_CITIES.includes(city);
}

/**
 * Url to get list of songs
 */
const SONG_LIST_URL =
  "https://yted5wtsb0.execute-api.us-east-1.amazonaws.com/dev/googlesheet/1DSDm5bC-BXStA15HJIQqsGKEDZdS9gJ-tyZgIfPYdz4/Sheet1";

/**
 * Url for searching by song content. Use `q=` for the search query. Look at https://hymns.churchofgod.global/
 */
const SEARCH_BY_CONTENT_URL = "https://tcoghk-search.herokuapp.com/hymns";

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
  HC1 = "Hymnal Collection 23",
  HC2 = "Hymnal Collection 24",
  HC3 = "Hymnal Collection 25",

  // chinese hymn books
  S1 = "神家詩歌合訂本 1",
  S2 = "神家詩歌合訂本 2",
  CHC1 = "詩歌選集 23",
  CHC2 = "詩歌選集 24",
  CHC3 = "詩歌選集 25",
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
 * Other hymn books, which get hidden with the readOtherSong role
 */
const OTHER_HYMN_BOOKS: string[] = []

const ALLOWED_CHINESE_BOOKS: string[] = ["CHC1", "CHC2", "CHC3"]
const ALLOWED_BOOKS_TO_SEE_TRANSLATION: string[] = ["HC1", "HC2", "HC3", "CHC1", "CHC2", "CHC3"]

/**
 * Enum for the type of song for filtering
 */
enum SongType {
  english = "english",
  chinese = "chinese",
  tamil = "tamil",
  portuguese = "portuguese"
}

/**
 * List of Roles a user may have.
 */
enum UserRole {
  /**
   * Ability to read the song sheet (pdf of the songs with notes)
   */
  readSongSheet = "readSongSheet",
  /**
   * Deprecated: Ability to read Make a Melody
   */
  readMAM = "readMAM",
  /**
   * Deprecated: Ability to read Song of Solomon
   */
  readSOS = "readSOS",
  /**
    * Deprecated: Ability to read HC3
    */
  readHC3 = "readHC3",

  readOtherLang = "readOtherLang",
  /**
   * Ability to see related song notes if there are any
   */
  readRelatedSongNotes = "readRelatedSongNotes",

  /**
   * OBSOLETE: Ability to read tags on songs and sort by them in certain pages
   */
  readTags = "readTags",

  /**
   * Ability to add related songs (overrides global property)
   */
  addRelatedSong = "addRelatedSong",

  /**
   * Ability to see related songs (overrides global property)
   */
  readRelatedSong = "readRelatedSong",

  /**
   * Ability to see secondary related songs
   */
  readSecondaryRelatedSong = "readSecondaryRelatedSong",

  /**
   * See {@link OTHER_HYMN_BOOKS}
   */
  readOtherSongs = "readOtherSongs",

  hideFromTeam = "hideFromTeam",

  /**
   * Is part of vancouver team and has van team dashboards
   */
  vanTeam = "vanTeam",

  /**
   * Is part of vancouver music team
   */
  musicTeam = "musicTeam",

  /**
   * Ability to read and write song notes
   */
  songNotes = "songNotes",

  /**
   * OBSOLETE: Ability to read melody clusters
   */
  readMelodyClusters = "readMelodyClusters",

  /**
   * Read treasures for the soul page
   */
  readTFTS = "readTFTS",

  /**
   * Ability to use app
   */
  useApp = "useApp",

  paid = "paid",

  aiAccess = "aiAccess",

  /**
   * Block usage of app
   */
  block = "block",

  /**
   * Ability to read english songs
   */
  readEnglishSongs = "readEnglishSongs",

  /**
   * Ability to read chinese songs
   */
  readChineseSongs = "readChineseSongs",

  audioPlayer = "audioPlayer",

  bibleNotes = "bibleNotes"
}

/**
 * Select Options for roles to add. Add more roles here as you add to UserRole
 */
export const UserRoleOptions = [
  { value: UserRole.readSongSheet, label: "Read Song Sheet" },
  { value: UserRole.readRelatedSongNotes, label: "Read Related Song Notes" },
  { value: UserRole.readTags, label: "Read Tags" },
  { value: UserRole.addRelatedSong, label: "Add Related Song" },
  { value: UserRole.readRelatedSong, label: "Read Related Song" },
]
/**
 * Get the UserRole enum from the string value
 *
 * @param userRoleStr string to map to UserRole
 * @returns UserRole
 */
const getUserRole = (userRoleStr: string): UserRole => {
  if (userRoleStr in UserRole) {
    return UserRole[userRoleStr as keyof typeof SearchBy];
  }
  return null;
};

/**
 * Method to check if user has a certain role
 *
 * @param user  The user in question
 * @param role  the role
 * @returns     if the user has the role - false if user is null
 * @see #userHasRoleOrAdmin
 */
const userHasRole = (user: UserInfo | TokenUser | null | undefined, role: UserRole): boolean => {
  if (user == null || user == undefined) {
    return false;
  }
  return user?.roles && user?.roles?.includes(role);
};

/**
 * Method to check if user has a certain role - true always if they are admin
 *
 * @param user  The user in question
 * @param role  the role
 * @returns     if the user has the role - false if user is null (if admin -> true)
 */
const userHasRoleOrAdmin = (user: UserInfo | TokenUser | null | undefined, role: UserRole): boolean => {
  return (
    userHasRole(user, role)
    || user?.isAdmin
  );
};

/**
 * Get list of Active Roles (not deprecated)
 */
export const getActiveRoles = (): UserRole[] => {
  return Object.values(UserRole)
    .filter((role) => role != UserRole.readMAM && role != UserRole.readSOS)
}

/**
 * Type of user
 */
enum UserType {
  // normal user, created by logging in with google
  google = "google",

  // token user
  token = "token"
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
  return null;
};

/**
 * Get the other song type. if english, return chinese and vice versa. null provided songType is null
 */
const getOtherSongType = (songType: SongType): SongType => {
  if (songType == null) {
    return null;
  }
  if (songType == SongType.chinese) {
    return SongType.english;
  }
  return SongType.chinese;
};

/**
 * Enum for how you search for songs
 *
 * @see SearchBar
 */
enum SearchBy {
  default = "default", // by title, abbreviations, song book, number
  lyrics = "lyrics", // primarily by lyrics and title
}

const getSearchBy = (searchBy: string): SearchBy => {
  if (searchBy in SearchBy) {
    return SearchBy[searchBy as keyof typeof SearchBy];
  }
  return null;
};

/**
 * Enum for sorting favorites songs by
 *
 * @see SortPopup
 */
enum FavoriteSongSortBy {
  tags = "tags",
  hymnBook = "hymnBook",
  dateAdded = "dateAdded",
  name = "name",
}

/**
 * Enum describing Sort by options
 */
enum HymnContentSortBy {
  byPage = "byPage",
  alphabetical = "alphabetical",
  tags = "tags",
}

/**
 * Enum for sorting users by (admin only)
 */
export enum UserSortBy {
  default = "default",
  createdAt = "createdAt",
  lastValidatedAt = "lastValidatedAt"
}

/**
 * Get the full name of a hymn book, if it exists in the enum
 *
 * @param acronym
 */
const getHymnBook = (acronym: string): string => {
  if (acronym in HymnBook) {
    return HymnBook[acronym];
  }
  return "";
};

/**
 * Say from `HymnBook.H12`, which returns the string value '神家詩歌 12', we want H12. This
 * method returns "H12". To use, do `getHymnBookKey(HymnBook.H12)`. This is to deal with
 * weird javascript enums
 *
 * @param value Value of a HymnBook enum
 * @returns     the Key in a string
 */
const getHymnBookKey = (value: string): string => {
  return Object.keys(HymnBook).find((key) => HymnBook[key] === value);
};

/**
 * Song Sheet Types
 */
export enum SongSheetType {
  default = "default",
  chords = "chords"
}

export enum UserStatus {
  pendingApproval = "pendingApproval",
  approved = "approved",
  denied = "denied",
  paid = "paid",
}

export const UserStatusOptions = [
  { value: UserStatus.pendingApproval, label: "Pending Approval" },
  { value: UserStatus.approved, label: "Approved" },
  { value: UserStatus.denied, label: "Denied" },
  { value: UserStatus.paid, label: "Paid" },
  { value: null, label: "None" }
]

/**
 * Get SongSheetType enum from string, otherwise null
 * 
 * @param sheetTypeStr  string value
 * @returns             SongSheetType, if unknown null
 */
export const getSongSheetType = (sheetTypeStr: string): SongSheetType => {
  if (sheetTypeStr in SongSheetType) {
    return SongSheetType[sheetTypeStr as keyof typeof SongSheetType];
  }
  return null;
};

// Hymn books that require a border for book cover images - usually when the background is white
export const BOOK_REQUIRES_BORDER = ["GBH", "MAM", "SOS", "MAM2", "SOMH2", "MAM3", "HC1", "HC2", "HC3", "CHC1", "CHC2", "CHC3", "P1", "P2", "P2025", "P2026"]

export {
  SONG_LIST_URL,
  SEARCH_BY_CONTENT_URL,
  OTHER_HYMN_BOOKS,
  ALLOWED_CHINESE_BOOKS,
  ALLOWED_BOOKS_TO_SEE_TRANSLATION,
  HymnBook,
  getHymnBook,
  getHymnBookKey,
  SongType,
  getSongType,
  SearchBy,
  getSearchBy,
  getOtherSongType,
  UserRole,
  getUserRole,
  userHasRole,
  userHasRoleOrAdmin,
  FavoriteSongSortBy,
  HymnContentSortBy,
  UserType
};

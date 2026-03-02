/**
 * Month names constant in list
 */
const MONTH_NAMES = [
  "January", "February", "March",
  "April", "May", "June",
  "July", "August", "September",
  "October", "November", "December"
];

/**
 * Get Date string based on millisecond
 *
 * @param timestampMilli timestamp in milliseconds
 * @returns Formatted Date string
 */
export const getDateString = (timestampMilli: number | undefined | null): string => {
  if (timestampMilli == null) {
    return "";
  }
  const date = new Date(timestampMilli);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

/**
 * Get Date string to minute based on millisecond e.g. "9/26/2022 20:56"
 *
 * @param timestampMilli timestamp in milliseconds
 * @returns Formatted Date string
 */
export const getDateToMinString = (timestampMilli: number | undefined | null): string => {
  if (timestampMilli == null) {
    return "";
  }
  const date = new Date(timestampMilli);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${toTwoDigitStr(date.getHours())}:${toTwoDigitStr(date.getMinutes())}`;
};

/**
 * Get Date string up to seconds based on millisecond
 *
 * @param timestampMilli timestamp in milliseconds
 * @returns Formatted Date string
 */
export const getDateToSecString = (timestampMilli: number | undefined | null): string => {
  if (timestampMilli == null) {
    return "";
  }
  const date = new Date(timestampMilli);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${toTwoDigitStr(date.getHours())}:${toTwoDigitStr(date.getMinutes())}:${toTwoDigitStr(date.getSeconds())}`;
};

/**
 * Get Shortened Date to Minute - e.g. "Oct 1, 22 12:30"
 * 
 * @param timestampMilli timestamp in milliseconds
 * @returns             Formatted Date string
 */
export const getShortenedDateToMin = (timestampMilli: number | undefined | null): string => {
  if (timestampMilli == null) {
    return "";
  }
  const date = new Date(timestampMilli);
  return `${toDateString(date)} ${toTwoDigitStr(date.getHours())}:${toTwoDigitStr(date.getMinutes())}`;
};

export const getDay = (timestampMilli: number | undefined | null, shortenedMonth: boolean = false, shortenedYear: boolean = false): string => {
  if (timestampMilli == null) {
    return "";
  }
  const date = new Date(timestampMilli);
  return `${shortenedMonth ? toShortenedMonthName(date) : toFullMonthName(date)} ${date.getDate()}, ${shortenedYear ? toShortenedYear(date) : date.getFullYear()}`;
}


/****************************************************
 * Following are helper methods
 *****************************************************/

/**
 * Get Shortened Month name - e.g. "Oct" or "Mar"
 * 
 * @param date  date
 * @returns     Formatted Month string
 */
export const toShortenedMonthName = (date: Date): string => {
  return MONTH_NAMES[date.getMonth()].slice(0, 3);;
}

/**
 * Get Full Month name - e.g. "October" or "March"
 * 
 * @param date  date
 * @returns     Formatted Month string
 */
export const toFullMonthName = (date: Date): string => {
  return MONTH_NAMES[date.getMonth()];
}

/**
 * Get Shortened Year name - e.g. "21" or "22" for 2021 and 2022 respectively
 * 
 * @param date  date
 * @returns     Formatted Year string
 */
export const toShortenedYear = (date: Date) => {
  return date.getFullYear().toString().slice(-2)
}

/**
 * Get string of a number with two digits - leading 0 if needed
 * 
 * @param num number (like minute or second)
 */
export const toTwoDigitStr = (num: number): string => {
  return String(num).padStart(2, "0");
}

/**
 * To Date String with shortened month and year - e.g. "Oct 1, 22"
 * 
 * @param date date
 * @returns    Formatted Date string
 */
export const toDateString = (date: Date): string => {
  return `${toShortenedMonthName(date)} ${date.getDate()}, ${toShortenedYear(date)} `;
}

/**
 * To Date String with shortened month and but full year - e.g. "Oct 1, 2022"
 * 
 * @param date  date
 * @returns     Formatted Date string
 */
export const toDateFullYearString = (date: Date): string => {
  return `${toShortenedMonthName(date)} ${date.getDate()}, ${date.getFullYear()} `;
}
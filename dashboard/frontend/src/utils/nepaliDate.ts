import NepaliDate from "nepali-date-converter";

export interface NepaliMonthInfo {
  value: number; // 1 to 12
  name: string;
  nepaliName: string;
  short: string;
}

export const NEPALI_MONTHS: NepaliMonthInfo[] = [
  { value: 1, name: "Baisakh", nepaliName: "बैशाख", short: "Bai" },
  { value: 2, name: "Jestha", nepaliName: "जेठ", short: "Jes" },
  { value: 3, name: "Ashadh", nepaliName: "असार", short: "Asa" },
  { value: 4, name: "Shrawan", nepaliName: "साउन", short: "Shr" },
  { value: 5, name: "Bhadra", nepaliName: "भाद्र", short: "Bha" },
  { value: 6, name: "Ashwin", nepaliName: "असोज", short: "Ash" },
  { value: 7, name: "Kartik", nepaliName: "कार्तिक", short: "Kar" },
  { value: 8, name: "Mangsir", nepaliName: "मंसिर", short: "Man" },
  { value: 9, name: "Poush", nepaliName: "पुस", short: "Pou" },
  { value: 10, name: "Magh", nepaliName: "माघ", short: "Mag" },
  { value: 11, name: "Falgun", nepaliName: "फागुन", short: "Fal" },
  { value: 12, name: "Chaitra", nepaliName: "चैत", short: "Cha" },
];

export const NEPALI_DAYS = [
  { name: "Sunday", nepaliName: "आइतबार", short: "Sun", nepaliShort: "आइत" },
  { name: "Monday", nepaliName: "सोमबार", short: "Mon", nepaliShort: "सोम" },
  { name: "Tuesday", nepaliName: "मंगलबार", short: "Tue", nepaliShort: "मंगल" },
  { name: "Wednesday", nepaliName: "बुधबार", short: "Wed", nepaliShort: "बुध" },
  { name: "Thursday", nepaliName: "बिहीबार", short: "Thu", nepaliShort: "बिही" },
  { name: "Friday", nepaliName: "शुक्रबार", short: "Fri", nepaliShort: "शुक्र" },
  { name: "Saturday", nepaliName: "शनिबार", short: "Sat", nepaliShort: "शनि" },
];

export const NEPALI_YEARS = [2079, 2080, 2081, 2082, 2083, 2084, 2085, 2086];

/**
 * Safely parse any date value into a NepaliDate instance.
 */
export const toNepaliDate = (date?: Date | string | number | null): NepaliDate | null => {
  if (!date) return null;
  try {
    const jsDate = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    if (isNaN(jsDate.getTime())) return null;
    return new NepaliDate(jsDate);
  } catch {
    return null;
  }
};

/**
 * Format any date value into a Bikram Sambat string.
 * Default format: "MMMM DD, YYYY" (e.g. "Bhadra 11, 2083")
 */
export const formatNepali = (
  date?: Date | string | number | null,
  formatStr: string = "MMMM DD, YYYY"
): string => {
  if (!date) return "N/A";
  const nd = toNepaliDate(date);
  if (!nd) return "Invalid Date";
  try {
    return nd.format(formatStr, "en");
  } catch {
    return "Invalid Date";
  }
};

/**
 * Format in Devanagari script (e.g. "भाद्र ११, २०८३")
 */
export const formatNepaliDevanagari = (
  date?: Date | string | number | null,
  formatStr: string = "MMMM DD, YYYY"
): string => {
  if (!date) return "N/A";
  const nd = toNepaliDate(date);
  if (!nd) return "Invalid Date";
  try {
    return nd.format(formatStr, "np");
  } catch {
    return "Invalid Date";
  }
};

/**
 * Format date with 12-hour time (e.g. "Bhadra 11, 2083 at 3:30 PM")
 */
export const formatNepaliWithTime = (date?: Date | string | number | null): string => {
  if (!date) return "N/A";
  const jsDate = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (!jsDate || isNaN(jsDate.getTime())) return "N/A";
  
  const bsStr = formatNepali(jsDate, "MMMM DD, YYYY");
  const timeStr = jsDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  return `${bsStr} at ${timeStr}`;
};

/**
 * Format short date (e.g. "Bhadra 11" or "Bai 11, 2083")
 */
export const formatNepaliShort = (date?: Date | string | number | null): string => {
  return formatNepali(date, "MMM DD, YYYY");
};

/**
 * Format month and year only (e.g. "Bhadra 2083")
 */
export const formatNepaliMonthYear = (date?: Date | string | number | null): string => {
  return formatNepali(date, "MMMM YYYY");
};

/**
 * Get current Nepali Date object breakdown
 */
export const getCurrentNepaliDate = () => {
  const nd = new NepaliDate();
  const monthIdx = nd.getMonth(); // 0 to 11
  const monthInfo = NEPALI_MONTHS[monthIdx] || NEPALI_MONTHS[0];
  return {
    year: nd.getYear(),
    month: monthIdx + 1, // 1 to 12
    day: nd.getDate(),
    monthName: monthInfo.name,
    nepaliMonthName: monthInfo.nepaliName,
    dayOfWeek: nd.getDay(), // 0 = Sunday
  };
};

/**
 * Convert AD Date to BS breakdown
 */
export const adToBs = (date: Date | string | number) => {
  const nd = toNepaliDate(date) || new NepaliDate();
  const monthIdx = nd.getMonth();
  const monthInfo = NEPALI_MONTHS[monthIdx] || NEPALI_MONTHS[0];
  return {
    year: nd.getYear(),
    month: monthIdx + 1,
    day: nd.getDate(),
    monthName: monthInfo.name,
    nepaliMonthName: monthInfo.nepaliName,
    dayOfWeek: nd.getDay(),
  };
};

/**
 * Convert BS Year, Month (1-12), Day (1-32) to JavaScript Date (AD)
 */
export const bsToAd = (year: number, month: number, day: number): Date => {
  try {
    const nd = new NepaliDate(year, Math.max(0, Math.min(11, month - 1)), day);
    return nd.toJsDate();
  } catch {
    return new Date();
  }
};

/**
 * Calculate the number of days in a given BS month (29 to 32 days)
 */
export const getDaysInBsMonth = (year: number, month: number): number => {
  try {
    // Try day 32 down to 29
    for (let d = 32; d >= 29; d--) {
      try {
        const nd = new NepaliDate(year, month - 1, d);
        // If year and month match, d is valid
        if (nd.getYear() === year && nd.getMonth() === month - 1 && nd.getDate() === d) {
          return d;
        }
      } catch {
        continue;
      }
    }
  } catch {
    // Fallback
  }
  return 30;
};

/**
 * Get the weekday index (0 = Sun .. 6 = Sat) of the 1st day of a BS month
 */
export const getFirstDayOfBsMonth = (year: number, month: number): number => {
  try {
    const nd = new NepaliDate(year, month - 1, 1);
    return nd.getDay();
  } catch {
    return 0;
  }
};

import { format, parseISO, addDays, differenceInCalendarDays } from 'date-fns';

export const SIMULATED_TODAY = '2026-10-17';
export const SIMULATED_HORIZON = '2026-12-31';

/**
 * Format currency in Indian numbering format: e.g. ₹1,25,000 or ₹350
 */
export function formatINR(amount: number, hideDecimals: boolean = true): string {
  const rounded = hideDecimals ? Math.round(amount) : amount;
  return '₹' + rounded.toLocaleString('en-IN');
}

/**
 * Format ISO date string 'YYYY-MM-DD' as '20 Oct'
 */
export function formatDateShort(isoDate: string): string {
  try {
    const d = parseISO(isoDate);
    return format(d, 'd MMM');
  } catch {
    return isoDate;
  }
}

/**
 * Format ISO date string 'YYYY-MM-DD' as '20 Oct 2026'
 */
export function formatDateFull(isoDate: string): string {
  try {
    const d = parseISO(isoDate);
    return format(d, 'd MMM yyyy');
  } catch {
    return isoDate;
  }
}

/**
 * Add days to ISO date string and return ISO date string
 */
export function addDaysIso(isoDate: string, days: number): string {
  const d = parseISO(isoDate);
  const result = addDays(d, days);
  return format(result, 'yyyy-MM-dd');
}

/**
 * Calculate difference in days between two ISO dates (b - a)
 */
export function diffDaysIso(startIso: string, endIso: string): number {
  return differenceInCalendarDays(parseISO(endIso), parseISO(startIso));
}

/**
 * Returns an array of ISO date strings between start and end inclusive
 */
export function getDateRangeArray(startIso: string, endIso: string): string[] {
  const diff = diffDaysIso(startIso, endIso);
  if (diff < 0) return [];
  const dates: string[] = [];
  for (let i = 0; i <= diff; i++) {
    dates.push(addDaysIso(startIso, i));
  }
  return dates;
}

/**
 * Euclidean distance on km grid
 */
export function euclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

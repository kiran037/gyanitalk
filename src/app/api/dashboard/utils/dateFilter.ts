import { DateFilterType, DateRange } from "./types";

export function getDateRange(
  filter: string,
  customStart?: string,
  customEnd?: string
): DateRange {
  const now = new Date();
  const endDate = new Date(now.setHours(23, 59, 59, 999));
  let startDate = new Date();

  switch (filter) {
    case DateFilterType.TODAY:
      startDate.setHours(0, 0, 0, 0);
      break;

    case DateFilterType.LAST_7_DAYS:
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;

    case DateFilterType.LAST_30_DAYS:
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      break;

    case DateFilterType.LAST_3_MONTHS:
      startDate.setMonth(now.getMonth() - 3);
      startDate.setHours(0, 0, 0, 0);
      break;

    case DateFilterType.LAST_6_MONTHS:
      startDate.setMonth(now.getMonth() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;

    case DateFilterType.LAST_1_YEAR:
      startDate.setFullYear(now.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;

    case DateFilterType.CUSTOM:
      if (customStart && customEnd) {
        startDate = new Date(customStart);
        startDate.setHours(0, 0, 0, 0);
        const customEndDate = new Date(customEnd);
        customEndDate.setHours(23, 59, 59, 999);
        return { startDate, endDate: customEndDate };
      }
      // Fallback to last 30 days if custom dates not provided
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      break;

    default:
      // Default to last 30 days
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
  }

  return { startDate, endDate };
}

export function getPreviousDateRange(currentRange: DateRange): DateRange {
  const duration =
    currentRange.endDate.getTime() - currentRange.startDate.getTime();
  const endDate = new Date(currentRange.startDate.getTime() - 1);
  const startDate = new Date(endDate.getTime() - duration);

  return { startDate, endDate };
}

export function calculateComparison(
  current: number,
  previous: number
): {
  change: number;
  changePercent: number;
  isIncrease: boolean;
} {
  const change = current - previous;
  const changePercent = previous === 0 ? 100 : (change / previous) * 100;

  return {
    change,
    changePercent: Math.round(changePercent * 100) / 100,
    isIncrease: change >= 0,
  };
}
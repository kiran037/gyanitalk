export enum DateFilterType {
  TODAY = "today",
  LAST_7_DAYS = "last_7_days",
  LAST_30_DAYS = "last_30_days",
  LAST_3_MONTHS = "last_3_months",
  LAST_6_MONTHS = "last_6_months",
  LAST_1_YEAR = "last_1_year",
  CUSTOM = "custom",
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface DashboardResponse<T = any> {
  success: boolean;
  data: T;
  metadata: {
    filter: string;
    dateRange: DateRange;
    generatedAt: string;
    comparison?: any;
    refreshRecommended?: number; // ✅ Added this for live route
  };
  error?: string;
}

export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}
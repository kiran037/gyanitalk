export type BannerType = {
  id: number;
  name: string;
  // optional "WxH" (e.g., "1080x1920") or ratio "16:9"
  dimensions?: string | null;
};

export type Banner = {
  id: number;
  bannerTypeId: number;
  bannerType?: BannerType;
  fromDate?: string | null;
  toDate?: string | null;
  bannerImage?: string | null;
  isActive?: number | boolean;
};

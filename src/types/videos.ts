export type Video = {
  id: number;
  youtubeLink: string;
  coverImage?: string | null;
  description?: string | null;
  videoTitle?: string | null;
  isActive?: number | boolean;
};

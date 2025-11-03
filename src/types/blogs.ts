export type Blog = {
  id: number;
  title: string;
  description: string;
  isActive: number; // 0/1
  extension?: string;
  blogImage?: string;
  author?: string;
  postedOn?: string;
  viewer?: number;
};

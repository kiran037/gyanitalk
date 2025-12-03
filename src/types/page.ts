// types/page.ts

export interface PageListItem {
  id: number;
  title: string;
  slug: string;
  type: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface PageFull {
  id: number;
  title: string;
  slug: string;
  type: string;
  description: string | null;
  isActive: boolean;
  created_at: string;
  updated_at: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  schemaJson: string | null;
}

export interface PageStats {
  total: number;
  active: number;
  inactive: number;
}

export interface SEOAnalysis {
  score: number;
  status: string;
  issues: string[];
}
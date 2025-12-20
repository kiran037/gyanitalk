// types/api/page.ts

import { pages_type } from "@/generated/client/client";

/**
 * Main API response structure for page data
 */
export interface PageResponse {
  success: boolean;
  data: PageData | null;
  error?: string;
  message?: string;
}

/**
 * Complete page data including content, SEO, and computed fields
 */
export interface PageData {
  page: PageContent;
  seo: SEOMetadata;
  computed: ComputedFields;
}

/**
 * Core page content from database
 */
export interface PageContent {
  id: number;
  title: string;
  type: pages_type;
  description: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Complete SEO metadata for a page
 */
export interface SEOMetadata {
  title: string;
  metaDescription: string;
  metaKeywords: string[];
  canonicalUrl: string;
  slug: string;
  openGraph: OpenGraphData;
  twitter: TwitterCardData;
  schema: Record<string, any>;
}

/**
 * Open Graph metadata for social sharing
 */
export interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  siteName: string;
}

/**
 * Twitter Card metadata
 */
export interface TwitterCardData {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  title: string;
  description: string;
  image: string;
  site: string;
}

/**
 * Computed fields based on content analysis
 */
export interface ComputedFields {
  readTime: string;
  wordCount: number;
  lastModified: string;
  generatedSlug: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  availableTypes?: string[];
}

/**
 * Page-specific SEO configuration
 */
export interface PageSEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  twitterImage: string;
}

/**
 * Site-wide configuration
 */
export interface SiteConfig {
  siteName: string;
  siteUrl: string;
  cdnUrl: string;
  twitterHandle: string;
  facebookPage: string;
  defaultOGImage: string;
  defaultTwitterImage: string;
}

/**
 * Content quality assessment result
 */
export interface ContentQuality {
  score: number;
  issues: string[];
}

/**
 * Breadcrumb item for Schema.org
 */
export interface BreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

/**
 * Schema.org breadcrumb list
 */
export interface BreadcrumbList {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
}

/**
 * Schema.org organization
 */
export interface Organization {
  '@type': 'Organization';
  name: string;
  logo: {
    '@type': 'ImageObject';
    url: string;
  };
}

/**
 * Complete Schema.org page markup
 */
export interface SchemaPage {
  '@context': 'https://schema.org';
  '@type': string;
  name: string;
  description: string;
  url: string;
  dateModified: string;
  publisher: Organization;
}
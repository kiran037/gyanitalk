// lib/utils/seo-generator.ts

import { pages_type } from '@prisma/client';
import { SEOMetadata, OpenGraphData, TwitterCardData } from '@/types/api/page';
import { SITE_CONFIG, DEFAULT_SEO, PAGE_SPECIFIC_SEO } from '@/lib/constants/seo';

interface PageData {
  title: string | null;
  slug: string | null;
  type: pages_type | null;
  description: string | null;
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

/**
 * Generate complete SEO metadata for a page
 * Fills in missing fields with intelligent defaults
 */
export function generateSEOMetadata(page: PageData): SEOMetadata {
  const pageType = page.type || 'home';
  const specificSEO = PAGE_SPECIFIC_SEO[pageType];

  // Generate slug from title if missing
  const slug = page.slug || generateSlug(page.title || specificSEO.title);

  // Generate meta title
  const title =
    page.metaTitle ||
    page.title ||
    `${specificSEO.title} | ${SITE_CONFIG.siteName}`;

  // Generate meta description
  const metaDescription =
    page.metaDescription ||
    generateMetaDescription(page.description || '', specificSEO.description);

  // Generate keywords
  const keywords =
    page.metaKeywords ||
    generateKeywords(page.description || '', page.title || '', pageType);

  // Generate canonical URL
  const canonicalUrl =
    page.canonicalUrl || `${SITE_CONFIG.siteUrl}/${slug}`;

  // Generate Open Graph data
  const openGraph = generateOpenGraphData(page, title, metaDescription, canonicalUrl);

  // Generate Twitter Card data
  const twitter = generateTwitterCardData(page, title, metaDescription);

  // Generate Schema.org JSON-LD
  const schema = page.schemaJson
    ? JSON.parse(page.schemaJson)
    : generateSchemaJson(pageType, {
        title: page.title || specificSEO.title,
        description: metaDescription,
        url: canonicalUrl,
      });

  return {
    title,
    metaDescription,
    metaKeywords: keywords.split(',').map((k) => k.trim()),
    canonicalUrl,
    slug,
    openGraph,
    twitter,
    schema,
  };
}

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate meta description from content
 * Extracts first 155 characters (SEO optimal length)
 */
export function generateMetaDescription(
  content: string,
  fallback: string,
  maxLength: number = 155
): string {
  if (!content || content.trim().length === 0) {
    return fallback.substring(0, maxLength);
  }

  // Strip HTML tags
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Cut at last complete word before maxLength
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Generate keywords from content and title
 */
export function generateKeywords(
  content: string,
  title: string,
  pageType: pages_type
): string {
  const specificSEO = PAGE_SPECIFIC_SEO[pageType];
  const baseKeywords = specificSEO.keywords;

  // Extract title words
  const titleWords = title
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3);

  // Combine with base keywords
  const allKeywords = [...baseKeywords, ...titleWords];

  // Remove duplicates and return as comma-separated string
  return Array.from(new Set(allKeywords)).slice(0, 10).join(', ');
}

/**
 * Generate Open Graph metadata
 */
function generateOpenGraphData(
  page: PageData,
  title: string,
  description: string,
  url: string
): OpenGraphData {
  const pageType = page.type || 'home';
  const specificSEO = PAGE_SPECIFIC_SEO[pageType];

  return {
    title: page.ogTitle || title,
    description: page.ogDescription || description,
    image: page.ogImage || specificSEO.ogImage,
    url,
    type: 'website',
    siteName: SITE_CONFIG.siteName,
  };
}

/**
 * Generate Twitter Card metadata
 */
function generateTwitterCardData(
  page: PageData,
  title: string,
  description: string
): TwitterCardData {
  const pageType = page.type || 'home';
  const specificSEO = PAGE_SPECIFIC_SEO[pageType];

  return {
    card: 'summary_large_image',
    title: page.twitterTitle || title,
    description: page.twitterDescription || description,
    image: page.twitterImage || specificSEO.twitterImage,
    site: SITE_CONFIG.twitterHandle,
  };
}

/**
 * Generate Schema.org JSON-LD markup
 */
export function generateSchemaJson(
  pageType: pages_type,
  data: { title: string; description: string; url: string }
): Record<string, any> {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': getSchemaType(pageType),
    name: data.title,
    description: data.description,
    url: data.url,
    dateModified: new Date().toISOString(),
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.siteUrl}/logo.png`,
      },
    },
  };

  // Add breadcrumbs for better SEO
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_CONFIG.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: data.title,
        item: data.url,
      },
    ],
  };

  return {
    '@graph': [baseSchema, breadcrumbSchema],
  };
}

/**
 * Get appropriate Schema.org type for page
 */
function getSchemaType(pageType: pages_type): string {
  const typeMap: Record<pages_type, string> = {
    home: 'WebSite',
    aboutus: 'AboutPage',
    privacy: 'WebPage',
    terms: 'WebPage',
  };

  return typeMap[pageType] || 'WebPage';
}
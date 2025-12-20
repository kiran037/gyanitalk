// lib/constants/seo.ts

import { pages_type } from '@/generated/client/client';
import { SiteConfig, PageSEOConfig } from '@/types/api/page';

/**
 * Site-wide configuration
 * Update these values according to your environment variables
 */
export const SITE_CONFIG: SiteConfig = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'GyanITalk',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanitalk.com',
  cdnUrl: process.env.NEXT_PUBLIC_BASEURL || 'https://gyanitalk.s3.ap-south-1.amazonaws.com/',
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@gyanitalk',
  facebookPage: process.env.NEXT_PUBLIC_FACEBOOK_PAGE || 'gyanitalk',
  defaultOGImage: `${process.env.NEXT_PUBLIC_BASEURL || 'https://gyanitalk.s3.ap-south-1.amazonaws.com/'}/og-images/default.jpg`,
  defaultTwitterImage: `${process.env.NEXT_PUBLIC_BASEURL || 'https://gyanitalk.s3.ap-south-1.amazonaws.com/'}/twitter-images/default.jpg`,
};

/**
 * Default SEO values used as fallbacks
 */
export const DEFAULT_SEO = {
  title: `${SITE_CONFIG.siteName} | Your Trusted Astrology Platform`,
  description:
    'Connect with expert astrologers for personalized guidance. Get accurate horoscopes, kundali matching, and astrological consultations online.',
  keywords: [
    'astrology',
    'astrologer',
    'horoscope',
    'kundali',
    'vedic astrology',
    'online astrology',
    'astrology consultation',
    'gyanitalk',
  ],
};

/**
 * Page-specific SEO configurations
 * These are used as fallbacks when database values are missing
 */
export const PAGE_SPECIFIC_SEO: Record<pages_type, PageSEOConfig> = {
  home: {
    title: 'Home',
    description:
      'Welcome to GyanITalk - Connect with expert astrologers for chat, call, and live consultations. Get personalized horoscopes, kundali matching, and astrological guidance from certified Vedic astrologers.',
    keywords: [
      'astrology',
      'online astrologer',
      'astrology consultation',
      'vedic astrology',
      'gyanitalk',
      'horoscope',
      'kundali matching',
      'talk to astrologer',
    ],
    ogImage: `${SITE_CONFIG.cdnUrl}og-images/home.jpg`,
    twitterImage: `${SITE_CONFIG.cdnUrl}twitter-images/home.jpg`,
  },

  aboutus: {
    title: 'About Us',
    description:
      'Learn about GyanITalk\'s mission to make authentic Vedic astrology accessible to everyone. Discover our team of certified astrologers, our values, and how we\'re revolutionizing online astrology consultations.',
    keywords: [
      'about gyanitalk',
      'astrology platform',
      'vedic astrology services',
      'certified astrologers',
      'online astrology',
      'gyanitalk mission',
      'astrology team',
    ],
    ogImage: `${SITE_CONFIG.cdnUrl}og-images/about.jpg`,
    twitterImage: `${SITE_CONFIG.cdnUrl}twitter-images/about.jpg`,
  },

  privacy: {
    title: 'Privacy Policy',
    description:
      'Read GyanITalk\'s comprehensive privacy policy. Learn how we collect, use, protect, and manage your personal information. Your privacy and data security are our top priorities.',
    keywords: [
      'privacy policy',
      'data protection',
      'user privacy',
      'gyanitalk privacy',
      'data security',
      'personal information',
      'gdpr compliance',
      'data handling',
    ],
    ogImage: `${SITE_CONFIG.cdnUrl}og-images/privacy.jpg`,
    twitterImage: `${SITE_CONFIG.cdnUrl}twitter-images/privacy.jpg`,
  },

  terms: {
    title: 'Terms of Service',
    description:
      'Review GyanITalk\'s terms of service. Understand your rights and responsibilities when using our platform, consultation services, and astrology products. Clear guidelines for users and astrologers.',
    keywords: [
      'terms of service',
      'user agreement',
      'service terms',
      'gyanitalk terms',
      'usage policy',
      'legal terms',
      'terms and conditions',
      'service agreement',
    ],
    ogImage: `${SITE_CONFIG.cdnUrl}og-images/terms.jpg`,
    twitterImage: `${SITE_CONFIG.cdnUrl}twitter-images/terms.jpg`,
  },
};

/**
 * Schema.org organization data
 * Used in structured data markup
 */
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_CONFIG.siteName,
  url: SITE_CONFIG.siteUrl,
  logo: `${SITE_CONFIG.siteUrl}/logo.png`,
  description: DEFAULT_SEO.description,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    `https://twitter.com/${SITE_CONFIG.twitterHandle.replace('@', '')}`,
    `https://facebook.com/${SITE_CONFIG.facebookPage}`,
  ],
};

/**
 * Robots meta tag configurations
 */
export const ROBOTS_CONFIG = {
  index: {
    robots: 'index, follow',
    googlebot: 'index, follow',
  },
  noindex: {
    robots: 'noindex, nofollow',
    googlebot: 'noindex, nofollow',
  },
};

/**
 * Cache control headers for different page types
 */
export const CACHE_HEADERS: Record<pages_type, string> = {
  home: 'public, s-maxage=1800, stale-while-revalidate=3600', // 30 min cache, 1hr stale
  aboutus: 'public, s-maxage=3600, stale-while-revalidate=86400', // 1hr cache, 24hr stale
  privacy: 'public, s-maxage=7200, stale-while-revalidate=86400', // 2hr cache, 24hr stale
  terms: 'public, s-maxage=7200, stale-while-revalidate=86400', // 2hr cache, 24hr stale
};

/**
 * Language codes for multilingual support (future use)
 */
export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    hreflang: 'en',
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    hreflang: 'hi',
  },
};

/**
 * SEO-friendly route mappings
 * Maps frontend routes to page types
 */
export const ROUTE_TO_PAGE_TYPE: Record<string, pages_type> = {
  '/': 'home',
  '/home': 'home',
  '/about': 'aboutus',
  '/about-us': 'aboutus',
  '/privacy-policy': 'privacy',
  '/privacy': 'privacy',
  '/terms-of-service': 'terms',
  '/terms': 'terms',
};

/**
 * Page type to frontend route mapping
 */
export const PAGE_TYPE_TO_ROUTE: Record<pages_type, string> = {
  home: '/',
  aboutus: '/about',
  privacy: '/privacy-policy',
  terms: '/terms-of-service',
};
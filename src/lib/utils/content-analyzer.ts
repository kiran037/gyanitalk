// lib/utils/content-analyzer.ts

import { ComputedFields } from '@/types/api/page';

/**
 * Analyze content and generate computed fields
 */
export function analyzeContent(
  content: string,
  lastModified: Date | null
): ComputedFields {
  const plainText = extractPlainText(content);
  const wordCount = getWordCount(plainText);
  const readTime = calculateReadTime(wordCount);
  const formattedDate = formatDate(lastModified);

  return {
    readTime,
    wordCount,
    lastModified: formattedDate,
    generatedSlug: '',
  };
}

/**
 * Calculate reading time based on word count
 * Average reading speed: 200-250 words per minute
 */
export function calculateReadTime(wordCount: number): string {
  const wordsPerMinute = 225;
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  if (minutes < 1) {
    return 'Less than a minute read';
  } else if (minutes === 1) {
    return '1 min read';
  } else {
    return `${minutes} min read`;
  }
}

/**
 * Get word count from plain text
 */
export function getWordCount(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  // Split by whitespace and filter empty strings
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  return words.length;
}

/**
 * Extract plain text from HTML content
 * Removes all HTML tags and normalizes whitespace
 */
export function extractPlainText(html: string): string {
  if (!html) {
    return '';
  }

  return (
    html
      // Remove script and style tags with content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Generate a summary from content
 * Useful for meta descriptions or previews
 */
export function generateSummary(
  content: string,
  maxLength: number = 200
): string {
  const plainText = extractPlainText(content);

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Find the last complete sentence within maxLength
  const truncated = plainText.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');

  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);

  if (lastSentenceEnd > maxLength * 0.6) {
    // If we found a sentence end in the last 40% of the text
    return plainText.substring(0, lastSentenceEnd + 1);
  }

  // Otherwise cut at last word
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0
    ? plainText.substring(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Format date in human-readable format
 */
export function formatDate(date: Date | null): string {
  if (!date) {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Extract keywords from content using simple NLP
 * Returns array of most common meaningful words
 */
export function extractKeywords(
  content: string,
  maxKeywords: number = 10
): string[] {
  const plainText = extractPlainText(content).toLowerCase();

  // Common stop words to exclude
  const stopWords = new Set([
    'the',
    'be',
    'to',
    'of',
    'and',
    'a',
    'in',
    'that',
    'have',
    'i',
    'it',
    'for',
    'not',
    'on',
    'with',
    'he',
    'as',
    'you',
    'do',
    'at',
    'this',
    'but',
    'his',
    'by',
    'from',
    'they',
    'we',
    'say',
    'her',
    'she',
    'or',
    'an',
    'will',
    'my',
    'one',
    'all',
    'would',
    'there',
    'their',
    'what',
    'so',
    'up',
    'out',
    'if',
    'about',
    'who',
    'get',
    'which',
    'go',
    'me',
  ]);

  // Extract words and count frequency
  const words = plainText
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  const wordFrequency: Record<string, number> = {};

  words.forEach((word) => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Check if content has sufficient quality for SEO
 */
export function assessContentQuality(content: string): {
  score: number;
  issues: string[];
} {
  const plainText = extractPlainText(content);
  const wordCount = getWordCount(plainText);
  const issues: string[] = [];
  let score = 100;

  // Check minimum word count (300 words recommended for SEO)
  if (wordCount < 300) {
    issues.push('Content is too short (minimum 300 words recommended)');
    score -= 30;
  }

  // Check maximum word count (avoid overly long pages)
  if (wordCount > 3000) {
    issues.push('Content is very long (consider breaking into multiple pages)');
    score -= 10;
  }

  // Check for headings in HTML
  const hasHeadings = /<h[1-6]>/i.test(content);
  if (!hasHeadings) {
    issues.push('No headings found (add H1-H6 tags for better structure)');
    score -= 20;
  }

  // Check for lists
  const hasLists = /<(ul|ol)>/i.test(content);
  if (!hasLists && wordCount > 500) {
    issues.push('Consider adding lists for better readability');
    score -= 10;
  }

  return {
    score: Math.max(0, score),
    issues,
  };
}
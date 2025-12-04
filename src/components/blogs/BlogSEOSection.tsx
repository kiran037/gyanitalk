// components/blogs/BlogSEOSection.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/adminUI/Input";
import { Globe, ChevronDown, ChevronUp } from "lucide-react";

interface BlogSEOSectionProps {
  formData: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    schemaJson: string;
  };
  onFieldChange: (field: string, value: string) => void;
}

export function BlogSEOSection({ formData, onFieldChange }: BlogSEOSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#FF6B35]" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            SEO & Meta Tags
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-6 pt-0 space-y-6">
          {/* Basic Meta */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Basic Meta Tags
            </h4>
            <Input
              label="Meta Title"
              value={formData.metaTitle}
              onChange={(e) => onFieldChange("metaTitle", e.target.value)}
              placeholder="SEO optimized title"
            />
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => onFieldChange("metaDescription", e.target.value)}
                placeholder="Brief description for search engines (150-160 characters)"
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.metaDescription.length} / 160 characters
              </p>
            </div>
            <Input
              label="Meta Keywords"
              value={formData.metaKeywords}
              onChange={(e) => onFieldChange("metaKeywords", e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
            <Input
              label="Canonical URL"
              value={formData.canonicalUrl}
              onChange={(e) => onFieldChange("canonicalUrl", e.target.value)}
              placeholder="https://example.com/blog/article-slug"
            />
          </div>

          {/* Open Graph */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Open Graph (Facebook, LinkedIn)
            </h4>
            <Input
              label="OG Title"
              value={formData.ogTitle}
              onChange={(e) => onFieldChange("ogTitle", e.target.value)}
              placeholder="Title for social media"
            />
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                OG Description
              </label>
              <textarea
                value={formData.ogDescription}
                onChange={(e) => onFieldChange("ogDescription", e.target.value)}
                placeholder="Description for social media preview"
                rows={2}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              />
            </div>
            <Input
              label="OG Image URL"
              value={formData.ogImage}
              onChange={(e) => onFieldChange("ogImage", e.target.value)}
              placeholder="https://example.com/images/og-image.jpg"
            />
          </div>

          {/* Twitter Card */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Twitter Card
            </h4>
            <Input
              label="Twitter Title"
              value={formData.twitterTitle}
              onChange={(e) => onFieldChange("twitterTitle", e.target.value)}
              placeholder="Title for Twitter"
            />
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Twitter Description
              </label>
              <textarea
                value={formData.twitterDescription}
                onChange={(e) => onFieldChange("twitterDescription", e.target.value)}
                placeholder="Description for Twitter preview"
                rows={2}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              />
            </div>
            <Input
              label="Twitter Image URL"
              value={formData.twitterImage}
              onChange={(e) => onFieldChange("twitterImage", e.target.value)}
              placeholder="https://example.com/images/twitter-card.jpg"
            />
          </div>

          {/* Schema JSON */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Structured Data (Schema.org JSON-LD)
            </h4>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Schema JSON
              </label>
              <textarea
                value={formData.schemaJson}
                onChange={(e) => onFieldChange("schemaJson", e.target.value)}
                placeholder='{"@context": "https://schema.org", "@type": "BlogPosting", ...}'
                rows={6}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              />
              <p className="mt-1 text-xs text-gray-500">
                Valid JSON-LD structured data for rich snippets
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
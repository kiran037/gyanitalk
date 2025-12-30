"use client";

import { useState, useEffect } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import {
  Calendar,
  Eye,
  User,
  ArrowLeft,
  Tag,
  Share2,
  ChevronRight,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import { motion, useReducedMotion } from "framer-motion";

/* ================= TYPES ================= */

interface BlogDetailClientProps {
  blog: Blog;
  relatedBlogs: RelatedBlog[];
  authorBlogs: AuthorBlog[];
  navigation: Navigation;
}

interface Blog {
  id: string;
  title: string;
  blogImage: string;
  previewImage?: string | null;
  description: string;
  author: string;
  postedOn: string;
  viewer: string;
  category: {
    id: string;
    name: string;
  } | null;
  seo: {
    readingTime: number;
    wordCount: number;
    excerpt: string;
    shareUrls: {
      facebook: string;
      twitter: string;
      linkedin: string;
      whatsapp: string;
      pinterest: string;
      email: string;
    };
  };
}

interface RelatedBlog {
  id: string;
  title: string;
  slug?: string;
  blogImage: string;
  author: string;
  postedOn: string;
  viewer: string;
  excerpt: string;
}

interface AuthorBlog {
  id: string;
  title: string;
  slug?: string;
  blogImage: string;
  postedOn: string;
}

interface Navigation {
  prev: {
    id: string;
    title: string;
    slug?: string;
  } | null;
  next: {
    id: string;
    title: string;
    slug?: string;
  } | null;
}

/* ================= COMPONENT ================= */

export default function BlogDetailClient({
  blog,
  relatedBlogs,
  authorBlogs,
  navigation,
}: BlogDetailClientProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const prefersReducedMotion = useReducedMotion();
  /* ================= HELPERS ================= */

  const convertTiptapJsonToHtml = (jsonString: string): string => {
    try {
      const json = JSON.parse(jsonString);

      if (!json || !json.content) return jsonString; // Return as-is if not valid JSON

      const convertNode = (node: any): string => {
        if (!node) return "";

        // Handle text nodes
        if (node.type === "text") {
          let text = node.text || "";

          // Apply marks (bold, italic, etc.)
          if (node.marks) {
            node.marks.forEach((mark: any) => {
              if (mark.type === "bold") text = `<strong>${text}</strong>`;
              if (mark.type === "italic") text = `<em>${text}</em>`;
              if (mark.type === "strike") text = `<s>${text}</s>`;
              if (mark.type === "code") text = `<code>${text}</code>`;
              if (mark.type === "link")
                text = `<a href="${mark.attrs?.href || "#"}">${text}</a>`;
              if (mark.type === "textStyle") {
                let style = "";
                if (mark.attrs?.color) style += `color: ${mark.attrs.color};`;
                if (mark.attrs?.fontSize)
                  style += `font-size: ${mark.attrs.fontSize};`;
                if (style) text = `<span style="${style}">${text}</span>`;
              }
              if (mark.type === "highlight") {
                text = `<mark style="background-color: ${mark.attrs?.color || "#ffff00"}">${text}</mark>`;
              }
            });
          }

          return text;
        }

        // Handle block nodes
        const content = node.content?.map(convertNode).join("") || "";
        const attrs = node.attrs || {};

        switch (node.type) {
          case "doc":
            return content;

          case "paragraph":
            const textAlign = attrs.textAlign
              ? `text-align: ${attrs.textAlign};`
              : "";
            return `<p style="${textAlign}">${content || "<br>"}</p>`;

          case "heading":
            const level = attrs.level || 1;
            return `<h${level}>${content}</h${level}>`;

          case "bulletList":
            return `<ul>${content}</ul>`;

          case "orderedList":
            return `<ol>${content}</ol>`;

          case "listItem":
            return `<li>${content}</li>`;

          case "blockquote":
            return `<blockquote>${content}</blockquote>`;

          case "codeBlock":
            return `<pre><code>${content}</code></pre>`;

          case "horizontalRule":
            return "<hr>";

          case "hardBreak":
            return "<br>";

          case "image":
            const imgStyle = [];
            if (attrs.width) imgStyle.push(`width: ${attrs.width}px`);
            if (attrs.borderRadius)
              imgStyle.push(`border-radius: ${attrs.borderRadius}px`);

            imgStyle.push("max-width: 100%");
            imgStyle.push("height: auto");

            let imgContainerStyle = "margin: 16px 0; max-width: 100%;";
            let containerClass = "blog-image-container";

            if (attrs.float === "left") {
              imgContainerStyle +=
                " float: left; margin-right: 16px; margin-bottom: 8px; clear: left;";
              containerClass += " blog-image-float-left";
              // Add width constraint for floated images
              if (attrs.width) {
                imgContainerStyle += ` width: min(${attrs.width}px, 100%);`;
              }
            } else if (attrs.float === "right") {
              imgContainerStyle +=
                " float: right; margin-left: 16px; margin-bottom: 8px; clear: right;";
              containerClass += " blog-image-float-right";
              // Add width constraint for floated images
              if (attrs.width) {
                imgContainerStyle += ` width: min(${attrs.width}px, 100%);`;
              }
            } else if (attrs.float === "center") {
              imgContainerStyle +=
                " display: block; margin: 16px auto; text-align: center;";
              containerClass += " blog-image-center";
              // Add width constraint for centered images
              if (attrs.width) {
                imgContainerStyle += ` width: min(${attrs.width}px, 100%);`;
              }
            } else {
              // Handle "none" - default block
              imgContainerStyle += " display: block;";
              if (attrs.width) {
                imgContainerStyle += ` width: min(${attrs.width}px, 100%);`;
              }
            }

            const imgHtml = `<img src="${attrs.src}" alt="${attrs.alt || ""}" style="${imgStyle.join("; ")}" />`;
            const captionHtml = attrs.caption
              ? `<p style="font-size: 13px; color: #666; text-align: center; font-style: italic; margin-top: 8px; line-height: 1.4;">${attrs.caption}</p>`
              : "";

            return `<div class="${containerClass}" style="${imgContainerStyle}">${imgHtml}${captionHtml}</div>`;

          default:
            return content;
        }
      };

      return convertNode(json);
    } catch (e) {
      // If parsing fails, assume it's already HTML
      return jsonString;
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const copyToClipboard = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    if (!blog?.seo?.shareUrls) return;
    const url = blog.seo.shareUrls[platform as keyof typeof blog.seo.shareUrls];
    if (url)
      window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  /* ================= UI ================= */

  if (!blog) {
    return (
      <LandingWrapper>
        <div className="flex min-h-screen items-center justify-center px-4">
          <motion.div
            className="max-w-md text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-gray-400" />
            <h2 className="mb-2 text-2xl font-bold">Article Not Found</h2>
            <p className="mb-6 text-gray-600">{error}</p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3 text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </motion.div>
        </div>
      </LandingWrapper>
    );
  }

  return (
    <LandingWrapper>
      {/* Hero Section */}
      <section className="px-4 pb-6 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <motion.nav
            className="mb-5 flex items-center gap-2 text-xs sm:mb-6 sm:text-sm"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/blog"
              className="text-gray-500 transition-colors hover:text-[#FF6B35]"
            >
              Blog
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {blog.category && (
              <>
                <Link
                  href={`/blog?categoryId=${blog.category.id}`}
                  className="max-w-[120px] truncate text-gray-500 transition-colors hover:text-[#FF6B35]"
                >
                  {blog.category.name}
                </Link>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </>
            )}
            <span className="max-w-[160px] truncate font-medium text-gray-900 dark:text-white sm:max-w-[260px]">
              {blog.title}
            </span>
          </motion.nav>

          {/* Category Badge */}
          {blog.category && (
            <motion.div
              className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-[#FF6B35]/10 px-3 py-1 text-xs font-semibold text-[#FF6B35] sm:mb-4 sm:text-sm"
              initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Tag className="h-3.5 w-3.5" />
              {blog.category.name}
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            className="mb-4 text-2xl font-bold leading-tight text-gray-900 dark:text-white sm:mb-6 sm:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {blog.title}
          </motion.h1>

          {/* Meta + Share */}
          <motion.div
            className="mb-6 flex flex-wrap items-center gap-4 border-b border-gray-200/60 pb-5 dark:border-gray-700/60 sm:mb-8 sm:pb-6"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6B35]/10">
                <User className="h-4 w-4 text-[#FF6B35]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 sm:text-xs">By</p>
                <p className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                  {blog.author}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-600 dark:text-gray-400 sm:text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(blog.postedOn)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{blog.seo.readingTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{blog.viewer}</span>
              </div>
            </div>

            {/* Share Button */}
            <div className="relative ml-auto">
              <motion.button
                aria-label="Share this article"
                onClick={() => setShowShareMenu((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg border border-gray-200/60 bg-white/60 px-3 py-1.5 text-xs font-medium text-gray-700 backdrop-blur-sm transition-all hover:border-[#FF6B35]/50 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300 sm:text-sm"
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </motion.button>

              {showShareMenu && (
                <motion.div
                  className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-gray-200/60 bg-white/95 py-2 shadow-lg backdrop-blur-md dark:border-gray-700/60 dark:bg-white/10"
                  initial={{
                    opacity: 0,
                    scale: prefersReducedMotion ? 1 : 0.9,
                    y: prefersReducedMotion ? 0 : -10,
                  }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                >
                  {[
                    { name: "Facebook", icon: Facebook, action: "facebook" },
                    { name: "Twitter", icon: Twitter, action: "twitter" },
                    { name: "LinkedIn", icon: Linkedin, action: "linkedin" },
                  ].map((platform) => (
                    <button
                      aria-label={`Share on ${platform.name}`}
                      key={platform.action}
                      onClick={() => handleShare(platform.action)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50/80 dark:text-gray-300 dark:hover:bg-gray-800/50"
                    >
                      <platform.icon className="h-3.5 w-3.5" />
                      <span>{platform.name}</span>
                    </button>
                  ))}
                  <button
                    aria-label="Copy article link"
                    onClick={copyToClipboard}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50/80 dark:text-gray-300 dark:hover:bg-gray-800/50"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>{copied ? "Copied!" : "Copy Link"}</span>
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Featured Image */}
          <motion.div
            className="relative mb-8 h-[220px] overflow-hidden rounded-2xl sm:mb-10 sm:h-[320px] lg:h-[420px]"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <img
              src={avatar(blog.previewImage || blog.blogImage)}
              alt={blog.title}
              className="h-full w-full object-cover"
              loading="eager"
              decoding="async"
              width={1200}
              height={630}
            />
          </motion.div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.article
            className="prose prose-base sm:prose-lg dark:prose-invert max-w-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <style jsx global>{`
              .blog-content {
                font-family:
                  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                  "Helvetica Neue", Arial, sans-serif;
                line-height: 1.8;
                color: #374151;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }

              .dark .blog-content {
                color: #d1d5db;
              }

              .blog-content p {
                margin-bottom: 1.25rem;
                font-size: 0.98rem;
                line-height: 1.8;
              }

              @media (min-width: 640px) {
                .blog-content p {
                  font-size: 1.0625rem;
                }
              }

              .blog-content h2 {
                font-size: 1.5rem;
                font-weight: 700;
                margin-top: 2.5rem;
                margin-bottom: 1.1rem;
                color: #111827;
              }

              .dark .blog-content h2 {
                color: #f9fafb;
              }

              .blog-content h3 {
                font-size: 1.3rem;
                font-weight: 700;
                margin-top: 2.2rem;
                margin-bottom: 0.9rem;
                color: #1f2937;
              }

              .dark .blog-content h3 {
                color: #f3f4f6;
              }

              .blog-content h4 {
                font-size: 1.15rem;
                font-weight: 600;
                margin-top: 1.8rem;
                margin-bottom: 0.75rem;
                color: #374151;
              }

              .dark .blog-content h4 {
                color: #e5e7eb;
              }

              .blog-content ul,
              .blog-content ol {
                margin-bottom: 1.25rem;
                padding-left: 1.25rem;
              }

              .blog-content li {
                margin-bottom: 0.6rem;
                font-size: 0.98rem;
              }

              .blog-content ul li::marker {
                color: #ff6b35;
              }

              .blog-content ol li::marker {
                color: #ff6b35;
                font-weight: 600;
              }

              .blog-content strong,
              .blog-content b {
                color: #111827;
                font-weight: 600;
              }

              .dark .blog-content strong,
              .dark .blog-content b {
                color: #f9fafb;
              }

              .blog-content a {
                color: #ff6b35;
                text-decoration: underline;
                text-underline-offset: 3px;
                transition: color 0.2s;
                word-break: break-word;
              }

              .blog-content a:hover {
                color: #ff8c61;
              }

              .blog-content blockquote {
                border-left: 4px solid #ff6b35;
                margin: 2rem 0;
                padding: 1.25rem 1.5rem;
                font-style: italic;
                color: #4b5563;
                background: #fff7ed;
                border-radius: 0.75rem;
              }

              .dark .blog-content blockquote {
                background: #1f2937;
                color: #d1d5db;
              }

              /* Image container styles */
              .blog-content .blog-image-container {
                position: relative;
                display: block;
                max-width: 100%;
              }

              .blog-content .blog-image-container img {
                display: block;
                max-width: 100%;
                height: auto;
                border-radius: 1rem;
                margin: 0;
              }

              .blog-content .blog-image-float-left {
                float: left;
                margin-right: 16px;
                margin-bottom: 8px;
                clear: left;
              }

              .blog-content .blog-image-float-right {
                float: right;
                margin-left: 16px;
                margin-bottom: 8px;
                clear: right;
              }

              .blog-content .blog-image-center {
                float: none;
                margin-left: auto;
                margin-right: auto;
                margin-bottom: 16px;
                text-align: center;
              }

              /* Fallback for images without container */
              .blog-content img:not(.blog-image-container img) {
                border-radius: 1rem;
                max-width: 100%;
                height: auto;
                display: block;
                margin: 1.75rem 0;
              }

              .blog-content hr {
                margin: 2.5rem 0;
                border: none;
                height: 1px;
                background: linear-gradient(
                  90deg,
                  transparent,
                  #e5e7eb,
                  transparent
                );
              }

              .dark .blog-content hr {
                background: linear-gradient(
                  90deg,
                  transparent,
                  #374151,
                  transparent
                );
              }

              .blog-content code {
                background: #f3f4f6;
                padding: 0.15rem 0.4rem;
                border-radius: 0.25rem;
                font-size: 0.85rem;
                color: #ff6b35;
                font-family: "Courier New", monospace;
              }

              .dark .blog-content code {
                background: #1f2937;
                color: #ff8c61;
              }

              .blog-content pre {
                background: #1f2937;
                padding: 1.25rem;
                border-radius: 0.75rem;
                overflow-x: auto;
                margin: 1.75rem 0;
              }

              .blog-content pre code {
                background: transparent;
                color: #e5e7eb;
                padding: 0;
              }

              .blog-content > p:first-of-type::first-letter {
                font-size: 3rem;
                font-weight: 700;
                float: left;
                line-height: 1;
                margin-right: 0.5rem;
                color: #ff6b35;
              }

              @media (min-width: 640px) {
                .blog-content > p:first-of-type::first-letter {
                  font-size: 3.5rem;
                }
              }

              .blog-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 2rem 0;
                font-size: 0.9rem;
              }

              .blog-content th,
              .blog-content td {
                border: 1px solid #e5e7eb;
                padding: 0.6rem;
                text-align: left;
              }

              .dark .blog-content th,
              .dark .blog-content td {
                border-color: #374151;
              }

              .blog-content th {
                background: #f9fafb;
                font-weight: 600;
              }

              .dark .blog-content th {
                background: #1f2937;
              }

              .blog-content::after {
                content: "";
                display: table;
                clear: both;
              }

              /* Mobile: Convert floats to block on small screens */
              @media (max-width: 640px) {
                .blog-content .blog-image-float-left,
                .blog-content .blog-image-float-right {
                  float: none !important;
                  margin-left: auto !important;
                  margin-right: auto !important;
                  margin-bottom: 16px !important;
                  clear: both !important;
                }
              }
            `}</style>

            <div
              className="blog-content"
              dangerouslySetInnerHTML={{
                __html: convertTiptapJsonToHtml(blog.description),
              }}
            />
          </motion.article>

          {/* Article Footer */}
          <motion.div
            className="mt-8 border-t border-gray-200/60 pt-5 dark:border-gray-700/60 sm:mt-10 sm:pt-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                {blog.seo.wordCount.toLocaleString()} words •{" "}
                {formatDate(blog.postedOn)}
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-xs font-medium text-[#FF6B35] transition-colors hover:text-[#FF6B35]/80 sm:text-sm"
              >
                Back to top ↑
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Author's Other Articles */}
      {authorBlogs.length > 0 && (
        <section className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 px-4 py-10 dark:from-white/[0.02] dark:to-white/[0.02] sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              className="mb-5 flex items-center gap-2 sm:mb-6"
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <User className="h-5 w-5 text-[#FF6B35]" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                More from {blog.author}
              </h2>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {authorBlogs.map((authorBlog, index) => (
                <motion.div
                  key={authorBlog.id}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link
                    href={`/blog/${authorBlog.slug || authorBlog.id}`}
                    className="group block h-full"
                  >
                    <motion.div
                      className="h-full overflow-hidden rounded-xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
                      whileHover={
                        prefersReducedMotion
                          ? {}
                          : {
                              scale: 1.02,
                              borderColor: "rgba(255, 107, 53, 0.5)",
                            }
                      }
                    >
                      <div className="relative h-28 overflow-hidden sm:h-32">
                        <img
                          src={avatar(authorBlog.blogImage)}
                          alt={authorBlog.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="mb-1.5 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#FF6B35] dark:text-white">
                          {authorBlog.title}
                        </h3>
                        <p className="text-[11px] text-gray-500 sm:text-xs">
                          {formatDate(authorBlog.postedOn)}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Articles */}
      {relatedBlogs.length > 0 && (
        <section className="px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              className="mb-5 flex items-center gap-2 sm:mb-6"
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <TrendingUp className="h-5 w-5 text-[#FF6B35]" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                Related Articles
              </h2>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {relatedBlogs.map((relatedBlog, index) => (
                <motion.div
                  key={relatedBlog.id}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link
                    href={`/blog/${relatedBlog.slug || relatedBlog.id}`}
                    className="group block h-full"
                  >
                    <motion.article
                      className="h-full overflow-hidden rounded-xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
                      whileHover={
                        prefersReducedMotion
                          ? {}
                          : {
                              scale: 1.02,
                              borderColor: "rgba(255, 107, 53, 0.5)",
                              boxShadow: "0 10px 30px rgba(255, 107, 53, 0.15)",
                            }
                      }
                    >
                      <div className="relative h-32 overflow-hidden sm:h-40">
                        <img
                          src={avatar(relatedBlog.blogImage)}
                          alt={relatedBlog.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="mb-2 line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-[#FF6B35] dark:text-white sm:text-base">
                          {relatedBlog.title}
                        </h3>
                        <p className="mb-2 line-clamp-2 text-[11px] text-gray-600 dark:text-gray-400 sm:text-xs">
                          {relatedBlog.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 sm:text-xs">
                          <span className="max-w-[120px] truncate">
                            {relatedBlog.author}
                          </span>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{relatedBlog.viewer}</span>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Navigation */}
      {(navigation.prev || navigation.next) && (
        <section className="border-t border-gray-200/60 px-4 py-8 dark:border-gray-700/60 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {navigation.prev && (
                <motion.div
                  initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={`/blog/${navigation.prev.slug || navigation.prev.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-gray-200/60 bg-white/60 p-3 backdrop-blur-sm transition-all hover:border-[#FF6B35]/50 dark:border-gray-700/60 dark:bg-white/5 sm:p-4"
                  >
                    <ArrowLeft className="h-4 w-4 flex-shrink-0 text-gray-400 transition-colors group-hover:text-[#FF6B35]" />
                    <div className="min-w-0 text-left">
                      <p className="mb-1 text-[10px] text-gray-500 sm:text-xs">
                        Previous
                      </p>
                      <p className="line-clamp-1 text-xs font-semibold text-gray-900 transition-colors group-hover:text-[#FF6B35] dark:text-white sm:text-sm">
                        {navigation.prev.title}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              )}
              {navigation.next && (
                <motion.div
                  initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={!navigation.prev ? "sm:col-start-2" : ""}
                >
                  <Link
                    href={`/blog/${navigation.next.slug || navigation.next.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-gray-200/60 bg-white/60 p-3 backdrop-blur-sm transition-all hover:border-[#FF6B35]/50 dark:border-gray-700/60 dark:bg-white/5 sm:p-4"
                  >
                    <div className="min-w-0 flex-1 text-right">
                      <p className="mb-1 text-[10px] text-gray-500 sm:text-xs">
                        Next
                      </p>
                      <p className="line-clamp-1 text-xs font-semibold text-gray-900 transition-colors group-hover:text-[#FF6B35] dark:text-white sm:text-sm">
                        {navigation.next.title}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 transition-colors group-hover:text-[#FF6B35]" />
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog CTA */}
      <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200/60 bg-white/60 px-5 py-2.5 text-sm font-medium text-gray-900 backdrop-blur-sm transition-all hover:scale-105 hover:bg-gray-50 dark:border-gray-700/60 dark:bg-white/5 dark:text-white dark:hover:bg-gray-800/50 sm:px-6 sm:py-3 sm:text-base"
            >
              <ArrowLeft className="h-4 w-4" />
              Explore More Articles
            </Link>
          </motion.div>
        </div>
      </section>
    </LandingWrapper>
  );
}

"use client";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

import { useState, useEffect, useMemo } from "react";
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
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

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

/* ================= HELPER FUNCTIONS ================= */

// Robust function to handle Tiptap JSON, HTML strings, or Plain Text
const processContent = (content: string): string => {
  if (!content) return "";

  // 1. Try to detect if it's a Tiptap JSON string
  const trimmed = content.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const json = JSON.parse(trimmed);
      // Check if it looks like a Tiptap doc
      if (json.type === "doc" && Array.isArray(json.content)) {
        return convertTiptapNodeToHtml(json);
      }
    } catch (e) {
      // Failed to parse JSON, fall through to return original string
      console.warn("Failed to parse potential JSON content", e);
    }
  }

  // 2. If not JSON, return as is (assuming HTML)
  return content;
};

// Recursive Tiptap converter
const convertTiptapNodeToHtml = (node: any): string => {
  if (!node) return "";

  // Handle text nodes
  if (node.type === "text") {
    let text = node.text || "";
    // XSS protection could go here if needed, but assuming trusted backend
    
    if (node.marks) {
      node.marks.forEach((mark: any) => {
        if (mark.type === "bold") text = `<strong>${text}</strong>`;
        if (mark.type === "italic") text = `<em>${text}</em>`;
        if (mark.type === "strike") text = `<s>${text}</s>`;
        if (mark.type === "code") text = `<code>${text}</code>`;
        if (mark.type === "link")
          text = `<a href="${mark.attrs?.href || "#"}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        if (mark.type === "textStyle") {
          let style = "";
          if (mark.attrs?.color) style += `color: ${mark.attrs.color};`;
          if (style) text = `<span style="${style}">${text}</span>`;
        }
        if (mark.type === "highlight") {
          text = `<mark style="background-color: ${mark.attrs?.color || "#ffff00"}">${text}</mark>`;
        }
      });
    }
    return text;
  }

  const content = node.content?.map(convertTiptapNodeToHtml).join("") || "";
  const attrs = node.attrs || {};

  switch (node.type) {
    case "doc": return content;
    case "paragraph":
      const style = attrs.textAlign ? `text-align: ${attrs.textAlign};` : "";
      return `<p style="${style}">${content || "<br>"}</p>`;
    case "heading": return `<h${attrs.level || 1}>${content}</h${attrs.level || 1}>`;
    case "bulletList": return `<ul>${content}</ul>`;
    case "orderedList": return `<ol>${content}</ol>`;
    case "listItem": return `<li>${content}</li>`;
    case "blockquote": return `<blockquote>${content}</blockquote>`;
    case "codeBlock": return `<pre><code>${content}</code></pre>`;
    case "horizontalRule": return "<hr>";
    case "hardBreak": return "<br>";
    case "image":
      // Advanced Image Handling for Tiptap
      const imgStyle = [`max-width: 100%`, `height: auto`];
      if (attrs.width) imgStyle.push(`width: ${attrs.width}px`);
      if (attrs.borderRadius) imgStyle.push(`border-radius: ${attrs.borderRadius}px`);
      
      let containerClass = "blog-image-wrapper";
      let containerStyle = "margin: 2rem 0; clear: both;";

      // Handle Float
      if (attrs.float === "left") {
        containerClass += " float-left";
        containerStyle += " float: left; margin-right: 1.5rem; margin-bottom: 1rem;";
      } else if (attrs.float === "right") {
        containerClass += " float-right";
        containerStyle += " float: right; margin-left: 1.5rem; margin-bottom: 1rem;";
      } else {
        containerClass += " block-center";
        containerStyle += " display: block; margin-left: auto; margin-right: auto; text-align: center;";
      }

      const imgTag = `<img src="${attrs.src}" alt="${attrs.alt || ''}" style="${imgStyle.join(';')}" loading="lazy" />`;
      const captionTag = attrs.caption 
        ? `<figcaption style="font-size: 0.85rem; color: #6b7280; text-align: center; margin-top: 0.5rem; font-style: italic;">${attrs.caption}</figcaption>` 
        : "";

      return `<figure class="${containerClass}" style="${containerStyle}">${imgTag}${captionTag}</figure>`;
      
    default: return content;
  }
};

/* ================= COMPONENT ================= */

export default function BlogDetailClient({
  blog,
  relatedBlogs,
  authorBlogs,
  navigation,
}: BlogDetailClientProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Process content once on load to avoid re-parsing on every render
  const processedContent = useMemo(() => processContent(blog?.description || ""), [blog]);

  useEffect(() => {
    if (!blog) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "blog_schema",
      schema_type: "blog",
      title: blog.title,
      description: blog.seo?.excerpt || "",
      url: typeof window !== "undefined" ? window.location.href : "",
      author: blog.author,
      publish_date: blog.postedOn,
      image: avatar(blog.previewImage || blog.blogImage),
      breadcrumb_home: "Home",
      breadcrumb_home_url: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
      breadcrumb_parent: "Blog",
      breadcrumb_parent_url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog`,
      breadcrumb_current: blog.title,
      ...(blog.category && {
        category: blog.category.name,
        category_id: blog.category.id,
      }),
    });
  }, [blog]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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
    if (url) window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
    setShowShareMenu(false);
  };

  // Helper function to strip HTML/JSON and get plain text
  const stripHtml = (html: string) => {
    // If it's JSON from TipTap editor
    const trimmedHtml = html.trim();
    if (trimmedHtml.startsWith("{") && trimmedHtml.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmedHtml);
        if (parsed && parsed.type === "doc" && parsed.content) {
          const extractText = (node: any): string => {
            if (node.type === "text") return node.text || "";
            if (node.content) return node.content.map(extractText).join(" ");
            return "";
          };
          return parsed.content.map(extractText).join(" ").replace(/\s+/g, " ").trim();
        }
      } catch (e) { /* Fallback to HTML stripping */ }
    }
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  };

  const truncateText = (text: string, max: number) => {
    const clean = stripHtml(text);
    return clean.length <= max ? clean : clean.slice(0, max).trim() + "...";
  };

  if (!blog) {
    return (
      <LandingWrapper>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Post Not Found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The article you are looking for does not exist or has been removed.</p>
          <Link href="/blog" className="mt-6 rounded-full bg-[#FF6B35] px-6 py-2.5 text-sm font-medium text-white transition-transform hover:scale-105">
            Back to Blog
          </Link>
        </div>
      </LandingWrapper>
    );
  }

  return (
    <LandingWrapper>
      <article className="min-h-screen">
        {/* === HERO SECTION === */}
        <section className="relative px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-4xl">
            
            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 sm:text-sm"
            >
              <Link href="/" className="hover:text-[#FF6B35]">Home</Link>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              <Link href="/blog" className="hover:text-[#FF6B35]">Blog</Link>
              {blog.category && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  <Link href={`/blog?category=${blog.category.id}`} className="hover:text-[#FF6B35]">{blog.category.name}</Link>
                </>
              )}
            </motion.nav>

            {/* Title & Category */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {blog.category && (
                <span className="mb-3 inline-block rounded-full bg-orange-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FF6B35] dark:bg-orange-900/20">
                  {blog.category.name}
                </span>
              )}
              <h1 className="text-3xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:leading-[1.15]">
                {blog.title}
              </h1>
            </motion.div>

            {/* Author & Meta Data */}
            <motion.div 
              className="mt-6 flex flex-col gap-4 border-b border-gray-100 pb-6 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Left: Author Info */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-50 text-[#FF6B35] dark:from-gray-800 dark:to-gray-700">
                  <User className="h-5 w-5" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">{blog.author}</p>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-xs">
                    <span>{formatDate(blog.postedOn)}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                    <span>{blog.seo.readingTime} min read</span>
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  <Eye className="h-3.5 w-3.5" />
                  {blog.viewer}
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="group flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 transition-all hover:border-[#FF6B35] hover:text-[#FF6B35] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline">Share</span>
                  </button>

                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="p-1">
                          {[
                            { name: "Facebook", icon: Facebook, id: "facebook" },
                            { name: "Twitter", icon: Twitter, id: "twitter" },
                            { name: "LinkedIn", icon: Linkedin, id: "linkedin" },
                          ].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleShare(item.id)}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                              <item.icon className="h-4 w-4" />
                              {item.name}
                            </button>
                          ))}
                          <div className="my-1 h-px bg-gray-100 dark:bg-gray-700" />
                          <button
                            onClick={copyToClipboard}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                          >
                            {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
                            {copied ? "Copied!" : "Copy Link"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 sm:mt-10"
            >
              <img
                src={avatar(blog.previewImage || blog.blogImage)}
                alt={blog.title}
                className="h-full w-full object-cover transition-transform hover:scale-105 duration-700"
                loading="eager"
              />
            </motion.div>
          </div>
        </section>

        {/* === CONTENT SECTION === */}
        <section className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="blog-content prose prose-base dark:prose-invert sm:prose-lg max-w-none text-gray-800 dark:text-gray-200 marker:text-[#FF6B35]"
            >
              {/* GLOBAL STYLES FOR DYNAMIC HTML */}
              <style jsx global>{`
                .blog-content {
                  line-height: 1.8;
                  font-feature-settings: "rlig" 1, "calt" 1;
                }
                
                /* Typography Overrides */
                .blog-content h2 { margin-top: 2.5em; margin-bottom: 0.8em; font-weight: 800; color: #1a202c; letter-spacing: -0.02em; }
                .blog-content h3 { margin-top: 2em; margin-bottom: 0.6em; font-weight: 700; color: #2d3748; }
                .blog-content p { margin-bottom: 1.5em; letter-spacing: 0.01em; }
                .blog-content a { color: #FF6B35; text-decoration: underline; text-decoration-color: rgba(255, 107, 53, 0.4); text-underline-offset: 4px; transition: all 0.2s; }
                .blog-content a:hover { color: #e65a2b; text-decoration-color: #e65a2b; }
                .blog-content blockquote { border-left-color: #FF6B35; background: #fff7ed; padding: 1rem 1.5rem; font-style: italic; border-radius: 0 8px 8px 0; }
                
                /* Dark Mode Overrides */
                .dark .blog-content h2 { color: #f7fafc; }
                .dark .blog-content h3 { color: #edf2f7; }
                .dark .blog-content blockquote { background: #1f2937; color: #e2e8f0; }

                /* Images & Floats - Critical for Mobile Responsiveness */
                .blog-image-wrapper { position: relative; margin: 2rem 0; }
                .blog-image-wrapper img { border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                
                @media (min-width: 768px) {
                  .float-left { float: left; margin-right: 2rem; margin-bottom: 1rem; max-width: 50%; }
                  .float-right { float: right; margin-left: 2rem; margin-bottom: 1rem; max-width: 50%; }
                }
                
                @media (max-width: 767px) {
                  /* Force images to stack on mobile */
                  .float-left, .float-right { float: none !important; margin: 1.5rem auto !important; max-width: 100% !important; display: block !important; }
                  .blog-image-wrapper { text-align: center; }
                }

                /* Tables */
                .blog-content table { width: 100%; overflow-x: auto; display: block; border-collapse: collapse; margin: 2em 0; }
                .blog-content th, .blog-content td { padding: 0.75em; border: 1px solid #e2e8f0; }
                .dark .blog-content th, .dark .blog-content td { border-color: #4a5568; }
                .blog-content th { background-color: #f7fafc; font-weight: 600; }
                .dark .blog-content th { background-color: #2d3748; }
              `}</style>

              <div dangerouslySetInnerHTML={{ __html: processedContent }} />
            </motion.div>

            {/* Tags/Footer */}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-8 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#FF6B35]" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {blog.category?.name || "General"}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Word Count: {blog.seo.wordCount}
              </p>
            </div>
          </div>
        </section>

        {/* === RELATED & AUTHOR CONTENT === */}
        <section className="bg-gray-50/80 py-16 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            
            {/* 1. Author's Other Posts */}
            {authorBlogs.length > 0 && (
              <div className="mb-16">
                <div className="mb-8 flex items-center gap-3">
                  <div className="h-8 w-1 rounded-full bg-[#FF6B35]" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">More from {blog.author}</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {authorBlogs.map((item) => (
                    <Link href={`/blog/${item.slug || item.id}`} key={item.id} className="group flex flex-col gap-4">
                      <div className="aspect-[3/2] overflow-hidden rounded-xl bg-gray-200">
                        <img 
                          src={avatar(item.blogImage)} 
                          alt={item.title} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div>
                        <h4 className="line-clamp-2 text-base font-bold text-gray-900 group-hover:text-[#FF6B35] dark:text-white">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-xs text-gray-500">{formatDate(item.postedOn)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Related Posts */}
            {relatedBlogs.length > 0 && (
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <div className="h-8 w-1 rounded-full bg-[#FF6B35]" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">You Might Also Like</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedBlogs.map((item) => (
                    <Link href={`/blog/${item.slug || item.id}`} key={item.id} className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                      <div className="aspect-[16/9] w-full overflow-hidden">
                        <img 
                          src={avatar(item.blogImage)} 
                          alt={item.title} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                          <span>{item.author}</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {item.viewer}</span>
                        </div>
                        <h4 className="mb-2 line-clamp-2 flex-1 text-lg font-bold text-gray-900 group-hover:text-[#FF6B35] dark:text-white">
                          {item.title}
                        </h4>
                        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                          {truncateText(item.excerpt, 120)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* === BOTTOM NAVIGATION === */}
        {(navigation.prev || navigation.next) && (
          <section className="border-t border-gray-100 bg-white px-4 py-8 dark:border-gray-800 dark:bg-black">
            <div className="mx-auto max-w-4xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                {navigation.prev ? (
                  <Link 
                    href={`/blog/${navigation.prev.slug || navigation.prev.id}`}
                    className="group flex flex-1 items-center gap-4 rounded-xl border border-gray-100 p-4 transition-colors hover:border-[#FF6B35]/30 hover:bg-orange-50/50 dark:border-gray-800 dark:hover:bg-gray-800"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-400 transition-transform group-hover:-translate-x-1 group-hover:text-[#FF6B35]" />
                    <div>
                      <span className="text-xs font-medium uppercase text-gray-400">Previous Article</span>
                      <p className="mt-1 line-clamp-1 text-sm font-bold text-gray-900 dark:text-white">{navigation.prev.title}</p>
                    </div>
                  </Link>
                ) : <div className="flex-1" />}

                {navigation.next && (
                  <Link 
                    href={`/blog/${navigation.next.slug || navigation.next.id}`}
                    className="group flex flex-1 items-center justify-end gap-4 rounded-xl border border-gray-100 p-4 text-right transition-colors hover:border-[#FF6B35]/30 hover:bg-orange-50/50 dark:border-gray-800 dark:hover:bg-gray-800"
                  >
                    <div>
                      <span className="text-xs font-medium uppercase text-gray-400">Next Article</span>
                      <p className="mt-1 line-clamp-1 text-sm font-bold text-gray-900 dark:text-white">{navigation.next.title}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-[#FF6B35]" />
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}
      </article>
    </LandingWrapper>
  );
}
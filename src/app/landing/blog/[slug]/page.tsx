"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import Head from "next/head";
import { motion, useReducedMotion } from "framer-motion";

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
    readingTime: number;
    wordCount: number;
    excerpt: string;
    schemaJson: string;
    breadcrumbSchema: string;
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

export default function BlogDetailPage() {
  const params = useParams();
  const slugParam = params?.slug;
  const slug =
    typeof slugParam === "string" ? slugParam : Array.isArray(slugParam) ? slugParam[0] : "";

  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlog[]>([]);
  const [authorBlogs, setAuthorBlogs] = useState<AuthorBlog[]>([]);
  const [navigation, setNavigation] = useState<Navigation>({
    prev: null,
    next: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();

    const fetchBlogDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/landing/blog/${slug}`, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (data.success) {
          setBlog(data.data);
          setRelatedBlogs(data.relatedBlogs || []);
          setAuthorBlogs(data.authorBlogs || []);
          setNavigation(data.navigation || { prev: null, next: null });
        } else {
          setBlog(null);
          setError(data.error || "Blog not found");
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Failed to fetch blog:", err);
        setBlog(null);
        setError("Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();

    return () => controller.abort();
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const copyToClipboard = () => {
    if (typeof window === "undefined") return;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    // Fallback
    const textArea = document.createElement("textarea");
    textArea.value = window.location.href;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handleShare = (platform: string) => {
    if (!blog?.seo.shareUrls || typeof window === "undefined") return;

    const urls = blog.seo.shareUrls;
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = urls.facebook;
        break;
      case "twitter":
        shareUrl = urls.twitter;
        break;
      case "linkedin":
        shareUrl = urls.linkedin;
        break;
      case "whatsapp":
        shareUrl = urls.whatsapp;
        break;
      case "email":
        shareUrl = urls.email;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  if (loading) {
    return (
      <LandingWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-[3px] border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Loading article...
            </p>
          </div>
        </div>
      </LandingWrapper>
    );
  }

  if (error || !blog) {
    return (
      <LandingWrapper>
        <div className="min-h-screen flex items-center justify-center px-4">
          <motion.div
            className="text-center max-w-md"
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Article Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || "The article you're looking for doesn't exist."}
            </p>
            <Link
              href="/landing/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white font-medium rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </motion.div>
        </div>
      </LandingWrapper>
    );
  }

  return (
    <>
      <Head>
        <title>{blog.seo.metaTitle}</title>
        <meta name="description" content={blog.seo.metaDescription} />
        <meta name="keywords" content={blog.seo.metaKeywords} />
        <link rel="canonical" href={blog.seo.canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={blog.seo.ogTitle} />
        <meta property="og:description" content={blog.seo.ogDescription} />
        <meta property="og:image" content={blog.seo.ogImage} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={blog.seo.canonicalUrl} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.seo.twitterTitle} />
        <meta name="twitter:description" content={blog.seo.twitterDescription} />
        <meta name="twitter:image" content={blog.seo.twitterImage} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: blog.seo.schemaJson }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: blog.seo.breadcrumbSchema }}
        />
      </Head>

      <LandingWrapper>
        {/* Hero Section */}
        <section className="pt-24 sm:pt-28 pb-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <motion.nav
              className="flex items-center gap-2 text-xs sm:text-sm mb-5 sm:mb-6"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link
                href="/landing/blog"
                className="text-gray-500 hover:text-[#FF6B35] transition-colors"
              >
                Blog
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {blog.category && (
                <>
                  <Link
                    href={`/landing/blog?categoryId=${blog.category.id}`}
                    className="text-gray-500 hover:text-[#FF6B35] transition-colors max-w-[120px] truncate"
                  >
                    {blog.category.name}
                  </Link>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </>
              )}
              <span className="text-gray-900 dark:text-white font-medium truncate max-w-[160px] sm:max-w-[260px]">
                {blog.title}
              </span>
            </motion.nav>

            {/* Category Badge */}
            {blog.category && (
              <motion.div
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF6B35]/10 text-[#FF6B35] text-xs sm:text-sm font-semibold rounded-lg mb-3 sm:mb-4"
                initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Tag className="w-3.5 h-3.5" />
                {blog.category.name}
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {blog.title}
            </motion.h1>

            {/* Excerpt */}
            <motion.p
              className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {blog.seo.excerpt}
            </motion.p>

            {/* Meta + Share */}
            <motion.div
              className="flex flex-wrap items-center gap-4 pb-5 sm:pb-6 mb-6 sm:mb-8 border-b border-gray-200/60 dark:border-gray-700/60"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FF6B35]/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-[#FF6B35]" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">By</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {blog.author}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(blog.postedOn)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{blog.seo.readingTime} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{blog.viewer}</span>
                </div>
              </div>

              {/* Share Button */}
              <div className="ml-auto relative">
                <motion.button
                  onClick={() => setShowShareMenu((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 hover:border-[#FF6B35]/50 rounded-lg text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium transition-all"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </motion.button>

                {showShareMenu && (
                  <motion.div
                    className="absolute right-0 mt-2 w-44 bg-white/95 dark:bg-white/10 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-lg py-2 z-50"
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
                        key={platform.action}
                        onClick={() => handleShare(platform.action)}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 text-sm transition-colors"
                      >
                        <platform.icon className="w-3.5 h-3.5" />
                        <span>{platform.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={copyToClipboard}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 text-sm transition-colors"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>{copied ? "Copied!" : "Copy Link"}</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Featured Image */}
            <motion.div
              className="relative h-[220px] sm:h-[320px] lg:h-[420px] rounded-2xl overflow-hidden mb-8 sm:mb-10"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <img
                src={avatar(blog.previewImage || blog.blogImage)}
                alt={blog.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </motion.div>
          </div>
        </section>

        {/* Blog Content */}
        <section className="pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.article
              className="prose prose-base sm:prose-lg dark:prose-invert max-w-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <style jsx global>{`
                .blog-content {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
                    Roboto, "Helvetica Neue", Arial, sans-serif;
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

                .blog-content img {
                  border-radius: 1rem;
                  margin: 1.75rem 0;
                  width: 100%;
                  height: auto;
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
              `}</style>

              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: blog.description }}
              />
            </motion.article>

            {/* Article Footer */}
            <motion.div
              className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-gray-200/60 dark:border-gray-700/60"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {blog.seo.wordCount.toLocaleString()} words •{" "}
                  {formatDate(blog.postedOn)}
                </p>
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="text-xs sm:text-sm text-[#FF6B35] hover:text-[#FF6B35]/80 font-medium transition-colors"
                >
                  Back to top ↑
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Author's Other Articles */}
        {authorBlogs.length > 0 && (
          <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-white/[0.02] dark:to-white/[0.02]">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="flex items-center gap-2 mb-5 sm:mb-6"
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <User className="w-5 h-5 text-[#FF6B35]" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  More from {blog.author}
                </h2>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {authorBlogs.map((authorBlog, index) => (
                  <motion.div
                    key={authorBlog.id}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Link
                      href={`/landing/blog/${authorBlog.slug || authorBlog.id}`}
                      className="group block h-full"
                    >
                      <motion.div
                        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden h-full"
                        whileHover={
                          prefersReducedMotion
                            ? {}
                            : { scale: 1.02, borderColor: "rgba(255, 107, 53, 0.5)" }
                        }
                      >
                        <div className="relative h-28 sm:h-32 overflow-hidden">
                          <img
                            src={avatar(authorBlog.blogImage)}
                            alt={authorBlog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors line-clamp-2 mb-1.5">
                            {authorBlog.title}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-gray-500">
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
          <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="flex items-center gap-2 mb-5 sm:mb-6"
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Related Articles
                </h2>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {relatedBlogs.map((relatedBlog, index) => (
                  <motion.div
                    key={relatedBlog.id}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Link
                      href={`/landing/blog/${relatedBlog.slug || relatedBlog.id}`}
                      className="group block h-full"
                    >
                      <motion.article
                        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden h-full"
                        whileHover={
                          prefersReducedMotion
                            ? {}
                            : {
                                scale: 1.02,
                                borderColor: "rgba(255, 107, 53, 0.5)",
                                boxShadow:
                                  "0 10px 30px rgba(255, 107, 53, 0.15)",
                              }
                        }
                      >
                        <div className="relative h-32 sm:h-40 overflow-hidden">
                          <img
                            src={avatar(relatedBlog.blogImage)}
                            alt={relatedBlog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#FF6B35] transition-colors">
                            {relatedBlog.title}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {relatedBlog.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-500">
                            <span className="truncate max-w-[120px]">
                              {relatedBlog.author}
                            </span>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
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
          <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-t border-gray-200/60 dark:border-gray-700/60">
            <div className="max-w-7xl mx-auto">
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {navigation.prev && (
                  <motion.div
                    initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href={`/landing/blog/${navigation.prev.slug || navigation.prev.id}`}
                      className="group flex items-center gap-3 p-3 sm:p-4 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl hover:border-[#FF6B35]/50 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-[#FF6B35] transition-colors flex-shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
                          Previous
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors line-clamp-1">
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
                      href={`/landing/blog/${navigation.next.slug || navigation.next.id}`}
                      className="group flex items-center gap-3 p-3 sm:p-4 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl hover:border-[#FF6B35]/50 transition-all"
                    >
                      <div className="text-right min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
                          Next
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors line-clamp-1">
                          {navigation.next.title}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#FF6B35] transition-colors flex-shrink-0" />
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Back to Blog CTA */}
        <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link
                href="/landing/blog"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white/60 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-gray-800/50 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl font-medium text-sm sm:text-base text-gray-900 dark:text-white transition-all hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                Explore More Articles
              </Link>
            </motion.div>
          </div>
        </section>
      </LandingWrapper>
    </>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { Calendar, Eye, User, ArrowLeft, Tag, Share2, ChevronRight, Clock, Facebook, Twitter, Linkedin, Link as LinkIcon, BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import Head from "next/head";
import { motion } from "framer-motion";

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
    const slug = params.slug as string;
    
    const [blog, setBlog] = useState<Blog | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlog[]>([]);
    const [authorBlogs, setAuthorBlogs] = useState<AuthorBlog[]>([]);
    const [navigation, setNavigation] = useState<Navigation>({ prev: null, next: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (slug) {
            fetchBlogDetail();
        }
    }, [slug]);

    const fetchBlogDetail = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/landing/blog/${slug}`);
            const data = await response.json();

            if (data.success) {
                setBlog(data.data);
                setRelatedBlogs(data.relatedBlogs || []);
                setAuthorBlogs(data.authorBlogs || []);
                setNavigation(data.navigation || { prev: null, next: null });
            } else {
                setError(data.error || "Blog not found");
            }
        } catch (error) {
            console.error("Failed to fetch blog:", error);
            setError("Failed to load blog");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (platform: string) => {
        if (!blog?.seo.shareUrls) return;
        
        const urls = blog.seo.shareUrls;
        let shareUrl = '';
        
        switch (platform) {
            case 'facebook':
                shareUrl = urls.facebook;
                break;
            case 'twitter':
                shareUrl = urls.twitter;
                break;
            case 'linkedin':
                shareUrl = urls.linkedin;
                break;
            case 'whatsapp':
                shareUrl = urls.whatsapp;
                break;
            case 'email':
                shareUrl = urls.email;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    if (loading) {
        return (
            <LandingWrapper>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading article...</p>
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
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="w-16 h-16 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Article Not Found</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "The article you're looking for doesn't exist."}</p>
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
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: blog.seo.schemaJson }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: blog.seo.breadcrumbSchema }} />
            </Head>

            <LandingWrapper>
                {/* Hero Section */}
                <section className="pt-24 pb-6 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Breadcrumb */}
                        <motion.nav 
                            className="flex items-center gap-2 text-sm mb-6"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Link href="/landing/blog" className="text-gray-500 hover:text-[#FF6B35] transition-colors">
                                Blog
                            </Link>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            {blog.category && (
                                <>
                                    <Link 
                                        href={`/landing/blog?categoryId=${blog.category.id}`}
                                        className="text-gray-500 hover:text-[#FF6B35] transition-colors"
                                    >
                                        {blog.category.name}
                                    </Link>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </>
                            )}
                            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
                                {blog.title}
                            </span>
                        </motion.nav>

                        {/* Category Badge */}
                        {blog.category && (
                            <motion.div 
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF6B35]/10 text-[#FF6B35] text-sm font-semibold rounded-lg mb-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Tag className="w-3.5 h-3.5" />
                                {blog.category.name}
                            </motion.div>
                        )}

                        {/* Title */}
                        <motion.h1 
                            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {blog.title}
                        </motion.h1>

                        {/* Excerpt */}
                        <motion.p 
                            className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {blog.seo.excerpt}
                        </motion.p>

                        {/* Meta Info - Compact */}
                        <motion.div 
                            className="flex flex-wrap items-center gap-4 pb-6 mb-6 border-b border-gray-200/60 dark:border-gray-700/60"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#FF6B35]/10 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-[#FF6B35]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">By</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{blog.author}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
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

                            {/* Share Button - Compact */}
                            <div className="ml-auto relative">
                                <motion.button
                                    onClick={() => setShowShareMenu(!showShareMenu)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 hover:border-[#FF6B35]/50 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Share2 className="w-3.5 h-3.5" />
                                    Share
                                </motion.button>

                                {/* Share Menu */}
                                {showShareMenu && (
                                    <motion.div 
                                        className="absolute right-0 mt-2 w-44 bg-white/90 dark:bg-white/10 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-lg py-2 z-50"
                                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                    >
                                        {[
                                            { name: 'Facebook', icon: Facebook, action: 'facebook' },
                                            { name: 'Twitter', icon: Twitter, action: 'twitter' },
                                            { name: 'LinkedIn', icon: Linkedin, action: 'linkedin' },
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
                                            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>

                        {/* Featured Image */}
                        <motion.div 
                            className="relative h-[250px] sm:h-[350px] lg:h-[450px] rounded-2xl overflow-hidden mb-10"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <img
                                src={avatar(blog.previewImage || blog.blogImage)}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </div>
                </section>

                {/* Blog Content */}
                <section className="pb-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <motion.article 
                            className="prose prose-lg dark:prose-invert max-w-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <style jsx global>{`
                                .blog-content {
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                                    line-height: 1.8;
                                    color: #374151;
                                }

                                .dark .blog-content {
                                    color: #D1D5DB;
                                }

                                .blog-content p {
                                    margin-bottom: 1.5rem;
                                    font-size: 1.0625rem;
                                    line-height: 1.8;
                                }

                                .blog-content h2 {
                                    font-size: 1.875rem;
                                    font-weight: 700;
                                    margin-top: 3rem;
                                    margin-bottom: 1.25rem;
                                    color: #111827;
                                }

                                .dark .blog-content h2 {
                                    color: #F9FAFB;
                                }

                                .blog-content h3 {
                                    font-size: 1.5rem;
                                    font-weight: 700;
                                    margin-top: 2.5rem;
                                    margin-bottom: 1rem;
                                    color: #1F2937;
                                }

                                .dark .blog-content h3 {
                                    color: #F3F4F6;
                                }

                                .blog-content h4 {
                                    font-size: 1.25rem;
                                    font-weight: 600;
                                    margin-top: 2rem;
                                    margin-bottom: 0.75rem;
                                    color: #374151;
                                }

                                .dark .blog-content h4 {
                                    color: #E5E7EB;
                                }

                                .blog-content ul, .blog-content ol {
                                    margin-bottom: 1.5rem;
                                    padding-left: 1.5rem;
                                }

                                .blog-content li {
                                    margin-bottom: 0.75rem;
                                    font-size: 1.0625rem;
                                    line-height: 1.8;
                                }

                                .blog-content ul li::marker {
                                    color: #FF6B35;
                                }

                                .blog-content ol li::marker {
                                    color: #FF6B35;
                                    font-weight: 600;
                                }

                                .blog-content strong, .blog-content b {
                                    color: #111827;
                                    font-weight: 600;
                                }

                                .dark .blog-content strong, .dark .blog-content b {
                                    color: #F9FAFB;
                                }

                                .blog-content a {
                                    color: #FF6B35;
                                    text-decoration: underline;
                                    text-underline-offset: 3px;
                                    transition: color 0.2s;
                                }

                                .blog-content a:hover {
                                    color: #FF8C61;
                                }

                                .blog-content blockquote {
                                    border-left: 4px solid #FF6B35;
                                    padding-left: 1.5rem;
                                    margin: 2rem 0;
                                    font-style: italic;
                                    color: #4B5563;
                                    background: #FFF7ED;
                                    padding: 1.5rem;
                                    border-radius: 0.5rem;
                                }

                                .dark .blog-content blockquote {
                                    background: #1F2937;
                                    color: #D1D5DB;
                                }

                                .blog-content img {
                                    border-radius: 1rem;
                                    margin: 2rem 0;
                                    width: 100%;
                                }

                                .blog-content hr {
                                    margin: 3rem 0;
                                    border: none;
                                    height: 1px;
                                    background: linear-gradient(90deg, transparent, #E5E7EB, transparent);
                                }

                                .dark .blog-content hr {
                                    background: linear-gradient(90deg, transparent, #374151, transparent);
                                }

                                .blog-content code {
                                    background: #F3F4F6;
                                    padding: 0.25rem 0.5rem;
                                    border-radius: 0.25rem;
                                    font-size: 0.875rem;
                                    color: #FF6B35;
                                    font-family: 'Courier New', monospace;
                                }

                                .dark .blog-content code {
                                    background: #1F2937;
                                    color: #FF8C61;
                                }

                                .blog-content pre {
                                    background: #1F2937;
                                    padding: 1.5rem;
                                    border-radius: 0.75rem;
                                    overflow-x: auto;
                                    margin: 2rem 0;
                                }

                                .blog-content pre code {
                                    background: transparent;
                                    color: #E5E7EB;
                                    padding: 0;
                                }

                                .blog-content > p:first-of-type::first-letter {
                                    font-size: 3.5rem;
                                    font-weight: 700;
                                    float: left;
                                    line-height: 1;
                                    margin-right: 0.5rem;
                                    color: #FF6B35;
                                }

                                .blog-content table {
                                    width: 100%;
                                    border-collapse: collapse;
                                    margin: 2rem 0;
                                }

                                .blog-content th, .blog-content td {
                                    border: 1px solid #E5E7EB;
                                    padding: 0.75rem;
                                    text-align: left;
                                }

                                .dark .blog-content th, .dark .blog-content td {
                                    border-color: #374151;
                                }

                                .blog-content th {
                                    background: #F9FAFB;
                                    font-weight: 600;
                                }

                                .dark .blog-content th {
                                    background: #1F2937;
                                }
                            `}</style>
                            
                            <div 
                                className="blog-content"
                                dangerouslySetInnerHTML={{ __html: blog.description }}
                            />
                        </motion.article>

                        {/* Article Footer - Compact */}
                        <motion.div 
                            className="mt-10 pt-6 border-t border-gray-200/60 dark:border-gray-700/60"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {blog.seo.wordCount.toLocaleString()} words • {formatDate(blog.postedOn)}
                                </p>
                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="text-xs text-[#FF6B35] hover:text-[#FF6B35]/80 font-medium transition-colors"
                                >
                                    Back to top ↑
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Author's Other Articles - Compact */}
                {authorBlogs.length > 0 && (
                    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-white/[0.02] dark:to-white/[0.02]">
                        <div className="max-w-7xl mx-auto">
                            <motion.div 
                                className="flex items-center gap-2 mb-6"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <User className="w-5 h-5 text-[#FF6B35]" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    More from {blog.author}
                                </h2>
                            </motion.div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {authorBlogs.map((authorBlog, index) => (
                                    <motion.div
                                        key={authorBlog.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link 
                                            href={`/landing/blog/${authorBlog.slug || authorBlog.id}`}
                                            className="group block h-full"
                                        >
                                            <motion.div 
                                                className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden h-full"
                                                whileHover={{ 
                                                    scale: 1.02,
                                                    borderColor: "rgba(255, 107, 53, 0.5)"
                                                }}
                                            >
                                                <div className="relative h-32 overflow-hidden">
                                                    <img
                                                        src={avatar(authorBlog.blogImage)}
                                                        alt={authorBlog.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors line-clamp-2 mb-2">
                                                        {authorBlog.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
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

                {/* Related Articles - Compact */}
                {relatedBlogs.length > 0 && (
                    <section className="py-12 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto">
                            <motion.div 
                                className="flex items-center gap-2 mb-6"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Related Articles
                                </h2>
                            </motion.div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {relatedBlogs.map((relatedBlog, index) => (
                                    <motion.div
                                        key={relatedBlog.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link 
                                            href={`/landing/blog/${relatedBlog.slug || relatedBlog.id}`}
                                            className="group block h-full"
                                        >
                                            <motion.article 
                                                className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden h-full"
                                                whileHover={{ 
                                                    scale: 1.02,
                                                    borderColor: "rgba(255, 107, 53, 0.5)",
                                                    boxShadow: "0 10px 30px rgba(255, 107, 53, 0.15)"
                                                }}
                                            >
                                                <div className="relative h-40 overflow-hidden">
                                                    <img
                                                        src={avatar(relatedBlog.blogImage)}
                                                        alt={relatedBlog.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#FF6B35] transition-colors">
                                                        {relatedBlog.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                        {relatedBlog.excerpt}
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        <span>{relatedBlog.author}</span>
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

                {/* Navigation - Compact */}
                {(navigation.prev || navigation.next) && (
                    <section className="py-10 px-4 sm:px-6 lg:px-8 border-t border-gray-200/60 dark:border-gray-700/60">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid sm:grid-cols-2 gap-3">
                                {navigation.prev && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                    >
                                        <Link 
                                            href={`/landing/blog/${navigation.prev.slug || navigation.prev.id}`}
                                            className="group flex items-center gap-3 p-4 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl hover:border-[#FF6B35]/50 transition-all"
                                        >
                                            <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-[#FF6B35] transition-colors flex-shrink-0" />
                                            <div className="text-left min-w-0">
                                                <p className="text-xs text-gray-500 mb-1">Previous</p>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors line-clamp-1">
                                                    {navigation.prev.title}
                                                </p>
                                            </div>
                                        </Link>
                                    </motion.div>
                                )}
                                {navigation.next && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className={!navigation.prev ? 'sm:col-start-2' : ''}
                                    >
                                        <Link 
                                           href={`/landing/blog/${navigation.next.slug || navigation.next.id}`}
                                            className="group flex items-center gap-3 p-4 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl hover:border-[#FF6B35]/50 transition-all"
                                        >
                                            <div className="text-right min-w-0 flex-1">
                                                <p className="text-xs text-gray-500 mb-1">Next</p>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors line-clamp-1">
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
                <section className="py-10 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Link 
                                href="/landing/blog"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-gray-800/50 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl font-medium text-gray-900 dark:text-white transition-all hover:scale-105"
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
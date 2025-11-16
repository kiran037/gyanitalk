// "use client";

// import { useState, useEffect } from "react";
// import { useParams } from "next/navigation";
// import LandingWrapper from "@/components/landing/LandingWrapper";
// import { Calendar, Eye, User, ArrowLeft, Tag, Share2, ChevronRight } from "lucide-react";
// import Link from "next/link";

// interface Blog {
//     id: string;
//     title: string;
//     blogImage: string;
//     description: string;
//     author: string;
//     postedOn: string;
//     viewer: string;
//     categoryName: string | null;
// }

// interface RelatedBlog {
//     id: string;
//     title: string;
//     blogImage: string;
//     author: string;
//     postedOn: string;
//     viewer: string;
// }

// export default function BlogDetailPage() {
//     const params = useParams();
//     const blogId = params.id as string;
    
//     const [blog, setBlog] = useState<Blog | null>(null);
//     const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlog[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     useEffect(() => {
//         if (blogId) {
//             fetchBlogDetail();
//         }
//     }, [blogId]);

//     const fetchBlogDetail = async () => {
//         setLoading(true);
//         try {
//             const response = await fetch(`/api/landing/blog/${blogId}`);
//             const data = await response.json();

//             if (data.success) {
//                 setBlog(data.data);
//                 setRelatedBlogs(data.relatedBlogs || []);
//             } else {
//                 setError(data.error || "Blog not found");
//             }
//         } catch (error) {
//             console.error("Failed to fetch blog:", error);
//             setError("Failed to load blog");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatDate = (dateString: string) => {
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-US', { 
//             year: 'numeric', 
//             month: 'long', 
//             day: 'numeric' 
//         });
//     };

//     const handleShare = () => {
//         if (navigator.share) {
//             navigator.share({
//                 title: blog?.title,
//                 url: window.location.href,
//             });
//         } else {
//             // Fallback: Copy to clipboard
//             navigator.clipboard.writeText(window.location.href);
//             alert("Link copied to clipboard!");
//         }
//     };

//     if (loading) {
//         return (
//             <LandingWrapper>
//                 <div className="min-h-screen flex items-center justify-center">
//                     <div className="text-center">
//                         <div className="w-16 h-16 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                         <p className="text-gray-600 dark:text-gray-400">Loading blog...</p>
//                     </div>
//                 </div>
//             </LandingWrapper>
//         );
//     }

//     if (error || !blog) {
//         return (
//             <LandingWrapper>
//                 <div className="min-h-screen flex items-center justify-center px-4">
//                     <div className="text-center">
//                         <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Blog Not Found</h2>
//                         <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
//                         <Link 
//                             href="/landing/blog"
//                             className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white font-semibold rounded-full hover:shadow-2xl hover:scale-105 transition-all"
//                         >
//                             <ArrowLeft className="w-4 h-4" />
//                             Back to Blogs
//                         </Link>
//                     </div>
//                 </div>
//             </LandingWrapper>
//         );
//     }

//     return (
//         <LandingWrapper>
//             {/* Hero Section with Blog Image */}
//             <section className="pt-32 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
//                 {/* Animated Background */}
//                 <div className="absolute top-20 -left-20 w-64 h-64 sm:w-96 sm:h-96 bg-[#FF6B35]/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
//                 <div className="absolute bottom-20 -right-20 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-[#FFB347]/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{animationDelay: '1s'}}></div>

//                 <div className="max-w-5xl mx-auto relative z-10">
//                     {/* Back Button */}
//                     <Link 
//                         href="/landing/blog"
//                         className="inline-flex items-center gap-2 text-[#FF6B35] dark:text-[#FF8C61] hover:gap-3 transition-all mb-6 font-medium"
//                     >
//                         <ArrowLeft className="w-4 h-4" />
//                         Back to Blogs
//                     </Link>

//                     {/* Blog Header */}
//                     <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl overflow-hidden shadow-2xl">
//                         {/* Featured Image */}
//                         <div className="relative h-[300px] sm:h-[400px] lg:h-[500px]">
//                             <img
//                                 src={blog.blogImage}
//                                 alt={blog.title}
//                                 className="w-full h-full object-cover"
//                             />
//                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                            
//                             {/* Title Overlay */}
//                             <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
//                                 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
//                                     {blog.title}
//                                 </h1>
                                
//                                 {/* Meta Info */}
//                                 <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/90">
//                                     <div className="flex items-center gap-2">
//                                         <User className="w-5 h-5" />
//                                         <span className="font-medium">{blog.author}</span>
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <Calendar className="w-5 h-5" />
//                                         <span>{formatDate(blog.postedOn)}</span>
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <Eye className="w-5 h-5" />
//                                         <span>{blog.viewer} views</span>
//                                     </div>
//                                     {blog.categoryName && (
//                                         <div className="flex items-center gap-2">
//                                             <Tag className="w-5 h-5" />
//                                             <span>{blog.categoryName}</span>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* Blog Content Section */}
//             <section className="py-16 px-4 sm:px-6 lg:px-8">
//                 <div className="max-w-4xl mx-auto">
//                     {/* Share Button */}
//                     <div className="flex justify-end mb-8">
//                         <button
//                             onClick={handleShare}
//                             className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all shadow-md"
//                         >
//                             <Share2 className="w-4 h-4" />
//                             Share
//                         </button>
//                     </div>

//                     {/* Blog Content */}
//                     <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-10 shadow-lg">
//                         <div 
//                             className="prose prose-lg dark:prose-invert max-w-none
//                                 prose-headings:text-gray-900 dark:prose-headings:text-white
//                                 prose-p:text-gray-700 dark:prose-p:text-gray-300
//                                 prose-strong:text-gray-900 dark:prose-strong:text-white
//                                 prose-a:text-[#FF6B35] dark:prose-a:text-[#FF8C61]
//                                 prose-img:rounded-2xl prose-img:shadow-lg"
//                             dangerouslySetInnerHTML={{ __html: blog.description }}
//                         />
//                     </div>
//                 </div>
//             </section>

//             {/* Related Blogs Section */}
//             {relatedBlogs.length > 0 && (
//                 <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-orange-50/30 dark:to-gray-900/30">
//                     <div className="max-w-7xl mx-auto">
//                         <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
//                             Related <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">Articles</span>
//                         </h2>

//                         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                             {relatedBlogs.map((relatedBlog) => (
//                                 <Link href={`/landing/blog/${relatedBlog.id}`} key={relatedBlog.id}>
//                                     <div className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
//                                         <div className="relative h-40 overflow-hidden">
//                                             <img
//                                                 src={relatedBlog.blogImage}
//                                                 alt={relatedBlog.title}
//                                                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                                             />
//                                         </div>
//                                         <div className="p-5">
//                                             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-[#FF6B35] dark:group-hover:text-[#FF8C61] transition-colors">
//                                                 {relatedBlog.title}
//                                             </h3>
//                                             <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
//                                                 <span>{relatedBlog.author}</span>
//                                                 <div className="flex items-center gap-1 text-[#FF6B35] dark:text-[#FF8C61] font-semibold">
//                                                     Read
//                                                     <ChevronRight className="w-4 h-4" />
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </Link>
//                             ))}
//                         </div>
//                     </div>
//                 </section>
//             )}
//         </LandingWrapper>
//     );
// }


"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { Calendar, Eye, User, ArrowLeft, Tag, Share2, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Blog {
    id: string;
    title: string;
    blogImage: string;
    description: string;
    author: string;
    postedOn: string;
    viewer: string;
    categoryName: string | null;
}

interface RelatedBlog {
    id: string;
    title: string;
    blogImage: string;
    author: string;
    postedOn: string;
    viewer: string;
}

export default function BlogDetailPage() {
    const params = useParams();
    const blogId = params.id as string;
    
    const [blog, setBlog] = useState<Blog | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (blogId) {
            fetchBlogDetail();
        }
    }, [blogId]);

    const fetchBlogDetail = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/landing/blog/${blogId}`);
            const data = await response.json();

            if (data.success) {
                setBlog(data.data);
                setRelatedBlogs(data.relatedBlogs || []);
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

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: blog?.title,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <LandingWrapper>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading blog...</p>
                    </div>
                </div>
            </LandingWrapper>
        );
    }

    if (error || !blog) {
        return (
            <LandingWrapper>
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Blog Not Found</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                        <Link 
                            href="/landing/blog"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white font-semibold rounded-full hover:shadow-2xl hover:scale-105 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Blogs
                        </Link>
                    </div>
                </div>
            </LandingWrapper>
        );
    }

    return (
        <LandingWrapper>
            {/* Hero Section with Blog Image */}
            <section className="pt-32 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute top-20 -left-20 w-64 h-64 sm:w-96 sm:h-96 bg-[#FF6B35]/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-20 -right-20 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-[#FFB347]/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{animationDelay: '1s'}}></div>

                <div className="max-w-5xl mx-auto relative z-10">
                    <Link 
                        href="/landing/blog"
                        className="inline-flex items-center gap-2 text-[#FF6B35] dark:text-[#FF8C61] hover:gap-3 transition-all mb-6 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blogs
                    </Link>

                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="relative h-[300px] sm:h-[400px] lg:h-[500px]">
                            <img
                                src={blog.blogImage}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                            
                            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                                    {blog.title}
                                </h1>
                                
                                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/90">
                                    <div className="flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        <span className="font-medium">{blog.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        <span>{formatDate(blog.postedOn)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-5 h-5" />
                                        <span>{blog.viewer} views</span>
                                    </div>
                                    {blog.categoryName && (
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-5 h-5" />
                                            <span>{blog.categoryName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Content Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-end mb-8">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all shadow-md"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>

                    {/* Blog Content with Custom Styling */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-10 shadow-lg">
                        <style jsx global>{`
                            .blog-content {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                                line-height: 1.8;
                            }

                            .blog-content p {
                                margin-bottom: 1.5rem;
                                font-size: 1.125rem;
                                color: #374151;
                                text-align: justify;
                            }

                            .dark .blog-content p {
                                color: #D1D5DB;
                            }

                            .blog-content h3 {
                                font-size: 1.75rem;
                                font-weight: 700;
                                margin-top: 2.5rem;
                                margin-bottom: 1.25rem;
                                color: #111827;
                                background: linear-gradient(135deg, #FF6B35, #FFB347);
                                -webkit-background-clip: text;
                                -webkit-text-fill-color: transparent;
                                background-clip: text;
                            }

                            .dark .blog-content h3 {
                                background: linear-gradient(135deg, #FF8C61, #FFD580);
                                -webkit-background-clip: text;
                                -webkit-text-fill-color: transparent;
                                background-clip: text;
                            }

                            .blog-content h4 {
                                font-size: 1.5rem;
                                font-weight: 600;
                                margin-top: 2rem;
                                margin-bottom: 1rem;
                                color: #1F2937;
                            }

                            .dark .blog-content h4 {
                                color: #F3F4F6;
                            }

                            .blog-content ul {
                                margin-bottom: 1.5rem;
                                padding-left: 1.5rem;
                            }

                            .blog-content li {
                                margin-bottom: 0.75rem;
                                font-size: 1.125rem;
                                color: #4B5563;
                                position: relative;
                                padding-left: 0.5rem;
                            }

                            .dark .blog-content li {
                                color: #D1D5DB;
                            }

                            .blog-content li::marker {
                                color: #FF6B35;
                                font-weight: bold;
                            }

                            .blog-content strong {
                                color: #111827;
                                font-weight: 600;
                            }

                            .dark .blog-content strong {
                                color: #F9FAFB;
                            }

                            .blog-content hr {
                                margin: 3rem 0;
                                border: none;
                                height: 2px;
                                background: linear-gradient(90deg, transparent, #FF6B35, transparent);
                                opacity: 0.3;
                            }

                            .blog-content a {
                                color: #FF6B35;
                                text-decoration: underline;
                                transition: color 0.3s;
                            }

                            .blog-content a:hover {
                                color: #FFB347;
                            }

                            .dark .blog-content a {
                                color: #FF8C61;
                            }

                            .dark .blog-content a:hover {
                                color: #FFD580;
                            }

                            /* First paragraph special styling */
                            .blog-content > p:first-child {
                                font-size: 1.25rem;
                                font-weight: 500;
                                color: #1F2937;
                                line-height: 2;
                            }

                            .dark .blog-content > p:first-child {
                                color: #E5E7EB;
                            }
                        `}</style>
                        
                        <div 
                            className="blog-content"
                            dangerouslySetInnerHTML={{ __html: blog.description }}
                        />
                    </div>
                </div>
            </section>

            {/* Related Blogs Section */}
            {relatedBlogs.length > 0 && (
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-orange-50/30 dark:to-gray-900/30">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                            Related <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">Articles</span>
                        </h2>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedBlogs.map((relatedBlog) => (
                                <Link href={`/landing/blog/${relatedBlog.id}`} key={relatedBlog.id}>
                                    <div className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                                        <div className="relative h-40 overflow-hidden">
                                            <img
                                                src={relatedBlog.blogImage}
                                                alt={relatedBlog.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-[#FF6B35] dark:group-hover:text-[#FF8C61] transition-colors">
                                                {relatedBlog.title}
                                            </h3>
                                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                                <span>{relatedBlog.author}</span>
                                                <div className="flex items-center gap-1 text-[#FF6B35] dark:text-[#FF8C61] font-semibold">
                                                    Read
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </LandingWrapper>
    );
}
"use client";

import { useState, useEffect } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { BookOpen, Calendar, Eye, User, ChevronRight, Sparkles, Filter } from "lucide-react";
import Link from "next/link";

interface Blog {
    id: string;
    title: string;
    blogImage: string;
    description: string;
    author: string;
    postedOn: string;
    viewer: string;
    blogCategoryId: string | null;
}

interface Category {
    id: string;
    name: string;
}

export default function BlogListPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchBlogs();
    }, [selectedCategory, currentPage]);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "12"
            });
            
            if (selectedCategory) {
                params.append("categoryId", selectedCategory);
            }

            const response = await fetch(`/api/landing/blog?${params}`);
            const data = await response.json();

            if (data.success) {
                setBlogs(data.data);
                setCategories(data.categories);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch blogs:", error);
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

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    return (
        <LandingWrapper>
            {/* Hero Section */}
            <section className="pt-32 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute top-20 -left-20 w-64 h-64 sm:w-96 sm:h-96 bg-[#FF6B35]/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-20 -right-20 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-[#FFB347]/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{animationDelay: '1s'}}></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-12 sm:mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 text-[#FF6B35] dark:text-[#FF8C61] rounded-full text-sm font-semibold mb-6 shadow-lg">
                            <Sparkles className="w-4 h-4" />
                            INSIGHTS & ARTICLES
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">Our Blog</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Explore the latest articles, insights, and updates from our astrology experts
                        </p>
                    </div>
                </div>
            </section>

            {/* Blog List Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <Filter className="w-5 h-5 text-[#FF6B35] dark:text-[#FF8C61]" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filter by Category</h2>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedCategory("");
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                                        selectedCategory === ""
                                            ? "bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white shadow-lg"
                                            : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border border-white/30 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800/80"
                                    }`}
                                >
                                    All
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            setSelectedCategory(category.id);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-4 py-2 rounded-full font-medium transition-all ${
                                            selectedCategory === category.id
                                                ? "bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white shadow-lg"
                                                : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border border-white/30 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800/80"
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl overflow-hidden animate-pulse">
                                    <div className="w-full h-48 bg-gray-300 dark:bg-gray-700"></div>
                                    <div className="p-6 space-y-3">
                                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-20">
                            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Blogs Found</h3>
                            <p className="text-gray-600 dark:text-gray-400">Check back later for new articles!</p>
                        </div>
                    ) : (
                        <>
                            {/* Blog Grid */}
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                {blogs.map((blog) => (
                                    <Link href={`/landing/blog/${blog.id}`} key={blog.id}>
                                        <div className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                                            {/* Blog Image */}
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={blog.blogImage}
                                                    alt={blog.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                            </div>

                                            {/* Blog Content */}
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#FF6B35] dark:group-hover:text-[#FF8C61] transition-colors line-clamp-2">
                                                    {blog.title}
                                                </h3>

                                                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                                    {truncateText(blog.description.replace(/<[^>]*>/g, ''), 120)}
                                                </p>

                                                {/* Meta Info */}
                                                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        <span>{blog.author}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Eye className="w-4 h-4" />
                                                        <span>{blog.viewer}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{formatDate(blog.postedOn)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[#FF6B35] dark:text-[#FF8C61] font-semibold group-hover:gap-2 transition-all">
                                                        Read More
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Previous
                                    </button>
                                    
                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-xl font-medium transition-all ${
                                                    currentPage === page
                                                        ? "bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white shadow-lg"
                                                        : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </LandingWrapper>
    );
}
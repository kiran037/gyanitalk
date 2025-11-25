"use client";

import { useState, useEffect } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { ShoppingBag, Search, Star, TrendingUp, ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import Head from "next/head";
import { motion } from "framer-motion";

interface Product {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    features: string;
    productImage: string;
    gallery: string | null;
    amount: number;
    isFeatured: boolean;
    isBestseller: boolean;
    category: {
        id: string;
        name: string;
        categoryImage: string;
    } | null;
    productDetailsCount: number;
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
        schemaJson: string;
    };
    createdAt: string | null;
    updatedAt: string | null;
}

interface Category {
    id: string;
    name: string;
    categoryImage: string;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
}

export default function MallPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");
    const [showFeatured, setShowFeatured] = useState(false);
    const [showBestseller, setShowBestseller] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<Pagination>({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 12
    });

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, currentPage, sortBy, sortOrder, showFeatured, showBestseller]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "12",
                sortBy,
                sortOrder
            });

            if (selectedCategory) {
                params.append("categoryId", selectedCategory);
            }

            if (searchQuery.trim()) {
                params.append("search", searchQuery.trim());
            }

            if (showFeatured) {
                params.append("isFeatured", "true");
            }

            if (showBestseller) {
                params.append("isBestseller", "true");
            }

            const response = await fetch(`/api/landing/mall?${params}`);
            const data = await response.json();

            if (data.success) {
                setProducts(data.data.products);
                setPagination(data.data.pagination);

                // Extract unique categories from products
                const uniqueCategories = Array.from(
                    new Map(
                        data.data.products
                            .filter((p: Product) => p.category)
                            .map((p: Product) => [p.category!.id, p.category])
                    ).values()
                ) as Category[];
                setCategories(uniqueCategories);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchProducts();
    };

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + "...";
    };

    return (
        <>
            <Head>
                <title>AstroMall - Premium Astrology Products</title>
                <meta name="description" content="Discover premium astrology products for your spiritual journey" />
                <link rel="canonical" href="/landing/mall" />
            </Head>

            <LandingWrapper>
                {/* Hero Section */}
                <section className="relative min-h-[45vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-28 pb-8">
                    {/* Animated Grid Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)`,
                            backgroundSize: '40px 40px',
                        }} />
                    </div>

                    {/* Floating Particles */}
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute pointer-events-none"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0.15, 0.4, 0.15],
                                scale: [1, 1.8, 1],
                                x: [0, Math.random() * 60 - 30, 0],
                                y: [0, Math.random() * 60 - 30, 0],
                            }}
                            transition={{
                                duration: 12 + i * 1.5,
                                repeat: Infinity,
                                delay: i * 0.4,
                                ease: "easeInOut"
                            }}
                            style={{
                                left: `${5 + (i % 4) * 25}%`,
                                top: `${10 + Math.floor(i / 4) * 30}%`,
                            }}
                        >
                            <div className="relative">
                                <div className="w-3 h-3 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full blur-[2px] opacity-60" />
                                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full animate-ping opacity-30" />
                            </div>
                        </motion.div>
                    ))}

                    {/* Gradient Orbs */}
                    <motion.div
                        className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
                        animate={{
                            scale: [1, 1.2, 1],
                            x: [0, 50, 0],
                            y: [0, 30, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute top-1/3 -right-1/4 w-96 h-96 bg-[#FFB347] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
                        animate={{
                            scale: [1, 1.3, 1],
                            x: [0, -30, 0],
                            y: [0, 50, 0],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                    />

                    <div className="relative z-10 max-w-7xl mx-auto w-full text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 border border-[#FF6B35]/20 rounded-full backdrop-blur-sm">
                                <ShoppingBag className="w-4 h-4 text-[#FF6B35]" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">ASTROMALL</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                                <span className="text-gray-900 dark:text-white">Premium </span>
                                <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">Astrology Products</span>
                            </h1>

                            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                                Discover authentic spiritual products curated by expert astrologers
                            </p>

                            {/* Search Bar */}
                            <div className="max-w-2xl mx-auto">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search products, categories..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full px-5 py-3.5 pr-12 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-lg transition-all hover:scale-105"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Filters Bar */}
                        <motion.div
                            className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200/60 dark:border-gray-700/60"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium text-gray-900 dark:text-white">{pagination.totalCount}</span> products
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Sort Dropdown */}
                                <select
                                    value={`${sortBy}-${sortOrder}`}
                                    onChange={(e) => {
                                        const [newSortBy, newSortOrder] = e.target.value.split('-');
                                        setSortBy(newSortBy);
                                        setSortOrder(newSortOrder);
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                                >
                                    <option value="created_at-desc">Latest</option>
                                    <option value="created_at-asc">Oldest</option>
                                    <option value="amount-asc">Price: Low to High</option>
                                    <option value="amount-desc">Price: High to Low</option>
                                    <option value="name-asc">Name: A to Z</option>
                                    <option value="name-desc">Name: Z to A</option>
                                </select>
                            </div>
                        </motion.div>

                        {/* Category & Filter Pills */}
                        <motion.div
                            className="mb-6 space-y-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            {/* Categories */}
                            {categories.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <motion.button
                                        onClick={() => {
                                            setSelectedCategory("");
                                            setCurrentPage(1);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategory === ""
                                                ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                                                : "bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300"
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        All Categories
                                    </motion.button>
                                    {categories.map((category) => (
                                        <motion.button
                                            key={category.id}
                                            onClick={() => {
                                                setSelectedCategory(category.id);
                                                setCurrentPage(1);
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategory === category.id
                                                    ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                                                    : "bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300"
                                                }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {category.name}
                                        </motion.button>
                                    ))}
                                </div>
                            )}

                            {/* Quick Filters */}
                            <div className="flex flex-wrap gap-2">
                                <motion.button
                                    onClick={() => {
                                        setShowFeatured(!showFeatured);
                                        setCurrentPage(1);
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showFeatured
                                            ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                                            : "bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300"
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Star className="w-3 h-3" />
                                    Featured
                                </motion.button>
                                <motion.button
                                    onClick={() => {
                                        setShowBestseller(!showBestseller);
                                        setCurrentPage(1);
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showBestseller
                                            ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                                            : "bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300"
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <TrendingUp className="w-3 h-3" />
                                    Bestseller
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Loading State */}
                        {loading ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden animate-pulse">
                                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <motion.div
                                className="text-center py-16 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Products Found</h3>
                                <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search query</p>
                            </motion.div>
                        ) : (
                            <>
                                {/* Products Grid/List */}
                               <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {products.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: index * 0.05 }}
                                        >
                                            <Link
                                                href={`/landing/mall/${product.slug}`}
                                                className="group block h-full"
                                            >
                                                <motion.article
                                                 className="h-full bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden"
                                                    whileHover={{
                                                        scale: 1.02,
                                                        borderColor: "rgba(255, 107, 53, 0.5)",
                                                        boxShadow: "0 10px 30px rgba(255, 107, 53, 0.15)"
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {/* Image */}
                                                    <div className="relative overflow-hidden h-56">
                                                        <img
                                                            src={avatar(product.productImage)}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        {/* Badges */}
                                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                            {product.isFeatured && (
                                                                <div className="px-2 py-0.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                                                                    <Star className="w-2.5 h-2.5" />
                                                                    Featured
                                                                </div>
                                                            )}
                                                            {product.isBestseller && (
                                                                <div className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                                                                    <TrendingUp className="w-2.5 h-2.5" />
                                                                    Bestseller
                                                                </div>
                                                            )}
                                                        </div>
                                                        {product.category && (
                                                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-[#FF6B35] text-[10px] font-bold rounded-lg">
                                                                {product.category.name}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-4 flex flex-col flex-1">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#FF6B35] transition-colors line-clamp-2">
                                                            {product.name}
                                                        </h3>

                                                        {product.description && (
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                                                                {truncateText(product.description, 100)}
                                                            </p>
                                                        )}

                                                        {/* Features Preview */}
                                                        {product.features && (
                                                            <p className="text-[10px] text-gray-500 dark:text-gray-500 mb-3 line-clamp-1">
                                                                {truncateText(product.features, 60)}
                                                            </p>
                                                        )}

                                                        {/* Footer */}
                                                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
                                                            <div>
                                                                <div className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                                                                    ₹{product.amount}
                                                                </div>
                                                                {product.productDetailsCount > 0 && (
                                                                    <div className="text-[10px] text-gray-500">
                                                                        {product.productDetailsCount} details included
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <motion.button
                                                                className="px-4 py-2 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-sm font-medium rounded-lg flex items-center gap-1"
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                View
                                                                <ChevronRight className="w-3 h-3" />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </motion.article>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <motion.div
                                        className="flex justify-center items-center gap-2"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                    >
                                        <motion.button
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            disabled={!pagination.hasPrevPage}
                                            className="px-4 py-2 bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm"
                                            whileHover={{ scale: !pagination.hasPrevPage ? 1 : 1.05 }}
                                            whileTap={{ scale: !pagination.hasPrevPage ? 1 : 0.95 }}
                                        >
                                            Previous
                                        </motion.button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                                                let pageNum;
                                                if (pagination.totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= pagination.totalPages - 2) {
                                                    pageNum = pagination.totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }

                                                return (
                                                    <motion.button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${currentPage === pageNum
                                                                ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                                                                : "bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 backdrop-blur-sm"
                                                            }`}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        {pageNum}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>

                                        <motion.button
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            disabled={!pagination.hasNextPage}
                                            className="px-4 py-2 bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm"
                                            whileHover={{ scale: !pagination.hasNextPage ? 1 : 1.05 }}
                                            whileTap={{ scale: !pagination.hasNextPage ? 1 : 0.95 }}
                                        >
                                            Next
                                        </motion.button>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </LandingWrapper>
        </>
    );
}
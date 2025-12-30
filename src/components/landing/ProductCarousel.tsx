"use client";

import { Package, Star, Sparkles, ArrowRight, ShoppingBag, Tag } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { avatar } from "@/lib/images";

// Helper to clean HTML descriptions
const stripHtml = (html: string | null | undefined): string => {
    if (!html) return "";
    return html
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
};

// Helper for Currency Formatting
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    features: string | null;
    productImage: string | null;
    gallery: string | null;
    amount: number;
    isFeatured: boolean;
    isBestseller: boolean;
    category: {
        id: string;
        name: string;
        categoryImage: string | null;
    } | null;
}

export default function ProductCarousel() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        let cancelled = false;
        const fetchProducts = async () => {
            try {
                const res = await fetch("/api/landing/mall/featured");
                const data = await res.json();
                if (!cancelled) {
                    setProducts(data?.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchProducts();
        return () => { cancelled = true; };
    }, []);

    // Double the array for seamless infinite scroll
    const carouselItems = useMemo(
        () => (products.length ? [...products, ...products] : []),
        [products]
    );

    // Dynamic duration based on content length
    const duration = Math.max(30, products.length * 5);

    if (loading) return <LoadingSkeleton />;
    if (!products.length) return null;

    return (
        <section className="relative py-16 sm:py-24 overflow-hidden bg-[#FFFBF5] dark:bg-[#050505]">
            {/* --- 1. Cosmic Background Pattern --- */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.08]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="mall-stars" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="currentColor" className="text-orange-900 dark:text-white" />
                        <path d="M30 10 L32 15 L37 15 L33 19 L35 24 L30 21 L25 24 L27 19 L23 15 L28 15 Z" fill="currentColor" className="text-orange-900 dark:text-white" transform="scale(0.2)" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#mall-stars)" />
                </svg>
            </div>
            
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#FFFBF5] to-transparent dark:from-[#050505] z-10" />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#FFFBF5] to-transparent dark:from-[#050505] z-10" />

            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* --- 2. Header --- */}
                <motion.div
                    className="text-center mb-12 sm:mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs font-bold tracking-widest uppercase mb-4">
                        <ShoppingBag className="w-3 h-3" />
                        Astro Mall
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                        <span className="text-gray-900 dark:text-white">Sacred </span>
                        <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                            Treasures
                        </span>
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Handpicked gemstones, rudraksha, and spiritual tools to enhance your cosmic energy.
                    </p>
                </motion.div>
            </div>

            {/* --- 3. Infinite Carousel --- */}
            <div className="relative w-full overflow-hidden z-20">
                <div 
                    className="flex"
                    // Pause animation on hover for readability
                    onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        el.style.animationPlayState = 'paused';
                    }}
                    onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        el.style.animationPlayState = 'running';
                    }}
                >
                    <motion.div
                        className="flex gap-5 sm:gap-8 px-4"
                        animate={prefersReducedMotion ? {} : { x: ["0%", "-50%"] }}
                        transition={
                            prefersReducedMotion
                                ? undefined
                                : { repeat: Infinity, ease: "linear", duration: duration }
                        }
                    >
                        {carouselItems.map((product, index) => (
                            <ProductCard key={`${product.id}-${index}`} product={product} />
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* --- 4. CTA --- */}
            <div className="relative z-20 text-center mt-12 sm:mt-16">
                <Link href="/mall">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 transition-all"
                    >
                        Visit AstroMall
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </Link>
            </div>
        </section>
    );
}

// --- Component: Product Card ---
function ProductCard({ product }: { product: Product }) {
    return (
        <div className="w-[280px] sm:w-[340px] flex-shrink-0 group">
            <Link href={`/mall/${product.slug}`} className="block h-full">
                <div className="h-full bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-200 dark:hover:border-orange-900/50 transition-all duration-300">
                    
                    {/* Image Section */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-800">
                        <img
                            src={avatar(product.productImage)}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {product.isBestseller && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                                    <Star className="w-3 h-3 fill-white" />
                                    Bestseller
                                </span>
                            )}
                            {product.isFeatured && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                                    <Sparkles className="w-3 h-3" />
                                    Featured
                                </span>
                            )}
                        </div>

                        {/* Category Tag */}
                        {product.category && (
                            <div className="absolute top-3 right-3">
                                <span className="px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md text-gray-800 dark:text-gray-200 text-[10px] font-bold uppercase rounded-full shadow-sm">
                                    {product.category.name}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex flex-col h-[200px]">
                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-[#FF6B35] transition-colors">
                            {product.name}
                        </h3>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
                            {stripHtml(product.description || product.features)}
                        </p>

                        {/* Footer: Price & Action */}
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Price</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(product.amount)}
                                </p>
                            </div>
                            
                            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-[#FF6B35] group-hover:bg-[#FF6B35] group-hover:text-white transition-colors">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

// --- Loading Skeleton ---
function LoadingSkeleton() {
    return (
        <section className="py-24 px-4 bg-[#FFFBF5] dark:bg-[#050505]">
            <div className="max-w-4xl mx-auto text-center mb-12">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-4 animate-pulse" />
                <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto animate-pulse" />
            </div>
            <div className="flex gap-6 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-[300px] h-[400px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-4 flex-shrink-0 animate-pulse">
                        <div className="h-48 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4" />
                        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-4" />
                        <div className="mt-auto h-10 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                    </div>
                ))}
            </div>
        </section>
    );
}
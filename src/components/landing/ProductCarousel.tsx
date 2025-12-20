"use client";

import { Package, Star, Sparkles, ArrowRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { avatar } from "@/lib/images";

const stripHtml = (html: string | null | undefined): string => {
    if (!html) return "";
    return html
        .replace(/<[^>]+>/g, " ")     // remove tags
        .replace(/&nbsp;/gi, " ")     // replace &nbsp; with space
        .replace(/\s+/g, " ")         // collapse extra spaces
        .trim();
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
    const shouldReduceMotion = useReducedMotion();

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
                if (!cancelled) {
                    console.error("Failed to fetch products:", err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchProducts();
        return () => {
            cancelled = true;
        };
    }, []);

    // ✅ Hooks must be BEFORE any early return

    // Duplicate list once for seamless loop
    const trackProducts = useMemo(
        () => (products.length ? [...products, ...products] : []),
        [products]
    );

    // Slower, smoother scroll – scales with product count
    const baseDuration = useMemo(
        () => Math.max(20, Math.min(45, products.length * 3)),
        [products]
    );

    if (loading) {
        return (
            <section className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="h-5 w-40 max-w-full bg-gray-200 dark:bg-neutral-950 rounded mx-auto mb-3 animate-pulse" />
                        <div className="h-8 w-60 max-w-full bg-gray-200 dark:bg-neutral-950 rounded mx-auto animate-pulse" />
                    </div>
                </div>
            </section>
        );
    }

    if (!products.length) return null;

    return (
        <section
            aria-labelledby="featured-products-heading"
            className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-white/[0.02] dark:to-white/[0.02] overflow-x-hidden">
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    className="text-center mb-10 sm:mb-14"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-block mb-3 sm:mb-4">
                        <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#FF6B35]">
                            FEATURED PRODUCTS
                        </span>
                    </div>
                    <h2
                        id="featured-products-heading"
                        className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3"
                    >
                        <span className="text-gray-900 dark:text-white">Shop from </span>
                        <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                            AstroMall
                        </span>
                    </h2>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto px-2">
                        Discover premium astrology products & spiritual items handpicked for you
                    </p>
                </motion.div>
            </div>

            {/* Marquee container */}
            <div className="relative w-full overflow-hidden">
                <motion.div
                    className={`inline-flex gap-3 sm:gap-4 md:gap-5 py-2 whitespace-nowrap ${shouldReduceMotion ? "" : "will-change-transform"
                        }`}
                    animate={
                        shouldReduceMotion
                            ? {}
                            : {
                                x: ["-50%", "0%"], // left → right
                            }
                    }
                    transition={
                        shouldReduceMotion
                            ? undefined
                            : {
                                x: {
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    duration: baseDuration,
                                    ease: "linear",
                                },
                            }
                    }
                >
                    {trackProducts.map((product, index) => (
                        <div
                            key={`${product.id}-${index}`}
                            className="flex-shrink-0 w-[260px] xs:w-[280px] sm:w-[320px] md:w-[360px] group inline-block"
                        >
                            <motion.div
                                whileHover={
                                    shouldReduceMotion
                                        ? undefined
                                        : { scale: 1.02, y: -4 }
                                }
                                transition={{ duration: 0.2 }}
                            >
                                <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-black rounded-2xl overflow-hidden h-full shadow-md sm:shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 hover:border-[#FF6B35]/50 dark:hover:border-[#FF6B35]/50 transition-all">
                                    {/* Product Image */}
                                    <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                                        <img
                                            src={avatar(product.productImage)}
                                            alt={product.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Badges - Top Left */}
                                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                                            {product.isBestseller && (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: 0.15 }}
                                                    className="px-2.5 py-1 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-md"
                                                >
                                                    <Star className="w-3 h-3 fill-white" aria-hidden="true" focusable="false" />
                                                    <span>BESTSELLER</span>
                                                </motion.div>
                                            )}
                                            {product.isFeatured && (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: 180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="px-2.5 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-md"
                                                >
                                                    <Sparkles className="w-3 h-3" aria-hidden="true" focusable="false" />
                                                    <span>FEATURED</span>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Category Badge - Top Right */}
                                        {product.category && (
                                            <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white rounded-full border border-white/20">
                                                {product.category.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4 sm:p-5">
                                        {/* Name */}
                                        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white line-clamp-2 mb-2.5 group-hover:text-[#FF6B35] transition-colors min-h-[2.5rem]">
                                            {product.name}
                                        </h3>

                                        {/* Description */}
                                        {product.description && (
                                            <p className="text-[11px] sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2.5 leading-relaxed">
                                                {stripHtml(product.description).slice(0, 100)}…
                                            </p>
                                        )}

                                        {/* Features Preview */}
                                        {product.features && (
                                            <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-500">
                                                <Package
                                                    className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#FF6B35]"
                                                    aria-hidden="true"
                                                    focusable="false"
                                                />
                                                <p className="line-clamp-2 leading-relaxed">
                                                    {stripHtml(product.features).slice(0, 100)}…
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* CTA Button */}
            <motion.div
                className="relative z-20 text-center mt-8 sm:mt-10 px-4"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
            >
                <Link href="/landing/mall">
                    <motion.button
                        className="group inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-xl shadow-lg text-sm sm:text-base font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Explore AstroMall
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" focusable="false" />
                        </motion.div>
                    </motion.button>
                </Link>
            </motion.div>
        </section>
    );
}
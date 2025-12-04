"use client";

import { Package, Star, Sparkles, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { avatar } from "@/lib/images";

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

    useEffect(() => {
        fetch('/api/landing/mall/featured')
            .then(res => res.json())
            .then(data => {
                setProducts(data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch products:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="h-6 w-48 bg-gray-200 dark:bg-neutral-950 rounded mx-auto mb-4 animate-pulse" />
                        <div className="h-12 w-96 bg-gray-200 dark:bg-neutral-950 rounded mx-auto animate-pulse" />
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="relative py-16 sm:py-24 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-white/[0.02] dark:to-white/[0.02] overflow-x-hidden">

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    className="text-center mb-12 sm:mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-block mb-4 sm:mb-6">
                        <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#FF6B35]">
                            FEATURED PRODUCTS
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                        <span className="text-gray-900 dark:text-white">Shop from </span>
                        <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                            AstroMall
                        </span>
                    </h2>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
                        Discover premium astrology products & spiritual items handpicked for you
                    </p>
                </motion.div>
            </div>

            {/* Scrolling Container - Full Width - LEFT TO RIGHT */}
            <div className="relative w-full overflow-hidden">

                {/* Scrolling Track - Seamless loop animation */}
                <motion.div
                    className="inline-flex gap-4 sm:gap-6 py-2 whitespace-nowrap will-change-transform"
                    animate={{
                        x: ["-50%", "0%"]
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: Math.max(15, products.length * 2.5),
                            ease: "linear",
                        },
                    }}
                >
                    {/* Triple duplicate for seamless loop with no gaps */}
                    {[...products, ...products, ...products].map((product, index) => (
                        <div
                            key={`${product.id}-${index}`}
                            className="flex-shrink-0 w-[320px] sm:w-[380px] group inline-block"
                        >
                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-black rounded-2xl overflow-hidden h-full shadow-xl hover:shadow-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-[#FF6B35]/50 dark:hover:border-[#FF6B35]/50 transition-all">
                                    {/* Product Image */}
                                    <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                                        <img
                                            src={avatar(product.productImage)}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        
                                        {/* Badges - Top Left */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                                            {product.isBestseller && (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="px-3 py-1.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg"
                                                >
                                                    <Star className="w-3 h-3 fill-white" />
                                                    <span>BESTSELLER</span>
                                                </motion.div>
                                            )}
                                            {product.isFeatured && (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: 180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg"
                                                >
                                                    <Sparkles className="w-3 h-3" />
                                                    <span>FEATURED</span>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Category Badge - Top Right */}
                                        {product.category && (
                                            <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/20">
                                                {product.category.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-5">
                                        {/* Product Name */}
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 group-hover:text-[#FF6B35] transition-colors min-h-[3rem]">
                                            {product.name}
                                        </h3>

                                        {/* Description */}
                                        {product.description && (
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                                                {product.description}
                                            </p>
                                        )}

                                        {/* Features Preview */}
                                        {product.features && (
                                            <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-500">
                                                <Package className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#FF6B35]" />
                                                <p className="line-clamp-2 leading-relaxed">
                                                    {product.features.substring(0, 100)}...
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
                className="relative z-20 text-center mt-8 sm:mt-12 px-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <Link href="/landing/mall">
                    <motion.button
                        className="group inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-xl shadow-lg text-sm sm:text-base font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Explore AstroMall
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                    </motion.button>
                </Link>
            </motion.div>
        </section>
    );
}
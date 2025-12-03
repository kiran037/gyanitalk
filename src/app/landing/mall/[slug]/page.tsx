"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import LandingWrapper from "@/components/landing/LandingWrapper";
import {
    ShoppingBag, Star, TrendingUp, Check, ChevronRight,
    Package, Shield, Zap, Share2, ArrowLeft,
    Sparkles, Trophy, Users, CheckCircle2, Info
} from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";

interface ProductDetail {
    id: string;
    question: string;
    answer: string;
}

interface Category {
    id: string;
    name: string;
    image: string;
    displayOrder: number | null;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    features: string;
    productImage: string;
    gallery: string[];
    amount: number;
    isFeatured: boolean;
    isBestseller: boolean;
    category: Category;
    productDetails: ProductDetail[];
    statistics: {
        totalOrders: number;
        completedOrders: number;
        successRate: number;
    };
    createdAt: string | null;
    updatedAt: string | null;
}

interface RelatedProduct {
    id: string;
    name: string;
    slug: string;
    image: string;
    amount: number;
    description: string | null;
    isFeatured: boolean;
    isBestseller: boolean;
}

interface SEO {
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
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
    const [seo, setSeo] = useState<SEO | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "features">("features");

    useEffect(() => {
        if (slug) {
            fetchProductDetails();
        }
    }, [slug]);

    const fetchProductDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/landing/mall/${slug}`);
            const data = await response.json();

            if (data.success) {
                setProduct(data.data.product);
                setRelatedProducts(data.data.relatedProducts);
                setSeo(data.data.seo);
            } else {
                console.error("Product not found");
            }
        } catch (error) {
            console.error("Failed to fetch product:", error);
        } finally {
            setLoading(false);
        }
    };

    const allImages = product ? [product.productImage, ...product.gallery] : [];

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product?.name,
                    text: product?.description || '',
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        }
    };

    if (loading) {
        return (
            <LandingWrapper>
                <div className="min-h-screen flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-[#FF6B35] border-t-transparent rounded-full"
                    />
                </div>
            </LandingWrapper>
        );
    }

    if (!product) {
        return (
            <LandingWrapper>
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="text-center">
                        <Package className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">The product you're looking for doesn't exist.</p>
                        <Link href="/landing/mall">
                            <motion.button
                                className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-xl font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Back to Mall
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </LandingWrapper>
        );
    }

    return (
        <>
            <Head>
                <title>{seo?.metaTitle}</title>
                <meta name="description" content={seo?.metaDescription} />
                <meta name="keywords" content={seo?.metaKeywords} />
                <link rel="canonical" href={seo?.canonicalUrl} />
                <meta property="og:title" content={seo?.ogTitle} />
                <meta property="og:description" content={seo?.ogDescription} />
                <meta property="og:image" content={seo?.ogImage} />
                <meta name="twitter:title" content={seo?.twitterTitle} />
                <meta name="twitter:description" content={seo?.twitterDescription} />
                <meta name="twitter:image" content={seo?.twitterImage} />
                {seo?.schemaJson && (
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seo.schemaJson }} />
                )}
            </Head>

            <LandingWrapper>
                {/* Breadcrumb & Back Button */}
                <section className="pt-24 pb-4 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-4"
                        >
                            <motion.button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#FF6B35] transition-colors"
                                whileHover={{ x: -5 }}
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="text-sm font-medium">Back</span>
                            </motion.button>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Link href="/landing/mall" className="hover:text-[#FF6B35] transition-colors">Mall</Link>
                                <ChevronRight className="w-4 h-4" />
                                <Link href={`/landing/mall?categoryId=${product.category.id}`} className="hover:text-[#FF6B35] transition-colors">
                                    {product.category.name}
                                </Link>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">{product.name}</span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Main Product Section */}
                <section className="pb-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                            {/* Left - Image Gallery */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                className="space-y-4"
                            >
                                {/* Main Image with Badges */}
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 p-4">
                                    <AnimatePresence mode="wait">
                                        <motion.img
                                            key={selectedImage}
                                            src={avatar(allImages[selectedImage])}
                                            alt={product.name}
                                            className="w-full h-full object-contain"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </AnimatePresence>

                                    {/* Floating Badges */}
                                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                                        {product.isFeatured && (
                                            <motion.div
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                className="px-3 py-1.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg"
                                            >
                                                <Star className="w-3.5 h-3.5" />
                                                Featured
                                            </motion.div>
                                        )}
                                        {product.isBestseller && (
                                            <motion.div
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.1 }}
                                                className="px-3 py-1.5 bg-purple-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg"
                                            >
                                                <Trophy className="w-3.5 h-3.5" />
                                                Bestseller
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="absolute top-6 right-6 flex flex-col gap-2">

                                        <motion.button
                                            onClick={handleShare}
                                            className="w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Thumbnail Gallery */}
                                {allImages.length > 1 && (
                                    <div className="grid grid-cols-4 gap-3">
                                        {allImages.map((img, idx) => (
                                            <motion.button
                                                key={idx}
                                                onClick={() => setSelectedImage(idx)}
                                                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx
                                                    ? 'border-[#FF6B35] shadow-lg'
                                                    : 'border-gray-200/60 dark:border-gray-700/60'
                                                    }`}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <img
                                                    src={avatar(img)}
                                                    alt={`${product.name} ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                )}

                                {/* Trust Indicators - Mobile Only */}
                                <div className="lg:hidden grid grid-cols-3 gap-3">
                                    {[
                                        { icon: Shield, label: "Secure", desc: "100% Safe" },
                                        { icon: Zap, label: "Fast", desc: "Quick Delivery" },
                                        { icon: CheckCircle2, label: "Verified", desc: "Authentic" }
                                    ].map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + idx * 0.1 }}
                                            className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-3 text-center"
                                        >
                                            <item.icon className="w-5 h-5 text-[#FF6B35] mx-auto mb-1" />
                                            <div className="text-xs font-semibold text-gray-900 dark:text-white">{item.label}</div>
                                            <div className="text-[10px] text-gray-500">{item.desc}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Right - Product Info */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                className="space-y-6"
                            >
                                {/* Category Badge */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Link href={`/landing/mall?categoryId=${product.category.id}`}>
                                        <motion.span
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 border border-[#FF6B35]/20 rounded-full text-xs font-semibold text-[#FF6B35]"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            {product.category.name}
                                        </motion.span>
                                    </Link>
                                </motion.div>

                                {/* Product Name */}
                                <div>
                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 leading-tight"
                                    >
                                        {product.name}
                                    </motion.h1>
                                    {product.description && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-base text-gray-600 dark:text-gray-400 leading-relaxed"
                                        >
                                            {product.description}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Statistics */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center gap-4 flex-wrap"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">4.8</span>
                                    </div>
                                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                        <Users className="w-4 h-4 text-[#FF6B35]" />
                                        <span>{product.statistics.totalOrders}+ orders</span>
                                    </div>

                                </motion.div>

                                {/* Price & CTA */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-gradient-to-br from-orange-50/80 to-amber-50/80 dark:from-white/[0.03] dark:to-white/[0.03] backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-6"
                                >
                                    <div className="flex items-baseline gap-3 mb-4">
                                        <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                                            ₹{product.amount}
                                        </div>
                                        <div className="text-lg text-gray-500 line-through">₹{Math.round(product.amount * 1.3)}</div>
                                        <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-lg">
                                            {Math.round(((product.amount * 1.3 - product.amount) / (product.amount * 1.3)) * 100)}% OFF
                                        </div>
                                    </div>

                                    <Link href="/">
                                        <motion.button
                                            className="w-full py-4 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <ShoppingBag className="w-6 h-6" />
                                            Download App to Order
                                        </motion.button>
                                    </Link>
                                </motion.div>

                                {/* Trust Indicators - Desktop */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="hidden lg:grid grid-cols-3 gap-4"
                                >
                                    {[
                                        { icon: Shield, label: "100% Secure Payment", desc: "Your data is protected" },
                                        { icon: Zap, label: "Fast Delivery", desc: "Get it within 3-5 days" },
                                        { icon: CheckCircle2, label: "Verified Product", desc: "Authentic guarantee" }
                                    ].map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
                                            whileHover={{ scale: 1.05, borderColor: "rgba(255, 107, 53, 0.5)" }}
                                        >
                                            <item.icon className="w-6 h-6 text-[#FF6B35] mb-2" />
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{item.label}</div>
                                            <div className="text-xs text-gray-500">{item.desc}</div>
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {/* Quick Stats */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
                                        <div className="text-2xl font-bold text-[#FF6B35] mb-1">{product.productDetails.length}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Key Features</div>
                                    </div>

                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Tabs Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="mt-16"
                        >
                            {/* Tab Headers */}
                            <div className="flex gap-2 mb-6 border-b border-gray-200/60 dark:border-gray-700/60">
                                {[
                                    { id: "features", label: "Features & Benefits", icon: Sparkles },
                                    { id: "details", label: "Product Details", icon: Package }
                                ].map((tab) => (
                                    <motion.button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all relative ${activeTab === tab.id
                                            ? 'text-[#FF6B35]'
                                            : 'text-gray-600 dark:text-gray-400'
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347]"
                                            />
                                        )}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <AnimatePresence mode="wait">
                                {activeTab === "features" && (
                                    <motion.div
                                        key="features"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-6 sm:p-8"
                                    >
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                            <Sparkles className="w-6 h-6 text-[#FF6B35]" />
                                            Key Features & Benefits
                                        </h2>
                                        <div className="prose prose-gray dark:prose-invert max-w-none">
                                            <div
                                                className="text-gray-700 dark:text-gray-300 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: product.features }}
                                            />
                                        </div>

                                        {/* Feature Highlights */}
                                        <div className="grid sm:grid-cols-2 gap-4 mt-8">
                                            {[
                                                { icon: Shield, title: "Authentic & Verified", desc: "100% genuine products" },
                                                { icon: Zap, title: "Instant Results", desc: "Experience immediate benefits" },
                                                { icon: Users, title: "Expert Guidance", desc: "Professional consultation included" },
                                                { icon: Star, title: "Premium Quality", desc: "Top-rated by customers" }
                                            ].map((feature, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="flex items-start gap-3 p-4 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl"
                                                    whileHover={{ scale: 1.03, borderColor: "rgba(255, 107, 53, 0.5)" }}
                                                >
                                                    <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <feature.icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "details" && (
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-4"
                                    >
                                        {product.productDetails.map((detail, idx) => (
                                            <motion.div
                                                key={detail.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 overflow-hidden"
                                                whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.5)" }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                                            {detail.question}
                                                        </h3>
                                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                            {detail.answer}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {product.productDetails.length === 0 && (
                                            <div className="text-center py-12 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl">
                                                <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                                <p className="text-gray-600 dark:text-gray-400">No additional details available</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Related Products */}
                        {relatedProducts.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="mt-16"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <TrendingUp className="w-7 h-7 text-[#FF6B35]" />
                                        You May Also Like
                                    </h2>
                                    <Link href="/landing/mall">
                                        <motion.button
                                            className="text-sm font-medium text-[#FF6B35] flex items-center gap-1"
                                            whileHover={{ gap: "8px" }}
                                        >
                                            View All
                                            <ChevronRight className="w-4 h-4" />
                                        </motion.button>
                                    </Link>
                                </div>

                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {relatedProducts.map((related, idx) => (
                                        <motion.div
                                            key={related.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <Link href={`/landing/mall/${related.slug}`}>
                                                <motion.article
                                                    className="h-full bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden group"
                                                    whileHover={{
                                                        scale: 1.03,
                                                        borderColor: "rgba(255, 107, 53, 0.5)",
                                                        boxShadow: "0 10px 30px rgba(255, 107, 53, 0.15)"
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <div className="relative h-48 overflow-hidden">
                                                        <img
                                                            src={avatar(related.image)}
                                                            alt={related.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        {related.isFeatured && (
                                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-[10px] font-bold rounded-lg">
                                                                Featured
                                                            </div>
                                                        )}
                                                        {related.isBestseller && (
                                                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-lg">
                                                                Bestseller
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-4">
                                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#FF6B35] transition-colors line-clamp-2">
                                                            {related.name}
                                                        </h3>
                                                        {related.description && (
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                                {related.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center justify-between pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
                                                            <div className="text-xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                                                                ₹{related.amount}
                                                            </div>
                                                            <motion.button
                                                                className="px-3 py-1.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-xs font-medium rounded-lg"
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                View
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </motion.article>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Customer Reviews Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="mt-16"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                                <Star className="w-7 h-7 text-[#FF6B35]" />
                                Customer Reviews
                            </h2>

                            <div className="grid lg:grid-cols-3 gap-6">


                                {/* Sample Reviews */}
                                <div className="lg:col-span-4 space-y-4">
                                    {[
                                        { name: "Priya Sharma", rating: 5, comment: "Absolutely amazing product! Exceeded all my expectations. The quality is outstanding and I've already noticed positive changes.", date: "2 days ago" },
                                        { name: "Rahul Verma", rating: 5, comment: "Authentic and genuine. Highly recommend to everyone looking for quality astrology products.", date: "1 week ago" },
                                        { name: "Anjali Patel", rating: 4, comment: "Great product with fast delivery. Very satisfied with my purchase and the customer service.", date: "2 weeks ago" }
                                    ].map((review, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
                                            whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.5)" }}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{review.name}</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{review.date}</p>
                                                </div>
                                                <div className="flex">
                                                    {[...Array(review.rating)].map((_, i) => (
                                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {review.comment}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* FAQ Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                            className="mt-16"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                                <Info className="w-7 h-7 text-[#FF6B35]" />
                                Frequently Asked Questions
                            </h2>

                            <div className="space-y-4">
                                {[
                                    { q: "How do I use this product?", a: "Detailed instructions are included with the product. You can also consult with our expert astrologers for personalized guidance." },
                                    { q: "Is this product authentic?", a: "Yes, all our products are 100% authentic and verified by expert astrologers. We guarantee genuineness." },
                                    { q: "How long does delivery take?", a: "Standard delivery takes 3-5 business days. Express delivery options are also available at checkout." }
                                ].map((faq, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
                                        whileHover={{ scale: 1.01, borderColor: "rgba(255, 107, 53, 0.5)" }}
                                    >
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                            <div className="w-6 h-6 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-xs font-bold">Q</span>
                                            </div>
                                            {faq.q}
                                        </h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed ml-8">
                                            {faq.a}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>
                {/* Floating Action Bar - Mobile */}
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200/60 dark:border-gray-700/60 p-4 z-50 shadow-lg"
                >
                    <Link href="/" className="block">
                        <motion.button
                            className="w-full py-3.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-xl font-bold text-base flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Download App to Order
                        </motion.button>
                    </Link>
                </motion.div>
            </LandingWrapper>
        </>
    );
}
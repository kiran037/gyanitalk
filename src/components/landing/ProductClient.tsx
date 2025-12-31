"use client";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingWrapper from "@/components/landing/LandingWrapper";
import {
  ShoppingBag,
  Star,
  TrendingUp,
  Check,
  ChevronRight,
  Package,
  Shield,
  Zap,
  Share2,
  ArrowLeft,
  Sparkles,
  Trophy,
  Users,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";

/* ================= TYPES ================= */

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

type TabId = "details" | "features";

/* ================= COMPONENT ================= */

export default function ProductClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: RelatedProduct[];
}) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>("features");

  const allImages = useMemo(
    () => [product.productImage, ...(product.gallery || [])],
    [product],
  );

  useEffect(() => {
    if (!product) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "product_schema",
      // Product schema data
      schema_type: "product",
      name: product.name,
      price: product.amount.toString(),
      currency: "INR",
      availability: "InStock",
      image: avatar(product.productImage),
      category: product.category.name,
      category_id: product.category.id,
      is_featured: product.isFeatured,
      is_bestseller: product.isBestseller,
      // Breadcrumb data
      breadcrumb_home: "Home",
      breadcrumb_home_url: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
      breadcrumb_parent: "Mall",
      breadcrumb_parent_url: `${process.env.NEXT_PUBLIC_SITE_URL}/mall`,
      breadcrumb_category: product.category.name,
      breadcrumb_category_url: `${process.env.NEXT_PUBLIC_SITE_URL}/mall?categoryId=${product.category.id}`,
      breadcrumb_current: product.name,
      breadcrumb_current_url: typeof window !== 'undefined' ? window.location.href : "",
      // Additional product details
      total_orders: product.statistics.totalOrders,
      completed_orders: product.statistics.completedOrders,
      success_rate: product.statistics.successRate,
    });
  }, [product]);

  const handleShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: product.name,
        text: product.description || "",
        url: window.location.href,
      });
    } catch {
      // user cancelled – ignore
    }
  };

function redirectToAppStore() {
  if (typeof window === "undefined") return;

  const ua = navigator.userAgent || "";

  const isAndroid = /android/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua);

  // 📱 Android → Play Store
  if (isAndroid) {
    window.location.href =
      "https://play.google.com/store/apps/details?id=com.app.gyanitalk";
    return;
  }

  // 📱 iOS → App Store
  if (isIOS) {
    window.location.href =
      "https://apps.apple.com/in/app/gyanitalk/id6742021396";
    return;
  }

  // 🖥 Desktop → open Play Store in new tab
  window.open(
    "https://play.google.com/store/apps/details?id=com.app.gyanitalk",
    "_blank",
    "noopener,noreferrer"
  );
}

  return (
    <LandingWrapper>
      {/* Breadcrumb & Back Button */}
      <nav
        aria-label="Breadcrumb"
        className="px-4 pb-3 pt-20 sm:px-6 sm:pb-4 sm:pt-24 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-2 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <motion.button
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-[#FF6B35] dark:text-gray-400"
              whileHover={prefersReducedMotion ? {} : { x: -5 }}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </motion.button>
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto text-xs text-gray-500 sm:text-sm">
              <Link
                href="/mall"
                className="flex-shrink-0 transition-colors hover:text-[#FF6B35]"
              >
                Mall
              </Link>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
              <Link
                href={`/mall?categoryId=${product.category.id}`}
                className="flex-shrink-0 transition-colors hover:text-[#FF6B35]"
              >
                {product.category.name}
              </Link>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
              <span className="max-w-[180px] truncate font-medium text-gray-900 dark:text-white sm:max-w-[240px]">
                {product.name}
              </span>
            </div>
          </motion.div>
        </div>
      </nav>

      {/* Main Product Section */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left - Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Main Image with Badges */}
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-200/60 bg-white/60 p-3 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    className="relative h-full w-full"
                  >
                    <Image
                      src={avatar(allImages[selectedImage])}
                      alt={product.name}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Floating Badges */}
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  {product.isFeatured && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-2.5 py-1 text-[11px] font-bold text-white shadow-lg"
                    >
                      <Star className="h-3.5 w-3.5" />
                      Featured
                    </motion.div>
                  )}
                  {product.isBestseller && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-1.5 rounded-lg bg-purple-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg"
                    >
                      <Trophy className="h-3.5 w-3.5" />
                      Bestseller
                    </motion.div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute right-4 top-4 flex flex-col gap-2">
                  <motion.button
                    onClick={handleShare}
                    aria-label="Share this product"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm dark:bg-gray-900/90 sm:h-10 sm:w-10"
                    whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.94 }}
                  >
                    <Share2 className="h-4.5 w-4.5 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {allImages.map((img, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                        selectedImage === idx
                          ? "border-[#FF6B35] shadow-lg"
                          : "border-gray-200/60 dark:border-gray-700/60"
                      }`}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.04 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
                    >
                      <img
                        src={avatar(img)}
                        alt={`${product.name} ${idx + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Trust Indicators - Mobile Only */}
              <div className="grid grid-cols-3 gap-3 lg:hidden">
                {[
                  { icon: Shield, label: "Secure", desc: "100% Safe" },
                  { icon: Zap, label: "Fast", desc: "Quick Delivery" },
                  { icon: CheckCircle2, label: "Verified", desc: "Authentic" },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    className="rounded-xl border border-gray-200/60 bg-white/60 p-3 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
                  >
                    <item.icon className="mx-auto mb-1 h-5 w-5 text-[#FF6B35]" />
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-gray-500">{item.desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right - Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-5 sm:space-y-6"
            >
              {/* Category Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link href={`/mall?categoryId=${product.category.id}`}>
                  <motion.span
                    className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 px-3 py-1.5 text-xs font-semibold text-[#FF6B35]"
                    whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  >
                    <Sparkles className="h-3 w-3" />
                    {product.category.name}
                  </motion.span>
                </Link>
              </motion.div>

              {/* Product Name + Description */}
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-2 text-2xl font-bold leading-tight text-gray-900 dark:text-white sm:mb-3 sm:text-3xl lg:text-4xl"
                >
                  {product.name}
                </motion.h1>
                {product.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base"
                  >
                    {product.description}
                  </motion.p>
                )}
              </div>

              {/* Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex flex-wrap items-center gap-3 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    4.8
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4 text-[#FF6B35]" />
                  <span>{product.statistics.totalOrders}+ orders</span>
                </div>
              </motion.div>

              {/* Price & CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-gray-200/60 bg-gradient-to-br from-orange-50/80 to-amber-50/80 p-5 backdrop-blur-sm dark:border-gray-700/60 dark:from-white/[0.03] dark:to-white/[0.03] sm:p-6"
              >
                <div className="mb-4 flex items-baseline gap-2 sm:gap-3">
                  <div className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                    ₹{product.amount}
                  </div>
                  <div className="text-sm text-gray-500 line-through sm:text-base">
                    ₹{Math.round(product.amount * 1.3)}
                  </div>
                  <div className="rounded-lg bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400 sm:py-1 sm:text-xs">
                    {Math.round(
                      ((product.amount * 1.3 - product.amount) /
                        (product.amount * 1.3)) *
                        100,
                    )}
                    % OFF
                  </div>
                </div>

                <motion.button
                  onClick={redirectToAppStore}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] py-3.5 text-base font-bold text-white shadow-lg sm:gap-3 sm:py-4 sm:text-lg"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                >
                  <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                  Download App to Order
                </motion.button>
              </motion.div>

              {/* Trust Indicators - Desktop */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="hidden grid-cols-3 gap-4 lg:grid"
              >
                {[
                  {
                    icon: Shield,
                    label: "100% Secure Payment",
                    desc: "Your data is protected",
                  },
                  {
                    icon: Zap,
                    label: "Fast Delivery",
                    desc: "Get it within 3-5 days",
                  },
                  {
                    icon: CheckCircle2,
                    label: "Verified Product",
                    desc: "Authentic guarantee",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="rounded-xl border border-gray-200/60 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
                    whileHover={
                      prefersReducedMotion
                        ? {}
                        : {
                            scale: 1.04,
                            borderColor: "rgba(255, 107, 53, 0.5)",
                          }
                    }
                  >
                    <item.icon className="mb-2 h-6 w-6 text-[#FF6B35]" />
                    <div className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-3 sm:gap-4"
              >
                <div className="rounded-xl border border-gray-200/60 bg-white/60 p-3 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:p-4">
                  <div className="mb-1 text-xl font-bold text-[#FF6B35] sm:text-2xl">
                    {product.productDetails.length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                    Key Features
                  </div>
                </div>
                {/* (you can add more quick stat cards here later) */}
              </motion.div>
            </motion.div>
          </div>

          {/* Tabs Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-10 sm:mt-14"
          >
            {/* Tab Headers */}
            <div
              role="tablist"
              aria-label="Product information tabs"
              className="no-scrollbar mb-5 flex gap-1 overflow-x-auto border-b border-gray-200/60 dark:border-gray-700/60 sm:mb-6 sm:gap-2"
            >
              {[
                {
                  id: "features",
                  label: "Features & Benefits",
                  icon: Sparkles,
                },
                { id: "details", label: "Product Details", icon: Package },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`relative flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-xs font-semibold transition-all sm:gap-2 sm:px-6 sm:py-3 sm:text-sm ${
                    activeTab === tab.id
                      ? "text-[#FF6B35]"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                >
                  <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                  role="tabpanel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                  className="dark:bg.white/5 rounded-2xl border border-gray-200/60 bg-white/60 p-5 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:p-8"
                >
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white sm:mb-6 sm:text-2xl">
                    <Sparkles className="h-5 w-5 text-[#FF6B35] sm:h-6 sm:w-6" />
                    Key Features & Benefits
                  </h2>
                  <div className="prose prose-sm sm:prose-base prose-gray dark:prose-invert max-w-none">
                    <div
                      className="leading-relaxed text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ __html: product.features }} // Content is sanitized server-side before storage
                    />
                  </div>

                  {/* Feature Highlights */}
                  <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
                    {[
                      {
                        icon: Shield,
                        title: "Authentic & Verified",
                        desc: "100% genuine products",
                      },
                      {
                        icon: Zap,
                        title: "Instant Results",
                        desc: "Experience immediate benefits",
                      },
                      {
                        icon: Users,
                        title: "Expert Guidance",
                        desc: "Professional consultation included",
                      },
                      {
                        icon: Star,
                        title: "Premium Quality",
                        desc: "Top-rated by customers",
                      },
                    ].map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="flex items-start gap-3 rounded-xl border border-gray-200/60 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
                        whileHover={
                          prefersReducedMotion
                            ? {}
                            : {
                                scale: 1.03,
                                borderColor: "rgba(255, 107, 53, 0.5)",
                              }
                        }
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FFB347] sm:h-10 sm:w-10">
                          <feature.icon className="h-4.5 w-4.5 text-white" />
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                            {feature.desc}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "details" && (
                <motion.div
                  key="details"
                  role="tabpanel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3 sm:space-y-4"
                >
                  {product.productDetails.map((detail, idx) => (
                    <motion.div
                      key={detail.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="overflow-hidden rounded-xl border border-gray-200/60 bg-white/60 p-5 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:p-6"
                      whileHover={
                        prefersReducedMotion
                          ? {}
                          : {
                              scale: 1.02,
                              borderColor: "rgba(255, 107, 53, 0.5)",
                            }
                      }
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FFB347] sm:h-8 sm:w-8">
                          <Check className="h-4.5 w-4.5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1.5 text-sm font-bold text-gray-900 dark:text-white sm:mb-2 sm:text-lg">
                            {detail.question}
                          </h3>
                          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                            {detail.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {product.productDetails.length === 0 && (
                    <div className="rounded-2xl border border-gray-200/60 bg-white/60 py-10 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:py-12">
                      <Package className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600 sm:mb-4 sm:h-16 sm:w-16" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                        No additional details available
                      </p>
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
              transition={{ delay: 0.55 }}
              className="mt-12 sm:mt-16"
            >
              <div className="mb-6 flex items-center justify-between sm:mb-8">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
                  <TrendingUp className="h-6 w-6 text-[#FF6B35] sm:h-7 sm:w-7" />
                  You May Also Like
                </h2>
                <Link href="/mall">
                  <motion.button
                    className="flex items-center gap-1 text-xs font-medium text-[#FF6B35] sm:text-sm"
                    whileHover={prefersReducedMotion ? {} : { x: 2 }}
                  >
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {relatedProducts.map((related, idx) => (
                  <motion.div
                    key={related.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                  >
                    <Link href={`/mall/${related.slug}`}>
                      <motion.article
                        itemScope
                        itemType="https://schema.org/Product"
                        className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
                        whileHover={
                          prefersReducedMotion
                            ? {}
                            : {
                                scale: 1.03,
                                borderColor: "rgba(255, 107, 53, 0.5)",
                                boxShadow:
                                  "0 10px 30px rgba(255, 107, 53, 0.15)",
                              }
                        }
                        transition={{ duration: 0.2 }}
                      >
                        <div className="relative h-40 overflow-hidden sm:h-48">
                          <img
                            src={avatar(related.image)}
                            alt={related.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          {related.isFeatured && (
                            <div className="absolute left-2 top-2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-2 py-0.5 text-[10px] font-bold text-white">
                              Featured
                            </div>
                          )}
                          {related.isBestseller && (
                            <div className="absolute right-2 top-2 rounded-lg bg-purple-500 px-2 py-0.5 text-[10px] font-bold text-white">
                              Bestseller
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-4">
                          <h3 className="mb-2 line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-[#FF6B35] dark:text-white sm:text-base">
                            {related.name}
                          </h3>
                          {related.description && (
                            <p className="mb-3 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                              {related.description}
                            </p>
                          )}
                          <div className="mt-auto flex items-center justify-between border-t border-gray-200/60 pt-3 dark:border-gray-700/60">
                            <div className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-lg font-bold text-transparent sm:text-xl">
                              ₹{related.amount}
                            </div>
                            <motion.button
                              className="rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-3 py-1.5 text-xs font-medium text-white"
                              whileHover={
                                prefersReducedMotion ? {} : { scale: 1.05 }
                              }
                              whileTap={
                                prefersReducedMotion ? {} : { scale: 0.95 }
                              }
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
            transition={{ delay: 0.65 }}
            className="mt-12 sm:mt-16"
          >
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white sm:mb-8 sm:text-2xl lg:text-3xl">
              <Star className="h-6 w-6 text-[#FF6B35] sm:h-7 sm:w-7" />
              Customer Reviews
            </h2>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
              {/* Sample Reviews */}
              <div className="space-y-3 sm:space-y-4 lg:col-span-3">
                {[
                  {
                    name: "Priya Sharma",
                    rating: 5,
                    comment:
                      "Absolutely amazing product! Exceeded all my expectations. The quality is outstanding and I've already noticed positive changes.",
                    date: "2 days ago",
                  },
                  {
                    name: "Rahul Verma",
                    rating: 5,
                    comment:
                      "Authentic and genuine. Highly recommend to everyone looking for quality astrology products.",
                    date: "1 week ago",
                  },
                  {
                    name: "Anjali Patel",
                    rating: 4,
                    comment:
                      "Great product with fast delivery. Very satisfied with my purchase and the customer service.",
                    date: "2 weeks ago",
                  },
                ].map((review, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="rounded-xl border border-gray-200/60 bg-white/60 p-5 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:p-6"
                    whileHover={
                      prefersReducedMotion
                        ? {}
                        : {
                            scale: 1.02,
                            borderColor: "rgba(255, 107, 53, 0.5)",
                          }
                    }
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                          {review.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 sm:text-xs">
                          {review.date}
                        </p>
                      </div>
                      <div className="flex">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 sm:h-4 sm:w-4"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 sm:text-sm">
                      {review.comment}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating Action Bar - Mobile */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/60 bg-white/95 p-3 shadow-lg backdrop-blur-lg dark:border-gray-700/60 dark:bg-gray-900/95 sm:p-4 lg:hidden"
      >
        <motion.button
          onClick={redirectToAppStore}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] py-3 text-sm font-bold text-white sm:py-3.5 sm:text-base"
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        >
          <ShoppingBag className="h-5 w-5" />
          Download App to Order
        </motion.button>
      </motion.div>
    </LandingWrapper>
  );
}

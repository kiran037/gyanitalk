
// components/landing/HomeClient.tsx
"use client";

import LandingWrapper from "@/components/landing/LandingWrapper";
import {
  Zap,
  Wallet,
  Star,
  Shield,
  Clock,
  Users,
  ChevronRight,
  Sparkles,
  Moon
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import HomeMain from "@/components/landing/home/HomeMain";
import { useSecretGyani } from "./home/useSecretGyani";

// Lazy-load heavy/animated sections for performance
const AppDownloadPopup = dynamic(
  () => import("@/components/landing/home/AppDownloadPopup"),
  { ssr: false }
);

const AstrologerCarousel = dynamic(
  () => import("@/components/landing/home/AstrologerCarousel"),
  {
    ssr: false,
    loading: () => <div className="h-[320px] w-full bg-gray-50 dark:bg-gray-900 animate-pulse rounded-3xl" aria-hidden="true" />,
  }
);

const ProductCarousel = dynamic(
  () => import("@/components/landing/home/ProductCarousel"),
  { ssr: false }
);

const PlaystoreReviewCarousel = dynamic(
  () => import("@/components/landing/home/PlaystoreReviewCarousel"),
  { ssr: false }
);

const KundaliCard = dynamic(
  () => import("@/components/landing/home/KundaliCard"),
  { ssr: false }
);

const NewsCarousel = dynamic(
  () => import("@/components/landing/home/NewsCarousel"),
  { ssr: false }
);

const BlogCarousel = dynamic(
  () => import("@/components/landing/home/BlogCarousel"),
  { ssr: false }
);


const FaqComponent = dynamic(
  () => import("@/components/landing/home/FaqComponent"),
  { ssr: false }
);

const ZodiacSignComponent = dynamic(
  () => import("@/components/landing/home/ZodiacSignComponent"),
  { ssr: false }
);

const AstrologerService = dynamic(
  () => import("@/components/landing/home/AstrologerService"),
  { ssr: false }
);

const TestimonialVideos = dynamic(
  () => import("@/components/landing/home/TestimonialVideos"),
  { ssr: false }
);

const HomeContent = dynamic(
  () => import("@/components/landing/home/HomeContent"),
  { ssr: false }
);

const ScratchAndWin = dynamic(
  () => import("@/components/landing/home/ScratchAndWin"),
  { ssr: false }
);

const HomeFeatures= dynamic(
  () => import("@/components/landing/home/HomeFeatures"),
  { ssr: false }
);

const HomeBenefits= dynamic(
  () => import("@/components/landing/home/HomeBenefits"),
  { ssr: false }
);





export default function HomeClient() {
  useSecretGyani();
  const prefersReducedMotion = useReducedMotion();

  return (
    <LandingWrapper>
      <AppDownloadPopup />

      {/* 1. HERO SECTION */}
      <HomeMain />
      <KundaliCard />
      <AstrologerService />
      <ZodiacSignComponent />

      {/* 3. DYNAMIC SECTIONS */}
      <div className="">
        <AstrologerCarousel />
        <ProductCarousel />
        <BlogCarousel />
        <NewsCarousel/>
      </div>

<HomeBenefits />

      {/* 5. REVIEWS */}
      <PlaystoreReviewCarousel />
      <TestimonialVideos />
      <HomeContent />
      <HomeFeatures />
      <FaqComponent />
      <ScratchAndWin />
    </LandingWrapper>
  );
}
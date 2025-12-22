// app/landing/horoscope/page.tsx
import type { Metadata } from "next";
import HoroscopeClient from "./HoroscopeClient";
import { prisma } from "@/lib/prisma";

/* ================= SEO (SERVER ONLY) ================= */

async function getHoroscopePageSeo() {
  return prisma.pages.findFirst({
    where: {
      type: "home", // You can create a separate "horoscope" type if needed
      isActive: true,
    },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getHoroscopePageSeo();

  const title =
    seo?.metaTitle ??
    "Daily Horoscope | Free Astrology Predictions | Gyanitalk";

  const description =
    seo?.metaDescription ??
    "Get your free daily, weekly, and yearly horoscope readings. Discover what the stars have in store for your zodiac sign with accurate astrology predictions.";

  const canonical =
    seo?.canonicalUrl ??
    `${process.env.NEXT_PUBLIC_SITE_URL}/landing/horoscope`;

  const ogImage =
    seo?.ogImage ??
    `${process.env.NEXT_PUBLIC_SITE_URL}/horoscope-og.jpg`;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),

    title,
    description,

    keywords: [
      "daily horoscope",
      "zodiac predictions",
      "astrology",
      "horoscope today",
      "free horoscope",
      "weekly horoscope",
      "yearly horoscope",
      "aries horoscope",
      "taurus horoscope",
      "gemini horoscope",
      "cancer horoscope",
      "leo horoscope",
      "virgo horoscope",
      "libra horoscope",
      "scorpio horoscope",
      "sagittarius horoscope",
      "capricorn horoscope",
      "aquarius horoscope",
      "pisces horoscope",
    ].join(", "),

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title: seo?.ogTitle ?? title,
      description: seo?.ogDescription ?? description,
      url: canonical,
      siteName: "Gyanitalk",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: seo?.twitterTitle ?? title,
      description: seo?.twitterDescription ?? description,
      images: [seo?.twitterImage ?? ogImage],
    },
  };
}

/* ================= PAGE ================= */

export default function HoroscopePage() {
  return (
    <>
      <h1 className="sr-only">Daily Horoscope - Your Zodiac Predictions</h1>
      <HoroscopeClient />
    </>
  );
}
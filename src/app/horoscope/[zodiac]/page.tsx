import HoroscopeClient from "../HoroscopeClient";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cache, Suspense } from "react";

interface PageProps {
  params: Promise<{ zodiac: string }>;
}
const DEFAULT_TITLES: Record<string, string> = {
  aries: "Aries Horoscope Today | Gyanitalk",
  taurus: "Taurus Horoscope Today | Gyanitalk",
  gemini: "Gemini Horoscope Today | Gyanitalk",
  cancer: "Cancer Horoscope Today | Gyanitalk",
  leo: "Leo Horoscope Today | Gyanitalk",
  virgo: "Virgo Horoscope Today | Gyanitalk",
  libra: "Libra Horoscope Today | Gyanitalk",
  scorpio: "Scorpio Horoscope Today | Gyanitalk",
  sagittarius: "Sagittarius Horoscope Today | Gyanitalk",
  capricorn: "Capricorn Horoscope Today | Gyanitalk",
  aquarius: "Aquarius Horoscope Today | Gyanitalk",
  pisces: "Pisces Horoscope Today | Gyanitalk",
};


export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { zodiac } = await params;
  const zodiacSlug = zodiac?.toLowerCase();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const title =
    DEFAULT_TITLES[zodiacSlug] ??
    "Daily Horoscope | Free Astrology Predictions | Gyanitalk";

  const description =
    `Read accurate ${zodiacSlug} horoscope predictions for today, this week, and this year. Get free astrology insights on love, career, health, and money.`;

  const canonical =
    `${baseUrl}/horoscope/${zodiacSlug}`;

  const ogImage =
    `${baseUrl}/horoscope-og.jpg`;

  const keywords = [
    `${zodiacSlug} horoscope`,
    "daily horoscope",
    "zodiac predictions",
    "astrology",
    "horoscope today",
    "free horoscope",
  ];

  return {
    metadataBase: new URL(baseUrl),

    title,
    description,
    keywords,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title: title,
      description: description,
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
      title: title,
      description: description,
      images: [ogImage],
    },
  };
}

export default function HoroscopeZodiacPage() {
  return <HoroscopeClient />;
}
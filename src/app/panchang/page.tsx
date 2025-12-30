// app/landing/panchang/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import PanchangClient from "./PanchangClient";

/* ================= SEO (SERVER ONLY) ================= */

export async function generateMetadata(): Promise<Metadata> {
  const title = "Daily Panchang | Hindu Calendar & Auspicious Timings | Gyanitalk";
  const description = "Get accurate daily Panchang with Tithi, Nakshatra, Yoga, Karana, and auspicious timings. Plan your important events according to Vedic astrology.";
  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL}/panchang`;
  const ogImage = `${process.env.NEXT_PUBLIC_SITE_URL}/panchang-og.jpg`;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),

    title,
    description,

    keywords: [
      "panchang",
      "daily panchang",
      "hindu calendar",
      "tithi",
      "nakshatra",
      "yoga",
      "karana",
      "auspicious timings",
      "muhurat",
      "vedic calendar",
      "hindu panchang",
      "today panchang",
      "panchangam",
      "rahukaal",
      "gulika kalam",
      "abhijit muhurat",
    ].join(", "),

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title,
      description,
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
      title,
      description,
      images: [ogImage],
    },
  };
}

/* ================= PAGE ================= */

export default function PanchangPage() {
  return (
    <>
      <h1 className="sr-only">
        Daily Panchang - Hindu Calendar & Auspicious Timings
      </h1>

      <Suspense fallback={null}>
        <PanchangClient />
      </Suspense>
    </>
  );
}
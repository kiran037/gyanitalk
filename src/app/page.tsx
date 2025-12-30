// app/page.tsx
import type { Metadata } from "next";
import HomeClient from "@/components/landing/HomeClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gyanitalk.com";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${SITE_URL}/api/landing/home`, {
      // SEO should always be fresh
      cache: "no-store",
    });

    if (!res.ok) throw new Error("SEO fetch failed");

    const json = await res.json();
    const seo = json?.data;

    // Fallback if page not created yet
    if (!seo) {
      return {
        title: "Gyanitalk – Talk to Astrologers Online",
        description:
          "Talk to verified astrologers online. Get horoscope, kundli, astrology guidance & spiritual insights on Gyanitalk.",
        alternates: {
          canonical: SITE_URL,
        },
      };
    }

    return {
      title: seo.metaTitle || seo.title || "Gyanitalk",
      description: seo.metaDescription || seo.description || "",

      alternates: {
        canonical: seo.canonicalUrl || SITE_URL,
      },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: seo.ogTitle || seo.metaTitle || seo.title,
        description: seo.ogDescription || seo.metaDescription,
        url: seo.canonicalUrl || SITE_URL,
        images: seo.ogImage
          ? [{ url: seo.ogImage }]
          : [{ url: "/og-default.jpg" }],
        type: "website",
      },

      twitter: {
        card: "summary_large_image",
        title: seo.twitterTitle || seo.metaTitle || seo.title,
        description:
          seo.twitterDescription || seo.metaDescription || "",
        images: seo.twitterImage
          ? [seo.twitterImage]
          : ["/og-default.jpg"],
      },

      // Helps Google understand freshness
      other: {
        "last-modified": seo.updated_at,
      },
    };
  } catch (error) {
    // Hard fallback (never break SEO)
    return {
      title: "Gyanitalk – Talk to Astrologers Online",
      description:
        "Talk to verified astrologers online. Get horoscope, kundli, astrology guidance & spiritual insights on Gyanitalk.",
      alternates: {
        canonical: SITE_URL,
      },
    };
  }
}

export default function HomePage() {
  return <HomeClient />;
}
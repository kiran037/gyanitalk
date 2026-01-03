import { Metadata } from "next";
import { notFound } from "next/navigation";
import AstrologerDetailClient from "./AstrologerDetailClient";

// 🚀 FORCE DYNAMIC: Disables all caching for this page
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/* ================= CONFIG ================= */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://app.gyanitalk.com";
const AWS_URL = "https://gyanitalk.s3.ap-south-1.amazonaws.com";

/* ================= HELPER ================= */

// Fixes paths for SEO/Metadata only (Client uses lib/images)
const getAbsoluteSeoImage = (path: string | null) => {
  if (!path) return `${AWS_URL}/default-avatar.png`; // Fallback if needed
  if (path.startsWith("http")) return path;
  const cleanPath = path.replace(/^(\/)?public\//, "").replace(/^\//, "");
  return `${AWS_URL}/${cleanPath}`;
};

/* ================= DATA FETCHING ================= */

async function getAstrologer(slug: string) {
  try {
    // timestamp added to prevent browser/network caching
    const res = await fetch(`${SITE_URL}/api/landing/astro/${slug}?t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" }
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Failed to fetch astrologer:", error);
    return null;
  }
}

/* ================= METADATA ================= */

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const astrologer = await getAstrologer(slug);

  if (!astrologer || !astrologer.seo) {
    return {
      title: "Astrologer Not Found | GyaniTalk",
      robots: { index: false, follow: false } // Don't index 404s
    };
  }

  const seo = astrologer.seo;
  const absoluteImage = getAbsoluteSeoImage(seo.ogImage || astrologer.profileImage);
  const canonicalUrl = `${SITE_URL}/landing/astro/${astrologer.slug}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: seo.metaTitle || `${astrologer.name} - Astrologer`,
    description: seo.metaDescription,
    keywords: seo.metaKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle,
      description: seo.ogDescription || seo.metaDescription,
      url: canonicalUrl,
      siteName: "GyaniTalk",
      images: [
        {
          url: absoluteImage,
          width: 1200,
          height: 630,
          alt: astrologer.name,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle || seo.metaTitle,
      description: seo.twitterDescription || seo.metaDescription,
      images: [absoluteImage],
    },
  };
}

/* ================= PAGE COMPONENT ================= */

export default async function AstrologerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const astrologer = await getAstrologer(slug);

  if (!astrologer) {
    notFound();
  }

  // Inject absolute images into Schema
  let structuredData = null;
  let breadcrumbData = null;

  try {
    if (astrologer.seo?.schemaJson) {
      structuredData = JSON.parse(astrologer.seo.schemaJson);
      if (structuredData.image) {
        structuredData.image = getAbsoluteSeoImage(structuredData.image);
      }
    }
    if (astrologer.seo?.breadcrumbSchema) {
      breadcrumbData = JSON.parse(astrologer.seo.breadcrumbSchema);
    }
  } catch (e) {
    console.error("Schema parse error", e);
  }

  return (
    <>
      {/* Hidden H1 for SEO */}
      <h1 className="sr-only">{astrologer.name} - {astrologer.primarySkill}</h1>

      {/* JSON-LD Schemas */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
      )}

      <AstrologerDetailClient astrologer={astrologer} />
    </>
  );
}
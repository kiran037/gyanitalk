// app/landing/terms-of-service/page.tsx
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { pages_type } from "@prisma/client";
import { cache } from "react";
import TermsOfServiceClient from "./TermsOfServiceClient";

/* ================= SEO (SERVER ONLY) ================= */

const getTermsSEO = cache(async () => {
  const page = await prisma.pages.findFirst({
    where: {
      type: "terms" as pages_type,
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
      canonicalUrl: true,
      ogTitle: true,
      ogDescription: true,
      ogImage: true,
      twitterTitle: true,
      twitterDescription: true,
      twitterImage: true,
      schemaJson: true,
      created_at: true,
      updated_at: true,
    },
  });

  // 🔁 fallback if admin has not set SEO
  if (!page) {
    return {
      title: "Terms of Service | Gyanitalk",
      description: "Read the terms and conditions for using the Gyanitalk app.",
      canonical: "/terms-of-service",
      page: null,
    };
  }

  const textOnly = page.description
    ? page.description.replace(/<[^>]+>/g, "")
    : "";
  const words = textOnly ? textOnly.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const readTimeMinutes = wordCount ? Math.max(1, Math.round(wordCount / 200)) : 0;

  return {
    title: page.metaTitle || page.title || "Terms of Service | Gyanitalk",
    description:
      page.metaDescription ||
      (textOnly ? textOnly.slice(0, 160) : ""),
    keywords: page.metaKeywords
      ? page.metaKeywords.split(",").map(k => k.trim())
      : [],
    canonical: page.canonicalUrl || "/terms-of-service",
    og: {
      title: page.ogTitle,
      description: page.ogDescription,
      image: page.ogImage,
    },
    twitter: {
      title: page.twitterTitle,
      description: page.twitterDescription,
      image: page.twitterImage,
    },
    schemaJson: page.schemaJson,
    page: {
      id: Number(page.id),
      title: page.title || "Terms & Conditions",
      description: page.description || "",
      slug: page.slug || "terms-of-service",
      wordCount,
      readTime: readTimeMinutes ? `${readTimeMinutes} min read` : "—",
      lastModified:
        (page.updated_at || page.created_at)?.toISOString() ||
        new Date().toISOString(),
    },
  };
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getTermsSEO();

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),

    title: seo.title,
    description: seo.description ?? undefined,
    keywords: seo.keywords,

    alternates: {
      canonical: seo.canonical,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: seo.og?.title
      ? {
          title: seo.og.title,
          description: seo.og.description ?? undefined,
          url: seo.canonical,
          siteName: "Gyanitalk",
          type: "website",
          images: seo.og.image ? [seo.og.image] : undefined,
        }
      : undefined,

    twitter: seo.twitter?.title
      ? {
          card: "summary_large_image",
          title: seo.twitter.title,
          description: seo.twitter.description ?? undefined,
          images: seo.twitter.image ? [seo.twitter.image] : undefined,
        }
      : undefined,
  };
}

/* ================= PAGE ================= */

export default async function TermsOfServicePage() {
  const data = await getTermsSEO();

  return <TermsOfServiceClient pageData={data.page} schemaJson={data.schemaJson} />;
}
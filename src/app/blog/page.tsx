import { Metadata } from "next";
import BlogClient from "./BlogClient";
import { prisma } from "@/lib/prisma";
import { pages_type } from "@/generated/client/client";
import { cache } from "react";
import { headers } from "next/headers";

const getBlogSEO = cache(async () => {
  const page = await prisma.pages.findFirst({
    where: {
      type: "blogs" as pages_type,
      isActive: true,
    },
    select: {
      title: true,
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
    },
  });

  if (!page) {
    return {
      title: "Astrology Blog – Insights, Horoscopes & Remedies | Gyanitalk",
      description: "Read astrology blogs, daily horoscope insights, remedies and spiritual guidance.",
      keywords: ["astrology blog", "horoscope blog", "vedic astrology", "gyanitalk blog"],
      canonical: "/blog",
    };
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
    keywords: page.metaKeywords ? page.metaKeywords.split(",").map((k) => k.trim()) : [],
    canonical: page.canonicalUrl || "/blog",
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
  };
});

async function getBlogs(
  searchParams: Promise<Record<string, string | string[] | undefined>>
) {
  const sp = await searchParams;
  const params = new URLSearchParams({
    page: typeof sp.page === "string" ? sp.page : "1",
    limit: "9",
    sortBy: typeof sp.sortBy === "string" ? sp.sortBy : "latest",
  });

  if (typeof sp.search === "string") params.append("search", sp.search);
  if (typeof sp.categoryId === "string") params.append("categoryId", sp.categoryId);

  // --- 🔴 FIXED LOGIC START ---
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  
  // Force HTTP if running locally (localhost or IP), otherwise use HTTPS
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const protocol = isLocal ? "http" : "https";
  
  const url = `${protocol}://${host}/api/landing/blog?${params}`;
  // --- 🔴 FIXED LOGIC END ---

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const seo = await getBlogSEO();
  return {
    title: seo.title,
    description: seo.description ?? undefined,
    keywords: seo.keywords,
    alternates: { canonical: seo.canonical },
    robots: { index: true, follow: true },
    openGraph: seo.og?.title
      ? {
          title: seo.og.title,
          description: seo.og.description ?? undefined,
          url: seo.canonical,
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

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data = await getBlogs(searchParams);

  const safeData =
    data?.success && data.data
      ? data
      : {
          data: [],
          categories: [],
          popularBlogs: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };

  return <BlogClient initialData={safeData} />;
}
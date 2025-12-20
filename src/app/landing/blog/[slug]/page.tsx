import { Metadata } from "next";
import BlogDetailClient from "./BlogDetailClient";
import { notFound } from "next/navigation";

import type { Viewport } from "next";

export function generateViewport(): Viewport {
  return {
    themeColor: "#FF6B35",
  };
}

/* ================= SERVER FETCH ================= */

async function getBlog(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/landing/blog/${slug}`,
    {
      next: { revalidate: 300 },
    },
  );

  if (!res.ok) return null;
  return res.json();
}

/* ================= SEO METADATA ================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const res = await getBlog(slug);
  const blog = res?.data;

  if (!blog) {
    return {
      title: "Blog Not Found | Gyanitalk",
      robots: { index: false, follow: false },
    };
  }

  const seo = blog.seo ?? {};

  // 🔐 FALLBACK SEO (AUTO-GENERATED)
  const title = seo.metaTitle ?? `${blog.title} | Astrology Blog | Gyanitalk`;

  const description =
    seo.metaDescription ??
    blog.description?.replace(/<[^>]*>/g, "").slice(0, 155) ??
    "Read expert astrology insights, remedies and spiritual guidance on Gyanitalk.";

  const canonical =
    seo.canonicalUrl ??
    `${process.env.NEXT_PUBLIC_SITE_URL}/landing/blog/${slug}`;

  const ogImage =
    seo.ogImage ??
    blog.previewImage ??
    blog.blogImage ??
    `${process.env.NEXT_PUBLIC_SITE_URL}/default-og.jpg`;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),

    title,
    description,

    keywords:
      seo.metaKeywords ??
      "astrology blog, horoscope, vedic astrology, spiritual guidance",

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
    },

    referrer: "strict-origin-when-cross-origin",

    openGraph: {
      title: seo.ogTitle ?? title,
      description: seo.ogDescription ?? description,
      url: canonical,
      type: "article",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: blog.postedOn,
      authors: [blog.author],
    },

    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle ?? title,
      description: seo.twitterDescription ?? description,
      images: [seo.twitterImage ?? ogImage],
    },
  };
}

/* ================= PAGE ================= */

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getBlog(slug);

  if (!res?.data) {
    notFound();
  }

  return (
    <BlogDetailClient
      blog={res.data}
      relatedBlogs={res.relatedBlogs}
      authorBlogs={res.authorBlogs}
      navigation={res.navigation}
    />
  );
}

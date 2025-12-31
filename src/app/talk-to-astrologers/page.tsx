import { Metadata } from "next";
import AstrologersClient from "@/components/landing/AstrologersClient";
import { prisma } from "@/lib/prisma";
import { cache } from "react";

/* ================= CONSTANTS ================= */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

/* ================= DATABASE SEO FETCH ================= */

const getAstrologersSEO = cache(async () => {
  const page = await prisma.pages.findFirst({
    where: {
      type: "astrologers",
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

  return page;
});

/* ================= SERVER FETCH FOR ASTROLOGERS DATA ================= */

async function getAstrologers(params: {
  page: string;
  search?: string;
}) {
  const query = new URLSearchParams({
    page: params.page,
    limit: "12",
    ...(params.search ? { search: params.search } : {}),
  });

  const res = await fetch(
    `${SITE_URL}/api/landing/astro?${query.toString()}`,
    {
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) return null;
  return res.json();
}

/* ================= SEO BUILDER WITH DATABASE PRIORITY ================= */

function buildSEO({
  page,
  search,
  dbSeo,
}: {
  page: number;
  search?: string;
  dbSeo: Awaited<ReturnType<typeof getAstrologersSEO>>;
}) {
  // Build dynamic parts for pagination/search
  const baseTitle = search
    ? `${search} Astrologers Online`
    : dbSeo?.metaTitle ?? "Top Verified Astrologers Online | Gyanitalk";

  const title = page > 1 ? `${baseTitle} – Page ${page}` : baseTitle;

  const description = search
    ? `Browse verified astrologers for ${search}. Chat, call or video consult online.`
    : dbSeo?.metaDescription ??
      "Connect with top verified astrologers for love, career, marriage & health guidance.";

  const canonicalBase =
    dbSeo?.canonicalUrl ?? `${SITE_URL}/talk-to-astrologers`;

  const canonical =
    page > 1 || search
      ? `${canonicalBase}?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`
      : canonicalBase;

  const ogImage =
    dbSeo?.ogImage ?? `${SITE_URL}/og/astrologers.jpg`;

  const keywords = dbSeo?.metaKeywords
    ? dbSeo.metaKeywords.split(",").map((k) => k.trim())
    : ["astrologers", "online astrology", "best astrologers", "astrology consultation"];

  return {
    metaTitle: title,
    metaDescription: description,
    metaKeywords: keywords,
    canonicalUrl: canonical,
    ogTitle: dbSeo?.ogTitle ?? title,
    ogDescription: dbSeo?.ogDescription ?? description,
    ogImage,
    twitterTitle: dbSeo?.twitterTitle ?? title,
    twitterDescription: dbSeo?.twitterDescription ?? description,
    twitterImage: dbSeo?.twitterImage ?? ogImage,
  };
}

/* ================= METADATA ================= */

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const resolved = await searchParams;

  const page = Number(resolved.page ?? 1);
  const search =
    typeof resolved.search === "string" ? resolved.search : undefined;

  const dbSeo = await getAstrologersSEO();

  const seo = buildSEO({ page, search, dbSeo });

  return {
    metadataBase: new URL(SITE_URL),

    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.metaKeywords,

    alternates: {
      canonical: seo.canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },

    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: seo.canonicalUrl,
      siteName: "Gyanitalk",
      type: "website",
      images: [
        {
          url: seo.ogImage,
          width: 1200,
          height: 630,
          alt: seo.ogTitle,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle,
      description: seo.twitterDescription,
      images: [seo.twitterImage],
    },
  };
}

/* ================= PAGE ================= */

export default async function AstrologersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;

  const page = Number(resolved.page ?? 1);
  const search =
    typeof resolved.search === "string" ? resolved.search : undefined;

  const data = await getAstrologers({
    page: String(page),
    search,
  });

  const dbSeo = await getAstrologersSEO();
  const seo = buildSEO({ page, search, dbSeo });

  // Use schema from database if available, otherwise generate from data
  const schema =
    dbSeo?.schemaJson ??
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: seo.metaTitle,
      itemListElement:
        data?.data?.map((astro: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Person",
            name: astro.name,
            url: `${SITE_URL}/talk-to-astrologers/${astro.slug}`,
          },
        })) ?? [],
    });

  return (
    <>
      {/* ✅ ACCESSIBILITY: REQUIRED H1 */}
      <h1 className="sr-only">{seo.metaTitle}</h1>

      {/* ✅ STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schema }}
      />

      {/* ✅ MAIN LANDMARK */}
      <main id="main-content">
        <AstrologersClient initialData={data} />
      </main>
    </>
  );
}
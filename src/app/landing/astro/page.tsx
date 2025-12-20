import { Metadata } from "next";
import AstrologersClient from "@/components/landing/AstrologersClient";

/* ================= CONSTANTS ================= */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;
const OG_IMAGE = "/og/astrologers.jpg";

/* ================= SERVER FETCH ================= */

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

/* ================= SEO FALLBACK ================= */

function buildFallbackSEO({
  page,
  search,
}: {
  page: number;
  search?: string;
}) {
  const baseTitle = search
    ? `${search} Astrologers Online`
    : "Top Verified Astrologers Online";

  const title = page > 1 ? `${baseTitle} – Page ${page}` : baseTitle;

  const description = search
    ? `Browse verified astrologers for ${search}. Chat, call or video consult online.`
    : `Connect with top verified astrologers for love, career, marriage & health guidance.`;

  const canonical =
    `/landing/astro?page=${page}` +
    (search ? `&search=${encodeURIComponent(search)}` : "");

  return {
    metaTitle: title,
    metaDescription: description,
    metaKeywords:
      "astrologers, online astrology, best astrologers, astrology consultation",
    canonicalUrl: canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage: OG_IMAGE,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: OG_IMAGE,
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

  const data = await getAstrologers({
    page: String(page),
    search,
  });

  const fallbackSEO = buildFallbackSEO({ page, search });
  const seo = { ...fallbackSEO, ...(data?.seo ?? {}) };

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
      siteName: "AstroMall",
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

  const fallbackSEO = buildFallbackSEO({ page, search });

  const schema =
    data?.seo?.structuredData ??
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: fallbackSEO.metaTitle,
      itemListElement:
        data?.data?.map((astro: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Person",
            name: astro.name,
            url: `${SITE_URL}/landing/astro/${astro.slug}`,
          },
        })) ?? [],
    });

  return (
    <>
      {/* ✅ ACCESSIBILITY: REQUIRED H1 */}
      <h1 className="sr-only">{fallbackSEO.metaTitle}</h1>

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
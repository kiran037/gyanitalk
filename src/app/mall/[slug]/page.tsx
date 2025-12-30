import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductClient from "@/components/landing/ProductClient";

/* ================= TYPES ================= */

interface PageProps {
  params: Promise<{ slug: string }>;
}

/* ================= DATA FETCH ================= */

async function getProductData(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/landing/mall/${slug}`,
    {
      next: { revalidate: 300 }, // ✅ SEO + Performance
    }
  );

  if (!res.ok) return null;

  const json = await res.json();
  return json.success ? json.data : null;
}

/* ================= METADATA ================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const data = await getProductData(slug);
  if (!data?.seo) return {};

  const seo = data.seo;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!), // ✅ REQUIRED

    title: seo.metaTitle ?? undefined,
    description: seo.metaDescription ?? undefined,
    keywords: seo.metaKeywords ?? undefined,

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
      title: seo.ogTitle ?? undefined,
      description: seo.ogDescription ?? undefined,
      url: seo.canonicalUrl,
      siteName: "AstroMall",
      images: seo.ogImage
        ? [
            {
              url: seo.ogImage,
              width: 1200,
              height: 630,
              alt: seo.ogTitle,
            },
          ]
        : undefined,
      type: "website", // ✅ allowed by Next.js
    },

    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle ?? undefined,
      description: seo.twitterDescription ?? undefined,
      images: seo.twitterImage ? [seo.twitterImage] : undefined,
    },
  };
}

/* ================= PAGE ================= */

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const data = await getProductData(slug);

  if (!data) notFound();

  return (
    <>
      {/* Product Schema */}
      {data.seo?.schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: data.seo.schemaJson }}
        />
      )}

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Mall",
                item: `${process.env.NEXT_PUBLIC_SITE_URL}/mall`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: data.product.category.name,
                item: `${process.env.NEXT_PUBLIC_SITE_URL}/mall?categoryId=${data.product.category.id}`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: data.product.name,
                item: data.seo.canonicalUrl,
              },
            ],
          }),
        }}
      />

      <ProductClient
        product={data.product}
        relatedProducts={data.relatedProducts}
      />
    </>
  );
}
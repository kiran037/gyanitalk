// app/contact/page.tsx
import type { Metadata, Viewport } from "next";
import ContactClient from "./ContactClient";
import { prisma } from "@/lib/prisma";
import { pages_type } from "@prisma/client";
import { cache } from "react";

/* ================= SEO (SERVER ONLY) ================= */

const getContactSEO = cache(async () => {
  const page = await prisma.pages.findFirst({
    where: {
      type: "contact_us" as pages_type,
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

  // 🔁 fallback if admin has not set SEO
  if (!page) {
    return {
      title: "Contact Us | Gyanitalk",
      description: "Contact Gyanitalk for astrology consultations, customer support, or business inquiries. We're here to help you 24/7.",
      canonical: "/contact",
      schemaJson: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact Gyanitalk",
        url: "https://gyanitalk.com/contact",
        mainEntity: {
          "@type": "Organization",
          name: "Gyanitalk",
          url: "https://gyanitalk.com",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-6375636577",
            contactType: "customer support",
            availableLanguage: ["English", "Hindi"],
          },
        },
      }),
    };
  }

  return {
    title: page.metaTitle || page.title || "Contact Us | Gyanitalk",
    description:
      page.metaDescription ||
      "Contact Gyanitalk for astrology consultations, customer support, or business inquiries. We're here to help you 24/7.",
    keywords: page.metaKeywords
      ? page.metaKeywords.split(",").map(k => k.trim())
      : [],
    canonical: page.canonicalUrl || "/contact",
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

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getContactSEO();

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

export const viewport: Viewport = {
  themeColor: "#FF6B35",
};

/* ================= PAGE ================= */

export default async function ContactPage() {
  const seo = await getContactSEO();
  
  return (
    <>
      {seo.schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: seo.schemaJson }}
        />
      )}
      <ContactClient />
    </>
  );
}
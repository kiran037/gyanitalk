import type { Metadata, Viewport } from "next";
import ContactClient from "./ContactClient";

const jsonLd = {
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
};

export const metadata: Metadata = {
  metadataBase: new URL("https://gyanitalk.com"),
  title: "Contact Us | Gyanitalk",
  description:
    "Contact Gyanitalk for astrology consultations, customer support, or business inquiries. We’re here to help you 24/7.",
  alternates: {
    canonical: "https://gyanitalk.com/contact",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Contact Gyanitalk",
    description:
      "Reach out to Gyanitalk for astrology consultations, support, or general questions.",
    url: "https://gyanitalk.com/contact",
    siteName: "Gyanitalk",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF6B35",
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactClient />
    </>
  );
}
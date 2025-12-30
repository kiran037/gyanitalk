// app/landing/kundali/match/page.tsx
import type { Metadata } from "next";
import KundaliMatchClient from "./KundaliMatchClient";

export const metadata: Metadata = {
  title: "Free Kundli Matching | Gun Milan | Horoscope Compatibility | Gyanitalk",
  description: "Check Kundli matching for marriage online. Get detailed compatibility analysis with Ashtakoot scoring, Guna Milan, Manglik Dosha check, and remedies - 100% free.",
  keywords: "kundli matching, gun milan, horoscope matching, marriage compatibility, ashtakoot, guna milan, manglik dosha, kundali milan",
  openGraph: {
    title: "Free Kundli Matching - Marriage Compatibility Check",
    description: "Instant Kundli matching with detailed Guna Milan analysis. Check marriage compatibility using Vedic astrology - No registration required.",
    type: "website",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/kundali/match`
  }
};

export default function KundaliMatchPage() {
  return <KundaliMatchClient />;
}
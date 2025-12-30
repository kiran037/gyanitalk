// app/landing/kundali/generate/page.tsx
import type { Metadata } from "next";
import KundaliGenerateClient from "./KundaliGenerateClient";

export const metadata: Metadata = {
  title: "Free Kundli Generation | Get Your Birth Chart Online | Gyanitalk",
  description: "Generate your free Vedic Kundli online instantly. Get detailed birth chart, planetary positions, ascendant, moon sign, and accurate astrological predictions based on your birth details.",
  keywords: "free kundli, birth chart, horoscope, vedic astrology, janam kundali, kundli matching, astrology chart",
  openGraph: {
    title: "Free Kundli Generation - Accurate Vedic Birth Chart",
    description: "Create your personalized Kundli with planet positions, houses, and detailed predictions. 100% free with no registration required.",
    type: "website",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/kundali/generate`
  }
};

export default function KundaliGeneratePage() {
  return <KundaliGenerateClient />;
}
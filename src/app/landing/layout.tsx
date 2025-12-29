// app/landing/layout.tsx
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: {
    default: "Gyanitallk – Online Astrology, Kundli & Horoscope",
    template: "%s | Gyanitallk",
  },
  description:
    "Gyanitallk offers astrology consultations, kundli readings, horoscopes, and remedies from verified astrologers. Chat or call live astrologers in your language.",
  keywords: [
    "online astrology",
    "astrologer consultation",
    "kundli reading",
    "janam kundli",
    "horoscope today",
    "live astrologer chat",
    "astrology app",
    "matchmaking kundli",
    "vedic astrology",
    "gyanitallk",
  ],
   robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Gyanitallk – Talk to Expert Astrologers Online",
    description:
      "Get instant astrology guidance, kundli analysis, and personalized remedies from expert astrologers on Gyanitallk.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://gyanitallk.com",
    siteName: "Gyanitallk",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gyanitallk – Online Astrology & Kundli",
    description:
      "Chat or call with expert astrologers, get daily horoscope and kundli insights on Gyanitallk.",
  },
};

export default function LandingLayout({ children }: PropsWithChildren) {
  // Don’t change layout structure here, AppShell from root still wraps everything.
  return <>{children}</>;
}
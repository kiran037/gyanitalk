// app/page.tsx
import type { Metadata } from "next";
import HomeClient from "@/components/landing/HomeClient";

export const metadata: Metadata = {
  title: "Gyanitallk – Talk to Astrologers Online",
  description:
    "Book astrology consultations, chat with astrologers, and get kundli & horoscope insights on Gyanitallk.",
};

export default function HomePage() {
  return <HomeClient />;
}
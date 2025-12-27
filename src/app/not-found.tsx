// app/not-found.tsx
"use client";

import { usePathname } from "next/navigation";
import LandingNotFound from "@/components/landing/LandingNotFound";
import AdminNotFound from "@/components/AdminNotFound";

const PUBLIC_ROUTE_PREFIXES = [
  "/landing/about-us",
  "/landing/terms-of-service",
  "/landing/privacy-policy",
  "/landing/contact",
  "/landing/blog",
  "/landing/astro",
  "/landing/mall",
  "/landing/courses",
  "/landing/horoscope",
  "/landing/panchang",
  "/landing/kundali/generate",
  "/landing/kundali/match"
];

const PUBLIC_EXACT_ROUTES = ["/", "/sign-in"];

function isPublicPage(pathname: string) {
  if (!pathname) return true;
  if (PUBLIC_EXACT_ROUTES.includes(pathname)) return true;
  return PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default function NotFound() {
  const pathname = usePathname();
  const isPublic = isPublicPage(pathname || "/");

  if (isPublic) {
    // Landing 404
    return <LandingNotFound />;
  }

  // Admin 404
  return <AdminNotFound />;
}
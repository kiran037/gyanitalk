"use client";

import "@/css/satoshi.css";
import "@/css/style.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function RootLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  // ✅ Public route prefixes
  const publicPrefixes = [
    "/landing/about-us",
    "/landing/terms-of-service",
    "/landing/privacy-policy",
    "/landing/contact",
    "/landing/blog", 
    "/landing/astro",

  ];

  const isPublicPage = 
    pathname === "/" || 
    pathname === "/sign-in" ||
    publicPrefixes.some(prefix => pathname.startsWith(prefix));


  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={isPublicPage ? "" : "h-full overflow-hidden"}>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />
          {isPublicPage ? (
            <div className="min-h-screen w-full">
              <main className="w-full">{children}</main>
            </div>
          ) : (
            <div className="grid h-screen w-full grid-rows-[auto,1fr] bg-gray-2 dark:bg-[#020d1a]">
              <div className="sticky top-0 z-50">
                <Header />
              </div>
              <div className="grid min-h-0 min-w-0 grid-cols-[250px,1fr] overflow-hidden">
                <div className="h-full min-w-0 overflow-hidden">
                  <Sidebar />
                </div>
                <div className="h-full min-h-0 min-w-0 overflow-y-auto overscroll-contain">
                  <main className="w-full min-w-0">{children}</main>
                  <Toaster position="top-right" />
                </div>
              </div>
            </div>
          )}
        </Providers>
      </body>
    </html>
  );
}
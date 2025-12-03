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
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useSidebarContext } from "@/components/Layouts/sidebar/sidebar-context";

function LayoutContent({ children, isPublicPage }: PropsWithChildren<{ isPublicPage: boolean }>) {
  const { isMobile } = useSidebarContext();

  if (isPublicPage) {
    return (
      <div className="min-h-screen w-full">
        <main className="w-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="grid h-screen w-full grid-rows-[auto,1fr] bg-gray-2 dark:bg-[#020d1a]">
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      <div className="flex min-h-0 min-w-0 overflow-hidden">
        {!isMobile && (
          <div className="h-full min-w-0 overflow-hidden">
            <Sidebar />
          </div>
        )}
        {isMobile && <Sidebar />}
        <div className="h-full min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <main className="w-full min-w-0">{children}</main>
          <Toaster position="top-right" />
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();

  const publicPrefixes = [
    "/landing/about-us",
    "/landing/terms-of-service",
    "/landing/privacy-policy",
    "/landing/contact",
    "/landing/blog",
    "/landing/astro",
    "/landing/mall",
    "/landing/courses",
  ];

  const isPublicPage =
    pathname === "/" ||
    pathname === "/sign-in" ||
    publicPrefixes.some(prefix => pathname.startsWith(prefix));

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : null;
    };

    const token = getCookie("token");

    if (token && isPublicPage) {
      router.push("/dashboard");
    }
  }, [pathname, router, isPublicPage]);

  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={isPublicPage ? "" : "h-full overflow-hidden"}>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />
          <LayoutContent isPublicPage={isPublicPage}>
            {children}
          </LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
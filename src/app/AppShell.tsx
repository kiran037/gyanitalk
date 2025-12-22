// app/AppShell.tsx
"use client";

import { PropsWithChildren, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import { Toaster } from "react-hot-toast";
import { useSidebarContext } from "@/components/Layouts/sidebar/sidebar-context";

function LayoutContent({
  children,
  isPublicPage,
}: PropsWithChildren<{ isPublicPage: boolean }>) {
  const { isMobile } = useSidebarContext();

  // Public pages: simple shell, normal scroll
  if (isPublicPage) {
    return (
      <div className="min-h-screen w-full overflow-y-auto bg-white dark:bg-[#020d1a]">
        <main className="w-full">{children}</main>
        <Toaster position="top-right" />
      </div>
    );
  }

  // Admin pages: header + sidebar layout with internal scroll
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

const publicPrefixes = [
  "/landing/about-us",
  "/landing/terms-of-service",
  "/landing/privacy-policy",
  "/landing/contact",
  "/landing/blog",
  "/landing/astro",
  "/landing/mall",
  "/landing/courses",
  "/landing/horoscope"
];

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPage =
    pathname === "/" ||
    pathname === "/sign-in" ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getCookie = (name: string) => {
      const match = document.cookie.match(
        new RegExp("(?:^|; )" + name + "=([^;]*)")
      );
      return match ? decodeURIComponent(match[1]) : null;
    };

    const token = getCookie("token");

    // If already logged in and on public page, push to dashboard
    if (token && isPublicPage) {
      router.push("/dashboard");
    }
  }, [pathname, router, isPublicPage]);

  return <LayoutContent isPublicPage={isPublicPage}>{children}</LayoutContent>;
}
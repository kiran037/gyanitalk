
// src/app/AppShell.tsx
"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import { Toaster } from "react-hot-toast";
import { useSidebarContext } from "@/components/Layouts/sidebar/sidebar-context";

function LayoutContent({
  children,
  showAdminLayout,
}: PropsWithChildren<{ showAdminLayout: boolean }>) {
  const { isMobile } = useSidebarContext();

  // Public pages OR protected non-admin pages: simple shell
  if (!showAdminLayout) {
    return (
      <div className="min-h-screen w-full overflow-y-auto bg-white dark:bg-[#020d1a]">
        <main className="w-full">{children}</main>
        <Toaster position="top-right" />
      </div>
    );
  }

  // Admin pages: header + sidebar layout
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

// Public routes (no auth needed)
const publicPrefixes = [
  "/about-us",
  "/terms-of-service",
  "/privacy-policy",
  "/contact",
  "/blog",
  "/talk-to-astrologers",
  "/mall",
  "/courses",
  "/horoscope",
  "/panchang",
  "/free-kundali",
  "/kundali-matching",
];

const publicExactRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
];

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine if route is public
  const isPublicRoute =
    publicExactRoutes.includes(pathname) ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix));

  // Determine if route is admin
  const isAdminRoute = pathname.startsWith("/admin");

  // Show admin layout only for admin routes
  const showAdminLayout = isAdminRoute;

  // Fetch user roles on mount
  useEffect(() => {
    const fetchUserRoles = async () => {
      const getCookie = (name: string) => {
        const match = document.cookie.match(
          new RegExp("(?:^|; )" + name + "=([^;]*)")
        );
        return match ? decodeURIComponent(match[1]) : null;
      };

      const token = getCookie("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const { data } = await res.json();
          const roleIds = data.roles.map((r: any) => r.id);
          setUserRoles(roleIds);
        }
      } catch (error) {
        console.error("Failed to fetch user roles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, []);

  // Client-side route protection (additional check)
  useEffect(() => {
    if (loading) return;

    const getCookie = (name: string) => {
      const match = document.cookie.match(
        new RegExp("(?:^|; )" + name + "=([^;]*)")
      );
      return match ? decodeURIComponent(match[1]) : null;
    };

    const token = getCookie("token");

    // If on auth pages and logged in, redirect based on role
    if (
      token &&
      (pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/forgot-password")
    ) {
      const hasUserOrAstrologerRole =
        userRoles.includes("3") || userRoles.includes("2");

      if (hasUserOrAstrologerRole) {
        router.push("/");
      } else {
        router.push("/admin/dashboard");
      }
      return;
    }

    // If on admin route without proper role, redirect to home
    if (isAdminRoute && token && userRoles.length > 0) {
      const hasUserOrAstrologerRole =
        userRoles.includes("3") || userRoles.includes("2");

      if (hasUserOrAstrologerRole) {
        router.push("/");
      }
    }
  }, [pathname, router, loading, userRoles, isAdminRoute]);

  if (loading) {
    // Show loading spinner while fetching user data
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#020d1a]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF6B35]" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <LayoutContent showAdminLayout={showAdminLayout}>{children}</LayoutContent>
  );
}
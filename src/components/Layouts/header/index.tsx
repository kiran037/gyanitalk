// src/components/Layouts/header/index.tsx
"use client";

import { useEffect, useMemo, useState, KeyboardEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { PanelLeftOpen, Moon, Sun } from "lucide-react";
import { useSidebarContext } from "../sidebar/sidebar-context";
import LogoutButton from "@/components/Auth/LogoutButton";
import { cx } from "@/components/GlassUI/GlassKit";

type Me = { 
  id: number; 
  name: string | null; 
  email: string; 
  avatarUrl?: string | null; 
  loginAt?: string | null 
};

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function useLoginAge(loginAt?: string | null) {
  const mounted = useMounted();
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    if (!mounted) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, [mounted]);

  if (!mounted || !loginAt) return "";
  const start = new Date(loginAt).getTime();
  const diffMs = Math.max(0, now - start);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}

export function Header() {
  const { toggleSidebar } = useSidebarContext();
  const router = useRouter();
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [me, setMe] = useState<Me | null>(null);
  const mounted = useMounted();
  const loginAge = useLoginAge(me?.loginAt);

  useEffect(() => {
    const onKey = (e: WindowEventMap['keydown']) => {
      const t = e.target as HTMLElement;
      if (t?.tagName === "INPUT" || t?.tagName === "TEXTAREA" || t?.isContentEditable) return;
      if (!e.metaKey && !e.ctrlKey) {
        const k = e.key.toLowerCase();
        if (k === "m") { e.preventDefault(); toggleSidebar(); }
        else if (k === "r") { e.preventDefault(); router.refresh(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, toggleSidebar]);

  // Fetch current user on client
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!cancel && res.ok) {
          setMe(await res.json());
        } else if (!cancel) {
          setMe(null);
        }
      } catch {
        if (!cancel) setMe(null);
      }
    })();
    return () => { cancel = true; };
  }, []);

  // Glass button styling
  const glassBtn = cx(
    "inline-flex items-center justify-center h-10 w-10 rounded-xl",
    "bg-white/70 dark:bg-white/[0.08] border border-white/40 dark:border-white/[0.12]",
    "backdrop-blur-xl text-slate-700 dark:text-slate-200",
    "hover:bg-white/90 dark:hover:bg-white/[0.12]",
    "hover:border-white/60 dark:hover:border-white/[0.18]",
    "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
    "active:scale-95"
  );

  const avatarSrc = me?.avatarUrl || "/default-avatar.svg";
  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <header
      role="banner"
      className={cx(
        "sticky top-0 z-50 w-full",
        "bg-white/75 dark:bg-slate-900/40",
        "backdrop-blur-xl backdrop-saturate-150",
        "border-b border-white/40 dark:border-white/10",
        "shadow-[0_4px_20px_rgba(2,6,23,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
      )}
    >
      <div className="mx-auto px-4 md:px-6 2xl:px-10">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left section */}
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar} 
              aria-label="Toggle sidebar (m)" 
              className={cx(glassBtn, "lg:hidden")}
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>

            <Link
              href="/"
              aria-label="Go to dashboard"
              className={cx(
                "group flex items-center gap-3 rounded-xl px-2 py-1.5",
                "transition-colors hover:bg-white/60 dark:hover:bg-white/[0.08]"
              )}
            >
              <span className="relative inline-block">
                <Image
                  src="https://gyanitalk.com/public/storage/images/astrologer_7851728112667.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  priority
                  className="rounded-xl shadow-[0_2px_10px_rgba(2,6,23,0.08)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
                />
                <span 
                  aria-hidden 
                  className="pointer-events-none absolute inset-0 rounded-xl bg-white/10 dark:bg-white/5" 
                />
              </span>
              <span className="hidden sm:inline text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                Admin Panel
              </span>
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Profile dropdown */}
            <div className="relative">
              <details className="group">
                <summary 
                  className={cx(
                    "group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5",
                    "hover:bg-white/70 dark:hover:bg-white/[0.08] transition-colors list-none"
                  )}
                >
                  <Image
                    src={avatarSrc}
                    alt={me?.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-xl"
                    unoptimized
                  />
                  <div className="hidden sm:flex flex-col leading-tight">
                    <span className="text-[13px] font-medium text-slate-900 dark:text-white">
                      {me?.name || "Guest"}
                    </span>
                    <span
                      className="text-[11px] text-slate-500 dark:text-slate-400"
                      suppressHydrationWarning
                    >
                      {mounted && loginAge ? `Logged in · ${loginAge}` : ""}
                    </span>
                  </div>
                </summary>

                <div
                  className={cx(
                    "absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl",
                    "border border-white/20 dark:border-white/20",
                    // Much stronger blur and higher opacity for Apple-like frosted glass
                    "bg-white/95 dark:bg-slate-900/95",
                    "backdrop-blur-3xl backdrop-saturate-150",
                    "shadow-[0_20px_60px_rgba(0,0,0,0.35)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.70)]",
                    "p-3"
                  )}
                >
                  <div className="flex items-center gap-3 p-2">
                    <Image
                      src={avatarSrc}
                      alt={me?.name || "User"}
                      width={40}
                      height={40}
                      className="rounded-xl"
                      unoptimized
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {me?.name || "Guest"}
                      </div>
                      <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {me?.email || ""}
                      </div>
                    </div>
                  </div>

                  <div className="my-2 h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent dark:via-white/10" />

                  {/* Theme Toggle */}
                  {mounted && (
                    <button
                      type="button"
                      onClick={() => setTheme(isDark ? "light" : "dark")}
                      className={cx(
                        "w-full flex items-center justify-between rounded-xl px-3 py-2.5",
                        "text-sm font-medium text-slate-700 dark:text-slate-300",
                        "hover:bg-white/60 dark:hover:bg-white/[0.08]",
                        "transition-colors group/theme"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {isDark ? (
                          <>
                            <Moon className="h-4 w-4" />
                            Dark Mode
                          </>
                        ) : (
                          <>
                            <Sun className="h-4 w-4" />
                            Light Mode
                          </>
                        )}
                      </span>
                      
                      {/* Toggle Switch */}
                      <div
                        className={cx(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300",
                          isDark
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                            : "bg-slate-300"
                        )}
                      >
                        <span
                          className={cx(
                            "inline-block h-4 w-4 rounded-full bg-white shadow-sm",
                            "transition-transform duration-300 ease-out",
                            isDark ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </div>
                    </button>
                  )}

                  <div className="my-2 h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent dark:via-white/10" />

                  <LogoutButton 
                    className={cx(
                      "w-full rounded-xl px-3 py-2 text-left text-sm font-medium",
                      "text-slate-700 dark:text-slate-300",
                      "hover:bg-white/60 dark:hover:bg-white/[0.08]",
                      "transition-colors"
                    )}
                  />
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
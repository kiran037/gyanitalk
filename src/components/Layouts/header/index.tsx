
"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PanelLeftOpen, RefreshCw } from "lucide-react";

import { useSidebarContext } from "../sidebar/sidebar-context";
import { ThemeToggleSwitch } from "./theme-toggle";
import LogoutButton from "@/components/Auth/LogoutButton";

export function Header() {
  const { toggleSidebar } = useSidebarContext();
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target?.tagName;
      const isTyping =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        target?.isContentEditable;

      if (isTyping) return;

      if (!e.metaKey && !e.ctrlKey) {
        const k = e.key.toLowerCase();
        if (k === "m") {
          e.preventDefault();
          toggleSidebar();
        } else if (k === "r") {
          e.preventDefault();
          router.refresh();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, toggleSidebar]);

  const glassBtn =
    "inline-flex items-center justify-center h-10 w-10 rounded-xl " +
    "bg-white/60 dark:bg-white/[0.08] border border-white/40 dark:border-white/[0.12] " +
    "backdrop-blur-xl text-slate-700 dark:text-slate-200 " +
    "hover:bg-white/80 dark:hover:bg-white/[0.12] " +
    "hover:border-white/60 dark:hover:border-white/[0.18] " +
    "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50";

  return (
    <header
      role="banner"
      className="
        sticky top-0 z-50 w-full
        bg-white/65 dark:bg-slate-900/35
        backdrop-blur-xl backdrop-saturate-150
        border-b border-white/40 dark:border-white/10
        shadow-[0_4px_20px_rgba(2,6,23,0.04)]
      "
    >
      <div className="mx-auto px-4 md:px-6 2xl:px-10">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: sidebar toggle + brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
              className={`${glassBtn} lg:hidden`}
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>

            <Link
              href="/"
              aria-label="Go to dashboard"
              className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/50 dark:hover:bg-white/[0.07]"
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
                  className="pointer-events-none absolute inset-0 rounded-xl bg-white/10 dark:bg-white/10"
                  style={{ maskImage: "linear-gradient(to bottom right, black, transparent)" }}
                />
              </span>
              <span className="hidden sm:inline text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                Admin Panel
              </span>
            </Link>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <ThemeToggleSwitch />
            <button
              type="button"
              onClick={() => router.refresh()}
              title="Refresh (r)"
              className={glassBtn}
            >
              <RefreshCw className="h-5 w-5" />
              <span className="sr-only">Refresh</span>
            </button>
            <LogoutButton iconOnly className={glassBtn} />
          </div>
        </div>
      </div>
    </header>
  );
}

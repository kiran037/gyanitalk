// src/components/Layouts/header/index.tsx
"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { PanelLeftOpen, Moon, Sun, ChevronDown } from "lucide-react";
import { useSidebarContext } from "../sidebar/sidebar-context";
import LogoutButton from "@/components/Auth/LogoutButton";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isThemeChanging, setIsThemeChanging] = useState(false);
  const mounted = useMounted();
  const loginAge = useLoginAge(me?.loginAt);

  // Refs for click outside detection
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: WindowEventMap['keydown']) => {
      const t = e.target as HTMLElement;
      if (t?.tagName === "INPUT" || t?.tagName === "TEXTAREA" || t?.isContentEditable) return;

      // Close dropdown on Escape
      if (e.key === "Escape" && dropdownOpen) {
        e.preventDefault();
        setDropdownOpen(false);
        return;
      }

      if (!e.metaKey && !e.ctrlKey) {
        const k = e.key.toLowerCase();
        if (k === "m") { e.preventDefault(); toggleSidebar(); }
        else if (k === "r") { e.preventDefault(); router.refresh(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, toggleSidebar, dropdownOpen]);

  // Add a state to trigger refresh
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch current user on client
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/me", {
          cache: "no-store",
          credentials: "include", // ✅ Add this
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (!cancel && res.ok) {
          setMe(await res.json());
        } else if (!cancel) {
          setMe(null);
          // ✅ If not authenticated, redirect to landing
          if (res.status === 401) {
            window.location.href = "/";
          }
        }
      } catch {
        if (!cancel) setMe(null);
      }
    })();
    return () => { cancel = true; };
  }, [refreshKey]);

  // Improved click outside detection
  useEffect(() => {
    if (!dropdownOpen) return;
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node;

  // ⛔ NEW FIX — ignore logout modal clicks
  if (document.querySelector("#logout-modal")?.contains(target)) {
    return;
  }

  if (
    dropdownRef.current &&
    buttonRef.current &&
    !dropdownRef.current.contains(target) &&
    !buttonRef.current.contains(target)
  ) {
    setDropdownOpen(false);
  }
};


    // Small delay to prevent immediate closure on open
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Debounced theme toggle
  const handleThemeToggle = useCallback(() => {
    if (isThemeChanging) return;

    setIsThemeChanging(true);
    const newTheme = (resolvedTheme || theme) === "dark" ? "light" : "dark";
    setTheme(newTheme);

    setTimeout(() => setIsThemeChanging(false), 300);
  }, [theme, resolvedTheme, setTheme, isThemeChanging]);

  const avatarSrc = me?.avatarUrl || "/default-avatar.svg";
  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/30  transition-all duration-300"
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left section */}
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={toggleSidebar}
              aria-label="Toggle sidebar (m)"
              className="lg:hidden p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <PanelLeftOpen className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Logo */}
            <Link
              href="/"
              aria-label="Go to dashboard"
              className="flex items-center gap-2 sm:gap-3 group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 overflow-hidden shadow-lg transition-all group-hover:scale-105">
                <Image
                  src="https://gyanitalk.com/public/storage/images/astrologer_7851728112667.png"
                  alt="Gyani Talk"
                  width={40}
                  height={40}
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="hidden sm:inline text-lg sm:text-xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Gyani Talk
              </span>
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
                className="flex items-center gap-2 sm:gap-3 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                aria-label="User menu"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="hidden md:flex flex-col leading-tight text-left">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {me?.name || "Guest"}
                  </span>
                  <span
                    className="text-xs text-gray-500 dark:text-gray-400"
                    suppressHydrationWarning
                  >
                    {mounted && loginAge ? `Active · ${loginAge}` : ""}
                  </span>
                </div>
                <div className="relative">
                  <Image
                    src={avatarSrc}
                    alt={me?.name || "User"}
                    width={32}
                    height={32}
                    className={`rounded-full ring-2 ring-transparent hover:ring-[#FF6B35]/30 transition-all duration-500 ${dropdownOpen ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
                      }`}
                    unoptimized
                  />
                </div>
                <ChevronDown
                  className={`hidden sm:block h-4 w-4 text-gray-700 dark:text-gray-300 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  {/* Mobile Backdrop */}
                  <div
                    className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    onClick={() => setDropdownOpen(false)}
                  />

                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-white/20 dark:border-gray-700/30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 rounded-xl mb-3">
                      <div
                        className={`transition-all duration-500 ${dropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 -translate-y-4'
                          }`}
                      >
                        <Image
                          src={avatarSrc}
                          alt={me?.name || "User"}
                          width={48}
                          height={48}
                          className="rounded-full ring-2 ring-[#FF6B35]/30"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {me?.name || "Guest"}
                        </div>
                        <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {me?.email || ""}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="my-2 h-px bg-gradient-to-r from-transparent via-[#FF6B35]/30 to-transparent" />

                    {/* Theme Toggle in Dropdown */}
                    {mounted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleThemeToggle();
                        }}
                        disabled={isThemeChanging}
                        className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        role="menuitem"
                      >
                        <span className="flex items-center gap-3">
                          {isDark ? (
                            <>
                              <Moon className="h-5 w-5 text-[#FF6B35] dark:text-[#FF8C61]" />
                              Dark Mode
                            </>
                          ) : (
                            <>
                              <Sun className="h-5 w-5 text-[#FF6B35] dark:text-[#FF8C61]" />
                              Light Mode
                            </>
                          )}
                        </span>

                        {/* Toggle Switch */}
                        <div
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${isDark
                            ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347]"
                            : "bg-gray-300"
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-out ${isDark ? "translate-x-6" : "translate-x-1"
                              }`}
                          />
                        </div>
                      </button>
                    )}

                    {/* Divider */}
                    <div className="my-2 h-px bg-gradient-to-r from-transparent via-[#FF6B35]/30 to-transparent" />

                    {/* Logout Button */}
                    <div role="menuitem">
                      <LogoutButton
                        className="w-full"
                        onLogoutClick={() => {
                          // Keep dropdown open while logout confirmation is shown
                          console.log("Logout button clicked, keeping dropdown open");
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
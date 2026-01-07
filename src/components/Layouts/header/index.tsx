"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useToast } from "@/components/Toast/ToastProvider"; // Assuming you have this
import {
  PanelLeftOpen,
  Moon,
  Sun,
  Settings,
  ChevronRight,
  Zap,
  User,
  Eye,
  ExternalLink,
  Wallet,
  ShieldCheck,
  Sparkles,
  LogOut,
  AlertTriangle,
  X
} from "lucide-react";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { avatar } from "@/lib/images";

// --- Types ---
type UserRole = {
  id: string;
  name: string;
  isActive: boolean;
};

type AstrologerInfo = {
  id: string;
  name: string;
  isVerified: boolean;
  isActive: boolean;
};

type Me = {
  id: string;
  name: string;
  email: string | null;
  contactNo: string | null;
  profile: string | null;
  location: string | null;
  isActive: boolean;
  roles: UserRole[];
  isAstrologer: boolean;
  astrologer: AstrologerInfo | null;
  walletBalance: string;
  loginAt: string | null;
  createdAt: string | null;
};

// --- Hooks ---
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function useLoginAge(loginAt?: string | null) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    setMounted(true);
    if (!loginAt) return;
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, [loginAt]);

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

// --- Skeleton Component ---
const UserSkeleton = () => (
  <div className="flex items-center gap-2 animate-pulse">
    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700" />
    <div className="hidden lg:flex flex-col gap-1">
      <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>
);

// --- Main Component ---
export function Header() {
  const { toggleSidebar } = useSidebarContext();
  const router = useRouter();
  const { setTheme, theme, resolvedTheme } = useTheme();
  const addToast = useToast();
  
  // State
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Lifted State
  
  const mounted = useMounted();
  const loginAge = useLoginAge(me?.loginAt);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 1. Fetch User Data
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/me", {
        cache: "no-store",
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (res.ok) {
        const responseData = await res.json();
        if (responseData.success) setMe(responseData.data);
      } else if (res.status === 401) {
        // Silent redirect or handle appropriately
        // router.push("/login"); 
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  // 2. Handle Click Outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Don't close if clicking the logout modal
      if (document.getElementById("logout-modal-content")?.contains(target)) return;

      if (dropdownRef.current && buttonRef.current &&
        !dropdownRef.current.contains(target) && !buttonRef.current.contains(target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // 3. Logout Logic
  const handleLogout = async () => {
    setShowLogoutModal(false); // Close modal
    setDropdownOpen(false);    // Ensure dropdown is closed

    try {
      // Clear client storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies manually if needed (document.cookie fallback)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Call API
      await fetch("/api/logout", { method: "POST" });
      
      addToast("success", "Signed out", "Redirecting to login...");
      
      // Redirect
      setTimeout(() => window.location.replace("/login"), 500);
    } catch (error) {
      console.error("Logout error", error);
      window.location.replace("/login");
    }
  };

  const handleThemeToggle = () => {
    setTheme((resolvedTheme || theme) === "dark" ? "light" : "dark");
  };

  const avatarSrc = avatar(me?.profile);
  const isDark = (resolvedTheme || theme) === "dark";
  const roleLabel = me?.isAstrologer ? "Astrologer" : me?.roles.some(r => r.name.toLowerCase().includes("admin")) ? "Admin" : "User";

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* LEFT: Logo & Sidebar Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <PanelLeftOpen className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>

              <Link href="/admin/dashboard" className="flex items-center gap-2 group">
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5">
                  <Image
                    src="https://gyanitalk.com/public/storage/images/astrologer_7851728112667.png"
                    alt="Gyani Talk"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="hidden sm:inline text-lg font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                  Gyani Talk
                </span>
              </Link>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Visit Site */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B35]/50 hover:text-[#FF6B35] transition-all group"
              >
                <Eye className="w-4 h-4 group-hover:text-[#FF6B35]" />
                <span>Visit Site</span>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#FF6B35]" />
              </a>

              <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block" />

              {/* Theme */}
              {mounted && (
                <button
                  onClick={handleThemeToggle}
                  className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-[#FF6B35] transition-all"
                >
                  {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>
              )}

              {/* Settings */}
              <Link
                href="/admin/settings"
                className="hidden sm:flex p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-[#FF6B35] transition-all"
              >
                <Settings className="h-5 w-5" />
              </Link>

              {/* User Dropdown */}
              <div className="relative ml-1">
                <button
                  ref={buttonRef}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-1 pr-1 sm:pr-3 py-1 rounded-full sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group"
                >
                  {loading ? (
                    <UserSkeleton />
                  ) : (
                    <>
                      <div className="relative">
                        <Image
                          src={avatarSrc}
                          alt={me?.name || "User"}
                          width={36}
                          height={36}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-gray-900 group-hover:ring-[#FF6B35]/30 transition-shadow"
                          unoptimized
                        />
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 ${me?.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      </div>
                      <div className="hidden lg:flex flex-col items-start text-left">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white leading-none mb-1">
                          {me?.name || "User"}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                          <Zap className="h-3 w-3 text-[#FF6B35]" />
                          {loginAge}
                        </span>
                      </div>
                      <ChevronRight className={`hidden lg:block w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-90' : ''}`} />
                    </>
                  )}
                </button>

                {/* Dropdown Content */}
                {dropdownOpen && me && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-3 w-80 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      {/* Header */}
                      <div className="p-5 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-start gap-4">
                          <Image
                            src={avatarSrc}
                            alt={me.name}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-sm"
                            unoptimized
                          />
                          <div className="flex-1 min-w-0 pt-1">
                            <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">
                              {me.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                              {me.email}
                            </p>
                            <div className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20">
                              {me.isAstrologer ? <Sparkles className="w-3 h-3 mr-1" /> : <ShieldCheck className="w-3 h-3 mr-1" />}
                              {roleLabel}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Wallet */}
                      <div className="px-5 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                              <Wallet className="w-4 h-4" />
                            </div>
                            <span className="font-medium">Wallet</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ₹{parseFloat(me.walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="p-2 space-y-1">
                        <Link
                          href="/admin/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#FF6B35]/5 hover:text-[#FF6B35] transition-colors group"
                        >
                          <User className="w-4 h-4 text-gray-400 group-hover:text-[#FF6B35]" />
                          My Profile
                        </Link>
                        <Link
                          href="/admin/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#FF6B35]/5 hover:text-[#FF6B35] transition-colors group"
                        >
                          <Settings className="w-4 h-4 text-gray-400 group-hover:text-[#FF6B35]" />
                          Settings
                        </Link>

                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2" />

                        <button
                          onClick={() => {
                            setDropdownOpen(false); // Close dropdown
                            setShowLogoutModal(true); // Open modal
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- LOGOUT MODAL (Portal) --- */}
      {mounted && showLogoutModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowLogoutModal(false)}
          />
          
          {/* Modal Content */}
          <div 
            id="logout-modal-content"
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 sm:p-8 transform transition-all scale-100 border border-white/20 dark:border-gray-800"
          >
            {/* Close Icon */}
            <button 
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-900/10 flex items-center justify-center shadow-inner">
                <div className="p-3 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-xl shadow-lg shadow-orange-500/20">
                  <LogOut className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Signing out?
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Are you sure you want to end your session? You will need to sign in again to access your account.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-3.5 rounded-xl font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
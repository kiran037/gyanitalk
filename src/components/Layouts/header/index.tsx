// // src/components/Layouts/header/index.tsx
// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useTheme } from "next-themes";
// import {
//   PanelLeftOpen,
//   Moon,
//   Sun,
//   Settings,
//   ChevronRight,
//   Zap,
//   User,
//   LogOut
// } from "lucide-react";
// import { useSidebarContext } from "../sidebar/sidebar-context";
// import LogoutButton from "@/components/Auth/LogoutButton";
// import { avatar } from "@/lib/images";

// type Me = {
//   id: number;
//   name: string | null;
//   email: string;
//   profile?: string | null;
//   loginAt?: string | null;
// };


// function useMounted() {
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);
//   return mounted;
// }

// function useLoginAge(loginAt?: string | null) {
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);
//   // seed with now so first render isn't wrong
//   const [now, setNow] = useState<number>(() => Date.now());

//   useEffect(() => {
//     if (!mounted || !loginAt) return;
//     setNow(Date.now()); // immediate sync when loginAt changes
//     const t = setInterval(() => setNow(Date.now()), 60_000);
//     return () => clearInterval(t);
//   }, [mounted, loginAt]);

//   if (!mounted || !loginAt) return "";

//   const start = new Date(loginAt).getTime();
//   const diffMs = Math.max(0, now - start);
//   const mins = Math.floor(diffMs / 60000);
//   if (mins < 1) return "Just now";
//   if (mins < 60) return `${mins}m`;
//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24) return `${hrs}h ${mins % 60}m`;
//   const days = Math.floor(hrs / 24);
//   return `${days}d ${hrs % 24}h`;
// }

// function formatAbsoluteTime(iso?: string | null) {
//   if (!iso) return "";
//   try {
//     return new Intl.DateTimeFormat(undefined, {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit"
//     }).format(new Date(iso));
//   } catch {
//     return iso;
//   }
// }


// export function Header() {
//   const { toggleSidebar } = useSidebarContext();
//   const router = useRouter();
//   const { setTheme, theme, resolvedTheme } = useTheme();
//   const [me, setMe] = useState<Me | null>(null);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const mounted = useMounted();
//   const loginAge = useLoginAge(me?.loginAt);


//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const buttonRef = useRef<HTMLButtonElement>(null);

//   // Fetch user data
//   useEffect(() => {
//     let cancel = false;
//     (async () => {
//       try {
//         const res = await fetch("/api/me", {
//           cache: "no-store",
//           credentials: "include",
//           headers: {
//             'Cache-Control': 'no-cache, no-store, must-revalidate',
//             'Pragma': 'no-cache'
//           }
//         });
//         if (!cancel && res.ok) {
//           const userData = await res.json();
//           setMe(userData);
//         } else if (!cancel && res.status === 401) {
//           window.location.href = "/";
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     })();
//     return () => { cancel = true; };
//   }, []);

//   // Click outside handler
//   useEffect(() => {
//     if (!dropdownOpen) return;

//     const handleClickOutside = (e: MouseEvent) => {
//       const target = e.target as Node;

//       if (document.querySelector("#logout-modal")?.contains(target)) return;

//       if (dropdownRef.current && buttonRef.current &&
//         !dropdownRef.current.contains(target) && !buttonRef.current.contains(target)) {
//         setDropdownOpen(false);
//       }
//     };

//     const timeoutId = setTimeout(() => {
//       document.addEventListener("mousedown", handleClickOutside);
//     }, 0);

//     return () => {
//       clearTimeout(timeoutId);
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [dropdownOpen]);

//   // Keyboard shortcuts
//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       const t = e.target as HTMLElement;
//       if (t?.tagName === "INPUT" || t?.tagName === "TEXTAREA" || t?.isContentEditable) return;

//       if (e.key === "Escape") {
//         e.preventDefault();
//         setDropdownOpen(false);
//         return;
//       }

//       if (!e.metaKey && !e.ctrlKey) {
//         const k = e.key.toLowerCase();
//         if (k === "m") { e.preventDefault(); toggleSidebar(); }
//       }
//     };

//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [toggleSidebar]);

//   const handleThemeToggle = useCallback(() => {
//     const newTheme = (resolvedTheme || theme) === "dark" ? "light" : "dark";
//     setTheme(newTheme);
//   }, [theme, resolvedTheme, setTheme]);

//   const avatarSrc = avatar(me?.profile);
//   const isDark = (resolvedTheme || theme) === "dark";

//   return (
//     <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-800/50">
//       <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           {/* Left section */}
//           <div className="flex items-center gap-3">
//             <button
//               onClick={toggleSidebar}
//               className="lg:hidden group p-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-[#FF6B35] hover:to-[#FFB347] transition-all duration-300 shadow-sm hover:shadow-md"
//               aria-label="Toggle sidebar"
//             >
//               <PanelLeftOpen className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors" />
//             </button>

//             <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
//               <div className="relative">
//                 <div className="absolute inset-0 rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
//                 <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-white dark:ring-gray-900 ">
//                   <Image
//                     src="https://gyanitalk.com/public/storage/images/astrologer_7851728112667.png"
//                     alt="Gyani Talk"
//                     width={40}
//                     height={40}
//                     priority
//                     className="w-full h-full"
//                   />
//                 </div>
//               </div>
//               <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
//                 Gyani Talk
//               </span>
//             </Link>
//           </div>

//           {/* Right section */}
//           <div className="flex items-center gap-2">
//             {/* Theme Toggle */}
//             {mounted && (
//               <button
//                 onClick={handleThemeToggle}
//                 className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
//                 aria-label="Toggle theme"
//               >
//                 {isDark ? (
//                   <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-[#FF6B35] transition-colors" />
//                 ) : (
//                   <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-[#FF6B35] transition-colors" />
//                 )}
//               </button>
//             )}

//             {/* Settings Button */}
//             <Link
//               href="/admin/settings"
//               className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
//               aria-label="Settings"
//             >
//               <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-[#FF6B35] transition-colors" />
//             </Link>

//             {/* User Menu */}
//             <div className="relative">
//               <button
//                 ref={buttonRef}
//                 onClick={() => setDropdownOpen(!dropdownOpen)}
//                 className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg hover:shadow-[#FF6B35]/10 transition-all border border-gray-200 dark:border-gray-700 hover:border-[#FF6B35]/30"
//                 aria-label="User menu"
//               >
//                 <div className="relative">
//                   <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] rounded-full blur-sm opacity-50" />
//                   <Image
//                     src={avatarSrc}
//                     alt={me?.name || "User"}
//                     width={32}
//                     height={32}
//                     className="relative rounded-full object-cover ring-2 ring-white dark:ring-gray-900"
//                     unoptimized
//                   />
//                   <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
//                 </div>
//                 <div className="hidden lg:flex flex-col items-start leading-tight">
//                   <span className="text-sm font-semibold text-gray-900 dark:text-white">
//                     {me?.name || "Guest"}
//                   </span>
//                   <span
//                     className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"
//                     title={formatAbsoluteTime(me?.loginAt)}
//                     suppressHydrationWarning
//                   >
//                     <Zap className="h-3 w-3 text-emerald-500" />
//                     {mounted && loginAge ? `Active · ${loginAge}` : "Active"}
//                   </span>
//                 </div>
//               </button>

//               {dropdownOpen && (
//                 <>
//                   <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
//                   <div
//                     ref={dropdownRef}
//                     className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl z-50 overflow-hidden"
//                   >
//                     {/* Profile Header */}
//                     <div className="p-4 bg-gradient-to-br from-[#FF6B35]/5 to-[#FFB347]/5 dark:from-[#FF6B35]/10 dark:to-[#FFB347]/10">
//                       <div className="flex items-center gap-3">
//                         <div className="relative">
//                           <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] rounded-full blur-md opacity-50" />
//                           <Image
//                             src={avatarSrc}
//                             alt={me?.name || "User"}
//                             width={48}
//                             height={48}
//                             className="relative rounded-full ring-2 ring-white/50 dark:ring-gray-700/50 object-cover"
//                             unoptimized
//                           />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
//                             {me?.name || "Guest"}
//                           </p>
//                           <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
//                             {me?.email || ""}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Menu Items */}
//                     <div className="p-2">
//                       {/* View Profile */}
//                       <Link
//                         href="/admin/profile"
//                         onClick={() => setDropdownOpen(false)}
//                         className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-[#FF6B35]/5 dark:hover:bg-[#FF6B35]/10 transition-all group"
//                       >
//                         <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FFB347] flex items-center justify-center">
//                           <User className="h-4 w-4 text-white" />
//                         </div>
//                         <div className="flex-1">
//                           <p className="font-medium">View Profile</p>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">Manage your account</p>
//                         </div>
//                         <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6B35]" />
//                       </Link>

//                       {/* Settings */}
//                       <Link
//                         href="/admin/settings"
//                         onClick={() => setDropdownOpen(false)}
//                         className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group"
//                       >
//                         <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-[#FF6B35]/10 transition-colors">
//                           <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-[#FF6B35] transition-colors" />
//                         </div>
//                         <span className="flex-1">Settings</span>
//                         <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
//                       </Link>

//                       <div className="my-2 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

//                       {/* Logout */}
//                       <LogoutButton className="w-full" onLogoutClick={() => {}} />
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  PanelLeftOpen,
  Moon,
  Sun,
  Settings,
  ChevronRight,
  Zap,
  User,
  LogOut,
  Eye,
  ExternalLink
} from "lucide-react";
import { useSidebarContext } from "../sidebar/sidebar-context";
import LogoutButton from "@/components/Auth/LogoutButton";
import { avatar } from "@/lib/images";

type Me = {
  id: number;
  name: string | null;
  email: string;
  profile?: string | null;
  loginAt?: string | null;
};

// --- Hooks ---
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function useLoginAge(loginAt?: string | null) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!mounted || !loginAt) return;
    setNow(Date.now()); 
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, [mounted, loginAt]);

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

function formatAbsoluteTime(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    }).format(new Date(iso));
  } catch { return iso; }
}

export function Header() {
  const { toggleSidebar } = useSidebarContext();
  const router = useRouter();
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [me, setMe] = useState<Me | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const mounted = useMounted();
  const loginAge = useLoginAge(me?.loginAt);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch user data
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/me", {
          cache: "no-store",
          credentials: "include",
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (!cancel && res.ok) {
          const userData = await res.json();
          setMe(userData);
        } else if (!cancel && res.status === 401) {
          window.location.href = "/";
        }
      } catch (err) { console.error(err); }
    })();
    return () => { cancel = true; };
  }, []);

  // Click outside handler
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (document.querySelector("#logout-modal")?.contains(target)) return;
      if (dropdownRef.current && buttonRef.current &&
        !dropdownRef.current.contains(target) && !buttonRef.current.contains(target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleThemeToggle = useCallback(() => {
    const newTheme = (resolvedTheme || theme) === "dark" ? "light" : "dark";
    setTheme(newTheme);
  }, [theme, resolvedTheme, setTheme]);

  const avatarSrc = avatar(me?.profile);
  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile Toggle & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle sidebar"
            >
              <PanelLeftOpen className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>

            <Link href="/admin/dashboard" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                <Image
                  src="https://gyanitalk.com/public/storage/images/astrologer_7851728112667.png"
                  alt="Gyani Talk"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="hidden sm:inline text-lg font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Gyani Talk
              </span>
            </Link>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-2">
            
            {/* View as User Button (New) */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B35]/50 hover:text-[#FF6B35] transition-all group mr-1"
            >
              <Eye className="w-4 h-4 group-hover:text-[#FF6B35]" />
              <span>View as User</span>
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#FF6B35]" />
            </a>

            {/* Mobile View Icon Only */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-[#FF6B35]"
              title="View as User"
            >
              <Eye className="w-5 h-5" />
            </a>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block" />

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-[#FF6B35] transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
            )}

            {/* Settings (Desktop) */}
            <Link
              href="/admin/settings"
              className="hidden sm:flex p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-[#FF6B35] transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Link>

            {/* User Dropdown */}
            <div className="relative ml-1">
              <button
                ref={buttonRef}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-1 pr-1 sm:pr-3 py-1 rounded-full sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                <div className="relative">
                  <Image
                    src={avatarSrc}
                    alt={me?.name || "User"}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-gray-900"
                    unoptimized
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
                </div>
                <div className="hidden lg:flex flex-col items-start text-left">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white leading-none mb-0.5">
                    {me?.name || "Guest"}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-[#FF6B35]" />
                    {mounted && loginAge ? loginAge : "Active"}
                  </span>
                </div>
                <ChevronRight className={`hidden lg:block w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-90' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl z-50 overflow-hidden ring-1 ring-black/5"
                  >
                    {/* Header */}
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <Image
                          src={avatarSrc}
                          alt={me?.name || "User"}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#FF6B35]/20"
                          unoptimized
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {me?.name || "Guest"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {me?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="p-2 space-y-1">
                      <Link
                        href="/admin/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#FF6B35]/5 hover:text-[#FF6B35] transition-all group"
                      >
                        <User className="w-4 h-4 text-gray-400 group-hover:text-[#FF6B35]" />
                        <span className="flex-1">My Profile</span>
                      </Link>

                      <Link
                        href="/admin/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#FF6B35]/5 hover:text-[#FF6B35] transition-all group"
                      >
                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-[#FF6B35]" />
                        <span className="flex-1">Settings</span>
                      </Link>

                      <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2" />

                      <LogoutButton className="w-full justify-start px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl" onLogoutClick={() => {}} />
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
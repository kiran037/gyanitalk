"use client";

import { 
  Moon, Sun, Menu, X, ChevronDown, ChevronRight, 
  LogOut, User as UserIcon, Loader2,
  Wallet, ShoppingBag, MessageSquare, ShieldCheck, Bell,
  LayoutDashboard,
  Settings
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { avatar } from "@/lib/images"; 
import NotificationPopup from "@/components/landing/profile/NotificationPopup";

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  menuItems?: Array<{
    label: string;
    href?: string;
    children?: { label: string; href: string }[];
  }>;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  profile: string | null;
  roles: { id: string; name: string }[];
  walletBalance: string;
  stats?: {
    totalOrders: number;
    totalTickets: number;
    totalReviews: number;
  };
}

export default function Header({ theme, toggleTheme, menuItems }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Notification State
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  // Auth States
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // --- Fetch User ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          if (data.success) setUser(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // --- Logout ---
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        setMobileMenuOpen(false);
        router.refresh();
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const showAdminButton = useMemo(() => {
    if (!user) return false;
    return user.roles.some((r) => r.id !== "2" && r.id !== "3");
  }, [user]);

  const items = useMemo(
    () =>
      menuItems || [
        { label: "Home", href: "/" },
        { label: "Astrologers", href: "/talk-to-astrologers" },
        { label: "Horoscope", href: "/horoscope" },
        {
          label: "Kundli",
          children: [
            { label: "Free Kundali", href: "/free-kundali" },
            { label: "Kundali Matching", href: "/kundali-matching" },
          ],
        },
        { label: "Panchang", href: "/panchang" },
        { label: "Mall", href: "/mall" },
        { label: "Courses", href: "/courses" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
      ],
    [menuItems]
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotificationOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    }
  }, [mobileMenuOpen]);

  const isActive = (href: string) => {
    if (!href) return false;
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90"
            : "border-b border-transparent bg-white dark:bg-gray-950"
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            
            {/* === LOGO === */}
            <Link href="/" className="flex flex-shrink-0 items-center gap-3 z-50 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-orange-50 ring-1 ring-black/5 transition-transform group-hover:scale-105 dark:bg-gray-800 dark:ring-white/10">
                <img
                  src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                  alt="Gyani Talk Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Gyani<span className="text-[#FF6B35]">Talk</span>
                </span>
              </div>
            </Link>

            {/* === DESKTOP NAVIGATION === */}
            <div className="hidden xl:flex xl:items-center xl:gap-1">
              {items.map((item) => {
                if (item.children) {
                  const isChildActive = item.children.some((c) => isActive(c.href));
                  return (
                    <div
                      key={item.label}
                      className="group relative"
                      onMouseEnter={() => setActiveDropdown(item.label)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <button
                        className={`flex items-center gap-1 rounded-full px-4 py-2 text-[15px] font-medium transition-all ${
                          isChildActive
                            ? "text-[#FF6B35] bg-orange-50 dark:bg-orange-500/10"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${activeDropdown === item.label ? "rotate-180 text-[#FF6B35]" : "text-gray-400"}`} />
                      </button>

                      <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible transition-all duration-200 group-hover:opacity-100 group-hover:visible">
                        <div className="w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 dark:border-gray-800 dark:bg-gray-900 dark:ring-white/10">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                                isActive(child.href)
                                  ? "bg-orange-50 text-[#FF6B35] dark:bg-orange-500/10"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className={`rounded-full px-4 py-2 text-[15px] font-medium transition-all ${
                      isActive(item.href!)
                        ? "bg-gradient-to-r from-[#FF6B35] to-[#FF8C35] text-white shadow-md shadow-orange-500/20"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* === RIGHT ACTIONS === */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-700 sm:h-10 sm:w-10"
              >
                <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
              </button>

              {/* AUTH & ACTIONS (Desktop Only - Mobile handles this in drawer) */}
              <div className="hidden lg:flex items-center gap-3">
                {!loading && user ? (
                  <>
                    {/* Wallet */}
                    <div className="flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50/50 px-4 py-2 dark:border-orange-900/30 dark:bg-orange-900/10">
                        <Wallet className="h-4 w-4 text-[#FF6B35]" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">₹{user.walletBalance}</span>
                    </div>

                    {/* Notifications (Desktop Popup) */}
                    <button
                      onClick={() => setNotificationOpen(true)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                    >
                      <Bell className="h-5 w-5" />
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 pr-3 transition-all hover:shadow-sm dark:border-gray-700 dark:bg-gray-900"
                      >
                        <img src={avatar(user.profile)} alt="User" className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-800" />
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </button>

                      <AnimatePresence>
                        {userDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950"
                          >
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                              <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <div className="p-2 space-y-1">
                              {showAdminButton && (
                                <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900">
                                  <ShieldCheck className="h-4 w-4 text-indigo-500" /> Admin
                                </Link>
                              )}
                              <Link href="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900">
                                <UserIcon className="h-4 w-4" /> Profile
                              </Link>
                              <Link href="/orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900">
                                <ShoppingBag className="h-4 w-4" /> Orders
                              </Link>
                              <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                                <LogOut className="h-4 w-4" /> Logout
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-[#FF6B35] dark:text-gray-300">Login</Link>
                    <Link href="/register" className="rounded-full bg-[#FF6B35] px-5 py-2 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[#e05825]">Register</Link>
                  </div>
                )}
              </div>

              {/* === MOBILE HAMBURGER === */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white xl:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- DESKTOP POPUP ONLY --- */}
      <NotificationPopup 
        isOpen={notificationOpen} 
        onClose={() => setNotificationOpen(false)} 
      />

      {/* === IMPROVED MOBILE DRAWER === */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm xl:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 right-0 top-0 z-[70] flex w-full max-w-[320px] flex-col bg-white shadow-2xl dark:bg-gray-950 xl:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <span className="text-lg font-extrabold text-gray-900 dark:text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:bg-gray-800 dark:text-gray-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto bg-[#FDFDFD] dark:bg-gray-950">
                <div className="p-5">
                  
                  {/* AUTH CARD (Mobile) */}
                  {!loading && user ? (
                    <div className="mb-6">
                      <div className="mb-4 flex items-center gap-3">
                        <img src={avatar(user.profile)} alt={user.name} className="h-12 w-12 rounded-full border-2 border-white shadow-sm dark:border-gray-800" />
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{user.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-40">{user.email}</p>
                        </div>
                      </div>

                      {/* Quick Action Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <Link href="/profile/wallet" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center justify-center rounded-xl bg-orange-50 p-3 text-center dark:bg-orange-900/10">
                          <Wallet className="mb-1 h-5 w-5 text-[#FF6B35]" />
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">₹{user.walletBalance}</span>
                        </Link>
                        {/* Mobile: Link directly to /notifications page */}
                        <Link href="/notifications" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center justify-center rounded-xl bg-blue-50 p-3 text-center dark:bg-blue-900/10">
                          <Bell className="mb-1 h-5 w-5 text-blue-500" />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Notification</span>
                        </Link>
                        <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center justify-center rounded-xl bg-gray-50 p-3 text-center dark:bg-gray-800">
                          <UserIcon className="mb-1 h-5 w-5 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Profile</span>
                        </Link>
                        <Link href="/profile/orders" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center justify-center rounded-xl bg-gray-50 p-3 text-center dark:bg-gray-800">
                          <ShoppingBag className="mb-1 h-5 w-5 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Orders</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 grid grid-cols-2 gap-3">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-700 dark:border-gray-800 dark:text-white">Login</Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center rounded-xl bg-[#FF6B35] py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20">Register</Link>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <div className="space-y-1">
                    <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-gray-400">Menu</p>
                    {items.map((item) => (
                      <MobileMenuItem key={item.label} item={item} pathname={pathname} closeMenu={() => setMobileMenuOpen(false)} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky Footer CTA */}
              <div className="border-t border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
                {user ? (
                  <div className="flex gap-3">
                    <button onClick={handleLogout} className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 dark:border-red-900/30 dark:bg-red-900/10">
                      {loggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
                    </button>
                    <Link href="/talk-to-astrologers" onClick={() => setMobileMenuOpen(false)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF6B35] text-sm font-bold text-white shadow-lg shadow-orange-500/20">
                      <MessageSquare className="h-4 w-4" /> Chat Now
                    </Link>
                  </div>
                ) : (
                  <Link href="/talk-to-astrologers" onClick={() => setMobileMenuOpen(false)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B35] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20">
                    <MessageSquare className="h-4 w-4" /> Chat with Astrologer
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// === Sub-components for Cleaner Logic ===

function MobileMenuItem({ item, pathname, closeMenu }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = !hasChildren && (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));
  const isChildActive = hasChildren && item.children.some((c: any) => pathname === c.href);

  useEffect(() => {
    if (isChildActive) setIsOpen(true);
  }, [isChildActive]);

  if (hasChildren) {
    return (
      <div className="overflow-hidden rounded-xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center justify-between px-4 py-3 text-sm font-semibold transition-colors ${
            isChildActive || isOpen ? "bg-gray-50 text-[#FF6B35] dark:bg-gray-900" : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {item.label}
          <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="bg-gray-50/50 dark:bg-gray-900/50"
            >
              <div className="flex flex-col py-1">
                {item.children.map((child: any) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={closeMenu}
                    className={`border-l-2 py-2 pl-4 pr-4 text-sm font-medium transition-colors ${
                      pathname === child.href
                        ? "border-[#FF6B35] bg-orange-50/50 text-[#FF6B35] dark:bg-orange-900/10"
                        : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400"
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={closeMenu}
      className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
        isActive
          ? "bg-[#FF6B35] text-white shadow-md shadow-orange-500/20"
          : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
      }`}
    >
      {item.label}
    </Link>
  );
}
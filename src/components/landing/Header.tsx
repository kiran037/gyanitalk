// "use client";

import { Moon, Sun, Menu, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  menuItems?: Array<{ label: string; href: string }>;
}

export default function Header({ theme, toggleTheme, menuItems }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const items = useMemo(
    () =>
      menuItems || [
        { label: "Home", href: "/" },
        { label: "Astrologers", href: "/landing/astro" },
        { label: "Horoscope", href: "/landing/horoscope" },
        { label: "Panchang", href: "/landing/panchang" },
        { label: "Mall", href: "/landing/mall" },
        { label: "Courses", href: "/landing/courses" },
        { label: "Blog", href: "/landing/blog" },
        { label: "About", href: "/landing/about-us" },
        { label: "Contact", href: "/landing/contact" },
      ],
    [menuItems],
  );

  // Handle scroll effect (throttled with rAF)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll(); // initial
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Check if current path matches menu item
  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <nav
        aria-label="Main navigation"
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-gray-200 bg-white/90 shadow-lg backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90"
            : "border-b border-gray-100 bg-white dark:border-gray-900 dark:bg-gray-950"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Logo */}
            <Link href="/" className="group flex min-w-0 items-center gap-2">
              <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg ring-2 ring-[#FF6B35]/20 transition-all group-hover:ring-[#FF6B35]/40">
                <img
                  src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                  alt="Gyani Talk"
                  className="h-full w-full object-cover"
                  decoding="async"
                />
              </div>
              <span className="truncate text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                Gyani<span className="text-[#FF6B35]">Talk</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden items-center gap-1.5 md:flex lg:gap-2">
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all lg:px-4 ${
                      active
                        ? "bg-[#FF6B35] text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-[#FF6B35] dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-[#FF6B35]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center rounded-lg bg-gray-100 p-2 transition-all hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun
                    className="h-5 w-5 text-yellow-500"
                    aria-hidden="true"
                    focusable="false"
                  />
                ) : (
                  <Moon
                    className="h-5 w-5 text-gray-700"
                    aria-hidden="true"
                    focusable="false"
                  />
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="flex items-center justify-center rounded-lg bg-gray-100 p-2 transition-all hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 md:hidden"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X
                    className="h-5 w-5 text-gray-700 dark:text-gray-300"
                    aria-hidden="true"
                    focusable="false"
                  />
                ) : (
                  <Menu
                    className="h-5 w-5 text-gray-700 dark:text-gray-300"
                    aria-hidden="true"
                    focusable="false"
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
            tabIndex={-1}
          />

          {/* Menu Panel */}
          <div className="absolute left-0 right-0 top-16 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
            <div className="mx-auto max-w-7xl px-4 py-4">
              <div className="flex flex-col gap-1.5">
                {items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                        active
                          ? "bg-[#FF6B35] text-white"
                          : "text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-900 dark:active:bg-gray-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

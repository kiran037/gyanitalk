"use client";

import { useState, useEffect } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

interface LandingWrapperProps {
  children: React.ReactNode;
  menuItems?: Array<{ label: string; href: string }>;
}

export default function LandingWrapper({
  children,
  menuItems,
}: LandingWrapperProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hydrated, setHydrated] = useState(false);

  // Initialize theme once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "light";

    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
    setHydrated(true);
  }, []);

  // Sync theme changes
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme, hydrated]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // ⛔ Prevent layout shift before hydration
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-white dark:bg-black" aria-hidden="true" />
    );
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-black dark:to-gray-900 transition-colors duration-300 min-h-screen">
        {/* Header = banner landmark */}
        <Header theme={theme} toggleTheme={toggleTheme} menuItems={menuItems} />

        {/* ✅ MAIN LANDMARK (important for Lighthouse a11y) */}
        <main id="main-content" role="main" className="pt-16">
          {children}
        </main>

        {/* Footer = contentinfo landmark */}
        <Footer />
      </div>
    </div>
  );
}
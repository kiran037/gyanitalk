"use client";

import { useState, useEffect } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

interface LandingWrapperProps {
  children: React.ReactNode;
  menuItems?: Array<{ label: string; href: string }>;
}

export default function LandingWrapper({ children, menuItems }: LandingWrapperProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hydrated, setHydrated] = useState(false);

  // Initialize theme once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";

    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
    setHydrated(true);
  }, []);

  // Sync theme changes to DOM + storage
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme, hydrated]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-black dark:to-gray-900 transition-colors duration-300 min-h-screen">
        <Header theme={theme} toggleTheme={toggleTheme} menuItems={menuItems} />

        {/* Add padding-top so content doesn't sit under fixed header */}
        
          {children}
      

        <Footer />

        {/* Global tiny helpers */}
        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          .animate-float-delayed {
            animation: float 3s ease-in-out infinite;
            animation-delay: 1.5s;
          }

          * {
            -webkit-tap-highlight-color: transparent;
          }

          html {
            scroll-behavior: smooth;
          }
        `}</style>
      </div>
    </div>
  );
}
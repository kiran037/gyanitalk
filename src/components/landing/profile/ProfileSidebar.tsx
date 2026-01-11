"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet, ShoppingBag, Phone, MessageSquare, Heart, MapPin, 
  Star, Sparkles, History, Settings, ChevronRight, LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";

// Menu Configuration
export const PROFILE_MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", href: "/profile", color: "text-blue-500" },
  { icon: Wallet, label: "Wallet", href: "/profile/wallet", color: "text-green-500" },
  { icon: ShoppingBag, label: "Orders", href: "/profile/orders", color: "text-purple-500" },
  { icon: Phone, label: "Call History", href: "/profile/history/calls", color: "text-indigo-500" },
  { icon: MessageSquare, label: "Chat History", href: "/profile/history/chats", color: "text-pink-500" },
  { icon: Heart, label: "Favorites", href: "/profile/favorites", color: "text-red-500" },
  { icon: MapPin, label: "Addresses", href: "/profile/addresses", color: "text-orange-500" },
  { icon: Star, label: "Reviews", href: "/profile/reviews", color: "text-yellow-500" },
  { icon: Sparkles, label: "Kundali", href: "/profile/kundali", color: "text-violet-500" },
  // { icon: History, label: "Activity", href: "/profile/activity", color: "text-cyan-500" },
  { icon: Settings, label: "Edit Profile", href: "/profile/edit", color: "text-gray-500" },
];

export default function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden lg:flex flex-col sticky top-24 w-full max-w-[280px] h-[calc(100vh-8rem)] z-30">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col h-full bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex-shrink-0">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B35] to-[#FFB347]">
              Menu
            </h2>
          </div>

          {/* Scrollable Navigation - NO SCROLLBAR */}
          <nav className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-1">
            {PROFILE_MENU_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                    isActive
                      ? "bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 text-[#FF6B35]"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  <div className={`p-2 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-gray-100 dark:border-white/5 group-hover:scale-110 transition-transform ${isActive ? "text-[#FF6B35]" : "text-gray-500"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`font-semibold text-sm tracking-wide ${isActive ? "text-gray-900 dark:text-white" : ""}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div layoutId="sidebar-active" className="absolute right-4">
                      <ChevronRight className="h-4 w-4 text-[#FF6B35]" />
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Removed the entire footer/logout section */}
        </motion.div>
      </aside>

      {/* Global Scrollbar Hide Utility */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
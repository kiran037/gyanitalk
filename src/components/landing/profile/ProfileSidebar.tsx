"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet, ShoppingBag, Phone, MessageSquare, Heart, MapPin, 
  Star, Sparkles, Settings, User, LogOut
} from "lucide-react";

const MENU = [
  { icon: User, label: "Overview", href: "/profile" },
  { icon: Wallet, label: "Wallet", href: "/profile/wallet" },
  { icon: ShoppingBag, label: "Orders", href: "/profile/orders" },
  { icon: Phone, label: "Call History", href: "/profile/history/calls" },
  { icon: MessageSquare, label: "Chat History", href: "/profile/history/chats" },
  { icon: Heart, label: "Favorites", href: "/profile/favorites" },
  { icon: MapPin, label: "Addresses", href: "/profile/addresses" },
  { icon: Star, label: "Reviews", href: "/profile/reviews" },
  { icon: Sparkles, label: "Kundali", href: "/profile/kundali" },
  { icon: Settings, label: "Settings", href: "/profile/edit" },
];

export default function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
      <div className="p-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</h3>
        <nav className="space-y-0.5">
          {MENU.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#FF6B35] text-white shadow-md shadow-orange-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500 dark:text-gray-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-100 dark:border-white/5">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 w-full transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
        </button>
      </div>
    </div>
  );
}
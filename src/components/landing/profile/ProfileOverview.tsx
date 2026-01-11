"use client";

import { motion } from "framer-motion";
import {
  ShoppingBag, MessageSquare, Phone, Star, Wallet, TrendingUp,
  CheckCircle2, AlertCircle, ChevronRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { avatar } from "@/lib/images"; 
import { PROFILE_MENU_ITEMS } from "./ProfileSidebar";

interface ProfileOverviewProps {
  profile: {
    name: string;
    email: string;
    profile: string | null; 
    contactNo: string;
    wallet_balance: string | number;
    email_verified?: boolean; 
    phone_verified?: boolean;
    account_status?: string;
    statistics: {
      total_orders: number;
      total_chats: number;
      total_calls: number;
      total_reviews: number;
      following_count: number;
    };
  };
  onUpdate: () => void;
}

export default function ProfileOverview({ profile }: ProfileOverviewProps) {
  const stats = [
    { icon: ShoppingBag, label: "Orders", value: profile.statistics.total_orders, color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: MessageSquare, label: "Chats", value: profile.statistics.total_chats, color: "text-purple-500", bg: "bg-purple-500/10" },
    { icon: Phone, label: "Calls", value: profile.statistics.total_calls, color: "text-green-500", bg: "bg-green-500/10" },
    { icon: Star, label: "Reviews", value: profile.statistics.total_reviews, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-20 lg:pb-0">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="relative">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full p-[2px] bg-gradient-to-r from-[#FF6B35] to-[#FFB347]">
                    <Image
                        src={avatar(profile.profile)}
                        alt={profile.name || "User"}
                        width={80}
                        height={80}
                        className="rounded-full border-4 border-[#FAFAFA] dark:border-[#050505] bg-white object-cover h-full w-full"
                        // ADD THIS LINE: This bypasses the server-side check that is causing the crash
                        unoptimized={true} 
                    />
                </div>
                <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-green-500 border-4 border-[#FAFAFA] dark:border-[#050505]" />
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Hi, {profile.name ? profile.name.split(" ")[0] : "User"}!
                </h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5">
                        {profile.email}
                    </span>
                    {profile.email_verified && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                </div>
            </div>
        </div>
        
        <div className="hidden md:flex gap-2">
            {!profile.email_verified && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                    <AlertCircle className="h-3 w-3" /> Verify Email
                </span>
            )}
             {!profile.phone_verified && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                    <AlertCircle className="h-3 w-3" /> Verify Phone
                </span>
            )}
        </div>
      </div>

      {/* 2. Wallet Card & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ... (Rest of the component remains exactly the same) ... */}
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
        >
            <div className="relative h-full min-h-[200px] rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/20 group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35] via-[#FF8F50] to-[#FFB347]" />
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-black/10 blur-2xl" />

                <div className="relative p-6 flex flex-col justify-between h-full text-white">
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
                            <Wallet className="h-6 w-6" />
                        </div>
                        <TrendingUp className="h-6 w-6 text-white/60" />
                    </div>

                    <div>
                        <p className="text-white/80 text-sm font-medium mb-1">Total Balance</p>
                        <h3 className="text-4xl font-bold tracking-tight">
                        ₹{formatCurrency(profile.wallet_balance)}
                        </h3>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Link href="/profile/wallet" className="flex-1 bg-white text-[#FF6B35] py-2.5 rounded-xl text-center text-sm font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                            Add Money
                        </Link>
                        <Link href="/profile/activity" className="px-3 py-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all">
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all"
                >
                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} mb-3`}>
                        <stat.icon className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                    </span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {stat.label}
                    </span>
                </motion.div>
            ))}
        </div>
      </div>

      {/* 3. Mobile Navigation Grid */}
      <div className="lg:hidden">
        <h3 className="text-lg font-bold mb-4 px-1">Menu</h3>
        <div className="grid grid-cols-2 gap-3">
            {PROFILE_MENU_ITEMS.filter(i => i.href !== '/profile').map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col items-start p-4 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 shadow-sm active:scale-95 transition-all"
                    >
                        <div className={`p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 ${item.color} mb-3`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                            {item.label}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">View Details</span>
                    </Link>
                )
            })}
        </div>
      </div>

      {/* 4. Desktop Quick Actions */}
      <div className="hidden lg:block">
        <h3 className="text-xl font-bold mb-4">Quick Shortcuts</h3>
        <div className="grid grid-cols-4 gap-4">
             {['Edit', 'Kundali', 'Addresses', 'Favorites'].map((action) => (
                <Link
                    key={action}
                    href={`/profile/${action.toLowerCase().replace(' ', '-')}`}
                    className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 hover:border-[#FF6B35]/30 transition-all"
                >
                    <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-[#FF6B35] transition-colors">{action}</span>
                    <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-[#FF6B35] group-hover:text-white transition-all">
                        <ChevronRight className="h-4 w-4" />
                    </div>
                </Link>
             ))}
        </div>
      </div>

    </div>
  );
}
"use client";

import { 
  ChevronRight, Wallet, ShoppingBag, MessageSquare, Phone, 
  Star, MapPin, Heart, Sparkles, Settings, LogOut, CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { avatar } from "@/lib/images"; 
import { UserProfile } from "@/app/profile/page"; // Or import from your types file

interface ProfileOverviewProps {
  profile: UserProfile;
}

export default function ProfileOverview({ profile }: ProfileOverviewProps) {
  
  // Helper for formatting currency
  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  return (
    <div className="pb-10 lg:pb-0">
      
      {/* ==========================================
          MOBILE LAYOUT (iPhone Settings Style)
      ========================================== */}
      <div className="lg:hidden flex flex-col gap-5">
        
        {/* 1. Mobile Header (Compact) */}
        <div className="bg-white dark:bg-[#1C1C1E] px-4 py-6 border-b border-gray-200 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full border border-gray-100 dark:border-white/10 overflow-hidden relative">
              <Image
                src={avatar(profile.profile)}
                alt={profile.name}
                fill
                className="object-cover"
                unoptimized={true}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {profile.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {profile.email}
              </p>
            </div>
            <Link href="/profile/edit">
                <div className="p-2 bg-gray-100 dark:bg-[#2C2C2E] rounded-full text-gray-600 dark:text-gray-300">
                    <Settings className="w-5 h-5" />
                </div>
            </Link>
          </div>
        </div>

        {/* 2. Wallet Card (Mobile) */}
        <div className="px-4">
            <div className="bg-[#1C1C1E] dark:bg-[#2C2C2E] rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35]/20 blur-[40px] rounded-full -mr-10 -mt-10 pointer-events-none" />
                
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Wallet Balance</p>
                        <h2 className="text-3xl font-bold">₹{formatCurrency(profile.wallet_balance)}</h2>
                    </div>
                    <Link href="/profile/wallet" className="px-4 py-2 bg-[#FF6B35] hover:bg-[#ff8f50] rounded-full text-sm font-semibold transition-colors">
                        Add Money
                    </Link>
                </div>
            </div>
        </div>

        {/* 3. Grouped Navigation Lists (iOS Style) */}
        <div className="px-4 space-y-5">
            
            {/* Group 1: Activity */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden shadow-sm">
                <MobileMenuItem href="/profile/orders" icon={ShoppingBag} color="bg-blue-500" label="My Orders" badge={profile.statistics.total_orders} />
                <MobileMenuItem href="/profile/history/chats" icon={MessageSquare} color="bg-green-500" label="Chat History" />
                <MobileMenuItem href="/profile/history/calls" icon={Phone} color="bg-indigo-500" label="Call History" isLast />
            </div>

            {/* Group 2: Personal */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden shadow-sm">
                <MobileMenuItem href="/profile/kundali" icon={Sparkles} color="bg-purple-500" label="Kundali" />
                <MobileMenuItem href="/profile/favorites" icon={Heart} color="bg-pink-500" label="Favorites" />
                <MobileMenuItem href="/profile/addresses" icon={MapPin} color="bg-orange-500" label="Saved Addresses" />
                <MobileMenuItem href="/profile/reviews" icon={Star} color="bg-yellow-500" label="My Reviews" isLast />
            </div>

            {/* Group 3: Account */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden shadow-sm">
                 <button className="w-full flex items-center justify-between p-3.5 pl-4 active:bg-gray-50 dark:active:bg-[#2C2C2E] transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-md bg-red-500 flex items-center justify-center text-white shadow-sm">
                            <LogOut className="w-4 h-4" />
                        </div>
                        <span className="text-[15px] font-medium text-red-500">Log Out</span>
                    </div>
                </button>
            </div>
        </div>
      </div>


      {/* ==========================================
          DESKTOP LAYOUT (Dashboard Style)
      ========================================== */}
      <div className="hidden lg:block space-y-8">
        {/* Desktop Header */}
        <div className="flex items-end justify-between">
            <div className="flex items-center gap-5">
                <div className="relative">
                     <Image
                        src={avatar(profile.profile)}
                        alt={profile.name}
                        width={96}
                        height={96}
                        className="rounded-full border-4 border-white dark:border-[#111] shadow-lg object-cover"
                        unoptimized={true}
                    />
                    {profile.email_verified && (
                        <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white dark:border-[#111]">
                            <CheckCircle2 className="w-3 h-3" />
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hi, {profile.name}!</h1>
                    <p className="text-gray-500 mt-1">{profile.email}</p>
                </div>
            </div>
            
            <div className="flex gap-3">
                <Link href="/profile/edit" className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    Edit Profile
                </Link>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
            {/* Wallet Card - Desktop */}
            <div className="col-span-1 rounded-3xl bg-[#111] text-white p-8 relative overflow-hidden shadow-xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B35]/30 blur-[60px] rounded-full -mr-20 -mt-20" />
                 
                 <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex items-start justify-between">
                        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-bold border border-[#FF6B35]/20">
                            Active
                        </span>
                    </div>
                    
                    <div className="mt-8">
                        <p className="text-gray-400 font-medium mb-2">Total Balance</p>
                        <h2 className="text-4xl font-bold">₹{formatCurrency(profile.wallet_balance)}</h2>
                    </div>

                    <Link href="/profile/wallet" className="mt-6 w-full py-3 bg-[#FF6B35] hover:bg-[#e55a2b] rounded-xl text-center font-bold transition-all shadow-lg shadow-orange-500/20">
                        Add Funds
                    </Link>
                 </div>
            </div>

            {/* Stats Grid */}
            <div className="col-span-2 grid grid-cols-2 gap-4">
                <StatsCard 
                    icon={ShoppingBag} label="Total Orders" value={profile.statistics.total_orders} 
                    color="text-blue-600" bg="bg-blue-50 dark:bg-blue-500/10" 
                />
                <StatsCard 
                    icon={MessageSquare} label="Chats" value={profile.statistics.total_chats} 
                    color="text-green-600" bg="bg-green-50 dark:bg-green-500/10" 
                />
                <StatsCard 
                    icon={Phone} label="Calls" value={profile.statistics.total_calls} 
                    color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-500/10" 
                />
                <StatsCard 
                    icon={Star} label="Reviews Given" value={profile.statistics.total_reviews} 
                    color="text-yellow-600" bg="bg-yellow-50 dark:bg-yellow-500/10" 
                />
            </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function MobileMenuItem({ href, icon: Icon, color, label, badge, isLast }: any) {
    return (
        <Link href={href} className="block relative">
            <div className={`flex items-center justify-between p-3.5 pl-4 active:bg-gray-50 dark:active:bg-[#2C2C2E] transition-colors ${!isLast ? 'border-b border-gray-100 dark:border-white/5' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-md ${color} flex items-center justify-center text-white shadow-sm`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[15px] font-medium text-gray-900 dark:text-white">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    {badge && badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {badge}
                        </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
            </div>
        </Link>
    );
}

function StatsCard({ icon: Icon, label, value, color, bg }: any) {
    return (
        <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 hover:border-[#FF6B35]/20 transition-all group">
            <div className={`p-3 rounded-2xl ${bg} ${color} mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</span>
            <span className="text-sm font-medium text-gray-500">{label}</span>
        </div>
    );
}
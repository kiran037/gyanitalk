"use client";

import { useState, useEffect } from "react";
import ProfileOverview from "@/components/landing/profile/ProfileOverview";
import { Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  profile: string | null; // Handle nulls from DB
  wallet_balance: string; // Prisma might return Decimal, API converts to Number or String
  statistics: {
    total_orders: number;
    total_chats: number;
    total_calls: number;
    total_reviews: number;
    following_count: number;
  };
  email_verified?: boolean;
  phone_verified?: boolean;
  account_status?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/landing/profile");
      const data = await res.json();

      if (res.ok && data.success) {
        setProfile(data.data);
      } else {
        if (res.status === 401) {
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="h-12 w-12 rounded-full border-4 border-[#FF6B35]/30 border-t-[#FF6B35] animate-spin" />
           <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="text-center max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#111] shadow-xl border border-gray-100 dark:border-white/10">
          <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Unavailable</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">We couldn't load your profile information. Please try logging in again.</p>
          <button onClick={() => router.push('/login')} className="mt-6 w-full py-3 bg-[#FF6B35] text-white font-bold rounded-xl hover:bg-[#e55a2b] transition-all">
              Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <ProfileOverview profile={profile} onUpdate={fetchProfile} />;
}
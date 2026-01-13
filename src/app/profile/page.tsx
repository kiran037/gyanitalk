"use client";

import { useState, useEffect } from "react";
import ProfileOverview from "@/components/landing/profile/ProfileOverview";
import { Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

// Define interface locally or import from types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  profile: string | null;
  wallet_balance: string;
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
      } else if (res.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#FF6B35] animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-3">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Profile Unavailable</h2>
        <button 
          onClick={() => router.push('/login')} 
          className="mt-4 px-6 py-2 bg-[#FF6B35] text-white text-sm font-semibold rounded-full shadow-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  return <ProfileOverview profile={profile} />;
}
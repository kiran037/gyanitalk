// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import EditProfileForm from "@/components/landing/profile/EditProfileForm";
// import { Loader2, ArrowLeft } from "lucide-react";
// import { useRouter } from "next/navigation";

// export default function EditProfilePage() {
//   const router = useRouter();
//   const [profile, setProfile] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     try {
//       const res = await fetch("/api/landing/profile");
//       const data = await res.json();

//       if (res.ok && data.success) {
//         setProfile(data.data);
//       } else if (res.status === 401) {
//         router.push("/login");
//       }
//     } catch (error) {
//       console.error("Failed to fetch profile:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex min-h-[60vh] items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35] mx-auto mb-3" />
//           <p className="text-sm text-gray-600 dark:text-gray-400">Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!profile) return null;

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-black">
//       <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-6">
//           <Link
//             href="/profile"
//             className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] text-gray-600 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-[#1A1A1A] hover:border-[#FF6B35] dark:hover:border-[#FF6B35] active:scale-95"
//           >
//             <ArrowLeft className="h-5 w-5" />
//           </Link>
//           <div className="min-w-0 flex-1">
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
//               Edit Profile
//             </h1>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               Update your personal information and birth details
//             </p>
//           </div>
//         </div>

//         <EditProfileForm profile={profile} onUpdate={fetchProfile} />
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import EditProfileForm from "@/components/landing/profile/EditProfileForm";
import { Loader2, ArrowLeft, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
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

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* 
        Header Section 
        - Mobile: Minimalist with a clear back button
        - Desktop: Aligned with the sidebar content
      */}
      <div className="flex items-center gap-4 mb-6 lg:mb-8">
        <Link
          href="/profile"
          className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#1C1C1E] text-gray-700 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-white/5 transition-all hover:bg-gray-50 dark:hover:bg-[#2C2C2E] active:scale-90"
        >
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
        </Link>
        
        <div className="flex-1 min-w-0">
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Edit Profile
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="text-sm text-gray-500 dark:text-gray-400 truncate"
          >
            Update personal details & birth information
          </motion.p>
        </div>
      </div>

      {/* Form Container */}
      <div className="relative">
        <EditProfileForm profile={profile} onUpdate={fetchProfile} />
      </div>
    </div>
  );
}
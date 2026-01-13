"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Trash2,
  Phone,
  MessageSquare,
  Star,
  Loader2,
  IndianRupee,
  ArrowLeft,
  X,
} from "lucide-react";
import { avatar } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

export default function FavoritesPage() {
  const [profile, setProfile] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, favRes] = await Promise.all([
        fetch("/api/landing/profile"),
        fetch("/api/landing/profile/favorites"),
      ]);

      const profileData = await profileRes.json();
      const favData = await favRes.json();

      if (profileData.success) setProfile(profileData.data);
      if (favData.success) setFavorites(favData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (astrologerId: string) => {
    // Optimistic UI Update
    const previous = [...favorites];
    setFavorites((prev) => prev.filter((f) => f.astrologer.id !== astrologerId));

    try {
      const res = await fetch(`/api/landing/profile/favorites/${astrologerId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Removed from favorites");
    } catch (e) {
      setFavorites(previous); // Revert on failure
      toast.error("Could not remove");
    }
  };

  if (!profile && !loading) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 px-4 sm:px-0 pb-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="lg:hidden p-2 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Favorites
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            Astrologers you follow.
          </p>
        </div>
      </div>

      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#FF6B35] mb-2" />
            <p className="text-xs text-gray-500">Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-16 text-center dark:border-white/5 dark:bg-[#1C1C1E]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/10">
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              No Favorites
            </h3>
            <p className="mb-6 mt-1 max-w-xs text-xs text-gray-500">
              Follow astrologers to see them here.
            </p>
            <Link
              href="/talk-to-astrologers"
              className="rounded-xl bg-[#FF6B35] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-[#e55a2b]"
            >
              Browse Astrologers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AnimatePresence>
              {favorites.map((fav, i) => (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 transition-all shadow-sm dark:border-white/5 dark:bg-[#1C1C1E]"
                >
                  <button
                    onClick={() => removeFavorite(fav.astrologer?.id)}
                    className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-gray-300 transition-all hover:bg-gray-100 hover:text-red-500 dark:hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex gap-3 items-start">
                    {/* Avatar */}
                    <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-full border border-gray-100 dark:border-white/10 flex-shrink-0 overflow-hidden">
                      <Image
                        src={avatar(fav.astrologer?.profileImage)}
                        alt={fav.astrologer?.name}
                        fill
                        className="object-cover"
                        unoptimized={true}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pr-6">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {fav.astrologer?.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {fav.astrologer?.primarySkill}
                      </p>
                      
                      <div className="mt-1.5 flex items-center gap-2">
                         <div className="flex items-center gap-1 text-[10px] font-bold text-white bg-green-500 px-1.5 py-0.5 rounded">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            <span>4.5</span>
                         </div>
                         <div className="flex items-center gap-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                            <IndianRupee className="h-2.5 w-2.5" />
                            <span>{fav.astrologer?.charge}/min</span>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href={`/talk-to-astrologers/${fav.astrologer?.id}?type=call`}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-green-500 bg-green-50 dark:bg-green-500/10 py-2 text-xs font-bold text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call
                    </Link>
                    <Link
                      href={`/talk-to-astrologers/${fav.astrologer?.id}?type=chat`}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-[#FF6B35] py-2 text-xs font-bold text-white hover:bg-[#e55a2b] transition-colors shadow-sm shadow-orange-500/20"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Chat
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
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
} from "lucide-react";
import { avatar } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";

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
    try {
      await fetch(`/api/landing/profile/favorites/${astrologerId}`, {
        method: "DELETE",
      });
      setFavorites((prev) =>
        prev.filter((f) => f.astrologer.id !== astrologerId),
      ); // Optimistic update
    } catch (e) {
      console.error(e);
    }
  };

  if (!profile) return null;

  return (
    <div className="w-full space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-start gap-4">
        <Link
          href="/profile"
          className="mt-1 rounded-xl border border-gray-100 bg-white p-2.5 text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#111] dark:text-gray-200 lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Favorites
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 md:text-base">
            Astrologers you follow and love.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[400px]"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white py-20 dark:border-white/5 dark:bg-[#111]">
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-[#FF6B35]" />
            <p className="text-sm text-gray-500">Loading your favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white px-4 py-20 text-center dark:border-white/5 dark:bg-[#111]">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/10">
              <Heart className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              No Favorites Yet
            </h3>
            <p className="mb-6 max-w-sm text-gray-500">
              Follow astrologers to quickly access them here for consultations.
            </p>
            <Link
              href="/talk-to-astrologers"
              className="rounded-xl bg-[#FF6B35] px-6 py-2.5 font-bold text-white transition-all hover:bg-[#e55a2b]"
            >
              Browse Astrologers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AnimatePresence>
              {favorites.map((fav, i) => (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 transition-all hover:border-[#FF6B35]/30 hover:shadow-xl hover:shadow-orange-500/5 dark:border-white/5 dark:bg-[#111]"
                >
                  <button
                    onClick={() => removeFavorite(fav.astrologer?.id)}
                    className="absolute right-4 top-4 z-10 rounded-xl p-2 text-gray-300 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                    title="Remove from favorites"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="mb-4 flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-full border-2 border-[#FF6B35]/20 p-0.5">
                      <Image
                        src={avatar(fav.astrologer?.profileImage)}
                        alt={fav.astrologer?.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {fav.astrologer?.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {fav.astrologer?.primarySkill}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-xs font-bold text-yellow-500">
                        <Star className="h-3 w-3 fill-current" />
                        <span>4.5</span>
                        <span className="ml-1 font-normal text-gray-400">
                          (200+ Orders)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">
                      <IndianRupee className="h-3 w-3" />
                      {fav.astrologer?.charge}/min
                    </div>
                    <div className="rounded-lg bg-green-50 px-3 py-1 text-xs font-bold text-green-600 dark:bg-green-900/10 dark:text-green-400">
                      Available
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={`/talk-to-astrologers/${fav.astrologer?.id}?type=call`}
                      className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 font-bold text-white shadow-lg shadow-green-500/20 transition-colors hover:bg-green-600"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </Link>
                    <Link
                      href={`/talk-to-astrologers/${fav.astrologer?.id}?type=chat`}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-2.5 font-bold text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-[#e55a2b]"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}

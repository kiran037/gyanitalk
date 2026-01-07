"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ScrollText, Plus, MapPin, Calendar, Trash2, Loader2, 
  ChevronRight, Clock, ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface Kundali {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}

export default function KundaliPage() {
  const [kundalis, setKundalis] = useState<Kundali[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/landing/profile/kundali");
      const data = await res.json();
      if (data.success) setKundalis(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteKundali = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Kundali?")) return;

    const previousKundalis = [...kundalis];
    setKundalis((prev) => prev.filter((k) => k.id !== id));

    try {
      const res = await fetch(`/api/landing/profile/kundali/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Kundali deleted successfully");
    } catch (e) {
      toast.error("Failed to delete Kundali");
      setKundalis(previousKundalis);
    }
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Responsive Header with Back Button */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
                <Link 
                    href="/profile" 
                    className="lg:hidden mt-1 p-2.5 rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Saved Kundalis</h1>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Manage birth charts for you and your family.</p>
                </div>
            </div>
            
            {/* Desktop Button (Hidden on Mobile) */}
            <Link
                href="/free-kundali"
                className="hidden sm:flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B35] text-white font-bold hover:bg-[#e55a2b] transition-all shadow-lg shadow-[#FF6B35]/20 group"
            >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                <span>Create New</span>
            </Link>
        </div>

        {/* Mobile Button (Full width) */}
        <Link
            href="/free-kundali"
            className="flex sm:hidden items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF6B35] text-white font-bold shadow-lg shadow-[#FF6B35]/20"
        >
            <Plus className="h-5 w-5" />
            <span>Create New Kundali</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[400px]"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35] mb-2" />
            <p className="text-sm text-gray-500">Loading your charts...</p>
          </div>
        ) : kundalis.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 px-4">
            <div className="h-20 w-20 bg-orange-50 dark:bg-orange-900/10 rounded-full flex items-center justify-center mb-6">
                <ScrollText className="h-10 w-10 text-[#FF6B35]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Saved Kundalis</h3>
            <p className="text-gray-500 max-w-sm mb-8">
              You haven't saved any birth charts yet. Create one to get detailed astrological insights.
            </p>
            <Link
              href="/free-kundali"
              className="px-6 py-2.5 rounded-xl border-2 border-[#FF6B35] text-[#FF6B35] font-bold hover:bg-[#FF6B35] hover:text-white transition-all"
            >
              Create First Kundali
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
            {kundalis.map((k, i) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="group relative p-5 md:p-6 rounded-2xl md:rounded-3xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 hover:border-[#FF6B35]/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all overflow-hidden"
              >
                  {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center text-lg font-bold ${k.gender === 'Male' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400'}`}>
                        {k.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg leading-tight">{k.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{k.gender}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteKundali(k.id)}
                    className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-white/5 p-4 rounded-xl md:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-[#FF6B35]" />
                    <span className="truncate">{format(new Date(k.birthDate), "dd MMM yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-[#FF6B35]" />
                    <span>{k.birthTime}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#FF6B35]" />
                    <span className="truncate">{k.birthPlace}</span>
                  </div>
                </div>

                {/* Action */}
                <Link
                  href={`/free-kundali/view/${k.id}`}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  View Full Report
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
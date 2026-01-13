"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, Clock, Calendar, Loader2, IndianRupee, ChevronRight, ArrowLeft } from "lucide-react";
import { avatar } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";

export default function CallHistoryPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/landing/profile/astrologer-history/calls?page=${currentPage}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        setCalls(data.data.calls || []); 
        setPagination(data.data.pagination);
      } else {
        setCalls([]);
      }
    } catch (error) {
      console.error("Error fetching call history:", error);
      setCalls([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 w-full max-w-4xl mx-auto px-4 sm:px-0 pb-6">
       
       {/* Header */}
       <div className="flex items-center gap-3 mb-2">
        <Link 
          href="/profile" 
          className="lg:hidden p-2 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Call History</h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Details of your voice consultations.</p>
        </div>
      </div>

      <div className="space-y-3 min-h-[300px]">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-12">
             <Loader2 className="h-6 w-6 animate-spin text-[#FF6B35] mb-2" />
             <p className="text-xs text-gray-500">Loading call logs...</p>
           </div>
        ) : (
          <>
            {!calls || calls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-white/5">
                <div className="h-12 w-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
                    <Phone className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">No Calls Yet</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-[200px] mb-4">
                   Speak directly to our astrologers now.
                </p>
                <Link
                     href="/talk-to-astrologers"
                     className="px-5 py-2 rounded-xl bg-[#FF6B35] text-white text-xs font-bold shadow-md hover:bg-[#e55a2b] transition-all"
                >
                    Call Astrologer
                </Link>
              </div>
            ) : (
              <>
                {calls.map((call, i) => (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                        {/* Left: Avatar */}
                        <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-full border border-gray-100 dark:border-white/10 flex-shrink-0 overflow-hidden">
                            <Image
                                src={avatar(call.astrologer?.profileImage)}
                                alt={call.astrologer?.name || "Astrologer"}
                                fill
                                className="object-cover"
                                unoptimized={true}
                            />
                        </div>

                        {/* Middle: Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                        {call.astrologer?.name}
                                    </h3>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                                        {call.astrologer?.primarySkill}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                        call.callStatus === "Completed"
                                        ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    }`}>
                                        {call.callStatus}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(call.created_at).toLocaleDateString()}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {call.call_duration || call.totalMin} mins
                                </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-gray-50 dark:border-white/5 pt-3">
                                <div className="flex items-center gap-0.5 font-bold text-sm text-gray-900 dark:text-white">
                                    <IndianRupee className="h-3.5 w-3.5" />
                                    {call.deduction}
                                </div>
                                
                                <Link
                                    href={`/talk-to-astrologers/${call.astrologer?.id}`}
                                    className="flex items-center gap-1 text-xs font-semibold text-[#FF6B35] hover:underline"
                                >
                                    Call Again
                                    <ChevronRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                  </motion.div>
                ))}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrevPage}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-medium disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-xs font-medium self-center text-gray-500">
                        {currentPage} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-medium disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
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
    <div className="space-y-6 w-full">
       
       {/* Header with Back Button */}
       <div className="flex items-start gap-4">
        <Link 
          href="/profile" 
          className="lg:hidden mt-1 p-2.5 rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Call History</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Details of your voice consultations.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 min-h-[300px]"
      >
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 rounded-3xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
             <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35] mb-2" />
             <p className="text-sm text-gray-500">Loading call logs...</p>
           </div>
        ) : (
          <>
            {!calls || calls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-3xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 text-center px-4">
                <div className="h-20 w-20 bg-green-50 dark:bg-green-900/10 rounded-full flex items-center justify-center mb-6">
                    <Phone className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Calls Yet</h3>
                <p className="text-gray-500 max-w-sm mb-6">
                   Prefer voice over chat? Speak directly to our astrologers now.
                </p>
                <Link
                     href="/talk-to-astrologers"
                     className="px-6 py-2.5 rounded-xl bg-[#FF6B35] text-white font-bold hover:bg-[#e55a2b] transition-all"
                >
                    Call an Astrologer
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
                    className="group p-5 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 hover:border-[#FF6B35]/30 hover:shadow-lg hover:shadow-orange-500/5 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        {/* Left Side */}
                        <div className="flex items-center gap-4">
                            <div className="relative h-16 w-16 rounded-full p-0.5 border-2 border-[#FF6B35]/20 flex-shrink-0">
                                <Image
                                src={avatar(call.astrologer?.profileImage)}
                                alt={call.astrologer?.name || "Astrologer"}
                                fill
                                className="rounded-full object-cover"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors">
                                        {call.astrologer?.name}
                                    </h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                                        call.callStatus === "Completed"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    }`}>
                                        {call.callStatus}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{call.astrologer?.primarySkill}</p>
                                
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(call.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {call.call_duration || call.totalMin} mins
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-6 sm:border-l border-gray-100 dark:border-white/5 w-full sm:w-auto">
                            <div className="text-left sm:text-right">
                                <p className="text-xs text-gray-400 mb-0.5">Total Cost</p>
                                <div className="flex items-center sm:justify-end gap-0.5 font-bold text-lg text-gray-900 dark:text-white">
                                    <IndianRupee className="h-4 w-4" />
                                    {call.deduction}
                                </div>
                            </div>
                            
                            <Link
                                href={`/talk-to-astrologers/${call.astrologer?.id}`}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold text-sm hover:bg-[#FF6B35] hover:text-white transition-all group/btn"
                            >
                                Call Again
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover/btn:text-white" />
                            </Link>
                        </div>
                    </div>
                  </motion.div>
                ))}

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 pt-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Page {currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
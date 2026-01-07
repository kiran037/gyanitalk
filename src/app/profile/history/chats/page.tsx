"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Clock, Calendar, IndianRupee, Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import { avatar } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

interface ChatSession {
  id: string;
  astrologer: {
    id: string;
    name: string;
    profile: string | null;
    primarySkill?: string;
  };
  status: string;
  duration: number;
  deduction: number;
  created_at: string;
}

export default function ChatHistoryPage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/landing/profile/astrologer-history/chats");
      const data = await res.json();
      if (data.success) setChats(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Chat History</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Review your past conversations with astrologers.</p>
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
            <p className="text-sm text-gray-500">Loading history...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 text-center px-4">
            <div className="h-20 w-20 bg-purple-50 dark:bg-purple-900/10 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Chats Yet</h3>
            <p className="text-gray-500 max-w-sm mb-6">
              Connect with our expert astrologers to get guidance on your life path.
            </p>
            <Link
                href="/talk-to-astrologers"
                className="px-6 py-2.5 rounded-xl bg-[#FF6B35] text-white font-bold hover:bg-[#e55a2b] transition-all"
            >
                Start Chatting
            </Link>
          </div>
        ) : (
          <>
            {chats.map((chat, i) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group p-5 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 hover:border-[#FF6B35]/30 hover:shadow-lg hover:shadow-orange-500/5 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-full p-0.5 border-2 border-[#FF6B35]/20 flex-shrink-0">
                        <Image
                          src={avatar(chat.astrologer.profile)}
                          alt={chat.astrologer.name}
                          fill
                          className="rounded-full object-cover"
                        />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors">
                            {chat.astrologer.name}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                            chat.status === "Completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                            {chat.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{chat.astrologer.primarySkill}</p>
                      
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(chat.created_at), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(chat.duration)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-6 sm:border-l border-gray-100 dark:border-white/5 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-400 mb-0.5">Total Cost</p>
                        <div className="flex items-center sm:justify-end gap-0.5 font-bold text-lg text-gray-900 dark:text-white">
                            <IndianRupee className="h-4 w-4" />
                            {chat.deduction}
                        </div>
                    </div>
                    
                    <Link
                        href={`/talk-to-astrologers/${chat.astrologer.id}`}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold text-sm hover:bg-[#FF6B35] hover:text-white transition-all group/btn"
                    >
                        Chat Again
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover/btn:text-white" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
}
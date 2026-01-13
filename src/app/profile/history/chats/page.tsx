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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Chat History</h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Past conversations with astrologers.</p>
        </div>
      </div>

      <div className="space-y-3 min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#FF6B35] mb-2" />
            <p className="text-xs text-gray-500">Loading history...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="h-12 w-12 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">No Chats Yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-[200px] mb-4">
              Start a chat to get expert guidance.
            </p>
            <Link
                href="/talk-to-astrologers"
                className="px-5 py-2 rounded-xl bg-[#FF6B35] text-white text-xs font-bold shadow-md hover:bg-[#e55a2b] transition-all"
            >
                Explore Astrologers
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
                className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  
                  {/* Left: Avatar */}
                  <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-full border border-gray-100 dark:border-white/10 flex-shrink-0 overflow-hidden">
                      <Image
                        src={avatar(chat.astrologer.profile)}
                        alt={chat.astrologer.name}
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
                                {chat.astrologer.name}
                            </h3>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                                {chat.astrologer.primarySkill}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                chat.status === "Completed"
                                ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                                {chat.status}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(chat.created_at), "MMM d")}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(chat.duration)}
                        </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-gray-50 dark:border-white/5 pt-3">
                        <div className="flex items-center gap-0.5 font-bold text-sm text-gray-900 dark:text-white">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {chat.deduction}
                        </div>
                        
                        <Link
                            href={`/talk-to-astrologers/${chat.astrologer.id}`}
                            className="flex items-center gap-1 text-xs font-semibold text-[#FF6B35] hover:underline"
                        >
                            Chat Again
                            <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
"use client";

import { motion } from "framer-motion";
import { Bot, MessageSquare, Users, Wallet, Star, TrendingUp } from "lucide-react";
import { avatar } from "@/lib/images";

interface AIAstrologerDetailProps {
  aiAstrologer: any;
}

export function AIAstrologerDetail({ aiAstrologer }: AIAstrologerDetailProps) {
  const primarySkill =
    aiAstrologer.primarySkillName || aiAstrologer.primary_skill || "";

  const allSkillNames: string[] = Array.isArray(aiAstrologer.allSkillNames)
    ? aiAstrologer.allSkillNames
    : aiAstrologer.all_skills
        ?.split(",")
        .map((s: string) => s.trim())
        .filter(Boolean) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative">
          {/* Banner */}
          <div className="h-36 bg-gradient-to-r from-purple-500 to-blue-500" />

          {/* AI badge in banner */}
          <div className="absolute top-6 right-6">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 text-white text-sm font-semibold">
              <Bot className="w-4 h-4" />
              AI ASTROLOGER
            </button>
          </div>

          {/* Avatar */}
          <div className="absolute left-6 bottom-0 translate-y-1/2">
            <img
              src={avatar(aiAstrologer.image)}
              alt={aiAstrologer.name}
              className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-800 shadow-xl"
            />
          </div>
        </div>

        {/* Profile + stats */}
        <div className="px-6 pt-20 pb-6 md:pl-44">
          <div className="flex flex-col gap-6">
            {/* Name + labels */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {aiAstrologer.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  {aiAstrologer.type && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-semibold rounded-full">
                      {aiAstrologer.type}
                    </span>
                  )}
                  {aiAstrologer.aiType && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-semibold rounded-full">
                      {aiAstrologer.aiType}
                    </span>
                  )}
                  {aiAstrologer.featured === 1 && (
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-semibold rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <MessageSquare className="w-3 h-3" />
                  Chats
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {aiAstrologer.totalChats || 0}
                </p>
              </div>

              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <Users className="w-3 h-3" />
                  Followers
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {aiAstrologer.followerCount || 0}
                </p>
              </div>

              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <Wallet className="w-3 h-3" />
                  Wallet
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{aiAstrologer.walletBalance || "0"}
                </p>
              </div>

              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <TrendingUp className="w-3 h-3" />
                  Orders
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {aiAstrologer.totalOrders || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* About */}
      {aiAstrologer.about && (
        <motion.div
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {aiAstrologer.about}
          </p>
        </motion.div>
      )}

      {/* Skills & Experience */}
      <motion.div
        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Skills & Experience
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

          {allSkillNames.length > 0 && (
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">All Skills</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {allSkillNames.join(", ")}
              </p>
            </div>
          )}

          {aiAstrologer.experience && (
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Experience</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {aiAstrologer.experience}
              </p>
            </div>
          )}

          {aiAstrologer.referral_code && (
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Referral Code</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {aiAstrologer.referral_code}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Pricing */}
      <motion.div
        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiAstrologer.chat_charge && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Chat Charge (INR)</p>
              <p className="text-2xl font-bold text-[#FF6B35]">
                ₹{aiAstrologer.chat_charge}
                <span className="text-sm font-normal text-gray-500">/min</span>
              </p>
            </div>
          )}
          {aiAstrologer.chat_charge_usd && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Chat Charge (USD)</p>
              <p className="text-2xl font-bold text-[#FF6B35]">
                ${aiAstrologer.chat_charge_usd}
                <span className="text-sm font-normal text-gray-500">/min</span>
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* System Instruction */}
      {aiAstrologer.system_intruction && (
        <motion.div
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            System Instruction
          </h2>
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
              {aiAstrologer.system_intruction}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  );
}
"use client";

import { motion } from "framer-motion";
import {
  Star,
  Clock,
  MapPin,
  Languages,
  Phone,
  MessageSquare,
  Users,
  Wallet,
  Mail,
  Shield,
} from "lucide-react";
import { avatar } from "@/lib/images";

interface AstrologerDetailHeaderProps {
  astrologer: any;
}

export function AstrologerDetailHeader({
  astrologer,
}: AstrologerDetailHeaderProps) {
  const allSkillNames: string[] = Array.isArray(astrologer.allSkillNames)
    ? astrologer.allSkillNames
    : [];

  const languageNames: string[] = Array.isArray(astrologer.languageNames)
    ? astrologer.languageNames
    : [];

  const primarySkill: string | undefined =
    astrologer.primarySkillName || astrologer.primarySkill;

  const otherSkills: string[] = allSkillNames.filter(
    (name) => !primarySkill || name !== primarySkill
  );

  return (
    <motion.div
      className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl overflow-hidden mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >

      {/* Profile Info */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={avatar(astrologer.profileImage)}
              alt={astrologer.name}
              className="w-32 h-32 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-800 shadow-xl"
            />
            <div
              className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 ${
                astrologer.chatStatus === "online"
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between w-full mb-4 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {astrologer.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  {astrologer.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      {astrologer.email}
                    </div>
                  )}
                  {astrologer.contactNo && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4" />
                      {astrologer.contactNo}
                    </div>
                  )}
                  {astrologer.currentCity && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {astrologer.currentCity}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2 mt-2">
                {astrologer.isActive ? (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-semibold rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400 text-xs font-semibold rounded-full">
                    Inactive
                  </span>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  Rating
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {astrologer.averageRating || "N/A"}
                </p>
              </div>

              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <Users className="w-3 h-3" />
                  Followers
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {astrologer.followerCount || 0}
                </p>
              </div>

              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <Wallet className="w-3 h-3" />
                  Wallet
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{astrologer.walletBalance || "0"}
                </p>
              </div>

              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <MessageSquare className="w-3 h-3" />
                  Chats
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {astrologer.chatCount || 0}
                </p>
              </div>

              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <Phone className="w-3 h-3" />
                  Calls
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {astrologer.callCount || 0}
                </p>
              </div>

              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <Clock className="w-3 h-3" />
                  Experience
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {astrologer.experienceInYears}y
                </p>
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-2">

              {/* Other skills */}
              {otherSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-lg"
                >
                  {skill}
                </span>
              ))}

              {/* Languages */}
              {(languageNames.length || astrologer.languageKnown) && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-lg flex items-center gap-1">
                  <Languages className="w-3 h-3" />
                  {languageNames.length
                    ? languageNames.slice(0, 2).join(", ")
                    : astrologer.languageKnown
                        ?.split(",")
                        .slice(0, 2)
                        .join(", ")}
                </span>
              )}

              {/* Charge */}
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs font-medium rounded-lg">
                ₹{astrologer.charge}/min
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
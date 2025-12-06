"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Eye, MoreVertical, Trash2, Star, Clock, 
  MapPin, Languages, Phone, MessageSquare, 
  Video, Users, Wallet, CheckCircle, XCircle,
  Shield
} from "lucide-react";
import { avatar } from "@/lib/images";
import { Button } from "@/components/adminUI/Button";
import { ActionModal } from "@/components/adminUI/ActionModal";

interface AstrologerCardProps {
  astrologer: any;
  index: number;
  onToggleStatus: (id: string, field: string, value: any) => void;
  onDelete: (id: string) => void;
  onView: () => void;
}

export function AstrologerCard({
  astrologer,
  index,
  onToggleStatus,
  onDelete,
  onView,
}: AstrologerCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <motion.div
        className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden hover:shadow-xl transition-all"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Header with Avatar */}
        <div className="relative p-6 bg-gradient-to-br from-[#FF6B35]/5 to-[#FFB347]/5">
          {/* Verified Badge */}
          {astrologer.isVerified && (
            <div className="absolute top-3 right-3">
              <div className="p-1.5 bg-green-500 rounded-full">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <img
                src={avatar(astrologer.profileImage)}
                alt={astrologer.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-white/60 dark:ring-gray-700/60"
              />
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                  astrologer.chatStatus === "online"
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white truncate">
                {astrologer.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {astrologer.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  {astrologer.experienceInYears}y
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10">
                  <button
                    onClick={() => {
                      onView();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 grid grid-cols-3 gap-3 border-b border-gray-200/60 dark:border-gray-700/60">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
              <Users className="w-3 h-3" />
              Followers
            </div>
            <p className="font-bold text-gray-900 dark:text-white">
              {astrologer.followerCount}
            </p>
          </div>
          <div className="text-center border-x border-gray-200/60 dark:border-gray-700/60">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
              <Wallet className="w-3 h-3" />
              Wallet
            </div>
            <p className="font-bold text-gray-900 dark:text-white">
              ₹{astrologer.walletBalance}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
              <Star className="w-3 h-3" />
              Orders
            </div>
            <p className="font-bold text-gray-900 dark:text-white">
              {astrologer.totalOrder || 0}
            </p>
          </div>
        </div>

        {/* Rates - Single Line */}
        <div className="p-4 flex items-center justify-between gap-2 border-b border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center gap-1.5 text-xs">
            <MessageSquare className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">
              ₹{astrologer.charge}/min
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Phone className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">
              ₹{astrologer.charge}/min
            </span>
          </div>
          {astrologer.videoCallRate && (
            <div className="flex items-center gap-1.5 text-xs">
              <Video className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                ₹{astrologer.videoCallRate}/min
              </span>
            </div>
          )}
        </div>

        {/* Toggle Buttons - Compact */}
        <div className="p-4 space-y-2">
          {/* First Row: Verified, Active, Live Status */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() =>
                onToggleStatus(
                  astrologer.id,
                  "isVerified",
                  !astrologer.isVerified
                )
              }
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                astrologer.isVerified
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {astrologer.isVerified ? "Verified" : "Unverified"}
            </button>

            <button
              onClick={() =>
                onToggleStatus(astrologer.id, "isActive", !astrologer.isActive)
              }
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                astrologer.isActive
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {astrologer.isActive ? "Active" : "Inactive"}
            </button>

            <button
              onClick={() =>
                onToggleStatus(
                  astrologer.id,
                  "isLiveOff",
                  astrologer.isLiveOff === 0 ? 1 : 0
                )
              }
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                astrologer.isLiveOff === 0
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {astrologer.isLiveOff === 0 ? "Live On" : "Live Off"}
            </button>
          </div>

          {/* Second Row: Chat and Call Status */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Chat:
              </span>
              <select
                value={astrologer.chatStatus || "offline"}
                onChange={(e) =>
                  onToggleStatus(astrologer.id, "chatStatus", e.target.value)
                }
                className="flex-1 text-xs px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="busy">Busy</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Call:
              </span>
              <select
                value={astrologer.callStatus || "offline"}
                onChange={(e) =>
                  onToggleStatus(astrologer.id, "callStatus", e.target.value)
                }
                className="flex-1 text-xs px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="busy">Busy</option>
              </select>
            </div>
          </div>
        </div>

        {/* View Button */}
        <div className="p-4 pt-0">
          <Button
            variant="outline"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={onView}
            className="w-full"
          >
            View Details
          </Button>
        </div>
      </motion.div>

      {/* Delete Modal */}
      <ActionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          onDelete(astrologer.id);
          setShowDeleteModal(false);
        }}
        title="Delete Astrologer"
        message={`Are you sure you want to delete ${astrologer.name}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </>
  );
}
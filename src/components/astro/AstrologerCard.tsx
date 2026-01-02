"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Eye, MoreVertical, Trash2, Star, Clock, 
  MapPin, Languages, Phone, MessageSquare, 
  Video, Users, Wallet, CheckCircle, XCircle,
  Shield, ChevronDown, Activity, Mic
} from "lucide-react";
import { avatar } from "@/lib/images";
import { Button } from "@/components/adminUI/Button"; // Assuming this exists based on your code
import { ActionModal } from "@/components/adminUI/ActionModal"; // Assuming this exists based on your code

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

  // Helper to determine status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "busy": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  return (
    <>
      <motion.div
        className="group relative flex flex-col justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        {/* === Top Section: Profile === */}
        <div className="p-5 pb-0">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-orange-400 to-amber-400">
                <img
                  src={avatar(astrologer.profileImage)}
                  alt={astrologer.name}
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-900"
                />
              </div>
              {/* Online Dot */}
              <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${getStatusColor(astrologer.chatStatus)}`} />
            </div>

            {/* Name & Basic Info */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-2">
                  {astrologer.name}
                </h3>
                
                {/* Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                      <button
                        onClick={() => {
                          onView();
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> View Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteModal(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                {astrologer.email}
              </p>
              
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <Clock className="w-3 h-3" /> {astrologer.experienceInYears}y Exp
                </span>
                {astrologer.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-xs font-medium text-green-700 dark:text-green-400">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* === Middle Section: Stats & Wallet === */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Wallet</p>
              <p className="font-bold text-gray-900 dark:text-white">₹{astrologer.walletBalance}</p>
            </div>
            <div className="text-center border-l border-gray-200 dark:border-gray-700">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Followers</p>
              <p className="font-bold text-gray-900 dark:text-white">{astrologer.followerCount}</p>
            </div>
            <div className="text-center border-l border-gray-200 dark:border-gray-700">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Orders</p>
              <p className="font-bold text-gray-900 dark:text-white">{astrologer.totalOrder || 0}</p>
            </div>
          </div>
          
          {/* Rates Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
                <MessageSquare className="w-3 h-3 text-orange-500" />
                <span className="font-semibold">₹{astrologer.charge}/min</span>
             </div>
             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
                <Phone className="w-3 h-3 text-blue-500" />
                <span className="font-semibold">₹{astrologer.charge}/min</span>
             </div>
             {astrologer.videoCallRate && (
               <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
                  <Video className="w-3 h-3 text-purple-500" />
                  <span className="font-semibold">₹{astrologer.videoCallRate}/min</span>
               </div>
             )}
          </div>
        </div>

        {/* === Bottom Section: Admin Controls === */}
        <div className="bg-gray-50/80 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 p-4 space-y-3">
          
          {/* Row 1: Status Toggles */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => onToggleStatus(astrologer.id, "isVerified", !astrologer.isVerified)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                astrologer.isVerified
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                  : "bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
              }`}
            >
              {astrologer.isVerified ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {astrologer.isVerified ? "Verified" : "Unverified"}
            </button>

            <button
              onClick={() => onToggleStatus(astrologer.id, "isActive", !astrologer.isActive)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                astrologer.isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                  : "bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              {astrologer.isActive ? "Active" : "Inactive"}
            </button>
            
            <button
              onClick={() => onToggleStatus(astrologer.id, "isLiveOff", astrologer.isLiveOff === 0 ? 1 : 0)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                astrologer.isLiveOff === 0
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 animate-pulse"
                  : "bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${astrologer.isLiveOff === 0 ? "bg-red-500" : "bg-gray-400"}`} />
              {astrologer.isLiveOff === 0 ? "Live On" : "Live Off"}
            </button>
          </div>

          {/* Row 2: Availability Dropdowns */}
          <div className="grid grid-cols-2 gap-3">
             {/* Chat Select */}
             <div className="relative">
                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                   <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <select 
                   value={astrologer.chatStatus || "offline"}
                   onChange={(e) => onToggleStatus(astrologer.id, "chatStatus", e.target.value)}
                   className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium py-2 pl-7 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                >
                   <option value="online">Chat: Online</option>
                   <option value="offline">Chat: Offline</option>
                   <option value="busy">Chat: Busy</option>
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                   <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
             </div>

             {/* Call Select */}
             <div className="relative">
                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                   <Phone className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <select 
                   value={astrologer.callStatus || "offline"}
                   onChange={(e) => onToggleStatus(astrologer.id, "callStatus", e.target.value)}
                   className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium py-2 pl-7 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                >
                   <option value="online">Call: Online</option>
                   <option value="offline">Call: Offline</option>
                   <option value="busy">Call: Busy</option>
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                   <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
             </div>
          </div>

          {/* View Details Button */}
          <Button
            variant="outline"
            onClick={onView}
            className="w-full h-9 rounded-lg border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/10 text-xs font-bold"
          >
            Manage Profile
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
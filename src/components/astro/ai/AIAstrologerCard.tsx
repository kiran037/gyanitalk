"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, MoreVertical, Trash2, Edit, Bot, Users, Wallet, MessageSquare, Star } from "lucide-react";
import { avatar } from "@/lib/images";
import { Button } from "@/components/adminUI/Button";
import { ActionModal } from "@/components/adminUI/ActionModal";

interface AIAstrologerCardProps {
  aiAstrologer: any;
  index: number;
  onEdit: (ai: any) => void;
  onDelete: (id: string) => void;
  onView: () => void;
}

export function AIAstrologerCard({
  aiAstrologer,
  index,
  onEdit,
  onDelete,
  onView,
}: AIAstrologerCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const primarySkill =
    aiAstrologer.primarySkillName || aiAstrologer.primary_skill || "";

  const allSkillNames: string[] = Array.isArray(aiAstrologer.allSkillNames)
    ? aiAstrologer.allSkillNames
    : aiAstrologer.all_skills
      ?.split(",")
      .map((s: string) => s.trim())
      .filter(Boolean) || [];

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
        <div className="relative p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
          {/* AI Badge */}
          <div className="absolute top-3 right-3">
            <div className="px-2 py-1 bg-purple-500 rounded-lg flex items-center gap-1">
              <Bot className="w-3 h-3 text-white" />
              <span className="text-xs font-bold text-white">AI</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <img
                src={avatar(aiAstrologer.image)}
                alt={aiAstrologer.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-white/60 dark:ring-gray-700/60"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white truncate">
                {aiAstrologer.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {aiAstrologer.type && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-[10px] font-medium rounded">
                    {aiAstrologer.type}
                  </span>
                )}
                {aiAstrologer.aiType && (
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-[10px] font-medium rounded">
                    {aiAstrologer.aiType}
                  </span>
                )}
                {aiAstrologer.featured === 1 && (
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                )}
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
                      onEdit(aiAstrologer);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
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

        {/* About */}
        {aiAstrologer.about && (
          <div className="px-6 py-3 border-b border-gray-200/60 dark:border-gray-700/60">
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {aiAstrologer.about}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="p-4 grid grid-cols-3 gap-3 border-b border-gray-200/60 dark:border-gray-700/60">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
              <MessageSquare className="w-3 h-3" />
              Chats
            </div>
            <p className="font-bold text-gray-900 dark:text-white">
              {aiAstrologer.totalChats || 0}
            </p>
          </div>
          <div className="text-center border-x border-gray-200/60 dark:border-gray-700/60">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
              <Users className="w-3 h-3" />
              Followers
            </div>
            <p className="font-bold text-gray-900 dark:text-white">
              {aiAstrologer.followerCount || 0}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
              <Wallet className="w-3 h-3" />
              Wallet
            </div>
            <p className="font-bold text-gray-900 dark:text-white">
              ₹{aiAstrologer.walletBalance || "0"}
            </p>
          </div>
        </div>

        {/* Skills & Charges */}
        <div className="p-4 space-y-2 border-b border-gray-200/60 dark:border-gray-700/60">
          {primarySkill && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Primary Skill</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {primarySkill}
              </span>
            </div>
          )}
          {aiAstrologer.chat_charge && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Chat Charge</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ₹{aiAstrologer.chat_charge}/min
              </span>
            </div>
          )}
          {aiAstrologer.experience && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Experience</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {aiAstrologer.experience}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Eye className="w-4 h-4" />}
              onClick={onView}
              className="flex-1"
            >
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => onEdit(aiAstrologer)}
              className="flex-1"
            >
              Edit
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Delete Modal */}
      <ActionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          onDelete(aiAstrologer.id);
          setShowDeleteModal(false);
        }}
        title="Delete AI Astrologer"
        message={`Are you sure you want to delete ${aiAstrologer.name}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </>
  );
}
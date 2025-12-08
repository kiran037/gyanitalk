"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, MoreVertical, Trash2, Edit, Users, Calendar } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { avatar } from "@/lib/images";

interface GroupCardProps {
  group: any;
  index: number;
  onEdit: (group: any) => void;
  onDelete: (id: string) => void;
  onView: () => void;
}

export function GroupCard({ group, index, onEdit, onDelete, onView }: GroupCardProps) {
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
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                {group.name}
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {group.memberCount} members
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(group.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

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
                      onEdit(group);
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

          {/* Members Preview */}
          {group.members && group.members.length > 0 && (
            <div className="mb-4">
              <div className="flex -space-x-2">
                {group.members.slice(0, 5).map((member: any, i: number) => (
                  <img
                    key={i}
                    src={avatar(member.profileImage) || "/placeholder-avatar.png"}
                    alt={member.name}
                    className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800 object-cover"
                  />
                ))}
                {group.members.length > 5 && (
                  <div className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      +{group.members.length - 5}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Button variant="outline" size="sm" icon={<Eye className="w-4 h-4" />} onClick={onView} className="w-full">
            View Members
          </Button>
        </div>
      </motion.div>

      <ActionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          onDelete(group.id);
          setShowDeleteModal(false);
        }}
        title="Delete Group"
        message={`Are you sure you want to delete "${group.name}"? This will remove all member assignments.`}
        confirmText="Delete"
        type="danger"
      />
    </>
  );
}
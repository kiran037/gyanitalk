"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast/ToastProvider";
import { Button } from "@/components/adminUI/Button";
import { Users, Trash2 } from "lucide-react";
import { avatar } from "@/lib/images";
import { motion } from "framer-motion";
import { ActionModal } from "@/components/adminUI/ActionModal";

interface GroupMembersListProps {
  groupId: string;
  onMemberRemoved: () => void;
}

export function GroupMembersList({ groupId, onMemberRemoved }: GroupMembersListProps) {
  const addToast = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/astrologer-groups/${groupId}/members`);
      const data = await response.json();

      if (data.success) {
        setMembers(data.data);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (astrologerId: string) => {
    try {
      const response = await fetch(`/api/astrologer-groups/${groupId}/members/${astrologerId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Member removed from group");
        fetchMembers();
        onMemberRemoved();
      } else {
        addToast("error", "Error", "Failed to remove member");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to remove member");
    }
  };

  return (
    <>
      <motion.div
        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Members ({members.length})
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Members</h3>
            <p className="text-gray-600 dark:text-gray-400">Add astrologers to this group</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl flex items-center justify-between"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={avatar(member.astrologer?.profileImage)}
                    alt={member.astrologer?.name || "Astrologer"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {member.astrologer?.name || "Unknown"}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {member.astrologer?.isVerified && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setRemovingId(member.astrologerId?.toString() || null)}
                >
                  Remove
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <ActionModal
        isOpen={removingId !== null}
        onClose={() => setRemovingId(null)}
        onConfirm={() => {
          if (removingId) handleRemove(removingId);
          setRemovingId(null);
        }}
        title="Remove Member"
        message="Are you sure you want to remove this astrologer from the group?"
        type="warning"
      />
    </>
  );
}
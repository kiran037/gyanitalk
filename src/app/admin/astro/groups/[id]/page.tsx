"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { ArrowLeft, Edit, RefreshCw, UserPlus } from "lucide-react";
import { GroupForm } from "@/components/astro/groups/GroupForm";
import { GroupMembersList } from "@/components/astro/groups/GroupMembersList";
import { AddMembersModal } from "@/components/astro/groups/AddMembersModal";
import { motion } from "framer-motion";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const addToast = useToast();
  const groupId = params.id as string;

  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/astrologer-groups/${groupId}`);
      const data = await response.json();

      if (data.success) {
        setGroup(data.data);
      } else {
        addToast("error", "Error", "Failed to fetch group details");
        router.push("/admin/astro/groups");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch group details");
      router.push("/admin/astro/groups");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.push("/admin/astro/groups")}
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={fetchGroupDetails}
            />
            <Button
              variant="outline"
              size="sm"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => setShowEditForm(true)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              icon={<UserPlus className="w-4 h-4" />}
              onClick={() => setShowAddMembers(true)}
            >
              Add Members
            </Button>
          </div>
        </div>

        {/* Group Info */}
        <motion.div
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {group.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {group.memberCount} {group.memberCount === 1 ? "member" : "members"} • Created{" "}
                {new Date(group.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Members List */}
        <GroupMembersList groupId={groupId} onMemberRemoved={fetchGroupDetails} />
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <GroupForm
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          group={group}
          onSuccess={() => {
            fetchGroupDetails();
            setShowEditForm(false);
          }}
        />
      )}

      {/* Add Members Modal */}
      {showAddMembers && (
        <AddMembersModal
          isOpen={showAddMembers}
          onClose={() => setShowAddMembers(false)}
          groupId={groupId}
          onSuccess={() => {
            fetchGroupDetails();
            setShowAddMembers(false);
          }}
        />
      )}
    </div>
  );
}
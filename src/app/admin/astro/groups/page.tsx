///Users/xeoren/Desktop/gyanitallk-admin/src/app/admin/astro/groups/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { Users, Plus, RefreshCw } from "lucide-react";
import { GroupCard } from "@/components/astro/groups/GroupCard";
import { GroupForm } from "@/components/astro/groups/GroupForm";
import { motion } from "framer-motion";

export default function AstrologerGroupsPage() {
  const router = useRouter();
  const addToast = useToast();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/astrologer-groups${search ? `?search=${search}` : ""}`);
      const data = await response.json();

      if (data.success) {
        setGroups(data.data);
      } else {
        addToast("error", "Error", "Failed to fetch groups");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/astrologer-groups/${id}`, { method: "DELETE" });
      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Group deleted successfully");
        fetchGroups();
      } else {
        addToast("error", "Error", "Failed to delete group");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete group");
    }
  };

  const handleEdit = (group: any) => {
    setEditingGroup(group);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Astrologer Groups"
          subtitle="Organize astrologers into groups for better management"
          badge={{ text: "GROUPS", variant: "blue" }}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={fetchGroups}
              />
              <Button
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setEditingGroup(null);
                  setShowForm(true);
                }}
              >
                Create Group
              </Button>
            </div>
          }
        />

        {/* Stats */}
        <motion.div
          className="mt-6 mb-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {groups.length}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search groups..."
            className="flex-1"
          />
          <Button onClick={fetchGroups}>Search</Button>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 animate-pulse"
              >
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-16 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Groups Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first group to organize astrologers
            </p>
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
              Create Group
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, index) => (
              <GroupCard
                key={group.id}
                group={group}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={() => router.push(`/admin/astro/groups/${group.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <GroupForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingGroup(null);
          }}
          group={editingGroup}
          onSuccess={() => {
            fetchGroups();
            setShowForm(false);
            setEditingGroup(null);
          }}
        />
      )}
    </div>
  );
}
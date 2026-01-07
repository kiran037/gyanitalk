"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Shield, Lock } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import RoleStatsCards from "@/components/admin/roles/RoleStatsCards";
import RolesTable from "@/components/admin/roles/RolesTable";
import CreateRoleModal from "@/components/admin/roles/CreateRoleModal";
import UserSearchModal from "@/components/admin/roles/UserSearchModal";

interface Role {
  id: string;
  name: string;
  userCount: number;
  isLocked: boolean;
  createdAt: string;
}

interface RoleStats {
  totalRoles: number;
  totalUsers: number;
  lockedRoles: number;
  editableRoles: number;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<RoleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchRolesStats();
  }, []);

  const fetchRolesStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/roles/stats");
      const data = await response.json();

      if (data.success) {
        setRoles(data.data.roles);
        setStats(data.data.summary);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleCreated = () => {
    setShowCreateModal(false);
    fetchRolesStats();
  };

  const handleRoleAssigned = () => {
    setShowAssignModal(false);
    fetchRolesStats();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="w-full mx-auto space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Role Management"
          subtitle="Create, manage, and assign roles to users"
          badge={{ text: "Admin Panel", variant: "purple" }}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowAssignModal(true)}
                icon={<Users className="w-4 h-4" />}
              >
                Assign Roles
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowCreateModal(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Create Role
              </Button>
            </div>
          }
        />

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                About Role Management
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Roles help organize users by permissions. <strong>Astrologer</strong> and <strong>User</strong> roles are locked and can only be managed from their respective pages. All other roles can be freely created and assigned.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && <RoleStatsCards stats={stats} loading={loading} />}

        {/* Roles Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/60">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  All Roles
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Showing {roles.length} roles
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Lock className="w-3 h-3" />
                <span>{stats?.lockedRoles || 0} locked roles</span>
              </div>
            </div>
          </div>

          <RolesTable roles={roles} loading={loading} onRefresh={fetchRolesStats} />
        </div>
      </div>

      {/* Modals */}
      <CreateRoleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleRoleCreated}
      />

      <UserSearchModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={handleRoleAssigned}
      />
    </div>
  );
}
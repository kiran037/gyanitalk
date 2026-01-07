"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Lock, AlertCircle, Search } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import RoleUsersTable from "@/components/admin/roles/RoleUsersTable";
import { useDebounce } from "@/hooks/useDebounce";

interface User {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  profile: string | null;
  assignedAt: string;
}

interface RoleData {
  role: {
    id: string;
    name: string;
    isLocked: boolean;
  };
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function RoleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params.roleId as string;

  const [roleData, setRoleData] = useState<RoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchRoleUsers();
  }, [roleId, currentPage, debouncedSearch]);

  const fetchRoleUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const response = await fetch(`/api/admin/roles/${roleId}/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setRoleData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch role users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this role from the user?")) return;

    try {
      const response = await fetch(
        `/api/admin/roles/users/${userId}/roles/${roleId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (data.success) {
        fetchRoleUsers();
      } else {
        alert(data.error || "Failed to remove role");
      }
    } catch (error) {
      console.error("Failed to remove role:", error);
      alert("Failed to remove role");
    }
  };

  if (!roleData && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Role Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The role you're looking for doesn't exist or has been deleted.
          </p>
          <Button variant="primary" onClick={() => router.push("/admin/roles")}>
            Back to Roles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="w-full mx-auto space-y-6">
        {/* Page Header */}
        <PageHeader
          title={roleData?.role.name || "Loading..."}
          subtitle={`Manage users with ${roleData?.role.name || "this"} role`}
          badge={
            roleData?.role.isLocked
              ? { text: "Locked", variant: "orange" }
              : { text: "Editable", variant: "green" }
          }
          leftActions={
            <Button
              variant="ghost"
              size="md"
              onClick={() => router.push("/admin/roles")}
              icon={<ArrowLeft className="w-4 h-4" />}
              ariaLabel="Back to roles"
            />
          }
        />

        {/* Locked Role Warning */}
        {roleData?.role.isLocked && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                  Protected Role
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  This is a system role and cannot be modified from here. Users with this role are managed from their respective sections.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-lg overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-xl">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Users in Role
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {roleData?.pagination.total || 0} total users
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search users by name, email, or phone..."
              className="max-w-md"
            />
          </div>

          {/* Table */}
          <RoleUsersTable
            users={roleData?.users || []}
            loading={loading}
            pagination={roleData?.pagination}
            onPageChange={setCurrentPage}
            onRemoveUser={roleData?.role.isLocked ? undefined : handleRemoveUser}
            isLocked={roleData?.role.isLocked || false}
          />
        </div>
      </div>
    </div>
  );
}
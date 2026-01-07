import { useState } from "react";
import { Lock, Users, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import Link from "next/link";

interface Role {
  id: string;
  name: string;
  userCount: number;
  isLocked: boolean;
  createdAt: string;
}

interface RolesTableProps {
  roles: Role[];
  loading: boolean;
  onRefresh: () => void;
}

export default function RolesTable({ roles, loading, onRefresh }: RolesTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="p-12 text-center">
        <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Roles Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Create your first role to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Role Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Users
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {roles.map((role) => (
            <tr
              key={role.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB347]/10 rounded-lg">
                    {role.isLocked ? (
                      <Lock className="w-4 h-4 text-[#FF6B35]" />
                    ) : (
                      <Users className="w-4 h-4 text-[#FF6B35]" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {role.name}
                    </div>
                    {role.isLocked && (
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        System Role
                      </div>
                    )}
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                {role.isLocked ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Editable
                  </span>
                )}
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {role.userCount}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {role.userCount === 1 ? "user" : "users"}
                  </span>
                </div>
              </td>

              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {formatDate(role.createdAt)}
              </td>

              <td className="px-6 py-4 text-right">
                <Link href={`/admin/roles/${role.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye className="w-4 h-4" />}
                  >
                    View Users
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Refresh Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}
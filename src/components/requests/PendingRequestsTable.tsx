// ===================================
// FILE: components/requests/PendingRequestsTable.tsx
// ===================================

"use client";

import { PendingRequest } from "@/lib/requests/types";
import { TimeRemainingBadge } from "./TimeRemainingBadge";
import { getTypeBadgeColor, formatRelativeTime } from "@/lib/requests/utils";
import { Button } from "@/components/adminUI/Button";
import { User, UserPlus } from "lucide-react";

interface PendingRequestsTableProps {
  data: PendingRequest[];
  loading: boolean;
  onAssign: (requestId: number, type: "call" | "chat") => void;
  onBulkAssign: (requests: { id: number; type: string }[]) => void;
  selectedRows?: number[];
  onSelectionChange?: (rows: number[]) => void;
}

export function PendingRequestsTable({
  data,
  loading,
  onAssign,
  onBulkAssign,
  selectedRows = [],
  onSelectionChange,
}: PendingRequestsTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? data.map((r) => r.id) : []);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(
        checked
          ? [...selectedRows, id]
          : selectedRows.filter((rowId) => rowId !== id)
      );
    }
  };

  const handleBulkAssignClick = () => {
    const selected = data
      .filter((r) => selectedRows.includes(r.id))
      .map((r) => ({ id: r.id, type: r.type }));
    onBulkAssign(selected);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="animate-pulse p-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
        <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Pending Requests
        </h3>
        <p className="text-gray-500">All requests have been assigned or processed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
            {selectedRows.length} request(s) selected
          </span>
          <Button variant="primary" onClick={handleBulkAssignClick}>
            <UserPlus className="w-4 h-4" />
            Bulk Assign
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]/50"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Time Remaining
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Assignment Timeout
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Attempt
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((request) => (
                <tr
                  key={`${request.type}-${request.id}`}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    request.isExpiringSoon ? "bg-red-50/50 dark:bg-red-900/10" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(request.id)}
                      onChange={(e) => handleSelectRow(request.id, e.target.checked)}
                      className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]/50"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(
                        request.type
                      )}`}
                    >
                      {request.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    #{request.id}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.userName}
                        </p>
                        <p className="text-xs text-gray-500">{request.userContact}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <TimeRemainingBadge
                      timeRemaining={request.timeRemaining}
                      label="Expires in"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <TimeRemainingBadge
                      timeRemaining={request.assignmentTimeout}
                      label="Timeout in"
                      showIcon={false}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                      #{request.assignmentMetadata?.attempt || 1}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onAssign(request.id, request.type)}
                    >
                      Assign
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
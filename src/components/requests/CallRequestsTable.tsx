// ===================================
// FILE: components/requests/CallRequestsTable.tsx
// ===================================

"use client";

import { CallRequest } from "@/lib/requests/types";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { RequestActionsMenu } from "./RequestActionsMenu";
import { formatDateTime, formatRelativeTime } from "@/lib/requests/utils";
import { Phone, User } from "lucide-react";
import { useState } from "react";

interface CallRequestsTableProps {
  data: CallRequest[];
  loading: boolean;
  onAssign: (requestId: number) => void;
  onViewDetails: (requestId: number) => void;
  selectedRows?: number[];
  onSelectionChange?: (ids: number[]) => void;
}

export function CallRequestsTable({
  data,
  loading,
  onAssign,
  onViewDetails,
  selectedRows = [],
  onSelectionChange,
}: CallRequestsTableProps) {
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="animate-pulse p-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
        <Phone className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Call Requests
        </h3>
        <p className="text-gray-500">No call requests found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {onSelectionChange && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]/50"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Astrologer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Rate
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((request) => (
              <tr
                key={request.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {onSelectionChange && (
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(request.id)}
                      onChange={(e) => handleSelectRow(request.id, e.target.checked)}
                      className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]/50"
                    />
                  </td>
                )}
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
                        {request.user?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {request.user?.contactNo || "N/A"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <RequestStatusBadge status={request.callStatus || "Pending"} size="sm" />
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                  {request.astrologer?.name || "-"}
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatRelativeTime(request.created_at)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(request.created_at)}
                  </p>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                  ₹{request.callRate}/min
                </td>
                <td className="px-4 py-4 text-right">
                  <RequestActionsMenu
                    requestId={request.id}
                    requestType="call"
                    status={request.callStatus || "Pending"}
                    onAssign={() => onAssign(request.id)}
                    onReassign={() => onAssign(request.id)}
                    onViewDetails={() => onViewDetails(request.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
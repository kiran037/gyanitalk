// ===================================
// FILE: app/admin/requests/pending/page.tsx
// ===================================

"use client";

import { useState } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { PendingRequestsTable } from "@/components/requests/PendingRequestsTable";
import { AssignGroupModal } from "@/components/requests/AssignGroupModal";
import { BulkAssignModal } from "@/components/requests/BulkAssignModal";
import { usePendingRequests } from "@/lib/requests/hooks";
import { Clock, AlertTriangle, RefreshCw } from "lucide-react";

export default function PendingRequestsPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [bulkAssignModalOpen, setBulkAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{
    id: number;
    type: "call" | "chat";
  } | null>(null);

  // Auto-refresh every 15 seconds
  const { data, summary, loading, refetch } = usePendingRequests(15000);

  const handleAssign = (requestId: number, type: "call" | "chat") => {
    setSelectedRequest({ id: requestId, type });
    setAssignModalOpen(true);
  };

  const handleBulkAssign = (requests: { id: number; type: string }[]) => {
    setBulkAssignModalOpen(true);
  };

  return (
    <div className="space-y-6 p-10">
      {/* Header */}
      <PageHeader
        title="Pending Requests"
        subtitle="Requests waiting for assignment - Auto-refreshes every 15 seconds"
        badge={{ text: "Live", variant: "orange" }}
        actions={
          <Button
            variant="outline"
            onClick={refetch}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        }
      />

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.totalPending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Calls</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.pendingCalls}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Chats</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.pendingChats}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.expiringSoon}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning for expiring requests */}
      {summary && summary.expiringSoon > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-300">
                {summary.expiringSoon} request(s) expiring soon!
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">
                These requests have less than 1 minute remaining. Please assign them immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <PendingRequestsTable
        data={data}
        loading={loading}
        onAssign={handleAssign}
        onBulkAssign={handleBulkAssign}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
      />

      {/* Modals */}
      {assignModalOpen && selectedRequest && (
        <AssignGroupModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedRequest(null);
          }}
          requestId={selectedRequest.id}
          requestType={selectedRequest.type}
          onSuccess={() => {
            refetch();
            setSelectedRequest(null);
          }}
        />
      )}

      {bulkAssignModalOpen && (
        <BulkAssignModal
          isOpen={bulkAssignModalOpen}
          onClose={() => setBulkAssignModalOpen(false)}
          selectedRequests={selectedRows.map((id) => {
            const request = data.find((r) => r.id === id);
            return { id, type: request?.type || "call" };
          })}
          onSuccess={() => {
            setSelectedRows([]);
            refetch();
          }}
        />
      )}
    </div>
  );
}
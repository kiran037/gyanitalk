// ===================================
// FILE: app/admin/requests/call-requests/page.tsx
// ===================================

"use client";

import { useState } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { CallRequestsTable } from "@/components/requests/CallRequestsTable";
import { RequestFilters } from "@/components/requests/RequestFilters";
import { AssignGroupModal } from "@/components/requests/AssignGroupModal";
import { BulkAssignModal } from "@/components/requests/BulkAssignModal";
import { useCallRequests, useGroups } from "@/lib/requests/hooks";
import { RequestFilters as Filters } from "@/lib/requests/types";
import { Phone, UserPlus, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { exportToCSV } from "@/lib/requests/utils";

export default function CallRequestsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({});
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [bulkAssignModalOpen, setBulkAssignModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  const { data: groups } = useGroups(false);
  const { data, pagination, loading } = useCallRequests({ ...filters, page, limit: 20 });

  const handleAssign = (requestId: number) => {
    setSelectedRequestId(requestId);
    setAssignModalOpen(true);
  };

  const handleBulkAssign = () => {
    setBulkAssignModalOpen(true);
  };

  const handleViewDetails = (requestId: number) => {
    router.push(`/admin/requests/call-requests/${requestId}`);
  };

  const handleExport = () => {
    const exportData = data.map((request) => ({
      ID: request.id,
      User: request.user?.name || "N/A",
      Contact: request.user?.contactNo || "N/A",
      Status: request.callStatus || "Pending",
      Astrologer: request.astrologer?.name || "-",
      Rate: request.callRate,
      Created: request.created_at,
    }));
    exportToCSV(exportData, "call-requests");
  };

  return (
    <div className="space-y-6 p-10">
      {/* Header */}
      <PageHeader
        title="Call Requests"
        subtitle="Manage and assign call requests to astrologer groups"
        badge={{ text: "Requests", variant: "blue" }}
        actions={
          <>
            <Button
              variant="outline"
              onClick={handleExport}
              icon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
            {selectedRows.length > 0 && (
              <Button
                variant="primary"
                onClick={handleBulkAssign}
                icon={<UserPlus className="w-4 h-4" />}
              >
                Bulk Assign ({selectedRows.length})
              </Button>
            )}
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pagination.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.filter((r) => r.callStatus === "Pending").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.filter((r) => r.callStatus === "Completed").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.filter((r) => r.callStatus === "Confirmed").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <RequestFilters
        onFilterChange={setFilters}
        availableGroups={groups}
        showGroupFilter={true}
      />

      {/* Table */}
      <CallRequestsTable
        data={data}
        loading={loading}
        onAssign={handleAssign}
        onViewDetails={handleViewDetails}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      {assignModalOpen && selectedRequestId && (
        <AssignGroupModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedRequestId(null);
          }}
          requestId={selectedRequestId}
          requestType="call"
          onSuccess={() => window.location.reload()}
        />
      )}

      {bulkAssignModalOpen && (
        <BulkAssignModal
          isOpen={bulkAssignModalOpen}
          onClose={() => setBulkAssignModalOpen(false)}
          selectedRequests={selectedRows.map((id) => ({ id, type: "call" }))}
          onSuccess={() => {
            setSelectedRows([]);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
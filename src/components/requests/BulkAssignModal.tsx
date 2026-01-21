// ===================================
// FILE: components/requests/BulkAssignModal.tsx
// ===================================

"use client";

import { useState } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Button } from "@/components/adminUI/Button";
import { GroupSelectionCombobox } from "./GroupSelectionCombobox";
import { useGroups, useBulkAssign } from "@/lib/requests/hooks";
import { useToast } from "@/components/Toast/ToastProvider";
import { Users, CheckCircle, XCircle } from "lucide-react";

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequests: Array<{ id: number; type: "call" | "chat" }>;
  onSuccess?: () => void;
}

export function BulkAssignModal({
  isOpen,
  onClose,
  selectedRequests,
  onSuccess,
}: BulkAssignModalProps) {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [results, setResults] = useState<any>(null);

  const { data: groups } = useGroups(false);
  const { bulkAssign, loading } = useBulkAssign();
  const addToast = useToast();

  const handleBulkAssign = async () => {
    if (!selectedGroup) {
      addToast("error", "Selection Required", "Please select a group");
      return;
    }

    try {
      const response = await bulkAssign({
        requests: selectedRequests,
        groupId: selectedGroup,
      });

      setResults(response.data);

      if (response.data.successCount > 0) {
        addToast(
          "success",
          "Bulk Assignment Complete",
          `${response.data.successCount} request(s) assigned successfully`
        );
      }

      if (response.data.failedCount > 0) {
        addToast(
          "warning",
          "Some Assignments Failed",
          `${response.data.failedCount} request(s) could not be assigned`
        );
      }

      onSuccess?.();
    } catch (error: any) {
      addToast("error", "Bulk Assignment Failed", error.message);
    }
  };

  const handleClose = () => {
    setResults(null);
    setSelectedGroup(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Assign Requests"
      size="md"
    >
      {!results ? (
        <div className="space-y-6">
          {/* Selection Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedRequests.length} Request{selectedRequests.length !== 1 ? "s" : ""}{" "}
                  Selected
                </p>
                <p className="text-xs text-gray-500">
                  {selectedRequests.filter((r) => r.type === "call").length} call(s),{" "}
                  {selectedRequests.filter((r) => r.type === "chat").length} chat(s)
                </p>
              </div>
            </div>
          </div>

          {/* Group Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign All To
            </label>
            <GroupSelectionCombobox
              groups={groups}
              value={selectedGroup}
              onChange={setSelectedGroup}
              placeholder="Select a group..."
              showStats={true}
            />
          </div>

          {/* Warning */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-lg p-4">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ All selected requests will be assigned to the chosen group. This action
              cannot be undone.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBulkAssign}
              className="flex-1"
              loading={loading}
              disabled={!selectedGroup}
            >
              Assign All ({selectedRequests.length})
            </Button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-300">
                  Success
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {results.successCount}
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-900 dark:text-red-300">
                  Failed
                </span>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {results.failedCount}
              </p>
            </div>
          </div>

          {/* Failed Requests Details */}
          {results.failedCount > 0 && (
            <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                      Error
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.results
                    .filter((r: any) => !r.success)
                    .map((result: any) => (
                      <tr
                        key={`${result.type}-${result.id}`}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="px-4 py-2 text-gray-900 dark:text-white">
                          #{result.id}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              result.type === "call"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            }`}
                          >
                            {result.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-red-600 dark:text-red-400">
                          {result.error}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Close Button */}
          <Button variant="primary" onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
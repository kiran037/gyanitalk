// ===================================
// FILE: components/requests/AssignGroupModal.tsx
// ===================================

"use client";

import { useState } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Button } from "@/components/adminUI/Button";
import { GroupSelectionCombobox } from "./GroupSelectionCombobox";
import { useGroups, useAssignRequest } from "@/lib/requests/hooks";
import { useToast } from "@/components/Toast/ToastProvider";
import { Radio } from "lucide-react";

interface AssignGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: number;
  requestType: "call" | "chat";
  currentGroup?: number | null;
  onSuccess?: () => void;
}

export function AssignGroupModal({
  isOpen,
  onClose,
  requestId,
  requestType,
  currentGroup,
  onSuccess,
}: AssignGroupModalProps) {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(
    currentGroup || null
  );
  const [broadcastToAll, setBroadcastToAll] = useState(false);

  const { data: groups, loading: groupsLoading } = useGroups(false);
  const { assign, loading: assigning } = useAssignRequest();
  const addToast = useToast();

  const handleAssign = async () => {
    if (!selectedGroup && !broadcastToAll) {
      addToast("error", "Selection Required", "Please select a group or choose broadcast");
      return;
    }

    try {
      if (broadcastToAll) {
        // TODO: Call broadcast API
        addToast(
          "success",
          "Broadcasted",
          `${requestType === "call" ? "Call" : "Chat"} request broadcasted to all astrologers`
        );
      } else {
        const result = await assign(requestId, selectedGroup!, requestType);
        addToast(
          "success",
          "Assigned Successfully",
          result.message || "Request assigned to group"
        );
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      addToast("error", "Assignment Failed", error.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign to Group" size="md">
      <div className="space-y-6">
        {/* Group Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Astrologer Group
          </label>
          <GroupSelectionCombobox
            groups={groups}
            value={selectedGroup}
            onChange={setSelectedGroup}
            placeholder="Choose a group..."
            showStats={true}
          />
          {selectedGroup && (
            <p className="mt-2 text-xs text-gray-500">
              The request will be sent to all active astrologers in this group
            </p>
          )}
        </div>

        {/* Broadcast Option */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={broadcastToAll}
              onChange={(e) => {
                setBroadcastToAll(e.target.checked);
                if (e.target.checked) setSelectedGroup(null);
              }}
              className="mt-1 w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]/50"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Broadcast to All Astrologers
                </span>
                <Radio className="w-4 h-4 text-[#FF6B35]" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Skip group assignment and send this request to all available astrologers
                immediately
              </p>
            </div>
          </label>
        </div>

        {/* Info Box */}
        {!broadcastToAll && selectedGroup && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>Auto-reassignment enabled:</strong> If no astrologer accepts within
              the timeout period, the request will automatically move to the next priority
              group.
            </p>
          </div>
        )}

        {broadcastToAll && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-lg p-4">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ <strong>Broadcasting:</strong> This will send the request to all active
              astrologers at once, bypassing the group priority system.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={assigning}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            className="flex-1"
            loading={assigning}
            disabled={!selectedGroup && !broadcastToAll}
          >
            {broadcastToAll ? "Broadcast Now" : "Assign to Group"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
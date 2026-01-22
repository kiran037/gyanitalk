// ===================================
// FILE: components/requests/GroupPrioritiesForm.tsx
// ===================================

"use client";

import { useState } from "react";
import { Group, GroupPriorities } from "@/lib/requests/types";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { GripVertical, Save, Award } from "lucide-react";

interface GroupPrioritiesFormProps {
  groups: Group[];
  priorities: GroupPriorities;
  onSave: (priorities: GroupPriorities) => Promise<void>;
}

export function GroupPrioritiesForm({
  groups,
  priorities,
  onSave,
}: GroupPrioritiesFormProps) {
  const [values, setValues] = useState<GroupPriorities>(priorities);
  const [loading, setLoading] = useState(false);
  const addToast = useToast();

  // Sort groups by priority
  const sortedGroups = [...groups].sort((a, b) => {
    const aPriority = values[a.id.toString()]?.priority || 999;
    const bPriority = values[b.id.toString()]?.priority || 999;
    return aPriority - bPriority;
  });

  const handlePriorityChange = (groupId: string, priority: number) => {
    setValues({
      ...values,
      [groupId]: {
        ...values[groupId],
        priority,
      },
    });
  };

  const handleTimeoutChange = (groupId: string, timeout: number) => {
    setValues({
      ...values,
      [groupId]: {
        ...values[groupId],
        timeout,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(values);
      addToast("success", "Priorities Saved", "Group priorities updated successfully");
    } catch (error: any) {
      addToast("error", "Save Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center text-white">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Group Priorities
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Set priority order and timeout for each group
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {sortedGroups.map((group) => {
          const groupId = group.id.toString();
          const groupPriority = values[groupId] || { priority: 999, timeout: 30 };

          return (
            <div
              key={groupId}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div className="cursor-move text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Group Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {group.name || `Group ${groupId}`}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {group.totalAstrologers} astrologers
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Priority */}
                    <Input
                      label="Priority"
                      type="number"
                      value={groupPriority.priority}
                      onChange={(e) =>
                        handlePriorityChange(groupId, parseInt(e.target.value))
                      }
                      min="1"
                      max="100"
                      required
                    />

                    {/* Timeout */}
                    <Input
                      label="Timeout (seconds)"
                      type="number"
                      value={groupPriority.timeout}
                      onChange={(e) =>
                        handleTimeoutChange(groupId, parseInt(e.target.value))
                      }
                      min="10"
                      max="300"
                      required
                    />
                  </div>
                </div>

                {/* Priority Badge */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
                    <Award className="w-3 h-3" />
                    P{groupPriority.priority}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>How it works:</strong> Lower priority numbers are tried first. If no
          astrologer accepts within the timeout, the request moves to the next priority group.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={() => setValues(priorities)}
          disabled={loading}
        >
          Reset
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          icon={<Save className="w-4 h-4" />}
        >
          Save Priorities
        </Button>
      </div>
    </form>
  );
}
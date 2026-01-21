// ===================================
// FILE: app/admin/requests/settings/page.tsx
// ===================================

"use client";

import { useState } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { SettingsForm } from "@/components/requests/SettingsForm";
import { GroupPrioritiesForm } from "@/components/requests/GroupPrioritiesForm";
import { TimeoutSettingsForm } from "@/components/requests/TimeoutSettingsForm";
import {
  useAssignmentRules,
  useGroupPriorities,
  useTimeoutSettings,
  useGroups,
  useSaveSettings,
} from "@/lib/requests/hooks";
import { AssignmentRules, GroupPriorities } from "@/lib/requests/types";
import { Settings } from "lucide-react";
import { motion } from "framer-motion";

type Tab = "rules" | "priorities" | "timeout";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("rules");

  const { data: rules, loading: rulesLoading } = useAssignmentRules();
  const { data: priorities, loading: prioritiesLoading } = useGroupPriorities();
  const { data: timeout, loading: timeoutLoading } = useTimeoutSettings();
  const { data: groups, loading: groupsLoading } = useGroups(false);

  const { saveRules, savePriorities, saveTimeout } = useSaveSettings();

  // Wrap save functions to return void instead of { data: ... }
  const handleSaveRules = async (values: AssignmentRules): Promise<void> => {
    await saveRules(values);
  };

  const handleSavePriorities = async (values: GroupPriorities): Promise<void> => {
    await savePriorities(values);
  };

  const handleSaveTimeout = async (minutes: number): Promise<void> => {
    await saveTimeout(minutes);
  };

  const tabs = [
    { id: "rules" as Tab, label: "Assignment Rules" },
    { id: "priorities" as Tab, label: "Group Priorities" },
    { id: "timeout" as Tab, label: "Timeout Settings" },
  ];

  return (
    <div className="space-y-6 p-10">
      {/* Header */}
      <PageHeader
        title="Request Settings"
        subtitle="Configure assignment rules, priorities, and timeouts"
        badge={{ text: "Settings", variant: "purple" }}
      />

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === "rules" && (
          <motion.div
            key="rules"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {rulesLoading ? (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ) : rules ? (
              <SettingsForm initialValues={rules} onSave={handleSaveRules} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Failed to load settings</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "priorities" && (
          <motion.div
            key="priorities"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {prioritiesLoading || groupsLoading ? (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ) : priorities && groups ? (
              <GroupPrioritiesForm
                groups={groups}
                priorities={priorities}
                onSave={handleSavePriorities}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Failed to load priorities</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "timeout" && (
          <motion.div
            key="timeout"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {timeoutLoading ? (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ) : timeout !== null ? (
              <TimeoutSettingsForm expiryMinutes={timeout} onSave={handleSaveTimeout} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Failed to load timeout settings</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              How Settings Work
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>
                • <strong>Assignment Rules:</strong> Control automatic behavior and retries
              </li>
              <li>
                • <strong>Group Priorities:</strong> Define the order groups receive requests
              </li>
              <li>
                • <strong>Timeout Settings:</strong> Set how long requests stay active
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
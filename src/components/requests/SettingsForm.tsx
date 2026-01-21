// ===================================
// FILE: components/requests/SettingsForm.tsx
// ===================================

"use client";

import { useState } from "react";
import { AssignmentRules } from "@/lib/requests/types";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { Settings, Save } from "lucide-react";

interface SettingsFormProps {
  initialValues: AssignmentRules;
  onSave: (values: AssignmentRules) => Promise<void>;
}

export function SettingsForm({ initialValues, onSave }: SettingsFormProps) {
  const [values, setValues] = useState<AssignmentRules>(initialValues);
  const [loading, setLoading] = useState(false);
  const addToast = useToast();

  const handleChange = (field: keyof AssignmentRules, value: any) => {
    setValues({ ...values, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(values);
      addToast("success", "Settings Saved", "Assignment rules updated successfully");
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
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Assignment Rules
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure automatic assignment behavior
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Default Timeout */}
        <Input
          label="Default Timeout (seconds)"
          type="number"
          value={values.default_timeout}
          onChange={(e) => handleChange("default_timeout", parseInt(e.target.value))}
          min="10"
          max="300"
          required
          className="max-w-md"
        />

        {/* Max Retries */}
        <Input
          label="Maximum Retries"
          type="number"
          value={values.max_retries}
          onChange={(e) => handleChange("max_retries", parseInt(e.target.value))}
          min="1"
          max="10"
          required
          className="max-w-md"
        />

        {/* Toggles */}
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={values.enable_auto_assign}
              onChange={(e) => handleChange("enable_auto_assign", e.target.checked)}
              className="mt-1 w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]/50"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Auto-Assignment
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Automatically assign new requests to the first priority group
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={values.enable_skill_matching}
              onChange={(e) => handleChange("enable_skill_matching", e.target.checked)}
              className="mt-1 w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]/50"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Skill Matching
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Match requests to astrologers based on their skills
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={values.load_balance}
              onChange={(e) => handleChange("load_balance", e.target.checked)}
              className="mt-1 w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]/50"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Load Balancing
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Distribute requests evenly among available astrologers
              </p>
            </div>
          </label>
        </div>

        {/* Priority Groups Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Priority Groups:</strong> Configure group priorities and timeouts in the
            "Group Priorities" tab. The system will try groups in priority order.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={() => setValues(initialValues)}
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
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  );
}
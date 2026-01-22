// ===================================
// FILE: components/requests/TimeoutSettingsForm.tsx
// ===================================

"use client";

import { useState } from "react";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { Clock, Save } from "lucide-react";

interface TimeoutSettingsFormProps {
  expiryMinutes: number;
  onSave: (minutes: number) => Promise<void>;
}

export function TimeoutSettingsForm({
  expiryMinutes,
  onSave,
}: TimeoutSettingsFormProps) {
  const [value, setValue] = useState(expiryMinutes);
  const [loading, setLoading] = useState(false);
  const addToast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(value);
      addToast("success", "Timeout Saved", "Request expiry time updated successfully");
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
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Request Expiry Timeout
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Set how long requests stay active before auto-rejection
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Expiry Input */}
        <Input
          label="Request Expiry Time (minutes)"
          type="number"
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value))}
          min="1"
          max="60"
          required
          className="max-w-md"
        />

        {/* Helper Text */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <strong>Current Setting:</strong> {value} minute{value !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-gray-500">
            After this time, if no astrologer has accepted the request, it will be automatically
            marked as "Rejected" and the user will be notified.
          </p>
        </div>

        {/* Examples */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recommended Settings:
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setValue(3)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                value === 3
                  ? "bg-[#FF6B35] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              3 min (Fast)
            </button>
            <button
              type="button"
              onClick={() => setValue(5)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                value === 5
                  ? "bg-[#FF6B35] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              5 min (Default)
            </button>
            <button
              type="button"
              onClick={() => setValue(10)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                value === 10
                  ? "bg-[#FF6B35] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              10 min (Slow)
            </button>
          </div>
        </div>

        {/* Warning */}
        {value < 3 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-lg p-4">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ <strong>Warning:</strong> Setting the expiry time too low may result in requests
              being rejected before astrologers have a chance to accept them.
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={() => setValue(expiryMinutes)}
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
            Save Timeout
          </Button>
        </div>
      </div>
    </form>
  );
}
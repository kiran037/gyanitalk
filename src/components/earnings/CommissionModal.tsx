// components/earnings/CommissionModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";

interface Commission {
  id: string;
  commissionTypeId: string;
  commission: number;
  astrologerId: string | null;
  isActive: boolean;
}

interface CommissionModalProps {
  commission: Commission | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CommissionModal({ commission, onClose, onSuccess }: CommissionModalProps) {
  const [formData, setFormData] = useState({
    commissionTypeId: "",
    astrologerId: "",
    commission: "",
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [commissionTypes, setCommissionTypes] = useState<any[]>([]);
  const addToast = useToast();

  useEffect(() => {
    fetchCommissionTypes();
    if (commission) {
      setFormData({
        commissionTypeId: commission.commissionTypeId,
        astrologerId: commission.astrologerId || "",
        commission: commission.commission.toString(),
        isActive: commission.isActive
      });
    }
  }, [commission]);

  const fetchCommissionTypes = async () => {
    try {
      const response = await fetch("/api/earnings/commission-types");
      const data = await response.json();
      if (data.success) {
        setCommissionTypes(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch commission types:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = commission
        ? `/api/earnings/commissions/${commission.id}`
        : "/api/earnings/commissions";
      
      const method = commission ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          commission: parseFloat(formData.commission),
          astrologerId: formData.astrologerId || null,
          createdBy: 1,
          modifiedBy: 1
        })
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", `Commission ${commission ? 'updated' : 'created'} successfully`);
        onSuccess();
      } else {
        addToast("error", "Error", data.error || "Failed to save commission");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to save commission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={commission ? "Edit Commission" : "Add Commission"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Commission Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.commissionTypeId}
            onChange={(e) => setFormData({ ...formData, commissionTypeId: e.target.value })}
            required
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            <option value="">Select Type</option>
            {commissionTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Commission Rate (%)"
          type="number"
          value={formData.commission}
          onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
          placeholder="e.g., 10"
          required
          min="0"
          max="100"
          step="0.01"
        />

        <Input
          label="Astrologer ID (Optional - Leave empty for all)"
          type="text"
          value={formData.astrologerId}
          onChange={(e) => setFormData({ ...formData, astrologerId: e.target.value })}
          placeholder="Leave empty for all astrologers"
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-[#FF6B35] bg-gray-100 border-gray-300 rounded focus:ring-[#FF6B35]"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
            Active
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={loading}
            className="flex-1"
          >
            {commission ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
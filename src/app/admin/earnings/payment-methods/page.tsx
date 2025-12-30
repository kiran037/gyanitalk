// app/earnings/payment-methods/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { useToast } from "@/components/Toast/ToastProvider";

interface PaymentMethod {
  id: number;
  method_name: string;
  method_id: number | null;
  isActive: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    method_name: "",
    method_id: "",
    isActive: true
  });

  const addToast = useToast();

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/earnings/payment-methods");
      const data = await response.json();

      if (data.success) {
        setMethods(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      addToast("error", "Error", "Failed to fetch payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (method?: PaymentMethod) => {
    if (method) {
      setSelectedMethod(method);
      setFormData({
        method_name: method.method_name,
        method_id: method.method_id?.toString() || "",
        isActive: method.isActive ?? true
      });
    } else {
      setSelectedMethod(null);
      setFormData({
        method_name: "",
        method_id: "",
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const url = "/api/earnings/payment-methods";
      const method = selectedMethod ? "PATCH" : "POST";

      const body = selectedMethod
        ? {
            id: selectedMethod.id,
            ...formData,
            method_id: formData.method_id ? parseInt(formData.method_id) : null
          }
        : {
            ...formData,
            method_id: formData.method_id ? parseInt(formData.method_id) : null
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", `Payment method ${selectedMethod ? 'updated' : 'created'} successfully`);
        setShowModal(false);
        fetchMethods();
      } else {
        addToast("error", "Error", data.error || "Failed to save payment method");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to save payment method");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMethod) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/earnings/payment-methods?id=${selectedMethod.id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Payment method deleted successfully");
        setShowDeleteModal(false);
        setSelectedMethod(null);
        fetchMethods();
      } else {
        addToast("error", "Error", data.error || "Failed to delete payment method");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete payment method");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-6">
      <PageHeader
        title="Payment Methods"
        subtitle="Manage withdrawal payment methods"
        badge={{ text: "SETTINGS", variant: "blue" }}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenModal()}
          >
            Add Payment Method
          </Button>
        }
      />

      {/* Payment Methods Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))
        ) : methods.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <CreditCard className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Payment Methods
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Add payment methods for astrologer withdrawals
            </p>
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
            >
              Add Payment Method
            </Button>
          </div>
        ) : (
          methods.map((method) => (
            <motion.div
              key={method.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.3)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  method.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {method.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {method.method_name}
              </h3>
              {method.method_id && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  ID: {method.method_id}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit className="w-4 h-4" />}
                  onClick={() => handleOpenModal(method)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4 text-red-600" />}
                  onClick={() => {
                    setSelectedMethod(method);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowModal(false)}
          title={selectedMethod ? "Edit Payment Method" : "Add Payment Method"}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Method Name"
              type="text"
              value={formData.method_name}
              onChange={(e) => setFormData({ ...formData, method_name: e.target.value })}
              placeholder="e.g., Bank Transfer, UPI, PayPal"
              required
            />

            <Input
              label="Method ID (Optional)"
              type="number"
              value={formData.method_id}
              onChange={(e) => setFormData({ ...formData, method_id: e.target.value })}
              placeholder="Internal ID"
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
                onClick={() => setShowModal(false)}
                className="flex-1"
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={actionLoading}
                className="flex-1"
              >
                {selectedMethod ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      <ActionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Payment Method"
        message="Are you sure you want to delete this payment method? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
}
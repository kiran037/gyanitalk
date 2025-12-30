"use client";

import { useState, useEffect } from "react";
import { Plus, DollarSign, Edit2, Trash2, Percent } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { motion } from "framer-motion";

interface RechargeAmount {
  id: number;
  amount: number;
  cashback: number | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export default function RechargePage() {
  const [recharges, setRecharges] = useState<RechargeAmount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecharge, setSelectedRecharge] = useState<RechargeAmount | null>(null);
  const [formData, setFormData] = useState({ amount: "", cashback: "" });
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    fetchRecharges();
  }, []);

  const fetchRecharges = async () => {
    try {
      const response = await fetch("/api/settings/recharge");
      const data = await response.json();
      if (data.success) {
        setRecharges(data.data);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch recharge amounts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = selectedRecharge
        ? `/api/settings/recharge/${selectedRecharge.id}`
        : "/api/settings/recharge";
      
      const response = await fetch(url, {
        method: selectedRecharge ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseInt(formData.amount),
          cashback: formData.cashback ? parseInt(formData.cashback) : 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", data.message);
        fetchRecharges();
        handleCloseModal();
      } else {
        addToast("error", "Error", data.error);
      }
    } catch (error) {
      addToast("error", "Error", "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecharge) return;
    setSubmitting(true);

    try {
      const response = await fetch(`/api/settings/recharge/${selectedRecharge.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Deleted", "Recharge amount deleted successfully");
        fetchRecharges();
        setIsDeleteModalOpen(false);
        setSelectedRecharge(null);
      } else {
        addToast("error", "Error", data.error);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (recharge: RechargeAmount) => {
    setSelectedRecharge(recharge);
    setFormData({
      amount: recharge.amount.toString(),
      cashback: recharge.cashback?.toString() || "0",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecharge(null);
    setFormData({ amount: "", cashback: "" });
  };

  const filteredRecharges = recharges.filter((r) =>
    r.amount.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recharge Amounts"
        subtitle="Manage recharge denominations and cashback offers"
        badge={{ text: "Financial", variant: "blue" }}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Recharge
          </Button>
        }
      />

      {/* Search & Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search amounts..."
          />
        </div>
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
          whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.5)" }}
        >
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Options</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{recharges.length}</div>
        </motion.div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecharges.map((recharge, index) => (
            <motion.div
              key={recharge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 hover:shadow-lg transition-all"
              whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.5)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Amount</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{recharge.amount}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit2 className="w-4 h-4" />}
                    onClick={() => handleEdit(recharge)}
                    ariaLabel="Edit"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4 text-red-500" />}
                    onClick={() => {
                      setSelectedRecharge(recharge);
                      setIsDeleteModalOpen(true);
                    }}
                    ariaLabel="Delete"
                  />
                </div>
              </div>

              {recharge.cashback && recharge.cashback > 0 ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Percent className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {recharge.cashback}% Cashback
                  </span>
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-500">No cashback</div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedRecharge ? "Edit Recharge Amount" : "Add Recharge Amount"}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Amount (₹)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="Enter amount"
            required
            icon={<DollarSign className="w-4 h-4" />}
          />
          <Input
            label="Cashback (%)"
            type="number"
            value={formData.cashback}
            onChange={(e) => setFormData({ ...formData, cashback: e.target.value })}
            placeholder="Enter cashback percentage"
            icon={<Percent className="w-4 h-4" />}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="flex-1">
              {selectedRecharge ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Recharge Amount"
        message={`Are you sure you want to delete ₹${selectedRecharge?.amount}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={submitting}
      />
    </div>
  );
}
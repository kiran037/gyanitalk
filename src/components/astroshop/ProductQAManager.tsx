"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Save, X, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { Input } from "@/components/adminUI/Input";
import { Modal } from "@/components/adminUI/Modal";
import { useToast } from "@/components/Toast/ToastProvider";

interface ProductDetail {
  id: string;
  question: string;
  answer: string;
  isActive: number;
}

interface ProductQAManagerProps {
  productId: string;
}

export function ProductQAManager({ productId }: ProductQAManagerProps) {
  const [details, setDetails] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<ProductDetail | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    fetchDetails();
  }, [productId]);

  const fetchDetails = async () => {
    try {
      const response = await fetch(`/api/astroshop/products/${productId}/details`);
      const data = await response.json();
      if (data.success) {
        setDetails(data.data);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch product details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      addToast("error", "Error", "Both question and answer are required");
      return;
    }

    setSubmitting(true);
    try {
      const url = `/api/astroshop/products/${productId}/details`;
      const method = editingDetail ? "PUT" : "POST";
      
      const payload = editingDetail
        ? { detailId: editingDetail.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        addToast(
          "success",
          "Success",
          `Detail ${editingDetail ? "updated" : "added"} successfully`
        );
        setIsModalOpen(false);
        resetForm();
        fetchDetails();
      }
    } catch (error) {
      addToast("error", "Error", "Failed to save detail");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (detailId: string) => {
    if (!confirm("Are you sure you want to delete this Q&A?")) return;

    try {
      const response = await fetch(
        `/api/astroshop/products/${productId}/details?detailId=${detailId}`,
        { method: "DELETE" }
      );

      const data = await response.json();
      if (data.success) {
        addToast("success", "Success", "Detail deleted");
        fetchDetails();
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete detail");
    }
  };

  const resetForm = () => {
    setFormData({ question: "", answer: "" });
    setEditingDetail(null);
  };

  const openEditModal = (detail: ProductDetail) => {
    setEditingDetail(detail);
    setFormData({
      question: detail.question,
      answer: detail.answer,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageCircleQuestion className="w-5 h-5 text-[#FF6B35]" />
          Product Q&A / FAQs
        </h3>
        <Button
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          Add Q&A
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : details.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-xl">
          <MessageCircleQuestion className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No Q&A added yet. Click "Add Q&A" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {details.map((detail, index) => (
              <motion.div
                key={detail.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">Q</span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {detail.question}
                      </h4>
                    </div>
                    <div className="flex items-start gap-2 ml-8">
                      <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {detail.answer}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(detail)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#FF6B35] hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(detail.id)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingDetail ? "Edit Q&A" : "Add New Q&A"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Question"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="Enter the question..."
            required
          />

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Answer <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Enter the answer..."
              rows={4}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              icon={<Save className="w-4 h-4" />}
              className="flex-1"
            >
              {editingDetail ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
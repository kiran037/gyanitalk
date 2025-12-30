"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Filter,
  Ticket,
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { useToast } from "@/components/Toast/ToastProvider";
import CouponCard from "@/components/coupons/CouponCard";
import CouponModal from "@/components/coupons/CouponModal";
import CouponFilters from "@/components/coupons/CouponFilters";
import DeleteConfirmModal from "@/components/coupons/DeleteConfirmModal";
import { useCoupons } from "@/hooks/useCoupons";
import type { Coupon } from "@/types/coupon";

export default function CouponsPage() {
  const addToast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    coupons,
    loading,
    filters,
    pagination,
    setFilters,
    setPage,
    refreshCoupons,
  } = useCoupons();

  const handleCreateCoupon = () => {
    setSelectedCoupon(null);
    setShowModal(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowModal(true);
  };

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;

    try {
      const res = await fetch(`/api/coupons/${couponToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        addToast("success", "Success", "Coupon deleted successfully");
        refreshCoupons();
      } else {
        addToast("error", "Error", data.error || "Failed to delete coupon");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete coupon");
    } finally {
      setShowDeleteModal(false);
      setCouponToDelete(null);
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/coupons/${coupon.id}/toggle-status`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (data.success) {
        addToast(
          "success",
          "Success",
          `Coupon ${data.data.is_active ? "activated" : "deactivated"} successfully`
        );
        refreshCoupons();
      } else {
        addToast("error", "Error", data.error || "Failed to toggle status");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to toggle status");
    }
  };

  const handleSaveCoupon = async (formData: any) => {
    try {
      const url = selectedCoupon
        ? `/api/coupons/${selectedCoupon.id}`
        : "/api/coupons";
      const method = selectedCoupon ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        addToast(
          "success",
          "Success",
          `Coupon ${selectedCoupon ? "updated" : "created"} successfully`
        );
        setShowModal(false);
        refreshCoupons();
      } else {
        addToast("error", "Error", data.error || "Failed to save coupon");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to save coupon");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="w-full mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PageHeader
            title="Coupon Management"
            subtitle="Create and manage discount coupons and gift cards"
            actions={
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleCreateCoupon}
              >
                Create Coupon
              </Button>
            }
          />
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchInput
                value={filters.search}
                onChange={(value) => setFilters({ ...filters, search: value })}
                placeholder="Search by code or description..."
              />
            </div>
            <Button
              variant="outline"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <CouponFilters filters={filters} setFilters={setFilters} />
            </motion.div>
          )}
        </motion.div>

        {/* Coupons Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 animate-pulse"
                >
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-16 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl">
              <Ticket className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Coupons Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first coupon to get started
              </p>
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleCreateCoupon}
              >
                Create Coupon
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((coupon, index) => (
                  <motion.div
                    key={coupon.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <CouponCard
                      coupon={coupon}
                      onEdit={handleEditCoupon}
                      onDelete={handleDeleteClick}
                      onToggleStatus={handleToggleStatus}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                            pagination.page === pageNum
                              ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                              : "bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <CouponModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        coupon={selectedCoupon}
        onSave={handleSaveCoupon}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        couponCode={couponToDelete?.code || ""}
      />
    </div>
  );
}
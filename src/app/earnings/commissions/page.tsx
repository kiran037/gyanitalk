// app/earnings/commissions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { CommissionModal } from "@/components/earnings/CommissionModal";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { useToast } from "@/components/Toast/ToastProvider";

interface Commission {
  id: string;
  commissionTypeId: string;
  commission: number;
  astrologerId: string | null;
  isActive: boolean;
  commissionType: {
    id: string;
    name: string;
  };
  astrologer: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const addToast = useToast();

  useEffect(() => {
    fetchCommissions();
  }, [search]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const response = await fetch(`/api/earnings/commissions?${params}`);
      const data = await response.json();

      if (data.success) {
        setCommissions(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch commissions:", error);
      addToast("error", "Error", "Failed to fetch commissions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCommission) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/earnings/commissions/${selectedCommission.id}?modifiedBy=1`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Commission deleted successfully");
        setShowDeleteModal(false);
        setSelectedCommission(null);
        fetchCommissions();
      } else {
        addToast("error", "Error", data.error || "Failed to delete commission");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete commission");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-6">
      <PageHeader
        title="Commission Management"
        subtitle="Configure commission rates for astrologers"
        badge={{ text: "FINANCIAL", variant: "purple" }}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSelectedCommission(null);
              setShowModal(true);
            }}
          >
            Add Commission
          </Button>
        }
      />

      {/* Filters */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by astrologer or commission type..."
        />
      </div>

      {/* Commissions Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))
        ) : commissions.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <TrendingUp className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Commissions Found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Start by adding a commission configuration
            </p>
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
            >
              Add Commission
            </Button>
          </div>
        ) : (
          commissions.map((commission) => (
            <motion.div
              key={commission.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.3)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {commission.commissionType.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {commission.astrologer ? commission.astrologer.name : 'All Astrologers'}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  commission.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {commission.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {commission.commission}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Commission Rate
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit className="w-4 h-4" />}
                  onClick={() => {
                    setSelectedCommission(commission);
                    setShowModal(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4 text-red-600" />}
                  onClick={() => {
                    setSelectedCommission(commission);
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

      {/* Modals */}
      {showModal && (
        <CommissionModal
          commission={selectedCommission}
          onClose={() => {
            setShowModal(false);
            setSelectedCommission(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setSelectedCommission(null);
            fetchCommissions();
          }}
        />
      )}

      <ActionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Commission"
        message="Are you sure you want to delete this commission configuration?"
        confirmText="Delete"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
}
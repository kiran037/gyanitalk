// app/admin/astro/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { ArrowLeft, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { AstrologerForm } from "@/components/astro/AstrologerForm";
import { ActionModal } from "@/components/adminUI/ActionModal";

export default function EditAstrologerPage() {
  const params = useParams();
  const router = useRouter();
  const addToast = useToast();
  const astrologerId = params.id as string;

  const [astrologer, setAstrologer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAstrologerDetails();
  }, [astrologerId]);

  const fetchAstrologerDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/astrologers/${astrologerId}`);
      const data = await response.json();

      if (data.success) {
        setAstrologer(data.data);
      } else {
        addToast("error", "Error", data.error || "Failed to fetch astrologer");
        router.push("/admin/astro");
      }
    } catch (error) {
      console.error("Error fetching astrologer:", error);
      addToast("error", "Error", "Failed to fetch astrologer details");
      router.push("/admin/astro");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/astrologers/${astrologerId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Astrologer deleted successfully");
        router.push("/admin/astro");
      } else {
        addToast("error", "Error", data.error || "Failed to delete astrologer");
      }
    } catch (error) {
      console.error("Error deleting astrologer:", error);
      addToast("error", "Error", "Failed to delete astrologer");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading astrologer details...</p>
        </div>
      </div>
    );
  }

  if (!astrologer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="w-full mx-auto relative z-10">
        {/* Header */}
        <PageHeader
          title={`Edit ${astrologer.name}`}
          subtitle="Update astrologer profile information"
          badge={{ text: "EDIT", variant: "blue" }}
          leftActions={
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push(`/admin/astro/${astrologerId}`)}
              ariaLabel="Back to astrologer details"
            />
          }
          actions={
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          }
        />

        {/* Form */}
        <div className="mt-6">
          <AstrologerForm mode="edit" initialData={astrologer} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ActionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Astrologer"
        message={`Are you sure you want to delete ${astrologer?.name}? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
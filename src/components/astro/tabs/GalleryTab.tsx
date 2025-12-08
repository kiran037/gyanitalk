"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast/ToastProvider";
import { Button } from "@/components/adminUI/Button";
import { Image as ImageIcon, Trash2, Plus } from "lucide-react";
import { avatar } from "@/lib/images";
import { motion } from "framer-motion";
import { ActionModal } from "@/components/adminUI/ActionModal";

export function GalleryTab({ astrologerId }: { astrologerId: string }) {
  const addToast = useToast();
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchGallery();
  }, [astrologerId]);

  const fetchGallery = async () => {
    try {
      const response = await fetch(`/api/astrologers/${astrologerId}/gallery`);
      const data = await response.json();
      if (data.success) setGallery(data.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/astrologers/${astrologerId}/gallery/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        addToast("success", "Success", "Gallery item deleted");
        fetchGallery();
      } else {
        addToast("error", "Error", "Failed to delete");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete");
    }
  };

  return (
    <>
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gallery ({gallery.length})</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : gallery.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Gallery Items</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((item, index) => (
              <motion.div
                key={item.id}
                className="group relative aspect-square bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <img
                  src={avatar(item.image)}
                  alt="Gallery"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => setDeleteId(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ActionModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) handleDelete(deleteId);
          setDeleteId(null);
        }}
        title="Delete Gallery Item"
        message="Are you sure you want to delete this image?"
        type="danger"
      />
    </>
  );
}
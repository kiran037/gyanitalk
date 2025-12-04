// components/blogs/BlogImageGallery.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/adminUI/Button";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/upload";
import { avatar } from "@/lib/images";

interface BlogImage {
  id: string;
  imagePath: string;
  created_at: string;
}

interface BlogImageGalleryProps {
  blogId: string;
}

export function BlogImageGallery({ blogId }: BlogImageGalleryProps) {
  const addToast = useToast();
  const [images, setImages] = useState<BlogImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; imageId: string | null }>({
    isOpen: false,
    imageId: null,
  });

  useEffect(() => {
    fetchImages();
  }, [blogId]);

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/blogs/${blogId}/images`);
      const data = await response.json();
      if (data.success) {
        setImages(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadImage(file, "blogs/gallery");
      if (result.success) {
        const response = await fetch(`/api/blogs/${blogId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imagePath: result.path }),
        });

        const data = await response.json();
        if (data.success) {
          addToast("success", "Success", "Image uploaded successfully");
          fetchImages();
        } else {
          addToast("error", "Error", data.error || "Failed to upload image");
        }
      }
    } catch (error) {
      addToast("error", "Error", "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}/images?imageId=${imageId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        addToast("success", "Success", "Image deleted successfully");
        fetchImages();
        setDeleteModal({ isOpen: false, imageId: null });
      } else {
        addToast("error", "Error", data.error || "Failed to delete image");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete image");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#FF6B35]" />
          Image Gallery
        </h3>
        <label>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button
            variant="primary"
            size="sm"
            icon={<Upload className="w-4 h-4" />}
            loading={uploading}
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"][accept="image/*"]')?.click()}
          >
            Upload Image
          </Button>
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No images in gallery
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <img
                src={avatar(image.imagePath)}
                alt="Gallery"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setDeleteModal({ isOpen: true, imageId: image.id })}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ActionModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, imageId: null })}
        onConfirm={() => deleteModal.imageId && handleDelete(deleteModal.imageId)}
        title="Delete Image"
        message="Are you sure you want to delete this image from the gallery?"
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
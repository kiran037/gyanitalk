// components/blogs/BlogImageGallery.tsx
"use client";

import { useState, useEffect, useRef } from "react";
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
  onInsert: (url: string) => void;
}

export function BlogImageGallery({ blogId, onInsert }: BlogImageGalleryProps) {
  const addToast = useToast();
  const [images, setImages] = useState<BlogImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    imageId: string | null;
  }>({
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

          // 🔥 auto insert into editor
          onInsert(avatar(result.path));

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
      const response = await fetch(
        `/api/blogs/${blogId}/images?imageId=${imageId}`,
        {
          method: "DELETE",
        },
      );

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
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <ImageIcon className="h-5 w-5 text-[#FF6B35]" />
          Image Gallery
        </h3>
        <label>
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={<Upload className="h-4 w-4" />}
            loading={uploading}
            onClick={() => uploadInputRef.current?.click()}
          >
            Upload Image
          </Button>
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center dark:border-gray-600">
          <ImageIcon className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No images in gallery
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <img
                src={avatar(image.imagePath)}
                alt="Gallery"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onInsert(avatar(image.imagePath))}
                >
                  Insert
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() =>
                    setDeleteModal({ isOpen: true, imageId: image.id })
                  }
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
        onConfirm={() =>
          deleteModal.imageId && handleDelete(deleteModal.imageId)
        }
        title="Delete Image"
        message="Are you sure you want to delete this image from the gallery?"
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}

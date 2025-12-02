// components/courses/CategoryModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { FolderOpen, Upload } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";
import { uploadImage } from "@/upload";
import { avatar } from "@/lib/images";

interface Category {
  id: number;
  name: string;
  image: string | null;
}

interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryModal({
  category,
  onClose,
  onSuccess,
}: CategoryModalProps) {
  const addToast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        image: category.image || "",
      });
    }
  }, [category]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("error", "Invalid File", "Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage(file, "categories");
      
      if (result.success) {
        setFormData((prev) => ({ ...prev, image: result.path }));
        addToast("success", "Success", "Image uploaded successfully");
      } else {
        addToast("error", "Upload Failed", "Failed to upload image");
      }
    } catch (error) {
      addToast("error", "Upload Error", "Error uploading image");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast("error", "Validation Error", "Category name is required");
      return;
    }

    setLoading(true);

    try {
      const url = category
        ? `/api/courses/categories/${category.id}`
        : "/api/courses/categories";

      const method = category ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        addToast(
          "success",
          "Success",
          category
            ? "Category updated successfully"
            : "Category created successfully"
        );
        onSuccess();
      } else {
        addToast("error", "Error", data.error || "Something went wrong");
      }
    } catch (error) {
      addToast("error", "Error", "Error saving category");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={category ? "Edit Category" : "Create Category"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Category Name"
          name="name"
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          placeholder="Enter category name"
          required
          icon={<FolderOpen className="w-4 h-4" />}
        />

        {/* Image Upload */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category Image
          </label>
          <div className="space-y-3">
            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Upload className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {uploading ? "Uploading..." : "Click to upload image"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {formData.image && (
              <div className="relative flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <img
                  src={avatar(formData.image)}
                  alt="Preview"
                  className="max-h-32 rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="flex-1"
          >
            {category ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { Calendar, Link as LinkIcon, Image as ImageIcon, FileText } from "lucide-react";
import { uploadImage } from "@/upload";
import { avatar } from "@/lib/images";

interface News {
  id: string;
  newsDate: string;
  channel: string;
  link: string;
  bannerImage: string;
  description: string;
  isActive: boolean;
}

interface NewsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingNews: News | null;
}

export default function NewsFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingNews,
}: NewsFormModalProps) {
  const [formData, setFormData] = useState({
    newsDate: "",
    channel: "",
    link: "",
    bannerImage: "",
    description: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const addToast = useToast();

  useEffect(() => {
    if (editingNews) {
      setFormData({
        newsDate: editingNews.newsDate.split("T")[0],
        channel: editingNews.channel,
        link: editingNews.link,
        bannerImage: editingNews.bannerImage,
        description: editingNews.description,
        isActive: editingNews.isActive,
      });
      setImagePreview(editingNews.bannerImage);
    } else {
      resetForm();
    }
  }, [editingNews, isOpen]);

  const resetForm = () => {
    setFormData({
      newsDate: "",
      channel: "",
      link: "",
      bannerImage: "",
      description: "",
      isActive: true,
    });
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let bannerImagePath = formData.bannerImage;

      // Upload new image if selected
      if (imageFile) {
        setUploading(true);
        const uploadResult = await uploadImage(imageFile, "news");
        if (uploadResult.success) {
          bannerImagePath = uploadResult.path;
        } else {
          throw new Error("Failed to upload image");
        }
        setUploading(false);
      }

      const payload = {
        ...formData,
        bannerImage: bannerImagePath,
        createdBy: 1, // Replace with actual user ID
        modifiedBy: 1,
      };

      const url = editingNews
        ? `/api/extras/news/${editingNews.id}`
        : "/api/extras/news";

      const res = await fetch(url, {
        method: editingNews ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        addToast(
          "success",
          "Success",
          editingNews ? "News updated successfully" : "News created successfully"
        );
        onSuccess();
      } else {
        addToast("error", "Error", data.error || "Failed to save news");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to save news");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingNews ? "Edit News" : "Add New News"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Banner Image <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            {imagePreview && (
              <img
                src={avatar(imagePreview)}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer focus:outline-none"
                required={!editingNews}
              />
              <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>

        {/* Channel */}
        <Input
          label="Channel Name"
          name="channel"
          value={formData.channel}
          onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
          placeholder="CNN, BBC, etc."
          required
          icon={<FileText className="w-4 h-4" />}
        />

        {/* News Date */}
        <Input
          label="News Date"
          name="newsDate"
          type="date"
          value={formData.newsDate}
          onChange={(e) => setFormData({ ...formData, newsDate: e.target.value })}
          required
          icon={<Calendar className="w-4 h-4" />}
        />

        {/* Link */}
        <Input
          label="News Link"
          name="link"
          type="url"
          value={formData.link}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          placeholder="https://example.com/news"
          required
          icon={<LinkIcon className="w-4 h-4" />}
        />

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the news..."
            required
            rows={4}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-[#FF6B35] bg-gray-100 border-gray-300 rounded focus:ring-[#FF6B35]"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={loading || uploading}
          >
            {uploading ? "Uploading..." : editingNews ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
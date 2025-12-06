"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { Link as LinkIcon, FileText, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/upload";
import { avatar } from "@/lib/images";

interface Video {
  id: string;
  youtubeLink: string;
  coverImage: string;
  videoTitle: string;
  isActive: boolean;
}

interface VideoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingVideo: Video | null;
}

export default function VideoFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingVideo,
}: VideoFormModalProps) {
  const [formData, setFormData] = useState({
    youtubeLink: "",
    coverImage: "",
    videoTitle: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const addToast = useToast();

  useEffect(() => {
    if (editingVideo) {
      setFormData({
        youtubeLink: editingVideo.youtubeLink,
        coverImage: editingVideo.coverImage,
        videoTitle: editingVideo.videoTitle,
        isActive: editingVideo.isActive,
      });
      setImagePreview(editingVideo.coverImage);
    } else {
      resetForm();
    }
  }, [editingVideo, isOpen]);

  const resetForm = () => {
    setFormData({
      youtubeLink: "",
      coverImage: "",
      videoTitle: "",
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
      let coverImagePath = formData.coverImage;

      if (imageFile) {
        setUploading(true);
        const uploadResult = await uploadImage(imageFile, "videos");
        if (uploadResult.success) {
          coverImagePath = uploadResult.path;
        } else {
          throw new Error("Failed to upload image");
        }
        setUploading(false);
      }

      const payload = {
        ...formData,
        coverImage: coverImagePath,
        createdBy: 1,
        modifiedBy: 1,
      };

      const url = editingVideo
        ? `/api/extras/videos/${editingVideo.id}`
        : "/api/extras/videos";

      const res = await fetch(url, {
        method: editingVideo ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        addToast(
          "success",
          "Success",
          editingVideo ? "Video updated successfully" : "Video created successfully"
        );
        onSuccess();
      } else {
        addToast("error", "Error", data.error || "Failed to save video");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to save video");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingVideo ? "Edit Video" : "Add New Video"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cover Image */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cover Image <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            {imagePreview && (
              <img
                src={avatar(imagePreview)}
                alt="Preview"
                className="w-32 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer focus:outline-none"
                required={!editingVideo}
              />
              <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>

        {/* Video Title */}
        <Input
          label="Video Title"
          name="videoTitle"
          value={formData.videoTitle}
          onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
          placeholder="Amazing Advertisement Video"
          required
          icon={<FileText className="w-4 h-4" />}
        />

        {/* YouTube Link */}
        <Input
          label="YouTube Link"
          name="youtubeLink"
          type="url"
          value={formData.youtubeLink}
          onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
          required
          icon={<LinkIcon className="w-4 h-4" />}
        />

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
            {uploading ? "Uploading..." : editingVideo ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
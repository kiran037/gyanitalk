// components/courses/ChapterModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { RichTextEditor } from "@/components/courses/RichTextEditor";
import {
  BookOpen,
  FileText,
  Image as ImageIcon,
  PlayCircle,
  Lock,
  Unlock,
  Upload,
} from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";
import { uploadImage } from "@/upload";
import { avatar } from "@/lib/images";

interface Chapter {
  id: number;
  title: string;
  description: string | null;
  is_paid: number;
  pdf_type: string | null;
  pdf: string | null;
  image_type: string | null;
  image: string | null;
  video_type: string | null;
  video: string | null;
  video_format: string | null;
}

interface ChapterModalProps {
  courseId: number;
  chapter: Chapter | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChapterModal({
  courseId,
  chapter,
  onClose,
  onSuccess,
}: ChapterModalProps) {
  const addToast = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    is_paid: 0,
    pdf_type: "url",
    pdf: "",
    image_type: "url",
    image: "",
    video_type: "url",
    video: "",
    video_format: "mp4",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (chapter) {
      setFormData({
        title: chapter.title || "",
        description: chapter.description || "",
        is_paid: chapter.is_paid || 0,
        pdf_type: chapter.pdf_type || "url",
        pdf: chapter.pdf || "",
        image_type: chapter.image_type || "url",
        image: chapter.image || "",
        video_type: chapter.video_type || "url",
        video: chapter.video || "",
        video_format: chapter.video_format || "mp4",
      });
    }
  }, [chapter]);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      addToast("error", "Invalid File", "Please select a video file");
      return;
    }

    setUploadingVideo(true);
    try {
      const result = await uploadImage(file, "chapters/videos");
      
      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          video: result.path,
          video_type: "file",
        }));
        addToast("success", "Success", "Video uploaded successfully");
      } else {
        addToast("error", "Upload Failed", "Failed to upload video");
      }
    } catch (error) {
      addToast("error", "Upload Error", "Error uploading video");
      console.error(error);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      addToast("error", "Invalid File", "Please select a PDF file");
      return;
    }

    setUploadingPDF(true);
    try {
      const result = await uploadImage(file, "chapters/pdfs");
      
      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          pdf: result.path,
          pdf_type: "file",
        }));
        addToast("success", "Success", "PDF uploaded successfully");
      } else {
        addToast("error", "Upload Failed", "Failed to upload PDF");
      }
    } catch (error) {
      addToast("error", "Upload Error", "Error uploading PDF");
      console.error(error);
    } finally {
      setUploadingPDF(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("error", "Invalid File", "Please select an image file");
      return;
    }

    setUploadingImage(true);
    try {
      const result = await uploadImage(file, "chapters/images");
      
      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          image: result.path,
          image_type: "file",
        }));
        addToast("success", "Success", "Image uploaded successfully");
      } else {
        addToast("error", "Upload Failed", "Failed to upload image");
      }
    } catch (error) {
      addToast("error", "Upload Error", "Error uploading image");
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      addToast("error", "Validation Error", "Chapter title is required");
      return;
    }

    setLoading(true);

    try {
      const url = chapter
        ? `/api/courses/${courseId}/chapters/${chapter.id}`
        : `/api/courses/${courseId}/chapters`;

      const method = chapter ? "PUT" : "POST";

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
          chapter
            ? "Chapter updated successfully"
            : "Chapter created successfully"
        );
        onSuccess();
      } else {
        addToast("error", "Error", data.error || "Something went wrong");
      }
    } catch (error) {
      addToast("error", "Error", "Error saving chapter");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={chapter ? "Edit Chapter" : "Add Chapter"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Chapter Title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter chapter title"
          required
          icon={<BookOpen className="w-4 h-4" />}
        />

        <RichTextEditor
          label="Description"
          value={formData.description}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, description: value }))
          }
          placeholder="Enter chapter description..."
        />

        {/* Access Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Access Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="is_paid"
                value="0"
                checked={formData.is_paid === 0}
                onChange={() => setFormData((prev) => ({ ...prev, is_paid: 0 }))}
                className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35]"
              />
              <Unlock className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Free Preview
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="is_paid"
                value="1"
                checked={formData.is_paid === 1}
                onChange={() => setFormData((prev) => ({ ...prev, is_paid: 1 }))}
                className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35]"
              />
              <Lock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Premium Content
              </span>
            </label>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Video */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-red-500" />
              Video Content
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video Type
              </label>
              <select
                name="video_type"
                value={formData.video_type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              >
                <option value="url">URL</option>
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="file">Upload File</option>
              </select>
            </div>

            {formData.video_type === "file" ? (
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Upload className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {uploadingVideo ? "Uploading..." : "Upload Video"}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={uploadingVideo}
                  className="hidden"
                />
              </label>
            ) : (
              <Input
                label="Video URL"
                name="video"
                type="url"
                value={formData.video}
                onChange={handleChange}
                placeholder="https://example.com/video.mp4"
              />
            )}

            {formData.video && formData.video_type === "file" && (
              <div className="text-xs text-green-600 dark:text-green-400">
                ✓ Video uploaded
              </div>
            )}
          </div>

          {/* PDF */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              PDF Content
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                PDF Type
              </label>
              <select
                name="pdf_type"
                value={formData.pdf_type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              >
                <option value="url">URL</option>
                <option value="file">Upload File</option>
              </select>
            </div>

            {formData.pdf_type === "file" ? (
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Upload className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {uploadingPDF ? "Uploading..." : "Upload PDF"}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePDFUpload}
                  disabled={uploadingPDF}
                  className="hidden"
                />
              </label>
            ) : (
              <Input
                label="PDF URL"
                name="pdf"
                type="url"
                value={formData.pdf}
                onChange={handleChange}
                placeholder="https://example.com/file.pdf"
              />
            )}

            {formData.pdf && formData.pdf_type === "file" && (
              <div className="text-xs text-green-600 dark:text-green-400">
                ✓ PDF uploaded
              </div>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-purple-500" />
            Image Content
          </h3>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image Type
            </label>
            <select
              name="image_type"
              value={formData.image_type}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
            >
              <option value="url">URL</option>
              <option value="file">Upload File</option>
            </select>
          </div>

          {formData.image_type === "file" ? (
            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Upload className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {uploadingImage ? "Uploading..." : "Upload Image"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          ) : (
            <Input
              label="Image URL"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          )}

          {formData.image && (
            <div className="flex items-center justify-center">
              <img
                src={avatar(formData.image)}
                alt="Preview"
                className="max-h-32 rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
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
            {chapter ? "Update Chapter" : "Add Chapter"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
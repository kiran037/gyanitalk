// app/courses/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Save,
  X,
  BookOpen,
  Tag,
  DollarSign,
  Upload,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { Input } from "@/components/adminUI/Input";
import { RichTextEditor } from "@/components/courses/RichTextEditor";
import { useToast } from "@/components/Toast/ToastProvider";
import { uploadImage } from "@/upload";
import { avatar } from "@/lib/images";

interface Category {
  id: number;
  name: string;
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  const addToast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category_id: "",
    description: "",
    image: "",
    price: "",
    offer_price: "",
    is_paid: 0,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    schemaJson: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchCourse();
  }, [courseId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/courses/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCourse = async () => {
    setFetching(true);
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      const data = await response.json();

      if (data.success) {
        const course = data.data;
        setFormData({
          name: course.name || "",
          slug: course.slug || "",
          category_id: course.category?.id?.toString() || "",
          description: course.description || "",
          image: course.image || "",
          price: course.price?.toString() || "",
          offer_price: course.offer_price?.toString() || "",
          is_paid: course.is_paid || 0,
          metaTitle: course.metaTitle || "",
          metaDescription: course.metaDescription || "",
          metaKeywords: course.metaKeywords || "",
          canonicalUrl: course.canonicalUrl || "",
          ogTitle: course.ogTitle || "",
          ogDescription: course.ogDescription || "",
          ogImage: course.ogImage || "",
          twitterTitle: course.twitterTitle || "",
          twitterDescription: course.twitterDescription || "",
          twitterImage: course.twitterImage || "",
          schemaJson: course.schemaJson || "",
        });
      } else {
        addToast("error", "Error", "Failed to fetch course");
        router.push("/courses");
      }
    } catch (error) {
      addToast("error", "Error", "Error fetching course");
      console.error(error);
      router.push("/courses");
    } finally {
      setFetching(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("error", "Invalid File", "Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage(file, "courses");
      
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast("error", "Validation Error", "Course name is required");
      return;
    }

    if (!formData.category_id) {
      addToast("error", "Validation Error", "Please select a category");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Course updated successfully");
        router.push(`/courses/${courseId}`);
      } else {
        addToast("error", "Error", data.error || "Something went wrong");
      }
    } catch (error) {
      addToast("error", "Error", "Error updating course");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="Edit Course"
          subtitle="Update course details"
          badge={{ text: "Editing", variant: "purple" }}
          actions={
            <Button
              variant="outline"
              icon={<X className="w-4 h-4" />}
              onClick={() => router.push(`/courses/${courseId}`)}
            >
              Cancel
            </Button>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#FF6B35]" />
              Basic Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Course Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter course name"
                required
                icon={<BookOpen className="w-4 h-4" />}
              />

              <Input
                label="Slug"
                name="slug"
                type="text"
                value={formData.slug}
                onChange={handleChange}
                placeholder="course-slug"
                required
                icon={<Tag className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <RichTextEditor
              label="Description"
              value={formData.description}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, description: value }))
              }
              placeholder="Enter course description..."
            />

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Image
              </label>
              <div className="space-y-3">
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {uploading ? "Uploading..." : "Click to upload new image"}
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
                      className="max-h-48 rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, image: "" }))
                      }
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#FF6B35]" />
              Pricing
            </h2>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="is_paid"
                    value="0"
                    checked={formData.is_paid === 0}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        is_paid: 0,
                        price: "",
                        offer_price: "",
                      }))
                    }
                    className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Free Course
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="is_paid"
                    value="1"
                    checked={formData.is_paid === 1}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, is_paid: 1 }))
                    }
                    className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Paid Course
                  </span>
                </label>
              </div>
            </div>

            {formData.is_paid === 1 && (
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Regular Price (₹)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="999"
                  min="0"
                  step="1"
                  icon={<DollarSign className="w-4 h-4" />}
                />

                <Input
                  label="Offer Price (₹)"
                  name="offer_price"
                  type="number"
                  value={formData.offer_price}
                  onChange={handleChange}
                  placeholder="799"
                  min="0"
                  step="1"
                  icon={<DollarSign className="w-4 h-4" />}
                />
              </div>
            )}
          </div>

          {/* SEO Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowSEO(!showSEO)}
              className="w-full p-6 flex items-center justify-between text-left"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#FF6B35]" />
                SEO Settings (Optional)
              </h2>
              {showSEO ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showSEO && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <Input
                  label="Meta Title"
                  name="metaTitle"
                  type="text"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  placeholder="Course Meta Title"
                />

                <Input
                  label="Meta Description"
                  name="metaDescription"
                  type="text"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  placeholder="Brief description for search engines"
                />

                <Input
                  label="Meta Keywords"
                  name="metaKeywords"
                  type="text"
                  value={formData.metaKeywords}
                  onChange={handleChange}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/courses/${courseId}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<Save className="w-4 h-4" />}
              loading={loading}
            >
              Update Course
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
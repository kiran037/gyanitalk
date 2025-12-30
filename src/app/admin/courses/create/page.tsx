// app/courses/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces → hyphen
    .replace(/-+/g, "-"); // clean multiple hyphens

export default function CreateCoursePage() {
  const router = useRouter();
  const addToast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
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
  }, []);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateSlug = () => {
    if (!formData.name.trim()) {
      addToast("warning", "Warning", "Please enter course name first");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      slug: slugify(prev.name),
    }));
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
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Course created successfully");
        router.push(`/admin/courses/${data.data.id}`);
      } else {
        addToast("error", "Error", data.error || "Something went wrong");
      }
    } catch (error) {
      addToast("error", "Error", "Error saving course");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 p-4 dark:from-gray-900 dark:to-gray-800 sm:p-6 lg:p-8">
      <div className="mx-auto w-full space-y-6">
        <PageHeader
          title="Create Course"
          subtitle="Add a new course"
          badge={{ text: "Creating", variant: "purple" }}
          actions={
            <Button
              variant="outline"
              icon={<X className="h-4 w-4" />}
              onClick={() => router.push("/admin/courses")}
            >
              Cancel
            </Button>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <BookOpen className="h-5 w-5 text-[#FF6B35]" />
              Basic Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Course Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter course name"
                required
                icon={<BookOpen className="h-4 w-4" />}
              />

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Slug <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      name="slug"
                      type="text"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="course-slug"
                      required
                      icon={<Tag className="h-4 w-4" />}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSlug}
                    className="shrink-0"
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
              <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Cover Image
              </label>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                  <Upload className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {uploading ? "Uploading..." : "Click to upload cover image"}
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
                  <div className="relative flex items-center justify-center rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
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
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <DollarSign className="h-5 w-5 text-[#FF6B35]" />
              Pricing
            </h2>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Course Type
              </label>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
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
                    className="h-4 w-4 text-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Free Course
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="is_paid"
                    value="1"
                    checked={formData.is_paid === 1}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, is_paid: 1 }))
                    }
                    className="h-4 w-4 text-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Paid Course
                  </span>
                </label>
              </div>
            </div>

            {formData.is_paid === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Regular Price (₹)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="999"
                  min="0"
                  step="1"
                  icon={<DollarSign className="h-4 w-4" />}
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
                  icon={<DollarSign className="h-4 w-4" />}
                />
              </div>
            )}
          </div>

          {/* SEO Section */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setShowSEO(!showSEO)}
              className="flex w-full items-center justify-between p-6 text-left"
            >
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                <Globe className="h-5 w-5 text-[#FF6B35]" />
                SEO Settings (Optional)
              </h2>
              {showSEO ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {showSEO && (
              <div className="space-y-4 border-t border-gray-200 px-6 pb-6 pt-4 dark:border-gray-700">
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
              onClick={() => router.push("/admin/courses")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<Save className="h-4 w-4" />}
              loading={loading}
            >
              Create Course
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// app/blogs/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { Input } from "@/components/adminUI/Input";
import { useToast } from "@/components/Toast/ToastProvider";
import { RichTextEditor } from "@/components/courses/RichTextEditor";
import { BlogImageGallery } from "@/components/blogs/BlogImageGallery";
import { BlogSEOSection } from "@/components/blogs/BlogSEOSection";
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  Upload,
  Calendar,
  User,
  Image as ImageIcon,
  Tag,
  Globe
} from "lucide-react";
import { uploadImage } from "@/upload";
import { avatar } from "@/lib/images";

interface Category {
  id: string;
  name: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const addToast = useToast();
  const blogId = params.id as string;
  const isNewBlog = blogId === "new";

  const [loading, setLoading] = useState(!isNewBlog);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    blogImage: "",
    previewImage: "",
    description: "",
    author: "",
    postedOn: new Date().toISOString().split("T")[0],
    blogCategoryId: "",
    extension: "",
    isActive: true,
    
    // SEO fields
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

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (!isNewBlog) {
      fetchBlog();
    }
  }, [blogId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/blogs/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`);
      const data = await response.json();

      if (data.success) {
        const blog = data.data;
        setFormData({
          title: blog.title || "",
          slug: blog.slug || "",
          blogImage: blog.blogImage || "",
          previewImage: blog.previewImage || "",
          description: blog.description || "",
          author: blog.author || "",
          postedOn: blog.postedOn ? new Date(blog.postedOn).toISOString().split("T")[0] : "",
          blogCategoryId: blog.blogCategoryId || "",
          extension: blog.extension || "",
          isActive: blog.isActive,
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          metaKeywords: blog.metaKeywords || "",
          canonicalUrl: blog.canonicalUrl || "",
          ogTitle: blog.ogTitle || "",
          ogDescription: blog.ogDescription || "",
          ogImage: blog.ogImage || "",
          twitterTitle: blog.twitterTitle || "",
          twitterDescription: blog.twitterDescription || "",
          twitterImage: blog.twitterImage || "",
          schemaJson: blog.schemaJson || "",
        });
      } else {
        addToast("error", "Error", "Blog not found");
        router.push("/blogs");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch blog");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug from title
    if (field === "title" && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "blogImage" | "previewImage"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading = field === "blogImage" ? setUploadingImage : setUploadingPreview;
    setUploading(true);

    try {
      const result = await uploadImage(file, "blogs");
      if (result.success) {
        handleInputChange(field, result.path);
        addToast("success", "Success", "Image uploaded successfully");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.author || !formData.blogImage) {
      addToast("warning", "Warning", "Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const url = isNewBlog ? "/api/blogs" : `/api/blogs/${blogId}`;
      const method = isNewBlog ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", `Blog ${isNewBlog ? "created" : "updated"} successfully`);
        if (isNewBlog) {
          router.push(`/blogs/${data.data.id}`);
        } else {
          fetchBlog();
        }
      } else {
        addToast("error", "Error", data.error || "Failed to save blog");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="w-full mx-auto">
        {/* Header */}
        <PageHeader
          title={isNewBlog ? "Create New Blog" : "Edit Blog"}
          subtitle={isNewBlog ? "Create and publish a new blog post" : `Editing: ${formData.title}`}
          badge={{ text: isNewBlog ? "New" : "Edit", variant: "blue" }}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => router.push("/blogs")}
              >
                Back
              </Button>
              {!isNewBlog && (
                <Button
                  variant="outline"
                  icon={<Eye className="w-4 h-4" />}
                  onClick={() => window.open(`/landing/blog/${formData.slug || blogId}`, "_blank")}
                >
                  Preview
                </Button>
              )}
              <Button
                variant="primary"
                icon={<Save className="w-4 h-4" />}
                onClick={handleSave}
                loading={saving}
              >
                {isNewBlog ? "Create Blog" : "Save Changes"}
              </Button>
            </div>
          }
        />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#FF6B35]" />
                Basic Information
              </h3>

              <div className="space-y-4">
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter blog title"
                  required
                />

                <Input
                  label="Slug (URL)"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="blog-url-slug"
                />

                <Input
                  label="Author"
                  value={formData.author}
                  onChange={(e) => handleInputChange("author", e.target.value)}
                  placeholder="Enter author name"
                  required
                  icon={<User className="w-4 h-4" />}
                />

                <Input
                  label="Posted Date"
                  type="date"
                  value={formData.postedOn}
                  onChange={(e) => handleInputChange("postedOn", e.target.value)}
                  icon={<Calendar className="w-4 h-4" />}
                />

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.blogCategoryId}
                    onChange={(e) => handleInputChange("blogCategoryId", e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Content
              </h3>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => handleInputChange("description", value)}
                placeholder="Write your blog content here..."
              />
            </div>

            {/* SEO Section */}
            <BlogSEOSection
              formData={formData}
              onFieldChange={handleInputChange}
            />

            {/* Image Gallery */}
            {!isNewBlog && (
              <BlogImageGallery blogId={blogId} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Status
              </h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange("isActive", e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35]"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Active (Published)
                </span>
              </label>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Inactive blogs won't be visible to users
              </p>
            </div>

            {/* Featured Image */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#FF6B35]" />
                Featured Image
              </h3>

              {formData.blogImage ? (
                <div className="space-y-3">
                  <img
                    src={avatar(formData.blogImage)}
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "blogImage")}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      icon={uploadingImage ? undefined : <Upload className="w-4 h-4" />}
                      loading={uploadingImage}
                      onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                      className="w-full"
                    >
                      Change Image
                    </Button>
                  </label>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "blogImage")}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-[#FF6B35] transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Preview Image */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Preview Image (Optional)
              </h3>

              {formData.previewImage ? (
                <div className="space-y-3">
                  <img
                    src={avatar(formData.previewImage)}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Upload className="w-4 h-4" />}
                    loading={uploadingPreview}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => handleImageUpload(e as any, "previewImage");
                      input.click();
                    }}
                    className="w-full"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Upload className="w-4 h-4" />}
                  loading={uploadingPreview}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => handleImageUpload(e as any, "previewImage");
                    input.click();
                  }}
                  className="w-full"
                >
                  Upload Preview
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
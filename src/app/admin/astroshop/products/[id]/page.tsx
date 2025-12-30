"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Image as ImageIcon, X, Plus } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { Input } from "@/components/adminUI/Input";
import { useToast } from "@/components/Toast/ToastProvider";
import { avatar } from "@/lib/images";
import { uploadImage } from "@/upload";
import { RichTextEditor } from "@/components/courses/RichTextEditor";

interface Category {
  id: string;
  name: string;
}

export default function ProductForm() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const isEdit = productId && productId !== "create";

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productDetails, setProductDetails] = useState<
    Array<{
      id?: string;
      question: string;
      answer: string;
    }>
  >([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "seo">(
    "basic",
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    features: "",
    productCategoryId: "",
    amount: "",
    is_feature: false,
    bestseller: false,
    isActive: true,
    // SEO Fields
    slug: "",
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

  const addToast = useToast();

  const BackButton = () => (
    <button
      onClick={() => router.back()}
      className="rounded-md p-2 transition hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
    </button>
  );

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [isEdit]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/astroshop/categories?limit=100");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch categories");
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/astroshop/products/${productId}`);
      const data = await response.json();

      if (data.success) {
        const product = data.data;
        setFormData({
          name: product.name,
          description: product.description || "",
          features: product.features || "",
          productCategoryId: product.productCategoryId.toString(),
          amount: product.amount.toString(),
          is_feature: product.is_feature,
          bestseller: product.bestseller,
          isActive: product.isActive,
          slug: product.slug || "",
          metaTitle: product.metaTitle || "",
          metaDescription: product.metaDescription || "",
          metaKeywords: product.metaKeywords || "",
          canonicalUrl: product.canonicalUrl || "",
          ogTitle: product.ogTitle || "",
          ogDescription: product.ogDescription || "",
          ogImage: product.ogImage || "",
          twitterTitle: product.twitterTitle || "",
          twitterDescription: product.twitterDescription || "",
          twitterImage: product.twitterImage || "",
          schemaJson: product.schemaJson || "",
        });
        setMainImagePreview(product.productImage);
        if (product.product_details && product.product_details.length > 0) {
          setProductDetails(
            product.product_details.map((detail: any) => ({
              id: detail.id.toString(),
              question: detail.question,
              answer: detail.answer,
            })),
          );
        }

        if (product.gallery && Array.isArray(product.gallery)) {
          setGalleryPreviews(product.gallery.map((img: string) => avatar(img)));
        }
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  const addProductDetail = () => {
    setProductDetails([...productDetails, { question: "", answer: "" }]);
  };

  const updateProductDetail = (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => {
    const updated = [...productDetails];
    updated[index][field] = value;
    setProductDetails(updated);
  };

  const removeProductDetail = (index: number) => {
    setProductDetails(productDetails.filter((_, i) => i !== index));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles((prev) => [...prev, ...files]);
    setGalleryPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.productCategoryId || !formData.amount) {
      addToast("error", "Error", "Please fill all required fields");
      return;
    }

    if (!isEdit && !mainImage) {
      addToast("error", "Error", "Product image is required");
      return;
    }

    setSubmitting(true);
    try {
      let productImagePath = mainImagePreview;
      let galleryPaths = galleryPreviews;

      // Upload main image
      if (mainImage) {
        const uploaded = await uploadImage(mainImage, "products");
        productImagePath = uploaded.path;
      }

      // Upload gallery images
      if (galleryFiles.length > 0) {
        const uploadedGallery = await Promise.all(
          galleryFiles.map((file) => uploadImage(file, "products/gallery")),
        );
        const newGalleryPaths = uploadedGallery.map((u) => u.path);
        galleryPaths = [
          ...galleryPreviews.filter((p) => !p.startsWith("blob:")),
          ...newGalleryPaths,
        ];
      }

      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        productCategoryId: parseInt(formData.productCategoryId),
        productImage: productImagePath,
        gallery: JSON.stringify(galleryPaths),
        slug: formData.slug || generateSlug(formData.name),
        createdBy: 1,
        modifiedBy: 1,
      };

      const url = isEdit
        ? `/api/astroshop/products/${productId}`
        : "/api/astroshop/products";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      // After the main product save is successful:
      if (data.success && productDetails.length > 0) {
        // Save product details
        await fetch(`/api/astroshop/products/${data.data.id}/details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ details: productDetails }),
        });
      }

      if (data.success) {
        addToast(
          "success",
          "Success",
          `Product ${isEdit ? "updated" : "created"} successfully`,
        );
        router.push("/astroshop/products");
      } else {
        addToast("error", "Error", data.error || "Failed to save product");
      }
    } catch (error) {
      addToast("error", "Error", "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 rounded-full border-4 border-[#FF6B35] border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PageHeader
            title={isEdit ? "Edit Product" : "Create Product"}
            subtitle={
              isEdit
                ? "Update product details"
                : "Add a new product to your catalog"
            }
            leftActions={<BackButton />}
            actions={
              <div className="flex gap-2">
                <Button
                  icon={<Save className="h-4 w-4" />}
                  onClick={handleSubmit}
                  loading={submitting}
                >
                  {isEdit ? "Update" : "Create"}
                </Button>
              </div>
            }
          />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: "basic", label: "Basic Info" },
              { id: "details", label: "Details & Features" },
              { id: "seo", label: "SEO Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-[#FF6B35]"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347]"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Input
                    label="Product Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter product name"
                    required
                  />

                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.productCategoryId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          productCategoryId: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 dark:border-gray-700 dark:bg-gray-800"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Price (₹)"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="Enter price"
                  required
                  min="0"
                  step="0.01"
                />

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Short Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of the product..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Product Image <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    {mainImagePreview && (
                      <img
                        src={mainImagePreview}
                        alt="Preview"
                        className="h-32 w-32 rounded-lg object-cover"
                      />
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-[#FF6B35] dark:border-gray-600">
                        <ImageIcon className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload main image
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Gallery Images
                  </label>
                  <div className="grid grid-cols-4 gap-4">
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Gallery ${index + 1}`}
                          className="h-24 w-full rounded-lg object-cover"
                        />
                        <button
                          onClick={() => removeGalleryImage(index)}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <label className="cursor-pointer">
                      <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-[#FF6B35] dark:border-gray-600">
                        <Plus className="h-8 w-8 text-gray-400" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_feature}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_feature: e.target.checked,
                        })
                      }
                      className="h-5 w-5 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Featured Product
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.bestseller}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bestseller: e.target.checked,
                        })
                      }
                      className="h-5 w-5 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bestseller
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="h-5 w-5 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="space-y-6">
                <div>
                  <RichTextEditor
                    value={formData.features}
                    onChange={(value) =>
                      setFormData({ ...formData, features: value })
                    }
                    label="Features & Benefits"
                  />
                </div>

                {/* Product Q&A Section */}
                <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Product Questions & Answers
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Plus className="h-4 w-4" />}
                      onClick={addProductDetail}
                    >
                      Add Q&A
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {productDetails.map((detail, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <span className="text-xs font-medium text-gray-500">
                            Q&A #{index + 1}
                          </span>
                          <button
                            onClick={() => removeProductDetail(index)}
                            className="rounded-lg p-1 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <Input
                            label="Question"
                            value={detail.question}
                            onChange={(e) =>
                              updateProductDetail(
                                index,
                                "question",
                                e.target.value,
                              )
                            }
                            placeholder="Enter question..."
                          />

                          <div>
                            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                              Answer
                            </label>
                            <textarea
                              value={detail.answer}
                              onChange={(e) =>
                                updateProductDetail(
                                  index,
                                  "answer",
                                  e.target.value,
                                )
                              }
                              placeholder="Enter answer..."
                              rows={3}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 dark:border-gray-700 dark:bg-gray-800"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {productDetails.length === 0 && (
                      <div className="py-8 text-center text-gray-500">
                        No Q&A added yet. Click "Add Q&A" to create one.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    URL Slug
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="product-url-slug"
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 dark:border-gray-700 dark:bg-gray-800"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!formData.name.trim()) {
                          addToast(
                            "warning",
                            "Missing Name",
                            "Enter product name first",
                          );
                          return;
                        }
                        setFormData({
                          ...formData,
                          slug: generateSlug(formData.name),
                        });
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Input
                    label="Meta Title"
                    value={formData.metaTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, metaTitle: e.target.value })
                    }
                    placeholder="SEO title"
                  />

                  <Input
                    label="Canonical URL"
                    value={formData.canonicalUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, canonicalUrl: e.target.value })
                    }
                    placeholder="https://example.com/product"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDescription: e.target.value,
                      })
                    }
                    placeholder="SEO meta description..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                <Input
                  label="Meta Keywords"
                  value={formData.metaKeywords}
                  onChange={(e) =>
                    setFormData({ ...formData, metaKeywords: e.target.value })
                  }
                  placeholder="keyword1, keyword2, keyword3"
                />

                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Open Graph (Facebook)
                  </h4>
                  <div className="space-y-4">
                    <Input
                      label="OG Title"
                      value={formData.ogTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, ogTitle: e.target.value })
                      }
                    />
                    <Input
                      label="OG Description"
                      value={formData.ogDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ogDescription: e.target.value,
                        })
                      }
                    />
                    <Input
                      label="OG Image URL"
                      value={formData.ogImage}
                      onChange={(e) =>
                        setFormData({ ...formData, ogImage: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                  <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Twitter Card
                  </h4>
                  <div className="space-y-4">
                    <Input
                      label="Twitter Title"
                      value={formData.twitterTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          twitterTitle: e.target.value,
                        })
                      }
                    />
                    <Input
                      label="Twitter Description"
                      value={formData.twitterDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          twitterDescription: e.target.value,
                        })
                      }
                    />
                    <Input
                      label="Twitter Image URL"
                      value={formData.twitterImage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          twitterImage: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

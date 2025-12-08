"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    Image as ImageIcon,
    X,
    Plus,
} from "lucide-react";
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
    const [productDetails, setProductDetails] = useState<Array<{
        id?: string;
        question: string;
        answer: string;
    }>>([]);
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState("");
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"basic" | "details" | "seo">("basic");



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
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
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
                setMainImagePreview(avatar(product.productImage));
                if (product.product_details && product.product_details.length > 0) {
                    setProductDetails(product.product_details.map((detail: any) => ({
                        id: detail.id.toString(),
                        question: detail.question,
                        answer: detail.answer,
                    })));
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

    const updateProductDetail = (index: number, field: "question" | "answer", value: string) => {
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
                    galleryFiles.map((file) => uploadImage(file, "products/gallery"))
                );
                const newGalleryPaths = uploadedGallery.map((u) => u.path);
                galleryPaths = [...galleryPreviews.filter(p => !p.startsWith("blob:")), ...newGalleryPaths];
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
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ details: productDetails }),
                });
            }

            if (data.success) {
                addToast(
                    "success",
                    "Success",
                    `Product ${isEdit ? "updated" : "created"} successfully`
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
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-[#FF6B35] border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="w-full mx-auto space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <PageHeader
                        title={isEdit ? "Edit Product" : "Create Product"}
                        subtitle={isEdit ? "Update product details" : "Add a new product to your catalog"}
                        leftActions={<BackButton />}
                        actions={
                            <div className="flex gap-2">
                                <Button
                                    icon={<Save className="w-4 h-4" />}
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
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
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
                                className={`px-6 py-4 font-medium text-sm transition-colors relative ${activeTab === tab.id
                                    ? "text-[#FF6B35]"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
                                <div className="grid md:grid-cols-2 gap-6">
                                    <Input
                                        label="Product Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter product name"
                                        required
                                    />

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.productCategoryId}
                                            onChange={(e) =>
                                                setFormData({ ...formData, productCategoryId: e.target.value })
                                            }
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
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
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="Enter price"
                                    required
                                    min="0"
                                    step="0.01"
                                />

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Short Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        placeholder="Brief description of the product..."
                                        rows={3}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Product Image <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {mainImagePreview && (
                                            <img
                                                src={mainImagePreview}
                                                alt="Preview"
                                                className="w-32 h-32 rounded-lg object-cover"
                                            />
                                        )}
                                        <label className="flex-1 cursor-pointer">
                                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-[#FF6B35] transition-colors">
                                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
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
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Gallery Images
                                    </label>
                                    <div className="grid grid-cols-4 gap-4">
                                        {galleryPreviews.map((preview, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={preview}
                                                    alt={`Gallery ${index + 1}`}
                                                    className="w-full h-24 rounded-lg object-cover"
                                                />
                                                <button
                                                    onClick={() => removeGalleryImage(index)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="cursor-pointer">
                                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-24 flex items-center justify-center hover:border-[#FF6B35] transition-colors">
                                                <Plus className="w-8 h-8 text-gray-400" />
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
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_feature}
                                            onChange={(e) =>
                                                setFormData({ ...formData, is_feature: e.target.checked })
                                            }
                                            className="w-5 h-5 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Featured Product
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.bestseller}
                                            onChange={(e) =>
                                                setFormData({ ...formData, bestseller: e.target.checked })
                                            }
                                            className="w-5 h-5 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Bestseller
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) =>
                                                setFormData({ ...formData, isActive: e.target.checked })
                                            }
                                            className="w-5 h-5 rounded"
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
                                        onChange={(value) => setFormData({ ...formData, features: value })}
                                        label="Features & Benefits"
                                    />
                                </div>

                                {/* Product Q&A Section */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Product Questions & Answers
                                        </h4>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            icon={<Plus className="w-4 h-4" />}
                                            onClick={addProductDetail}
                                        >
                                            Add Q&A
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {productDetails.map((detail, index) => (
                                            <div
                                                key={index}
                                                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <span className="text-xs font-medium text-gray-500">
                                                        Q&A #{index + 1}
                                                    </span>
                                                    <button
                                                        onClick={() => removeProductDetail(index)}
                                                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    <Input
                                                        label="Question"
                                                        value={detail.question}
                                                        onChange={(e) =>
                                                            updateProductDetail(index, "question", e.target.value)
                                                        }
                                                        placeholder="Enter question..."
                                                    />

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Answer
                                                        </label>
                                                        <textarea
                                                            value={detail.answer}
                                                            onChange={(e) =>
                                                                updateProductDetail(index, "answer", e.target.value)
                                                            }
                                                            placeholder="Enter answer..."
                                                            rows={3}
                                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {productDetails.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
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
                                <Input
                                    label="URL Slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="product-url-slug"
                                />

                                <div className="grid md:grid-cols-2 gap-6">
                                    <Input
                                        label="Meta Title"
                                        value={formData.metaTitle}
                                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                        placeholder="SEO title"
                                    />

                                    <Input
                                        label="Canonical URL"
                                        value={formData.canonicalUrl}
                                        onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                                        placeholder="https://example.com/product"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Meta Description
                                    </label>
                                    <textarea
                                        value={formData.metaDescription}
                                        onChange={(e) =>
                                            setFormData({ ...formData, metaDescription: e.target.value })
                                        }
                                        placeholder="SEO meta description..."
                                        rows={3}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                                    />
                                </div>

                                <Input
                                    label="Meta Keywords"
                                    value={formData.metaKeywords}
                                    onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                                    placeholder="keyword1, keyword2, keyword3"
                                />

                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                                        Open Graph (Facebook)
                                    </h4>
                                    <div className="space-y-4">
                                        <Input
                                            label="OG Title"
                                            value={formData.ogTitle}
                                            onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                                        />
                                        <Input
                                            label="OG Description"
                                            value={formData.ogDescription}
                                            onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                                        />
                                        <Input
                                            label="OG Image URL"
                                            value={formData.ogImage}
                                            onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                                        Twitter Card
                                    </h4>
                                    <div className="space-y-4">
                                        <Input
                                            label="Twitter Title"
                                            value={formData.twitterTitle}
                                            onChange={(e) => setFormData({ ...formData, twitterTitle: e.target.value })}
                                        />
                                        <Input
                                            label="Twitter Description"
                                            value={formData.twitterDescription}
                                            onChange={(e) => setFormData({ ...formData, twitterDescription: e.target.value })}
                                        />
                                        <Input
                                            label="Twitter Image URL"
                                            value={formData.twitterImage}
                                            onChange={(e) => setFormData({ ...formData, twitterImage: e.target.value })}
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
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { Switch } from "@/components/FormElements/switch";
import { uploadImage } from "@/upload";
import { createProductDetails } from "@/components/products/fetch";

export default function AddProductForm({
  categories,
}: {
  categories: { id: number; name: string }[];
}) {
  const [form, setForm] = useState<any>({
    name: "",
    amount: "",
    productCategoryId: "",
    is_feature: "",
    bestseller: "",
    features: "",
    productImage: null as File | null,
    gallery: [] as File[],
    isActive: true,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewGallery, setPreviewGallery] = useState<string[]>([]);

  // universal handleChange (for events and direct values)
  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | string,
    value?: any
  ) => {
    if (typeof e === "string") {
      setForm((prev: any) => ({ ...prev, [e]: value }));
    } else {
      const { name, value } = e.target;
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  // product image (single) with preview
  const handleProductImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev: any) => ({ ...prev, productImage: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // gallery images (max 5) with previews
  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files).slice(0, 5) : [];
    setForm((prev: any) => ({ ...prev, gallery: files }));
    setPreviewGallery(files.map((f) => URL.createObjectURL(f)));
  };

  // submit handler
  const handleSubmit = async () => {
    const payload: any = {
      name: form.name,
      amount: form.amount,
      productCategoryId: form.productCategoryId,
      is_feature: form.is_feature,
      bestseller: form.bestseller,
      features: form.features,
      isActive: form.isActive,
      productImage: form.productImage,
      gallery: form.gallery,
    };

    // upload product image
    if (payload.productImage instanceof File) {
      const uploadRes = await uploadImage(payload.productImage, "images");
      if (uploadRes?.success && uploadRes?.path) {
        payload.productImage = uploadRes.path;
      } else {
        toast.error("Product image upload failed");
        return;
      }
    }

    // upload gallery images
    if (Array.isArray(payload.gallery) && payload.gallery.length > 0) {
      const uploadedGallery: string[] = [];
      for (const file of payload.gallery) {
        const uploadRes = await uploadImage(file, "images");
        if (uploadRes?.success && uploadRes?.path) {
          uploadedGallery.push(uploadRes.path);
        } else {
          toast.error("One of the gallery images failed to upload");
          return;
        }
      }
      payload.gallery = uploadedGallery;
    }

    try {
      await createProductDetails(payload);
      toast.success("✅ Product Created Successfully!");
      location.href = "/products";
    } catch (err) {
      toast.error("❌ Failed to create product");
      console.error(err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-6 space-y-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {"Add New Product"}
        </h2>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="active-status"
            className="text-sm text-gray-600 dark:text-gray-300"
          >
            Is Active?
          </Label>
          <Switch
            checked={form.isActive}
            onCheckedChange={(val) => handleChange("isActive", val)}
            withIcon
            background="light"
          />
        </div>
      </div>


        {/* Name + Amount + Category */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Name</label>
            <Input
              name="name"
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">Amount</label>
            <Input
              name="amount"
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">Product Category</label>
            <Select
              name="productCategoryId"
              value={form.productCategoryId}
              onValueChange={(val) => handleChange("productCategoryId", val)}
              required
            >
                <SelectTrigger>
                <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
          </div>
        </div>

        {/* Is Feature & Best Seller */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Is Feature</label>
            <Select
              name="is_feature"
              value={form.is_feature}
              onValueChange={(val) => handleChange("is_feature", val)}
            >
            <SelectTrigger>
                <SelectValue placeholder="Select Is Feature" />
            </SelectTrigger>
            <SelectContent className="bg-white">
                <SelectItem value="1">Yes</SelectItem>
                <SelectItem value="0">No</SelectItem>
            </SelectContent>
            </Select>
          </div>

          <div>
            <label className="form-label">Best Seller</label>
            <Select
              name="bestseller"
              value={form.bestseller}
              onValueChange={(val) => handleChange("bestseller", val)}
            >
            <SelectTrigger>
                <SelectValue placeholder="Select Best Seller" />
            </SelectTrigger>
            <SelectContent className="bg-white">
                <SelectItem value="1">Yes</SelectItem>
                <SelectItem value="0">No</SelectItem>
            </SelectContent>
            </Select>
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="form-label">Features</label>
          <Textarea
            name="features"
            placeholder="Features"
            value={form.features}
            onChange={(e) => handleChange("features", e.target.value)}
            required
            minLength={10}
          />
        </div>

        {/* Product Image + Gallery */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Product Image</label>
            {previewImage && (
              <img src={previewImage} alt="preview" className="w-32 mb-2" />
            )}
            <input
              type="file"
              name="productImage"
              accept="image/*"
              className="p-2"
              onChange={handleProductImage}
              required
            />
          </div>

          <div>
            <label className="form-label">Gallery Images (Max 5)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="form-control w-full border p-2 rounded"
              onChange={handleGallery}
            />
            <small className="text-slate-500">
              You can select up to 5 images.
            </small>
            {/* Gallery previews */}
            <div className="flex gap-2 mt-2 flex-wrap">
                {previewGallery.map((src, idx) => (
                <img
                    key={idx}
                    src={src}
                    alt={`gallery-${idx}`}
                    className="w-16 h-16 object-cover rounded"
                />
                ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6">
          <Button className="w-full text-white" onClick={handleSubmit}>
            {"Add Product"}
          </Button>
        </div>
    </div>
  );
}
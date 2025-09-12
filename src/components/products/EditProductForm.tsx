"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Switch } from "@/components/FormElements/switch";
import toast from "react-hot-toast";
import { getProductDetails, updateProductDetails } from "@/components/products/fetch";
import { uploadImage } from "@/upload";

export default function EditProductForm({ categories }: { categories: any[] }) {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [form, setForm] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewGallery, setPreviewGallery] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchData = async () => {
      if (productId) {
        try {
          const result = await getProductDetails(productId);
          const p = result.pDetails;
           console.log("Product Details ===>", result.pDetails);

          setForm({
            name: p.name || "",
            amount: p.amount ? String(p.amount) : "",
            productCategoryId: p.productCategoryId ? String(p.productCategoryId) : "",
            is_feature: p.is_feature ? "1" : "0",   // boolean -> "1"/"0"
            bestseller: p.bestseller ? "1" : "0",   // boolean -> "1"/"0"
            features: p.features || "",
            isActive: p.isActive ?? true,
            productImage: p.productImage || "",
            gallery: Array.isArray(p.gallery) ? JSON.parse(p.gallery) : [], // string → array
          });

          if (p.productImage) setPreviewImage(p.productImage);
          if (p.gallery && Array.isArray(p.gallery)) setPreviewGallery(p.gallery);
        } catch (err) {
          console.error("Failed to fetch product details", err);
        }
      } else {
        setForm({
          name: "",
          amount: "",
          productCategoryId: "",
          is_feature: "0",
          bestseller: "0",
          features: "",
          isActive: false,
          productImage: "",
          gallery: [],
        });
      }
    };

    fetchData();
  }, [productId]);

  // Universal handleChange
  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  // Handle single product image
  const handleProductImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev: any) => ({ ...prev, productImage: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle gallery images (max 5)
  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files).slice(0, 5) : [];
    setForm((prev: any) => ({ ...prev, gallery: files }));
    setPreviewGallery(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!form) return;
    setLoading(true);

    try {
      let finalGallery = form.gallery;

      // ✅ Agar gallery blank hai aur productId hai → purana gallery data preserve karo
      if ((!form.gallery || form.gallery.length === 0) && productId) {
        const result = await getProductDetails(productId);
        finalGallery = result?.pDetails?.gallery
          ? JSON.parse(result.pDetails.gallery)
          : [];
      }

      const payload: any = {
        name: form.name,
        features: form.features,
        productCategoryId: form.productCategoryId,
        amount: parseFloat(form.amount) || 0,
        is_feature: Number(form.is_feature),
        bestseller: Number(form.bestseller),
        isActive: form.isActive,
        productImage: form.productImage,
        gallery: finalGallery, // ✅ purana ya naya jo bhi ho
      };

      // 🔹 Upload product image agar File hai
      if (payload.productImage instanceof File) {
        const uploadRes = await uploadImage(payload.productImage, "images");
        if (uploadRes?.success && uploadRes?.path) {
          payload.productImage = uploadRes.path;
        } else {
          toast.error("Product image upload failed");
          setLoading(false);
          return;
        }
      }

      // 🔹 Upload gallery files (sirf naye files)
      const filesToUpload = Array.isArray(form.gallery)
        ? form.gallery.filter((f: any) => f instanceof File)
        : [];

      if (filesToUpload.length) {
        const uploadedGallery: string[] = [];
        for (const file of filesToUpload) {
          const uploadRes = await uploadImage(file, "images");
          if (uploadRes?.success && uploadRes?.path) {
            uploadedGallery.push(uploadRes.path);
          } else {
            toast.error("One of the gallery images failed to upload");
            setLoading(false);
            return;
          }
        }

        // ⚡ Replace only new files, purane preserve karo
        payload.gallery = form.gallery.map((f: any) =>
          f instanceof File ? uploadedGallery.shift() : f
        );
      }

      // ✅ API call
      if (productId) {
        await updateProductDetails(payload, Number(productId));
        toast.success("✅ Product Updated Successfully!");
        router.push("/products");
      } else {
        toast.error("Create product API not implemented");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-6 space-y-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {productId ? "Edit Product" : "Create New Product"}
        </h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="active-status" className="text-sm">
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
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="form-label">Amount</label>
          <Input
            type="number"
            value={form.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="form-label">Product Category</label>
          <Select
            value={form.productCategoryId}
            onValueChange={(val) => handleChange("productCategoryId", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {categories?.map((cat: any) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feature & Best Seller */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Is Feature</label>
          <Select
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
            accept="image/*"
            onChange={handleProductImage}
            required={!productId}
          />
        </div>

        <div>
          <label className="form-label">Gallery Images (Max 5)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleGallery}
          />
          <small className="text-slate-500">You can select up to 5 images.</small>
          <div className="flex gap-2 mt-2 flex-wrap">
            {previewGallery?.map((src, idx) => (
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

      <div className="pt-6">
        <Button
          className="w-full text-white"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : productId ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </div>
  );
}
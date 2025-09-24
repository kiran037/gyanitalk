
"use client";

import { Suspense, use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Pencil, Eye, Plus, Loader2 } from "lucide-react";
import { uploadImage } from "@/upload";
import { isValidImageUrl } from "@/components/functions";
import { useToast } from "@/components/Toast/ToastProvider";

// ---- API helpers
import {
  getProducts,
  getproductCategories,
  updateProductStatus,
  updateProductDetails,
  createProductDetails,
  getProductDetails,
} from "./fetch";

/* -----------------------------------
   tiny utils
------------------------------------ */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
const BASE = process.env.NEXT_PUBLIC_BASEURL ?? "";
const FALLBACK = "https://gyanitalk.com/build/assets/images/person.png";

const productSrcOf = (item: any) => {
  const src = item?.productImage ?? "";
  if (!isValidImageUrl(src)) return FALLBACK;
  return /^https?:\/\//i.test(src) ? src : `${BASE}${src}`;
};

const safeImg = (src?: any) => {
  if (!src || typeof src !== "string") return FALLBACK;
  if (src.startsWith("blob:") || src.startsWith("data:")) return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/")) return src;
  return `${BASE}${src.startsWith("/") ? "" : "/"}${src}`;
};

/* -----------------------------------
   Liquid Glass atoms
------------------------------------ */
function GlassCard({
  children,
  className = "",
  hover = true,
}: React.PropsWithChildren<{ className?: string; hover?: boolean }>) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-3xl",
        "bg-white/55 dark:bg-white/[0.06] border border-white/50 dark:border-white/10",
        "backdrop-blur-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
        hover && "transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(2,6,23,0.12)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.06] dark:via-white/[0.03]" />
      <div className="relative">{children}</div>
    </div>
  );
}

function GlassButton(
  { children, className = "", variant = "primary", ...rest }:
    React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }
) {
  const base =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed";
  const styles = {
    primary:
      "text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-[0_8px_20px_rgba(59,130,246,0.28)]",
    secondary:
      "text-slate-900 dark:text-white bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/[0.12]",
    danger:
      "text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-[0_8px_20px_rgba(244,63,94,0.28)]",
    ghost: "text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/[0.08]",
  } as const;

  return (
    <button {...rest} className={cx(base, styles[variant], className)}>
      {children}
    </button>
  );
}

function GlassInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-xl px-4 py-2.5 text-sm outline-none",
        "bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10",
        "focus:ring-2 focus:ring-blue-500/60 focus:border-transparent",
        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
        "text-slate-900 dark:text-slate-100",
        props.className
      )}
    />
  );
}

function GlassTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cx(
        "w-full rounded-xl px-4 py-3 text-sm outline-none resize-none",
        "bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10",
        "focus:ring-2 focus:ring-blue-500/60 focus:border-transparent",
        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
        "text-slate-900 dark:text-slate-100",
        props.className
      )}
    />
  );
}

function GlassSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx(
        "w-full rounded-xl px-4 py-2.5 text-sm outline-none",
        "bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10",
        "focus:ring-2 focus:ring-blue-500/60 focus:border-transparent",
        "text-slate-900 dark:text-slate-100",
        props.className
      )}
    />
  );
}

/* iOS26 style switch (no inline text) */
function GlassSwitch({
  checked,
  onChange,
  ariaLabel = "Toggle",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-[28px] w-[52px] rounded-full transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
        "backdrop-blur-md border",
        checked
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-white/40 shadow-[0_6px_20px_rgba(59,130,246,0.35)]"
          : "bg-white/40 dark:bg-white/[0.10] border-white/30 dark:border-white/10"
      )}
    >
      <span
        className={cx(
          "absolute top-0.5 left-0.5 h-[24px] w-[24px] rounded-full",
          "bg-white dark:bg-slate-100 shadow-md transition-transform will-change-transform",
          checked ? "translate-x-[24px] shadow-[0_0_0_3px_rgba(255,255,255,0.35)]" : "translate-x-0"
        )}
      />
      <span className="sr-only">{ariaLabel}</span>
    </button>
  );
}

/* -----------------------------------
   Modal with FULL viewport blur (top issue fixed)
------------------------------------ */
function GlassModal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-4xl",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  // SUPER high z to sit above sticky headers/other overlays
  const Z_VEIL = "z-[2147483646]";
  const Z_CONTENT = "z-[2147483647]";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cx("fixed inset-0 grid place-items-center p-4 md:p-6", Z_CONTENT)}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      aria-modal="true"
      role="dialog"
    >
      {/* The veil is a separate fixed layer with its own max z — guarantees blur across the whole screen */}
      <div
        className={cx(
          "fixed inset-0 bg-black/60 backdrop-blur-xl backdrop-saturate-150",
          Z_VEIL
        )}
      />
      <GlassCard className={cx("relative w-full", maxWidth, Z_CONTENT)}>
        <div className="flex items-center justify-between p-5 border-b border-white/60 dark:border-white/10">
          <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
            {title || "Dialog"}
          </h3>
          <GlassButton variant="ghost" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </GlassButton>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </GlassCard>
    </div>
  );
}

/* -----------------------------------
   Status Toggle (optimistic & notifies parent)
------------------------------------ */
function ProductStatusToggle({
  id,
  status,
  onChanged,
}: {
  id: number;
  status: boolean;
  onChanged: (next: boolean) => void;
}) {
  const toast = useToast();
  const [checked, setChecked] = useState<boolean>(status);
  useEffect(() => setChecked(status), [status]);

  const toggle = async () => {
    const next = !checked;
    setChecked(next);
    onChanged(next); // optimistic
    try {
      const res = await updateProductStatus(id, next);
      if (res?.success) toast("success", "Updated", "Status updated successfully.");
      else throw new Error();
    } catch {
      setChecked(!next);
      onChanged(!next);
      toast("error", "Error", "Failed to update status.");
    }
  };

  return <GlassSwitch checked={checked} onChange={toggle} ariaLabel="Toggle active" />;
}

/* -----------------------------------
   Edit Modal
------------------------------------ */
function EditProductModal({
  id,
  open,
  onClose,
  onSaved,
}: {
  id: number | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewGallery, setPreviewGallery] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!open || !id) return;
      try {
        setLoading(true);
        const [cat, details] = await Promise.all([getproductCategories(), getProductDetails(String(id))]);
        setCategories(cat?.data || cat || []);
        const p = details?.pDetails ?? details?.astroMall ?? {};
        const galleryArr =
          Array.isArray(p.gallery)
            ? p.gallery
            : (() => {
              try {
                return p.gallery ? JSON.parse(p.gallery) : [];
              } catch {
                return [];
              }
            })();

        setForm({
          name: p.name || "",
          amount: p.amount ? String(p.amount) : "",
          productCategoryId: p.productCategoryId ? String(p.productCategoryId) : "",
          is_feature: p.is_feature ? "1" : "0",
          bestseller: p.bestseller ? "1" : "0",
          features: p.features || "",
          isActive: !!p.isActive,
          productImage: p.productImage || "",
          gallery: galleryArr || [],
        });

        setPreviewImage(p.productImage || null);
        setPreviewGallery(galleryArr || []);
      } catch (e: any) {
        console.error(e);
        toast("error", "Error", "Failed to fetch product.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [open, id, toast]);

  const handleChange = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }));

  const handleProductImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev: any) => ({ ...prev, productImage: file }));
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files).slice(0, 5) : [];
    const nextGallery = [...(form?.gallery || []), ...files];
    setForm((prev: any) => ({ ...prev, gallery: nextGallery }));
    setPreviewGallery((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const handleSubmit = async () => {
    if (!form || !id) return;
    if (!form.name.trim()) {
      toast("warning", "Warning", "Name is required.");
      return;
    }
    setSaving(true);

    try {
      let payload: any = {
        name: form.name,
        features: form.features,
        productCategoryId: form.productCategoryId,
        amount: parseFloat(form.amount) || 0,
        is_feature: Number(form.is_feature),
        bestseller: Number(form.bestseller),
        isActive: form.isActive,
        productImage: form.productImage,
        gallery: form.gallery,
      };

      if (payload.productImage instanceof File) {
        const uploadRes = await uploadImage(payload.productImage, "images");
        if (uploadRes?.success && uploadRes?.path) payload.productImage = uploadRes.path;
        else {
          toast("error", "Error", "Product image upload failed.");
          setSaving(false);
          return;
        }
      }

      if (Array.isArray(payload.gallery)) {
        const uploaded: string[] = [];
        for (const g of payload.gallery) {
          if (g instanceof File) {
            const r = await uploadImage(g, "images");
            if (r?.success && r?.path) uploaded.push(r.path);
            else {
              toast("error", "Error", "A gallery image failed to upload.");
              setSaving(false);
              return;
            }
          } else {
            uploaded.push(g);
          }
        }
        payload.gallery = uploaded;
      }

      await updateProductDetails(payload, Number(id));
      toast("success", "Saved", "Product updated successfully.");
      onClose();
      onSaved();
    } catch (e: any) {
      console.error(e);
      toast("error", "Error", "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassModal open={open} onClose={onClose} title="Edit Product" maxWidth="max-w-4xl">
      {loading || !form ? (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-6">
          {/* top row toggles */}
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-700 dark:text-slate-300">Best Seller</span>
                <GlassSelect
                  value={form.bestseller}
                  onChange={(e) => handleChange("bestseller", e.target.value)}
                  className="w-28"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </GlassSelect>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-700 dark:text-slate-300">Featured</span>
                <GlassSelect
                  value={form.is_feature}
                  onChange={(e) => handleChange("is_feature", e.target.value)}
                  className="w-28"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </GlassSelect>
              </div>
            </div>

            <GlassSwitch
              checked={!!form.isActive}
              onChange={(v) => handleChange("isActive", v)}
              ariaLabel="Toggle active"
            />
          </div>

          {/* Name + Amount + Category */}
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Name</span>
              <GlassInput value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Product name" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Amount</span>
              <GlassInput type="number" value={form.amount} onChange={(e) => handleChange("amount", e.target.value)} placeholder="0" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Category</span>
              <GlassSelect value={form.productCategoryId} onChange={(e) => handleChange("productCategoryId", e.target.value)}>
                <option value="">Select category…</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                ))}
              </GlassSelect>
            </label>
          </div>

          {/* Features */}
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Features</span>
            <GlassTextarea rows={5} value={form.features} onChange={(e) => handleChange("features", e.target.value)} />
          </label>

          {/* Images */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Product Image</span>
              <div className="mt-2 flex items-center gap-3">
                <div className="relative h-24 w-24 overflow-hidden rounded-2xl ring-4 ring-white/70 dark:ring-white/10 border border-white/60 dark:border-white/10">
                  <Image src={safeImg(previewImage)} alt="preview" fill className="object-cover" unoptimized />
                </div>
                <label className="cursor-pointer">
                  <span className="inline-flex text-sm px-3 py-1.5 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08]">
                    Upload
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleProductImage} />
                </label>
              </div>
            </div>
            <div>
              <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Gallery (max 5)</span>
              <div className="mt-2">
                <label className="cursor-pointer">
                  <span className="inline-flex text-sm px-3 py-1.5 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08]">
                    Add Images
                  </span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleGallery} />
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {previewGallery?.map((src, idx) => (
                    <div key={idx} className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/60 dark:border-white/10">
                      <Image src={safeImg(src)} alt={`g-${idx}`} fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <GlassButton variant="secondary" onClick={onClose}>Cancel</GlassButton>
            <GlassButton onClick={handleSubmit} disabled={saving}>
              {saving ? (<><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>) : "Save Changes"}
            </GlassButton>
          </div>
        </div>
      )}
    </GlassModal>
  );
}

/* -----------------------------------
   Create Modal
------------------------------------ */
function CreateProductModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const toast = useToast();
  const [categories, setCategories] = useState<any[]>([]);
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!open) return;
      try {
        const cats = await getproductCategories();
        setCategories(cats?.data || cats || []);
      } catch {
        toast("error", "Error", "Failed to load categories.");
      }
    };
    run();
  }, [open, toast]);

  const handleChange = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleProductImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange("productImage", file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };
  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files).slice(0, 5) : [];
    handleChange("gallery", files);
    setPreviewGallery(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast("warning", "Warning", "Name is required.");
      return;
    }
    setSaving(true);
    try {
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

      if (payload.productImage instanceof File) {
        const res = await uploadImage(payload.productImage, "images");
        if (res?.success && res?.path) payload.productImage = res.path;
        else {
          toast("error", "Error", "Product image upload failed.");
          setSaving(false);
          return;
        }
      }

      if (Array.isArray(payload.gallery) && payload.gallery.length > 0) {
        const uploaded: string[] = [];
        for (const f of payload.gallery) {
          const r = await uploadImage(f, "images");
          if (r?.success && r?.path) uploaded.push(r.path);
          else {
            toast("error", "Error", "A gallery image failed to upload.");
            setSaving(false);
            return;
          }
        }
        payload.gallery = uploaded;
      }

      await createProductDetails(payload);
      toast("success", "Created", "Product created successfully.");
      onClose();
      onCreated();
    } catch (e: any) {
      console.error(e);
      toast("error", "Error", "Failed to create product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassModal open={open} onClose={onClose} title="Add Product" maxWidth="max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-700 dark:text-slate-300">Best Seller</span>
              <GlassSelect value={form.bestseller} onChange={(e) => handleChange("bestseller", e.target.value)} className="w-28">
                <option value="">Select</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </GlassSelect>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-700 dark:text-slate-300">Featured</span>
              <GlassSelect value={form.is_feature} onChange={(e) => handleChange("is_feature", e.target.value)} className="w-28">
                <option value="">Select</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </GlassSelect>
            </div>
          </div>

          <GlassSwitch checked={!!form.isActive} onChange={(v) => handleChange("isActive", v)} ariaLabel="Toggle active" />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Name</span>
            <GlassInput value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Product name" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Amount</span>
            <GlassInput type="number" value={form.amount} onChange={(e) => handleChange("amount", e.target.value)} placeholder="0" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Category</span>
            <GlassSelect value={form.productCategoryId} onChange={(e) => handleChange("productCategoryId", e.target.value)}>
              <option value="">Select category…</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
              ))}
            </GlassSelect>
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Features</span>
          <GlassTextarea rows={5} value={form.features} onChange={(e) => handleChange("features", e.target.value)} />
        </label>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Product Image</span>
            <div className="mt-2 flex items-center gap-3">
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl ring-4 ring-white/70 dark:ring-white/10 border border-white/60 dark:border-white/10">
                <Image src={safeImg(previewImage)} alt="preview" fill className="object-cover" unoptimized />
              </div>
              <label className="cursor-pointer">
                <span className="inline-flex text-sm px-3 py-1.5 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08]">
                  Upload
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleProductImage} />
              </label>
            </div>
          </div>
          <div>
            <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Gallery (max 5)</span>
            <div className="mt-2">
              <label className="cursor-pointer">
                <span className="inline-flex text-sm px-3 py-1.5 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08]">
                  Add Images
                </span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleGallery} />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {previewGallery.map((src, idx) => (
                  <div key={idx} className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/60 dark:border-white/10">
                    <Image src={safeImg(src)} alt={`g-${idx}`} fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <GlassButton variant="secondary" onClick={onClose}>Cancel</GlassButton>
          <GlassButton onClick={handleSubmit} disabled={saving}>
            {saving ? (<><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>) : "Add Product"}
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
}

/* -----------------------------------
   Product Card – Notion-ish Liquid Glass
------------------------------------ */
type Product = {
  id: number;
  name: string;
  productImage: string;
  amount: number;
  product_category: { id: number; name: string } | null;
  features: string;
  created_at: string;
  isActive: boolean;
};

function ProductCard({
  item,
  onView,
  onEdit,
  onStatusChange,
}: {
  item: Product;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onStatusChange: (id: number, next: boolean) => void;
}) {
  const img = productSrcOf(item);
  const plainText = item.features?.replace(/<[^>]+>/g, "") || "";
  const short = plainText.length > 160 ? plainText.slice(0, 160) + "…" : plainText;

  return (
    <GlassCard className="overflow-hidden group">
      {/* square media */}
      <div className="relative aspect-square w-full">
        <Image
          src={img}
          alt={item.name || "Product"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* make gradient stronger in dark so overlay controls always readable */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent dark:from-black/70 dark:via-black/40 dark:to-transparent" />

        {/* status chip */}
        <div className="absolute left-3 top-3">
          <span
            className={cx(
              "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
              "backdrop-blur-md shadow-sm border",
              // solid / high-contrast variants
              item.isActive
                ? "bg-emerald-500/95 text-white border-emerald-400/60"
                : "bg-slate-500/90 text-white border-slate-400/50"
            )}
          >
            {item.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* action pills — force visibility in dark mode */}
        <div className="absolute right-3 top-3 flex gap-2">
          <button
            onClick={() => onView(item.id)}
            className={cx(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
              "border shadow-sm backdrop-blur-md",
              // light mode: soft white; dark mode: nearly-opaque slate
              "bg-white/85 text-slate-800 border-white/60 hover:bg-white",
              "dark:bg-slate-900/85 dark:text-white dark:border-white/10 dark:hover:bg-slate-900/95"
            )}
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">View</span>
          </button>

          <button
            onClick={() => onEdit(item.id)}
            className={cx(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
              "border shadow-sm backdrop-blur-md",
              "bg-white/85 text-slate-800 border-white/60 hover:bg-white",
              "dark:bg-slate-900/85 dark:text-white dark:border-white/10 dark:hover:bg-slate-900/95"
            )}
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>
      </div>

      {/* body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {item.name}
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              ₹{Number(item.amount || 0).toFixed(2)} • {item.product_category?.name || "Uncategorized"}
            </p>
          </div>

          {/* compact toggle; no text label next to it */}
          <ProductStatusToggle
            id={item.id}
            status={!!item.isActive}
            onChanged={(next) => onStatusChange(item.id, next)}
          />
        </div>

        {short ? (
          <p className="mt-3 text-xs text-slate-700 dark:text-slate-300 line-clamp-3">{short}</p>
        ) : null}
      </div>
    </GlassCard>
  );
}


/* -----------------------------------
   Product List
------------------------------------ */
function ProductList({
  page,
  search,
  refreshKey,
  onCreate,
  onEditOpen,
}: {
  page: number;
  search: string;
  refreshKey: number;
  onCreate: () => void;
  onEditOpen: (id: number) => void;
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [bRes] = await Promise.all([getProducts({ search, page })]);
      setProducts(bRes.data || []);
      setTotalPages(bRes.totalPages || 1);
      setCurrentPage(bRes.currentPage || 1);
    } catch (e) {
      console.error(e);
      toast("error", "Error", "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, refreshKey]);

  const updateLocalStatus = (id: number, next: boolean) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: next } : p)));
  };

  return (
    <div className="relative w-full min-w-0 space-y-6">
      {/* subtle ambient */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-32 w-[26rem] h-[26rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-32 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Products</h2>
        <GlassButton onClick={onCreate}>
          <Plus className="h-4 w-4" />
          Create Product
        </GlassButton>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <GlassCard key={i} hover={false} className="overflow-hidden">
              <div className="aspect-square w-full bg-white/60 dark:bg-white/[0.08] animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 rounded bg-white/60 dark:bg-white/[0.08] animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-white/60 dark:bg-white/[0.08] animate-pulse" />
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onView={(id) => window.open(`/products/${id}`, "_self")}
              onEdit={(id) => onEditOpen(id)}
              onStatusChange={updateLocalStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -----------------------------------
   Page (unwrap searchParams)
------------------------------------ */
export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = use(searchParams);
  const page = parseInt(params?.page || "1", 10);
  const search = params?.search || "";

  // modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // refresh list after create/edit
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshList = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-10">

      {/* Search form (glass) */}
      <GlassCard className="p-4">
        <form method="get" className="flex flex-col sm:flex-row gap-3">
          <GlassInput
            name="search"
            defaultValue={search}
            placeholder="Search products…"
            className="sm:flex-1"
          />
          <div className="flex gap-2">
            <GlassButton type="submit">Search</GlassButton>
            {search ? (
              <GlassButton
                type="button"
                variant="secondary"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete("search");
                  window.location.href = url.toString();
                }}
              >
                Clear
              </GlassButton>
            ) : null}
          </div>
        </form>
      </GlassCard>

      <Suspense fallback={<p className="text-slate-500">Loading products…</p>}>
        <ProductList
          page={page}
          search={search}
          refreshKey={refreshKey}
          onCreate={() => setCreateOpen(true)}
          onEditOpen={(id) => setEditId(id)}
        />
      </Suspense>

      {/* Modals */}
      <CreateProductModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={refreshList} />
      <EditProductModal id={editId} open={!!editId} onClose={() => setEditId(null)} onSaved={refreshList} />
    </div>
  );
}

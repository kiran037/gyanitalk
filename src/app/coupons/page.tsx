"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import moment from "moment";
import { Plus, Pencil, Trash2, Copy, TicketPercent, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";

import {
  getCoupons,
  getCouponDetails,
  createCouponDetails,
  updateCouponDetails,
  deleteCoupon,
} from "@/app/coupons/fetch";

/* ---------------- Types ---------------- */
type Coupon = {
  id: number;
  code: string;
  description?: string | null;
  type: "coupon" | "giftcard" | string;
  discount_type: "fixed" | "percentage" | "percent" | string;
  discount_value: number | string;
  max_discount?: number | string | null;
  min_order_amount?: number | string | null;
  usage_limit?: number | string | null;
  usage_limit_per_user?: number | string | null;
  start_date?: string | Date | null;
  expiry_date?: string | Date | null;
  is_active: boolean;
};

/* --------------- Helpers ---------------- */
const normalizeDiscountType = (v?: string) =>
  v === "percent" ? "percentage" : v ?? "fixed";

const toNumberOrNull = (v: any) =>
  v === "" || v === null || v === undefined ? null : Number(v);

const toDateOrNull = (v: any) =>
  !v ? null : v instanceof Date ? v : new Date(v);

const fmtValidity = (s?: string | Date | null, e?: string | Date | null) => {
  const a = s ? moment(s).format("DD MMM") : "—";
  const b = e ? moment(e).format("DD MMM") : "—";
  return `${a} – ${b}`;
};

/* ---------------- Component ---------------- */
export default function CouponsPage() {
  const toast = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);

  // Create/Edit modal
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Delete confirm modal
  const [confirmDel, setConfirmDel] = useState<{ open: boolean; id?: number; code?: string }>({
    open: false,
  });

  const emptyForm: Coupon = {
    id: 0,
    code: "",
    description: "",
    type: "coupon",
    discount_type: "fixed",
    discount_value: "" as any,
    max_discount: "" as any,
    min_order_amount: "" as any,
    usage_limit: "" as any,
    usage_limit_per_user: "" as any,
    start_date: null,
    expiry_date: null,
    is_active: true,
  };
  const [form, setForm] = useState<Coupon>(emptyForm);

  /* ---------- Data fetch ---------- */
  const fetchCoupons = async () => {
    try {
      const { records } = await getCoupons();
      setCoupons(records || []);
    } catch (e) {
      console.error(e);
      toast("error", "Error", "Failed to load coupons.");
    }
  };

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Handlers ---------- */
  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = async (id: number) => {
    setMode("edit");
    setEditingId(id);
    setOpen(true);
    try {
      const result = await getCouponDetails(id);
      const c = (result as any)?.cDetails || result;

      const nextForm: Coupon = {
        id,
        code: c.code ?? "",
        description: c.description ?? "",
        type: (c.type as any) ?? "coupon",
        discount_type: normalizeDiscountType(c.discount_type),
        discount_value: c.discount_value ?? "",
        max_discount: c.max_discount ?? "",
        min_order_amount: c.min_order_amount ?? "",
        usage_limit: c.usage_limit ?? "",
        usage_limit_per_user: c.usage_limit_per_user ?? "",
        start_date: toDateOrNull(c.start_date),
        expiry_date: toDateOrNull(c.expiry_date),
        is_active: c.is_active ?? true,
      };
      setForm(nextForm);
    } catch (e) {
      console.error(e);
      toast("error", "Error", "Failed to fetch coupon details.");
      setOpen(false);
    }
  };

  const handleChange = (field: keyof Coupon, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const askDelete = (id: number, code?: string) => {
    setConfirmDel({ open: true, id, code });
  };

  const handleDelete = async () => {
    if (!confirmDel.id) return;
    setLoading(true);
    try {
      await deleteCoupon(confirmDel.id);
      toast("warning", "Deleted", `Coupon ${confirmDel.code || "#"+confirmDel.id} removed.`);
      setConfirmDel({ open: false });
      await fetchCoupons();
    } catch (e) {
      console.error(e);
      toast("error", "Error", "Failed to delete coupon.");
    } finally {
      setLoading(false);
    }
  };

  const payload = useMemo(() => {
    return {
      code: form.code,
      description: form.description || "",
      discount_type: normalizeDiscountType(form.discount_type),
      discount_value: Number(form.discount_value),
      max_discount: toNumberOrNull(form.max_discount),
      min_order_amount: toNumberOrNull(form.min_order_amount),
      usage_limit: toNumberOrNull(form.usage_limit),
      usage_limit_per_user: toNumberOrNull(form.usage_limit_per_user),
      start_date: form.start_date ? new Date(form.start_date as Date) : null,
      expiry_date: form.expiry_date ? new Date(form.expiry_date as Date) : null,
      type: form.type,
      is_active: !!form.is_active,
    };
  }, [form]);

  const handleSubmit = async () => {
    try {
      if (!payload.code) return toast("warning", "Warning", "Coupon code is required.");
      if (!payload.discount_type) return toast("warning", "Warning", "Discount type is required.");
      if (Number.isNaN(payload.discount_value))
        return toast("warning", "Warning", "Discount value must be a number.");

      if (mode === "create") {
        await createCouponDetails(payload);
        toast("warning", "Success", "Coupon created successfully.");
      } else if (mode === "edit" && editingId) {
        await updateCouponDetails(payload, Number(editingId));
        toast("warning", "Updated", "Coupon updated successfully.");
      }
      setOpen(false);
      await fetchCoupons();
    } catch (e) {
      console.error(e);
      toast("error", "Error", mode === "create" ? "Failed to create coupon." : "Failed to update coupon.");
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast("warning", "Copied", "Coupon code copied to clipboard.");
    } catch {
      toast("error", "Error", "Could not copy code.");
    }
  };

  // toggle active from the card (best effort using current item fields)
  const toggleActive = async (c: Coupon) => {
    try {
      const body = {
        code: c.code,
        description: c.description || "",
        discount_type: normalizeDiscountType(c.discount_type),
        discount_value: Number(c.discount_value),
        max_discount: toNumberOrNull(c.max_discount),
        min_order_amount: toNumberOrNull(c.min_order_amount),
        usage_limit: toNumberOrNull(c.usage_limit),
        usage_limit_per_user: toNumberOrNull(c.usage_limit_per_user),
        start_date: c.start_date ? new Date(c.start_date as Date) : null,
        expiry_date: c.expiry_date ? new Date(c.expiry_date as Date) : null,
        type: c.type,
        is_active: !c.is_active,
      };
      await updateCouponDetails(body, Number(c.id));
      toast("warning", "Updated", `Coupon ${c.code} ${!c.is_active ? "activated" : "deactivated"}.`);
      await fetchCoupons();
    } catch {
      toast("error", "Error", "Failed to toggle status.");
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full p-6 md:p-8 space-y-8">
        {/* Header / Stats */}
        <div className="relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] backdrop-blur-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="inline-block h-2 w-2 rounded-full bg-blue-400 animate-pulse delay-150" />
                <span className="inline-block h-2 w-2 rounded-full bg-purple-400 animate-pulse delay-300" />
              </div>
              <h1 className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-2xl font-bold text-transparent">
                Coupons
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Beautiful, interactive cards for your discount codes
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/[0.06] px-3 py-2 backdrop-blur-xl shadow-sm">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Total: {coupons.length}
                </span>
              </div>

              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openCreate();
                }}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(59,130,246,0.25)] transition hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 transition group-active:scale-95" />
                Create New
              </Link>
            </div>
          </div>
        </div>

        {/* Coupon Cards Grid */}
        {coupons.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {coupons.map((c) => {
              const discountIsPct = normalizeDiscountType(c.discount_type) === "percentage";
              const discountText = discountIsPct ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`;
              const zebraGlow =
                c.is_active
                  ? "from-blue-400/12 via-purple-400/10 to-pink-400/12"
                  : "from-slate-300/10 via-slate-300/10 to-slate-300/10";

              return (
                <div
                  key={c.id}
                  className={[
                    "relative overflow-hidden rounded-3xl border backdrop-blur-2xl",
                    "border-white/30 dark:border-white/10",
                    "bg-white/65 dark:bg-white/[0.06]",
                    "shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
                    "transition hover:scale-[1.01] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
                    c.is_active ? "" : "grayscale-[.15] opacity-90",
                  ].join(" ")}
                >
                  {/* fancy background wash */}
                  <div className={`absolute -top-16 -right-24 h-48 w-48 rounded-full blur-3xl bg-gradient-to-br ${zebraGlow}`} />
                  <div className={`absolute -bottom-16 -left-24 h-48 w-48 rounded-full blur-3xl bg-gradient-to-tr ${zebraGlow}`} />

                  {/* notch perforations */}
                  <div className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full bg-gradient-to-br from-white/60 to-white/30 dark:from-white/[0.06] dark:to-white/[0.02] backdrop-blur-md border border-white/30 dark:border-white/10" />
                  <div className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full bg-gradient-to-br from-white/60 to-white/30 dark:from-white/[0.06] dark:to-white/[0.02] backdrop-blur-md border border-white/30 dark:border-white/10" />

                  <div className="relative p-5">
                    {/* Header line with icon + status chip */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/[0.08]">
                          <TicketPercent className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {c.type === "giftcard" ? "Giftcard" : "Coupon"}
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold border ${
                          c.is_active
                            ? "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40"
                            : "bg-rose-100/70 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${c.is_active ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Discount banner */}
                    <div className="mb-4 rounded-2xl border border-white/40 dark:border-white/10 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 p-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Discount</div>
                          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{discountText}</div>
                          {c.max_discount ? (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Max discount ₹{c.max_discount}</div>
                          ) : null}
                        </div>
                        <ShieldCheck className="h-6 w-6 text-slate-400/70" />
                      </div>
                    </div>

                    {/* CODE + copy */}
                    <div className="mb-4 flex items-center gap-2">
                      <div className="min-w-0 rounded-xl border border-dashed border-slate-300/70 dark:border-slate-600/60 bg-white/70 dark:bg-white/[0.06] px-3 py-2">
                        <div className="font-mono text-sm font-semibold text-slate-900 dark:text-white truncate">{c.code}</div>
                      </div>
                      <button
                        onClick={() => copyCode(c.code)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/[0.12] transition"
                        title="Copy code"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    {/* perforated divider */}
                    <div className="relative my-3">
                      <div className="h-px w-full border-t border-dashed border-slate-300/70 dark:border-slate-600/60" />
                    </div>

                    {/* Meta rows */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Meta label="Validity" value={fmtValidity(c.start_date, c.expiry_date)} />
                      <Meta label="Min Order" value={c.min_order_amount ? `₹${c.min_order_amount}` : "—"} />
                      <Meta
                        label="Usage"
                        value={`${c.usage_limit ?? "∞"} / ${c.usage_limit_per_user ?? "∞"}`}
                      />
                      <Meta
                        label="Type"
                        value={c.type === "giftcard" ? "Giftcard" : "Coupon"}
                      />
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center justify-between">
                      <button
                        onClick={() => toggleActive(c)}
                        className={[
                          "inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition",
                          c.is_active
                            ? "text-rose-600 dark:text-rose-300 border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] hover:bg-white/90 dark:hover:bg-white/[0.12]"
                            : "text-emerald-700 dark:text-emerald-300 border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] hover:bg-white/90 dark:hover:bg-white/[0.12]",
                        ].join(" ")}
                      >
                        {c.is_active ? "Deactivate" : "Activate"}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(c.id)}
                          className="inline-flex items-center justify-center rounded-xl bg-white/70 dark:bg-white/[0.06] border border-white/40 dark:border-white/10 px-3 py-2 text-sm text-blue-600 dark:text-blue-300 hover:bg-white/90 dark:hover:bg-white/[0.12] transition"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => askDelete(c.id, c.code)}
                          className="inline-flex items-center justify-center rounded-xl bg-white/70 dark:bg-white/[0.06] border border-white/40 dark:border-white/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300 hover:bg-white/90 dark:hover:bg-white/[0.12] transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="backdrop-blur-2xl bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 rounded-2xl p-10 text-center">
            <TicketPercent className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
              No coupons yet
            </h3>
            <p className="text-slate-500 dark:text-slate-500 text-sm mb-4">
              Create your first coupon to get started.
            </p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(59,130,246,0.25)] transition hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4" />
              Create Coupon
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal (glass) */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-white/20 bg-white/70 dark:bg-white/[0.08] backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/20 bg-gradient-to-r from-white/60 to-white/40 dark:from-white/[0.06] dark:to-white/[0.04] px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {mode === "create" ? "Create New Coupon" : "Edit Coupon"}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {mode === "create"
                    ? "Fill the details below to create a new coupon."
                    : "Update the coupon details and save your changes."}
                </p>
              </div>

              {/* Toggle Active */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 dark:text-slate-300">Active</span>
                <GlassSwitch
                  checked={!!form.is_active}
                  onChange={(val) => handleChange("is_active", val)}
                />
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[72vh] overflow-y-auto px-6 py-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left */}
                <div className="space-y-4">
                  <Field label="Coupon Code" required>
                    <input
                      className="w-full rounded-2xl border border-white/30 bg-white/70 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/50"
                      value={form.code}
                      onChange={(e) => handleChange("code", e.target.value)}
                      placeholder="e.g. WELCOME50"
                    />
                  </Field>

                  <Field label="Description">
                    <textarea
                      className="w-full rounded-2xl border border-white/30 bg-white/70 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                      rows={3}
                      value={form.description ?? ""}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Short note about this coupon"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Type">
                      <select
                        className="w-full rounded-2xl border border-white/30 bg-white/70 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={form.type}
                        onChange={(e) => handleChange("type", e.target.value)}
                      >
                        <option value="coupon">Coupon</option>
                        <option value="giftcard">Giftcard</option>
                      </select>
                    </Field>

                    <Field label="Discount Type">
                      <select
                        className="w-full rounded-2xl border border-white/30 bg-white/70 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={normalizeDiscountType(form.discount_type)}
                        onChange={(e) => handleChange("discount_type", e.target.value)}
                      >
                        <option value="fixed">Fixed</option>
                        <option value="percentage">Percent</option>
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Discount Value" required>
                      <input
                        type="number"
                        className="w-full rounded-2xl border border-white/30 bg-white/70 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={String(form.discount_value ?? "")}
                        onChange={(e) => handleChange("discount_value", e.target.value)}
                        placeholder={
                          normalizeDiscountType(form.discount_type) === "percentage"
                            ? "e.g. 10 (%)"
                            : "e.g. 100 (₹)"
                        }
                      />
                    </Field>
                    <Field label="Max Discount">
                      <input
                        type="number"
                        className="w-full rounded-2xl border border-white/30 bg-white/70 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={String(form.max_discount ?? "")}
                        onChange={(e) => handleChange("max_discount", e.target.value)}
                        placeholder="Optional"
                      />
                    </Field>
                    <Field label="Min Order">
                      <input
                        type="number"
                        className="w-full rounded-2xl border border-white/30 bg-white/70 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={String(form.min_order_amount ?? "")}
                        onChange={(e) => handleChange("min_order_amount", e.target.value)}
                        placeholder="Optional"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Total Usage Limit">
                      <input
                        type="number"
                        className="w-full rounded-2xl border border-white/30 bg-white/70 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={String(form.usage_limit ?? "")}
                        onChange={(e) => handleChange("usage_limit", e.target.value)}
                        placeholder="∞ if blank"
                      />
                    </Field>
                    <Field label="Per User Limit">
                      <input
                        type="number"
                        className="w-full rounded-2xl border border-white/30 bg-white/70 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={String(form.usage_limit_per_user ?? "")}
                        onChange={(e) => handleChange("usage_limit_per_user", e.target.value)}
                        placeholder="∞ if blank"
                      />
                    </Field>
                  </div>
                </div>

                {/* Right */}
                <div className="space-y-4">
                  <Field label="Start Date">
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-white/30 bg-white/70 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/50"
                      value={
                        form.start_date ? moment(form.start_date as Date).format("YYYY-MM-DD") : ""
                      }
                      onChange={(e) =>
                        handleChange("start_date", e.target.value ? new Date(e.target.value) : null)
                      }
                    />
                  </Field>

                  <Field label="Expiry Date">
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-white/30 bg-white/70 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/50"
                      value={
                        form.expiry_date
                          ? moment(form.expiry_date as Date).format("YYYY-MM-DD")
                          : ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "expiry_date",
                          e.target.value ? new Date(e.target.value) : null
                        )
                      }
                    />
                  </Field>

                  <div className="rounded-2xl border border-white/30 bg-white/50 dark:bg-white/[0.04] p-4 text-sm text-slate-600 dark:text-slate-300">
                    <p className="mb-1 font-medium text-slate-800 dark:text-slate-200">Tips</p>
                    <ul className="list-disc space-y-1 pl-5">
                      <li>
                        Use <span className="font-semibold">percentage</span> for % discounts.
                      </li>
                      <li>
                        Leave limits empty for <span className="font-semibold">unlimited</span>{" "}
                        usage.
                      </li>
                      <li>Min order helps prevent misuse on tiny carts.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-white/20 bg-white/40 dark:bg-white/[0.04] px-6 py-4">
              <button
                className="inline-flex items-center justify-center rounded-xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/[0.12] transition"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(59,130,246,0.25)] transition hover:from-blue-700 hover:to-purple-700"
                onClick={handleSubmit}
              >
                {mode === "create" ? "Create Coupon" : "Update Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (glass) */}
      {confirmDel.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmDel({ open: false })}
          />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white/75 dark:bg-white/[0.08] backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
            <div className="border-b border-white/20 bg-gradient-to-r from-white/60 to-white/40 dark:from-white/[0.06] dark:to-white/[0.04] px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete coupon?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                This action cannot be undone. You’re about to delete{" "}
                <span className="font-semibold">{confirmDel.code || `#${confirmDel.id}`}</span>.
              </p>
            </div>

            <div className="px-6 py-5 text-sm text-slate-700 dark:text-slate-200">
              <ul className="list-disc space-y-1 pl-5">
                <li>Existing orders remain unaffected.</li>
                <li>Users will no longer be able to apply this code.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/20 bg-white/40 dark:bg-white/[0.04] px-6 py-4">
              <button
                className="inline-flex items-center justify-center rounded-xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/[0.12] transition"
                onClick={() => setConfirmDel({ open: false })}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(244,63,94,0.25)] transition hover:from-rose-700 hover:to-orange-700 disabled:opacity-60"
              >
                {loading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- tiny presentational bits ---------- */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function GlassSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-label="toggle active"
      onClick={() => onChange(!checked)}
      className={[
        "relative h-7 w-14 rounded-full border border-white/30 bg-white/60 dark:bg-white/[0.08] backdrop-blur-xl",
        "shadow-inner transition-colors",
        checked ? "ring-1 ring-emerald-400/40" : "ring-0",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform will-change-transform",
          checked ? "translate-x-7" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-medium text-slate-800 dark:text-slate-200">{value}</div>
    </div>
  );
}

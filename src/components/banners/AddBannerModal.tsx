"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import GlassModal from "@/components/GlassUI/GlassModal";
import { glass, cx } from "@/components/GlassUI/GlassKit";
import { uploadImage } from "@/upload";
import { useToast } from "@/components/Toast/ToastProvider";
import type { BannerType } from "../../types/banners";
import { aspectForType } from "./utils";
import { addBanner, updateBanner } from "@/app/banners/fetch";

export default function AddBannerModal({
    open,
    onClose,
    onSaved,
    types,
    editing,
}: {
    open: boolean;
    onClose: () => void;
    onSaved: () => Promise<void>;
    types: BannerType[];
    editing?: any | null; // pass existing banner or null
}) {
    const toast = useToast();
    const [form, setForm] = useState<any>({
        fromDate: "",
        toDate: "",
        bannerTypeId: "",
        bannerImage: null,
        isActive: true,
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (editing) {
            setForm({
                fromDate: editing.fromDate?.slice(0, 10) || "",
                toDate: editing.toDate?.slice(0, 10) || "",
                bannerTypeId: editing.bannerTypeId || "",
                bannerImage: editing.bannerImage || null,
                isActive: !!editing.isActive,
            });
            setPreview(editing.bannerImage || null);
        } else {
            setForm({
                fromDate: dayjs().format("YYYY-MM-DD"),
                toDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
                bannerTypeId: "",
                bannerImage: null,
                isActive: true,
            });
            setPreview(null);
        }
        setBusy(false);
    }, [open, editing]);

    const save = async () => {
        try {
            setBusy(true);
            const payload: any = { ...form };

            if (form.bannerImage instanceof File) {
                const up = await uploadImage(form.bannerImage, "images");
                if (!up?.success || !up?.path) throw new Error("Upload failed");
                payload.bannerImage = up.path;
            }

            if (editing) await updateBanner(editing.id, payload);
            else await addBanner(payload);

            toast("success", editing ? "Saved" : "Created", editing ? "Banner updated" : "Banner created");
            onClose();
            await onSaved();
        } catch (e: any) {
            toast("error", "Error", e?.message || "Save failed");
        } finally {
            setBusy(false);
        }
    };

    const selType = types.find((t) => String(t.id) === String(form.bannerTypeId));
    const { w, h } = aspectForType(selType);

    return (
        <GlassModal open={open} onClose={onClose} title={editing ? "Edit Banner" : "Add Banner"}>
            <form
                className="grid gap-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    save();
                }}
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">From Date</span>
                        <input
                            type="date"
                            value={form.fromDate}
                            onChange={(e) => setForm((s: any) => ({ ...s, fromDate: e.target.value }))}
                            className={glass.input}
                            required
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">To Date</span>
                        <input
                            type="date"
                            value={form.toDate}
                            onChange={(e) => setForm((s: any) => ({ ...s, toDate: e.target.value }))}
                            className={glass.input}
                            required
                        />
                    </label>
                </div>

                <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Banner Type</span>
                    <select
                        value={form.bannerTypeId}
                        onChange={(e) => setForm((s: any) => ({ ...s, bannerTypeId: Number(e.target.value) }))}
                        className={glass.input}
                        required
                    >
                        <option value="">Select type</option>
                        {types.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}{t.dimensions ? ` — ${t.dimensions}` : ""}
                            </option>
                        ))}
                    </select>
                </label>

                {/* Preview frame respects selected type ratio */}
                <div className="space-y-2">
                    <div
                        className="relative w-full rounded-xl overflow-hidden border border-white/30"
                        style={{ aspectRatio: `${w} / ${h}` }}
                    >
                        {preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={typeof preview === "string" ? preview : ""} alt="preview" className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 grid place-items-center text-xs text-slate-500">No image</div>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                                setForm((s: any) => ({ ...s, bannerImage: f }));
                                setPreview(URL.createObjectURL(f));
                            }
                        }}
                    />
                </div>

                <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Set Active</span>
                    <input
                        type="checkbox"
                        checked={!!form.isActive}
                        onChange={(e) => setForm((s: any) => ({ ...s, isActive: e.target.checked }))}
                    />
                </div>

                <div className="mt-2 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className={cx(glass.btnSecondary, "rounded-xl h-9 px-3 text-sm font-medium")}>
                        Cancel
                    </button>
                    <button type="submit" disabled={busy} className={cx(glass.btnPrimary, "rounded-xl h-9 px-3 text-sm font-medium")}>
                        {busy ? "Saving…" : editing ? "Save Changes" : "Create"}
                    </button>
                </div>
            </form>
        </GlassModal>
    );
}

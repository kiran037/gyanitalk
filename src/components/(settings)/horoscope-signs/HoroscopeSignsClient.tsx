"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/components/Toast/ToastProvider";
import { gethororscope, updatehororscope } from "@/app/(settings)/horoscope-signs/fetch";
import { uploadImage } from "@/upload";
import { Edit3, X, Save, Upload } from "lucide-react";

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------ */
const buildImgSrc = (val?: string) => {
    if (!val) return "/placeholder.svg";
    if (/^(blob:|data:|https?:\/\/)/i.test(val)) return val;
    return `${process.env.NEXT_PUBLIC_BASEURL || ""}${val}`;
};

/* ------------------------------------------------------------------
   Reusable Glass Components
------------------------------------------------------------------ */
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 shadow-lg backdrop-blur-xl transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${className}`}>
        {children}
    </div>
);

const GlowButton = ({
    children,
    onClick,
    variant = "primary",
    size = "md",
    disabled,
    loading,
    icon: Icon,
    className = "",
    type = "button",
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md";
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ElementType;
    className?: string;
    type?: "button" | "submit";
}) => {
    const variants = {
        primary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700",
        secondary: "bg-white/80 dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 hover:bg-white",
        ghost: "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-700/50",
    };
    const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm" };
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`inline-flex items-center gap-2 font-medium rounded-lg transition-all ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.04]"} ${className}`}
        >
            {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : Icon ? <Icon size={14} /> : null}
            {children}
        </button>
    );
};

function GlassModal({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}) {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center px-4 py-8"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                ref={ref}
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl"
            >
                <div className="flex items-center justify-between border-b border-white/20 px-5 py-4">
                    <h3 className="text-sm font-semibold dark:text-white">{title}</h3>
                    <GlowButton variant="ghost" size="sm" onClick={onClose} icon={X}>
                        <span className="sr-only">Close</span>
                    </GlowButton>

                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------
   Main Component
------------------------------------------------------------------ */
export default function HoroscopeSignsClient() {
    const toast = useToast();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState<string>("");
    const [editFile, setEditFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await gethororscope();
        setProfiles(res?.hororscope || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const openEditor = (item: any) => {
        setEditingId(item.id);
        setEditingName(item.name);
        setPreview(buildImgSrc(item.image));
    };

    const resetEditor = () => {
        setEditingId(null);
        setEditingName("");
        setEditFile(null);
        setPreview(null);
        setSaving(false);
    };

    const handleFile = (e: any) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setEditFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const save = async () => {
        if (!editingId) return;

        try {
            setSaving(true);
            let path: string | undefined;

            if (editFile) {
                const up = await uploadImage(editFile, "images");
                path = up.path;
            } else {
                path = preview?.replace(process.env.NEXT_PUBLIC_BASEURL || "", "");
            }

            const res = await updatehororscope(editingId, path);
            if (res?.status) {
                toast("success", "Updated", "Profile updated");
                resetEditor();
                load();
            } else toast("error", "Failed", res?.message || "Please retry");
        } catch (e: any) {
            toast("error", "Error", e?.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen grid place-content-center dark:bg-slate-950 text-white">
                Loading…
            </main>
        );
    }

    return (
        <main className="min-h-screen px-6 py-10 bg-gray-50 dark:bg-slate-950">
            <div className="mx-auto max-w-7xl space-y-10">
                <div className="text-center">
                    <h1 className="text-3xl font-bold dark:text-white">Horoscope Signs</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Update zodiac icons & images
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {profiles.map((p) => (
                        <GlassCard key={p.id} className="py-6 flex flex-col items-center">
                            <img
                                src={buildImgSrc(p.image)}
                                alt={p.name}
                                className="h-20 w-20 rounded-xl object-cover shadow border border-white/10"
                            />
                            <p className="mt-3 text-sm font-medium dark:text-white">{p.name}</p>

                            <GlowButton size="sm" variant="secondary" className="mt-4" icon={Edit3} onClick={() => openEditor(p)}>
                                Edit
                            </GlowButton>
                        </GlassCard>
                    ))}
                </div>
            </div>

            <GlassModal open={editingId !== null} onClose={resetEditor} title={`Edit ${editingName}`}>
                <div className="flex flex-col gap-5">
                    <div className="flex gap-4 items-center">
                        <img
                            src={preview || "/placeholder.svg"}
                            className="h-24 w-24 rounded-xl object-cover border border-white/10 shadow"
                        />
                        <label className="cursor-pointer inline-flex items-center gap-2 text-xs">
                            <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
                            <div className="px-3 py-2 bg-white/90 dark:bg-slate-700/60 rounded-lg border border-white/20">
                                <Upload size={14} /> Select
                            </div>
                        </label>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex justify-end gap-2">
                        <GlowButton variant="ghost" icon={X} onClick={resetEditor}>
                            Cancel
                        </GlowButton>
                        <GlowButton
                            variant="primary"
                            icon={!saving ? Save : undefined}
                            onClick={save}
                            disabled={saving}
                            loading={saving}
                        >
                            {saving ? "Saving..." : "Save"}
                        </GlowButton>
                    </div>
                </div>
            </GlassModal>
        </main>
    );
}

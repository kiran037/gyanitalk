
// app/(astrologers)/astrologers/AstrologersClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Search,
    Eye,
    WifiIcon,
    WifiOffIcon,
    User,
    UserRound,
    CheckCircle2,
    CircleOff,
    X,
    ArrowDownUp, // sort glyph
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast/ToastProvider";
import { updateLiveStatus, updateVerifyStatus } from "@/app/(astrologers)/astrologers/fetch";
import CircleAvatar from "@/components/CircleAvatar";

/* ---------- helpers (match Customers) ---------- */
const ensureAbs = (p?: string) =>
    p ? `${process.env.NEXT_PUBLIC_BASEURL}${p.startsWith("/") ? "" : "/"}${p}` : "";
const avatar = (p?: string) =>
    ensureAbs(p) || "https://gyanitalk.com/build/assets/images/person.png";

const buildPageHref = ({
    page,
    search,
    isVerified,
    sortBy,
    sortOrder,
}: {
    page: number;
    search?: string | null;
    isVerified?: string | null;
    sortBy?: string | null;
    sortOrder?: "asc" | "desc" | null;
}) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);
    if (isVerified) params.set("isVerified", isVerified);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);
    return `?${params.toString()}`;
};

const StatusPill = ({ on, label }: { on: boolean; label: string }) => (
    <span
        className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
            on
                ? "border-emerald-300/60 dark:border-emerald-800/40 bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                : "border-rose-300/60 dark:border-rose-800/40 bg-rose-100/60 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
        )}
    >
        {on ? <WifiIcon className="h-3.5 w-3.5" /> : <WifiOffIcon className="h-3.5 w-3.5" />}
        {label}
    </span>
);

/* ---------- tiny toggles (glass, optimistic, useToast) ---------- */
function LiveStatusToggle({ id, isOn }: { id: number; isOn: boolean }) {
    const toast = useToast();
    const [on, setOn] = useState(!!isOn);
    const [busy, setBusy] = useState(false);

    const toggle = async () => {
        if (busy) return;
        const next = !on;
        setOn(next); // optimistic
        setBusy(true);
        try {
            // API expects isLiveOff: 0 (on) | 1 (off)
            await updateLiveStatus({ id, isLiveOff: next ? 0 : 1 });
            toast("warning", "Live Status", next ? "Now LIVE" : "Set to OFFLINE");
        } catch {
            setOn(!next);
            toast("error", "Error", "Failed to update live status.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            type="button"
            aria-pressed={on}
            title="Toggle Live"
            disabled={busy}
            onClick={toggle}
            className={cn(
                "relative h-7 w-12 rounded-full border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl shadow-inner transition",
                busy ? "opacity-70 cursor-wait" : "hover:bg-white/80 dark:hover:bg-white/[0.12]",
                on ? "ring-1 ring-emerald-400/40" : "ring-0"
            )}
        >
            <span
                className={cn(
                    "absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform will-change-transform",
                    on ? "translate-x-5" : "translate-x-0"
                )}
            />
            <span
                className={cn(
                    "absolute right-1 top-1.5 h-3 w-3 rounded-full shadow-[0_0_10px_currentColor]",
                    on ? "bg-emerald-500/80" : "bg-rose-500/80"
                )}
            />
        </button>
    );
}

function VerifiedToggle({ id, isVerified }: { id: number; isVerified: boolean }) {
    const toast = useToast();
    const [verified, setVerified] = useState(!!isVerified);
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);

    const confirm = async () => {
        if (busy) return;
        setBusy(true);
        const next = !verified;
        try {
            await updateVerifyStatus({ id, isVerified: next });
            setVerified(next);
            toast("warning", "Verification", next ? "Astrologer verified" : "Astrologer unverified");
            setOpen(false);
        } catch {
            toast("error", "Error", "Failed to update verification.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                    "bg-white/70 dark:bg-white/[0.06] border-white/30 dark:border-white/10",
                    verified ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"
                )}
            >
                {verified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleOff className="h-3.5 w-3.5" />}
                {verified ? "Verified" : "Unverified"}
            </button>

            {open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !busy && setOpen(false)} />
                    <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-white/20 bg-white/70 dark:bg-white/[0.08] backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
                        <div className="flex items-center justify-between border-b border-white/20 bg-white/60 dark:bg-white/[0.06] px-4 py-3">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                {verified ? "Unverify Astrologer?" : "Verify Astrologer?"}
                            </h3>
                            <button
                                className="rounded-lg p-1 text-slate-500 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/[0.08]"
                                onClick={() => !busy && setOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                            Are you sure you want to {verified ? "unverify" : "verify"} this astrologer?
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-white/20 bg-white/50 dark:bg-white/[0.05] px-4 py-3">
                            <button
                                onClick={() => !busy && setOpen(false)}
                                className="inline-flex items-center justify-center rounded-lg border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/[0.12] transition disabled:opacity-50"
                                disabled={busy}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirm}
                                disabled={busy}
                                className={cn(
                                    "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition disabled:opacity-50",
                                    verified
                                        ? "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
                                        : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                                )}
                            >
                                {busy ? "Updating…" : verified ? "Unverify" : "Verify"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* ---------- main client ---------- */
export default function AstrologersClient({
    data,
    totalPages,
    currentPage,
    search,
    isVerified,
    sortBy,
    sortOrder,
}: {
    data: any[];
    totalPages: number;
    currentPage: number;
    search?: string;
    isVerified?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}) {
    const toast = useToast();

    useEffect(() => {
        if (data.length === 0 && (search || isVerified)) {
            toast("warning", "No Results", "Try adjusting your search filters.");
        }
    }, [data.length, search, isVerified, toast]);

    // helpers for sort links (mirror old table behavior)
    const nextOrder = (key: "chatStatus" | "callStatus") =>
        sortBy === key && sortOrder === "asc" ? "desc" : "asc";

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
            {/* Ambient glows (same as Customers) */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -right-40 w-[24rem] h-[24rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-[26rem] h-[26rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[46rem] h-[18rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl animate-pulse delay-700" />
            </div>

            <div className="relative w-full mx-auto p-6 md:p-8 space-y-6">

                {/* Header / Filters */}
                <div className="backdrop-blur-2xl supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-white/10 bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent pointer-events-none" />
                    <div className="relative flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="inline-flex w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="inline-flex w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-200" />
                                    <span className="inline-flex w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-500" />
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
                                    Astrologer Management
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Monitor availability, verification, and engagement
                                </p>
                            </div>

                            {/* Sort controls (Chat/Call with asc/desc) */}
                            <div className="flex items-center gap-2">
                                <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">Sort by</span>

                                <Link
                                    href={buildPageHref({
                                        page: 1,
                                        search: search ?? null,
                                        isVerified: isVerified ?? null,
                                        sortBy: "chatStatus",
                                        sortOrder: nextOrder("chatStatus"),
                                    })}
                                    className={cn(
                                        "inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-medium transition",
                                        "bg-white/60 dark:bg-white/[0.06] border-white/30 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/[0.12]",
                                        sortBy === "chatStatus" ? "ring-1 ring-blue-400/50" : ""
                                    )}
                                    title={`Chat ${nextOrder("chatStatus").toUpperCase()}`}
                                >
                                    <ArrowDownUp className="h-3.5 w-3.5" />
                                    Chat {sortBy === "chatStatus" ? `(${sortOrder})` : ""}
                                </Link>

                                <Link
                                    href={buildPageHref({
                                        page: 1,
                                        search: search ?? null,
                                        isVerified: isVerified ?? null,
                                        sortBy: "callStatus",
                                        sortOrder: nextOrder("callStatus"),
                                    })}
                                    className={cn(
                                        "inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-medium transition",
                                        "bg-white/60 dark:bg-white/[0.06] border-white/30 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/[0.12]",
                                        sortBy === "callStatus" ? "ring-1 ring-blue-400/50" : ""
                                    )}
                                    title={`Call ${nextOrder("callStatus").toUpperCase()}`}
                                >
                                    <ArrowDownUp className="h-3.5 w-3.5" />
                                    Call {sortBy === "callStatus" ? `(${sortOrder})` : ""}
                                </Link>
                            </div>
                        </div>

                        {/* GET filters */}
                        <form method="get" className="flex flex-wrap items-center gap-3">
                            <div className="relative min-w-[240px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    name="search"
                                    defaultValue={search}
                                    placeholder="Search astrologers…"
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl border-white/30 dark:border-white/10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition"
                                />
                            </div>

                            <select
                                name="isVerified"
                                defaultValue={isVerified}
                                className="px-3 py-2 text-sm rounded-xl border bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl border-white/30 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition"
                            >
                                <option value="">All statuses</option>
                                <option value="true">Verified</option>
                                <option value="false">Unverified</option>
                            </select>

                            {/* preserve sort params on submit via hidden inputs */}
                            {sortBy && <input type="hidden" name="sortBy" value={sortBy} />}
                            {sortOrder && <input type="hidden" name="sortOrder" value={sortOrder} />}

                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-[0_8px_20px_rgba(59,130,246,0.25)] transition"
                            >
                                <Search className="h-4 w-4" />
                                Apply
                            </button>
                        </form>
                    </div>
                </div>

                {/* List (glass rows, Customers density) */}
                <div className="space-y-3">
                    {data.length === 0 ? (
                        <div className="backdrop-blur-2xl bg-white/50 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 rounded-2xl p-8 text-center">
                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-3" />
                            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                No astrologers found
                            </h3>
                            <p className="text-slate-500 dark:text-slate-500 text-sm">
                                Try adjusting search/filters
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {data.map((a: any, idx: number) => {
                                const liveOn = a.livekey === "Online" || a.isLiveOff === 0;
                                const chatOn = a.chatStatus === "Online";
                                const callOn = a.callStatus === "Online";

                                return (
                                    <div
                                        key={a.id ?? idx}
                                        className="group relative overflow-hidden backdrop-blur-2xl bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 rounded-2xl p-4 shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.45)] transition-all hover:-translate-y-0.5"
                                    >
                                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10 flex items-center justify-between gap-4">
                                            {/* avatar + identity (ALWAYS circular) */}
                                            <Link href={`/astrologers/${a.id}`} className="flex items-center gap-4 min-w-0">
                                                <div className="relative">
                                                    <CircleAvatar
                                                        src={avatar(a?.profileImage)}
                                                        alt={`${a.name || "Astrologer"} Avatar`}
                                                        size={48}
                                                    />
                                                </div>
                                                <div className="space-y-0.5 min-w-0">
                                                    <h3 className="font-semibold truncate text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                        {a.name || "Unnamed"}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                        {a.email && <span className="truncate max-w-[220px]">{a.email}</span>}
                                                        {a.gender && (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] px-1.5 py-0.5">
                                                                {a.gender === "Male" ? (
                                                                    <>
                                                                        <User className="h-3.5 w-3.5 text-blue-500" /> Male
                                                                    </>
                                                                ) : a.gender === "Female" ? (
                                                                    <>
                                                                        <UserRound className="h-3.5 w-3.5 text-pink-500" /> Female
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserRound className="h-3.5 w-3.5 text-purple-500" /> {a.gender}
                                                                    </>
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>

                                            {/* meta (md+) */}
                                            <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
                                                        Contact
                                                    </p>
                                                    <p
                                                        className="text-sm text-slate-700 dark:text-slate-300 truncate cursor-pointer"
                                                        title="Click to copy"
                                                        onClick={() => {
                                                            if (!a.contactNo) return;
                                                            navigator.clipboard
                                                                .writeText(a.contactNo)
                                                                .then(() => toast("warning", "Copied", "Contact number copied."))
                                                                .catch(() => toast("error", "Error", "Could not copy."));
                                                        }}
                                                    >
                                                        {a.contactNo || "—"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
                                                        Requests
                                                    </p>
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        <span className="font-semibold">{a.totalCallRequest || 0}</span> Call
                                                        <span className="mx-1 text-slate-400">/</span>
                                                        <span className="font-semibold">{a.totalChatRequest || 0}</span> Chat
                                                    </p>
                                                </div>

                                                <div className="min-w-[190px]">
                                                    <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
                                                        Status
                                                    </p>
                                                    <div className="flex items-center gap-1.5">
                                                        <StatusPill on={liveOn} label="Live" />
                                                        <StatusPill on={chatOn} label="Chat" />
                                                        <StatusPill on={callOn} label="Call" />
                                                    </div>
                                                </div>

                                                <div className="min-w-[130px]">
                                                    <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
                                                        Verification
                                                    </p>
                                                    <VerifiedToggle id={a.id} isVerified={a.isVerified} />
                                                </div>
                                            </div>

                                            {/* action */}
                                            <div className="shrink-0 flex items-center gap-2">
                                                <Link
                                                    href={`/astrologers/${a.id}`}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-blue-700 dark:text-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/35 dark:hover:to-indigo-900/35 transition"
                                                    title="View"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </Link>
                                                <LiveStatusToggle id={a.id} isOn={liveOn} />
                                            </div>
                                        </div>

                                        {/* mobile meta */}
                                        <div className="md:hidden mt-3 pt-3 border-t border-white/40 dark:border-white/10">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
                                                        Contact
                                                    </p>
                                                    <p className="font-medium text-slate-700 dark:text-slate-300">
                                                        {a.contactNo || "—"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
                                                        Requests
                                                    </p>
                                                    <p className="font-medium text-slate-700 dark:text-slate-300">
                                                        {(a.totalCallRequest || 0)}/{a.totalChatRequest || 0}
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
                                                        Status
                                                    </p>
                                                    <div className="flex items-center gap-1.5">
                                                        <StatusPill on={liveOn} label="Live" />
                                                        <StatusPill on={chatOn} label="Chat" />
                                                        <StatusPill on={callOn} label="Call" />
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
                                                        Verification
                                                    </p>
                                                    <VerifiedToggle id={a.id} isVerified={a.isVerified} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination (preserves sort like old table) */}
                {totalPages > 1 && (
                    <div className="backdrop-blur-2xl bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 rounded-2xl p-4 shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Page {currentPage} of {totalPages}
                            </p>

                            <div className="flex items-center gap-1">
                                {currentPage > 1 && (
                                    <Link
                                        href={buildPageHref({
                                            page: currentPage - 1,
                                            search: search ?? null,
                                            isVerified: isVerified ?? null,
                                            sortBy: sortBy ?? null,
                                            sortOrder: sortOrder ?? null,
                                        })}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/[0.09] transition"
                                    >
                                        ‹ Prev
                                    </Link>
                                )}

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => {
                                        const pageNum = i + 1;
                                        const isCurrent = pageNum === currentPage;
                                        const show =
                                            pageNum <= 3 ||
                                            pageNum === totalPages ||
                                            pageNum === currentPage ||
                                            pageNum === currentPage - 1 ||
                                            pageNum === currentPage + 1;

                                        if (!show) {
                                            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                                return (
                                                    <span key={i} className="px-1 text-slate-400 text-sm">
                                                        …
                                                    </span>
                                                );
                                            }
                                            return null;
                                        }

                                        return (
                                            <Link
                                                key={i}
                                                href={buildPageHref({
                                                    page: pageNum,
                                                    search: search ?? null,
                                                    isVerified: isVerified ?? null,
                                                    sortBy: sortBy ?? null,
                                                    sortOrder: sortOrder ?? null,
                                                })}
                                                className={cn(
                                                    "w-8 h-8 flex items-center justify-center rounded-xl font-medium transition text-sm",
                                                    isCurrent
                                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                                                        : "bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/[0.09]"
                                                )}
                                            >
                                                {pageNum}
                                            </Link>
                                        );
                                    })}
                                </div>

                                {currentPage < totalPages && (
                                    <Link
                                        href={buildPageHref({
                                            page: currentPage + 1,
                                            search: search ?? null,
                                            isVerified: isVerified ?? null,
                                            sortBy: sortBy ?? null,
                                            sortOrder: sortOrder ?? null,
                                        })}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/[0.09] transition"
                                    >
                                        Next ›
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

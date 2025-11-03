"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format, isSameDay } from "date-fns";
import { getConversation, sendChatMessage } from "@/components/conversation/fetch";
import { Send, Sparkles, Wand2 } from "lucide-react";

export interface Chat {
    name?: string;
    message: string;
    messageId?: string;
    sender_id: string;
    receiver_id?: string;
    replymsg?: string;
    createdAt: string;
}

type SenderRole = "user" | "astro";

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

// Make absolute only if it isn't already
const ensureAbs = (p?: string) => {
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    const base = (process.env.NEXT_PUBLIC_BASEURL || "").replace(/\/+$/, "");
    const path = p.startsWith("/") ? p : `/${p}`;
    return `${base}${path}`;
};

const avatarUrl = (p?: string) =>
    ensureAbs(p) || "https://gyanitalk.com/build/assets/images/person.png";

const glass = {
    panel:
        "rounded-3xl border border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/[0.06] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.10)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
    chip:
        "px-3 py-1 rounded-full text-[11px] font-medium text-slate-700 dark:text-slate-200 border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/10 backdrop-blur",
    bubbleIncoming:
        "max-w-[78%] rounded-2xl rounded-tl-md border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl text-slate-900 dark:text-slate-100 shadow",
    bubbleOutgoing:
        "max-w-[78%] rounded-2xl rounded-tr-md border border-white/40 dark:border-white/10 bg-gradient-to-br from-indigo-500/80 to-purple-500/80 text-white backdrop-blur-xl shadow",
    input:
        "w-full h-12 px-4 rounded-xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50",
    iconBtn:
        "inline-flex items-center justify-center rounded-xl h-10 w-10 border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl hover:bg-white/90 dark:hover:bg-white/[0.12] transition",
    sendBtn:
        "inline-flex items-center gap-2 rounded-xl h-10 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition",
    roleBtn:
        "flex items-center gap-2 px-2.5 h-10 rounded-xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/[0.08] hover:bg-white/80 dark:hover:bg-white/[0.14] transition",
    roleBtnActive:
        "ring-2 ring-indigo-400/50 bg-white/90 dark:bg-white/20",
};

const truncate = (t?: string | null, n = 18) => (t ? (t.length > n ? t.slice(0, n) + "…" : t) : "");

function DateSeparator({ date }: { date: Date }) {
    return (
        <div className="flex items-center justify-center my-4">
            <span className={glass.chip}>{format(date, "EEEE, MMM d")}</span>
        </div>
    );
}

function TinyAvatar({ src, alt }: { src?: string; alt: string }) {
    return (
        <img
            src={avatarUrl(src)}
            alt={alt}
            className="h-6 w-6 rounded-full ring-2 ring-white/70 dark:ring-white/10 object-cover"
        />
    );
}

function MessageBubble({
    chat,
    isFromUser,
    userName,
    userProfile,
    astroName,
    astroProfile,
}: {
    chat: Chat;
    isFromUser: boolean;
    userName?: string | null;
    userProfile?: string | null;
    astroName?: string | null;
    astroProfile?: string | null;
}) {
    const isEndedChat = (chat.message || "").toLowerCase().includes("ended chat");
    const time = format(new Date(chat.createdAt), "hh:mm a");
    const whoName = isFromUser ? (userName || "User") : (astroName || "Astrologer");
    const whoProfile = isFromUser ? userProfile || undefined : astroProfile || undefined;

    if (isEndedChat) {
        return (
            <div className="w-full flex justify-center my-2">
                <div className={cx(glass.chip, "bg-amber-500/20 text-amber-900 dark:text-amber-100 border-amber-500/30")}>
                    {chat.message}
                </div>
            </div>
        );
    }

    return (
        <div className={cx("flex mb-3 gap-2", isFromUser ? "justify-end" : "justify-start")}>
            {!isFromUser && (
                <div className="mt-5">
                    <TinyAvatar src={whoProfile} alt={whoName} />
                </div>
            )}
            <div className={cx(isFromUser ? glass.bubbleOutgoing : glass.bubbleIncoming, "px-4 py-2 relative")}>
                <div className={cx("text-[11px] mb-0.5 opacity-80", isFromUser ? "text-white text-right" : "text-slate-600 dark:text-slate-300")}>
                    {whoName}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{chat.message}</p>
                <div className={cx("mt-1 text-[10px] opacity-70", isFromUser ? "text-white text-right" : "text-slate-600 dark:text-slate-300 text-left")}>
                    {time}
                </div>
            </div>
            {isFromUser && (
                <div className="mt-5">
                    <TinyAvatar src={whoProfile} alt={whoName} />
                </div>
            )}
        </div>
    );
}

export default function ChatView({ chatId }: { chatId: string }) {
    const [messages, setMessages] = useState<Chat[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [astroId, setAstroId] = useState<number | null>(null);
    const [userMeta, setUserMeta] = useState<{ name?: string | null; profile?: string | null }>({});
    const [astroMeta, setAstroMeta] = useState<{ name?: string | null; profile?: string | null }>({});
    const [newMessage, setNewMessage] = useState("");
    const [initialLoading, setInitialLoading] = useState(true);
    const [role, setRole] = useState<SenderRole>("user"); // send-as toggle

    const endRef = useRef<HTMLDivElement | null>(null);
    const scrollToBottom = (smooth = true) => endRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });

    useEffect(() => { scrollToBottom(false); }, []);
    useEffect(() => { scrollToBottom(true); }, [messages]);

    // Load conversation & identities
    useEffect(() => {
        if (!chatId) return;
        let cancelled = false;
        (async () => {
            try {
                setInitialLoading(true);
                const data = await getConversation(chatId);
                if (cancelled) return;

                const normalized = (data?.conversation ?? []).map((msg: any) => ({
                    ...msg,
                    sender_id: String(msg.sender_id),
                    receiver_id: msg.receiver_id != null ? String(msg.receiver_id) : undefined,
                })) as Chat[];

                setMessages(normalized.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)));
                setUserId(data?.userId ?? null);
                setAstroId(data?.astroId ?? null);
                setUserMeta({ name: data?.user?.name ?? null, profile: data?.user?.profile ?? null });
                setAstroMeta({ name: data?.astro?.name ?? null, profile: data?.astro?.profile ?? null });
            } finally {
                if (!cancelled) setInitialLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [chatId]);

    // Poll for new messages
    useEffect(() => {
        if (!chatId) return;
        const tick = async () => {
            try {
                const data = await getConversation(chatId);
                if (!data?.conversation?.length) return;
                setMessages((prev) => {
                    const byId = new Set(prev.map((m) => m.messageId));
                    const newcomers = (data.conversation as any[])
                        .filter((m) => m.messageId && !byId.has(m.messageId))
                        .map((m) => ({
                            ...m,
                            sender_id: String(m.sender_id),
                            receiver_id: m.receiver_id != null ? String(m.receiver_id) : undefined,
                        })) as Chat[];
                    if (!newcomers.length) return prev;
                    return [...prev, ...newcomers].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
                });
            } catch { }
        };
        tick();
        const int = setInterval(tick, 10_000);
        return () => clearInterval(int);
    }, [chatId]);

    const canSend = Boolean(userId && astroId);

    const handleSend = async () => {
        if (!newMessage.trim() || !userId || !astroId) return;

        const sendAsUser = role === "user";
        const _sender = sendAsUser ? userId : astroId;
        const _receiver = sendAsUser ? astroId : userId;

        const messageId = `${Date.now()}-${Math.random()}`;
        const localMessage: Chat = {
            messageId,
            message: newMessage.trim(),
            sender_id: String(_sender),
            receiver_id: String(_receiver),
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, localMessage]);
        setNewMessage("");

        try {
            await sendChatMessage(chatId, _sender, _receiver, localMessage.message, messageId);
        } catch {
            // keep optimistic message; real-time poll will reconcile
        }
    };

    // Group messages by day
    const grouped = useMemo(() => {
        const out: { date: Date; items: Chat[] }[] = [];
        let lastDate: Date | null = null;
        for (const m of messages) {
            const d = new Date(m.createdAt);
            if (!lastDate || !isSameDay(d, lastDate)) {
                out.push({ date: d, items: [m] });
                lastDate = d;
            } else {
                out[out.length - 1].items.push(m);
            }
        }
        return out;
    }, [messages]);

    const astroName = astroMeta.name || "Astrologer";
    const userName = userMeta.name || "User";

    return (
        <div className="relative h-full">
            {/* OUTER PANEL ensures only middle scrolls */}
            <div className={cx(glass.panel, "p-0 overflow-hidden h-full min-h-[60vh] flex flex-col")}>
                {/* Sticky Top Bar — ONLY names + "chat:" */}
                {/* Sticky Top Bar — names with roles appended */}
                <div className="sticky top-0 z-10 px-4 py-3 border-b border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/[0.05] backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-3">
                        {/* Left: Astro identity (avatar + name + role) */}
                        <div className="flex items-center gap-3 min-w-0">
                            <img
                                src={avatarUrl(astroMeta.profile || undefined)}
                                alt={astroName}
                                className="h-9 w-9 rounded-2xl object-cover ring-2 ring-white/70 dark:ring-white/10"
                            />
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                    {truncate(astroName, 22)}
                                    <span className="ml-1 align-middle text-[11px] font-medium text-slate-600 dark:text-slate-300">
                                        Astrologer
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Center: Title */}
                        <div className="hidden md:flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 grid place-items-center text-white">
                                <Wand2 className="h-5 w-5" />
                            </div>
                            <div className="text-[13px] font-medium truncate max-w-[36ch]">
                                {truncate(astroName, 18)} and {truncate(userName, 18)} chat:
                            </div>
                            <div className="text-[11px] opacity-70 ml-2">{chatId}</div>
                        </div>
                        {/* Right: User identity (name + role + avatar) */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="min-w-0 text-right">
                                <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                    {truncate(userName, 22)}
                                    <span className="ml-1 align-middle text-[11px] font-medium text-slate-600 dark:text-slate-300">
                                        User
                                    </span>
                                </div>
                            </div>
                            <img
                                src={avatarUrl(userMeta.profile || undefined)}
                                alt={userName}
                                className="h-9 w-9 rounded-2xl object-cover ring-2 ring-white/70 dark:ring-white/10"
                            />
                        </div>
                    </div>
                </div>
                {/* Scrollable Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {initialLoading ? (
                        <div className="space-y-3">
                            <div className="w-2/3 h-14 rounded-2xl bg-white/50 dark:bg-white/10 animate-pulse" />
                            <div className="w-1/2 h-14 rounded-2xl bg-white/50 dark:bg-white/10 animate-pulse ml-auto" />
                        </div>
                    ) : !messages.length ? (
                        <div className="flex flex-col items-center justify-center text-center py-12">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow mb-3">
                                <Sparkles className="h-7 w-7" />
                            </div>
                            <div className="text-slate-700 dark:text-slate-200 font-medium">No messages yet</div>
                            <div className="text-slate-500 dark:text-slate-400 text-sm mt-1">Start the conversation below.</div>
                        </div>
                    ) : (
                        grouped.map(({ date, items }, idx) => (
                            <div key={idx}>
                                <DateSeparator date={date} />
                                {items.map((chat) => {
                                    const isFromUser =
                                        userId != null && Number(chat.sender_id) === Number(userId);
                                    const key = chat.messageId ?? `${chat.createdAt}-${Math.random()}`;
                                    return (
                                        <MessageBubble
                                            key={key}
                                            chat={chat}
                                            isFromUser={isFromUser}
                                            userName={userMeta.name}
                                            userProfile={userMeta.profile}
                                            astroName={astroMeta.name}
                                            astroProfile={astroMeta.profile}
                                        />
                                    );
                                })}
                            </div>
                        ))
                    )}
                    <div ref={endRef} />
                </div>

                {/* Sticky Composer (unchanged UX) */}
                <div className="border-top border-white/40 dark:border-white/10 bg-gradient-to-r from-white/60 to-white/40 dark:from-white/[0.06] dark:to-white/[0.03] backdrop-blur-xl px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Quick reply */}
                        <button
                            type="button"
                            className={glass.iconBtn}
                            title="Insert quick reply"
                            onClick={() => setNewMessage((s) => (s ? s : "Hello 👋"))}
                        >
                            <Sparkles className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                        </button>
                        {/* Send-as segmented control with avatars (Astro first) */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setRole("astro")}
                                className={cx(glass.roleBtn, role === "astro" && glass.roleBtnActive)}
                                title="Send as Astrologer"
                            >
                                <TinyAvatar src={astroMeta.profile || undefined} alt={astroName} />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-100">
                                    {truncate(astroName, 12) || "Astrologer"}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("user")}
                                className={cx(glass.roleBtn, role === "user" && glass.roleBtnActive)}
                                title="Send as User"
                            >
                                <TinyAvatar src={userMeta.profile || undefined} alt={userName} />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-100">
                                    {truncate(userName, 12) || "User"}
                                </span>
                            </button>
                        </div>

                        {/* Input + Send */}
                        <div className="flex-1 min-w-[200px] flex items-center gap-2">
                            <input
                                type="text"
                                placeholder={`Message as ${role === "astro" ? (astroName || "Astrologer") : (userName || "User")}…`}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className={glass.input}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!canSend || !newMessage.trim()}
                                className={cx(
                                    glass.sendBtn,
                                    (!canSend || !newMessage.trim()) && "opacity-60 cursor-not-allowed"
                                )}
                                title={!canSend ? "IDs not loaded yet" : `Send as ${role === "astro" ? "Astrologer" : "User"}`}
                            >
                                <Send className="h-4 w-4" />
                                <span className="hidden sm:inline">Send</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

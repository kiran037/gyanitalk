
"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import {
  getUserSummary,
  getUserChatHistoryOnly,
  getUserCallHistoryOnly,
  getUserOrdersOnly,
  getUserWalletTransactionsOnly,
  getUserFollowersOnly,
  getUserNotificationsOnly,
  getUserGiftsOnly,
  updateUserDetails,
} from "@/app/customers/fetch";
import { AstrologerSkeleton as Skeleton } from "@/components/(astros)/astrologers/astrologer-skeleton";
import { uploadImage } from "@/upload";
import {
  Camera, Edit3, Phone, MapPin, Calendar, Clock, Gift, Bell, Users,
  ShoppingBag, Wallet, X, Save, User as UserIcon, Heart,
} from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";

/** Dynamic-import heavy tab components (client-only render) */
const ChatTab = dynamic(() =>
  import("@/components/details/chatHistory").then(m => ({ default: m.UserChatSessionList })), {
    ssr: false, loading: () => <TabLoader />,
  }
);
const CallTab = dynamic(() =>
  import("@/components/details/callHistory").then(m => ({ default: m.UserCallSessionList })), {
    ssr: false, loading: () => <TabLoader />,
  }
);
const OrdersTab = dynamic(() =>
  import("@/components/details/orderDetails").then(m => ({ default: m.default })), {
    ssr: false, loading: () => <TabLoader />,
  }
);
const WalletTab = dynamic(() =>
  import("@/components/details/walletHistory").then(m => ({ default: m.default })), {
    ssr: false, loading: () => <TabLoader />,
  }
);
const FollowersTab = dynamic(() =>
  import("@/components/details/followersList").then(m => ({ default: m.UserFollowerList })), {
    ssr: false, loading: () => <TabLoader />,
  }
);
const NotificationsTab = dynamic(() =>
  import("@/components/details/notification").then(m => ({ default: m.default })), {
    ssr: false, loading: () => <TabLoader />,
  }
);
const GiftsTab = dynamic(() =>
  import("@/components/details/giftList").then(m => ({ default: m.UserGiftList })), {
    ssr: false, loading: () => <TabLoader />,
  }
);

/* ---------- glass primitives (same look) ---------- */
function GlassCard({ children, className = "", hover = false }: any) {
  return (
    <div
      className={[
        "relative rounded-3xl overflow-hidden",            // ← add overflow-hidden
        "bg-white/55 dark:bg-white/[0.06] border border-white/50 dark:border-white/10",
        "backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
        hover ? "transition-transform hover:-translate-y-0.5 hover:shadow-xl" : "",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}

function GlassButton({ children, onClick, type = "button", icon: Icon, variant = "primary", disabled, className = "" }: any) {
  const variants: Record<string, string> = {
    primary: "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-[0_8px_20px_rgba(59,130,246,0.25)]",
    secondary: "text-slate-900 dark:text-white bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/[0.12]",
    ghost: "text-slate-700 dark:text-slate-300 bg-transparent hover:bg-white/50 dark:hover:bg-white/[0.08] border border-transparent",
    danger: "text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-[0_8px_20px_rgba(239,68,68,0.25)]",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={["inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
        "disabled:opacity-60 disabled:cursor-not-allowed", variants[variant], className].join(" ")}>
      {Icon ? <Icon className="h-4 w-4" /> : null}{children}
    </button>
  );
}

/* ---------- page ---------- */
type Tone = "blue" | "green" | "purple" | "emerald" | "pink" | "orange" | "red";
const tone = {
  blue: { icon: "text-blue-600 dark:text-blue-400", tab: "border-blue-500 text-blue-600 bg-blue-50/60 dark:bg-blue-500/10" },
  green: { icon: "text-green-600 dark:text-green-400", tab: "border-green-500 text-green-600 bg-green-50/60 dark:bg-green-500/10" },
  purple:{ icon: "text-purple-600 dark:text-purple-400", tab:"border-purple-500 text-purple-600 bg-purple-50/60 dark:bg-purple-500/10" },
  emerald:{ icon:"text-emerald-600 dark:text-emerald-400", tab:"border-emerald-500 text-emerald-600 bg-emerald-50/60 dark:bg-emerald-500/10" },
  pink: { icon:"text-pink-600 dark:text-pink-400", tab:"border-pink-500 text-pink-600 bg-pink-50/60 dark:bg-pink-500/10" },
  orange:{ icon:"text-orange-600 dark:text-orange-400", tab:"border-orange-500 text-orange-600 bg-orange-50/60 dark:bg-orange-500/10" },
  red:  { icon:"text-red-600 dark:text-red-400", tab:"border-red-500 text-red-600 bg-red-50/60 dark:bg-red-500/10" },
} as const;

export default function Page() {
  const params = useParams();
  const id = Number((params as any)?.id);
  const toast = useToast();

  // summary (fast)
  const [summary, setSummary] = useState<any>(null);

  // tab state caches
  const [chat, setChat] = useState<any[] | null>(null);
  const [call, setCall] = useState<any[] | null>(null);
  const [orders, setOrders] = useState<any[] | null>(null);
  const [walletTx, setWalletTx] = useState<any[] | null>(null);
  const [followers, setFollowers] = useState<any[] | null>(null);
  const [notifications, setNotifications] = useState<any[] | null>(null);
  const [gifts, setGifts] = useState<any[] | null>(null);

  const [activeTab, setActiveTab] = useState<string>("Chat History");
  const [loadingTab, setLoadingTab] = useState<string | null>(null);

  // edit state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const [previewUrl, setPreviewUrl] = useState("");

  // initial: summary only
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const s = await getUserSummary({ id });
        setSummary(s);
      } catch (e) {
        console.error(e);
        toast("error", "Error", "Failed to load user.");
      }
    })();
  }, [id, toast]);

  // lazy-load when a tab is first activated
  useEffect(() => {
    if (!id) return;
    const load = async (tab: string) => {
      try {
        setLoadingTab(tab);
        if (tab === "Chat History" && chat === null) {
          const rows = await getUserChatHistoryOnly({ id });
          setChat(rows);
        } else if (tab === "Call History" && call === null) {
          const rows = await getUserCallHistoryOnly({ id });
          setCall(rows);
        } else if (tab === "Mall Orders" && orders === null) {
          const rows = await getUserOrdersOnly({ id });
          setOrders(rows);
        } else if (tab === "Wallet" && walletTx === null) {
          const rows = await getUserWalletTransactionsOnly({ id });
          setWalletTx(rows);
        } else if (tab === "Following List" && followers === null) {
          const rows = await getUserFollowersOnly({ id });
          setFollowers(rows);
        } else if (tab === "Notification List" && notifications === null) {
          const rows = await getUserNotificationsOnly({ id });
          setNotifications(rows);
        } else if (tab === "Gift List" && gifts === null) {
          const rows = await getUserGiftsOnly({ id });
          setGifts(rows);
        }
      } catch (e: any) {
        console.error(e);
        toast("error", "Error", `Failed to load ${tab.toLowerCase()}.`);
      } finally {
        setLoadingTab(null);
      }
    };
    void load(activeTab);
  }, [activeTab, id, chat, call, orders, walletTx, followers, notifications, gifts, toast]);

  const walletBalance = useMemo(() => {
    const w = summary?.user_wallets || [];
    return w.reduce((acc: number, it: any) => acc + Number(it?.amount || 0), 0);
  }, [summary]);

  const tabs: Array<{ name: string; icon: React.ElementType; t: Tone }> = [
    { name: "Chat History", icon: Clock, t: "blue" },
    { name: "Call History", icon: Phone, t: "green" },
    { name: "Mall Orders", icon: ShoppingBag, t: "purple" },
    { name: "Wallet", icon: Wallet, t: "emerald" },
    { name: "Following List", icon: Users, t: "pink" },
    { name: "Notification List", icon: Bell, t: "orange" },
    { name: "Gift List", icon: Gift, t: "red" },
  ];

  // edit modal handlers (same as before, just using summary)
  const openEdit = () => {
    const u = summary;
    if (!u) return;
    setForm({
      name: u.name ?? "",
      contactNo: u.contactNo ?? "",
      email: u.email ?? "",
      birthDate: u.birthDate ? dayjs(u.birthDate).format("YYYY-MM-DD") : "",
      birthTime: u.birthTime ?? "",
      birthPlace: u.birthPlace ?? "",
      addressLine1: u.addressLine1 ?? "",
      city: u.location ?? "",
      pincode: u.pincode ?? "",
      gender: u.gender ?? "",
      profile: null as File | null,
    });
    setPreviewUrl(
      u?.profile
        ? `${process.env.NEXT_PUBLIC_BASEURL}${u.profile}`
        : "https://gyanitalk.com/build/assets/images/person.png"
    );
    setIsEditing(true);
  };
  const closeEdit = () => { setIsEditing(false); setSaving(false); setPreviewUrl(""); };
  const handleChange = (e: any) => setForm((s: any) => ({ ...s, [e.target.name]: e.target.value }));
  const handleFile = (e: any) => {
    const f = e.target.files?.[0]; if (!f) return;
    setForm((s: any) => ({ ...s, profile: f })); setPreviewUrl(URL.createObjectURL(f));
  };

  const onSubmit = async (e: any) => {
    e.preventDefault(); if (!id) return;
    try {
      setSaving(true);
      let uploadedPath: string | undefined;
      if (form.profile instanceof File) {
        const up = await uploadImage(form.profile, "images");
        uploadedPath = up?.path;
      }
      const payload = {
        name: form.name,
        contactNo: form.contactNo,
        email: form.email,
        birthDate: form.birthDate,
        birthTime: form.birthTime,
        birthPlace: form.birthPlace,
        addressLine1: form.addressLine1,
        location: form.city,
        pincode: form.pincode,
        gender: form.gender,
        profile: uploadedPath || undefined,
      };
      const res = await updateUserDetails({ id, data: payload });
      if (res?.status) {
        setSummary((prev: any) => ({ ...prev, ...payload, profile: uploadedPath || prev?.profile }));
        toast("warning", "Saved", "Profile updated successfully.");
        closeEdit();
      } else {
        toast("error", "Error", res?.message || "Failed to update user.");
      }
    } catch (err: any) {
      console.error(err);
      toast("error", "Error", err?.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (!summary) return <Skeleton />;

  const joinedAt = summary?.created_at || summary?.birthDate || null;
  const profileSrc = summary?.profile
    ? `${process.env.NEXT_PUBLIC_BASEURL}${summary.profile}`
    : "https://gyanitalk.com/build/assets/images/person.png";

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-40 w-[26rem] h-[26rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[48rem] h-[18rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Identity */}
        <GlassCard className="p-6">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
              <div className="flex items-center gap-6 flex-1">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white/70 dark:ring-white/10 shadow">
                    <Image src={profileSrc} alt="profile" width={112} height={112} className="h-full w-full object-cover" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 block w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{summary?.name || "Unknown User"}</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Member since {joinedAt ? dayjs(joinedAt).format("MMMM YYYY") : "—"}
                  </p>
                  <div className="mt-3">
                    <GlassButton icon={Edit3} onClick={openEdit}>Edit Profile</GlassButton>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 lg:ml-auto">
                <StatChip icon={Wallet} label="Wallet" value={`₹${walletBalance.toFixed(2)}`} />
                <StatChip icon={Clock} label="Minutes" value={`${summary?.totalCallMinutes || 0}m`} />
                <StatChip icon={UserIcon} label="Refer" value={summary?.refer_code || "N/A"} />
                <StatChip icon={Heart} label="Active" value={summary?.birthDate ? dayjs(summary.birthDate).format("MMM YY") : "—"} />
              </div>
            </div>

            {/* Contact */}
            <div className="pt-6 border-t border-white/60 dark:border-white/10">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Contact Information</h3>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={summary?.contactNo || "—"}
                  onValueClick={() => {
                    const v = summary?.contactNo;
                    if (!v) return;
                    navigator.clipboard.writeText(v)
                      .then(() => toast("warning", "Copied", "Phone number copied to clipboard."))
                      .catch(() => toast("error", "Error", "Could not copy to clipboard."));
                  }}
                />
                <InfoRow icon={MapPin} label="Location" value={summary?.birthPlace || "—"} />
                <InfoRow icon={Calendar} label="Birth Date" value={summary?.birthDate ? dayjs(summary.birthDate).format("DD MMM YYYY") : "—"} />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Tabs */}
        <GlassCard>
            <div className="rounded-t-3xl overflow-hidden">
          <div className="border-b border-white/60 dark:border-white/10">
            <div className="flex overflow-x-auto">
              {tabs.map((t) => {
                const isActive = activeTab === t.name;
                return (
                  <button
                    key={t.name}
                    onClick={() => setActiveTab(t.name)}
                    className={[
                      "flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition border-b-2",
                      isActive ? tone[t.t].tab : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300",
                    ].join(" ")}
                  >
                    <t.icon className={`h-4 w-4 ${tone[t.t].icon}`} />
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
          </div>

          <div className="p-4 md:p-6 min-h-[360px]">
            {loadingTab ? <TabLoader /> : (
              <>
                {activeTab === "Chat History" && <ChatTab sessions={chat || []} />}
                {activeTab === "Call History" && <CallTab sessions={call || []} />}
                {activeTab === "Mall Orders" && <OrdersTab details={orders || []} />}
                {activeTab === "Wallet" && <WalletTab transactions={walletTx || []} isUser />}
                {activeTab === "Following List" && <FollowersTab followers={followers || []} />}
                {activeTab === "Notification List" && <NotificationsTab noitifications={notifications || []} />}
                {activeTab === "Gift List" && <GiftsTab gifts={gifts || []} />}
              </>
            )}
          </div>
        </GlassCard>

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEdit} />
            <GlassCard className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/60 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10">
                    <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">Edit Profile</h2>
                </div>
                <GlassButton variant="ghost" onClick={closeEdit} icon={X}>Close</GlassButton>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/60 dark:bg-white/[0.06] border border-white/60 dark:border-white/10">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/70 dark:ring-white/10 shadow">
                        <Image src={previewUrl || profileSrc} alt="preview" width={96} height={96} className="h-full w-full object-cover" />
                      </div>
                      <label className="absolute -bottom-2 -right-2 inline-flex items-center justify-center h-9 w-9 rounded-xl cursor-pointer text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_8px_20px_rgba(59,130,246,0.25)] hover:scale-105 transition">
                        <Camera className="w-4 h-4" />
                        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Profile Picture</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Click the camera icon to upload a new photo.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Full Name" name="name" value={form.name || ""} onChange={handleChange} required />
                    <Field label="Contact Number" name="contactNo" value={form.contactNo || ""} onChange={handleChange} inputMode="tel" />
                    <Field label="Email Address" name="email" type="email" value={form.email || ""} onChange={handleChange} />
                    <SelectField label="Gender" name="gender" value={form.gender || ""} onChange={handleChange}
                      options={[{label:"Select Gender",value:""},{label:"Male",value:"Male"},{label:"Female",value:"Female"},{label:"Other",value:"Other"}]} />
                    <Field label="Birth Date" name="birthDate" type="date" value={form.birthDate || ""} onChange={handleChange} />
                    <Field label="Birth Time" name="birthTime" type="time" value={form.birthTime || ""} onChange={handleChange} />
                    <Field label="Birth Place" name="birthPlace" value={form.birthPlace || ""} onChange={handleChange} placeholder="Enter your birth place" />
                    <Field label="City" name="city" value={form.city || ""} onChange={handleChange} placeholder="Enter your city" />
                    <Field label="Pin Code" name="pincode" value={form.pincode || ""} onChange={handleChange} inputMode="numeric" pattern="\\d{4,8}" placeholder="Enter your pin code" />
                    <TextArea className="md:col-span-2" label="Address" name="addressLine1" value={form.addressLine1 || ""} onChange={handleChange} rows={3} placeholder="Enter your complete address" />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/60 dark:border-white/10">
                    <GlassButton variant="secondary" onClick={closeEdit} disabled={saving}>Cancel</GlassButton>
                    <GlassButton type="submit" icon={Save} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</GlassButton>
                  </div>
                </form>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}

/* --- tiny helpers --- */
function StatChip({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-sm">
      <Icon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
function InfoRow({ icon: Icon, label, value, onValueClick }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-gradient-to-br from-slate-100 to-white dark:from-white/[0.06] dark:to-white/[0.02] border border-white/60 dark:border-white/10">
        <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className={onValueClick ? "font-medium text-slate-900 dark:text-white cursor-pointer hover:underline" : "font-medium text-slate-900 dark:text-white"}
           onClick={onValueClick} title={onValueClick ? "Click to copy" : undefined}>
          {value}
        </p>
      </div>
    </div>
  );
}
function Field(props: any) {
  const { label, className, ...rest } = props;
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <input {...rest}
        className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition" />
    </div>
  );
}
function SelectField({ label, options, ...rest }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <select {...rest}
        className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition">
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
function TextArea({ label, className, ...rest }: any) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <textarea {...rest}
        className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition resize-none" />
    </div>
  );
}
function TabLoader() {
  return (
    <div className="grid gap-3">
      <div className="h-16 rounded-2xl bg-white/60 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 animate-pulse" />
      <div className="h-16 rounded-2xl bg-white/60 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 animate-pulse" />
      <div className="h-16 rounded-2xl bg-white/60 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 animate-pulse" />
    </div>
  );
}

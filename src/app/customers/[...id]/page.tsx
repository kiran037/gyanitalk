"use client";

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
import { uploadImage } from "@/upload";
import {
  Phone, MapPin, Calendar, Clock, Gift, Bell, Users,
  ShoppingBag, Wallet, User as UserIcon, Heart,
} from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";

/* split components */
import { GlassCard } from "@/components/GlassUI/GlassKit";
import TabsBar, { TabsBarItem } from "@/components/customers/details/TabsBar";
import UserHeaderCard from "@/components/customers/details/UserHeaderCard";
import EditProfileModal from "@/components/customers/details/EditProfileModal";
import TabLoader from "@/components/customers/details/TabLoader";

/** Dynamic-import heavy tab components (client-only render) */
const ChatTab = dynamic(
  () => import("@/components/details/chatHistory").then(m => ({ default: m.UserChatSessionList })),
  { ssr: false, loading: () => <TabLoader /> }
);
const CallTab = dynamic(
  () => import("@/components/details/callHistory").then(m => ({ default: m.UserCallSessionList })),
  { ssr: false, loading: () => <TabLoader /> }
);
const OrdersTab = dynamic(
  () => import("@/components/details/orderDetails").then(m => ({ default: m.default })),
  { ssr: false, loading: () => <TabLoader /> }
);
const WalletTab = dynamic(
  () => import("@/components/details/walletHistory").then(m => ({ default: m.default })),
  { ssr: false, loading: () => <TabLoader /> }
);
const FollowersTab = dynamic(
  () => import("@/components/details/followersList").then(m => ({ default: m.UserFollowerList })),
  { ssr: false, loading: () => <TabLoader /> }
);
const NotificationsTab = dynamic(
  () => import("@/components/details/notification").then(m => ({ default: m.default })),
  { ssr: false, loading: () => <TabLoader /> }
);
const GiftsTab = dynamic(
  () => import("@/components/details/giftList").then(m => ({ default: m.UserGiftList })),
  { ssr: false, loading: () => <TabLoader /> }
);

export default function Page() {
  const params = useParams() as any;
  const raw = params?.id;
  const id = Number(Array.isArray(raw) ? raw[0] : raw); // handle catch-all [...id]
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

  const tabs: TabsBarItem[] = [
    { name: "Chat History", icon: Clock, tone: "blue" },
    { name: "Call History", icon: Phone, tone: "green" },
    { name: "Mall Orders", icon: ShoppingBag, tone: "purple" },
    { name: "Wallet", icon: Wallet, tone: "emerald" },
    { name: "Following List", icon: Users, tone: "pink" },
    { name: "Notification List", icon: Bell, tone: "orange" },
    { name: "Gift List", icon: Gift, tone: "red" },
  ];

  // edit modal handlers
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
  const handleFile = (file: File | null) => {
    if (!file) return;
    setForm((s: any) => ({ ...s, profile: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = async (e: any) => {
    e.preventDefault(); if (!id) return;
    try {
      setSaving(true);
      let uploadedPath: string | undefined;
      if (form.profile instanceof File) {
        const up = await uploadImage(form.profile, "images", "public/storage");
        uploadedPath = up?.mainPath;
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

  if (!summary) return <TabLoader />;

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
        {/* Identity / header */}
        <UserHeaderCard
          profileSrc={profileSrc}
          name={summary?.name || "Unknown User"}
          joinedText={joinedAt ? `Member since ${dayjs(joinedAt).format("MMMM YYYY")}` : " "}
          onEditClick={openEdit}
          chips={[
            { icon: Wallet, label: "Wallet", value: `₹${walletBalance.toFixed(2)}` },
            { icon: Clock, label: "Minutes", value: `${summary?.totalCallMinutes || 0}m` },
            { icon: UserIcon, label: "Refer", value: summary?.refer_code || "N/A" },
            { icon: Heart, label: "Active", value: summary?.birthDate ? dayjs(summary.birthDate).format("MMM YY") : "—" },
          ]}
          contactRows={[
            {
              icon: Phone,
              label: "Phone",
              value: summary?.contactNo || "—",
              onClick: () => {
                const v = summary?.contactNo;
                if (!v) return;
                navigator.clipboard.writeText(v)
                  .then(() => toast("warning", "Copied", "Phone number copied to clipboard."))
                  .catch(() => toast("error", "Error", "Could not copy to clipboard."));
              },
            },
            { icon: MapPin, label: "Location", value: summary?.birthPlace || "—" },
            { icon: Calendar, label: "Birth Date", value: summary?.birthDate ? dayjs(summary.birthDate).format("DD MMM YYYY") : "—" },
          ]}
        />

        {/* Tabs */}
        <GlassCard>
          <TabsBar items={tabs} active={activeTab} onChange={setActiveTab} />
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

        {/* Edit Profile Modal */}
        <EditProfileModal
          open={isEditing}
          onClose={closeEdit}
          profileSrc={previewUrl || profileSrc}
          saving={saving}
          values={form}
          onFile={handleFile}
          onChange={handleChange}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}

"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import { getUserDetails, updateUserDetails } from "@/components/customers/fetch";
import { AstrologerSkeleton as Skeleton } from "@/components/(astros)/astrologers/astrologer-skeleton";
import { UserCallSessionList } from "@/components/details/callHistory";
import { UserChatSessionList } from "@/components/details/chatHistory";
import UserOrderDetails from "@/components/details/orderDetails";
import WalletTransactionList from "@/components/details/walletHistory";
import { UserFollowerList } from "@/components/details/followersList";
import NoitificationsList from "@/components/details/notification";
import { UserGiftList } from "@/components/details/giftList";
import { uploadImage } from "@/upload";

// ------------------------------------------------------------
// Small inline icons (no extra deps)
// ------------------------------------------------------------
function CameraIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.69882 3.365C5.89894 2.38259 6.77316 1.6875 7.77475 1.6875H10.2252C11.2268 1.6875 12.1011 2.38259 12.3012 3.36499C12.3474 3.59178 12.5528 3.75814 12.7665 3.75814H12.7788L12.7911 3.75868C13.8437 3.80471 14.6521 3.93387 15.3271 4.37668C15.7524 4.65568 16.1182 5.01463 16.4033 5.43348C16.7579 5.9546 16.9143 6.55271 16.9893 7.27609C17.0625 7.98284 17.0625 8.86875 17.0625 9.99079V10.0547C17.0625 11.1767 17.0625 12.0626 16.9893 12.7694C16.9143 13.4927 16.7579 14.0909 16.4033 14.612C16.1182 15.0308 15.7524 15.3898 15.3271 15.6688C14.7995 16.0149 14.1947 16.1675 13.461 16.2408C12.7428 16.3125 11.8418 16.3125 10.6976 16.3125H7.30242C6.15824 16.3125 5.25725 16.3125 4.53897 16.2408C3.80534 16.1675 3.20049 16.0149 2.67289 15.6688C2.24761 15.3898 1.88179 15.0308 1.59674 14.612C1.24209 14.0909 1.08567 13.4927 1.01072 12.7694C0.937488 12.0626 0.937494 11.1767 0.9375 10.0547V9.9908C0.937494 8.86875 0.937488 7.98284 1.01072 7.27609C1.08567 6.55271 1.24209 5.9546 1.59674 5.43348C1.88179 5.01463 2.24761 4.65568 2.67289 4.37668C3.34787 3.93387 4.15635 3.80471 5.20892 3.75868L5.2212 3.75814H5.2335C5.44716 3.75814 5.65262 3.59179 5.69882 3.365ZM9 8.0625C8.06802 8.0625 7.3125 8.81802 7.3125 9.75C7.3125 10.682 8.06802 11.4375 9 11.4375C9.93198 11.4375 10.6875 10.682 10.6875 9.75C10.6875 8.81802 9.93198 8.0625 9 8.0625Z"
            />
        </svg>
    );
}

// ------------------------------------------------------------
// Main Page
// ------------------------------------------------------------
export default function Page() {
    const params = useParams();
    const id = (params as any)?.id;

    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<string>("Chat History");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [form, setForm] = useState<any>({});
    const [previewUrl, setPreviewUrl] = useState<string>("");

    // Load stored tab
    useEffect(() => {
        const tab = localStorage.getItem("activeAstroTab");
        if (tab) setActiveTab(tab);
        return () => localStorage.removeItem("activeAstroTab");
    }, []);

    // Fetch data
    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const result = await getUserDetails({ id });
                setData(result);
            } catch (e) {
                console.error("Failed to fetch profile:", e);
            }
        })();
    }, [id]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        localStorage.setItem("activeAstroTab", tab);
    };

    const tabs = [
        "Chat History",
        "Call History",
        "Mall Orders",
        "Wallet",
        "Following List",
        "Notification List",
        "Gift List",
    ];

    const walletBalance = useMemo(() => {
        const w = data?.userDetail?.user_wallets || [];
        return w.reduce((acc: number, it: any) => acc + Number(it?.amount || 0), 0);
    }, [data]);

    // ------------------------------------------------------------
    // Edit form helpers
    // ------------------------------------------------------------
    const openEdit = () => {
        if (!data?.userDetail) return;
        const u = data.userDetail;
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

    const closeEdit = () => {
        setIsEditing(false);
        setSaving(false);
        setPreviewUrl("");
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((s: any) => ({ ...s, [name]: value }));
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setForm((s: any) => ({ ...s, profile: f }));
        const url = URL.createObjectURL(f);
        setPreviewUrl(url);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        try {
            setSaving(true);


            let profileUrl: string | undefined = form.profile;

            if (form.profile instanceof File) {
                const imageUrl = await uploadImage(form.profile, "images");
                profileUrl = imageUrl.path;
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
                profile: form.profile ? form.profile.name : undefined,
                // ⚠️ handle upload separately, here you can just store file name/path
            };

            const res = await updateUserDetails({ id: Number(id), data: payload });

            if (res?.status) {
                setData((prev: any) => ({
                    ...prev,
                    userDetail: { ...prev.userDetail, ...payload, profile: res.data?.profile || prev.userDetail.profile },
                }));
                closeEdit();
            } else {
                alert(res?.message || "Failed to update user");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong while saving. Please try again.");
        } finally {
            setSaving(false);
        }
    };


    return (
        <>
            {!data ? (
                <Skeleton />
            ) : (
                <div className="mx-auto w-full">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm border dark:bg-gray-dark dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="flex items-center space-x-5">
                                    <div className="relative">
                                        <Image
                                            src={
                                                data?.userDetail?.profile
                                                    ? `${process.env.NEXT_PUBLIC_BASEURL}${data.userDetail.profile}`
                                                    : "https://gyanitalk.com/build/assets/images/person.png"
                                            }
                                            width={90}
                                            height={90}
                                            className="rounded-full border-4 border-blue-500 object-cover shadow-md"
                                            alt="profile"
                                        />
                                        <button
                                            onClick={openEdit}
                                            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow hover:bg-blue-700"
                                            title="Edit profile"
                                        >
                                            <CameraIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {data?.userDetail?.name}
                                            </h2>
                                            <button
                                                onClick={openEdit}
                                                className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 border-dashed border-gray-300 dark:border-gray-600">
                                        Contact Details
                                    </h3>
                                    <div className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                            <span>{data?.userDetail?.email || "-"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M3 5.75C3 4.784 3.784 4 4.75 4h2.5c.966 0 1.75.784 1.75 1.75v1c0 .966-.784 1.75-1.75 1.75H6.91c.265.516.607 1.01 1.02 1.474 2.095 2.354 4.542 4.183 7.35 5.488a1.75 1.75 0 001.72-.205l1.287-.964c.7-.524 1.678-.466 2.303.137l1.763 1.705c.674.651.71 1.722.08 2.426a3.25 3.25 0 01-3.46.812c-3.968-1.485-7.646-3.97-11.032-7.41C4.017 9.757 2.42 6.882 2.04 4.25A3.25 3.25 0 013 5.75z" />
                                            </svg>
                                            <span>{data?.userDetail?.contactNo || "-"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">Refer Code:</span>
                                            <span>{data?.userDetail?.refer_code || "-"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">Wallet Balance:</span>
                                            <span>{walletBalance || "-"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 border-dashed border-gray-300 dark:border-gray-600">
                                        Details
                                    </h3>
                                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                        <div className="flex justify-between">
                                            <span>Birth Date</span>
                                            <span className="text-blue-600 font-semibold">
                                                {data?.userDetail?.birthDate ? dayjs(data?.userDetail?.birthDate).format("DD MMM YYYY") : "-"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Birth Time</span>
                                            <span className="text-pink-600 font-semibold">{data?.userDetail?.birthTime || "-"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Location</span>
                                            <span className="text-orange-600 font-semibold">{data?.userDetail?.birthPlace || "-"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Call Minutes</span>
                                            <span className="text-orange-600 font-semibold">{data?.totalCallMinutes} Min</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="flex space-x-8 px-6">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => handleTabChange(tab)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {activeTab === "Chat History" && <UserChatSessionList sessions={data?.chatHistory} />}
                        {activeTab === "Call History" && <UserCallSessionList sessions={data?.callHistory} />}
                        {activeTab === "Mall Orders" && <UserOrderDetails details={data?.orderDetails} />}
                        {activeTab === "Wallet" && (
                            <WalletTransactionList transactions={data?.walletTransactions} isUser={true} />
                        )}
                        {activeTab === "Following List" && <UserFollowerList followers={data?.followersList} />}
                        {activeTab === "Notification List" && (
                            <NoitificationsList noitifications={data?.notification} />
                        )}
                        {activeTab === "Gift List" && <UserGiftList gifts={data?.gifts} />}
                    </div>

                    {/* EDIT DRAWER */}
                    {isEditing && (
                        <div className="fixed inset-0 z-50">
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 bg-black/40"
                                onClick={closeEdit}
                                aria-hidden
                            />

                            {/* Panel */}
                            <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white dark:bg-gray-900 shadow-xl p-6 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Edit Profile</h2>
                                    <button
                                        onClick={closeEdit}
                                        className="rounded-md px-2 py-1 text-sm border hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        Close
                                    </button>
                                </div>

                                <form onSubmit={onSubmit} className="space-y-5">
                                    {/* Profile image */}
                                    <div className="flex items-center gap-4">
                                        <Image
                                            src={previewUrl || "https://gyanitalk.com/build/assets/images/person.png"}
                                            alt="preview"
                                            width={72}
                                            height={72}
                                            className="rounded-full border object-cover"
                                        />
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Profile Image</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFile}
                                                className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium">Name</label>
                                            <input
                                                name="name"
                                                value={form.name || ""}
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                placeholder="Full name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Contact No</label>
                                            <input
                                                name="contactNo"
                                                value={form.contactNo || ""}
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-md border px-3 py-2"
                                                placeholder="10-digit mobile"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email || ""}
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-md border px-3 py-2"
                                                placeholder="name@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Birth Date</label>
                                            <input
                                                type="date"
                                                name="birthDate"
                                                value={form.birthDate || ""}
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-md border px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Birth Time</label>
                                            <input
                                                type="time"
                                                name="birthTime"
                                                value={form.birthTime || ""}
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-md border px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Birth Place</label>
                                            <input
                                                name="birthPlace"
                                                value={form.birthPlace || ""}
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-md border px-3 py-2"
                                                placeholder="City, State"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium">Current Address</label>
                                            <textarea
                                                name="addressLine1"
                                                value={form.addressLine1 || ""}
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-md border px-3 py-2"
                                                rows={2}
                                                placeholder="House no., street, area"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">City</label>
                                            <input
                                                name="city"
                                                value={form.city || ""}
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-md border px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Pin Code</label>
                                            <input
                                                name="pincode"
                                                value={form.pincode || ""}
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-md border px-3 py-2"
                                                inputMode="numeric"
                                                pattern="\\d{4,8}"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Select Gender</label>
                                            <select
                                                name="gender"
                                                value={form.gender || ""}
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-md border px-3 py-2 bg-white"
                                            >
                                                <option value="">- Select -</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={closeEdit}
                                            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                                        >
                                            {saving ? "Saving..." : "Save changes"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

// -----------------------------------------------------------------------------
// 🧩 Add this helper in `@/components/customers/fetch.ts`
// -----------------------------------------------------------------------------
// export async function updateUserDetails(formData: FormData) {
//   // Adjust URL/method/headers to your backend. Using multipart for profile image.
//   const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/admin/users/update`, {
//     method: "POST",
//     body: formData,
//     // ⚠️ No Content-Type header for multipart; browser sets it automatically
//     credentials: "include",
//   });
//   const json = await res.json();
//   return json; // expect { status: true, message: string, data: { profile?: string, ... } }
// }

// If your backend expects PUT at a RESTy URL:
// export async function updateUserDetails(formData: FormData) {
//   const id = formData.get("id");
//   const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/admin/users/${id}`, {
//     method: "PUT",
//     body: formData,
//     credentials: "include",
//   });
//   return res.json();
// }

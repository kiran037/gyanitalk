"use client"
import { getProfileDetails } from "@/components/astrologers/fetch";
import Image from "next/image"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation";
import userDetailsSkeleton from "@/components/astrologers/astrologer-details-skeleton";
import { getUserDetails } from "@/components/customers/fetch";
import { AstrologerSkeleton } from "@/components/astrologers/astrologer-skeleton";
import { UserCallSessionList } from "@/components/details/callHistory";
import { UserChatSessionList } from "@/components/details/chatHistory";

type PropsType = React.SVGProps<SVGSVGElement>;
function CameraIcon(props: PropsType) {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="currentColor"
            {...props}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.69882 3.365C5.89894 2.38259 6.77316 1.6875 7.77475 1.6875H10.2252C11.2268 1.6875 12.1011 2.38259 12.3012 3.36499C12.3474 3.59178 12.5528 3.75814 12.7665 3.75814H12.7788L12.7911 3.75868C13.8437 3.80471 14.6521 3.93387 15.3271 4.37668C15.7524 4.65568 16.1182 5.01463 16.4033 5.43348C16.7579 5.9546 16.9143 6.55271 16.9893 7.27609C17.0625 7.98284 17.0625 8.86875 17.0625 9.99079V10.0547C17.0625 11.1767 17.0625 12.0626 16.9893 12.7694C16.9143 13.4927 16.7579 14.0909 16.4033 14.612C16.1182 15.0308 15.7524 15.3898 15.3271 15.6688C14.7995 16.0149 14.1947 16.1675 13.461 16.2408C12.7428 16.3125 11.8418 16.3125 10.6976 16.3125H7.30242C6.15824 16.3125 5.25725 16.3125 4.53897 16.2408C3.80534 16.1675 3.20049 16.0149 2.67289 15.6688C2.24761 15.3898 1.88179 15.0308 1.59674 14.612C1.24209 14.0909 1.08567 13.4927 1.01072 12.7694C0.937488 12.0626 0.937494 11.1767 0.9375 10.0547V9.9908C0.937494 8.86875 0.937488 7.98284 1.01072 7.27609C1.08567 6.55271 1.24209 5.9546 1.59674 5.43348C1.88179 5.01463 2.24761 4.65568 2.67289 4.37668C3.34787 3.93387 4.15635 3.80471 5.20892 3.75868L5.2212 3.75814H5.2335C5.44716 3.75814 5.65262 3.59179 5.69882 3.365ZM7.77475 2.8125C7.29392 2.8125 6.89179 3.14475 6.80118 3.58955C6.65443 4.30994 6.01575 4.8764 5.24725 4.88308C4.23579 4.92802 3.69402 5.05227 3.28998 5.31733C2.98732 5.51589 2.72814 5.77058 2.52679 6.06643C2.31968 6.37076 2.19522 6.75994 2.12973 7.39203C2.06321 8.03405 2.0625 8.8617 2.0625 10.0227C2.0625 11.1838 2.06321 12.0114 2.12973 12.6534C2.19522 13.2855 2.31968 13.6747 2.5268 13.979C2.72814 14.2749 2.98732 14.5296 3.28998 14.7281C3.60313 14.9336 4.00383 15.0567 4.65078 15.1213C5.30662 15.1868 6.15145 15.1875 7.33333 15.1875H10.6667C11.8486 15.1875 12.6934 15.1868 13.3492 15.1213C13.9962 15.0567 14.3969 14.9336 14.71 14.7281C15.0127 14.5296 15.2719 14.2749 15.4732 13.979C15.6803 13.6747 15.8048 13.2855 15.8703 12.6534C15.9368 12.0114 15.9375 11.1838 15.9375 10.0227C15.9375 8.8617 15.9368 8.03405 15.8703 7.39203C15.8048 6.75994 15.6803 6.37076 15.4732 6.06643C15.2719 5.77058 15.0127 5.51589 14.71 5.31733C14.306 5.05227 13.7642 4.92802 12.7528 4.88308C11.9843 4.8764 11.3456 4.30994 11.1988 3.58955C11.1082 3.14475 10.7061 2.8125 10.2252 2.8125H7.77475ZM9 8.0625C8.06802 8.0625 7.3125 8.81802 7.3125 9.75C7.3125 10.682 8.06802 11.4375 9 11.4375C9.93198 11.4375 10.6875 10.682 10.6875 9.75C10.6875 8.81802 9.93198 8.0625 9 8.0625ZM6.1875 9.75C6.1875 8.1967 7.4467 6.9375 9 6.9375C10.5533 6.9375 11.8125 8.1967 11.8125 9.75C11.8125 11.3033 10.5533 12.5625 9 12.5625C7.4467 12.5625 6.1875 11.3033 6.1875 9.75ZM12.9375 7.5C12.9375 7.18934 13.1893 6.9375 13.5 6.9375H14.25C14.5607 6.9375 14.8125 7.18934 14.8125 7.5C14.8125 7.81066 14.5607 8.0625 14.25 8.0625H13.5C13.1893 8.0625 12.9375 7.81066 12.9375 7.5Z"
            />
        </svg>
    );
}


export default function Page() {
    const params = useParams();
    const id = params?.id;

    const [data, setData] = useState<any>(null);


    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const result = await getUserDetails({ id });
                    setData(result);
                    console.log(result);

                } catch (error) {
                    console.error("Failed to fetch profile:", error);
                }
            };
            fetchData();
        }
    }, [id]);




    useEffect(() => {
        return () => {
            localStorage.removeItem("activeAstroTab");
        };
    }, []);


    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("activeAstroTab") || "Chat History";
        }
        return "Chat History";
    });

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        localStorage.setItem("activeAstroTab", tab);
    };


    const tabs = [
        "Chat History",
        "Call History",
        "Order Detail",
        "Wallet",
        "Following List",
        "Notification List",
        "Gift List",
    ]


    return (
        <>
            {!data ? (
                <AstrologerSkeleton />
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
                                        <label
                                            htmlFor="profilePhoto"
                                            className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow hover:bg-blue-700"
                                        >
                                            <CameraIcon className="w-4 h-4" />
                                        </label>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{data?.userDetail?.name}</h2>
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
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 border-dashed border-gray-300 dark:border-gray-600">
                                        Details
                                    </h3>
                                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                        <div className="flex justify-between">
                                            <span>Birth Date</span>
                                            <span className="text-blue-600 font-semibold">{data?.userDetail?.birthDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Birth Time</span>
                                            <span className="text-pink-600 font-semibold">{data?.userDetail?.birthTime}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Location</span>
                                            <span className="text-orange-600 font-semibold">{data?.userDetail?.birthPlace}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Call Minutes</span>
                                            <span className="text-orange-600 font-semibold">{data?.totalCallMinutes} Min</span>
                                        </div>
                                    </div>
                                </div>
                                {/* <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 border-dashed border-gray-300 dark:border-gray-600">
                                        Astrologer Rates
                                    </h3>
                                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                        <div className="flex justify-between">
                                            <span>Chat/Call</span>
                                            <span className="text-blue-600 font-semibold">{data?.userDetail?.charge}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Video Call</span>
                                            <span className="text-pink-600 font-semibold">{data?.userDetail?.videoCallRate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Report</span>
                                            <span className="text-orange-600 font-semibold">{data?.userDetail?.reportRate}</span>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>

                        {/* Tab Navigation */}
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


                        {activeTab === "Chat History" && (
                            <UserChatSessionList sessions={data?.chatHistory} />
                        )}
                        {activeTab === "Call History" && (
                            <UserCallSessionList sessions={data?.callHistory} />
                        )}
                        {/* Content Area */}
                        {/* {activeTab === "Order Detail" && (
                            <ProfileDetailsAccordion otherDetails={otherDetails} skillDetails={skillDetails} dayAvailability={availability} />
                        )}
                        {activeTab === "Wallet" && (
                            <WalletTransactionList transactions={data?.walletTransactions} />
                        )}
                        {activeTab === "Chat History" && (
                            <ChatSessionList sessions={data?.chatHistory} />
                        )}
                        {activeTab === "Call History" && (
                            <CallSessionList sessions={data?.callHistory} />
                        )}
                        {activeTab === "Following List" && (
                            <AstroFollowerList followers={data?.followersList} />
                        )}
                        {activeTab === "Notification List" && (
                            <NoitificationsList noitifications={data?.notification} />
                        )}
                        {activeTab === "Gift List" && (
                            <GiftList gifts={data?.gifts} />
                        )}
                        {activeTab === "Gallery" && (
                            <GalleryList gallery={data?.gallery} />
                        )} */}

                    </div>
                </div>
            )}
        </>
    );
}

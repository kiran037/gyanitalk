import Image from "next/image";
import { format } from "date-fns";
import { useState } from "react";

export default function AstroChatSessionList({ sessions }: { sessions: any }) {

    const [selectedStatus, setSelectedStatus] = useState("All");

    const filteredSessions =
        selectedStatus === "All"
            ? sessions
            : sessions.filter((s: any) => s.chatStatus === selectedStatus);

    const statusOptions = ["All", "Completed", "Rejected", "Accepted", "Pending"];


    return (

        <div className="p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                {/* Count */}
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Showing{" "}
                    <span className="font-semibold text-teal-600">{filteredSessions.length}</span>{" "}
                    {selectedStatus === "All" ? "records" : `"${selectedStatus}" chats`}
                </div>

                {/* Dropdown */}
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none"
                >
                    {statusOptions.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                {filteredSessions.map((session: any) => {
                    const user = session.user;
                    const name = user?.name || "Unknown";
                    const contactNo = user?.contactNo || "-";
                    const photo = user?.profile
                        ? `${process.env.NEXT_PUBLIC_BASEURL}/${user.profile}`
                        : "https://gyanitalk.com/build/assets/images/person.png";
                    const chatId = session.chatId || "N/A";
                    const status = session.chatStatus;
                    const durationInSec = parseInt(session.chat_duration || "0", 10);
                    const totalMin = session.totalMin || "-";
                    const deduction = session.deduction !== null ? `${session.deduction} Coins` : "-";
                    const createdAt = format(new Date(session.created_at), "dd MMM yyyy, hh:mm a");

                    return (
                        <div
                            key={session.id}
                            className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-5 flex flex-col gap-4 border border-gray-200 dark:border-gray-700"
                        >
                            {/* Top: Avatar + Name */}
                            <div className="flex items-center gap-4">
                                <div className="w-[50px] h-[50px] rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
                                    <Image
                                        src={photo}
                                        alt="User"
                                        width={50}
                                        height={50}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{createdAt}</p>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span
                                        className={`font-medium ${status === "Completed"
                                            ? "text-green-600"
                                            : status === "Rejected"
                                                ? "text-red-500"
                                                : "text-yellow-500"
                                            }`}
                                    >
                                        {status}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Contact No:</span>
                                    <span className="text-gray-900 dark:text-white">{contactNo}</span>
                                </div>


                                {status === "Completed" && (
                                    <>
                                        <div className="flex justify-between">
                                            <span>Chat Duration:</span>
                                            <span className="text-gray-900 dark:text-white">
                                                {durationInSec >= 60
                                                    ? `${Math.floor(durationInSec / 60)} min ${durationInSec % 60} sec`
                                                    : `${durationInSec} sec`} {`(${totalMin} Min)`}
                                            </span>
                                        </div>


                                        <div className="flex justify-between">
                                            <span>Deduction:</span>
                                            <span className="text-blue-600 font-medium">{deduction}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span><b>View Chat History</b></span>
                                            <span className="text-gray-900 dark:text-white">{chatId}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>


    );
}


export function UserChatSessionList({ sessions }: { sessions: any }) {

    const [selectedStatus, setSelectedStatus] = useState("All");

    const filteredSessions =
        selectedStatus === "All"
            ? sessions
            : sessions.filter((s: any) => s.chatStatus === selectedStatus);

    const statusOptions = ["All", "Completed", "Rejected", "Accepted", "Pending"];


    return (

        <div className="p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                {/* Count */}
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Showing{" "}
                    <span className="font-semibold text-teal-600">{filteredSessions.length}</span>{" "}
                    {selectedStatus === "All" ? "records" : `"${selectedStatus}" chats`}
                </div>

                {/* Dropdown */}
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none"
                >
                    {statusOptions.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                {filteredSessions.map((session: any) => {
                    const astrologer = session.astrologer;
                    const name = astrologer?.name || "Unknown";
                    const contactNo = astrologer?.contactNo || "-";
                    const photo = astrologer?.profileImage
                        ? `${process.env.NEXT_PUBLIC_BASEURL}/${astrologer.profileImage}`
                        : "https://gyanitalk.com/build/assets/images/person.png";
                    const status = session.chatStatus;
                    const durationInSec = parseInt(session.chat_duration || "0", 10);
                    const totalMin = session.totalMin || "-";
                    const deduction = session.deduction !== null ? `${session.deduction} Coins` : "-";
                    const createdAt = format(new Date(session.created_at), "dd MMM yyyy, hh:mm a");
                    const chatId = session.chatId || "N/A";

                    return (
                        <div
                            key={session.id}
                            className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-5 flex flex-col gap-4 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-[50px] h-[50px] rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
                                    <Image
                                        src={photo}
                                        alt="User"
                                        width={50}
                                        height={50}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{createdAt}</p>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span
                                        className={`font-medium ${status === "Completed"
                                            ? "text-green-600"
                                            : status === "Rejected"
                                                ? "text-red-500"
                                                : "text-yellow-500"
                                            }`}
                                    >
                                        {status}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Contact No:</span>
                                    <span className="text-gray-900 dark:text-white">{contactNo}</span>
                                </div>


                                {status === "Completed" && (
                                    <>
                                        <div className="flex justify-between">
                                            <span>Chat Duration:</span>
                                            <span className="text-gray-900 dark:text-white">
                                                {durationInSec >= 60
                                                    ? `${Math.floor(durationInSec / 60)} min ${durationInSec % 60} sec`
                                                    : `${durationInSec} sec`} {`(${totalMin} Min)`}
                                            </span>
                                        </div>


                                        <div className="flex justify-between">
                                            <span>Deduction:</span>
                                            <span className="text-blue-600 font-medium">{deduction}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span><b>View Chat History</b></span>
                                            <span className="text-gray-900 dark:text-white">{chatId}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>


    );
}
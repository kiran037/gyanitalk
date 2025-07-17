
import Image from "next/image";
import { useTransition } from "react";
import { unFollow } from "../fetch";
import toast from "react-hot-toast";

export default function AstroFollowerList({ followers }: { followers: any[]; }) {

    const [isPending, startTransition] = useTransition();
    const handleUnfollow = (id: number) => {
        startTransition(async () => {
            try {
                await unFollow({ id });
                toast.success("Unfollowed successfully!");
                location.reload();
            } catch (error) {
                toast.error("Something went wrong while unfollowing.");
            }
        });
    };

    return (
        <div className="p-6">
            <div className="w-full rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 border-b">
                    <div>Name</div>
                    <div>Contact</div>
                    <div>Action</div>
                </div>

                {!followers ? (
                    <div>Loading followers...</div>
                ) : (followers.map((follower: any) => {
                    const user = follower.user;
                    const profileImg = user?.profile
                        ? `${process.env.NEXT_PUBLIC_BASEURL}/${user.profile}`
                        : "https://gyanitalk.com/build/assets/images/person.png";

                    return (
                        <div
                            key={follower.id}
                            className="grid grid-cols-4 items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-300"
                        >
                            {/* Name + Image */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden border">
                                    <Image
                                        src={profileImg}
                                        alt="Profile"
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>{user?.name || "Unknown"}</div>
                            </div>

                            {/* Contact */}
                            <div>{user?.contactNo || "-"}</div>

                            {/* Unfollow */}
                            <div>
                                <button
                                    onClick={() => handleUnfollow(follower.id)}
                                    className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition"
                                >
                                    Unfollow
                                </button>
                            </div>
                        </div>
                    );
                }))}
            </div>
        </div>
    );
}

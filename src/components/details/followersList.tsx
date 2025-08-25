import Image from "next/image";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { unFollow } from "../(astros)/astrologers/fetch";

export default function AstroFollowerList({ followers }: { followers: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleUnfollow = (id: number) => {
    startTransition(async () => {
      try {
        await unFollow({ id });
        toast.success("Unfollowed successfully!");
        location.reload(); // optional, but could be optimized
      } catch (error) {
        toast.error("Something went wrong while unfollowing.");
      }
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Follower List
      </h2>

      <div className="w-full overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        {/* Table Header */}
        <div className="grid grid-cols-4 bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300 px-4 py-3">
          <div>Name</div>
          <div>Contact</div>
          <div>Action</div>
        </div>

        {/* Follower Rows */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {followers.length > 0 ? (
            followers.map((follower: any) => {
              const user = follower.user;
              const profileImg = user?.profile
                ? `${process.env.NEXT_PUBLIC_BASEURL}/${user.profile}`
                : "https://gyanitalk.com/build/assets/images/person.png";

              return (
                <div
                  key={follower.id}
                  className="grid grid-cols-4 items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200"
                >
                  {/* Name + Image */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
                      <Image
                        src={profileImg}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div className="font-medium truncate">{user?.name || "Unknown"}</div>
                  </div>

                  {/* Contact */}
                  <div>{user?.contactNo || "-"}</div>

                  {/* Unfollow Button */}
                  <div>
                    <button
                      onClick={() => handleUnfollow(follower.id)}
                      disabled={isPending}
                      className={`px-3 py-1 text-sm rounded-md transition font-medium ${isPending
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                    >
                      {isPending ? "Removing..." : "Unfollow"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-6">
              No followers found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function UserFollowerList({ followers }: { followers: any[] }) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Follower List
      </h2>

      <div className="w-full overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        {/* Table Header */}
        <div className="grid grid-cols-4 bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300 px-4 py-3">
          <div>Name</div>
          <div>Contact</div>
          <div>Action</div>
        </div>

        {/* Follower Rows */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {followers.length > 0 ? (
            followers.map((follower: any) => {
              const user = follower.astrologer ?? follower.aiAstrologer;

              const profilePath =
                follower.astrologer?.profileImage ||
                follower.aiAstrologer?.image;

              const profileImg = profilePath
                ? `${process.env.NEXT_PUBLIC_BASEURL}/${profilePath}`
                : "https://gyanitalk.com/build/assets/images/person.png";

              return (
                <div
                  key={follower.id}
                  className="grid grid-cols-4 items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200"
                >
                  {/* Name + Image */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
                      <Image
                        src={profileImg}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div className="font-medium truncate">{user?.name || "Unknown"}</div>
                  </div>

                  {/* Contact */}
                  <div>{user?.contactNo || "-"}</div>

                  {/* Action Placeholder */}
                  <div>-</div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-6">
              No followers found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
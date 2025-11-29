// components/customerscompo/tabs/FollowingTab.tsx
import { useState, useEffect } from "react";
import { Users, Star } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { avatar } from "@/lib/images";

interface Following {
  id: string;
  astrologerId: string;
  name: string;
  profileImage: string | null;
  primarySkill: string | null;
  charge: string | null;
  experience: string | null;
  isVerified: boolean;
  isAI: boolean;
  followedAt: Date;
}

interface FollowingTabProps {
  customerId: string;
}

export default function FollowingTab({ customerId }: FollowingTabProps) {
  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFollowing();
  }, [page]);

  const fetchFollowing = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/following?page=${page}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setFollowing(data.data.following);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch following:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading following list...</p>
      </div>
    );
  }

  if (following.length === 0) {
    return (
      <div className="p-12 text-center">
        <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Not Following Anyone</h3>
        <p className="text-gray-600 dark:text-gray-400">This customer hasn't followed any astrologers yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {following.map((astro) => (
          <div
            key={astro.id}
            className="p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <img
                src={avatar(astro.profileImage)}
                alt={astro.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">{astro.name}</h4>
                  {astro.isVerified && (
                    <div className="w-4 h-4 bg-[#FF6B35] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px]">✓</span>
                    </div>
                  )}
                  {astro.isAI && (
                    <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] font-bold rounded">
                      AI
                    </span>
                  )}
                </div>
                {astro.primarySkill && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{astro.primarySkill}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Star className="w-3.5 h-3.5" />
                <span>{astro.experience || "N/A"} yrs</span>
              </div>
              {astro.charge && (
                <span className="font-semibold text-gray-900 dark:text-white">₹{astro.charge}/min</span>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              Followed on {formatDate(astro.followedAt)}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
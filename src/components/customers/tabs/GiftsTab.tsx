// components/customerscompo/tabs/GiftsTab.tsx
import { useState, useEffect } from "react";
import { Gift } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { avatar } from "@/lib/images";

interface GiftData {
  id: string;
  giftName: string;
  giftImage: string | null;
  giftAmount: string;
  astrologerName: string;
  astrologerImage: string | null;
  sentAt: Date;
}

interface GiftsTabProps {
  customerId: string;
}

export default function GiftsTab({ customerId }: GiftsTabProps) {
  const [gifts, setGifts] = useState<GiftData[]>([]);
  const [totalSpent, setTotalSpent] = useState("0");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchGifts();
  }, [page]);

  const fetchGifts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/gifts?page=${page}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setGifts(data.data.gifts);
        setTotalSpent(data.data.totalSpent);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch gifts:", error);
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
        <p className="text-gray-600 dark:text-gray-400">Loading gifts...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Total Spent Card */}
      <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Total Spent on Gifts</span>
        </div>
        <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
          ₹{parseFloat(totalSpent).toFixed(2)}
        </p>
      </div>

      {gifts.length === 0 ? (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Gifts Sent</h3>
          <p className="text-gray-600 dark:text-gray-400">This customer hasn't sent any gifts yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {gifts.map((gift) => (
            <div
              key={gift.id}
              className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
            >
              {/* Gift Image */}
              <div className="flex-shrink-0">
                {gift.giftImage ? (
                  <img
                    src={avatar(gift.giftImage)}
                    alt={gift.giftName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              {/* Gift Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{gift.giftName}</h4>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Sent to:</span>
                  <div className="flex items-center gap-2">
                    <img
                      src={avatar(gift.astrologerImage)}
                      alt={gift.astrologerName}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">{gift.astrologerName}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(gift.sentAt)}</p>
              </div>

              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-[#FF6B35]">₹{parseFloat(gift.giftAmount).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

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
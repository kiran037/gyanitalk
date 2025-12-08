"use client";

import { useState, useEffect } from "react";
import { Gift } from "lucide-react";
import { avatar } from "@/lib/images";
import { motion } from "framer-motion";

interface GiftRecord {
  id: number | string;
  giftAmount: any; // can be number/string/Decimal
  user?: {
    name?: string | null;
  } | null;
  gift?: {
    name?: string | null;
    image?: string | null;
  } | null;
}

interface GiftStats {
  totalGiftAmount?: any; // can be number/string/Decimal
  totalGiftsReceived?: number;
  giftBreakdown?: any;
}

const normalizeAmount = (value: any): number => {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || 0;

  // Prisma Decimal JSON shape: { s: sign, e: exponent, d: number[] digits }
  if (typeof value === "object" && value !== null && "s" in value && "e" in value && "d" in value) {
    const dec = value as { s: number; e: number; d: number[] };

    const sign = dec.s || 1;
    const digitsArr = dec.d || [];
    if (!digitsArr.length) return 0;

    const digitsStr = digitsArr.join(""); // e.g. [1,2,3,4,5] -> "12345"
    const coeff = Number(digitsStr);
    if (Number.isNaN(coeff)) return 0;

    // decimal.js-style: value = sign * coeff * 10^(e - d.length + 1)
    const power = dec.e - digitsArr.length + 1;
    return sign * coeff * Math.pow(10, power);
  }

  return 0;
};

export function GiftsTab({ astrologerId }: { astrologerId: string }) {
  const [gifts, setGifts] = useState<GiftRecord[]>([]);
  const [stats, setStats] = useState<GiftStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [astrologerId]);

  const fetchGifts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/astrologers/${astrologerId}/gifts`);
      const data = await response.json();
      if (data.success) {
        setGifts(data.data || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error("Failed to fetch gifts:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = normalizeAmount(stats.totalGiftAmount);

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gifts Received</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Amount:{" "}
            <span className="font-semibold text-[#FF6B35]">
              ₹{totalAmount.toFixed ? totalAmount.toFixed(2) : totalAmount}
            </span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : gifts.length === 0 ? (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Gifts</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This astrologer has not received any gifts yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gifts.map((gift, index) => {
            const amount = normalizeAmount(gift.giftAmount);
            return (
              <motion.div
                key={gift.id}
                className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={avatar(gift.gift?.image)}
                    alt={gift.gift?.name || "Gift"}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {gift.gift?.name || "Gift"}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      From: {gift.user?.name || "Unknown"}
                    </p>
                    <p className="text-sm font-semibold text-[#FF6B35]">
                      ₹{amount.toFixed ? amount.toFixed(2) : amount}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
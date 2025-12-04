// components/coupons/CouponCard.tsx
import { motion } from "framer-motion";
import {
  Edit2,
  Trash2,
  Copy,
  Calendar,
  Users,
  Percent,
IndianRupee,
  TrendingUp,
  Gift,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import type { Coupon } from "@/types/coupon";

interface CouponCardProps {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
  onToggleStatus: (coupon: Coupon) => void;
}

export default function CouponCard({
  coupon,
  onEdit,
  onDelete,
  onToggleStatus,
}: CouponCardProps) {
  const addToast = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coupon.code);
    addToast("success", "Copied!", "Coupon code copied to clipboard");
  };

  const formatDate = (date: string | null) => {
    if (!date) return "No expiry";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < new Date();
  const isUpcoming = coupon.start_date && new Date(coupon.start_date) > new Date();

  return (
    <motion.div
      className="group relative bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 h-full flex flex-col"
      whileHover={{
        scale: 1.02,
        borderColor: "rgba(255, 107, 53, 0.5)",
        boxShadow: "0 10px 30px rgba(255, 107, 53, 0.15)",
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center">
            {coupon.type === "giftcard" ? (
              <Gift className="w-5 h-5 text-white" />
            ) : (
              <Ticket className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {coupon.code}
              </h3>
              <button
                onClick={copyToClipboard}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
            <span className="text-xs text-gray-500 capitalize">
              {coupon.type}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex flex-col items-end gap-1">
          {isExpired ? (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-semibold rounded">
              Expired
            </span>
          ) : isUpcoming ? (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold rounded">
              Upcoming
            </span>
          ) : (
            <button
              onClick={() => onToggleStatus(coupon)}
              className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors ${
                coupon.is_active
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {coupon.is_active ? "Active" : "Inactive"}
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {coupon.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {coupon.description}
        </p>
      )}

      {/* Discount Info */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="flex items-center gap-2">
          {coupon.discount_type === "percentage" ? (
            <Percent className="w-4 h-4 text-[#FF6B35]" />
          ) : (
            <IndianRupee className="w-4 h-4 text-[#FF6B35]" />
          )}
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {coupon.discount_type === "percentage" ? (
                <>{coupon.discount_value}%</>
              ) : (
                <>₹{coupon.discount_value}</>
              )}
            </div>
            <div className="text-xs text-gray-500">Discount</div>
          </div>
        </div>

        {coupon.max_discount && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Max: ₹{coupon.max_discount}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {coupon.usage_count || 0}
              {coupon.usage_limit && ` / ${coupon.usage_limit}`}
            </div>
            <div className="text-xs text-gray-500">Uses</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white text-xs">
              {formatDate(coupon.expiry_date)}
            </div>
            <div className="text-xs text-gray-500">Expires</div>
          </div>
        </div>
      </div>

      {/* Conditions */}
      {coupon.min_order_amount && (
        <div className="text-xs text-gray-500 mb-4">
          Min order: ₹{coupon.min_order_amount}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
        <Button
          variant="outline"
          size="sm"
          icon={<Edit2 className="w-3.5 h-3.5" />}
          onClick={() => onEdit(coupon)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={<Trash2 className="w-3.5 h-3.5" />}
          onClick={() => onDelete(coupon)}
          className="text-red-600 hover:text-red-700 hover:border-red-300"
        >
          Delete
        </Button>
      </div>
    </motion.div>
  );
}
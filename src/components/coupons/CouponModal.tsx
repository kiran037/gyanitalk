import { useState, useEffect } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { Calendar, Percent, DollarSign, Users, Gift, Ticket } from "lucide-react";
import type { Coupon, CouponFormData } from "@/types/coupon";

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  onSave: (data: any) => void;
}

export default function CouponModal({
  isOpen,
  onClose,
  coupon,
  onSave,
}: CouponModalProps) {
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    max_discount: "",
    min_order_amount: "",
    usage_limit: "",
    usage_limit_per_user: "",
    start_date: "",
    expiry_date: "",
    type: "coupon",
    is_active: true,
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        description: coupon.description || "",
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value.toString(),
        max_discount: coupon.max_discount?.toString() || "",
        min_order_amount: coupon.min_order_amount?.toString() || "",
        usage_limit: coupon.usage_limit?.toString() || "",
        usage_limit_per_user: coupon.usage_limit_per_user?.toString() || "",
        start_date: coupon.start_date
          ? new Date(coupon.start_date).toISOString().split("T")[0]
          : "",
        expiry_date: coupon.expiry_date
          ? new Date(coupon.expiry_date).toISOString().split("T")[0]
          : "",
        type: coupon.type,
        is_active: coupon.is_active,
      });
    } else {
      setFormData({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        max_discount: "",
        min_order_amount: "",
        usage_limit: "",
        usage_limit_per_user: "",
        start_date: "",
        expiry_date: "",
        type: "coupon",
        is_active: true,
      });
    }
  }, [coupon, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: any = {
      ...formData,
      discount_value: parseFloat(formData.discount_value),
      max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
      min_order_amount: formData.min_order_amount
        ? parseFloat(formData.min_order_amount)
        : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      usage_limit_per_user: formData.usage_limit_per_user
        ? parseInt(formData.usage_limit_per_user)
        : null,
    };

    onSave(submitData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={coupon ? "Edit Coupon" : "Create New Coupon"}
      size="xl" // use the wider modal
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* use a 3-column responsive grid for the whole form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Type selection spans all columns */}
          <div className="col-span-1 md:col-span-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "coupon" })}
                className={`p-4 border-2 rounded-xl transition-all ${
                  formData.type === "coupon"
                    ? "border-[#FF6B35] bg-[#FF6B35]/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <Ticket className="w-6 h-6 mx-auto mb-2 text-[#FF6B35]" />
                <div className="font-semibold text-sm text-gray-900 dark:text-white">
                  Coupon
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "giftcard" })}
                className={`p-4 border-2 rounded-xl transition-all ${
                  formData.type === "giftcard"
                    ? "border-[#FF6B35] bg-[#FF6B35]/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <Gift className="w-6 h-6 mx-auto mb-2 text-[#FF6B35]" />
                <div className="font-semibold text-sm text-gray-900 dark:text-white">
                  Gift Card
                </div>
              </button>
            </div>
          </div>

          {/* Code (col 1) */}
          <div>
            <Input
              label="Coupon Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="SAVE20"
              required
              className="uppercase"
            />
          </div>

          {/* Discount type (col 2) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <select
              name="discount_type"
              value={formData.discount_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          {/* Discount value (col 3) */}
          <div>
            <Input
              label="Discount Value"
              name="discount_value"
              type="number"
              value={formData.discount_value}
              onChange={handleChange}
              placeholder="20"
              required
              min="0"
              step="0.01"
              icon={formData.discount_type === "percentage" ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
            />
          </div>

          {/* Description spans 3 columns so it's full width */}
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Get 20% off on your first order"
              rows={2}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
            />
          </div>

          {/* Max discount (col 1) */}
          <div>
            <Input
              label="Max Discount (₹)"
              name="max_discount"
              type="number"
              value={formData.max_discount}
              onChange={handleChange}
              placeholder="100"
              min="0"
              step="0.01"
            />
          </div>

          {/* Min order amount (col 2) */}
          <div>
            <Input
              label="Min Order Amount (₹)"
              name="min_order_amount"
              type="number"
              value={formData.min_order_amount}
              onChange={handleChange}
              placeholder="500"
              min="0"
              step="0.01"
            />
          </div>

          {/* Total usage limit (col 3) */}
          <div>
            <Input
              label="Total Usage Limit"
              name="usage_limit"
              type="number"
              value={formData.usage_limit}
              onChange={handleChange}
              placeholder="100"
              min="0"
              icon={<Users className="w-4 h-4" />}
            />
          </div>

          {/* Per-user limit (col 1) */}
          <div>
            <Input
              label="Per User Limit"
              name="usage_limit_per_user"
              type="number"
              value={formData.usage_limit_per_user}
              onChange={handleChange}
              placeholder="1"
              min="0"
            />
          </div>

          {/* Start date (col 2) */}
          <div>
            <Input
              label="Start Date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              icon={<Calendar className="w-4 h-4" />}
            />
          </div>

          {/* Expiry date (col 3) */}
          <div>
            <Input
              label="Expiry Date"
              name="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={handleChange}
              icon={<Calendar className="w-4 h-4" />}
            />
          </div>

          {/* Active toggle spans 3 */}
          <div className="md:col-span-3">
            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-5 h-5 text-[#FF6B35] rounded focus:ring-[#FF6B35]"
              />
              <div>
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  Active
                </div>
                <div className="text-xs text-gray-500">
                  Make this coupon available immediately
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            {coupon ? "Update" : "Create"} Coupon
          </Button>
        </div>
      </form>
    </Modal>
  );
}

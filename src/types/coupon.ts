// types/coupon.ts
export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_discount: number | null;
  min_order_amount: number | null;
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  start_date: string | null;
  expiry_date: string | null;
  type: "giftcard" | "coupon";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  usage_count?: number;
}

export interface CouponStats {
  overview: {
    total: number;
    active: number;
    inactive: number;
    expired: number;
    upcoming: number;
  };
  byType: {
    giftcards: number;
    coupons: number;
  };
  byDiscountType: {
    percentage: number;
    fixed: number;
  };
  usage: {
    total: number;
    totalDiscountGiven: number;
    usageByType: Record<string, number>;
  };
  recent: {
    last7Days: number;
  };
  mostUsed: {
    id: string;
    code: string;
    usage_count: number;
    description: string | null;
  } | null;
}

export interface CouponFilters {
  search: string;
  type: string;
  discount_type: string;
  is_active: string;
  status: string;
  sortBy: string;
  sortOrder: string;
}

export interface CouponFormData {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  max_discount: string;
  min_order_amount: string;
  usage_limit: string;
  usage_limit_per_user: string;
  start_date: string;
  expiry_date: string;
  type: "giftcard" | "coupon";
  is_active: boolean;
  auto_generate_code?: boolean;
}
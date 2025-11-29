// hooks/useCoupons.ts
import { useState, useEffect, useCallback } from "react";
import type { Coupon, CouponFilters, CouponStats } from "@/types/coupon";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CouponFilters>({
    search: "",
    type: "",
    discount_type: "",
    is_active: "",
    status: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      // Add filters
      if (filters.search) params.append("search", filters.search);
      if (filters.type) params.append("type", filters.type);
      if (filters.discount_type) params.append("discount_type", filters.discount_type);
      if (filters.is_active) params.append("is_active", filters.is_active);
      if (filters.status) params.append("status", filters.status);

      const res = await fetch(`/api/coupons?${params}`);
      const data = await res.json();

      if (data.success) {
        setCoupons(data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/coupons/stats");
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const refreshCoupons = () => {
    fetchCoupons();
    fetchStats();
  };

  return {
    coupons,
    stats,
    loading,
    filters,
    pagination,
    setFilters,
    setPage,
    refreshCoupons,
  };
}
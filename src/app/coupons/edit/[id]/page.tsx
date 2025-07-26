"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { getCouponDetails, updateCouponDetails } from "@/components/coupons/fetch";
import toast from "react-hot-toast";
import { Switch } from "@/components/FormElements/switch";

export default function CouponForm() {
  const params = useParams();
  const couponId = params?.id;
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (couponId) {
        try {
          const result = await getCouponDetails(couponId);
          const c = result.cDetails;

          setForm({
            code: c.code || "",
            description: c.description || "",
            type: c.type || "coupon",
            discount_type: c.discount_type || "fixed",
            discount_value: c.discount_value || "",
            max_discount: c.max_discount || "",
            min_order_amount: c.min_order_amount || "",
            usage_limit: c.usage_limit || "",
            usage_limit_per_user: c.usage_limit_per_user || "",
            start_date: c.start_date ? new Date(c.start_date) : null,
            expiry_date: c.expiry_date ? new Date(c.expiry_date) : null,
            is_active: c.is_active ?? true,
          });
        } catch (err) {
          console.error("Failed to fetch coupon details", err);
        }
      } else {
        setForm({
          code: "",
          description: "",
          type: "coupon",
          discount_type: "fixed",
          discount_value: "",
          max_discount: "",
          min_order_amount: "",
          usage_limit: "",
          usage_limit_per_user: "",
          start_date: null,
          expiry_date: null,
          is_active: false,
        });
      }
    };

    fetchData();
  }, [couponId]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      code: form.code,
      description: form.description,
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
      min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      usage_limit_per_user: form.usage_limit_per_user ? parseInt(form.usage_limit_per_user) : null,
      start_date: form.start_date || null,
      expiry_date: form.expiry_date || null,
      type: form.type,
      is_active: form.is_active,
    };

    if (couponId) {
      await updateCouponDetails(payload, Number(couponId));
      toast.success(`Coupon Updated Successfully!`);
      location.href = "/coupons";
    }
  };

  if (!form) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-6 space-y-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {couponId ? "Edit Coupon" : "Create New Coupon"}
        </h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="active-status" className="text-sm text-gray-600 dark:text-gray-300">
            Is Active?
          </Label>
          <Switch
            checked={form.is_active}
            onCheckedChange={(val) => handleChange("is_active", val)}
            withIcon
            background="light"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Coupon Code</Label>
            <Input
              value={form.code}
              onChange={(e) => handleChange("code", e.target.value)}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(val) => handleChange("type", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="coupon">Coupon</SelectItem>
                  <SelectItem value="giftcard">Giftcard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Discount Type</Label>
              <Select
                value={form.discount_type}
                onValueChange={(val) => handleChange("discount_type", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="percent">Percent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Discount Value</Label>
              <Input
                type="number"
                value={form.discount_value}
                onChange={(e) => handleChange("discount_value", e.target.value)}
              />
            </div>
            <div>
              <Label>Max Discount</Label>
              <Input
                type="number"
                value={form.max_discount}
                onChange={(e) => handleChange("max_discount", e.target.value)}
              />
            </div>
            <div>
              <Label>Min Order</Label>
              <Input
                type="number"
                value={form.min_order_amount}
                onChange={(e) => handleChange("min_order_amount", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Usage Limit</Label>
              <Input
                type="number"
                value={form.usage_limit}
                onChange={(e) => handleChange("usage_limit", e.target.value)}
              />
            </div>
            <div>
              <Label>Per User Limit</Label>
              <Input
                type="number"
                value={form.usage_limit_per_user}
                onChange={(e) => handleChange("usage_limit_per_user", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.start_date ? format(form.start_date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white">
                <Calendar
                  mode="single"
                  selected={form.start_date}
                  onSelect={(date) => handleChange("start_date", date)}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Expiry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.expiry_date ? format(form.expiry_date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white">
                <Calendar
                  mode="single"
                  selected={form.expiry_date}
                  onSelect={(date) => handleChange("expiry_date", date)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Button className="w-full text-white" onClick={handleSubmit}>
          {couponId ? "Update Coupon" : "Create Coupon"}
        </Button>
      </div>
    </div>
  );
}

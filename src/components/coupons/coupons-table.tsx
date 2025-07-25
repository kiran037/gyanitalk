import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-elements/table";
import { Button } from "@/components/ui/button";
import { getCoupons } from "./fetch";
import moment from "moment";

export async function CouponsTable() {
  const { records } = await getCoupons();

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-4 sm:p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Available Coupons
      </h2>

      <Table>
        <TableHeader>
          <TableRow className="bg-[#F9FAFB] dark:bg-gray-800 [&>th]:text-gray-600 dark:[&>th]:text-gray-300 text-sm">
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Min Order</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Validity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {records.map((item: any, index: number) => (
            <TableRow
              key={index}
              className="hover:bg-muted/40 dark:hover:bg-muted/10 transition-all border-b dark:border-gray-700"
            >
              <TableCell className="font-semibold text-gray-900 dark:text-white">
                {item.code}
              </TableCell>

              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.type === "coupon"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}
                >
                  {item.type}
                </span>
              </TableCell>

              <TableCell className="text-sm text-gray-700 dark:text-gray-200">
                ₹{item.discount_value}
              </TableCell>

              <TableCell className="text-sm text-gray-700 dark:text-gray-200">
                ₹{item.min_order_amount}
              </TableCell>

              <TableCell className="text-sm text-gray-700 dark:text-gray-200">
                {item.usage_limit} / {item.usage_limit_per_user}
              </TableCell>

              <TableCell className="text-sm text-gray-700 dark:text-gray-200">
                {moment(item.start_date).format("DD MMM")} -{" "}
                {moment(item.expiry_date).format("DD MMM")}
              </TableCell>

              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.is_active
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </TableCell>

              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300"
                    title="Edit Coupon"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-300"
                    title="Delete Coupon"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

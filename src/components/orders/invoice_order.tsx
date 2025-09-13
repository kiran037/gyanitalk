"use client";

import Image from "next/image";
import moment from "moment";
import { isValidImageUrl } from "../functions";

// Define Order type
export type Order = {
  id: number;
  payableAmount: number;
  totalPayable: number;
  gstAmount: number;
  gstPercent?: number;
  orderStatus: string;
  created_at: string;
  user: {
    name: string;
    profile?: string | null;
    contactNo: string;
    email: string;
  };
  product: {
    name: string;
    productImage?: string | null;
    product_category?: {
      name: string;
    };
  };
  order_address: {
    name: string;
    phoneNumber: string;
    flatNo: string;
    locality: string;
    landmark: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
};

// Props for InvoiceOrder component
export type OrderProps = {
  order: Order; // single order
  logo: string;
  currencySymbol: string;
  gst: number;
};

export function InvoiceOrder({ order, logo, currencySymbol, gst }: OrderProps) {
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };
  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h2 className="px-4 py-6 text-2xl font-bold text-dark dark:text-white md:px-6 xl:px-9">
        Invoice
      </h2>
        <div className="invoice p-5">
            {/* Header */}
            <div className="add-detail mt-10 flex justify-between items-center">
                <div>
                <p className="m-0 pt-2 font-bold">Invoice Id - <span className="text-gray-500">#{order.id}</span></p>
                <p className="m-0 pt-2 font-bold">
                    Order Date -{" "}
                    <span className="text-gray-500">
                        {order.created_at
                        ? moment(order.created_at)
                            .utcOffset("+05:30")
                            .format("DD MMM YYYY, hh:mm A")
                        : "-"}
                    </span>
                </p>
                </div>
                <div className="float-right logo mt-10">
                    {logo ? <Image src={logo} alt="Logo" width={60} height={60} /> : null}
                </div>
            </div>

            {/* User & Address */}
            <div className="mt-10 border">
                <table className="w-full border">
                <thead>
                    <tr>
                    <th className="w-1/2 border p-2">Details</th>
                    <th className="w-1/2 border p-2">Address</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td className="border p-2">
                        <p>Name: {order.user?.name}</p>
                        <p>Email: {order.user?.email}</p>
                        <p>Contact: {order.user?.contactNo}</p>
                    </td>
                    <td className="border p-2">
                        <p>{order.order_address?.flatNo}, {order.order_address?.landmark}</p>
                        <p>{order.order_address?.city}, {order.order_address?.state}</p>
                        <p>{order.order_address?.country} - {order.order_address?.pincode}</p>
                    </td>
                    </tr>
                </tbody>
                </table>
            </div>

            {/* Payment */}
            <div className="mt-10 border">
                <table className="w-full border">
                <thead>
                    <tr>
                    <th className="border p-2">Payment Method</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td className="border p-2">Wallet</td>
                    </tr>
                </tbody>
                </table>
            </div>

            {/* Product Table */}
            <div className="mt-10 border">
                <table className="w-full border text-center">
                <thead>
                    <tr>
                    <th className="border p-2">Category Name</th>
                    <th className="border p-2">Product Name</th>
                    <th className="border p-2">Product Image</th>
                    <th className="border p-2">Order Status</th>
                    <th className="border p-2">Subtotal</th>
                    <th className="border p-2">Tax Amount</th>
                    <th className="border p-2">Grand Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td className="border p-2">{order.product?.product_category?.name}</td>
                    <td className="border p-2">{order.product?.name}</td>
                    <td className="border p-2">
                        <Image
                            src={
                                isValidImageUrl(order?.product?.productImage)
                                ? `${process.env.NEXT_PUBLIC_BASEURL}${order.product.productImage}`
                                : "https://gyanitalk.com/build/assets/images/person.png"
                            }
                            alt={order.product?.name || "Product"}
                            width={42}
                            height={42}
                            className="rounded-full object-cover border"
                        />
                    </td>
                    <td className="border p-2">{order.orderStatus}</td>
                    <td className="border p-2">{currencySymbol}{order.payableAmount}</td>
                    <td className="border p-2">{currencySymbol}{Number(order.gstAmount).toFixed(2)} </td>
                    <td className="border p-2">{currencySymbol}{order.totalPayable}</td>
                    </tr>
                    <tr>
                    <td colSpan={7} className="border p-2 text-right">
                        <div className="flex justify-end">
                        <div className="mr-10">
                            <p>Sub Total</p>
                            <p>Tax ({gst}%)</p>
                            <p className="font-bold">Total Payable</p>
                        </div>
                        <div>
                            <p>{currencySymbol}{order.payableAmount}</p>
                            <p>{currencySymbol}{Number(order.gstAmount).toFixed(2)}</p>
                            <p className="font-bold">{currencySymbol}{order.totalPayable}</p>
                        </div>
                        </div>
                    </td>
                    </tr>
                </tbody>
                </table>
            </div>

            <h4 className="mt-5">Thanks For Order</h4>
        </div>
    </div>
  );
}

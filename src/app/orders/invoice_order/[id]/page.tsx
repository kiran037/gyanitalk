// app/orders/invoice_order/[id]/page.tsx
import { downloadInvoice } from "@/app/orders/fetch";
import { InvoicePrint } from "@/components/orders/invoice_print";

export default async function InvoiceOrderPage({
  params,
}: {
  params: { id: string };
}) {
  const orderId = Number(params.id);
  //console.log("Fetching order ID:", orderId);
  const order = await downloadInvoice(orderId);
  //console.log("Order fetched:", order);

  if (!order) {
    return <div className="p-10 text-red-600">Order not found</div>;
  }

  return (
    <InvoicePrint
      order={order}
      logo="/logo.png"
      currencySymbol="₹"
      gst={order.gstPercent ?? 18}
    />
  );
}

// components/orders/invoice_print.tsx
"use client";

import { useEffect } from "react";
import { InvoiceOrder } from "@/components/orders/invoice_order";
import { Order } from "./invoice_order";

export type InvoicePrintProps = {
  order: Order;
  logo: string;
  currencySymbol: string;
  gst: number;
};

export function InvoicePrint({
  order,
  logo,
  currencySymbol,
  gst,
}: InvoicePrintProps ) {
  useEffect(() => {
    // Open print dialog automatically
    window.print();
  }, []);

  return (
    <div className="invoice-print-area">
      <InvoiceOrder order={order} logo={logo} currencySymbol={currencySymbol} gst={gst} />
    </div>
  );
}

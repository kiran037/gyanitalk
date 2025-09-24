

// app/customers/page.tsx
import dayjs from "dayjs";
import CustomersClient from "./CustomersClient";
import { getCustomers, getAllCustomers } from "@/app/customers/fetch";

// --- deep serializer to strip Decimal/BigInt/Date for Client props ---
function toPlain(val: any): any {
  if (val === null || val === undefined) return val;

  // BigInt → string (safe for IDs)
  if (typeof val === "bigint") return val.toString();

  // Primitive
  if (typeof val !== "object") return val;

  // Detect Prisma Decimal WITHOUT importing Decimal
  const ctorName = val?.constructor?.name;
  if (ctorName === "Decimal" || (typeof val?.toNumber === "function" && typeof val?.toString === "function")) {
    try {
      return val.toNumber();
    } catch {
      return Number(val.toString());
    }
  }

  // Date → ISO string
  if (val instanceof Date) return val.toISOString();

  // Array
  if (Array.isArray(val)) return val.map(toPlain);

  // Plain object
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(val)) out[k] = toPlain(v);
  return out;
}

const toINR = (n: any) => `₹${Number(n || 0).toFixed(2)}`;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number.parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";
  const startDate = params.startDate;
  const endDate = params.endDate;

  // ✅ FAST: only paginated customers for initial render
  const { data, totalPages, total, currentPage } = await getCustomers({
    page,
    limit: 15,
    search,
    startDate,
    endDate,
  });

  // ✅ Server Action: fetch ALL only when the client calls it (Export click)
  async function exportAllAction(input: {
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<object[]> {
    "use server";
    const all = await getAllCustomers({
      search: input.search ?? "",
      startDate: input.startDate,
      endDate: input.endDate,
    });

    // Return the SAME shape your ExportButton expects (rows of plain objects)
    return (all || []).map((c: any) => ({
      ID: c.id?.toString?.() ?? c.id,
      Name: c.name || "Unnamed Customer",
      Contact: c.contactNo || "N/A",
      DOB: c.birthDate ? dayjs(c.birthDate).format("DD MMM YYYY") : "N/A",
      Joined: c.created_at ? dayjs(c.created_at).format("DD MMM YYYY") : "N/A",
      Balance: c.balance != null ? toINR(c.balance) : "N/A",
    }));
  }

  return (
    <CustomersClient
      data={toPlain(data)}
      totalPages={toPlain(totalPages)}
      total={toPlain(total)}
      currentPage={toPlain(currentPage)}
      search={toPlain(search)}
      startDate={toPlain(startDate)}
      endDate={toPlain(endDate)}
      exportAllAction={exportAllAction}
    />
  );
}

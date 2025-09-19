import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getWithdrawalMethods } from "@/components/withdrawal_methods/fetch";
import WithdrawalMethodsTable from "@/components/withdrawal_methods/withdrawal_methods-table";

export default async function WithdrawalMethodsPage() {
  // ✅ fetch data from server (server component me)
  const methods = await getWithdrawalMethods();

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Withdrawal Methods" />

      {/* Withdrawal Methods Table */}
     <WithdrawalMethodsTable methods={methods.methods} />
    </div>
  );
}

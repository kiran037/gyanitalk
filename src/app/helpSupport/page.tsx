import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getHelpSupport } from "@/components/helpSupport/fetch";
import HelpSupportForm from "@/components/helpSupport/helpsupport-form";

export default async function HelpSupportPage() {
  const helpSupportData = await getHelpSupport();

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Help Support" />
      <HelpSupportForm data={helpSupportData ?? []} />
    </div>
  );
}
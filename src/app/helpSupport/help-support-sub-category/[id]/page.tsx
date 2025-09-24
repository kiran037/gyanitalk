import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getHelpSupportSubCategories } from "@/components/helpSupport/fetch";
import HelpSupportAccordion, { HelpSupportCategory } from "@/components/helpSupport/HelpSupportAccordion";

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const supportId = Number(params.id);

  const { subCategories } = await getHelpSupportSubCategories(supportId);

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Help Support SubCategory" />
      <HelpSupportAccordion categories={subCategories ?? []} />
    </div>
  );
}

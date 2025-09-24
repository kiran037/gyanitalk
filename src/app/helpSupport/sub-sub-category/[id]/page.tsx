import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getHelpSupportSubSubCategories } from "@/components/helpSupport/fetch";
import HelpSupportSubSubCategory from "@/components/helpSupport/HelpSupportSubSubCategory";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params; // ✅ await params
  if (!id) throw new Error("Invalid route param: id not found");

  const supportId = parseInt(id, 10);
  console.log("📌 Route param id:", id, "Parsed supportId:", supportId);

  const subsubCategories = await getHelpSupportSubSubCategories(supportId);
  console.log("📌 Data from getHelpSupportSubSubCategories:", subsubCategories);

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Help Support Sub SubCategory" />
      <HelpSupportSubSubCategory subsubCategories={subsubCategories ?? []} />
    </div>
  );
}

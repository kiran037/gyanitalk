import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getSkills } from "@/components/skills_astrologer/fetch";
import { Suspense } from "react";
import { SkillAstrologerSkeleton } from "@/components/skills_astrologer/skills_astrologer-skeleton";
import SkillAstrologerTable from "@/components/skills_astrologer/skills_astrologer-table";

export default async function SkillPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
  };
}) {
  const page = parseInt(searchParams?.page || "1", 10);
  const search = searchParams?.search || "";

 // ✅ fetch data from server
const { skills, totalPages, currentPage } = await getSkills({
  page,
  limit: 15,
  search,
});

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Skills" />

      {/* Skills Astrologer Table */}
      <Suspense fallback={<SkillAstrologerSkeleton />}>
        <SkillAstrologerTable
          skills={skills}
          totalPages={totalPages}
          currentPage={currentPage}
          page={page}
          search={search}
        />
      </Suspense>  
    </div>
  );
}

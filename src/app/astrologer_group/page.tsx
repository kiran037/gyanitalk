// /src/app/astrologer_group/page.tsx
import { Suspense } from "react";
import AstrologerGroupPage from "@/components/astrologer_group/AstrologerGroupPage";

export const dynamic = "force-dynamic";

// NOTE: in Next 15, searchParams can be async. Await it before using.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const initialPage =
    typeof sp?.page === "string" ? parseInt(sp.page, 10) || 1 : 1;

  const initialSearch =
    typeof sp?.search === "string" ? sp.search : "";

  return (
    <Suspense fallback={null}>
      <AstrologerGroupPage
        initialPage={initialPage}
        initialSearch={initialSearch}
      />
    </Suspense>
  );
}

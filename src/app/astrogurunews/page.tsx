import AstroguruNewsForm from "@/components/astrogurunews/astrogurunews-form";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Suspense } from "react";


export default async function AstroguruNewsPage() {
  return (
    <div className="space-y-10">

      <Breadcrumb pageName="Astroguru News" />

      <Suspense>
        <AstroguruNewsForm />
      </Suspense>
    </div>
  );
}

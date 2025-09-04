import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { VideosForm } from "@/components/videos/videos-form";
import { Suspense } from "react";


export default async function VideosPage() {
  return (
    <div className="space-y-10">

      <Breadcrumb pageName="Ads Videos" />
      
      <Suspense>
        <VideosForm />
      </Suspense>
    </div>
  );
}

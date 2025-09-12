// app/products/edit/[id]/page.tsx
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ViewProductForm from "@/components/products/ViewProductForm";
import { getProductDetails } from "@/components/products/fetch";

export default async function ViewProductPage({ params }: { params: { id: string } }) {
  const { astroMall, currency } = await getProductDetails(params.id);

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Product Details" />
      {astroMall ? (
        <ViewProductForm astroMall={astroMall} currency={currency} />
      ) : (
        <p className="text-red-500">Product not found</p>
      )}
    </div>
  );
}

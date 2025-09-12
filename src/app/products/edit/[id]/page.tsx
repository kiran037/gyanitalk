// app/products/edit/[id]/page.tsx
import EditProductForm from "@/components/products/EditProductForm";
import { getproductCategories } from "@/components/products/fetch";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  // fetch categories from API
  const categories = await getproductCategories();

  return (
    <div className="p-6">
      <EditProductForm categories={categories} />
    </div>
  );
}

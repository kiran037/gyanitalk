import AddProductForm from "@/components/products/AddProductForm";
import { getproductCategories } from "@/components/products/fetch";

export default async function AddProductPage() {
  // ✅ Fetch categories from server
 const categories = await getproductCategories();

  return (
    <div className="mx-auto py-8 px-4">
      <AddProductForm categories={categories} />
    </div>
  );
}

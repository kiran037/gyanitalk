"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import clsx from "clsx";
import { Eye, CheckSquare, Layers, X, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { getProducts, getproductCategories } from "./fetch";
import { ProductStatusToggle } from "./updateProductStatus";
import { isValidImageUrl } from "../functions";

// ------------------ Types ------------------
type Product = {
  id: number;
  name: string;
  productImage: string;
  amount: number;
  product_category: {
    id: number;
    name: string;
  } | null;
  features: string;
  created_at: string;
  isActive: boolean;
};

type ProductCardProps = {
  search?: string;
};

// ------------------ Helpers ------------------
function productSrcOf(item: any) {
  const src = item?.productImage ?? "";
  if (!isValidImageUrl(src)) {
    return "https://gyanitalk.com/build/assets/images/person.png";
  }
  return /^https?:\/\//i.test(src)
    ? src
    : `${process.env.NEXT_PUBLIC_BASEURL ?? ""}${src}`;
}

// ------------------ Component ------------------
export default function ProductCategoriesForm({
  page = 1,
  limit = 15,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 400;

  const [ProductCategories, setProductCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(page); // page from props
  const [totalPages, setTotalPages] = useState(1);

  // ✅ Fetch both product + categories
  async function fetchProducts() {
    try {
      setLoading(true);
      const [bRes, tRes] = await Promise.all([
        getProducts({ search, page }),
        getproductCategories(),
      ]);

      setProducts(bRes.data || []);
      setProductCategories(tRes.data || []);
      setTotalPages(bRes.totalPages || 1); // backend se totalPages lana hoga
      setCurrentPage(bRes.currentPage || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [search, page]);

  // ------------------ UI ------------------
  return (
    <div style={{ marginTop: "-30px" }}>
      {/* Add button */}
      <div className="flex justify-end mb-4">
        <Link
          href="/products/create"
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Create New Product
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-12 gap-6 mt-5 grid-table">
          {products.map((item) => {
            const isActive = !!item.isActive;
            const plainText = item.features?.replace(/<[^>]+>/g, "") || "";
            const truncatedText =
              plainText.length > maxLength
                ? plainText.substring(0, maxLength) + "..."
                : plainText;

            return (
              <div
                key={item.id}
                className="intro-y col-span-12 sm:col-span-6 2xl:col-span-4 xl:col-span-4 bg-white"
              >
                <div className="box">
                  <div className="p-5">
                    {/* Image + Dropdown */}
                    <div className="relative h-[320px] before:block before:absolute before:w-full before:h-full before:top-0 before:left-0 before:z-10 before:bg-gradient-to-t before:from-black/90 before:to-black/10 image-fit">
                      <Image
                        src={productSrcOf(item)}
                        alt="Product image"
                        width={400}
                        height={200}
                        className="rounded-t-md object-cover w-full h-full"
                      />
                      <span
                        className={`absolute top-3 left-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>

                      {/* Product name & date */}
                      <div className="absolute bottom-0 text-white px-5 pb-6 z-10">
                        <p className="block font-medium text-base">{item.name}</p>
                        <span className="text-white/90 text-xs mt-3">
                          {new Date(item.created_at).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="text-slate-600 dark:text-slate-500 mt-5 space-y-2">
                      <div className="flex items-center">
                        <LinkIcon className="w-4 h-4 mr-2" /><span className="font-semibold">Amount: </span>{item.amount}
                      </div>
                      <div className="flex items-center">
                        <LinkIcon className="w-4 h-4 mr-2" /><span className="font-semibold">Product Category: </span>{" "}
                        {item.product_category?.name || "N/A"}
                      </div>
                      <div className="flex items-start"> 
                        <Layers className="w-4 h-4 mr-2 mt-1" />{" "}
                          {isExpanded ? (
                            <div
                              dangerouslySetInnerHTML={{ __html: item.features }}
                            />
                          ) : (
                            <p>{truncatedText}</p>
                          )}
                      </div>
                      {plainText.length > maxLength && (
                        <button
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="mt-2 text-blue-600 text-sm hover:underline"
                        >
                          {isExpanded ? "Read Less" : "Read More"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex justify-between items-center p-5 border-t border-slate-200/60 dark:border-darkmode-400">
                    {/* Left side (View + Edit Buttons) */}
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/products/view/${item.id}`}
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <Eye className="w-4 h-4 mr-2" /> View
                      </Link>

                      <Link
                        href={`/products/edit/${item.id}`}
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <CheckSquare className="w-4 h-4 mr-2" /> Edit
                      </Link>
                    </div>

                    {/* Right side (Status Toggle) */}
                    <ProductStatusToggle
                      className="toggle-class show-code form-check-input"
                      id={item.id}
                      status={item.isActive}
                    />
                  </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

    {/* ✅ Pagination */}
      {/* <div className="mt-6 flex justify-end gap-2 flex-wrap text-sm">
        {Array.from({ length: totalPages }, (_, i) => {
          const pageNum = i + 1;
          const isLast = pageNum === totalPages;
          const isCurrent = pageNum === currentPage;

          const shouldShow =
            pageNum <= 3 ||
            pageNum === totalPages ||
            pageNum === currentPage ||
            pageNum === currentPage - 1 ||
            pageNum === currentPage + 1;

          if (!shouldShow) {
            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return <span key={i}>...</span>;
            }
            return null;
          }

          return (
            <a
              key={i}
              href={`?page=${pageNum}${search ? `&search=${search}` : ""}`}
              className={clsx(
                "px-3 py-1 border rounded",
                isCurrent
                  ? "bg-blue-600 text-white"
                  : "bg-white text-black dark:bg-dark dark:text-white"
              )}
            >
              {isLast ? "Last" : pageNum}
            </a>
          );
        })}
      </div> */}
    </div>
  );
}
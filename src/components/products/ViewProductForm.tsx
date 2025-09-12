"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Plus, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getProductDetails, addProductDetails } from "@/components/products/fetch";

// ---------------- Types ----------------
type QuestionAnswer = {
  id: number;
  question: string;
  answer: string;
};

type AstroMall = {
  id?: number;
  productImage: string;
  name: string;
  features: string;
  amount: number;
  questionAnswer: QuestionAnswer[];
};

type Props = {
  astroMall: AstroMall;
  currency: { value: string };
};

// ✅ Fallback banner image
function bannerSrcOf(item: { productImage?: string }) {
  const src = item?.productImage ?? "";
  if (!src) {
    return "https://gyanitalk.com/build/assets/images/person.png";
  }

  if (/^https?:\/\//i.test(src)) {
    return src;
  }

  return `${process.env.NEXT_PUBLIC_BASEURL ?? ""}${src}`;
}

  export default function ViewProductForm({ astroMall, currency }: Props) {
    const params = useParams();
    const productId = params?.id as string; // Next.js route param

    const [loading, setLoading] = useState(false);
  
    // modal states
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<any>({
      astromallProductId: null,
      question: "",
      answer: "",
    });

// ---------------- Fetch Product Details ----------------
async function fetchData(id: string) {
  try {
    setLoading(true);
    const result = await getProductDetails(id);

    if (result?.pDetails) {
      result.pDetails;
    }
  } catch (err) {
    console.error("Failed to fetch product details", err);
  } finally {
    setLoading(false);
  }
}

// ------------------ Modal Handlers ------------------
  function openAddDetailModal(productId: string) {
  setFormData({
    astromallProductId: productId, // ✅ inject productId
    question: "",
    answer: "",
  });
  setShowModal(true);
}

async function handleSave() {
  try {
    const payload = {
      astromallProductId: formData.astromallProductId,
      question: formData.question,
      answer: formData.answer,
    };

    await addProductDetails(payload);
    toast.success("Product detail added!");
    setShowModal(false);

    // ✅ Refresh details after save
    fetchData(productId);
  } catch (err) {
    console.error(err);
    toast.error("Failed to save");
  }
}

// Initial fetch
useEffect(() => {
  fetchData(productId);
}, [productId]);

  return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-6 space-y-6 w-full relative">
        {/* Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white/60 dark:bg-gray-900/60 z-10 rounded-2xl">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
          </div>
        )}
      {/* 🔧 NEW: Add Detail button */}
      <div className="flex justify-end">
          <button
              onClick={() => openAddDetailModal(productId)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
              <Plus size={16} /> Add Detail
          </button>
      </div>

      {/* Product Section */}
      <div className="box p-5 rounded-md">  
        <div className="intro-y grid grid-cols-12 gap-5"> 
          {/* Image column */}
          <div className="col-span-12 lg:col-span-3">
            <Image
              className="tooltip rounded"
              src={bannerSrcOf(astroMall)}
              alt={astroMall.name}
              width={150}
              height={150}
            />
          </div>

          {/* Details column */}
          <div className="col-span-12 lg:col-span-9">
            <div className="items-center">
              <div className="font-medium text-base truncate text-[25px]">
                {astroMall.name}
              </div>
              <div className="font text-base truncate mt-4">
                {astroMall.features}
              </div>
              <div className="font-medium text-base truncate mt-3">
                {currency.value} {astroMall.amount}
              </div>
            </div>
          </div>

        </div> 
      </div>  

      {/* Question Answer */}
      <div className="grid sm:grid-cols-1 gap-4">
        {astroMall.questionAnswer?.map((qa) => (
        <div key={qa.id} className="w-full border p-4 rounded-md shadow-sm bg-gray dark:bg-gray-800">
          <div className="items-center">
            <div className="font-medium text-base truncate text-[16px]">
              {qa.question}
            </div>
            <div className="font text-base truncate">{qa.answer}</div>
          </div>
        </div>
        ))}
      </div>

    {/* Add Detail Modal */}
    {showModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {"➕ Add Product Detail"}
            </h2>
            <button onClick={() => setShowModal(false)}>
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="grid gap-4"
          >
            {/* Hidden product id */}
            <input type="hidden" value={formData.astromallProductId ?? ""} />
            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                placeholder="Question"
                required
                className="w-full rounded-md border px-3 py-2 text-sm focus:ring focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Answer</label>
              <textarea
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                placeholder="Answer"
                required
                className="w-full rounded-md border px-3 py-2 text-sm focus:ring focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mr-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
              >
                {"Add Product Detail"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )} 
    </div>
  );
}
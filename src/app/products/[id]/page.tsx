// // /app/products/[id]/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import Image from "next/image";
// import { Plus, X, Loader2 } from "lucide-react";
// import toast from "react-hot-toast";

// import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
// import { getProductDetails, addProductDetails } from "../fetch";

// // ---------------- Types ----------------
// type QuestionAnswer = {
//   id: number;
//   question: string;
//   answer: string;
// };

// type AstroMall = {
//   id?: number;
//   productImage: string;
//   name: string;
//   features: string;
//   amount: number;
//   questionAnswer: QuestionAnswer[];
// };

// type Currency = { value: string };

// // ✅ Fallback banner image
// function bannerSrcOf(item?: { productImage?: string }) {
//   const src = item?.productImage ?? "";
//   if (!src) return "https://gyanitalk.com/build/assets/images/person.png";
//   return /^https?:\/\//i.test(src) ? src : `${process.env.NEXT_PUBLIC_BASEURL ?? ""}${src}`;
// }

// export default function ViewProductPage() {
//   const params = useParams();
//   const productId = params?.id as string;

//   const [loading, setLoading] = useState(false);
//   const [astroMall, setAstroMall] = useState<AstroMall | null>(null);
//   const [currency, setCurrency] = useState<Currency>({ value: "₹" });

//   // Add Q/A modal
//   const [showModal, setShowModal] = useState(false);
//   const [qaForm, setQaForm] = useState({ question: "", answer: "" });

//   const fetchData = async () => {
//     if (!productId) return;
//     try {
//       setLoading(true);
//       const result = await getProductDetails(productId);
//       const am = (result?.astroMall ?? result?.pDetails) as AstroMall | undefined;
//       if (am) setAstroMall(am);
//       if (result?.currency) setCurrency(result.currency);
//     } catch (err) {
//       console.error("Failed to fetch product details", err);
//       toast.error("Failed to fetch product details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveDetail = async () => {
//     try {
//       await addProductDetails({
//         astromallProductId: Number(productId),
//         question: qaForm.question,
//         answer: qaForm.answer,
//       });
//       toast.success("Product detail added!");
//       setShowModal(false);
//       setQaForm({ question: "", answer: "" });
//       fetchData();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to save");
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [productId]);

//   return (
//     <div className="space-y-10 relative">
//       <Breadcrumb pageName="Product Details" />

//       <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-6 space-y-6 w-full relative">
//         {/* Loader Overlay */}
//         {loading && (
//           <div className="absolute inset-0 flex justify-center items-center bg-white/60 dark:bg-gray-900/60 z-10 rounded-2xl">
//             <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
//           </div>
//         )}

//         {/* Add Detail */}
//         <div className="flex justify-end">
//           <button
//             onClick={() => setShowModal(true)}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//           >
//             <Plus size={16} /> Add Detail
//           </button>
//         </div>

//         {/* Product Section */}
//         {astroMall ? (
//           <div className="box p-5 rounded-md">
//             <div className="grid grid-cols-12 gap-5">
//               {/* Image */}
//               <div className="col-span-12 lg:col-span-3">
//                 <Image
//                   className="tooltip rounded"
//                   src={bannerSrcOf(astroMall)}
//                   alt={astroMall.name}
//                   width={150}
//                   height={150}
//                 />
//               </div>

//               {/* Details */}
//               <div className="col-span-12 lg:col-span-9">
//                 <div className="items-center">
//                   <div className="font-medium text-base truncate text-[25px]">{astroMall.name}</div>
//                   <div className="text-base mt-4">{astroMall.features}</div>
//                   <div className="font-medium text-base mt-3">
//                     {currency.value} {astroMall.amount}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           !loading && <p className="text-rose-600">Product not found</p>
//         )}

//         {/* Question Answer */}
//         <div className="grid sm:grid-cols-1 gap-4">
//           {astroMall?.questionAnswer?.length ? (
//             astroMall.questionAnswer.map((qa) => (
//               <div key={qa.id} className="w-full border p-4 rounded-md shadow-sm bg-white dark:bg-gray-800">
//                 <div className="font-medium text-[16px]">{qa.question}</div>
//                 <div className="text-sm mt-1">{qa.answer}</div>
//               </div>
//             ))
//           ) : (
//             <p className="text-sm text-slate-500">No details added yet.</p>
//           )}
//         </div>
//       </div>

//       {/* Add Detail Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg w-full max-w-2xl p-6">
//             <div className="flex justify-between mb-4">
//               <h2 className="text-xl font-semibold">➕ Add Product Detail</h2>
//               <button onClick={() => setShowModal(false)}>
//                 <X className="w-5 h-5 text-slate-500" />
//               </button>
//             </div>

//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 handleSaveDetail();
//               }}
//               className="grid gap-4"
//             >
//               <div>
//                 <label className="block text-sm font-medium mb-1">Question</label>
//                 <input
//                   type="text"
//                   value={qaForm.question}
//                   onChange={(e) => setQaForm((p) => ({ ...p, question: e.target.value }))}
//                   placeholder="Question"
//                   required
//                   className="w-full rounded-md border px-3 py-2 text-sm focus:ring focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Answer</label>
//                 <textarea
//                   value={qaForm.answer}
//                   onChange={(e) => setQaForm((p) => ({ ...p, answer: e.target.value }))}
//                   placeholder="Answer"
//                   required
//                   className="w-full rounded-md border px-3 py-2 text-sm focus:ring focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//               </div>

//               <div className="flex justify-end pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="mr-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
//                 >
//                   Add Product Detail
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /app/products/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Plus, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getProductDetails, addProductDetails } from "../fetch";

type QuestionAnswer = { id: number; question: string; answer: string };
type AstroMall = {
  id?: number;
  productImage: string;
  name: string;
  features: string;
  amount: number;
  questionAnswer: QuestionAnswer[];
};
type Currency = { value: string };

function bannerSrcOf(item?: { productImage?: string }) {
  const src = item?.productImage ?? "";
  if (!src) return "https://gyanitalk.com/build/assets/images/person.png";
  return /^https?:\/\//i.test(src) ? src : `${process.env.NEXT_PUBLIC_BASEURL ?? ""}${src}`;
}

export default function ViewProductPage() {
  const params = useParams();
  const productId = params?.id as string;
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [astroMall, setAstroMall] = useState<AstroMall | null>(null);
  const [currency, setCurrency] = useState<Currency>({ value: "₹" });

  const [showModal, setShowModal] = useState(false);
  const [qaForm, setQaForm] = useState({ question: "", answer: "" });

  const fetchData = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const result = await getProductDetails(productId);
      const am = (result?.astroMall ?? result?.pDetails) as AstroMall | undefined;
      if (am) setAstroMall(am);
      if (result?.currency) setCurrency(result.currency);
    } catch (err: any) {
      console.error("fetch error", err);
      toast("error", "Error", "Failed to fetch product details");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDetail = async () => {
    try {
      await addProductDetails({
        astromallProductId: Number(productId),
        question: qaForm.question,
        answer: qaForm.answer,
      });
      toast("success", "Saved", "Product detail added!");
      setShowModal(false);
      setQaForm({ question: "", answer: "" });
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast("error", "Error", "Failed to save product detail");
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return (
    <div className="space-y-10 relative">
      <Breadcrumb pageName="Product Details" />

      <div className="relative rounded-2xl border border-white/20 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg p-6 space-y-6">
        {/* Loader overlay */}
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md z-10">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
          </div>
        )}

        {/* Add Detail */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow hover:scale-105 transition"
          >
            <Plus size={16} /> Add Detail
          </button>
        </div>

        {/* Product Section */}
        {astroMall ? (
          <div className="grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 lg:col-span-3 flex justify-center">
              <Image
                src={bannerSrcOf(astroMall)}
                alt={astroMall.name}
                width={200}
                height={200}
                className="rounded-xl shadow-md object-cover"
              />
            </div>

            <div className="col-span-12 lg:col-span-9 space-y-4">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {astroMall.name}
              </h1>
              <p className="text-slate-700 dark:text-slate-300">{astroMall.features}</p>
              <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400">
                {currency.value} {astroMall.amount}
              </p>
            </div>
          </div>
        ) : (
          !loading && <p className="text-rose-600">Product not found</p>
        )}

        {/* Q&A Section */}
        <div className="grid gap-4">
          {astroMall?.questionAnswer?.length ? (
            astroMall.questionAnswer.map((qa) => (
              <div
                key={qa.id}
                className="rounded-xl border border-white/20 bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl p-4 shadow hover:scale-[1.01] transition"
              >
                <div className="font-medium text-slate-900 dark:text-white">{qa.question}</div>
                <div className="text-sm text-slate-700 dark:text-slate-300 mt-1">{qa.answer}</div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No details added yet.</p>
          )}
        </div>
      </div>

      {/* Add Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/20 bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                ➕ Add Product Detail
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-300" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveDetail();
              }}
              className="grid gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <input
                  type="text"
                  value={qaForm.question}
                  onChange={(e) => setQaForm((p) => ({ ...p, question: e.target.value }))}
                  placeholder="Question"
                  required
                  className="w-full rounded-lg border border-white/30 bg-white/60 dark:bg-slate-800/60 px-3 py-2 text-sm backdrop-blur-md focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Answer</label>
                <textarea
                  value={qaForm.answer}
                  onChange={(e) => setQaForm((p) => ({ ...p, answer: e.target.value }))}
                  placeholder="Answer"
                  required
                  className="w-full rounded-lg border border-white/30 bg-white/60 dark:bg-slate-800/60 px-3 py-2 text-sm backdrop-blur-md focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-4 gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm shadow"
                >
                  Add Product Detail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

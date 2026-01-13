// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   ScrollText, Plus, MapPin, Calendar, Trash2, Loader2, 
//   ChevronRight, Clock, ArrowLeft 
// } from "lucide-react";
// import Link from "next/link";
// import toast from "react-hot-toast";

// interface Kundali {
//   id: string;
//   name: string;
//   gender: string;
//   birthDate: string;
//   birthTime: string;
//   birthPlace: string;
// }

// export default function KundaliPage() {
//   const [kundalis, setKundalis] = useState<Kundali[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const res = await fetch("/api/landing/profile/kundali");
//       const data = await res.json();
//       if (data.success) setKundalis(data.data);
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to load kundalis");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteKundali = async (id: string) => {
//     if (!confirm("Delete this Kundali?")) return;

//     // Optimistic UI update
//     const previous = [...kundalis];
//     setKundalis((prev) => prev.filter((k) => k.id !== id));

//     try {
//       const res = await fetch(`/api/landing/profile/kundali/${id}`, { method: "DELETE" });
//       const data = await res.json();
//       if (!data.success) throw new Error(data.error);
//       toast.success("Deleted successfully");
//     } catch (e) {
//       toast.error("Could not delete");
//       setKundalis(previous); // Revert
//     }
//   };

//   // Helper to format date without timezone shifting
//   // Accepts ISO string (e.g., 2000-01-01T00:00:00.000Z) and displays it as 01 Jan 2000
//   const formatDateSafe = (dateString: string) => {
//     try {
//         if (!dateString) return "";
//         // Create a date object but work with UTC methods to avoid local timezone shifts
//         const date = new Date(dateString);
        
//         return new Intl.DateTimeFormat('en-GB', {
//             day: 'numeric',
//             month: 'short',
//             year: 'numeric',
//             timeZone: 'UTC' // Forces the formatter to use the date exactly as stored
//         }).format(date);
//     } catch (e) {
//         return dateString;
//     }
//   };

//   return (
//     <div className="space-y-5 w-full max-w-4xl mx-auto px-4 sm:px-0 pb-6">
      
//       {/* Header */}
//       <div className="flex items-center justify-between gap-4">
//         <div className="flex items-center gap-3">
//             <Link 
//                 href="/profile" 
//                 className="lg:hidden p-2 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-sm"
//             >
//                 <ArrowLeft className="h-4 w-4" />
//             </Link>
//             <div>
//                 <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Saved Kundalis</h1>
//                 <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Manage your birth charts.</p>
//             </div>
//         </div>
        
//         {/* Create Button (Icon only on mobile to save space) */}
//         <Link
//             href="/free-kundali"
//             className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B35] text-white font-bold text-xs md:text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
//         >
//             <Plus className="h-4 w-4" />
//             <span className="hidden sm:inline">Create New</span>
//             <span className="sm:hidden">New</span>
//         </Link>
//       </div>

//       <div className="min-h-[300px]">
//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-12">
//             <Loader2 className="h-6 w-6 animate-spin text-[#FF6B35] mb-2" />
//             <p className="text-xs text-gray-500">Loading charts...</p>
//           </div>
//         ) : kundalis.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-white/5">
//             <div className="h-12 w-12 bg-orange-50 dark:bg-orange-900/10 rounded-full flex items-center justify-center mb-3">
//                 <ScrollText className="h-6 w-6 text-[#FF6B35]" />
//             </div>
//             <h3 className="text-sm font-bold text-gray-900 dark:text-white">No Kundalis Found</h3>
//             <p className="text-xs text-gray-500 mt-1 mb-4 max-w-[200px]">
//               Create a kundali to get insights.
//             </p>
//             <Link
//               href="/free-kundali"
//               className="px-4 py-2 rounded-lg border border-[#FF6B35] text-[#FF6B35] text-xs font-bold hover:bg-[#FF6B35] hover:text-white transition-all"
//             >
//               Create Now
//             </Link>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             <AnimatePresence>
//             {kundalis.map((k, i) => (
//               <motion.div
//                 key={k.id}
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.95 }}
//                 transition={{ delay: i * 0.05 }}
//                 className="relative p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 shadow-sm group"
//               >
//                 {/* Header */}
//                 <div className="flex justify-between items-start mb-3">
//                     <div className="flex items-center gap-3">
//                         <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
//                             k.gender.toLowerCase() === 'male' 
//                             ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30' 
//                             : 'bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-900/30'
//                         }`}>
//                             {k.name.charAt(0)}
//                         </div>
//                         <div className="min-w-0">
//                             <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{k.name}</h3>
//                             <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{k.gender}</p>
//                         </div>
//                     </div>
                    
//                     <button
//                         onClick={() => deleteKundali(k.id)}
//                         className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
//                     >
//                         <Trash2 className="h-4 w-4" />
//                     </button>
//                 </div>

//                 {/* Details */}
//                 <div className="grid grid-cols-2 gap-y-2 text-[11px] text-gray-500 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-white/5 p-2.5 rounded-lg">
//                     <div className="flex items-center gap-1.5">
//                         <Calendar className="h-3 w-3 text-[#FF6B35]" />
//                         {/* SAFE DATE FORMATTING USED HERE */}
//                         <span>{formatDateSafe(k.birthDate)}</span>
//                     </div>
//                     <div className="flex items-center gap-1.5">
//                         <Clock className="h-3 w-3 text-[#FF6B35]" />
//                         <span>{k.birthTime}</span>
//                     </div>
//                     <div className="col-span-2 flex items-center gap-1.5 truncate">
//                         <MapPin className="h-3 w-3 text-[#FF6B35] shrink-0" />
//                         <span className="truncate">{k.birthPlace}</span>
//                     </div>
//                 </div>

//                 {/* Link */}
//                 <Link
//                   href={`/free-kundali/view/${k.id}`}
//                   className="flex items-center justify-center w-full py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 transition-opacity"
//                 >
//                   View Report <ChevronRight className="h-3 w-3 ml-1" />
//                 </Link>
//               </motion.div>
//             ))}
//             </AnimatePresence>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ScrollText, Plus, MapPin, Calendar, Trash2, Loader2, 
  ChevronRight, Clock, ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Kundali {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}

export default function KundaliPage() {
  const [kundalis, setKundalis] = useState<Kundali[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/landing/profile/kundali");
      const data = await res.json();
      if (data.success) setKundalis(data.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load kundalis");
    } finally {
      setLoading(false);
    }
  };

  const deleteKundali = async (id: string) => {
    if (!confirm("Delete this Kundali?")) return;

    const previous = [...kundalis];
    setKundalis((prev) => prev.filter((k) => k.id !== id));

    try {
      const res = await fetch(`/api/landing/profile/kundali/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Deleted successfully");
    } catch (e) {
      toast.error("Could not delete");
      setKundalis(previous);
    }
  };

  const formatDateSafe = (dateString: string) => {
    try {
        if (!dateString) return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC'
        }).format(date);
    } catch (e) {
        return dateString;
    }
  };

  return (
    <div className="space-y-5 w-full max-w-4xl mx-auto px-4 sm:px-0 pb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <Link 
                href="/profile" 
                className="lg:hidden p-2 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-sm"
            >
                <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Saved Kundalis</h1>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Manage your birth charts.</p>
            </div>
        </div>
        
        <Link
            href="/free-kundali"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B35] text-white font-bold text-xs md:text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
        >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create New</span>
            <span className="sm:hidden">New</span>
        </Link>
      </div>

      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#FF6B35] mb-2" />
            <p className="text-xs text-gray-500">Loading charts...</p>
          </div>
        ) : kundalis.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="h-12 w-12 bg-orange-50 dark:bg-orange-900/10 rounded-full flex items-center justify-center mb-3">
                <ScrollText className="h-6 w-6 text-[#FF6B35]" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">No Kundalis Found</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 max-w-[200px]">
              Create a kundali to get insights.
            </p>
            <Link href="/free-kundali" className="px-4 py-2 rounded-lg border border-[#FF6B35] text-[#FF6B35] text-xs font-bold hover:bg-[#FF6B35] hover:text-white transition-all">
              Create Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence>
            {kundalis.map((k, i) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="relative p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 shadow-sm group"
              >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                            k.gender.toLowerCase() === 'male' 
                            ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30' 
                            : 'bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-900/30'
                        }`}>
                            {k.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{k.name}</h3>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{k.gender}</p>
                        </div>
                    </div>
                    
                    <button onClick={() => deleteKundali(k.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-[11px] text-gray-500 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-white/5 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-[#FF6B35]" />
                        <span>{formatDateSafe(k.birthDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-[#FF6B35]" />
                        <span>{k.birthTime}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5 truncate">
                        <MapPin className="h-3 w-3 text-[#FF6B35] shrink-0" />
                        <span className="truncate">{k.birthPlace}</span>
                    </div>
                </div>

                {/* Updated Link to the new profile view page */}
                <Link
                  href={`/profile/kundali/${k.id}`}
                  className="flex items-center justify-center w-full py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  View Report <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// "use client";

// import { useState, useEffect } from 'react';
// import LandingWrapper from '@/components/landing/LandingWrapper';
// import { motion } from 'framer-motion';
// import { 
//   Sparkles, Calendar, Clock, User, MapPin, 
//   ChevronDown, Loader2, Star, TrendingUp,
//   Lock, Check, AlertCircle, Phone, History
// } from 'lucide-react';
// import LocationInput from '@/components/landing/kundali/LocationInput';
// import KundliResult from '@/components/landing/kundali/KundliResult';
// import { LocationResult } from '@/lib/location-api';

// interface SavedKundli {
//   name: string;
//   contactNo: string;
//   birthDate: string;
//   birthTime: string;
//   birthPlace: string;
//   latitude: number;
//   longitude: number;
//   timezone: string;
//   gender: 'male' | 'female' | 'other';
// }

// export default function KundaliGenerateClient() {
//   const [step, setStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<any>(null);
//   const [savedKundlis, setSavedKundlis] = useState<SavedKundli[]>([]);
//   const [showSavedList, setShowSavedList] = useState(false);
  
//   const [formData, setFormData] = useState({
//     name: '',
//     contactNo: '',
//     countryCode: '+91',
//     gender: 'male' as 'male' | 'female' | 'other',
//     birthDate: '',
//     birthTime: '',
//     birthPlace: '',
//     latitude: 0,
//     longitude: 0,
//     timezone: '5.5',
//     language: 'en'
//   });

//   const [errors, setErrors] = useState<Record<string, string>>({});

//   // Load saved kundlis from localStorage on mount
//   useEffect(() => {
//     const saved = localStorage.getItem('savedKundlis');
//     if (saved) {
//       try {
//         setSavedKundlis(JSON.parse(saved));
//       } catch (e) {
//         console.error('Failed to parse saved kundlis', e);
//       }
//     }
//   }, []);

//   const validate = () => {
//     const newErrors: Record<string, string> = {};
    
//     if (!formData.name || formData.name.length < 2) {
//       newErrors.name = 'Name must be at least 2 characters';
//     }

//     if (!formData.contactNo || formData.contactNo.length < 10) {
//       newErrors.contactNo = 'Valid mobile number is required';
//     }
    
//     if (!formData.birthDate) {
//       newErrors.birthDate = 'Birth date is required';
//     }
    
//     if (!formData.birthTime) {
//       newErrors.birthTime = 'Birth time is required';
//     }
    
//     if (!formData.birthPlace) {
//       newErrors.birthPlace = 'Birth place is required';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validate()) return;
    
//     setLoading(true);
//     try {
//       const response = await fetch('/api/landing/kundali/generate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           birthDetails: formData,
//           language: formData.language
//         })
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         // Save to localStorage
//         const savedKundli: SavedKundli = {
//           name: formData.name,
//           contactNo: formData.contactNo,
//           birthDate: formData.birthDate,
//           birthTime: formData.birthTime,
//           birthPlace: formData.birthPlace,
//           latitude: formData.latitude,
//           longitude: formData.longitude,
//           timezone: formData.timezone,
//           gender: formData.gender
//         };

//         const existing = savedKundlis.filter(
//           k => k.contactNo !== formData.contactNo || k.name !== formData.name
//         );
//         const updated = [savedKundli, ...existing].slice(0, 5); // Keep last 5
//         setSavedKundlis(updated);
//         localStorage.setItem('savedKundlis', JSON.stringify(updated));

//         setResult(data);
//         setStep(2);
//       } else {
//         alert(data.message || 'Failed to generate kundli');
//       }
//     } catch (error) {
//       console.error(error);
//       alert('An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadSavedKundli = (kundli: SavedKundli) => {
//     setFormData({
//       ...formData,
//       name: kundli.name,
//       contactNo: kundli.contactNo,
//       birthDate: kundli.birthDate,
//       birthTime: kundli.birthTime,
//       birthPlace: kundli.birthPlace,
//       latitude: kundli.latitude,
//       longitude: kundli.longitude,
//       timezone: kundli.timezone,
//       gender: kundli.gender
//     });
//     setShowSavedList(false);
//   };

//   return (
//     <LandingWrapper>
//       {/* Hero */}
//       <section className="relative overflow-hidden px-4 pb-6 pt-24 sm:px-6 sm:pb-8 sm:pt-28 lg:px-8">
//         {/* Background */}
//         <div className="absolute inset-0">
//           <div className="absolute inset-0" style={{
//             backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)",
//             backgroundSize: "40px 40px"
//           }} />
//         </div>

//         <div className="relative z-10 mx-auto max-w-7xl text-center">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="space-y-5"
//           >
//             <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 px-4 py-2 backdrop-blur-sm">
//               <Sparkles className="h-4 w-4 text-[#FF6B35]" />
//               <span className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
//                 FREE KUNDLI GENERATION
//               </span>
//             </div>

//             <h1 className="text-3xl font-bold sm:text-5xl lg:text-6xl">
//               <span className="text-gray-900 dark:text-white">Generate Your </span>
//               <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
//                 Vedic Kundli
//               </span>
//             </h1>

//             <p className="mx-auto max-w-2xl text-sm text-gray-600 dark:text-gray-400 sm:text-lg">
//               Get your complete birth chart with planetary positions and predictions - absolutely free!
//             </p>
//           </motion.div>
//         </div>
//       </section>

//       {/* Form Section */}
//       {step === 1 && (
//         <section className="px-4 py-8 sm:px-6 lg:px-8">
//           <div className="mx-auto max-w-2xl">
//             <motion.div
//               className="rounded-2xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:p-8"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//             >
//               <div className="mb-6 space-y-2 text-center">
//                 <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
//                   Enter Birth Details
//                 </h2>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   Accurate details ensure precise predictions
//                 </p>
//               </div>

//               {/* Saved Kundlis Button */}
//               {savedKundlis.length > 0 && (
//                 <div className="mb-6">
//                   <button
//                     onClick={() => setShowSavedList(!showSavedList)}
//                     className="flex w-full items-center justify-between rounded-xl border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/5 to-[#FFB347]/5 px-4 py-3 text-sm font-medium text-gray-900 transition-all hover:border-[#FF6B35]/40 dark:text-white"
//                   >
//                     <div className="flex items-center gap-2">
//                       <History className="h-4 w-4 text-[#FF6B35]" />
//                       <span>Load Previous Details</span>
//                     </div>
//                     <ChevronDown className={`h-4 w-4 transition-transform ${showSavedList ? 'rotate-180' : ''}`} />
//                   </button>

//                   {/* Saved List Dropdown */}
//                   {showSavedList && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: 'auto' }}
//                       exit={{ opacity: 0, height: 0 }}
//                       className="mt-3 space-y-2 rounded-xl border border-gray-200/60 bg-white/80 p-3 dark:border-gray-700/60 dark:bg-white/5"
//                     >
//                       {savedKundlis.map((kundli, idx) => (
//                         <button
//                           key={idx}
//                           onClick={() => loadSavedKundli(kundli)}
//                           className="w-full rounded-lg border border-gray-200/60 bg-white/60 p-3 text-left transition-all hover:border-[#FF6B35]/40 hover:bg-[#FF6B35]/5 dark:border-gray-700/60 dark:bg-white/5"
//                         >
//                           <div className="flex items-center justify-between">
//                             <div>
//                               <p className="font-semibold text-gray-900 dark:text-white">{kundli.name}</p>
//                               <p className="text-xs text-gray-600 dark:text-gray-400">
//                                 {kundli.contactNo} • {kundli.birthDate}
//                               </p>
//                             </div>
//                             <Check className="h-4 w-4 text-[#FF6B35]" />
//                           </div>
//                         </button>
//                       ))}
//                     </motion.div>
//                   )}
//                 </div>
//               )}

//               <div className="space-y-4">
//                 {/* Name */}
//                 <div>
//                   <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Full Name <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
//                     <input
//                       type="text"
//                       value={formData.name}
//                       onChange={(e) => setFormData({...formData, name: e.target.value})}
//                       placeholder="Enter your full name"
//                       className={`w-full rounded-xl border ${errors.name ? 'border-red-300' : 'border-gray-200/60'} bg-white/60 py-3 pl-10 pr-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
//                     />
//                   </div>
//                   {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
//                 </div>

//                 {/* Mobile Number */}
//                 <div>
//                   <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Mobile Number <span className="text-red-500">*</span>
//                   </label>
//                   <div className="flex gap-2">
//                     <select
//                       value={formData.countryCode}
//                       onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
//                       className="w-24 rounded-xl border border-gray-200/60 bg-white/60 py-3 px-3 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none dark:border-gray-700/60 dark:bg-white/5 dark:text-white"
//                     >
//                       <option value="+91">+91</option>
//                       <option value="+1">+1</option>
//                       <option value="+44">+44</option>
//                       <option value="+971">+971</option>
//                     </select>
//                     <div className="relative flex-1">
//                       <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
//                       <input
//                         type="tel"
//                         value={formData.contactNo}
//                         onChange={(e) => setFormData({...formData, contactNo: e.target.value.replace(/\D/g, '')})}
//                         placeholder="Enter mobile number"
//                         maxLength={10}
//                         className={`w-full rounded-xl border ${errors.contactNo ? 'border-red-300' : 'border-gray-200/60'} bg-white/60 py-3 pl-10 pr-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
//                       />
//                     </div>
//                   </div>
//                   {errors.contactNo && <p className="mt-1 text-xs text-red-500">{errors.contactNo}</p>}
//                 </div>

//                 {/* Gender */}
//                 <div>
//                   <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Gender <span className="text-red-500">*</span>
//                   </label>
//                   <div className="grid grid-cols-3 gap-3">
//                     {['male', 'female', 'other'].map((g) => (
//                       <button
//                         key={g}
//                         type="button"
//                         onClick={() => setFormData({...formData, gender: g as any})}
//                         className={`rounded-xl border py-2.5 text-sm font-medium capitalize transition-all ${
//                           formData.gender === g
//                             ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
//                             : 'border-gray-200/60 bg-white/60 text-gray-700 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300'
//                         }`}
//                       >
//                         {g}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Date & Time */}
//                 <div className="grid gap-4 sm:grid-cols-2">
//                   <div>
//                     <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Birth Date <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
//                       <input
//                         type="date"
//                         value={formData.birthDate}
//                         onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
//                         className={`w-full rounded-xl border ${errors.birthDate ? 'border-red-300' : 'border-gray-200/60'} bg-white/60 py-3 pl-10 pr-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
//                       />
//                     </div>
//                     {errors.birthDate && <p className="mt-1 text-xs text-red-500">{errors.birthDate}</p>}
//                   </div>

//                   <div>
//                     <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Birth Time <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
//                       <input
//                         type="time"
//                         value={formData.birthTime}
//                         onChange={(e) => setFormData({...formData, birthTime: e.target.value})}
//                         className={`w-full rounded-xl border ${errors.birthTime ? 'border-red-300' : 'border-gray-200/60'} bg-white/60 py-3 pl-10 pr-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
//                       />
//                     </div>
//                     {errors.birthTime && <p className="mt-1 text-xs text-red-500">{errors.birthTime}</p>}
//                   </div>
//                 </div>

//                 {/* Location */}
//                 <div>
//                   <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Birth Place <span className="text-red-500">*</span>
//                   </label>
//                   <LocationInput
//                     value={formData.birthPlace}
//                     onChange={(location: LocationResult) => {
//                       setFormData({
//                         ...formData,
//                         birthPlace: location.place,
//                         latitude: location.latitude,
//                         longitude: location.longitude,
//                         timezone: location.timezone
//                       });
//                     }}
//                     error={errors.birthPlace}
//                   />
//                 </div>

//                 {/* Language */}
//                 <div>
//                   <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Report Language
//                   </label>
//                   <select
//                     value={formData.language}
//                     onChange={(e) => setFormData({...formData, language: e.target.value})}
//                     className="w-full rounded-xl border border-gray-200/60 bg-white/60 py-3 px-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none dark:border-gray-700/60 dark:bg-white/5 dark:text-white"
//                   >
//                     <option value="en">English</option>
//                     <option value="hi">हिन्दी (Hindi)</option>
//                     <option value="ta">தமிழ் (Tamil)</option>
//                     <option value="te">తెలుగు (Telugu)</option>
//                   </select>
//                 </div>

//                 {/* Submit */}
//                 <button
//                   onClick={handleSubmit}
//                   disabled={loading}
//                   className="w-full rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] py-3.5 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
//                 >
//                   {loading ? (
//                     <span className="flex items-center justify-center gap-2">
//                       <Loader2 className="h-5 w-5 animate-spin" />
//                       Generating...
//                     </span>
//                   ) : (
//                     'Generate Free Kundli'
//                   )}
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         </section>
//       )}

//       {/* Result Section */}
//       {step === 2 && result && (
//         <section className="px-4 py-8 sm:px-6 lg:px-8">
//           <div className="mx-auto max-w-5xl">
//             <KundliResult 
//               data={result} 
//               onUpgrade={() => console.log('Upgrade clicked')}
//               onGenerateNew={() => {
//                 setStep(1);
//                 setResult(null);
//               }}
//             />
//           </div>
//         </section>
//       )}
//     </LandingWrapper>
//   );
// }

"use client";

import { useState, useEffect } from 'react';
import LandingWrapper from '@/components/landing/LandingWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Calendar, Clock, User, MapPin, 
  Loader2, Star, Phone, History, RotateCcw,
  Share2
} from 'lucide-react';
import LocationInput from '@/components/landing/kundali/LocationInput';
import { LocationResult } from '@/lib/location-api';

// Import tab components
import BasicDetailsTab from '@/components/landing/kundali/generate/BasicDetailsTab';
import ChartsTab from '@/components/landing/kundali/generate/ChartsTab';
import KPTab from '@/components/landing/kundali/generate/KPTab';
import AshtakvargaTab from '@/components/landing/kundali/generate/AshtakvargaTab';
import { ReportTab }from '@/components/landing/kundali/generate/ReportTab';
import { PlanetReportTab }from '@/components/landing/kundali/generate/PlanetReportTab';
import {DashaTab} from '@/components/landing/kundali/generate/DashaTab';
import {DoshaTab} from '@/components/landing/kundali/generate/DoshaTab';
import {GemSuggestionTab} from '@/components/landing/kundali/generate/GemSuggestionTab';
import {RudrakshTab} from '@/components/landing/kundali/generate/RudrakshTab';

interface SavedKundli {
  name: string;
  contactNo: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
  gender: 'male' | 'female' | 'other';
}

const MAIN_TABS = [
  { id: 'basic', label: 'Basic Details', icon: '📋' },
  { id: 'charts', label: 'Charts', icon: '📊' },
  { id: 'kp', label: 'KP System', icon: '🔢' },
  { id: 'ashtakvarga', label: 'Ashtakvarga', icon: '⚡' },
  { id: 'report', label: 'Report', icon: '📝' },
  { id: 'planet-report', label: 'Planet Report', icon: '🪐' },
  { id: 'dasha', label: 'Dasha', icon: '⏳' },
  { id: 'dosha', label: 'Dosha', icon: '⚠️' },
  { id: 'gem', label: 'Gem Suggestion', icon: '💎' },
  { id: 'rudraksh', label: 'Rudraksh', icon: '📿' }
];

export default function KundaliGenerateClient() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [savedKundlis, setSavedKundlis] = useState<SavedKundli[]>([]);
  const [showSavedList, setShowSavedList] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [formData, setFormData] = useState({
    name: '',
    contactNo: '',
    countryCode: '+91',
    gender: 'male' as 'male' | 'female' | 'other',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    latitude: 0,
    longitude: 0,
    timezone: '5.5',
    language: 'en'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem('savedKundlis');
    if (saved) {
      try {
        setSavedKundlis(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved kundlis', e);
      }
    }
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.contactNo || formData.contactNo.length < 10) {
      newErrors.contactNo = 'Valid mobile number is required';
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    }
    
    if (!formData.birthTime) {
      newErrors.birthTime = 'Birth time is required';
    }
    
    if (!formData.birthPlace) {
      newErrors.birthPlace = 'Birth place is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/landing/kundali/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDetails: formData,
          language: formData.language
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const savedKundli: SavedKundli = {
          name: formData.name,
          contactNo: formData.contactNo,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          birthPlace: formData.birthPlace,
          latitude: formData.latitude,
          longitude: formData.longitude,
          timezone: formData.timezone,
          gender: formData.gender
        };

        const existing = savedKundlis.filter(
          k => k.contactNo !== formData.contactNo || k.name !== formData.name
        );
        const updated = [savedKundli, ...existing].slice(0, 5);
        setSavedKundlis(updated);
        localStorage.setItem('savedKundlis', JSON.stringify(updated));

        setResult(data);
        setStep(2);
        setActiveTab('basic');
      } else {
        alert(data.message || 'Failed to generate kundli');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedKundli = (kundli: SavedKundli) => {
    setFormData({
      ...formData,
      name: kundli.name,
      contactNo: kundli.contactNo,
      birthDate: kundli.birthDate,
      birthTime: kundli.birthTime,
      birthPlace: kundli.birthPlace,
      latitude: kundli.latitude,
      longitude: kundli.longitude,
      timezone: kundli.timezone,
      gender: kundli.gender
    });
    setShowSavedList(false);
  };

  const handleShare = () => {
    const shareText = `Check out my Vedic Kundli!\n\nName: ${formData.name}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Kundli',
        text: shareText,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Kundli details copied to clipboard!');
    }
  };

  const renderTabContent = () => {
    if (!result) return null;

    switch (activeTab) {
      case 'basic':
        return <BasicDetailsTab data={result.data.kundli} />;
      case 'charts':
        return <ChartsTab data={result.data.kundli} />;
      case 'kp':
        return <KPTab data={result.data.kundli} />;
      case 'ashtakvarga':
        return <AshtakvargaTab data={result.data.kundli} />;
      case 'report':
        return <ReportTab data={result.data.kundli} />;
      case 'planet-report':
        return <PlanetReportTab data={result.data.kundli} />;
      case 'dasha':
        return <DashaTab data={result.data.kundli} />;
      case 'dosha':
        return <DoshaTab data={result.data.kundli} />;
      case 'gem':
        return <GemSuggestionTab data={result.data.kundli} />;
      case 'rudraksh':
        return <RudrakshTab data={result.data.kundli} />;
      default:
        return null;
    }
  };

  return (
    <LandingWrapper>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-6 pt-24 sm:px-6 sm:pb-8 sm:pt-28 lg:px-8">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)",
            backgroundSize: "40px 40px"
          }} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-[#FF6B35]" />
              <span className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                COMPREHENSIVE KUNDLI ANALYSIS
              </span>
            </div>

            <h1 className="text-3xl font-bold sm:text-5xl lg:text-6xl">
              <span className="text-gray-900 dark:text-white">Complete </span>
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Vedic Kundli Report
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm text-gray-600 dark:text-gray-400 sm:text-lg">
              Get detailed planetary analysis, predictions, and remedies - all in one place!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      {step === 1 && (
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <motion.div
              className="rounded-2xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6 space-y-2 text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  Enter Birth Details
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Accurate details ensure precise predictions
                </p>
              </div>

              {/* Saved Kundlis - Moved up here before the form */}
              {savedKundlis.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowSavedList(!showSavedList)}
                    className="flex w-full items-center justify-between rounded-xl border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/5 to-[#FFB347]/5 px-4 py-3 text-sm font-medium text-gray-900 transition-all hover:border-[#FF6B35]/40 dark:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-[#FF6B35]" />
                      <span>Load Previous Details</span>
                    </div>
                  </button>

                  {showSavedList && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 space-y-2 rounded-xl border border-gray-200/60 bg-white/80 p-3 dark:border-gray-700/60 dark:bg-white/5"
                    >
                      {savedKundlis.map((kundli, idx) => (
                        <button
                          key={idx}
                          onClick={() => loadSavedKundli(kundli)}
                          className="w-full rounded-lg border border-gray-200/60 bg-white/60 p-3 text-left transition-all hover:border-[#FF6B35]/40 hover:bg-[#FF6B35]/5 dark:border-gray-700/60 dark:bg-white/5"
                        >
                          <p className="font-semibold text-gray-900 dark:text-white">{kundli.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {kundli.contactNo} • {kundli.birthDate}
                          </p>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter your full name"
                      className={`w-full rounded-xl border ${errors.name ? 'border-red-300' : 'border-gray-200/60'} bg-white/60 py-3 pl-10 pr-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                      className="w-24 rounded-xl border border-gray-200/60 bg-white/60 py-3 px-3 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none dark:border-gray-700/60 dark:bg-white/5 dark:text-white"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+971">+971</option>
                    </select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.contactNo}
                        onChange={(e) => setFormData({...formData, contactNo: e.target.value.replace(/\D/g, '')})}
                        placeholder="Enter mobile number"
                        maxLength={10}
                        className={`w-full rounded-xl border ${errors.contactNo ? 'border-red-300' : 'border-gray-200/60'} bg-white/60 py-3 pl-10 pr-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
                      />
                    </div>
                  </div>
                  {errors.contactNo && <p className="mt-1 text-xs text-red-500">{errors.contactNo}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['male', 'female', 'other'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({...formData, gender: g as any})}
                        className={`rounded-xl border py-2.5 text-sm font-medium capitalize transition-all ${
                          formData.gender === g
                            ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                            : 'border-gray-200/60 bg-white/60 text-gray-700 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Birth Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                        className={`w-full rounded-xl border ${errors.birthDate ? 'border-red-300' : 'border-gray-200/60'} bg-white/60 py-3 pl-10 pr-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
                      />
                    </div>
                    {errors.birthDate && <p className="mt-1 text-xs text-red-500">{errors.birthDate}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Birth Time <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="time"
                        value={formData.birthTime}
                        onChange={(e) => setFormData({...formData, birthTime: e.target.value})}
                        className={`w-full rounded-xl border ${errors.birthTime ? 'border-red-300' : 'border-gray-200/60'} bg-white/60 py-3 pl-10 pr-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
                      />
                    </div>
                    {errors.birthTime && <p className="mt-1 text-xs text-red-500">{errors.birthTime}</p>}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Birth Place <span className="text-red-500">*</span>
                  </label>
                  <LocationInput
                    value={formData.birthPlace}
                    onChange={(location: LocationResult) => {
                      setFormData({
                        ...formData,
                        birthPlace: location.place,
                        latitude: location.latitude,
                        longitude: location.longitude,
                        timezone: location.timezone
                      });
                    }}
                    error={errors.birthPlace}
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Report Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    className="w-full rounded-xl border border-gray-200/60 bg-white/60 py-3 px-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none dark:border-gray-700/60 dark:bg-white/5 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                  </select>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] py-3.5 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating Complete Report...
                    </span>
                  ) : (
                    'Generate Complete Kundli'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Result Section */}
      {step === 2 && result && (
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-green-200/60 bg-gradient-to-r from-green-50/80 to-emerald-50/80 p-6 backdrop-blur-sm dark:border-green-900/60 dark:from-green-900/20 dark:to-emerald-900/20"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.data.kundli.basicDetails.name}'s Complete Kundli
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generated on {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep(1);
                    setResult(null);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold transition-all hover:bg-gray-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  New Kundli
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-4 py-2 text-sm font-semibold text-white"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </motion.div>

            {/* Main Tabs */}
            <div className="rounded-2xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200/60 p-2 dark:border-gray-700/60">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {MAIN_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      )}
    </LandingWrapper>
  );
}
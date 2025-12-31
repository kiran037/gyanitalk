// app/landing/kundali-matching/KundaliMatchClient.tsx
"use client";

import { useState, useEffect } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Loader2,
  Download,
  RefreshCw,
  Clock,
  ChevronDown,
  Sparkles,
  ArrowRight,
  History,
  CheckCircle2
} from "lucide-react";
import PersonForm from "@/components/landing/kundali/PersonForm";
import MatchingScore from "@/components/landing/kundali/MatchingScore";
import DoshaAnalysis from "@/components/landing/kundali/DoshaAnalysis";
import GunaMilan from "@/components/landing/kundali/GunaMilan";

interface FormData {
  name: string;
  contactNo: string;
  countryCode: string;
  gender: "male" | "female";
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface PreviousMatch {
  male: FormData;
  female: FormData;
  matchType: "north" | "south";
  timestamp: number;
}

export default function KundaliMatchClient() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [maleData, setMaleData] = useState<FormData>({
    name: "",
    contactNo: "",
    countryCode: "+91",
    gender: "male",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    latitude: 0,
    longitude: 0,
    timezone: "5.5",
  });

  const [femaleData, setFemaleData] = useState<FormData>({
    name: "",
    contactNo: "",
    countryCode: "+91",
    gender: "female",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    latitude: 0,
    longitude: 0,
    timezone: "5.5",
  });

  const [matchType, setMatchType] = useState<"north" | "south">("north");
  const [language, setLanguage] = useState("en");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previousMatches, setPreviousMatches] = useState<PreviousMatch[]>([]);
  const [showPrevious, setShowPrevious] = useState(false);

  // Load previous matches
  useEffect(() => {
    const stored = localStorage.getItem("kundli_previous_matches");
    if (stored) {
      try {
        const matches = JSON.parse(stored);
        setPreviousMatches(matches.slice(0, 5));
      } catch (e) {
        console.error("Failed to parse previous matches");
      }
    }
  }, []);

  const savePreviousMatch = () => {
    const newMatch: PreviousMatch = {
      male: maleData,
      female: femaleData,
      matchType,
      timestamp: Date.now(),
    };
    // Avoid duplicates based on names
    const filtered = previousMatches.filter(
      m => !(m.male.name === maleData.name && m.female.name === femaleData.name)
    );
    const updated = [newMatch, ...filtered].slice(0, 5);
    setPreviousMatches(updated);
    localStorage.setItem("kundli_previous_matches", JSON.stringify(updated));
  };

  const loadPreviousMatch = (match: PreviousMatch) => {
    setMaleData(match.male);
    setFemaleData(match.female);
    setMatchType(match.matchType);
    setShowPrevious(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!maleData.name || maleData.name.trim().length < 2) newErrors.maleName = "Boy's name required";
    if (!maleData.birthDate) newErrors.maleBirthDate = "Date required";
    if (!maleData.birthTime) newErrors.maleBirthTime = "Time required";
    if (!maleData.birthPlace) newErrors.maleBirthPlace = "Place required";

    if (!femaleData.name || femaleData.name.trim().length < 2) newErrors.femaleName = "Girl's name required";
    if (!femaleData.birthDate) newErrors.femaleBirthDate = "Date required";
    if (!femaleData.birthTime) newErrors.femaleBirthTime = "Time required";
    if (!femaleData.birthPlace) newErrors.femaleBirthPlace = "Place required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      const firstError = Object.keys(errors)[0];
      const el = document.querySelector(`[name="${firstError}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/landing/kundali/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          male: maleData,
          female: femaleData,
          matchType,
          language,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
        setStep(2);
        savePreviousMatch();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert(data.message || "Failed to match kundlis");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while matching kundlis");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <LandingWrapper>
      {/* 1. Hero Section - Cosmic Theme */}
      <section className="relative overflow-hidden px-4 pb-12 pt-24 sm:px-6 sm:pt-32 lg:px-8">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-200/20 dark:bg-orange-900/20 rounded-full blur-[100px] opacity-60" />
          <div className="absolute inset-0 bg-[radial-gradient(#FF6B35_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05] dark:opacity-[0.08]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/60 bg-white/50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-600 backdrop-blur-sm dark:border-orange-900/30 dark:bg-black/30 dark:text-orange-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Vedic Compatibility Check</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-6xl">
              Find Your <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Cosmic Soulmate
              </span>
            </h1>

            <p className="max-w-2xl text-base text-gray-600 dark:text-gray-300 sm:text-lg">
              Unlock the secrets of your relationship with detailed 
              <strong> Ashtakoot & Dashakoot</strong> matching, Mangal Dosha analysis, and Guna Milan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <section className="relative z-20 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: FORM */}
            {step === 1 ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Previous Matches (Collapsible) */}
                {previousMatches.length > 0 && (
                  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <button
                      onClick={() => setShowPrevious(!showPrevious)}
                      className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                          <History className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          Recent Matches ({previousMatches.length})
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${showPrevious ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {showPrevious && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
                        >
                          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                            {previousMatches.map((match, idx) => (
                              <button
                                key={idx}
                                onClick={() => loadPreviousMatch(match)}
                                className="group flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-all hover:border-orange-200 hover:bg-white hover:shadow-md dark:border-gray-800 dark:bg-gray-800/50 dark:hover:border-orange-900/50 dark:hover:bg-gray-800"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex -space-x-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 ring-2 ring-white dark:bg-blue-900 dark:text-blue-300 dark:ring-gray-800">
                                      {match.male.name[0]}
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-700 ring-2 ring-white dark:bg-pink-900 dark:text-pink-300 dark:ring-gray-800">
                                      {match.female.name[0]}
                                    </div>
                                  </div>
                                  <div className="text-left text-sm">
                                    <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                      {match.male.name} & {match.female.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(match.timestamp).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-orange-400 opacity-0 transition-opacity group-hover:opacity-100" />
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Main Form Card */}
                <div className="rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-xl shadow-gray-200/20 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80 dark:shadow-none sm:p-8">
                  
                  {/* Settings Row */}
                  <div className="mb-8 grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Matching System
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setMatchType("north")}
                          className={`relative overflow-hidden rounded-xl border p-3 text-center transition-all ${
                            matchType === "north"
                              ? "border-[#FF6B35] bg-orange-50/50 text-[#FF6B35] dark:bg-orange-900/20"
                              : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div className="text-sm font-bold">North Indian</div>
                          <div className="text-[10px] opacity-70">Ashtakoot (36 Guna)</div>
                          {matchType === "north" && <CheckCircle2 className="absolute right-2 top-2 h-3 w-3 text-[#FF6B35]" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setMatchType("south")}
                          className={`relative overflow-hidden rounded-xl border p-3 text-center transition-all ${
                            matchType === "south"
                              ? "border-[#FF6B35] bg-orange-50/50 text-[#FF6B35] dark:bg-orange-900/20"
                              : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div className="text-sm font-bold">South Indian</div>
                          <div className="text-[10px] opacity-70">Dashakoot (10 Poruthams)</div>
                          {matchType === "south" && <CheckCircle2 className="absolute right-2 top-2 h-3 w-3 text-[#FF6B35]" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Report Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full h-[54px] rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-900 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="en">🇬🇧 English</option>
                        <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
                        <option value="ta">தமிழ் (Tamil)</option>
                        <option value="te">తెలుగు (Telugu)</option>
                      </select>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative mb-8 text-center">
                    <div className="absolute top-1/2 w-full border-t border-gray-200 dark:border-gray-800" />
                    <span className="relative bg-white px-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:bg-gray-900">
                      Enter Birth Details
                    </span>
                  </div>

                  {/* Input Forms */}
                  <div className="grid gap-8 lg:grid-cols-2">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-1 dark:border-blue-900/30 dark:bg-blue-900/5">
                      <PersonForm
                        data={maleData}
                        onDataChange={setMaleData}
                        title="Boy's Details"
                        icon={Heart}
                        prefix="male"
                        errors={errors}
                        colorScheme="blue"
                      />
                    </div>
                    <div className="rounded-2xl border border-pink-100 bg-pink-50/30 p-1 dark:border-pink-900/30 dark:bg-pink-900/5">
                      <PersonForm
                        data={femaleData}
                        onDataChange={setFemaleData}
                        title="Girl's Details"
                        icon={Heart}
                        prefix="female"
                        errors={errors}
                        colorScheme="pink"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-8">
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#FF9057] py-4 text-base font-bold text-white shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.01] hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Aligning Stars...</span>
                        </>
                      ) : (
                        <>
                          <span>Calculate Match Score</span>
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                    <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                      100% Privacy Protected. We do not store your personal details permanently.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              // STEP 2: RESULTS DASHBOARD
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Header with Match Info */}
                <div className="sticky top-[70px] z-30 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white/95 px-5 py-4 shadow-sm backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 ring-2 ring-white dark:bg-blue-900 dark:text-blue-200 dark:ring-gray-900">
                        {maleData.name[0]}
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-700 ring-2 ring-white dark:bg-pink-900 dark:text-pink-200 dark:ring-gray-900">
                        {femaleData.name[0]}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 dark:text-white">
                        {maleData.name} <span className="text-gray-400">&</span> {femaleData.name}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{matchType === 'north' ? 'Ashtakoot' : 'Dashakoot'} Match</span>
                        <span>•</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-[#FF6B35] hover:text-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-[#FF6B35] dark:hover:text-white"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:inline">New Match</span>
                  </button>
                </div>

                <div className="space-y-8">
                  {result && (
                    <>
                      {/* Overall Score Card */}
                      <MatchingScore
                        basic={result.data.basic}
                        aggregate={result.data.aggregate}
                        matchType={result.data.matchType}
                        maleData={maleData}
                        femaleData={femaleData}
                      />
                      
                      {/* Detailed Analysis Grid */}
                      <div className="grid gap-6 lg:grid-cols-1">
                        <GunaMilan
                          matchDetails={result.data.basic.details}
                          maleData={maleData}
                          femaleData={femaleData}
                        />
                        <DoshaAnalysis
                          doshas={result.data.doshas}
                          papasamaya={result.data.papasamaya}
                          maleData={maleData}
                          femaleData={femaleData}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Premium Upsell - Dark Cosmic Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-2xl sm:p-10"
                >
                  {/* Decorative Glows */}
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#FF6B35] opacity-20 blur-[80px]" />
                  <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-600 opacity-20 blur-[80px]" />

                  <div className="relative z-10 flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner">
                      <Download className="h-10 w-10 text-[#FF6B35]" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 inline-flex rounded-full bg-[#FF6B35]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#FF6B35] border border-[#FF6B35]/30">
                        Premium Report
                      </div>
                      <h3 className="text-2xl font-bold">Unlock 50+ Page In-Depth Analysis</h3>
                      <p className="mt-3 text-base text-gray-300 max-w-xl">
                        Go beyond the basics. Get detailed insights on mental compatibility, childbirth, financial prosperity, and personalized remedies for a happy married life.
                      </p>
                    </div>
                    <button className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#FF6B35] px-8 py-4 font-bold text-white transition-all hover:scale-105 hover:bg-[#ff8052] active:scale-95 lg:w-auto">
                      <span>Download PDF</span>
                      <Download className="h-5 w-5 transition-transform group-hover:translate-y-1" />
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </LandingWrapper>
  );
}


"use client";

import { useState, useEffect } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { motion } from "framer-motion";
import {
  Heart,
  Loader2,
  Download,
  RefreshCw,
  Clock,
  ChevronDown,
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

  // Load previous matches from localStorage
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

  // Save to localStorage after successful match
  const savePreviousMatch = () => {
    const newMatch: PreviousMatch = {
      male: maleData,
      female: femaleData,
      matchType,
      timestamp: Date.now(),
    };

    const updated = [newMatch, ...previousMatches].slice(0, 5);
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

    // Male validations
    if (!maleData.name || maleData.name.trim().length < 2) {
      newErrors.maleName = "Name required (min 2 chars)";
    }
    if (!maleData.contactNo || maleData.contactNo.length < 10) {
      newErrors.maleContactNo = "Valid mobile required (10 digits)";
    }
    if (!maleData.birthDate) newErrors.maleBirthDate = "Date required";
    if (!maleData.birthTime) newErrors.maleBirthTime = "Time required";
    if (!maleData.birthPlace) newErrors.maleBirthPlace = "Place required";

    // Female validations
    if (!femaleData.name || femaleData.name.trim().length < 2) {
      newErrors.femaleName = "Name required (min 2 chars)";
    }
    if (!femaleData.contactNo || femaleData.contactNo.length < 10) {
      newErrors.femaleContactNo = "Valid mobile required (10 digits)";
    }
    if (!femaleData.birthDate) newErrors.femaleBirthDate = "Date required";
    if (!femaleData.birthTime) newErrors.femaleBirthTime = "Time required";
    if (!femaleData.birthPlace) newErrors.femaleBirthPlace = "Place required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
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
    setMaleData({
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
    setFemaleData({
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
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <LandingWrapper>
      {/* Hero */}
      <section className="relative min-h-[40vh] overflow-hidden px-4 pb-6 pt-24 sm:min-h-[45vh] sm:px-6 sm:pb-8 sm:pt-28">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 px-3 py-1.5 backdrop-blur-sm">
              <Heart className="h-3.5 w-3.5 text-[#FF6B35]" />
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                COMPREHENSIVE KUNDLI MATCHING
              </span>
            </div>

            <h1 className="text-3xl font-bold sm:text-5xl lg:text-6xl">
              <span className="text-gray-900 dark:text-white">Marriage </span>
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Compatibility
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm text-gray-600 dark:text-gray-400 sm:text-lg">
              Detailed analysis with Ashtakoot, Dashakoot, Dosha Check & more
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      {step === 1 && (
        <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Previous Matches */}
              {previousMatches.length > 0 && (
                <div className="rounded-xl border border-gray-200/60 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => setShowPrevious(!showPrevious)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#FF6B35]" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Previous Matches ({previousMatches.length})
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform ${showPrevious ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showPrevious && (
                    <div className="mt-3 space-y-2">
                      {previousMatches.map((match, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => loadPreviousMatch(match)}
                          className="w-full rounded-lg border border-gray-200/60 bg-white/60 p-3 text-left transition-all hover:border-[#FF6B35]/50 hover:bg-[#FF6B35]/5 dark:border-gray-700/60 dark:bg-white/5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {match.male.name}
                              </span>
                              <Heart className="h-3 w-3 text-[#FF6B35]" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {match.female.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(match.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Match Type */}
              <div className="rounded-xl border border-gray-200/60 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                  Matching System
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setMatchType("north")}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      matchType === "north"
                        ? "border-[#FF6B35] bg-[#FF6B35]/10 ring-1 ring-[#FF6B35]/20"
                        : "border-gray-200/60 bg-white/60 hover:border-[#FF6B35]/50 dark:border-gray-700/60 dark:bg-white/5"
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      North Indian (Ashtakoot)
                    </div>
                    <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                      36 points system
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchType("south")}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      matchType === "south"
                        ? "border-[#FF6B35] bg-[#FF6B35]/10 ring-1 ring-[#FF6B35]/20"
                        : "border-gray-200/60 bg-white/60 hover:border-[#FF6B35]/50 dark:border-gray-700/60 dark:bg-white/5"
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      South Indian (Dashakoot)
                    </div>
                    <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                      10 points system
                    </div>
                  </button>
                </div>
              </div>

              {/* Forms */}
              <div className="grid gap-4 lg:grid-cols-2">
                <PersonForm
                  data={maleData}
                  onDataChange={setMaleData}
                  title="Boy's Details"
                  icon={Heart}
                  prefix="male"
                  errors={errors}
                  colorScheme="blue"
                />

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

              {/* Language */}
              <div className="rounded-xl border border-gray-200/60 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Report Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-lg border border-gray-200/60 bg-white/60 px-3 py-2.5 text-sm backdrop-blur-sm transition-colors focus:border-[#FF6B35]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 dark:border-gray-700/60 dark:bg-white/5 dark:text-white"
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
                className="w-full rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FFB347] py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing Compatibility...
                  </span>
                ) : (
                  "Check Compatibility"
                )}
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Results */}
      {step === 2 && result && (
        <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-4">
            {/* Matching Score */}
            <MatchingScore
              basic={result.data.basic}
              aggregate={result.data.aggregate}
              matchType={result.data.matchType}
              maleData={maleData}
              femaleData={femaleData}
            />

            {/* Guna Milan Details */}
            <GunaMilan
              matchDetails={result.data.basic.details}
              maleData={maleData}
              femaleData={femaleData}
            />

            {/* Dosha Analysis */}
            <DoshaAnalysis
              doshas={result.data.doshas}
              papasamaya={result.data.papasamaya}
              maleData={maleData}
              femaleData={femaleData}
            />

            {/* Upsell */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/5 to-[#FFB347]/5 p-6 backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <Download className="h-6 w-6 flex-shrink-0 text-[#FF6B35]" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Get Detailed PDF Report
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Comprehensive report with remedies, predictions, and personalized guidance
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 rounded-lg bg-[#FF6B35] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#FF6B35]/90">
                      <Download className="h-4 w-4" />
                      Unlock Premium - ₹199
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Match Another
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </LandingWrapper>
  );
}
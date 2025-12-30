// ///Users/xeoren/Desktop/gyanitallk-admin/src/app/landing/kundali/generate/KundaliGenerateClient.tsx
"use client";

import { useState, useEffect } from 'react';
import LandingWrapper from '@/components/landing/LandingWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Calendar, Clock, User, MapPin, 
  Loader2, Star, Phone, History, RotateCcw,
  Share2, Download, ChevronDown, Activity,
  Eye, Shield, Award, Zap, TrendingUp, Heart, Hash
} from 'lucide-react';
import LocationInput from '@/components/landing/kundali/LocationInput';
import { LocationResult } from '@/lib/location-api';

// Import all tab components
import BasicDetailsTab from '@/components/landing/kundali/generate/BasicDetailsTab';
import ChartsTab from '@/components/landing/kundali/generate/ChartsTab';
import KPTab from '@/components/landing/kundali/generate/KPTab';
import AshtakvargaTab from '@/components/landing/kundali/generate/AshtakvargaTab';
import { ReportTab } from '@/components/landing/kundali/generate/ReportTab';
import { PlanetReportTab } from '@/components/landing/kundali/generate/PlanetReportTab';
import { DashaTab } from '@/components/landing/kundali/generate/DashaTab';
import { DoshaTab } from '@/components/landing/kundali/generate/DoshaTab';
import { GemSuggestionTab } from '@/components/landing/kundali/generate/GemSuggestionTab';
import { RudrakshTab } from '@/components/landing/kundali/generate/RudrakshTab';
import { YogaTab } from '@/components/landing/kundali/generate/YogaTab';
import { NumerologyTab } from '@/components/landing/kundali/generate/NumerologyTab';

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
  { id: 'basic', label: 'Overview', icon: Eye, color: 'blue' },
  { id: 'charts', label: 'Charts', icon: Activity, color: 'purple' },
  { id: 'planets', label: 'Planets', icon: Star, color: 'yellow' },
  { id: 'houses', label: 'Houses', icon: Shield, color: 'green' },
  { id: 'kp', label: 'KP System', icon: Hash, color: 'indigo' },
  { id: 'ashtakvarga', label: 'Ashtakvarga', icon: Zap, color: 'orange' },
  { id: 'yogas', label: 'Yogas', icon: Award, color: 'amber' },
  { id: 'dasha', label: 'Dasha', icon: Clock, color: 'indigo' },
  { id: 'doshas', label: 'Doshas', icon: Zap, color: 'red' },
  { id: 'remedies', label: 'Remedies', icon: Heart, color: 'pink' },
  { id: 'numerology', label: 'Numerology', icon: Hash, color: 'violet' },
];

export default function KundaliGenerateClient() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [savedKundlis, setSavedKundlis] = useState<SavedKundli[]>([]);
  const [showSavedList, setShowSavedList] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [generationProgress, setGenerationProgress] = useState(0);
  
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
    setGenerationProgress(0);

    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 400);

    try {
      const response = await fetch('/api/landing/kundali/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDetails: {
            name: formData.name,
            gender: formData.gender,
            birthDate: formData.birthDate,
            birthTime: formData.birthTime,
            birthPlace: formData.birthPlace,
            latitude: formData.latitude,
            longitude: formData.longitude,
            timezone: formData.timezone,
            countryCode: formData.countryCode,
            contactNo: formData.contactNo
          },
          language: formData.language
        })
      });

      const data = await response.json();
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
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
        
        setTimeout(() => {
          setStep(2);
          setActiveTab('basic');
          setGenerationProgress(0);
        }, 500);
      } else {
        clearInterval(progressInterval);
        alert(data.message || 'Failed to generate kundli');
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error(error);
      alert('An error occurred while generating kundli');
    } finally {
      setTimeout(() => setLoading(false), 500);
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

  const handleShare = async () => {
    const shareText = `🌟 My Vedic Kundli Analysis\n\nName: ${formData.name}\nDate: ${new Date(formData.birthDate).toLocaleDateString()}\nTime: ${formData.birthTime}\nPlace: ${formData.birthPlace}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Vedic Kundli',
          text: shareText,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Kundli details copied to clipboard!');
    }
  };

  const handleDownloadPDF = () => {
    alert('PDF download feature coming soon!');
  };

  const renderTabContent = () => {
    if (!result || !result.data || !result.data.kundli) return null;

    const kundliData = result.data.kundli;

    switch (activeTab) {
      case 'basic':
        return <BasicDetailsTab data={kundliData} />;
      case 'charts':
        return <ChartsTab data={kundliData} birthDetails={formData} />;
      case 'planets':
        return <PlanetReportTab data={kundliData} />;
      case 'houses':
        return <ReportTab data={kundliData} />;
      case 'kp':
        return <KPTab data={kundliData} />;
      case 'ashtakvarga':
        return <AshtakvargaTab data={kundliData} />;
      case 'yogas':
        return <YogaTab data={kundliData} />;
      case 'dasha':
        return <DashaTab data={kundliData} />;
      case 'doshas':
        return <DoshaTab data={kundliData} />;
      case 'remedies':
        return (
          <div className="space-y-6">
            <GemSuggestionTab data={kundliData} />
            <RudrakshTab data={kundliData} />
          </div>
        );
      case 'numerology':
        return <NumerologyTab data={kundliData} />;
      default:
        return null;
    }
  };

  return (
    <LandingWrapper>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-8 pt-24 sm:px-6 sm:pb-12 sm:pt-32 lg:px-8">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/5 via-transparent to-[#FFB347]/5" />
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.08) 1px, transparent 0)",
            backgroundSize: "40px 40px"
          }} />
        </div>

        <div className="relative z-10 mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 px-5 py-2.5 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-[#FF6B35]" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                AI-POWERED VEDIC ASTROLOGY
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight sm:text-6xl lg:text-7xl">
              <span className="text-gray-900 dark:text-white">Your Complete </span>
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Kundli Report
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base text-gray-600 dark:text-gray-400 sm:text-lg">
              Comprehensive astrological analysis with 35+ data points • Planetary positions • Predictions • Remedies
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      {step === 1 && (
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <motion.div
              className="rounded-3xl border border-gray-200/60 bg-white/70 p-8 backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-900/70 sm:p-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Enter Birth Details
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Accurate timing ensures precise predictions
                </p>
              </div>

              {/* Saved Kundlis */}
              {savedKundlis.length > 0 && (
                <div className="mb-8">
                  <button
                    onClick={() => setShowSavedList(!showSavedList)}
                    className="flex w-full items-center justify-between rounded-2xl border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/5 to-[#FFB347]/5 px-5 py-4 text-sm font-semibold text-gray-900 transition-all hover:border-[#FF6B35]/40 dark:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <History className="h-5 w-5 text-[#FF6B35]" />
                      <span>Load Previous Details ({savedKundlis.length})</span>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${showSavedList ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showSavedList && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-3 overflow-hidden"
                      >
                        {savedKundlis.map((kundli, idx) => (
                          <button
                            key={idx}
                            onClick={() => loadSavedKundli(kundli)}
                            className="w-full rounded-xl border border-gray-200/60 bg-white/60 p-4 text-left transition-all hover:border-[#FF6B35]/40 hover:bg-[#FF6B35]/5 dark:border-gray-700/60 dark:bg-white/5"
                          >
                            <p className="font-bold text-gray-900 dark:text-white">{kundli.name}</p>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                              {kundli.contactNo} • {new Date(kundli.birthDate).toLocaleDateString()} • {kundli.birthTime}
                            </p>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter your full name"
                      className={`w-full rounded-xl border ${errors.name ? 'border-red-300' : 'border-gray-200/60'} bg-white/60 py-3.5 pl-12 pr-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
                    />
                  </div>
                  {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Mobile */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                      className="w-28 rounded-xl border border-gray-200/60 bg-white/60 py-3.5 px-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none dark:border-gray-700/60 dark:bg-white/5 dark:text-white"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+971">🇦🇪 +971</option>
                    </select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.contactNo}
                        onChange={(e) => setFormData({...formData, contactNo: e.target.value.replace(/\D/g, '')})}
                        placeholder="Enter mobile number"
                        maxLength={10}
                        className={`w-full rounded-xl border ${errors.contactNo ? 'border-red-300' : 'border-gray-200/60'} bg-white/60 py-3.5 pl-12 pr-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
                      />
                    </div>
                  </div>
                  {errors.contactNo && <p className="mt-1.5 text-xs text-red-500">{errors.contactNo}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['male', 'female', 'other'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({...formData, gender: g})}
                        className={`rounded-xl border py-3 text-sm font-semibold capitalize transition-all ${
                          formData.gender === g
                            ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35] shadow-lg'
                            : 'border-gray-200/60 bg-white/60 text-gray-700 hover:bg-gray-50 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
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
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Birth Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        value={formData.birthDate}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                        className={`w-full rounded-xl border ${errors.birthDate ? 'border-red-300' : 'border-gray-200/60'} bg-white/60 py-3.5 pl-12 pr-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
                      />
                    </div>
                    {errors.birthDate && <p className="mt-1.5 text-xs text-red-500">{errors.birthDate}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Birth Time <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="time"
                        value={formData.birthTime}
                        onChange={(e) => setFormData({...formData, birthTime: e.target.value})}
                        className={`w-full rounded-xl border ${errors.birthTime ? 'border-red-300' : 'border-gray-200/60'} bg-white/60 py-3.5 pl-12 pr-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
                      />
                    </div>
                    {errors.birthTime && <p className="mt-1.5 text-xs text-red-500">{errors.birthTime}</p>}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                  {formData.latitude !== 0 && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                    </p>
                  )}
                </div>

                {/* Language */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Report Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    className="w-full rounded-xl border border-gray-200/60 bg-white/60 py-3.5 px-4 text-sm backdrop-blur-sm focus:border-[#FF6B35]/50 focus:outline-none dark:border-gray-700/60 dark:bg-white/5 dark:text-white"
                  >
                    <option value="en">🇬🇧 English</option>
                    <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                  </select>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] py-4 font-bold text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating... {Math.round(generationProgress)}%
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <Sparkles className="h-5 w-5" />
                      Generate Complete Kundli
                    </span>
                  )}
                </button>

                {loading && (
                  <div className="overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <motion.div
                      className="h-2 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB347]"
                      initial={{ width: 0 }}
                      animate={{ width: `${generationProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  🔒 Your data is secure and confidential
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Result Section */}
      {step === 2 && result && (
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-green-200/60 bg-gradient-to-r from-green-50/80 to-emerald-50/80 p-6 backdrop-blur-sm dark:border-green-900/60 dark:from-green-900/20 dark:to-emerald-900/20"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.data.kundli.basicDetails.name}'s Kundli
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleDateString('en-GB')}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep(1);
                    setResult(null);
                    setActiveTab('basic');
                  }}
                  className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  New
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 rounded-xl border border-[#FF6B35]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#FF6B35] transition-all hover:bg-[#FF6B35]/5 dark:border-[#FF6B35]/60 dark:bg-gray-800"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </motion.div>

            <div className="rounded-2xl border border-gray-200/60 bg-white/70 backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-900/70">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200/60 p-3 dark:border-gray-700/60">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {MAIN_TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
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
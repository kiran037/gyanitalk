"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Loader2, Star, Shield, Activity, 
  Hash, Zap, Award, Clock, Heart, Eye, Share2
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// Import your existing Tab components
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

export default function KundaliViewPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [kundliData, setKundliData] = useState<any>(null);
  const [record, setRecord] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (params.id) {
      fetchReport();
    }
  }, [params.id]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/landing/profile/kundali/${params.id}`);
      const data = await res.json();
      
      if (data.success) {
        setRecord(data.data.record);
        setKundliData(data.data.report);
      } else {
        toast.error(data.error || "Failed to load report");
        router.push('/profile/kundali');
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!record) return;
    const shareText = `Check out this Kundli for ${record.name}!`;
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Kundli Report', text: shareText, url });
      } catch (err) { console.log(err); }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  const renderTabContent = () => {
    if (!kundliData) return null;

    switch (activeTab) {
      case 'basic': return <BasicDetailsTab data={kundliData} />;
      case 'charts': return <ChartsTab data={kundliData} birthDetails={record} />; // Pass record as birthDetails
      case 'planets': return <PlanetReportTab data={kundliData} />;
      case 'houses': return <ReportTab data={kundliData} />;
      case 'kp': return <KPTab data={kundliData} />;
      case 'ashtakvarga': return <AshtakvargaTab data={kundliData} />;
      case 'yogas': return <YogaTab data={kundliData} />;
      case 'dasha': return <DashaTab data={kundliData} />;
      case 'doshas': return <DoshaTab data={kundliData} />;
      case 'remedies': 
        return (
          <div className="space-y-6">
            <GemSuggestionTab data={kundliData} />
            <RudrakshTab data={kundliData} />
          </div>
        );
      case 'numerology': return <NumerologyTab data={kundliData} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35] mb-4" />
        <p className="text-gray-500 font-medium">Fetching astrological data...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/profile/kundali" 
            className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {record?.name}'s Kundli
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {record?.birthPlace} • {record?.birthTime}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-[#e55a2b] transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share Report
        </button>
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl border border-gray-200/60 bg-white/70 backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-900/70 shadow-sm">
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200/60 p-2 sm:p-3 dark:border-gray-700/60">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {MAIN_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
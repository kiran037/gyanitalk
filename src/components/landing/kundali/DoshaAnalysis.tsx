// src/components/landing/kundali/DoshaAnalysis.tsx
"use client";

import { motion } from 'framer-motion';
import { 
  AlertTriangle, CheckCircle2, Shield, Zap, 
  Flame, Skull, Info, User 
} from 'lucide-react';

interface DoshaAnalysisProps {
  doshas: {
    mangal: { present: boolean; boy_points: number; girl_points: number; message: string };
    pitra: { boy: boolean; girl: boolean; message: string };
    kaalsarp: { boy: boolean; girl: boolean; message: string };
    manglik_saturn: { boy: boolean; girl: boolean; message: string };
    manglik_rahuketu: { boy: boolean; girl: boolean; message: string };
    rajju: { present: boolean; part: string; description: string };
    vedha: { present: boolean };
  };
  papasamaya: {
    boy_total: number;
    girl_total: number;
    boy_papa: any;
    girl_papa: any;
    score: number;
    message: string;
  };
  maleData: { name: string };
  femaleData: { name: string };
}

export default function DoshaAnalysis({ 
  doshas, 
  papasamaya,
  maleData, 
  femaleData 
}: DoshaAnalysisProps) {

  // Helper to render individual dosha cards
  const renderDoshaCard = (
    title: string, 
    present: boolean, 
    boyHas: boolean, 
    girlHas: boolean, 
    message?: string,
    icon: any = AlertTriangle
  ) => {
    const Icon = icon;
    const isSafe = !present && !boyHas && !girlHas;
    
    return (
      <div className={`flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all ${
        isSafe 
          ? 'border-green-100 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10' 
          : 'border-orange-100 bg-orange-50/50 dark:border-orange-900/30 dark:bg-orange-900/10'
      }`}>
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg p-1.5 ${isSafe ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'}`}>
              <Icon className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            isSafe ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {isSafe ? 'Safe' : 'Present'}
          </span>
        </div>

        {/* Comparison Grid */}
        <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col items-center rounded-lg bg-white/60 p-2 dark:bg-black/20">
            <span className="mb-1 font-semibold text-gray-500">{maleData.name}</span>
            <span className={`font-bold ${boyHas ? 'text-orange-600' : 'text-green-600'}`}>
              {boyHas ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-white/60 p-2 dark:bg-black/20">
            <span className="mb-1 font-semibold text-gray-500">{femaleData.name}</span>
            <span className={`font-bold ${girlHas ? 'text-orange-600' : 'text-green-600'}`}>
              {girlHas ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {message && (
          <p className="mt-auto text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            {message}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* 1. Dosha Analysis Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6"
      >
        <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="rounded-xl bg-red-50 p-2.5 text-red-500 dark:bg-red-900/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Dosha Check</h2>
            <p className="text-xs text-gray-500">Analysis of negative planetary influences</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {renderDoshaCard("Mangal Dosha", doshas.mangal.present, doshas.mangal.boy_points > 0, doshas.mangal.girl_points > 0, doshas.mangal.message, Flame)}
          {renderDoshaCard("Pitra Dosha", false, doshas.pitra.boy, doshas.pitra.girl, doshas.pitra.message, User)}
          {renderDoshaCard("Kaal Sarp", false, doshas.kaalsarp.boy, doshas.kaalsarp.girl, doshas.kaalsarp.message, Skull)}
          {renderDoshaCard("Saturn Influence", false, doshas.manglik_saturn.boy, doshas.manglik_saturn.girl, doshas.manglik_saturn.message)}
          {renderDoshaCard("Rahu/Ketu Influence", false, doshas.manglik_rahuketu.boy, doshas.manglik_rahuketu.girl, doshas.manglik_rahuketu.message)}
          
          {/* Rajju & Vedha */}
          {(doshas.rajju.present || doshas.vedha.present) && (
            <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 dark:border-red-900/30 dark:bg-red-900/10 sm:col-span-2 lg:col-span-1">
              <div className="mb-3 flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="text-sm font-bold">Critical Doshas</h3>
              </div>
              <div className="space-y-3">
                {doshas.rajju.present && (
                  <div className="text-xs">
                    <span className="font-bold text-red-600">Rajju Dosha:</span> {doshas.rajju.description} ({doshas.rajju.part})
                  </div>
                )}
                {doshas.vedha.present && (
                  <div className="text-xs">
                    <span className="font-bold text-red-600">Vedha Dosha:</span> Present. This indicates mutual obstruction between stars.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 2. Papasamaya (Malefic Points) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6"
      >
        <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-900/20">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Papasamaya Score</h2>
            <p className="text-xs text-gray-500">Comparison of total malefic points</p>
          </div>
        </div>

        {/* Comparative Bars */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Boy */}
          <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/10">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-bold text-blue-900 dark:text-blue-100">{maleData.name}</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{papasamaya.boy_total.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <ScoreBar label="Mars" value={papasamaya.boy_papa.mars_papa} color="bg-red-400" />
              <ScoreBar label="Saturn" value={papasamaya.boy_papa.saturn_papa} color="bg-gray-600" />
              <ScoreBar label="Rahu" value={papasamaya.boy_papa.rahu_papa} color="bg-purple-500" />
              <ScoreBar label="Sun" value={papasamaya.boy_papa.sun_papa} color="bg-orange-400" />
            </div>
          </div>

          {/* Girl */}
          <div className="rounded-xl bg-pink-50 p-4 dark:bg-pink-900/10">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-bold text-pink-900 dark:text-pink-100">{femaleData.name}</span>
              <span className="text-2xl font-black text-pink-600 dark:text-pink-400">{papasamaya.girl_total.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <ScoreBar label="Mars" value={papasamaya.girl_papa.mars_papa} color="bg-red-400" />
              <ScoreBar label="Saturn" value={papasamaya.girl_papa.saturn_papa} color="bg-gray-600" />
              <ScoreBar label="Rahu" value={papasamaya.girl_papa.rahu_papa} color="bg-purple-500" />
              <ScoreBar label="Sun" value={papasamaya.girl_papa.sun_papa} color="bg-orange-400" />
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="mt-6 flex items-start gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
          <p className="leading-relaxed">
            {papasamaya.message || "Papasamaya points indicate the level of challenges. Similar scores between partners (within +/- 5 points) are considered good for compatibility as they cancel each other out."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Helper: Mini Progress Bar for Papa Points
function ScoreBar({ label, value, color }: { label: string, value: number, color: string }) {
  // Normalize value for bar width (assuming max ~20 for visual scale)
  const width = Math.min(100, (value / 20) * 100);
  
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-12 font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-white dark:bg-gray-800">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
      <span className="w-6 text-right font-bold text-gray-700 dark:text-gray-200">{value?.toFixed(1) || 0}</span>
    </div>
  );
}
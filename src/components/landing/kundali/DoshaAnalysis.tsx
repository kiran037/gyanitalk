'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, XCircle, Shield, Zap } from 'lucide-react';

interface DoshaAnalysisProps {
  doshas: {
    mangal: {
      present: boolean;
      boy_points: number;
      girl_points: number;
      message: string;
    };
    pitra: {
      boy: boolean;
      girl: boolean;
      message: string;
    };
    kaalsarp: {
      boy: boolean;
      girl: boolean;
      message: string;
    };
    manglik_saturn: {
      boy: boolean;
      girl: boolean;
      message: string;
    };
    manglik_rahuketu: {
      boy: boolean;
      girl: boolean;
      message: string;
    };
    rajju: {
      present: boolean;
      part: string;
      description: string;
    };
    vedha: {
      present: boolean;
    };
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
  
  const getDoshaIcon = (present: boolean) => {
    if (present) return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  };

  const getDoshaColor = (present: boolean) => {
    if (present) return 'border-orange-200 bg-orange-50/60 dark:border-orange-900 dark:bg-orange-900/10';
    return 'border-green-200 bg-green-50/60 dark:border-green-900 dark:bg-green-900/10';
  };

  const getDoshaTextColor = (present: boolean) => {
    if (present) return 'text-orange-900 dark:text-orange-100';
    return 'text-green-900 dark:text-green-100';
  };

  return (
    <div className="space-y-4">
      {/* Main Dosha Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
      >
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#FF6B35]" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Dosha Analysis
          </h2>
        </div>

        <div className="space-y-3">
          {/* Mangal Dosha */}
          <div className={`rounded-lg border p-4 ${getDoshaColor(doshas.mangal.present)}`}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getDoshaIcon(doshas.mangal.present)}
                <h3 className={`text-sm font-bold ${getDoshaTextColor(doshas.mangal.present)}`}>
                  Mangal Dosha (Mars)
                </h3>
              </div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {maleData.name}: {doshas.mangal.boy_points} | {femaleData.name}: {doshas.mangal.girl_points}
              </div>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              {doshas.mangal.message}
            </p>
          </div>

          {/* Pitra Dosha */}
          <div className={`rounded-lg border p-4 ${getDoshaColor(!doshas.pitra.boy && !doshas.pitra.girl)}`}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getDoshaIcon(doshas.pitra.boy || doshas.pitra.girl)}
                <h3 className={`text-sm font-bold ${getDoshaTextColor(doshas.pitra.boy || doshas.pitra.girl)}`}>
                  Pitra Dosha (Ancestral)
                </h3>
              </div>
              <div className="flex gap-2 text-xs">
                <span className={`rounded-full px-2 py-1 ${doshas.pitra.boy ? 'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-100' : 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100'}`}>
                  {maleData.name}: {doshas.pitra.boy ? 'Yes' : 'No'}
                </span>
                <span className={`rounded-full px-2 py-1 ${doshas.pitra.girl ? 'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-100' : 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100'}`}>
                  {femaleData.name}: {doshas.pitra.girl ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              {doshas.pitra.message}
            </p>
          </div>

          {/* Kaal Sarp Dosha */}
          <div className={`rounded-lg border p-4 ${getDoshaColor(doshas.kaalsarp.boy || doshas.kaalsarp.girl)}`}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getDoshaIcon(doshas.kaalsarp.boy || doshas.kaalsarp.girl)}
                <h3 className={`text-sm font-bold ${getDoshaTextColor(doshas.kaalsarp.boy || doshas.kaalsarp.girl)}`}>
                  Kaal Sarp Dosha
                </h3>
              </div>
              <div className="flex gap-2 text-xs">
                <span className={`rounded-full px-2 py-1 ${doshas.kaalsarp.boy ? 'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-100' : 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100'}`}>
                  {maleData.name}: {doshas.kaalsarp.boy ? 'Yes' : 'No'}
                </span>
                <span className={`rounded-full px-2 py-1 ${doshas.kaalsarp.girl ? 'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-100' : 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100'}`}>
                  {femaleData.name}: {doshas.kaalsarp.girl ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              {doshas.kaalsarp.message}
            </p>
          </div>

          {/* Manglik Dosha - Saturn */}
          <div className={`rounded-lg border p-4 ${getDoshaColor(doshas.manglik_saturn.boy || doshas.manglik_saturn.girl)}`}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getDoshaIcon(doshas.manglik_saturn.boy || doshas.manglik_saturn.girl)}
                <h3 className={`text-sm font-bold ${getDoshaTextColor(doshas.manglik_saturn.boy || doshas.manglik_saturn.girl)}`}>
                  Manglik Dosha (Saturn)
                </h3>
              </div>
              <div className="flex gap-2 text-xs">
                <span className={`rounded-full px-2 py-1 ${doshas.manglik_saturn.boy ? 'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-100' : 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100'}`}>
                  {maleData.name}: {doshas.manglik_saturn.boy ? 'Yes' : 'No'}
                </span>
                <span className={`rounded-full px-2 py-1 ${doshas.manglik_saturn.girl ? 'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-100' : 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100'}`}>
                  {femaleData.name}: {doshas.manglik_saturn.girl ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              {doshas.manglik_saturn.message}
            </p>
          </div>

          {/* Manglik Dosha - Rahu/Ketu */}
          <div className={`rounded-lg border p-4 ${getDoshaColor(doshas.manglik_rahuketu.boy || doshas.manglik_rahuketu.girl)}`}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getDoshaIcon(doshas.manglik_rahuketu.boy || doshas.manglik_rahuketu.girl)}
                <h3 className={`text-sm font-bold ${getDoshaTextColor(doshas.manglik_rahuketu.boy || doshas.manglik_rahuketu.girl)}`}>
                  Manglik Dosha (Rahu/Ketu)
                </h3>
              </div>
              <div className="flex gap-2 text-xs">
                <span className={`rounded-full px-2 py-1 ${doshas.manglik_rahuketu.boy ? 'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-100' : 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100'}`}>
                  {maleData.name}: {doshas.manglik_rahuketu.boy ? 'Yes' : 'No'}
                </span>
                <span className={`rounded-full px-2 py-1 ${doshas.manglik_rahuketu.girl ? 'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-100' : 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100'}`}>
                  {femaleData.name}: {doshas.manglik_rahuketu.girl ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              {doshas.manglik_rahuketu.message}
            </p>
          </div>

          {/* Rajju Dosha */}
          {doshas.rajju.present && (
            <div className="rounded-lg border border-orange-200 bg-orange-50/60 p-4 dark:border-orange-900 dark:bg-orange-900/10">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-bold text-orange-900 dark:text-orange-100">
                  Rajju Dosha - {doshas.rajju.part}
                </h3>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {doshas.rajju.description}
              </p>
            </div>
          )}

          {/* Vedha Dosha */}
          {doshas.vedha.present && (
            <div className="rounded-lg border border-orange-200 bg-orange-50/60 p-4 dark:border-orange-900 dark:bg-orange-900/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-bold text-orange-900 dark:text-orange-100">
                  Vedha Dosha Present
                </h3>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Papasamaya Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
      >
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Papasamaya (Malefic Influences)
          </h2>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-blue-200/60 bg-blue-50/60 p-3 dark:border-blue-900/60 dark:bg-blue-900/10">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {maleData.name}'s Papa Score
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-3">
              {papasamaya.boy_total.toFixed(2)}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Rahu:</span>
                <span className="font-bold">{papasamaya.boy_papa.rahu_papa || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Sun:</span>
                <span className="font-bold">{papasamaya.boy_papa.sun_papa || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Saturn:</span>
                <span className="font-bold">{papasamaya.boy_papa.saturn_papa?.toFixed(2) || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Mars:</span>
                <span className="font-bold">{papasamaya.boy_papa.mars_papa || 0}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-pink-200/60 bg-pink-50/60 p-3 dark:border-pink-900/60 dark:bg-pink-900/10">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {femaleData.name}'s Papa Score
            </div>
            <div className="text-2xl font-bold text-pink-900 dark:text-pink-100 mb-3">
              {papasamaya.girl_total.toFixed(2)}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Rahu:</span>
                <span className="font-bold">{papasamaya.girl_papa.rahu_papa || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Sun:</span>
                <span className="font-bold">{papasamaya.girl_papa.sun_papa || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Saturn:</span>
                <span className="font-bold">{papasamaya.girl_papa.saturn_papa?.toFixed(2) || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Mars:</span>
                <span className="font-bold">{papasamaya.girl_papa.mars_papa || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-purple-200/60 bg-purple-50/60 p-3 dark:border-purple-900/60 dark:bg-purple-900/10">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {papasamaya.message}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
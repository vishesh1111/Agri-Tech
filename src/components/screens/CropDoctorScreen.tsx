'use client';

import React, { useState } from 'react';
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  FlaskConical,
  Leaf,
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function CropDoctorScreen() {
  const {
    isDoctorAnalyzing,
    doctorPathologyResult,
    runCropDoctorScan,
    navigateBack,
    navigateToSubScreen,
  } = useKisanStore();

  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const cropsList = ['Wheat', 'Paddy / Rice', 'Cotton', 'Mustard', 'Sugarcane', 'Maize', 'Potato'];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleScan = async () => {
    await runCropDoctorScan(previewImage || undefined, selectedCrop);
  };

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Header Info Banner */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-100/60 dark:from-emerald-950/40 dark:to-zinc-900 dark:border-emerald-900">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-300">
              Crop Doctor AI Pathology
            </h2>
            <p className="text-xs text-emerald-800 dark:text-emerald-400">
              Take or upload a photo of infected leaves for instant diagnosis & treatment
            </p>
          </div>
        </div>
      </Card>

      {/* 1. Crop Selector Dropdown */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
          Target Crop Type
        </label>
        <div className="flex gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          {cropsList.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCrop(c)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                selectedCrop === c
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Photo Capture & Preview Area */}
      <Card className="flex flex-col items-center justify-center border-dashed border-2 border-gray-300 p-6 text-center dark:border-zinc-700">
        {previewImage ? (
          <div className="space-y-3 w-full">
            <div className="relative mx-auto h-56 w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt="Selected Leaf"
                className="h-full w-full object-cover"
              />
            </div>
            <button
              onClick={() => setPreviewImage(null)}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Remove / Retake Photo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Camera className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                Capture Leaf Photo
              </h3>
              <p className="text-xs text-gray-500">
                Hold phone 15-20cm from leaf ensuring good natural lighting
              </p>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              {/* Camera Input */}
              <label className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all">
                <Camera className="h-4 w-4" />
                <span>Open Camera</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {/* Gallery Input */}
              <label className="cursor-pointer flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <Upload className="h-4 w-4" />
                <span>Gallery</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </Card>

      {/* 3. Scan Action Button */}
      <button
        onClick={handleScan}
        disabled={isDoctorAnalyzing}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 active:scale-98 transition-all"
      >
        <Sparkles className="h-5 w-5" />
        <span>
          {isDoctorAnalyzing
            ? 'Analyzing Leaf Pathology...'
            : previewImage
            ? `Run AI Diagnosis on ${selectedCrop}`
            : `Run Sample Diagnosis for ${selectedCrop}`}
        </span>
      </button>

      {/* 4. Diagnostic Results Card */}
      {doctorPathologyResult && (
        <div className="space-y-3 pt-2">
          <Card className="border-rose-200 bg-rose-50/60 dark:bg-rose-950/20 dark:border-rose-900/40">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Detected Pathology
                </span>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-zinc-100">
                  {doctorPathologyResult.diseaseName}
                </h3>
                <p className="text-xs text-gray-600 dark:text-zinc-300 mt-0.5">
                  Category: {doctorPathologyResult.category}
                </p>
              </div>
              <Badge variant="danger">{doctorPathologyResult.confidence}</Badge>
            </div>

            <div className="mt-3 rounded-xl bg-white p-3 text-xs dark:bg-zinc-900 shadow-xs space-y-1.5">
              <span className="font-bold text-gray-900 dark:text-zinc-100 block">
                Visual Symptoms:
              </span>
              <p className="text-gray-600 dark:text-zinc-300">
                {doctorPathologyResult.symptomsSummary}
              </p>
            </div>
          </Card>

          {/* Action Steps */}
          <Card className="space-y-3">
            <h4 className="font-bold text-sm text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Recommended Treatment Protocol</span>
            </h4>

            <ol className="space-y-2 text-xs text-gray-700 dark:text-zinc-300">
              {doctorPathologyResult.treatmentSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-gray-50 p-2.5 rounded-xl dark:bg-zinc-800">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-bold text-white text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            {/* Chemical & Organic Prescriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <div className="rounded-xl bg-blue-50 p-3 text-xs dark:bg-blue-950/30">
                <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1">
                  <FlaskConical className="h-3.5 w-3.5" />
                  <span>Chemical Fungicide Spray</span>
                </span>
                <p className="mt-1 text-blue-950 dark:text-blue-200">
                  {doctorPathologyResult.recommendedChemical}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-xs dark:bg-emerald-950/30">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                  <Leaf className="h-3.5 w-3.5" />
                  <span>Organic & Biological Remedy</span>
                </span>
                <p className="mt-1 text-emerald-950 dark:text-emerald-200">
                  {doctorPathologyResult.organicRemedy}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-xs dark:bg-amber-950/30">
              <span className="font-bold text-amber-900 dark:text-amber-300">
                Soil & Nutrition Advice:
              </span>
              <p className="mt-1 text-amber-950 dark:text-amber-200">
                {doctorPathologyResult.soilAndNutrientAdvice}
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default CropDoctorScreen;

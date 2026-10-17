'use client';

import React, { useState } from 'react';
import {
  Camera,
  Upload,
  Leaf,
  Store,
  FlaskConical,
  Sparkles,
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { Card, Badge } from '@/components/ui/Card';

export function CropDoctorScreen() {
  const {
    isDoctorAnalyzing,
    doctorPathologyResult,
    runCropDoctorScan,
    setTab,
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
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-zinc-900">
              Crop Doctor
            </h1>
            <Badge variant="neutral">Vision AI</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Upload leaf or stem images for automated disease identification and treatment protocol
          </p>
        </div>
      </div>

      {/* 2. Main 12-Column Diagnostic Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Crop Selector & Image Dropzone */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 space-y-4">
            <div>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                1. Select Crop
              </span>
              <div className="flex gap-1.5 overflow-x-auto pt-2 pb-1 scrollbar-none">
                {cropsList.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCrop(c)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedCrop === c
                        ? 'bg-zinc-900 text-white font-semibold'
                        : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Capture & Upload Dropzone */}
            <div>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-2">
                2. Capture or Upload Leaf Photo
              </span>

              <div className="flex flex-col items-center justify-center border border-dashed border-zinc-300 rounded-xl p-6 text-center bg-zinc-50/50">
                {previewImage ? (
                  <div className="space-y-3 w-full">
                    <div className="relative mx-auto h-48 w-full max-w-xs overflow-hidden rounded-lg border border-zinc-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewImage}
                        alt="Selected Leaf"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => setPreviewImage(null)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                      <Leaf className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-800">
                        Upload or take a photo of the affected leaf
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Ensure good daylight and sharp focus on symptoms
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center pt-1">
                      <label className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-medium text-white cursor-pointer transition-colors">
                        <Camera className="h-3.5 w-3.5" />
                        <span>Camera</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>

                      <label className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 px-3.5 py-1.5 text-xs font-medium text-zinc-700 cursor-pointer transition-colors">
                        <Upload className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Browse File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setPreviewImage('/images/img_leaf_disease.jpg')}
                        className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 transition-colors"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Test Sample Leaf</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Run Diagnostic Button */}
            <button
              onClick={handleScan}
              disabled={isDoctorAnalyzing}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-medium text-white disabled:opacity-50 transition-colors"
            >
              {isDoctorAnalyzing ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Analyzing leaf features...</span>
                </>
              ) : (
                <>
                  <FlaskConical className="h-3.5 w-3.5" />
                  <span>Diagnose {selectedCrop}</span>
                </>
              )}
            </button>
          </Card>
        </div>

        {/* Right Column (7 Cols): Diagnostic Report & Remedies */}
        <div className="lg:col-span-7 space-y-4">
          {doctorPathologyResult ? (
            <Card className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                      Diagnosis Result
                    </span>
                    <Badge variant={doctorPathologyResult.severity === 'HIGH' ? 'danger' : 'warning'}>
                      Severity: {doctorPathologyResult.severity}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 mt-1">
                    {doctorPathologyResult.diseaseName}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Category: {doctorPathologyResult.category}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-bold text-zinc-900">
                    {doctorPathologyResult.confidencePercent ? `${doctorPathologyResult.confidencePercent}%` : doctorPathologyResult.confidence}
                  </span>
                  <span className="text-[10px] text-zinc-400 block">Match Confidence</span>
                </div>
              </div>

              {/* Symptoms Description */}
              <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-3 text-xs text-zinc-700 space-y-0.5">
                <span className="font-medium block text-zinc-900">
                  Observed Symptoms:
                </span>
                <p className="text-zinc-600">{doctorPathologyResult.symptomsDescription || doctorPathologyResult.symptomsSummary}</p>
              </div>

              {/* Treatment Protocols */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-900 block">
                  Recommended Treatment Protocol
                </span>

                <div className="space-y-1.5">
                  {doctorPathologyResult.treatmentSteps.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-lg border border-zinc-100 p-2.5 text-xs bg-zinc-50/50"
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-700">
                        {i + 1}
                      </span>
                      <span className="text-zinc-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chemical vs Organic Remedy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200/80 space-y-1">
                  <span className="text-[10px] font-medium text-zinc-500 uppercase block">
                    Recommended Chemical Spray
                  </span>
                  <p className="font-semibold text-zinc-900">
                    {doctorPathologyResult.recommendedChemical}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Dosage: {doctorPathologyResult.dosageRecommendation || '1.5 - 2 ml/L water'}
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200/80 space-y-1">
                  <span className="text-[10px] font-medium text-zinc-500 uppercase block">
                    Organic / Bio-Control Remedy
                  </span>
                  <p className="font-semibold text-zinc-900">
                    {doctorPathologyResult.organicRemedy}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Eco-friendly botanical extract formulation
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <span className="text-xs text-zinc-500">Need chemical inputs delivered?</span>
                <button
                  onClick={() => setTab('market')}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors"
                >
                  <Store className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Order on Mandi</span>
                </button>
              </div>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center space-y-2 min-h-[340px]">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center text-xl">
                🩺
              </div>
              <h3 className="font-semibold text-sm text-zinc-900">
                Pathology Scanner Ready
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                Select your crop on the left and upload an affected leaf image to receive disease identification and ICAR treatment plans.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default CropDoctorScreen;

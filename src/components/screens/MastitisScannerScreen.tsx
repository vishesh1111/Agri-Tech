'use client';

import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, AlertCircle, CheckCircle2, ArrowLeft, 
  Activity, Sparkles, RefreshCw, ShieldAlert, FileText, Info, Cpu, Stethoscope, AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';
import { mlService, MastitisAnalysisResult } from '@/lib/ml/mlService';

export const MastitisScannerScreen: React.FC = () => {
  const { addNotification } = useKisanStore();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  // Result state
  const [prediction, setPrediction] = useState<MastitisAnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        setScanComplete(false);
        setPrediction(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunScan = async () => {
    if (!imagePreview) return;
    setIsScanning(true);
    setProgress(20);

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 150);

    try {
      const result = await mlService.predictMastitis(imagePreview);
      clearInterval(progressTimer);
      setProgress(100);
      setIsScanning(false);
      setScanComplete(true);
      setPrediction(result);

      if (result.isInvalidImage) {
        addNotification({
          farmId: 'farm_1',
          title: 'Udder Photo Quality Warning',
          message: result.invalidReason || 'Photo is too dark or obscured. Retake in daylight.',
          severity: 'WARNING',
          type: 'LIVESTOCK',
        });
      } else if (result.hasMastitis) {
        addNotification({
          farmId: 'farm_1',
          title: 'Mastitis Risk Alert: Udder Scan Result',
          message: `High risk of mastitis detected (${result.confidence}% confidence, SCC elevated). Discard milk from affected quarter and start CMT triage.`,
          severity: 'CRITICAL',
          type: 'LIVESTOCK',
        });
      } else {
        addNotification({
          farmId: 'farm_1',
          title: 'Udder Health Clear',
          message: `Udder scan evaluated normal (${result.confidence}% confidence, SCC within healthy limits).`,
          severity: 'INFO',
          type: 'LIVESTOCK',
        });
      }
    } catch (e: any) {
      clearInterval(progressTimer);
      setIsScanning(false);
      console.error('Scan error:', e);
    }
  };

  const loadHealthySample = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Light pinkish background
      ctx.fillStyle = '#fce7f3';
      ctx.fillRect(0, 0, 224, 224);
      // Symmetric healthy quarters
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.arc(80, 100, 48, 0, Math.PI * 2);
      ctx.arc(144, 100, 48, 0, Math.PI * 2);
      ctx.fill();
      // Teats
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.ellipse(75, 155, 8, 18, 0, 0, Math.PI * 2);
      ctx.ellipse(149, 155, 8, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      setImagePreview(canvas.toDataURL('image/jpeg'));
      setPrediction(null);
      setScanComplete(false);
    }
  };

  const loadMastitisSample = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#fce7f3';
      ctx.fillRect(0, 0, 224, 224);
      // Quarters
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.arc(80, 100, 48, 0, Math.PI * 2);
      ctx.arc(144, 100, 48, 0, Math.PI * 2);
      ctx.fill();
      // Acute erythema inflammation on right quarter
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(144, 100, 36, 0, Math.PI * 2);
      ctx.fill();
      // Swollen teat
      ctx.fillStyle = '#be123c';
      ctx.beginPath();
      ctx.ellipse(149, 155, 14, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      setImagePreview(canvas.toDataURL('image/jpeg'));
      setPrediction(null);
      setScanComplete(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Stethoscope className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              Mastitis Udder Health Scanner
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Early subclinical mastitis triage, Somatic Cell Count (SCC) estimation & teat health guidance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-50 text-zinc-700 border border-zinc-200">
            <Cpu className="w-3.5 h-3.5 text-emerald-700" />
            <span>On-Device WASM Engine</span>
          </span>
        </div>
      </div>

      {/* 2. Main 12-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Upload & Scanner Controls */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <h3 className="font-semibold text-sm text-zinc-900">
              Udder Photographic Inspection
            </h3>

            <div className="border border-dashed border-zinc-200 rounded-xl p-5 text-center space-y-3 bg-zinc-50/50">
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative mx-auto h-52 w-full max-w-xs overflow-hidden rounded-lg border border-zinc-200 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Udder Preview" className="h-full w-full object-cover" />
                  </div>
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setPrediction(null);
                      setScanComplete(false);
                    }}
                    className="text-xs font-medium text-rose-700 hover:underline"
                  >
                    Remove and choose another image
                  </button>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  <div className="w-12 h-12 rounded-lg bg-zinc-100 text-zinc-600 mx-auto flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-xs text-zinc-900">
                      Upload Rear View of Udder & Teats
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Ensure adequate lighting and clean skin before milking
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  <div className="flex flex-wrap gap-2 justify-center pt-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 transition-colors shadow-xs"
                    >
                      Choose Photo
                    </button>

                    <button
                      onClick={loadHealthySample}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      Sample: Healthy
                    </button>

                    <button
                      onClick={loadMastitisSample}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-800 hover:bg-rose-100 transition-colors"
                    >
                      Sample: Mastitis
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Run Scan Button */}
            <button
              onClick={handleRunScan}
              disabled={!imagePreview || isScanning}
              className="w-full rounded-lg bg-emerald-700 py-2.5 text-xs font-medium text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-xs"
            >
              {isScanning ? `Analyzing Udder (${progress}%)...` : 'Run Health Scan'}
            </button>
          </Card>
        </div>

        {/* Right Column (7 Cols): Clinical Findings & Treatment Report */}
        <div className="lg:col-span-7 space-y-4">
          {prediction ? (
            prediction.isInvalidImage ? (
              <Card className="p-5 border border-amber-300 bg-amber-50/50 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-amber-950">
                      Insufficient Image Illumination / Obscured
                    </h3>
                    <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                      {prediction.invalidReason}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/80 border border-amber-200 text-xs space-y-1">
                  <span className="font-semibold text-amber-950 block">Capture Guidelines:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-amber-900 leading-relaxed">
                    {prediction.immediateTreatments.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            ) : (
              <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                      Diagnostic Finding
                    </span>
                    <h3 className={`text-lg font-semibold mt-0.5 ${
                      prediction.hasMastitis ? 'text-rose-700' : 'text-emerald-700'
                    }`}>
                      {prediction.hasMastitis ? 'Subclinical Mastitis Detected' : 'Healthy Udder Tissue'}
                    </h3>
                    <span className="text-xs font-mono font-medium text-zinc-600 mt-0.5 block">
                      {prediction.sccEstimate}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`text-2xl font-semibold ${
                      prediction.hasMastitis ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {prediction.confidence}%
                    </span>
                    <span className="text-[11px] text-zinc-400 block font-normal">Confidence</span>
                  </div>
                </div>

                {/* Observed Clinical Signs */}
                <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/70 space-y-1 text-xs">
                  <span className="font-medium text-zinc-900 block">
                    Observed Clinical Indicators:
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-zinc-600 leading-relaxed">
                    {prediction.clinicalSigns.map((sign, idx) => (
                      <li key={idx}>{sign}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Protocol */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-medium text-zinc-900">
                    Recommended Treatment & Hygiene Protocol:
                  </h4>
                  <div className="space-y-1.5">
                    {(prediction.immediateTreatments || []).map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-zinc-600">
                        <span className="h-4 w-4 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )
          ) : (
            <Card className="p-8 text-center border border-zinc-200/80 bg-white space-y-2">
              <Camera className="w-8 h-8 text-zinc-300 mx-auto" />
              <h4 className="text-sm font-medium text-zinc-800">
                Ready to Scan Udder
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Take a clean photograph of the bovine udder or choose a sample to analyze inflammation signs and estimate somatic cell counts.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MastitisScannerScreen;

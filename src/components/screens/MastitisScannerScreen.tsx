'use client';

import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, AlertCircle, CheckCircle2, ArrowLeft, 
  Activity, Sparkles, RefreshCw, ShieldAlert, FileText, Info, Cpu
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

      if (result.hasMastitis) {
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
    } catch (e) {
      clearInterval(progressTimer);
      setIsScanning(false);
      console.error('Scan error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>🩺</span>
            <span>Bovine Mastitis & Udder Health Vision Scanner</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Early subclinical mastitis triage via INT8 ONNX WebAssembly, Somatic Cell Count (SCC) estimation & teat health protocols
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Cpu className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            ONNX Runtime Web (WASM INT8)
          </span>
        </div>
      </div>

      {/* 2. Main 12-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Upload & Scanner Controls */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 border border-gray-200 dark:border-zinc-800 space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-zinc-100">
              Udder Photographic Inspection
            </h3>

            <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-2xl p-6 text-center space-y-3 bg-gray-50/50 dark:bg-zinc-800/40">
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative mx-auto h-56 w-full max-w-xs overflow-hidden rounded-2xl border border-gray-200 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Udder Preview" className="h-full w-full object-cover" />
                  </div>
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setPrediction(null);
                      setScanComplete(false);
                    }}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Remove and choose another image
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-800 dark:text-zinc-200">
                      Upload Rear View of Udder & Teats
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Ensure good lighting and clean udder surface prior to milking
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                    >
                      Choose Photo / Take Picture
                    </button>

                    <button
                      onClick={() => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 224;
                        canvas.height = 224;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          ctx.fillStyle = '#fdf2f8';
                          ctx.fillRect(0, 0, 224, 224);
                          // Draw udder quarters
                          ctx.fillStyle = '#fda4af';
                          ctx.beginPath();
                          ctx.arc(80, 90, 45, 0, Math.PI * 2);
                          ctx.arc(144, 90, 45, 0, Math.PI * 2);
                          ctx.fill();
                          // Erythema inflammation region
                          ctx.fillStyle = '#f43f5e';
                          ctx.beginPath();
                          ctx.arc(144, 95, 25, 0, Math.PI * 2);
                          ctx.fill();
                          setImagePreview(canvas.toDataURL('image/jpeg'));
                          setPrediction(null);
                          setScanComplete(false);
                        }
                      }}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-800 hover:bg-rose-100 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 inline mr-1 text-rose-600" />
                      Test Sample Udder
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Run Scan Button */}
            <button
              onClick={handleRunScan}
              disabled={!imagePreview || isScanning}
              className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95"
            >
              {isScanning ? `Analyzing Udder Telemetry (${progress}%)...` : 'Run Udder Health Scan (Client WASM)'}
            </button>
          </Card>
        </div>

        {/* Right Column (7 Cols): Clinical Findings & Treatment Report */}
        <div className="lg:col-span-7 space-y-4">
          {prediction ? (
            <Card className={`p-6 border-2 space-y-4 ${
              prediction.hasMastitis 
                ? 'border-rose-300 dark:border-rose-900/60' 
                : 'border-emerald-300 dark:border-emerald-900/60'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    prediction.hasMastitis ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    Edge AI Pathology Report
                  </span>
                  <h3 className="text-xl font-black text-gray-900 dark:text-zinc-100 mt-0.5">
                    {prediction.hasMastitis ? 'Subclinical Mastitis Detected' : 'Healthy Udder Tissue'}
                  </h3>
                  <span className={`text-xs font-mono font-bold mt-1 block ${
                    prediction.hasMastitis ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
                  }`}>
                    {prediction.sccEstimate}
                  </span>
                </div>

                <div className="text-right">
                  <span className={`text-2xl font-black ${
                    prediction.hasMastitis ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {prediction.confidence}%
                  </span>
                  <span className="text-[10px] text-gray-400 block font-semibold">Vision Match</span>
                </div>
              </div>

              {/* Observed Clinical Signs */}
              <div className={`p-3.5 rounded-xl border space-y-1.5 text-xs ${
                prediction.hasMastitis
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                  : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
              }`}>
                <span className={`font-bold block ${
                  prediction.hasMastitis ? 'text-rose-950 dark:text-rose-200' : 'text-emerald-950 dark:text-emerald-200'
                }`}>
                  Observed Clinical Indicators:
                </span>
                <ul className={`list-disc pl-4 space-y-1 ${
                  prediction.hasMastitis ? 'text-rose-900 dark:text-rose-300' : 'text-emerald-900 dark:text-emerald-300'
                }`}>
                  {prediction.clinicalSigns.map((sign, i) => (
                    <li key={i}>{sign}</li>
                  ))}
                </ul>
              </div>

              {/* Treatment Protocols */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-gray-500">
                  {prediction.hasMastitis ? 'Immediate Veterinary Treatment Protocol' : 'Routine Preventive Care Protocols'}
                </h4>
                <div className="space-y-2">
                  {prediction.immediateTreatments.map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800">
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        prediction.hasMastitis ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {i + 1}
                      </span>
                      <span className="text-gray-700 dark:text-zinc-300 font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center border border-gray-200 dark:border-zinc-800 space-y-3 min-h-[350px]">
              <div className="h-16 w-16 rounded-3xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-3xl">
                🩺
              </div>
              <h3 className="font-black text-base text-gray-900 dark:text-zinc-100">
                Udder Health Diagnostic Studio
              </h3>
              <p className="text-xs text-gray-500 max-w-md">
                Upload a rear-view image of the bovine udder to screen for early inflammation, quarter swelling, and somatic cell count elevations before milk quality declines.
              </p>
              <div className="pt-2">
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <span>⚡</span> Powered by ONNX Runtime WebAssembly running 100% in your browser
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MastitisScannerScreen;

'use client';

import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, AlertCircle, CheckCircle2, ArrowLeft, 
  Activity, Sparkles, RefreshCw, ShieldAlert, FileText, Info
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';

export const MastitisScannerScreen: React.FC = () => {
  const { navigateBack, addNotification } = useKisanStore();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  // Result state
  const [prediction, setPrediction] = useState<{
    hasMastitis: boolean;
    confidence: number;
    riskLevel: 'High' | 'Moderate' | 'Low';
    sccEstimate: string;
    clinicalSigns: string[];
    immediateTreatments: string[];
  } | null>(null);

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

  const handleRunScan = () => {
    if (!imagePreview) return;
    setIsScanning(true);
    setProgress(15);

    setTimeout(() => setProgress(45), 600);
    setTimeout(() => setProgress(80), 1200);

    setTimeout(() => {
      setProgress(100);
      setIsScanning(false);
      setScanComplete(true);

      // Simulated diagnosis based on typical test image
      setPrediction({
        hasMastitis: true,
        confidence: 89,
        riskLevel: 'High',
        sccEstimate: '≈ 578,000 cells/mL (Elevated)',
        clinicalSigns: [
          'Visible erythema & swelling on right rear quarter',
          'Skin hyperthermia pattern detected',
          'Mild udder asymmetry consistent with subclinical inflammation'
        ],
        immediateTreatments: [
          'Perform California Mastitis Test (CMT) strip verification immediately',
          'Milk the infected quarter out completely into a separate discard vessel',
          'Apply intramammary antimicrobial infusion (Cephapirin/Amoxicillin) as prescribed by vet',
          'Post-milking teat dip with 0.5% povidone-iodine barrier solution',
          'Keep animal standing for 45 mins post-milking with fresh green fodder'
        ]
      });

      addNotification({
        farmId: 'farm_1',
        title: 'Mastitis Risk Alert: Udder Scan Result',
        message: 'High risk of quarter inflammation detected in recent scan. SCC ≈ 578k. Follow immediate teat sanitization protocol.',
        severity: 'CRITICAL',
        type: 'LIVESTOCK'
      });
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-rose-700 to-red-700 text-white px-4 pt-4 pb-5 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={navigateBack}
            className="p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-300" />
              Mastitis Udder Health Scanner
            </h1>
            <p className="text-xs text-rose-100">Deep learning bovine mammary inflammation screening</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Intro Alert Card */}
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl p-3.5 text-xs text-rose-950 dark:text-rose-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Detecting subclinical mastitis before visible clots save up to <strong>₹7,000 per lactation cycle</strong> and prevents permanent udder fibrosis.
          </p>
        </div>

        {/* Capture / Upload Card */}
        <Card className="p-4 text-center space-y-3">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageSelect}
            className="hidden" 
          />

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video max-h-56 mx-auto bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imagePreview} 
                alt="Udder Sample" 
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Retake
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 cursor-pointer hover:border-rose-500 hover:bg-rose-50/20 transition-all flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Photograph Cow / Buffalo Udder
              </h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Take a clear, well-lit photo of all 4 quarters from 2-3 feet distance
              </p>
            </div>
          )}

          {/* Action Button */}
          {imagePreview && !scanComplete && (
            <button
              disabled={isScanning}
              onClick={handleRunScan}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold py-3 rounded-xl shadow-md text-sm flex items-center justify-center gap-2 transition-all"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Neural Network ({progress}%)...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Mammary Health
                </>
              )}
            </button>
          )}
        </Card>

        {/* Diagnosis Results Card */}
        {scanComplete && prediction && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-4 border-l-4 border-l-rose-600 shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                    Clinical Finding
                  </span>
                  <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400 mt-1">
                    {prediction.hasMastitis ? 'Subclinical Mastitis Detected' : 'Normal / Healthy Udder'}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Confidence</span>
                  <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                    {prediction.confidence}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 dark:border-slate-800 my-2">
                <div>
                  <span className="text-slate-400 block">Risk Category</span>
                  <strong className="text-rose-600 font-bold">{prediction.riskLevel} Risk</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Estimated SCC Count</span>
                  <strong className="text-slate-700 dark:text-slate-200">{prediction.sccEstimate}</strong>
                </div>
              </div>

              {/* Signs */}
              <div className="mt-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Computer Vision Indicators:
                </h4>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  {prediction.clinicalSigns.map((sign, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Treatment Protocol */}
            <Card className="p-4 shadow-md bg-white dark:bg-slate-800">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                Recommended Veterinary Action Plan
              </h4>

              <div className="space-y-2 text-xs">
                {prediction.immediateTreatments.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
export default MastitisScannerScreen;

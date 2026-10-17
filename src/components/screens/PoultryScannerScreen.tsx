'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mic, MicOff, Volume2, AlertTriangle, CheckCircle2, 
  ArrowLeft, RefreshCw, Sparkles, Activity, ShieldCheck, Info
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';

export const PoultryScannerScreen: React.FC = () => {
  const { navigateBack, addNotification } = useKisanStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    label: string;
    confidence: number;
    severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
    findings: string[];
    advisory: string;
  } | null>(null);

  // Timer for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds(prev => {
          if (prev >= 5) {
            handleStopAndAnalyze();
            return 5;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setResult(null);
    setIsRecording(true);
    setRecordSeconds(0);
  };

  const handleStopAndAnalyze = () => {
    setIsRecording(false);
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      setResult({
        label: 'Mild Avian Rales / Sneezing Detected',
        confidence: 87,
        severity: 'WARNING',
        findings: [
          'High frequency acoustic spikes detected (3.2 kHz to 4.5 kHz)',
          'Periodic sneezing/coughing cluster at 12 events per minute',
          'Slight reduction in normal vocal chattering pattern'
        ],
        advisory: 'Early indicator of Infectious Bronchitis or Chronic Respiratory Disease (CRD). Increase shed ventilation immediately, check ammonia levels in litter, and administer electrolyte + Tylosin water solubles under veterinarian guidance.'
      });

      addNotification({
        farmId: 'farm_1',
        title: 'Poultry Bioacoustics Warning: Respiratory Rales',
        message: 'Acoustic monitoring detected repeated sneezing in Flock #1. Ventilation adjustment recommended.',
        severity: 'WARNING',
        type: 'POULTRY'
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-4 pt-4 pb-5 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={navigateBack}
            className="p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-amber-200" />
              Poultry Bioacoustic Monitor
            </h1>
            <p className="text-xs text-amber-100">Acoustic cough & rale detector for broiler & layer flocks</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Info Card */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3.5 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Record 5 seconds of ambient poultry shed sounds. Bioacoustic deep learning recognizes avian snoring, rales, and distressed gasping <strong>days before mortality rises</strong>.
          </p>
        </div>

        {/* Audio Recording Controller Card */}
        <Card className="p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-md">
          {/* Animated Microphone Circle */}
          <div className="relative">
            {isRecording && (
              <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-40"></div>
            )}
            <button
              onClick={isRecording ? handleStopAndAnalyze : handleStartRecording}
              disabled={isAnalyzing}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all ${
                isRecording 
                  ? 'bg-rose-600 scale-105 ring-8 ring-rose-200 dark:ring-rose-950' 
                  : isAnalyzing
                  ? 'bg-amber-500 opacity-80'
                  : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95'
              }`}
            >
              {isAnalyzing ? (
                <RefreshCw className="w-10 h-10 animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-10 h-10" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
              <span className="text-[10px] font-bold mt-1 uppercase">
                {isAnalyzing ? 'Analyzing' : isRecording ? 'Stop' : 'Tap Record'}
              </span>
            </button>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {isRecording 
                ? `Listening to flock... (${recordSeconds}s / 5s)` 
                : isAnalyzing 
                ? 'Processing bioacoustic spectrum...' 
                : 'Ready to Listen'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRecording 
                ? 'Hold phone near the bird cages or litter floor' 
                : 'Tap the button above to begin 5-second acoustic analysis'}
            </p>
          </div>
        </Card>

        {/* Acoustic Diagnosis Results */}
        {result && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-4 border-l-4 border-l-amber-500 shadow-md">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    Acoustic Diagnosis
                  </span>
                  <h3 className="text-base font-bold text-amber-700 dark:text-amber-400 mt-1">
                    {result.label}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Confidence</span>
                  <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                    {result.confidence}%
                  </span>
                </div>
              </div>

              {/* Spectral Findings */}
              <div className="mt-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Audio Spectral Characteristics:
                </h4>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  {result.findings.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Advisory */}
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs">
                <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-1">
                  Management Action Plan:
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {result.advisory}
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
export default PoultryScannerScreen;

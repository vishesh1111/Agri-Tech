'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, Play, Pause, AlertTriangle, Camera, 
  RotateCcw, ShieldCheck, CheckCircle2, Info, Sparkles, Clock,
  Eye, RefreshCw, Zap
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';

export const CctvMonitorScreen: React.FC = () => {
  const { addNotification } = useKisanStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [useMountingVideo, setUseMountingVideo] = useState(false);
  const [heatDetected, setHeatDetected] = useState(false);
  const [eventLogged, setEventLogged] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Simulated AI detection after 4 seconds of playback
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      setHeatDetected(false);
      setEventLogged(false);
      timer = setTimeout(() => {
        setHeatDetected(true);
      }, 4000);
    } else {
      setHeatDetected(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, useMountingVideo]);

  const handlePlayToggle = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(e => console.log('Autoplay policy', e));
      setIsPlaying(true);
    }
  };

  const handleSwitchCamera = () => {
    setIsPlaying(false);
    setHeatDetected(false);
    setUseMountingVideo(!useMountingVideo);
  };

  const handleLogEvent = () => {
    addNotification({
      farmId: 'farm_1',
      title: 'Estrus Heat Detected (CCTV Cam 2)',
      message: 'Cow #42 observed exhibiting standing estrus mounting behavior. Insemination window active (next 12-18h).',
      severity: 'WARNING',
      type: 'LIVESTOCK'
    });
    setEventLogged(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>📹</span>
            <span>CowCatcherAI — CCTV Bovine Estrus Video Monitor</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Continuous barn video telemetry with automated computer vision mounting behavior recognition & AI insemination timer
          </p>
        </div>

        <button
          onClick={handleSwitchCamera}
          className="flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-gray-800 dark:text-zinc-200 hover:bg-gray-200 transition-colors"
        >
          <Camera className="w-4 h-4 text-emerald-600" />
          <span>Switch Camera: {useMountingVideo ? 'Camera 2 (Active Yard)' : 'Camera 1 (Milking Shed)'}</span>
        </button>
      </div>

      {/* 2. Main 12-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Video Player & Overlays */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-gray-800 shadow-2xl flex items-center justify-center">
            <video
              ref={videoRef}
              src={useMountingVideo ? '/videos/cctv_mounting.mp4' : '/videos/cctv.mp4'}
              loop
              playsInline
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Live Rec Indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              <span>LIVE • BARN CAM 02</span>
            </div>

            {/* AI Model Badge */}
            <div className="absolute top-4 right-4 bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>YOLOv8-Pose Active</span>
            </div>

            {/* Bounding Box Overlay when heat is detected */}
            {heatDetected && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="border-4 border-rose-500 rounded-2xl w-64 h-64 relative animate-pulse flex flex-col justify-between p-2 shadow-[0_0_40px_rgba(244,63,94,0.5)]">
                  <span className="bg-rose-600 text-white font-mono font-black text-xs px-2 py-0.5 rounded self-start">
                    MOUNTING DETECTED (94%)
                  </span>
                  <span className="bg-black/70 text-white font-mono text-[10px] px-1.5 py-0.5 rounded self-end">
                    TAG #42 (Murrah)
                  </span>
                </div>
              </div>
            )}

            {/* Play/Pause Center Overlay if paused */}
            {!isPlaying && (
              <button
                onClick={handlePlayToggle}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-emerald-600/90 text-white flex items-center justify-center hover:bg-emerald-500 transition-transform active:scale-95 shadow-xl"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
            )}
          </div>

          {/* Video Controls Bar */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayToggle}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause Feed' : 'Start Live Telemetry'}</span>
              </button>

              <button
                onClick={handleSwitchCamera}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-zinc-200 hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Switch Video Stream</span>
              </button>
            </div>

            <span className="text-xs text-gray-500 font-mono">
              Status: {isPlaying ? (heatDetected ? '⚠️ Heat Detected' : '● Normal Activity') : 'Stream Paused'}
            </span>
          </div>
        </div>

        {/* Right Column (4 Cols): AI Inference Telemetry Panel */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 border-2 border-emerald-300 dark:border-emerald-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-zinc-100">
                  AI Behavioral Analytics
                </h3>
                <p className="text-xs text-gray-500">Real-time posture and estrus telemetry</p>
              </div>
              <Badge variant={heatDetected ? 'danger' : 'neutral'}>
                {heatDetected ? 'HEAT ACTIVE' : 'MONITORING'}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Mounting Confidence</span>
                <p className="text-xl font-black text-rose-600">
                  {heatDetected ? '94.2% Probability' : '3.1% (Baseline)'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Optimal Insemination Window</span>
                <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                  {heatDetected ? 'Next 12 - 18 Hours (AM-PM Rule)' : 'No heat signs detected'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Target Animal</span>
                <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                  Cow #42 (Laxmi - Sahiwal Cross)
                </p>
              </div>
            </div>

            {heatDetected && (
              <button
                onClick={handleLogEvent}
                disabled={eventLogged}
                className="w-full rounded-xl bg-rose-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50 transition-all"
              >
                {eventLogged ? '✓ Event Logged in Livestock Registry' : 'Log Heat Event & Alert Veterinarian'}
              </button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CctvMonitorScreen;

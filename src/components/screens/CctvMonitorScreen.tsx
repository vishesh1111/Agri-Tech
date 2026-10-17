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
      message: 'Cow #42 observed exhibiting mounting behavior. Recommended insemination window active.',
      severity: 'WARNING',
      type: 'LIVESTOCK'
    });
    setEventLogged(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Video className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              CCTV Estrus Heat Monitor
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Video feed with automated computer vision mounting behavior recognition and insemination timing
          </p>
        </div>

        <button
          onClick={handleSwitchCamera}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-xs"
        >
          <Camera className="w-4 h-4 text-zinc-500" />
          <span>Switch Camera: {useMountingVideo ? 'Camera 2 (Active Yard)' : 'Camera 1 (Milking Shed)'}</span>
        </button>
      </div>

      {/* 2. Main 12-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Video Player & Overlays */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-zinc-950 aspect-video border border-zinc-800 shadow-sm flex items-center justify-center">
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
            <div className="absolute top-3.5 left-3.5 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-white text-[11px] font-medium border border-white/10">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>LIVE · CAM 02</span>
            </div>

            {/* AI Model Badge */}
            <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md text-zinc-200 border border-white/10 px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vision Model Active</span>
            </div>

            {/* Bounding Box Overlay when heat is detected */}
            {heatDetected && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="border-2 border-rose-500 rounded-xl w-60 h-60 relative flex flex-col justify-between p-2 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                  <span className="bg-rose-600 text-white font-mono text-[10px] font-medium px-2 py-0.5 rounded self-start">
                    Mounting Detected (94%)
                  </span>
                  <span className="bg-black/80 text-white font-mono text-[10px] px-1.5 py-0.5 rounded self-end">
                    TAG #42
                  </span>
                </div>
              </div>
            )}

            {/* Play/Pause Center Overlay if paused */}
            {!isPlaying && (
              <button
                onClick={handlePlayToggle}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center hover:bg-white transition-all shadow-lg"
              >
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </button>
            )}
          </div>

          {/* Video Controls Bar */}
          <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2.5">
              <button
                onClick={handlePlayToggle}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 transition-colors shadow-xs"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause Feed' : 'Start Stream'}</span>
              </button>

              <button
                onClick={handleSwitchCamera}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Switch Camera</span>
              </button>
            </div>

            <span className="text-xs text-zinc-500 font-mono">
              Status: {isPlaying ? (heatDetected ? 'Heat Observed' : 'Monitoring') : 'Paused'}
            </span>
          </div>
        </div>

        {/* Right Column (4 Cols): AI Inference Telemetry Panel */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900">
                  Behavioral Analytics
                </h3>
                <p className="text-xs text-zinc-500">Real-time posture and estrus telemetry</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  heatDetected
                    ? 'bg-rose-50 text-rose-800 border border-rose-200/60'
                    : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                {heatDetected ? 'Heat Active' : 'Normal'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 space-y-0.5">
                <span className="text-[11px] text-zinc-400 font-medium">Mounting Probability</span>
                <p className="text-lg font-semibold text-zinc-900">
                  {heatDetected ? '94.2% (High Confidence)' : '3.1% (Baseline)'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 space-y-0.5">
                <span className="text-[11px] text-zinc-400 font-medium">Recommended Insemination Window</span>
                <p className="text-xs font-medium text-zinc-800">
                  {heatDetected ? 'Next 12 - 18 Hours (AM-PM Rule)' : 'No estrus signs detected'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 space-y-0.5">
                <span className="text-[11px] text-zinc-400 font-medium">Identified Animal</span>
                <p className="text-xs font-medium text-zinc-800">
                  Cow #42 (Laxmi - Sahiwal Cross)
                </p>
              </div>
            </div>

            {heatDetected && (
              <button
                onClick={handleLogEvent}
                disabled={eventLogged}
                className="w-full rounded-lg bg-rose-700 py-2.5 text-xs font-medium text-white hover:bg-rose-800 disabled:opacity-50 transition-colors shadow-xs"
              >
                {eventLogged ? '✓ Event Recorded in Herd Log' : 'Log Heat Event & Alert Vet'}
              </button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CctvMonitorScreen;

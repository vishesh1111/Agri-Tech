'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, Play, Pause, AlertTriangle, ArrowLeft, Camera, 
  RotateCcw, ShieldCheck, CheckCircle2, Info, Sparkles, Clock
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';

export const CctvMonitorScreen: React.FC = () => {
  const { navigateBack, addNotification } = useKisanStore();

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
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md px-4 py-4 border-b border-slate-700 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={navigateBack}
            className="p-1.5 rounded-full hover:bg-slate-700 text-slate-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold flex items-center gap-2">
              <Video className="w-4 h-4 text-rose-500" />
              CowCatcherAI Estrus Monitor
            </h1>
            <p className="text-[11px] text-slate-400">Computer vision barn telemetry & heat detection</p>
          </div>
        </div>

        <button
          onClick={handleSwitchCamera}
          className="bg-slate-700 hover:bg-slate-600 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{useMountingVideo ? 'Barn 1 Main' : 'Barn 2 Feedlot'}</span>
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Video Canvas Container */}
        <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-slate-700 aspect-video flex items-center justify-center shadow-2xl">
          <video
            ref={videoRef}
            src={useMountingVideo ? '/videos/cctv_mounting.mp4' : '/videos/cctv.mp4'}
            loop
            muted
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-cover"
          />

          {/* REC Badge */}
          {isPlaying && (
            <div className="absolute top-3 right-3 bg-red-600/90 text-white text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse shadow-md">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              LIVE AI REC
            </div>
          )}

          {/* Camera Info Overlay */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-slate-300 text-[11px] px-2.5 py-1 rounded-md font-mono">
            {useMountingVideo ? 'CAM-02 [BREEDING PEN]' : 'CAM-01 [MAIN CORRAL]'} • 1080p 30FPS
          </div>

          {/* AI Bounding Box Overlay */}
          {heatDetected && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in">
              <div className="w-64 h-44 border-4 border-rose-500 rounded-lg relative shadow-[0_0_25px_rgba(244,63,94,0.6)]">
                <span className="absolute -top-7 left-0 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-t-md flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Mounting / Estrus (92%)
                </span>
                <span className="absolute bottom-1 right-2 text-[10px] font-mono text-rose-300 bg-black/60 px-1 rounded">
                  Cow #42 • High Mobility
                </span>
              </div>
            </div>
          )}

          {/* Big Play Button Overlay when paused */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
              <button
                onClick={handlePlayToggle}
                className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
              <p className="text-xs text-slate-300">Click to start live camera video feed</p>
            </div>
          )}
        </div>

        {/* Video Controls Bar */}
        <div className="flex items-center justify-between bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayToggle}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <span className="font-semibold">{isPlaying ? 'Streaming Feed...' : 'Stream Paused'}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <span>Model: CowCatcher-YOLOv9</span>
            <span>•</span>
            <span className="text-emerald-400">FPS: 29.8</span>
          </div>
        </div>

        {/* Alert Notification Card */}
        {heatDetected && (
          <div className="bg-rose-950/70 border-2 border-rose-500 rounded-2xl p-4 space-y-3 shadow-lg animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-rose-200">
                    URGENT: Standing Estrus Heat Detected!
                  </h3>
                  <p className="text-xs text-rose-300">
                    Cow #42 observed exhibiting mounting behavior at Barn 2.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-3 text-xs space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Optimal Insemination Window:</span>
                <strong className="text-emerald-400">Next 12 - 18 Hours</strong>
              </div>
              <div className="flex justify-between">
                <span>AI Confidence Score:</span>
                <strong className="text-rose-400">92% (High Confidence)</strong>
              </div>
              <div className="flex justify-between">
                <span>Action Recommended:</span>
                <span className="text-slate-200">Notify Livestock AI Technician</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                disabled={eventLogged}
                onClick={handleLogEvent}
                className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {eventLogged ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    Event Logged to Farm Ledger
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Log Event & Dispatch Vet Alert
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-400 space-y-1">
          <span className="font-bold text-slate-300 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            About CowCatcher Estrus Vision
          </span>
          <p className="leading-relaxed">
            Continuously monitors barn surveillance cameras to spot tail-mounting, chin-resting, and restless pacing. 
            Detecting silent heat early saves up to ₹4,500 per missed cycle per cow.
          </p>
        </div>
      </div>
    </div>
  );
};
export default CctvMonitorScreen;

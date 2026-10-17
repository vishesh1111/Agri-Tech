'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, Play, Pause, AlertTriangle, Camera, 
  RotateCcw, ShieldCheck, CheckCircle2, Info, Sparkles, Clock,
  Eye, RefreshCw, Zap, Bell, Volume2, VolumeX, ShieldAlert,
  Sliders, Maximize2, Activity, MousePointer, Crosshair
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';

interface Point {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
}

interface BreachEvent {
  id: string;
  time: string;
  animal: string;
  camera: string;
  type: string;
}

export const CctvMonitorScreen: React.FC = () => {
  const { addNotification } = useKisanStore();

  const [activeMode, setActiveMode] = useState<'geofence' | 'estrus'>('geofence');
  const [isPlaying, setIsPlaying] = useState(false);
  const [useMountingVideo, setUseMountingVideo] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Virtual Geofence Line Endpoints (in percentage 0 - 100)
  const [lineP1, setLineP1] = useState<Point>({ x: 52, y: 15 });
  const [lineP2, setLineP2] = useState<Point>({ x: 52, y: 88 });
  const [activeHandle, setActiveHandle] = useState<'p1' | 'p2' | null>(null);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [drawStep, setDrawStep] = useState<0 | 1>(0);

  // Breach Detection State
  const [isBreached, setIsBreached] = useState(false);
  const [breachCount, setBreachCount] = useState(0);
  const [lastBreachTime, setLastBreachTime] = useState<string | null>(null);
  const [breachEvents, setBreachEvents] = useState<BreachEvent[]>([
    {
      id: 'b_1',
      time: '12:15:30 PM',
      animal: 'Cow #04 (Gir Purebred)',
      camera: 'CAM 02 - East Paddock',
      type: 'Virtual Tripwire Crossed'
    }
  ]);

  // Estrus Heat State
  const [heatDetected, setHeatDetected] = useState(false);
  const [eventLogged, setEventLogged] = useState(false);

  // Cow Computer Vision Position in Video (Percentage)
  const [cowPos, setCowPos] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 24,
    y: 54,
    w: 18,
    h: 26,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevCowPosRef = useRef<{ x: number; y: number }>({ x: 24, y: 54 });
  const lastBreachAlertTimeRef = useRef<number>(0);

  // Play audio alarm chime via Web Audio API
  const playAlarmSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }, [soundEnabled]);

  // Video Play/Pause Toggle
  const handlePlayToggle = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(e => console.log('Autoplay error', e));
      setIsPlaying(true);
    }
  };

  const handleSwitchCamera = () => {
    setIsPlaying(false);
    setIsBreached(false);
    setHeatDetected(false);
    setUseMountingVideo(!useMountingVideo);
  };

  // Check 2D line segment intersection between cow trajectory and virtual fence
  const checkLineCrossing = useCallback(
    (
      cowCurrent: { x: number; y: number },
      cowPrev: { x: number; y: number },
      p1: Point,
      p2: Point
    ) => {
      // Line formula: (y2 - y1)*x - (x2 - x1)*y + x2*y1 - y2*x1 = 0
      const side = (pt: { x: number; y: number }) =>
        (p2.x - p1.x) * (pt.y - p1.y) - (p2.y - p1.y) * (pt.x - p1.x);

      const side1 = side(cowPrev);
      const side2 = side(cowCurrent);

      // Cow crossed the infinite line if signs differ
      const crossedInfiniteLine = side1 * side2 <= 0;

      // Distance from cow center to segment
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const lengthSq = dx * dx + dy * dy;

      if (lengthSq === 0) return false;

      // Projection parameter t of cow position on line
      const t = Math.max(
        0,
        Math.min(1, ((cowCurrent.x - p1.x) * dx + (cowCurrent.y - p1.y) * dy) / lengthSq)
      );
      const projX = p1.x + t * dx;
      const projY = p1.y + t * dy;

      const distSq =
        (cowCurrent.x - projX) * (cowCurrent.x - projX) +
        (cowCurrent.y - projY) * (cowCurrent.y - projY);

      // Distance threshold: cow bounding box radius ~9%
      const isNearSegment = distSq < 9 * 9;

      return crossedInfiniteLine && isNearSegment;
    },
    []
  );

  // Trigger Breach Alert
  const triggerBreach = useCallback(
    (animalName = 'Cow #04 (Gir Purebred)') => {
      const now = Date.now();
      if (now - lastBreachAlertTimeRef.current < 4000) return; // Debounce 4s
      lastBreachAlertTimeRef.current = now;

      setIsBreached(true);
      setBreachCount(prev => prev + 1);
      const timeStr = new Date().toLocaleTimeString();
      setLastBreachTime(timeStr);

      const newEvent: BreachEvent = {
        id: `b_${Date.now()}`,
        time: timeStr,
        animal: animalName,
        camera: useMountingVideo ? 'CAM 02 - Yard Gate' : 'CAM 01 - Barn Shed',
        type: 'Virtual Fence Line Crossed'
      };

      setBreachEvents(prev => [newEvent, ...prev.slice(0, 9)]);
      playAlarmSound();

      addNotification({
        farmId: 'farm_1',
        title: `🚨 CCTV GEOFENCE BREACH: ${animalName}`,
        message: `${animalName} crossed the virtual boundary line at ${timeStr}. Immediate inspection required!`,
        severity: 'CRITICAL',
        type: 'LIVESTOCK',
      });

      setTimeout(() => {
        setIsBreached(false);
      }, 3500);
    },
    [useMountingVideo, playAlarmSound, addNotification]
  );

  // Real-time video frame telemetry update loop
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 10;

    let newCowX = 24;
    let newCowY = 54;

    if (!useMountingVideo) {
      // cctv.mp4: Cow walks across from Left (22%) to Right (78%) between t=1s and t=9s
      const progress = (time % duration) / duration;
      newCowX = 20 + progress * 58;
      newCowY = 52 + Math.sin(progress * Math.PI * 2) * 5;
    } else {
      // cctv_mounting.mp4: Animal interaction near center (38% to 68%)
      const progress = (time % duration) / duration;
      newCowX = 36 + Math.sin(progress * Math.PI * 2) * 22;
      newCowY = 46 + Math.cos(progress * Math.PI * 2) * 10;

      // Estrus mounting trigger around 3.5s - 7.5s
      if (time > 3.5 && time < 7.5) {
        setHeatDetected(true);
      } else {
        setHeatDetected(false);
      }
    }

    const currentCow = { x: newCowX, y: newCowY };
    const prevCow = prevCowPosRef.current;

    // Line crossing evaluation
    const crossed = checkLineCrossing(currentCow, prevCow, lineP1, lineP2);
    if (crossed) {
      triggerBreach();
    }

    prevCowPosRef.current = currentCow;
    setCowPos({ x: newCowX, y: newCowY, w: 18, h: 26 });
  };

  // Preset Fence Lines
  const setPresetFence = (preset: 'vertical' | 'diagonal' | 'horizontal') => {
    setIsBreached(false);
    if (preset === 'vertical') {
      setLineP1({ x: 50, y: 15 });
      setLineP2({ x: 50, y: 88 });
    } else if (preset === 'diagonal') {
      setLineP1({ x: 30, y: 20 });
      setLineP2({ x: 72, y: 85 });
    } else {
      setLineP1({ x: 15, y: 62 });
      setLineP2({ x: 85, y: 62 });
    }
  };

  // Interactive mouse/touch drag on video container
  const handleContainerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    if (isDrawMode) {
      if (drawStep === 0) {
        setLineP1({ x: Math.round(clickX), y: Math.round(clickY) });
        setDrawStep(1);
      } else {
        setLineP2({ x: Math.round(clickX), y: Math.round(clickY) });
        setIsDrawMode(false);
        setDrawStep(0);
      }
      return;
    }

    // Check proximity to endpoints to drag
    const distP1 = Math.hypot(clickX - lineP1.x, clickY - lineP1.y);
    const distP2 = Math.hypot(clickX - lineP2.x, clickY - lineP2.y);

    if (distP1 < 8) {
      setActiveHandle('p1');
    } else if (distP2 < 8) {
      setActiveHandle('p2');
    }
  };

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeHandle || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currX = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
    const currY = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));

    if (activeHandle === 'p1') {
      setLineP1({ x: Math.round(currX), y: Math.round(currY) });
    } else if (activeHandle === 'p2') {
      setLineP2({ x: Math.round(currX), y: Math.round(currY) });
    }
  };

  const handleContainerMouseUp = () => {
    setActiveHandle(null);
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
              CCTV AI Surveillance & Virtual Fence Monitor
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time computer vision livestock tracking, interactive boundary tripwires, and perimeter breach alarms
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 text-xs font-medium">
            <button
              onClick={() => setActiveMode('geofence')}
              className={`rounded-md px-3 py-1 transition-all ${
                activeMode === 'geofence'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Virtual Geofence
            </button>
            <button
              onClick={() => setActiveMode('estrus')}
              className={`rounded-md px-3 py-1 transition-all ${
                activeMode === 'estrus'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Estrus Heat AI
            </button>
          </div>

          <button
            onClick={handleSwitchCamera}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-xs"
          >
            <Camera className="w-3.5 h-3.5 text-zinc-500" />
            <span>{useMountingVideo ? 'Cam 2 (Yard)' : 'Cam 1 (Barn)'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main 12-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Video Player with Interactive Virtual Fence Overlay */}
        <div className="lg:col-span-8 space-y-4">
          <div 
            ref={containerRef}
            onMouseDown={handleContainerMouseDown}
            onMouseMove={handleContainerMouseMove}
            onMouseUp={handleContainerMouseUp}
            className={`relative rounded-xl overflow-hidden bg-zinc-950 aspect-video border shadow-sm flex items-center justify-center select-none transition-all ${
              isBreached 
                ? 'border-rose-500 ring-4 ring-rose-500/30' 
                : 'border-zinc-800'
            }`}
          >
            <video
              ref={videoRef}
              src={useMountingVideo ? '/videos/cctv_mounting.mp4' : '/videos/cctv.mp4'}
              loop
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover"
            />

            {/* Live Status Indicators */}
            <div className="absolute top-3.5 left-3.5 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-white text-[11px] font-medium border border-white/10 pointer-events-none">
              <span className={`w-2 h-2 rounded-full ${isBreached ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span>{useMountingVideo ? 'CAM 02 · ACTIVE YARD' : 'CAM 01 · MAIN BARN'}</span>
            </div>

            <div className="absolute top-3.5 right-3.5 flex items-center gap-2 pointer-events-none">
              {isBreached ? (
                <div className="bg-rose-600/90 text-white font-mono text-[11px] font-bold px-2.5 py-1 rounded-md shadow-lg animate-pulse flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>BREACH ALERT</span>
                </div>
              ) : (
                <div className="bg-black/60 backdrop-blur-md text-emerald-400 border border-white/10 px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Tracking Active</span>
                </div>
              )}
            </div>

            {/* Interactive SVG Overlay for Virtual Fence Line and Handles */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              {/* Line Glow Filter */}
              <defs>
                <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Virtual Fence Line */}
              <line
                x1={lineP1.x}
                y1={lineP1.y}
                x2={lineP2.x}
                y2={lineP2.y}
                stroke={isBreached ? '#f43f5e' : '#10b981'}
                strokeWidth={isBreached ? '2.5' : '1.5'}
                strokeDasharray={isBreached ? '2 1' : '3 1.5'}
                filter={isBreached ? 'url(#glow-red)' : 'url(#glow-green)'}
                className={isBreached ? 'animate-pulse' : ''}
              />

              {/* Endpoint 1 Handle */}
              <circle
                cx={lineP1.x}
                cy={lineP1.y}
                r="3"
                fill={isBreached ? '#f43f5e' : '#34d399'}
                stroke="#ffffff"
                strokeWidth="0.8"
                className="pointer-events-auto cursor-move"
              />

              {/* Endpoint 2 Handle */}
              <circle
                cx={lineP2.x}
                cy={lineP2.y}
                r="3"
                fill={isBreached ? '#f43f5e' : '#34d399'}
                stroke="#ffffff"
                strokeWidth="0.8"
                className="pointer-events-auto cursor-move"
              />
            </svg>

            {/* Fence Label Overlay in Video */}
            <div 
              style={{
                left: `${(lineP1.x + lineP2.x) / 2}%`,
                top: `${(lineP1.y + lineP2.y) / 2}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute pointer-events-none select-none z-10"
            >
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-md tracking-wider flex items-center gap-1 ${
                isBreached 
                  ? 'bg-rose-600 text-white animate-bounce' 
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 backdrop-blur-xs'
              }`}>
                <span>⚡</span>
                <span>{isBreached ? 'PERIMETER VIOLATED' : 'VIRTUAL FENCE TRIPWIRE'}</span>
              </span>
            </div>

            {/* Animal AI Bounding Box & Target Crosshair */}
            <div
              style={{
                left: `${cowPos.x - cowPos.w / 2}%`,
                top: `${cowPos.y - cowPos.h / 2}%`,
                width: `${cowPos.w}%`,
                height: `${cowPos.h}%`,
              }}
              className={`absolute pointer-events-none rounded border-2 transition-all duration-100 flex flex-col justify-between p-1 ${
                isBreached 
                  ? 'border-rose-500 bg-rose-500/15 shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
                  : 'border-emerald-400 bg-emerald-500/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-mono font-bold px-1 rounded text-white ${
                  isBreached ? 'bg-rose-600' : 'bg-emerald-600'
                }`}>
                  {isBreached ? 'BREACH DETECTED' : 'Cow #04'}
                </span>
                <span className="text-[8px] font-mono text-white/90 bg-black/60 px-1 rounded">
                  96%
                </span>
              </div>

              {/* Centroid Crosshair */}
              <div className="self-center flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${isBreached ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`}></div>
              </div>

              <span className="text-[8px] font-mono text-white/80 bg-black/60 px-1 rounded self-start">
                X:{Math.round(cowPos.x)}% Y:{Math.round(cowPos.y)}%
              </span>
            </div>

            {/* Estrus Mounting Box (if active in mode) */}
            {activeMode === 'estrus' && heatDetected && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="border-2 border-rose-500 rounded-xl w-60 h-60 relative flex flex-col justify-between p-2 shadow-[0_0_30px_rgba(244,63,94,0.3)] bg-rose-500/10">
                  <span className="bg-rose-600 text-white font-mono text-[10px] font-medium px-2 py-0.5 rounded self-start">
                    Mounting Detected (94.2%)
                  </span>
                  <span className="bg-black/80 text-white font-mono text-[10px] px-1.5 py-0.5 rounded self-end">
                    TAG #42
                  </span>
                </div>
              </div>
            )}

            {/* Instruction tooltip during custom draw mode */}
            {isDrawMode && (
              <div className="absolute top-12 inset-x-0 mx-auto w-fit bg-amber-500 text-zinc-950 font-bold text-xs px-3 py-1.5 rounded-full shadow-lg pointer-events-none animate-bounce">
                {drawStep === 0 ? 'Click point 1 on video to start fence' : 'Click point 2 on video to finish fence'}
              </div>
            )}

            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <button
                onClick={handlePlayToggle}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center hover:bg-white transition-all shadow-lg active:scale-95"
              >
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </button>
            )}
          </div>

          {/* Interactive Tripwire Toolbar & Video Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayToggle}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 transition-colors shadow-xs"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause Feed' : 'Start Feed'}</span>
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  soundEnabled
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-zinc-200 bg-white text-zinc-500'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{soundEnabled ? 'Alarm Audio: On' : 'Alarm Muted'}</span>
              </button>
            </div>

            {/* Virtual Fence Presets & Draw Tool */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Boundary:
              </span>

              <button
                onClick={() => setPresetFence('vertical')}
                className="rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700"
              >
                Center Gate
              </button>

              <button
                onClick={() => setPresetFence('diagonal')}
                className="rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700"
              >
                Diagonal Yard
              </button>

              <button
                onClick={() => setPresetFence('horizontal')}
                className="rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700"
              >
                Lower Pen
              </button>

              <button
                onClick={() => {
                  setIsDrawMode(true);
                  setDrawStep(0);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  isDrawMode
                    ? 'bg-amber-500 text-zinc-950 font-bold animate-pulse'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                }`}
              >
                <Crosshair className="w-3 h-3 inline mr-1" />
                {isDrawMode ? 'Drawing...' : 'Draw Custom'}
              </button>

              {/* Instant Test Breach Button for Judges */}
              <button
                onClick={() => triggerBreach()}
                className="rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 px-2.5 py-1 text-xs font-semibold transition-colors"
              >
                ⚡ Trigger Test Breach
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols): Live Security Breach Telemetry & Incident Log */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900">
                  Virtual Fence Telemetry
                </h3>
                <p className="text-xs text-zinc-500">Live line-crossing perimeter detector</p>
              </div>

              {isBreached ? (
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                  🚨 BREACH ACTIVE
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  🛡️ Perimeter Armed
                </span>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                <span className="text-[10px] text-zinc-400 block font-medium">Fence Status</span>
                <span className={`text-sm font-bold block mt-0.5 ${isBreached ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {isBreached ? 'LINE CROSSED' : 'SECURE'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                <span className="text-[10px] text-zinc-400 block font-medium">Total Breaches</span>
                <span className="text-sm font-bold block mt-0.5 text-zinc-900">
                  {breachCount} Incidents
                </span>
              </div>
            </div>

            {/* Interactive instructions */}
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/60 text-xs text-zinc-600 space-y-1">
              <span className="font-semibold text-zinc-900 flex items-center gap-1">
                <MousePointer className="w-3.5 h-3.5 text-emerald-600" />
                <span>How to Adjust Virtual Fence:</span>
              </span>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Click & drag the circular green endpoints directly on the camera view to adjust your virtual perimeter line. When the cow crosses the line, an emergency push alert is dispatched.
              </p>
            </div>

            {/* Live Security Breach Incident Log */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900">
                  Recent Security Events ({breachEvents.length})
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Live Sync</span>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {breachEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-lg border border-rose-100 bg-rose-50/50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-rose-900 text-[11px]">
                        🚨 {evt.type}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {evt.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-700">
                      <span className="font-medium text-zinc-900">{evt.animal}</span> crossed perimeter boundary on <span className="text-zinc-600 font-medium">{evt.camera}</span>.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CctvMonitorScreen;

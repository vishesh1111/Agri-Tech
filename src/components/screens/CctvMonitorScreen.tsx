'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, Check, Play, AlertTriangle, 
  Volume2, VolumeX, RotateCcw, Video,
  Maximize2, Minimize2
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';

interface Point {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
}

interface FenceLine {
  start: Point;
  end: Point;
}

interface CowDetection {
  id: string;
  name: string;
  tagId: string;
  x: number; // percentage 0 - 100 (left)
  y: number; // percentage 0 - 100 (top)
  w: number; // percentage width
  h: number; // percentage height
  isBreached: boolean;
}

interface BreachDetails {
  cowInfo: string;
  camName: string;
}

// Distance from point p to line segment a-b in percentage coordinates
function pointLineDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const normalLength = Math.hypot(bx - ax, by - ay);
  if (normalLength === 0) return Math.hypot(px - ax, py - ay);

  const dotProduct = (px - ax) * (bx - ax) + (py - ay) * (by - ay);
  if (dotProduct < 0) return Math.hypot(px - ax, py - ay);
  if (dotProduct > normalLength * normalLength) return Math.hypot(px - bx, py - by);

  return Math.abs((px - ax) * (by - ay) - (py - ay) * (bx - ax)) / normalLength;
}

// Helper for piecewise linear timeline interpolation
function interpolateTimeline(time: number, points: [number, number, number, number, number][]): { x: number; y: number; w: number; h: number } {
  if (time <= points[0][0]) {
    const [, x, y, w, h] = points[0];
    return { x, y, w, h };
  }
  if (time >= points[points.length - 1][0]) {
    const [, x, y, w, h] = points[points.length - 1];
    return { x, y, w, h };
  }
  for (let i = 0; i < points.length - 1; i++) {
    const [t0, x0, y0, w0, h0] = points[i];
    const [t1, x1, y1, w1, h1] = points[i + 1];
    if (time >= t0 && time <= t1) {
      const ratio = (time - t0) / (t1 - t0);
      return {
        x: x0 + ratio * (x1 - x0),
        y: y0 + ratio * (y1 - y0),
        w: w0 + ratio * (w1 - w0),
        h: h0 + ratio * (h1 - h0),
      };
    }
  }
  const [, x, y, w, h] = points[0];
  return { x, y, w, h };
}

// Check if a cow is physically crossing or straddling the virtual fence line
function checkCowCrossing(
  cow: { x: number; y: number; w: number; h: number },
  fence: FenceLine | null
): boolean {
  if (!fence) return false;

  const left = cow.x;
  const right = cow.x + cow.w;
  const top = cow.y;
  const bottom = cow.y + cow.h;

  const minFenceY = Math.min(fence.start.y, fence.end.y);
  const maxFenceY = Math.max(fence.start.y, fence.end.y);

  // Must overlap in the vertical range of the fence
  if (bottom < minFenceY - 5 || top > maxFenceY + 5) {
    return false;
  }

  const dx = Math.abs(fence.end.x - fence.start.x);
  const dy = Math.abs(fence.end.y - fence.start.y);

  if (dy > dx * 1.4) {
    // ── Vertical Fence (Cam 1 & Cam 3) ──
    // Get fence X coordinate at cow's vertical position
    const cowMidY = (top + bottom) / 2;
    const t = Math.max(0, Math.min(1, (cowMidY - fence.start.y) / (fence.end.y - fence.start.y || 1)));
    const fenceX = fence.start.x + t * (fence.end.x - fence.start.x);

    // Precise breach window:
    // Starts when leading front hooves/head reach the fence (right >= fenceX - 1.0)
    // Ends when trailing rear hooves/tail fully clear the fence (left <= fenceX + 1.0)
    // ZERO early triggers (while approaching) and ZERO late triggers (after fully crossing)
    const isCrossing = right >= (fenceX - 1.0) && left <= (fenceX + 1.0);
    return isCrossing;
  } else {
    // ── Diagonal / Angled Fence (Cam 2) ──
    const side = (px: number, py: number) =>
      (fence.end.y - fence.start.y) * px - (fence.end.x - fence.start.x) * py +
      (fence.end.x * fence.start.y - fence.end.y * fence.start.x);

    const s1 = side(left, top);
    const s2 = side(right, bottom);
    const s3 = side(left, bottom);
    const s4 = side(right, top);

    const minSide = Math.min(s1, s2, s3, s4);
    const maxSide = Math.max(s1, s2, s3, s4);

    // Line cuts directly through the cow bounding box
    if (minSide <= 0 && maxSide >= 0) {
      return true;
    }

    const feetX = (left + right) / 2;
    const feetY = bottom;
    const dist = pointLineDistance(feetX, feetY, fence.start.x, fence.start.y, fence.end.x, fence.end.y);
    return dist <= 3.5;
  }
}

export const CctvMonitorScreen: React.FC = () => {
  const { navigateBack, navigateToSubScreen, addNotification } = useKisanStore();

  // Active Camera Selection (1, 2, or 3)
  const [selectedVideoId, setSelectedVideoId] = useState<1 | 2 | 3>(1);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Independent Fences for each camera (matching exact screenshots)
  const [fences, setFences] = useState<Record<1 | 2 | 3, FenceLine | null>>({
    1: { start: { x: 55, y: 12 }, end: { x: 55, y: 88 } },
    2: { start: { x: 71, y: 25 }, end: { x: 38, y: 86 } },
    3: { start: { x: 35, y: 14 }, end: { x: 33, y: 88 } },
  });

  // Tap-to-draw state
  const [currentFenceStart, setCurrentFenceStart] = useState<Point | null>(null);
  const [activeHandle, setActiveHandle] = useState<'start' | 'end' | null>(null);

  // Breach Popup
  const [breachPopup, setBreachPopup] = useState<BreachDetails | null>(null);

  // Timestamp
  const [videoTimestamp, setVideoTimestamp] = useState<string>('00:04:15');

  // Video and Container Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastBreachSoundTimeRef = useRef<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Cow Detections State
  const [cows, setCows] = useState<CowDetection[]>([]);

  const currentFence = fences[selectedVideoId];
  const hasFence = currentFence !== null;

  // Video clips matching the actual repo assets
  const videoSrcMap: Record<1 | 2 | 3, string> = {
    1: '/videos/clip_01.mp4',
    2: '/videos/clip_02.mp4',
    3: '/videos/clip_03.mp4',
  };

  // Switch camera tab
  const handleSelectCam = (camId: 1 | 2 | 3) => {
    setSelectedVideoId(camId);
    setCurrentFenceStart(null);
    setBreachPopup(null);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isMonitoring && fences[camId] !== null) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Play audio alarm chime
  const playAlarmSound = useCallback(() => {
    if (!soundEnabled) return;
    const now = Date.now();
    if (now - lastBreachSoundTimeRef.current < 2500) return;
    lastBreachSoundTimeRef.current = now;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1244.5, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {}
  }, [soundEnabled]);

  // Compute cow bounding boxes and evaluate breach detection
  const updateCowPositions = useCallback((time: number, duration: number) => {
    const rawTime = (time % (duration || 10));
    const fence = fences[selectedVideoId];

    let updatedCows: CowDetection[] = [];

    if (selectedVideoId === 1) {
      // ─────────────────────────────────────────────────────────────
      // Cam 1 (clip_01.mp4): Two cows walking across pasture
      // ─────────────────────────────────────────────────────────────
      const lunaBox = interpolateTimeline(rawTime, [
        [0.0, 0.0, 30.0, 17.2, 21.8],
        [1.0, 1.7, 30.0, 23.9, 17.5],
        [2.0, 8.9, 30.3, 24.1, 22.8],
        [3.0, 18.0, 30.7, 25.2, 23.5],
        [4.0, 28.4, 31.4, 24.2, 23.2],
        [4.5, 32.3, 31.7, 26.4, 21.1],
        [5.0, 36.3, 32.5, 27.0, 20.3],
        [5.5, 43.1, 32.5, 24.7, 24.4],
        [6.0, 48.1, 32.5, 24.6, 24.6],
        [6.5, 51.9, 32.8, 25.4, 24.7],
        [7.0, 56.4, 32.8, 25.9, 24.7],
        [8.0, 66.4, 32.9, 25.7, 23.9],
        [9.0, 77.5, 33.2, 22.5, 23.8],
        [10.0, 84.0, 33.3, 18.4, 23.6],
      ]);

      const daisyBox = interpolateTimeline(rawTime, [
        [0.0, -35.0, 30.5, 23.0, 22.0],
        [2.0, -20.0, 30.5, 23.0, 22.0],
        [3.0, -5.0, 30.5, 23.0, 22.0],
        [4.0, 0.0, 30.3, 18.9, 20.5],
        [4.5, 0.0, 30.8, 23.1, 22.2],
        [5.0, 3.6, 31.4, 23.9, 21.9],
        [6.0, 11.7, 31.4, 24.4, 23.3],
        [7.0, 21.7, 31.9, 24.0, 18.3],
        [8.0, 31.1, 32.8, 24.3, 20.5],
        [9.0, 40.8, 33.3, 24.1, 22.9],
        [10.0, 46.0, 33.3, 24.1, 21.5],
      ]);

      const lunaCrossing = checkCowCrossing(lunaBox, fence);
      const daisyCrossing = checkCowCrossing(daisyBox, fence);

      if (daisyBox.x + daisyBox.w > 0) {
        updatedCows.push({
          id: 'cow_daisy',
          name: 'Bessie',
          tagId: 'TAG-102',
          x: Math.max(0, daisyBox.x),
          y: daisyBox.y,
          w: daisyBox.w,
          h: daisyBox.h,
          isBreached: daisyCrossing,
        });
      }

      updatedCows.push({
        id: 'cow_luna',
        name: 'Luna',
        tagId: 'TAG-771',
        x: Math.max(0, lunaBox.x),
        y: lunaBox.y,
        w: lunaBox.w,
        h: lunaBox.h,
        isBreached: lunaCrossing,
      });

    } else if (selectedVideoId === 2) {
      // ─────────────────────────────────────────────────────────────
      // Cam 2 (clip_02.mp4): Yard / Corral cows
      // ─────────────────────────────────────────────────────────────
      const bellaBox = interpolateTimeline(rawTime, [
        [0.0, 36.0, 22.0, 19.0, 28.0],
        [2.0, 40.0, 26.0, 21.0, 30.0],
        [3.5, 43.0, 30.0, 23.0, 33.0],
        [4.5, 47.0, 34.0, 25.0, 36.0],
        [5.5, 52.0, 40.0, 27.0, 40.0],
        [7.0, 60.0, 48.0, 30.0, 45.0],
        [8.5, 68.0, 56.0, 31.0, 46.0],
        [10.0, 75.0, 62.0, 32.0, 48.0],
      ]);

      const progress = rawTime / (duration || 10);
      const penX = 22 + Math.sin(progress * Math.PI) * 4;
      const penY = 18 + Math.cos(progress * Math.PI) * 2;
      const penBox = { x: penX, y: penY, w: 14, h: 22 };

      const bellaCrossing = checkCowCrossing(bellaBox, fence);
      const penCrossing = checkCowCrossing(penBox, fence);

      updatedCows = [
        {
          id: 'cow_pen',
          name: 'Pen Cow',
          tagId: 'TAG-104',
          x: penBox.x,
          y: penBox.y,
          w: penBox.w,
          h: penBox.h,
          isBreached: penCrossing,
        },
        {
          id: 'cow_bella',
          name: 'Bella',
          tagId: 'TAG-492',
          x: bellaBox.x,
          y: bellaBox.y,
          w: bellaBox.w,
          h: bellaBox.h,
          isBreached: bellaCrossing,
        },
      ];

    } else {
      // ─────────────────────────────────────────────────────────────
      // Cam 3 (clip_03.mp4): Pasture with brown cow
      // ─────────────────────────────────────────────────────────────
      const daisy3Box = interpolateTimeline(rawTime, [
        [0.0, 0.0, 32.0, 24.0, 25.0],
        [2.0, 10.0, 32.0, 24.0, 25.0],
        [3.5, 18.0, 32.5, 24.0, 25.0],
        [4.5, 25.0, 33.0, 24.0, 25.0],
        [5.5, 34.0, 33.0, 24.0, 25.0],
        [7.0, 46.0, 33.5, 24.0, 25.0],
        [8.5, 58.0, 34.0, 24.0, 25.0],
        [10.0, 70.0, 34.0, 24.0, 25.0],
      ]);

      const daisy3Crossing = checkCowCrossing(daisy3Box, fence);

      updatedCows = [
        {
          id: 'cow_daisy3',
          name: 'Daisy',
          tagId: 'TAG-833',
          x: Math.max(0, daisy3Box.x),
          y: daisy3Box.y,
          w: daisy3Box.w,
          h: daisy3Box.h,
          isBreached: daisy3Crossing,
        },
      ];
    }

    setCows(updatedCows);

    // Trigger Breach Alerts
    const breachCow = updatedCows.find(c => c.isBreached);
    if (isMonitoring && breachCow) {
      const camLabel = `Cam ${selectedVideoId}`;
      const cowInfo = `${breachCow.name} (ID: ${breachCow.tagId})`;

      if (!breachPopup || breachPopup.cowInfo !== cowInfo) {
        setBreachPopup({ cowInfo, camName: camLabel });
        playAlarmSound();

        addNotification({
          farmId: 'farm_1',
          title: `🚨 CCTV GEOFENCE BREACH: ${breachCow.name}`,
          message: `${cowInfo} crossed the virtual fence line on ${camLabel}. Immediate inspection required!`,
          severity: 'CRITICAL',
          type: 'LIVESTOCK',
        });
      }
    } else if (isMonitoring && !breachCow) {
      setBreachPopup(null);
    }
  }, [fences, selectedVideoId, isMonitoring, breachPopup, playAlarmSound, addNotification]);

  // Video Time Update Loop
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 10;

    // Update Timestamp Monospace Overlay
    const mins = Math.floor(time / 60).toString().padStart(2, '0');
    const secs = Math.floor(time % 60).toString().padStart(2, '0');
    const frames = Math.floor((time * 24) % 24).toString().padStart(2, '0');
    setVideoTimestamp(`00:${secs}:${frames}`);

    updateCowPositions(time, duration);
  };

  // Toggle monitoring Start / Stop
  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      setIsMonitoring(false);
      setBreachPopup(null);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    } else {
      if (fences[selectedVideoId] !== null) {
        setIsMonitoring(true);
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }
    }
  };

  // Clear fence for current camera
  const handleClearFence = () => {
    setFences(prev => ({ ...prev, [selectedVideoId]: null }));
    setCurrentFenceStart(null);
    setBreachPopup(null);
  };

  // Restore default demo fence
  const handleRestoreDefaultFence = () => {
    const defaultFences: Record<1 | 2 | 3, FenceLine> = {
      1: { start: { x: 55, y: 12 }, end: { x: 55, y: 88 } },
      2: { start: { x: 71, y: 25 }, end: { x: 38, y: 86 } },
      3: { start: { x: 35, y: 14 }, end: { x: 33, y: 88 } },
    };
    setFences(prev => ({ ...prev, [selectedVideoId]: defaultFences[selectedVideoId] }));
    setCurrentFenceStart(null);
  };

  // Coordinates helper with smooth sub-pixel precision (0.1% increments)
  const getContainerCoords = useCallback((clientX: number, clientY: number): Point | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;
    const x = Math.max(2, Math.min(98, Math.round(rawX * 10) / 10));
    const y = Math.max(2, Math.min(98, Math.round(rawY * 10) / 10));
    return { x, y };
  }, []);

  // Smooth window-level pointer tracking for anchor handle drag (eliminates stutter and shaking)
  useEffect(() => {
    if (!activeHandle) return;

    const onPointerMove = (e: PointerEvent) => {
      const coords = getContainerCoords(e.clientX, e.clientY);
      if (!coords) return;

      setFences(prev => {
        const fence = prev[selectedVideoId];
        if (!fence) return prev;
        return {
          ...prev,
          [selectedVideoId]: {
            ...fence,
            [activeHandle]: coords,
          }
        };
      });
    };

    const onPointerUp = () => {
      setActiveHandle(null);
      if (videoRef.current) {
        updateCowPositions(videoRef.current.currentTime || 4.15, videoRef.current.duration || 10);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [activeHandle, selectedVideoId, getContainerCoords, updateCowPositions]);

  // Tap-to-draw handler on canvas background
  const handleContainerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (fences[selectedVideoId] === null) {
      const coords = getContainerCoords(e.clientX, e.clientY);
      if (!coords) return;

      if (currentFenceStart === null) {
        setCurrentFenceStart(coords);
      } else {
        setFences(prev => ({
          ...prev,
          [selectedVideoId]: { start: currentFenceStart, end: coords }
        }));
        setCurrentFenceStart(null);
      }
      return;
    }

    // Fallback: if user clicks near existing handle, start drag
    const coords = getContainerCoords(e.clientX, e.clientY);
    if (!coords) return;
    const fence = fences[selectedVideoId];
    if (fence) {
      const distStart = Math.hypot(coords.x - fence.start.x, coords.y - fence.start.y);
      const distEnd = Math.hypot(coords.x - fence.end.x, coords.y - fence.end.y);

      if (distStart < 8) {
        setActiveHandle('start');
      } else if (distEnd < 8) {
        setActiveHandle('end');
      }
    }
  };

  // Autoplay video on camera switch or monitor toggle (no dependency on fences to prevent render cascade)
  useEffect(() => {
    if (videoRef.current) {
      if (isMonitoring && fences[selectedVideoId] !== null) {
        videoRef.current.play().catch(() => {});
      }
      updateCowPositions(videoRef.current.currentTime || 4.15, videoRef.current.duration || 10);
    }
  }, [isMonitoring, selectedVideoId, updateCowPositions]);

  return (
    <div className="w-full space-y-3">
      {/* 1. Compact Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={navigateBack}
            className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                Virtual Fencing AI
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                breachPopup
                  ? 'bg-rose-100 text-rose-800 animate-pulse'
                  : isMonitoring
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-zinc-100 text-zinc-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  breachPopup ? 'bg-rose-600 animate-ping' : isMonitoring ? 'bg-emerald-600 animate-pulse' : 'bg-zinc-400'
                }`} />
                {breachPopup ? 'Breach Detected' : isMonitoring ? 'System Armed' : 'Standby'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Livestock boundary monitoring & automated breach alarms
            </p>
          </div>
        </div>

        {/* Camera Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {([
            { id: 1, label: 'Cam 1 · Pasture North' },
            { id: 2, label: 'Cam 2 · Gate Perimeter' },
            { id: 3, label: 'Cam 3 · Paddock Corridor' },
          ] as const).map((cam) => {
            const isSelected = selectedVideoId === cam.id;
            const camHasFence = fences[cam.id] !== null;

            return (
              <button
                key={cam.id}
                onClick={() => handleSelectCam(cam.id)}
                className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300'
                }`}
              >
                <Video className="w-3 h-3" />
                <span>{cam.label}</span>
                {camHasFence ? (
                  <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">
                    ✓
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main 2-Column Responsive Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-start">
        {/* Left Column (7 cols): Minimized CCTV Video Player */}
        <div className="md:col-span-7 xl:col-span-7 bg-white rounded-xl border border-zinc-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Top Video Toolbar */}
          <div className="px-3 py-1.5 bg-zinc-950 text-zinc-200 flex items-center justify-between text-xs border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[9px] tracking-wider">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                <span>LIVE FEED</span>
              </div>
              <span className="font-semibold text-zinc-100 text-[11px] truncate max-w-[180px] sm:max-w-none">
                Camera 0{selectedVideoId}: {selectedVideoId === 1 ? 'Pasture North' : selectedVideoId === 2 ? 'Perimeter Gate' : 'Paddock Fence'}
              </span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span className="text-zinc-400 text-[10px] hidden sm:inline">1080p · 30 FPS</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-300 font-medium text-[11px]">
                {videoTimestamp}
              </span>
              <button
                onClick={toggleFullscreen}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Video"}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Video Canvas Container - Minimized up-down and left-right */}
          <div 
            ref={containerRef}
            onPointerDown={handleContainerPointerDown}
            className={`relative w-full aspect-[16/9] max-h-[250px] sm:max-h-[280px] bg-black select-none touch-none cursor-crosshair overflow-hidden ${
              breachPopup && isMonitoring ? 'ring-4 ring-rose-500/50' : ''
            }`}
          >
            {/* Real Video Clip for Selected Camera */}
            <video
              ref={videoRef}
              src={videoSrcMap[selectedVideoId]}
              loop
              playsInline
              muted
              autoPlay
              onTimeUpdate={handleTimeUpdate}
              onClick={() => {
                if (videoRef.current) {
                  if (videoRef.current.paused) videoRef.current.play();
                  else videoRef.current.pause();
                }
              }}
              className="w-full h-full object-cover"
            />

            {/* Top-Left Status Badge inside video */}
            <div className="absolute top-2.5 left-2.5 pointer-events-none z-30">
              {!isMonitoring && !hasFence && (
                <div className="bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded-md border border-white/10 font-medium">
                  {currentFenceStart === null ? 'Tap point 1 to start fence line' : 'Tap point 2 to complete fence'}
                </div>
              )}

              {!isMonitoring && hasFence && (
                <div className="bg-emerald-700/90 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded-md font-medium shadow-xs">
                  ✅ Boundary Defined
                </div>
              )}

              {isMonitoring && (
                <div className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>AI ACTIVE</span>
                </div>
              )}
            </div>

            {/* In-Progress First Tap Dot */}
            {currentFenceStart && (
              <div
                style={{
                  left: `${currentFenceStart.x}%`,
                  top: `${currentFenceStart.y}%`,
                }}
                className="absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-600 border-2 border-white pointer-events-none z-20 animate-ping"
              />
            )}

            {/* Completed Virtual Fence Line */}
            {currentFence && (
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none z-20" 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
              >
                {/* Soft glow behind fence line */}
                <line
                  x1={currentFence.start.x}
                  y1={currentFence.start.y}
                  x2={currentFence.end.x}
                  y2={currentFence.end.y}
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeOpacity="0.35"
                  strokeLinecap="round"
                />

                {/* Main fence line */}
                <line
                  x1={currentFence.start.x}
                  y1={currentFence.start.y}
                  x2={currentFence.end.x}
                  y2={currentFence.end.y}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={isMonitoring ? 'none' : '4,4'}
                />
              </svg>
            )}

            {/* Anchor Handles (HTML: perfectly circular, no ellipse distortion, no hover jitter) */}
            {currentFence && (
              <>
                {/* Start Anchor Handle */}
                <div
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveHandle('start');
                  }}
                  style={{
                    left: `${currentFence.start.x}%`,
                    top: `${currentFence.start.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-rose-600 border-2 border-white shadow-md z-30 select-none touch-none cursor-grab active:cursor-grabbing flex items-center justify-center ${
                    activeHandle === 'start' ? 'ring-4 ring-rose-400/60 scale-110' : ''
                  }`}
                  title="Click and drag to move fence anchor point A"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />

                  {/* Siren Indicator Badge (steady while dragging, bouncing when idle) */}
                  <div className={`absolute -top-5 left-1/2 -translate-x-1/2 pointer-events-none select-none text-xs ${
                    activeHandle === 'start' ? '' : 'animate-bounce'
                  }`}>
                    🚨
                  </div>
                </div>

                {/* End Anchor Handle */}
                <div
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveHandle('end');
                  }}
                  style={{
                    left: `${currentFence.end.x}%`,
                    top: `${currentFence.end.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-rose-600 border-2 border-white shadow-md z-30 select-none touch-none cursor-grab active:cursor-grabbing flex items-center justify-center ${
                    activeHandle === 'end' ? 'ring-4 ring-rose-400/60 scale-110' : ''
                  }`}
                  title="Click and drag to move fence anchor point B"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </>
            )}

            {/* AI Cow Bounding Boxes & Yellow Foot Contact Dots */}
            {cows.map((cow) => (
              <div
                key={cow.id}
                style={{
                  left: `${cow.x}%`,
                  top: `${cow.y}%`,
                  width: `${cow.w}%`,
                  height: `${cow.h}%`,
                }}
                className={`absolute pointer-events-none transition-all duration-75 border-2 z-10 ${
                  cow.isBreached
                    ? 'border-rose-600 bg-rose-600/25 shadow-[0_0_20px_rgba(239,68,68,0.7)]'
                    : 'border-emerald-400 bg-emerald-400/10'
                }`}
              >
                {/* Cow Tag Badge */}
                <div className={`absolute -top-5 left-0 text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1 whitespace-nowrap ${
                  cow.isBreached ? 'bg-rose-600 text-white' : 'bg-emerald-700 text-white'
                }`}>
                  <span>{cow.isBreached ? '🚨' : '🐄'}</span>
                  <span>{cow.name} {cow.isBreached ? '(BREACH)' : ''}</span>
                </div>

                {/* Yellow Foot/Hoof Ground Contact Circle */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center">
                  {cow.isBreached && (
                    <div className="absolute w-4 h-4 rounded-full bg-rose-600/80 animate-ping" />
                  )}
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-700 shadow-xs relative z-10" />
                </div>
              </div>
            ))}

            {/* Bottom Overlay Info Strip */}
            <div className="absolute bottom-2 inset-x-2 flex items-center justify-between pointer-events-none z-30">
              <div className="bg-black/60 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {!hasFence
                    ? 'Click 2 points to draw fence'
                    : isMonitoring
                    ? 'Drag red anchors to adjust fence'
                    : 'Fence established'}
                </span>
              </div>

              <div className="bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded-md border border-white/10 hidden sm:flex items-center gap-1.5">
                <span>MobileNetV3 (24ms)</span>
              </div>
            </div>
          </div>

          {/* Action Controls Bar */}
          <div className="px-3 py-2 bg-zinc-50/90 border-t border-zinc-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={hasFence ? handleClearFence : handleRestoreDefaultFence}
                className="px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <RotateCcw className="w-3 h-3 text-zinc-500" />
                <span>{hasFence ? 'Clear' : 'Default'}</span>
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                  soundEnabled
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3 h-3 text-emerald-600" /> : <VolumeX className="w-3 h-3" />}
                <span>{soundEnabled ? 'Siren On' : 'Muted'}</span>
              </button>
            </div>

            <button
              onClick={handleToggleMonitoring}
              disabled={!hasFence}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                !hasFence
                  ? 'bg-zinc-300 cursor-not-allowed text-zinc-500'
                  : isMonitoring
                  ? 'bg-rose-600 hover:bg-rose-700 active:scale-98'
                  : 'bg-emerald-700 hover:bg-emerald-800 active:scale-98'
              }`}
            >
              {isMonitoring ? (
                <>
                  <span className="w-2 h-2 bg-white rounded-xs inline-block" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Monitoring</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Breach Alerts & Telemetry Diagnostics */}
        <div className="md:col-span-5 xl:col-span-5 space-y-2 sm:space-y-2.5">
          {/* Security Status / Breach Banner */}
          {breachPopup ? (
            <div className="border border-rose-500 rounded-xl bg-rose-50 p-3 flex items-start gap-2.5 shadow-xs animate-in fade-in duration-200">
              <div className="shrink-0 text-rose-600 p-1.5 bg-rose-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-rose-700 font-bold text-xs tracking-wide flex items-center gap-1.5">
                  <span>🚨</span>
                  <span>BREACH DETECTED</span>
                </div>
                <p className="text-[11px] text-rose-900 font-medium mt-0.5 truncate">
                  Animal {breachPopup.cowInfo} crossed boundary
                </p>
                <div className="text-[10px] text-rose-700 mt-1 flex items-center gap-2">
                  <span className="font-mono">{videoTimestamp}</span>
                  <span>·</span>
                  <span>Supervisor Alert Sent</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-emerald-200/80 rounded-xl bg-emerald-50/70 p-3 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-emerald-900 block truncate">
                    {isMonitoring ? 'Perimeter Armed & Active' : 'Standby · Ready'}
                  </span>
                  <span className="text-[10px] text-emerald-700 block truncate">
                    {hasFence ? 'Virtual fence line calibrated' : 'Tap camera canvas to draw fence'}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                isMonitoring ? 'bg-emerald-200/80 text-emerald-900' : 'bg-zinc-200 text-zinc-700'
              }`}>
                {isMonitoring ? 'ARMED' : 'OFFLINE'}
              </span>
            </div>
          )}

          {/* 3 Telemetry Cards */}
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Perimeter Geofence
                </span>
                <span className="text-xs font-semibold text-zinc-900 block truncate">
                  {hasFence ? '150m Virtual Laser' : 'Unconfigured'}
                </span>
                <span className="text-[10px] text-zinc-500 block truncate">
                  {currentFence 
                    ? `(${currentFence.start.x}%, ${currentFence.start.y}%) → (${currentFence.end.x}%, ${currentFence.end.y}%)`
                    : 'Tap video canvas to draw'}
                </span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold shrink-0 ${
                hasFence ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-500'
              }`}>
                {hasFence ? 'ARMED' : 'OFFLINE'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Subject Tracking
                </span>
                <span className="text-xs font-semibold text-zinc-900 block truncate">
                  Gir Cattle Herd
                </span>
                <span className="text-[10px] text-zinc-500 block truncate">
                  Hoof radar ground-contact tracking
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                {cows.length} IN-FRAME
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Edge AI Diagnostics
                </span>
                <span className="text-xs font-semibold text-zinc-900 block truncate">
                  MobileNetV3-YOLO
                </span>
                <span className="text-[10px] text-zinc-500 block truncate">
                  Local ONNX, 30 FPS surveillance feed
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                24ms LATENCY
              </span>
            </div>
          </div>

          {/* Quick calibration tip */}
          <div className="px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200/60 text-[10px] text-zinc-500 flex items-center gap-1.5">
            <span className="shrink-0">💡</span>
            <span className="truncate">Drag red anchor handles on camera feed to calibrate fence line</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CctvMonitorScreen;

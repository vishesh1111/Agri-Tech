'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Waves, Droplets, ArrowLeft, CheckCircle2, AlertTriangle, 
  Sparkles, Gauge, Play, Pause, RotateCcw, Info, Zap, 
  Clock, ShieldCheck, Sun, HelpCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';
import { 
  calculateCropWaterRequirement, 
  CROP_WATER_REGISTRY, 
  FarmerCropWaterInput 
} from '@/lib/calculators/cropWaterEngine';

export const CropWaterVisualizerScreen: React.FC = () => {
  const { navigateBack, navigateToSubScreen, crops, farms } = useKisanStore();

  // 1. Farmer Inputs State
  const [cropKey, setCropKey] = useState<string>('wheat');
  const [acres, setAcres] = useState<number>(farms[0]?.totalArea || 3.0);
  const [soilType, setSoilType] = useState<'loam' | 'sandy' | 'clay' | 'black_cotton' | 'red_soil'>('loam');
  const [method, setMethod] = useState<'flood' | 'drip' | 'sprinkler'>('flood');
  const [pumpHp, setPumpHp] = useState<number>(5);
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

  // 2. Interactive Water Level Slider (in cm)
  const [simulatedWaterCm, setSimulatedWaterCm] = useState<number>(6.0);

  // 3. Auto-play Lifecycle Simulation State
  const [isPlayingCycle, setIsPlayingCycle] = useState<boolean>(false);

  // Run Agronomic Calculation
  const result = useMemo(() => {
    return calculateCropWaterRequirement({
      cropKey,
      landAreaAcres: acres,
      soilType,
      irrigationMethod: method,
      growthStageIndex: selectedStageIdx,
      pumpHorsePower: pumpHp,
    });
  }, [cropKey, acres, soilType, method, selectedStageIdx, pumpHp]);

  // Sync simulated water depth when stage or crop changes
  useEffect(() => {
    setSimulatedWaterCm(result.minWaterDepthCm);
  }, [cropKey, selectedStageIdx, result.minWaterDepthCm]);

  // Lifecycle Auto-Play Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingCycle) {
      timer = setInterval(() => {
        setSelectedStageIdx((prev) => {
          const totalStages = result.cropProfile.stages.length;
          if (prev >= totalStages - 1) {
            setIsPlayingCycle(false);
            return 0;
          }
          return prev + 1;
        });
      }, 2800);
    }
    return () => clearInterval(timer);
  }, [isPlayingCycle, result.cropProfile.stages.length]);

  const minRequiredCm = result.minWaterDepthCm;
  const isPaddy = cropKey === 'rice';

  // Determine Plant Condition based on simulated water vs agronomic minimum
  let plantHealth: 'drought' | 'healthy' | 'waterlogged' = 'healthy';
  let statusBannerText = 'Optimal Water Level: Crop will grow with full vigor & max yield';
  let statusBannerBadge = 'bg-emerald-50 text-emerald-800 border-emerald-300';

  if (simulatedWaterCm < minRequiredCm * 0.7) {
    plantHealth = 'drought';
    statusBannerText = 'Moisture Deficit (Drought Stress): Leaves wilting, grain development will stunt!';
    statusBannerBadge = 'bg-amber-50 text-amber-800 border-amber-300';
  } else if (simulatedWaterCm > (isPaddy ? minRequiredCm * 2.2 : minRequiredCm * 1.6)) {
    plantHealth = 'waterlogged';
    statusBannerText = 'Excess Water Stagnation: Roots suffocating, high risk of collar rot & fungal blight';
    statusBannerBadge = 'bg-rose-50 text-rose-800 border-rose-300';
  }

  // Animation percentages for SVG Cross-section
  const maxRulerCm = 10;
  const waterFillPercent = Math.min(Math.max((simulatedWaterCm / maxRulerCm) * 100, 4), 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateBack()}
            className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                <Waves className="h-5 w-5" />
              </span>
              <h1 className="text-xl font-bold text-zinc-900">
                Crop Minimum Irrigation Visualizer
              </h1>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Live visual cross-section showing required water depth (cm) and pumping hours across crop growth stages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>ICAR & FAO-56 Calibrated</span>
          </span>
        </div>
      </div>

      {/* 2. Farmer & Crop Input Settings */}
      <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Farmer & Field Parameters
          </h3>
          <span className="text-[11px] text-zinc-400">
            Customize to your farm land
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
          {/* Crop Selector */}
          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Select Crop</label>
            <select
              value={cropKey}
              onChange={(e) => {
                setCropKey(e.target.value);
                setSelectedStageIdx(0);
              }}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Object.values(CROP_WATER_REGISTRY).map((c) => (
                <option key={c.cropKey} value={c.cropKey}>
                  {c.cropName}
                </option>
              ))}
            </select>
          </div>

          {/* Land Area */}
          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Land Area (Acres)</label>
            <input
              type="number"
              min="0.25"
              step="0.25"
              value={acres}
              onChange={(e) => setAcres(Math.max(0.1, parseFloat(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Soil Type */}
          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Soil Texture</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="loam">Loamy Soil (Ideal)</option>
              <option value="sandy">Sandy Soil (Rapid drainage)</option>
              <option value="clay">Clayey Soil (High retention)</option>
              <option value="black_cotton">Black Cotton Soil (Heavy clay)</option>
              <option value="red_soil">Red / Laterite Soil</option>
            </select>
          </div>

          {/* Irrigation Method */}
          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Irrigation System</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="flood">Surface Flood (Traditional)</option>
              <option value="drip">Drip Irrigation (-48% water)</option>
              <option value="sprinkler">Sprinkler System (-28% water)</option>
            </select>
          </div>

          {/* Pump Motor Rating */}
          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Tubewell Pump</label>
            <select
              value={pumpHp}
              onChange={(e) => setPumpHp(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="3">3 HP (21,000 L/hr)</option>
              <option value="5">5 HP (35,000 L/hr) - Common</option>
              <option value="7.5">7.5 HP (52,500 L/hr)</option>
              <option value="10">10 HP (70,000 L/hr)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 3. Stage Progression Timeline Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
            Phenological Growth Stage: {result.currentStage.stageName} ({result.currentStage.dayRange})
          </span>
          <button
            onClick={() => setIsPlayingCycle(!isPlayingCycle)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition shadow-xs"
          >
            {isPlayingCycle ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Auto-Tour</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Full Lifecycle</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {result.cropProfile.stages.map((stg, i) => (
            <button
              key={stg.stageNumber}
              onClick={() => {
                setIsPlayingCycle(false);
                setSelectedStageIdx(i);
              }}
              className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                selectedStageIdx === i
                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-600'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Stage {stg.stageNumber}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                    stg.criticalLevel === 'ultra-critical'
                      ? 'bg-rose-100 text-rose-800'
                      : stg.criticalLevel === 'high'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {stg.criticalLevel}
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-zinc-900 mt-1 line-clamp-1">
                  {stg.stageName}
                </h4>
                <span className="text-[11px] text-zinc-500 block mt-0.5">
                  {stg.dayRange}
                </span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-zinc-200/60 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 font-normal">Min Water:</span>
                <span className="text-xs font-bold text-emerald-700">
                  {stg.minWaterDepthCm} cm {stg.isStandingWater ? '(Standing)' : '(Wetting)'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Real-Time Interactive Crop & Water Cross-Section Animation Box */}
      <Card className="p-6 border border-zinc-200/80 bg-white space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {/* Top Status Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Soil & Root Visual Simulation
            </span>
            <div className={`mt-1.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusBannerBadge}`}>
              {plantHealth === 'healthy' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <span>{statusBannerText}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setSimulatedWaterCm(minRequiredCm)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Snap to Minimum ({minRequiredCm} cm)</span>
            </button>
          </div>
        </div>

        {/* Animated Visual Cross-Section Container */}
        <div className="relative w-full h-84 sm:h-96 rounded-2xl overflow-hidden border border-zinc-200 shadow-inner flex flex-col">
          
          {/* TOP HALF: Above-Ground Atmosphere & Crop Canopy (50% height) */}
          <div className="relative w-full h-1/2 bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50/40 flex items-end justify-center overflow-hidden">
            {/* Ambient Sun & Clouds */}
            <div className="absolute top-3 left-4 flex items-center gap-2 text-amber-500 opacity-80">
              <Sun className="w-7 h-7 animate-spin-slow text-amber-500" />
              <span className="text-[10px] font-semibold text-amber-800/80 bg-white/60 px-2 py-0.5 rounded-full">
                {result.cropProfile.cropName} · Stage {result.currentStage.stageNumber}
              </span>
            </div>

            {/* Standing Water Pool (for Paddy / Rice) sitting ABOVE soil line */}
            {isPaddy && simulatedWaterCm > 0 && (
              <div
                className="absolute left-0 right-0 bottom-0 z-20 bg-blue-500/40 backdrop-blur-2xs border-b border-blue-400 transition-all duration-700 pointer-events-none"
                style={{
                  height: `${Math.min(simulatedWaterCm * 9, 70)}px`,
                }}
              >
                {/* Rippling Surface Wave */}
                <div className="w-full h-1.5 bg-gradient-to-r from-blue-300 via-white/80 to-blue-300 opacity-80 animate-pulse" />
                <span className="absolute left-3 bottom-1.5 text-[10px] font-bold text-blue-950 bg-white/90 px-2 py-0.5 rounded shadow-xs">
                  💧 {simulatedWaterCm} cm Standing Water Pool
                </span>
              </div>
            )}

            {/* Above Ground Plant Vector Graphic */}
            <div
              className={`relative z-10 flex flex-col items-center origin-bottom transition-all duration-700 transform ${
                plantHealth === 'drought'
                  ? 'scale-y-80 -rotate-3 filter grayscale-40'
                  : plantHealth === 'waterlogged'
                  ? 'scale-y-95 rotate-1 filter hue-rotate-30'
                  : 'scale-100'
              }`}
            >
              {/* Plant Vector Rendering */}
              <svg width="150" height="150" viewBox="0 0 150 150" fill="none">
                {/* Main Stem */}
                <path
                  d="M75 150 Q74 85 75 15"
                  stroke={plantHealth === 'drought' ? '#9a3412' : '#15803d'}
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Left Branch Leaves */}
                <path
                  d="M75 120 Q35 105 25 120 Q50 135 75 125"
                  fill={plantHealth === 'drought' ? '#b45309' : '#16a34a'}
                />
                <path
                  d="M75 90 Q25 75 15 90 Q40 105 75 95"
                  fill={plantHealth === 'drought' ? '#d97706' : '#22c55e'}
                />
                <path
                  d="M75 60 Q35 45 30 60 Q55 70 75 65"
                  fill={plantHealth === 'drought' ? '#d97706' : '#22c55e'}
                />

                {/* Right Branch Leaves */}
                <path
                  d="M75 105 Q115 90 125 105 Q100 120 75 110"
                  fill={plantHealth === 'drought' ? '#b45309' : '#16a34a'}
                />
                <path
                  d="M75 75 Q125 60 135 75 Q110 90 75 80"
                  fill={plantHealth === 'drought' ? '#d97706' : '#22c55e'}
                />
                <path
                  d="M75 45 Q115 30 120 45 Q95 55 75 50"
                  fill={plantHealth === 'drought' ? '#d97706' : '#22c55e'}
                />

                {/* Earhead / Grain / Fruit (grows as stage advances) */}
                {selectedStageIdx >= 2 && (
                  <g className="transition-opacity duration-500">
                    <ellipse
                      cx="75"
                      cy="22"
                      rx={selectedStageIdx >= 3 ? '9' : '5'}
                      ry={selectedStageIdx >= 3 ? '22' : '12'}
                      fill={cropKey === 'rice' || cropKey === 'wheat' ? '#eab308' : '#16a34a'}
                      stroke="#854d0e"
                      strokeWidth="1.5"
                    />
                    {/* Golden grain awns */}
                    <path d="M75 5 L75 0" stroke="#854d0e" strokeWidth="2" />
                    <path d="M71 10 L63 2" stroke="#854d0e" strokeWidth="1.5" />
                    <path d="M79 10 L87 2" stroke="#854d0e" strokeWidth="1.5" />
                  </g>
                )}
              </svg>

              {/* Plant Status Pill */}
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs mb-1 ${
                  plantHealth === 'healthy'
                    ? 'bg-emerald-600 text-white'
                    : plantHealth === 'drought'
                    ? 'bg-amber-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {plantHealth === 'healthy'
                  ? '🌿 Robust & Vibrant'
                  : plantHealth === 'drought'
                  ? '🥀 Water Deficit (Wilting)'
                  : '⚠️ Waterlogged Root Asphyxia'}
              </span>
            </div>
          </div>

          {/* SOIL SURFACE DIVIDER LINE (0 cm) */}
          <div className="relative w-full h-2 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 z-30 flex items-center justify-between px-4">
            <span className="text-[10px] font-extrabold text-amber-100 tracking-wider">
              GROUND LEVEL (0 cm)
            </span>
            <span className="text-[10px] font-medium text-amber-200">
              Root Zone Profile
            </span>
          </div>

          {/* BOTTOM HALF: Below-Ground Soil Cross-Section & Water Infiltration (50% height) */}
          <div className="relative w-full h-1/2 bg-gradient-to-b from-[#5c371d] via-[#482813] to-[#2e1709] overflow-hidden">
            
            {/* Animated Fluid Infiltration Layer */}
            <div
              className="absolute left-0 right-0 top-0 bg-blue-600/50 backdrop-blur-2xs transition-all duration-700 border-b-2 border-blue-300/80 shadow-md"
              style={{
                height: `${waterFillPercent}%`,
              }}
            >
              {/* Particle flow texture simulating water percolation */}
              <div className="w-full h-full opacity-40 bg-[radial-gradient(#bfdbfe_1.5px,transparent_1.5px)] [background-size:14px_14px]" />
              <div className="absolute bottom-1 right-14 text-[10px] font-bold text-blue-100 bg-blue-900/80 px-2 py-0.5 rounded shadow-xs">
                Infiltration Depth: {simulatedWaterCm} cm
              </div>
            </div>

            {/* Root Architecture SVG */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-full pointer-events-none z-10 opacity-90">
              <svg width="192" height="160" viewBox="0 0 192 160" fill="none">
                {/* Main Taproot extending downward */}
                <path
                  d="M96 0 Q98 60 96 130"
                  stroke="#fef08a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Lateral Root Branches */}
                <path d="M96 20 Q70 40 45 60" stroke="#fef08a" strokeWidth="2.2" />
                <path d="M96 28 Q125 45 150 65" stroke="#fef08a" strokeWidth="2.2" />
                <path d="M96 50 Q60 75 35 100" stroke="#fef08a" strokeWidth="1.8" />
                <path d="M96 65 Q130 90 160 110" stroke="#fef08a" strokeWidth="1.8" />
                <path d="M96 90 Q75 115 55 135" stroke="#fef08a" strokeWidth="1.4" />
                <path d="M96 105 Q120 125 140 145" stroke="#fef08a" strokeWidth="1.4" />
              </svg>
            </div>

            {/* Dashed Target Minimum Required Indicator Line */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-400 flex items-center justify-between px-3 pointer-events-none z-20"
              style={{
                top: `${(minRequiredCm / maxRulerCm) * 100}%`,
              }}
            >
              <span className="text-[10px] font-extrabold text-emerald-950 bg-emerald-300 px-2 py-0.5 rounded-full shadow-xs">
                ⭐ Agronomic Minimum Target: {minRequiredCm} cm
              </span>
            </div>
          </div>

          {/* Physical Depth Ruler (Vertical Scale on the Right) */}
          <div className="absolute right-3 top-3 bottom-3 w-11 bg-white/95 backdrop-blur-sm rounded-xl border border-zinc-300 shadow-md flex flex-col justify-between items-center py-2 z-40">
            <span className="text-[9px] font-bold text-zinc-500 uppercase">Top</span>
            <div className="flex flex-col items-end w-full px-1.5 space-y-2">
              {[0, 2, 4, 6, 8, 10].map((val) => (
                <div key={val} className="flex items-center gap-1 w-full justify-end">
                  <span className="text-[9px] font-bold text-zinc-700">{val}</span>
                  <div
                    className={`h-0.5 ${
                      val === Math.round(minRequiredCm)
                        ? 'w-4 bg-emerald-600'
                        : 'w-2 bg-zinc-400'
                    }`}
                  />
                </div>
              ))}
            </div>
            <span className="text-[9px] font-extrabold text-zinc-800">cm</span>
          </div>
        </div>

        {/* Interactive Simulation Controls */}
        <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-800 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-700" />
              <span>
                Simulate Water Depth: <span className="text-emerald-700 font-extrabold text-sm">{simulatedWaterCm} cm</span>
              </span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSimulatedWaterCm(Number((minRequiredCm * 0.4).toFixed(1)))}
                className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-[10px] font-medium hover:bg-amber-200 transition"
              >
                Test Drought
              </button>
              <button
                onClick={() => setSimulatedWaterCm(minRequiredCm)}
                className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold hover:bg-emerald-200 transition"
              >
                Exact Target
              </button>
              <button
                onClick={() => setSimulatedWaterCm(isPaddy ? 9.5 : 8.5)}
                className="px-2.5 py-1 rounded bg-rose-100 text-rose-900 text-[10px] font-medium hover:bg-rose-200 transition"
              >
                Test Flood
              </button>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={simulatedWaterCm}
            onChange={(e) => setSimulatedWaterCm(parseFloat(e.target.value))}
            className="w-full accent-emerald-600 h-2 bg-zinc-200 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-medium text-zinc-500 px-1">
            <span>0 cm (Severe Drought)</span>
            <span className="text-emerald-700 font-bold">
              Target Minimum: {minRequiredCm} cm
            </span>
            <span>10 cm (Waterlogged)</span>
          </div>
        </div>

        {/* 5. Plain-English Action Cards for Farmer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {/* Dose Liters */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1">
            <div className="flex items-center justify-between text-blue-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">Water Dose</span>
              <Droplets className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-blue-950">
              {result.singleIrrigationLiters.toLocaleString()} <span className="text-xs font-normal text-zinc-500">Liters</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-tight">
              Total volume required for your {acres} Acres
            </p>
          </div>

          {/* Pump Hours */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">Tubewell Run</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-amber-950">
              {result.pumpRuntimeFormatted}
            </div>
            <p className="text-[11px] text-amber-800 leading-tight">
              Motor run time on {pumpHp} HP pump
            </p>
          </div>

          {/* Frequency */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">Interval</span>
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-emerald-950">
              Every {result.wateringFrequencyDays} <span className="text-xs font-normal text-zinc-500">Days</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-tight">
              Calibrated for {soilType} retention
            </p>
          </div>

          {/* Water Savings */}
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-1">
            <div className="flex items-center justify-between text-purple-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">Savings vs Flood</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-purple-950">
              {result.efficiencySavingsVsFloodPercent}% <span className="text-xs font-normal text-zinc-500">saved</span>
            </div>
            <p className="text-[11px] text-purple-800 leading-tight">
              {result.efficiencySavingsVsFloodPercent > 0
                ? `${result.savedLitersVsFlood.toLocaleString()} L saved with ${method}`
                : 'Using traditional flood method'}
            </p>
          </div>
        </div>

        {/* 6. Agronomist Recommendation Details */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Agronomic Advisory for {result.currentStage.stageName}:</span>
          </div>
          <p className="text-xs text-zinc-700 leading-relaxed">
            {result.currentStage.farmerAdvice}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-zinc-200/70 text-[11px] text-zinc-500">
            <div>• <strong className="text-zinc-700">Soil Impact:</strong> {result.soilAdjustedNote}</div>
            <div>• <strong className="text-zinc-700">Method:</strong> {result.irrigationMethodNote}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CropWaterVisualizerScreen;

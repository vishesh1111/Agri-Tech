'use client';

import React from 'react';
import {
  CloudSun,
  Wind,
  Droplets,
  Sun,
  ShieldAlert,
  Thermometer,
  Compass,
  Gauge,
  Activity,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function FarmWeatherScreen() {
  const {
    farms,
    selectedFarmId,
    selectFarm,
    farmWeather,
    triggerSevereWeatherAlert,
  } = useKisanStore();

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* 1. Header & Farm Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
            Farm Weather & Advisory
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Real-time satellite meteorology & spraying window
          </p>
        </div>

        {farms.length > 1 && (
          <select
            value={selectedFarmId}
            onChange={(e) => selectFarm(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {farmWeather ? (
        <>
          {/* 2. Hero Weather Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-700 to-blue-900 text-white shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-sky-100">
                  {farmWeather.locationName}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-4xl font-black">{farmWeather.currentTempC}°</h3>
                  <span className="text-sm font-semibold text-sky-200">
                    Feels like {farmWeather.feelsLikeTempC}°C
                  </span>
                </div>
                <p className="text-base font-bold text-sky-100 mt-1">
                  {farmWeather.conditionText}
                </p>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <CloudSun className="h-10 w-10 text-amber-300" />
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="mt-4 grid grid-cols-4 gap-2 border-t border-white/20 pt-3 text-center text-xs">
              <div>
                <span className="text-[10px] text-sky-200">Humidity</span>
                <p className="font-bold">{farmWeather.humidityPercent}%</p>
              </div>
              <div>
                <span className="text-[10px] text-sky-200">Wind</span>
                <p className="font-bold">{farmWeather.windSpeedKm} km/h</p>
              </div>
              <div>
                <span className="text-[10px] text-sky-200">Rain Prob</span>
                <p className="font-bold">{farmWeather.rainProbabilityPercent}%</p>
              </div>
              <div>
                <span className="text-[10px] text-sky-200">UV Index</span>
                <p className="font-bold">{farmWeather.uvIndex}</p>
              </div>
            </div>
          </Card>

          {/* 3. Severe Weather Warning Banner (if active) */}
          {farmWeather.isSevereAlert && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs dark:bg-rose-950/40 dark:border-rose-900/60">
              <ShieldAlert className="h-6 w-6 text-rose-600 shrink-0" />
              <div>
                <h4 className="font-bold text-rose-900 dark:text-rose-300">
                  {farmWeather.alertHeader || 'Severe Weather Warning'}
                </h4>
                <p className="text-rose-800 dark:text-rose-400 mt-0.5">
                  High precipitation or gale winds forecast. Delay pesticide spraying and shelter herd.
                </p>
              </div>
            </div>
          )}

          {/* 4. Agricultural Spraying Window & Field Advisory */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100">
                Crop Spraying & Agronomy Window
              </h3>
              <Badge
                variant={
                  farmWeather.sprayingWindowStatus === 'OPTIMAL'
                    ? 'success'
                    : farmWeather.sprayingWindowStatus === 'CAUTION'
                    ? 'warning'
                    : 'danger'
                }
              >
                Window: {farmWeather.sprayingWindowStatus}
              </Badge>
            </div>

            <p className="text-xs text-gray-700 dark:text-zinc-300">
              {farmWeather.agriculturalAdvisory}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-zinc-800">
                <span className="text-[10px] text-gray-400">Spraying Assessment</span>
                <p className="font-semibold text-gray-800 dark:text-zinc-200 mt-0.5">
                  {farmWeather.sprayingReason}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-zinc-800">
                <span className="text-[10px] text-gray-400">Irrigation Recommendation</span>
                <p className="font-semibold text-gray-800 dark:text-zinc-200 mt-0.5">
                  {farmWeather.irrigationAdvice}
                </p>
              </div>
            </div>
          </Card>

          {/* 5. Hourly Forecast (8 Hours) */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
              Hourly Telemetry (Next 8 Hours)
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {farmWeather.hourlyForecast.map((h, i) => (
                <div
                  key={i}
                  className="min-w-[85px] shrink-0 rounded-2xl border border-gray-100 bg-white p-2.5 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400">
                    {h.timeLabel}
                  </span>
                  <div className="my-1.5 flex justify-center text-amber-500">
                    <CloudSun className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-extrabold text-gray-900 dark:text-zinc-100">
                    {h.tempC}°
                  </span>
                  <span className="block text-[10px] text-sky-600 font-semibold mt-0.5">
                    💧 {h.rainChance}%
                  </span>
                  <span className="block text-[9px] text-gray-400">💨 {h.windSpeedKm} km/h</span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Extended Meteorological & Livestock Stress Grid */}
          <Card className="space-y-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100">
              Advanced Environmental Telemetry
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-xl border border-gray-100 p-2.5 dark:border-zinc-800">
                <span className="text-[10px] text-gray-400">FAO-56 ET0 Deficit</span>
                <p className="font-bold text-gray-900 dark:text-zinc-100 mt-0.5">
                  {farmWeather.et0EvapotranspirationMm} mm/day
                </p>
                <span className="text-[9px] text-gray-400">Water crop loss</span>
              </div>

              <div className="rounded-xl border border-gray-100 p-2.5 dark:border-zinc-800">
                <span className="text-[10px] text-gray-400">Soil Temperature</span>
                <p className="font-bold text-gray-900 dark:text-zinc-100 mt-0.5">
                  {farmWeather.soilTemperatureC}°C
                </p>
                <span className="text-[9px] text-gray-400">Root zone depth</span>
              </div>

              <div className="rounded-xl border border-gray-100 p-2.5 dark:border-zinc-800">
                <span className="text-[10px] text-gray-400">Wind Direction & Gusts</span>
                <p className="font-bold text-gray-900 dark:text-zinc-100 mt-0.5">
                  {farmWeather.windDirection} ({farmWeather.windGustsKm} km/h)
                </p>
                <span className="text-[9px] text-gray-400">Surface pressure: {farmWeather.surfacePressureHpa} hPa</span>
              </div>

              <div className="rounded-xl border border-gray-100 p-2.5 dark:border-zinc-800">
                <span className="text-[10px] text-gray-400">Foliar Disease Risk</span>
                <p
                  className={`font-bold mt-0.5 ${
                    farmWeather.diseaseRiskLevel === 'HIGH'
                      ? 'text-rose-600'
                      : farmWeather.diseaseRiskLevel === 'MODERATE'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {farmWeather.diseaseRiskLevel}
                </p>
                <span className="text-[9px] text-gray-400">{farmWeather.diseaseRiskReason}</span>
              </div>

              <div className="rounded-xl border border-gray-100 p-2.5 dark:border-zinc-800">
                <span className="text-[10px] text-gray-400">Livestock THI Score</span>
                <p className="font-bold text-gray-900 dark:text-zinc-100 mt-0.5">
                  {farmWeather.livestockThiScore} ({farmWeather.livestockStressLevel})
                </p>
                <span className="text-[9px] text-gray-400">Thermal comfort index</span>
              </div>

              <div className="rounded-xl border border-gray-100 p-2.5 dark:border-zinc-800">
                <span className="text-[10px] text-gray-400">Field Workability</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {farmWeather.fieldWorkabilityScore}% Optimal
                </p>
                <span className="text-[9px] text-gray-400">Soil trafficability</span>
              </div>
            </div>
          </Card>

          {/* 7. 7-Day Forecast */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
              7-Day Agriculture Forecast
            </h3>
            <div className="space-y-1.5">
              {farmWeather.weeklyForecast.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-white p-3 text-xs shadow-xs dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800"
                >
                  <div className="w-24">
                    <span className="font-bold text-gray-900 dark:text-zinc-100">{d.dayLabel}</span>
                    <span className="block text-[10px] text-gray-400">{d.condition}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-gray-900 dark:text-zinc-100">
                      {d.tempMax}°
                    </span>
                    <span className="text-xs text-gray-400">{d.tempMin}°</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-sky-600 block">
                      💧 {d.rainPercent}% ({d.rainMm}mm)
                    </span>
                    <span className="text-[10px] text-gray-400">ET0: {d.et0Sum}mm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <Card className="text-center p-6 text-xs text-gray-500">
          Loading live satellite meteorological data for {activeFarm?.name}...
        </Card>
      )}
    </div>
  );
}

export default FarmWeatherScreen;

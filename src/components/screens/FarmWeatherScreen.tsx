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
  MapPin,
  CheckCircle2,
  AlertTriangle,
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
  } = useKisanStore();

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];

  return (
    <div className="space-y-6">
      {/* 1. Header & Location Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CloudSun className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              Weather & Spray Advisory
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time agro-meteorology, wind speed, spray suitability windows, and 7-day outlook
          </p>
        </div>

        {farms.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500">Farm:</span>
            <select
              value={selectedFarmId}
              onChange={(e) => selectFarm(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {farmWeather && (
        <div className="space-y-6">
          {/* Current Conditions Card */}
            <Card className="p-6 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{farmWeather.locationName}</span>
                    <span>·</span>
                    <span>Updated just now</span>
                  </div>
                  <div className="flex items-baseline gap-3 mt-3">
                    <h2 className="text-4xl font-semibold text-zinc-900 tracking-tight">
                      {farmWeather.currentTempC}°C
                    </h2>
                    <span className="text-sm text-zinc-500 font-medium">
                      Feels like {farmWeather.feelsLikeTempC}°C
                    </span>
                  </div>
                  <p className="text-sm font-medium text-zinc-700 mt-1">
                    {farmWeather.conditionText}
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200 text-amber-500">
                  <CloudSun className="h-8 w-8" />
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className="mt-6 grid grid-cols-4 gap-4 border-t border-zinc-100 pt-4 text-center">
                <div className="text-left">
                  <span className="text-[11px] text-zinc-400 font-medium">Relative Humidity</span>
                  <p className="font-semibold text-zinc-900 text-base mt-0.5">{farmWeather.humidityPercent}%</p>
                </div>
                <div className="text-left">
                  <span className="text-[11px] text-zinc-400 font-medium">Wind Speed</span>
                  <p className="font-semibold text-zinc-900 text-base mt-0.5">{farmWeather.windSpeedKm} km/h</p>
                </div>
                <div className="text-left">
                  <span className="text-[11px] text-zinc-400 font-medium">Rain Probability</span>
                  <p className="font-semibold text-zinc-900 text-base mt-0.5">{farmWeather.rainProbabilityPercent}%</p>
                </div>
                <div className="text-left">
                  <span className="text-[11px] text-zinc-400 font-medium">UV Index</span>
                  <p className="font-semibold text-zinc-900 text-base mt-0.5">{farmWeather.uvIndex} (Mod)</p>
                </div>
              </div>
            </Card>

            {/* Severe Alert Warning if active */}
            {farmWeather.isSevereAlert && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-rose-900 text-sm">
                    {farmWeather.alertHeader || 'Weather Advisory'}
                  </h4>
                  <p className="text-rose-700 mt-0.5 leading-relaxed">
                    High winds or precipitation expected. Delay chemical spraying and ensure field drainage channels are clear.
                  </p>
                </div>
              </div>
            )}

            {/* Hourly Forecast */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                Next 8 Hours Outlook
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {farmWeather.hourlyForecast.map((h, i) => (
                  <Card
                    key={i}
                    className="p-3 text-center border border-zinc-200/80 bg-white shadow-xs space-y-1 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer group"
                  >
                    <span className="text-[11px] font-medium text-zinc-500 block">
                      {h.timeLabel}
                    </span>
                    <div className="my-1 flex justify-center text-amber-500 group-hover:scale-115 transition-transform duration-200">
                      <CloudSun className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-900 block">
                      {h.tempC}°
                    </span>
                    <span className="block text-[10px] text-zinc-500 font-medium">
                      {h.rainChance}% rain
                    </span>
                  </Card>
                ))}
              </div>
            </div>

            {/* 7-Day Agronomic Forecast Table */}
            <Card className="p-5 border border-zinc-200/80 bg-white space-y-4">
              <h3 className="font-semibold text-sm text-zinc-900">
                7-Day Agronomic Outlook
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-400 text-[11px]">
                      <th className="pb-2 font-medium">Day</th>
                      <th className="pb-2 font-medium">Condition</th>
                      <th className="pb-2 font-medium text-right">Max / Min</th>
                      <th className="pb-2 font-medium text-right">Precipitation</th>
                      <th className="pb-2 font-medium text-center">Field Conditions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-normal">
                    {[
                      { day: 'Today (Wed)', condition: 'Clear Sky & Sun', high: 28, low: 16, rain: '0 mm (5%)', workability: 'Favorable' },
                      { day: 'Thursday', condition: 'Partly Cloudy', high: 29, low: 17, rain: '1 mm (15%)', workability: 'Favorable' },
                      { day: 'Friday', condition: 'Sunny & Warm', high: 30, low: 18, rain: '0 mm (0%)', workability: 'Favorable' },
                      { day: 'Saturday', condition: 'Light Passing Showers', high: 26, low: 15, rain: '6 mm (65%)', workability: 'Wet Soil' },
                      { day: 'Sunday', condition: 'Overcast & Cool', high: 25, low: 14, rain: '2 mm (30%)', workability: 'Moderate' },
                      { day: 'Monday', condition: 'Clear & Bright', high: 27, low: 15, rain: '0 mm (10%)', workability: 'Favorable' },
                      { day: 'Tuesday', condition: 'Warm & Dry', high: 29, low: 16, rain: '0 mm (5%)', workability: 'Favorable' },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50/50 hover:translate-x-1 transition-all duration-200 cursor-pointer group">
                        <td className="py-2.5 font-medium text-zinc-900 group-hover:text-emerald-900 transition-colors">{row.day}</td>
                        <td className="py-2.5 text-zinc-600">{row.condition}</td>
                        <td className="py-2.5 text-right font-medium text-zinc-800">{row.high}° / {row.low}°C</td>
                        <td className="py-2.5 text-right text-zinc-600">{row.rain}</td>
                        <td className="py-2.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium transition-transform group-hover:scale-105 ${
                              row.workability === 'Favorable'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : row.workability === 'Moderate'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                            }`}
                          >
                            {row.workability}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Bottom Section (When Scrolled): Spraying Window & Microclimate Indices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Agricultural Spraying Window Card */}
            <Card className="p-5 border border-zinc-200/80 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-zinc-900">
                    Spraying & Application Window
                  </h3>
                  <p className="text-xs text-zinc-500">Agro-meteorology assessment</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    farmWeather.sprayingWindowStatus === 'OPTIMAL'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                      : farmWeather.sprayingWindowStatus === 'CAUTION'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                      : 'bg-rose-50 text-rose-800 border border-rose-200/60'
                  }`}
                >
                  {farmWeather.sprayingWindowStatus === 'OPTIMAL' ? 'Optimal Window' : farmWeather.sprayingWindowStatus}
                </span>
              </div>

              <div className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-200/70">
                {farmWeather.agriculturalAdvisory}
              </div>

              <div className="space-y-2 text-xs">
                <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-100">
                  <span className="text-[11px] text-zinc-400 font-medium">Spraying Conditions</span>
                  <p className="font-medium text-zinc-800 mt-0.5">
                    {farmWeather.sprayingReason}
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-100">
                  <span className="text-[11px] text-zinc-400 font-medium">Irrigation Guidance</span>
                  <p className="font-medium text-zinc-800 mt-0.5">
                    {farmWeather.irrigationAdvice}
                  </p>
                </div>
              </div>
            </Card>

            {/* Extended Environmental Telemetry */}
            <Card className="p-5 border border-zinc-200/80 bg-white space-y-4">
              <h3 className="font-semibold text-sm text-zinc-900">
                Microclimate & Field Indices
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-100">
                  <span className="text-[11px] text-zinc-400 font-medium">FAO-56 ET0 Rate</span>
                  <p className="font-semibold text-zinc-900 text-sm mt-0.5">
                    {farmWeather.et0EvapotranspirationMm} mm/day
                  </p>
                  <span className="text-[10px] text-zinc-400">Crop moisture loss rate</span>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-100">
                  <span className="text-[11px] text-zinc-400 font-medium">Dew Point</span>
                  <p className="font-semibold text-zinc-900 text-sm mt-0.5">
                    {farmWeather.dewPointCelsius ?? farmWeather.dewPointC}°C
                  </p>
                  <span className="text-[10px] text-zinc-400">Condensation threshold</span>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-100">
                  <span className="text-[11px] text-zinc-400 font-medium">Barometric Pressure</span>
                  <p className="font-semibold text-zinc-900 text-sm mt-0.5">
                    {farmWeather.surfacePressureHpa} hPa
                  </p>
                  <span className="text-[10px] text-zinc-400">Stable atmospheric pressure</span>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-100">
                  <span className="text-[11px] text-zinc-400 font-medium">Soil Temperature (10cm)</span>
                  <p className="font-semibold text-zinc-900 text-sm mt-0.5">
                    {farmWeather.soilTemperature0to10cm ?? farmWeather.soilTemperatureC}°C
                  </p>
                  <span className="text-[10px] text-zinc-400">Root zone absorption</span>
                </div>
              </div>

              {/* Livestock Heat Stress Index */}
              <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-900">
                    Livestock Heat Comfort (THI)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                    THI {farmWeather.livestockThiIndex ?? farmWeather.livestockThiScore} · Normal
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                  Animals are within thermal comfort range. Adequate shade and fresh water recommended as usual.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmWeatherScreen;

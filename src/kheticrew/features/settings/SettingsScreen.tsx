import React, { useState } from 'react';
import { useStore, useTranslation } from '../../store/useStore';
import { ASSUMPTIONS_META, AssumptionMeta } from '../../lib/config';
import { Assumptions } from '../../lib/types';
import { Sliders, RotateCcw, Check, Sparkles, AlertCircle, Info, Database } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { assumptions, updateAssumption, resetAssumptions, resetDemoData, lang } = useStore();
  const t = useTranslation();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const categories: { id: string; label: string }[] = [
    { id: 'All', label: t.settings.categoryAll },
    { id: 'Overbooking', label: t.settings.categoryOverbooking },
    { id: 'LPI', label: t.settings.categoryLPI },
    { id: 'Relay', label: t.settings.categoryRelay },
    { id: 'MicroShift', label: t.settings.categoryMicroShift },
    { id: 'Festival', label: t.settings.categoryFestival },
  ];

  const filteredAssumptions = activeCategory === 'All'
    ? ASSUMPTIONS_META
    : ASSUMPTIONS_META.filter((a) => a.category === activeCategory);

  const handleValueChange = (key: keyof Assumptions, val: number) => {
    updateAssumption(key, val);
    setSavedKey(key as string);
    setTimeout(() => setSavedKey(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-brand-600" />
            <span>{t.settings.title}</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            {t.settings.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={resetAssumptions}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors min-h-touch border border-slate-300"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>{t.settings.resetDefaults}</span>
          </button>

          <button
            type="button"
            onClick={resetDemoData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors min-h-touch border border-rose-200"
          >
            <Database className="w-4 h-4 text-rose-600" />
            <span>{t.app.resetDemo}</span>
          </button>
        </div>
      </div>

      {/* Persistence and Performance Callout */}
      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-start gap-2.5">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Transparent Empirical Calibration Layer</span>
          <p className="text-blue-800 text-xs mt-0.5">
            {t.settings.saveNotice}
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
        {categories.map((c) => {
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-touch ${
                isActive
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Assumptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssumptions.map((meta: AssumptionMeta) => {
          const currentValue = assumptions[meta.key] as number;
          const isJustSaved = savedKey === meta.key;

          return (
            <div
              key={meta.key}
              className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-brand-300 transition-all space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {meta.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">
                      {lang === 'hi' ? meta.labelHi : meta.labelEn}
                    </h3>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                    <Info className="w-3 h-3 text-amber-700" />
                    <span>{t.app.assumptionTag}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {lang === 'hi' ? meta.descriptionHi : meta.descriptionEn}
                </p>
              </div>

              {/* Slider & Input Control */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">{meta.key}</span>
                  <div className="flex items-center gap-2">
                    {isJustSaved && (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Live Updated
                      </span>
                    )}
                    <span className="font-extrabold text-sm text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200 font-mono">
                      {currentValue} {meta.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={meta.min}
                    max={meta.max}
                    step={meta.step}
                    value={currentValue}
                    onChange={(e) => handleValueChange(meta.key, parseFloat(e.target.value))}
                    className="flex-1 accent-brand-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    aria-label={meta.labelEn}
                  />

                  <input
                    type="number"
                    min={meta.min}
                    max={meta.max}
                    step={meta.step}
                    value={currentValue}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) handleValueChange(meta.key, v);
                    }}
                    className="w-20 text-xs font-bold text-right border border-slate-300 rounded-lg p-1.5 bg-slate-50 text-slate-800 focus:bg-white"
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Min: {meta.min} {meta.unit}</span>
                  <span>Step: {meta.step}</span>
                  <span>Max: {meta.max} {meta.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

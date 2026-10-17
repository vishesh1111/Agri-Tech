import React, { useState, useMemo } from 'react';
import { useStore, useTranslation } from '../../store/useStore';
import { AssumptionBadge } from '../../components/AssumptionBadge';
import { FESTIVALS, CROP_OPERATIONS } from '../../data/seed';
import {
  computeAllVillagesFestivalSupply,
  computeFestivalHarvestOverlap,
  getFestivalWhatsAppReminder,
} from '../../lib/engines/festival';
import { computeLPI } from '../../lib/engines/lpi';
import { formatINR, formatDateShort } from '../../lib/dates';
import { Pledge, ShortStintOffer } from '../../lib/types';
import {
  Calendar,
  AlertTriangle,
  Users,
  Briefcase,
  Share2,
  Sliders,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const FestivalScreen: React.FC = () => {
  const {
    villages,
    farms,
    workers,
    jobs,
    forecast,
    migrantProfiles,
    assumptions,
    shortStintOffers,
    pledges,
    surveyResponses,
    addSurveyResponse,
    updatePledgeStatus,
    addShortStintOffer,
    lang,
  } = useStore();

  const t = useTranslation();

  // Sensitivity analysis slider: multiplier on return probability (0.2x to 1.8x)
  const [rateMultiplier, setRateMultiplier] = useState<number>(1.0);
  const [selectedVillageId, setSelectedVillageId] = useState<string>('all');
  const [selectedFestivalId, setSelectedFestivalId] = useState<string>(FESTIVALS[1]?.id || 'fest-diwali');

  // Survey Form State
  const [surveyFestivals, setSurveyFestivals] = useState<string[]>(['fest-diwali']);
  const [surveyDays, setSurveyDays] = useState<number>(10);
  const [surveyWilling, setSurveyWilling] = useState<'yes' | 'maybe' | 'no'>('yes');
  const [surveyWage, setSurveyWage] = useState<number>(450);
  const [surveyPerk, setSurveyPerk] = useState<string>('Midday hot meals & daily cash settlement');
  const [surveySubmitted, setSurveySubmitted] = useState<boolean>(false);

  // New Short-Stint Offer Modal / Form State
  const [showOfferModal, setShowOfferModal] = useState<boolean>(false);
  const [newOfferOp, setNewOfferOp] = useState<string>('paddy manual harvest');
  const [newOfferWage, setNewOfferWage] = useState<number>(480);
  const [newOfferStart, setNewOfferStart] = useState<string>('2026-11-05');
  const [newOfferEnd, setNewOfferEnd] = useState<string>('2026-11-12');
  const [newOfferSlots, setNewOfferSlots] = useState<number>(8);
  const [newOfferPerks, setNewOfferPerks] = useState<string>('Hot lunch, Transport from village center');

  // WhatsApp share notification toast
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // 1. Calculate Festival Supply
  const { villageSupplies, supplyLookup } = useMemo(() => {
    return computeAllVillagesFestivalSupply(
      villages,
      FESTIVALS,
      migrantProfiles,
      assumptions,
      rateMultiplier
    );
  }, [villages, migrantProfiles, assumptions, rateMultiplier]);

  // 2. Base LPI Demand to calculate harvest gaps
  const lpiResult = useMemo(() => {
    return computeLPI(villages, farms, workers, CROP_OPERATIONS, jobs, forecast, assumptions, {
      enableWeatherCompression: true,
      farmShifts: {},
    });
  }, [villages, farms, workers, jobs, forecast, assumptions]);

  // Transform LPI demand for overlap engine
  const { demandByVillageDate, baseSupplyByVillageDate } = useMemo(() => {
    const dem: Record<string, Record<string, number>> = {};
    const sup: Record<string, Record<string, number>> = {};

    for (const v of villages) {
      dem[v.id] = {};
      sup[v.id] = {};
    }

    for (const hm of lpiResult.heatmaps) {
      for (const d of hm.days) {
        if (!dem[hm.villageId]) dem[hm.villageId] = {};
        if (!sup[hm.villageId]) sup[hm.villageId] = {};
        dem[hm.villageId][d.date] = d.demand;
        sup[hm.villageId][d.date] = d.supply;
      }
    }

    return { demandByVillageDate: dem, baseSupplyByVillageDate: sup };
  }, [villages, lpiResult]);

  // 3. Harvest Overlap Analysis
  const overlaps = useMemo(() => {
    return computeFestivalHarvestOverlap(
      villageSupplies,
      FESTIVALS,
      demandByVillageDate,
      baseSupplyByVillageDate
    );
  }, [villageSupplies, demandByVillageDate, baseSupplyByVillageDate]);

  // 4. Combined Daily Presence vs Deficit Chart Data
  const chartData = useMemo(() => {
    const allDates = lpiResult.heatmaps[0]?.days.map((d) => d.date) || [];

    return allDates.map((dateStr) => {
      let totalReturneeSupply = 0;
      let totalHarvestDeficit = 0;

      for (const v of villages) {
        if (selectedVillageId === 'all' || selectedVillageId === v.id) {
          const ret = supplyLookup[v.id]?.[dateStr] || 0;
          totalReturneeSupply += ret;

          const dem = demandByVillageDate[v.id]?.[dateStr] || 0;
          const sup = baseSupplyByVillageDate[v.id]?.[dateStr] || 0;
          if (dem > sup) {
            totalHarvestDeficit += dem - sup;
          }
        }
      }

      return {
        date: formatDateShort(dateStr),
        rawDate: dateStr,
        deficit: Math.round(totalHarvestDeficit),
        returneeSupply: Math.round(totalReturneeSupply),
        netDeficit: Math.max(0, Math.round(totalHarvestDeficit - totalReturneeSupply)),
      };
    });
  }, [lpiResult, villages, selectedVillageId, supplyLookup, demandByVillageDate, baseSupplyByVillageDate]);

  // Handle Survey Submit
  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSurveyResponse({
      festivals: surveyFestivals,
      daysStayed: surveyDays,
      willingLocal: surveyWilling,
      minDailyWage: surveyWage,
      keyPerk: surveyPerk,
    });
    setSurveySubmitted(true);
    setTimeout(() => setSurveySubmitted(false), 4000);
  };

  // Handle New Short-Stint Offer
  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const newOffer: ShortStintOffer = {
      id: `offer-${Date.now()}`,
      farmId: farms[0]?.id || 'f-1',
      operation: newOfferOp,
      startDate: newOfferStart,
      endDate: newOfferEnd,
      wagePerDay: newOfferWage,
      perks: newOfferPerks.split(',').map((p) => p.trim()),
      slotsAvailable: newOfferSlots,
    };
    addShortStintOffer(newOffer);
    setShowOfferModal(false);
  };

  // Kanban status groups
  const kanbanColumns: { id: Pledge['status']; label: string; color: string }[] = [
    { id: 'interested', label: 'Interested', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { id: 'pledged', label: 'Pledged Stint', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { id: 'confirmed', label: 'Confirmed (T-48h)', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { id: 'arrived', label: 'Arrived in Village', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    { id: 'worked', label: 'Worked & Paid', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Purpose */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-brand-600" />
              <span>{t.festival.title}</span>
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              {t.festival.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AssumptionBadge assumptionKey="festivalLocalWorkShare" />
            <AssumptionBadge assumptionKey="willingnessFactorYes" />
          </div>
        </div>

        {/* Hypothesis Notice Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">{t.festival.hypothesisBanner}</span>
            <p className="text-amber-800 text-xs mt-0.5">
              {t.festival.approximateDates} Survey ground-truthing calibrates willingness rates and prevents over-promising local farm capacity.
            </p>
          </div>
        </div>
      </div>

      {/* Sensitivity Slider & Festival Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-brand-600" />
                <span>{t.festival.sensitivitySlider}</span>
              </span>
              <span className="font-extrabold text-brand-700 px-2 py-0.5 bg-brand-50 border border-brand-200 rounded-md">
                {(rateMultiplier * 100).toFixed(0)}% of Baseline ({rateMultiplier.toFixed(2)}x)
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.8"
              step="0.1"
              value={rateMultiplier}
              onChange={(e) => setRateMultiplier(parseFloat(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              aria-label="Return Rate Multiplier"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Conservative (20%)</span>
              <span>Baseline (100%)</span>
              <span>Optimistic Surge (180%)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label htmlFor="village-filter" className="block text-xs font-semibold text-slate-600 mb-1">
                Filter Village
              </label>
              <select
                id="village-filter"
                value={selectedVillageId}
                onChange={(e) => setSelectedVillageId(e.target.value)}
                className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:ring-1 focus:ring-brand-500 min-h-touch"
              >
                <option value="all">All 6 Villages (Block Aggregate)</option>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Festival Cards Horizontal Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 border-t border-slate-100">
          {FESTIVALS.map((f) => {
            const isSelected = selectedFestivalId === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFestivalId(f.id)}
                className={`p-2.5 rounded-lg border text-left transition-all min-h-touch flex flex-col justify-between ${
                  isSelected
                    ? 'bg-brand-50/70 border-brand-400 ring-2 ring-brand-400/30'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{f.name}</span>
                    <span className="text-[10px] text-amber-700 font-semibold px-1 py-0.2 bg-amber-100 rounded">
                      ~Approx
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {formatDateShort(f.date)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-2 font-medium">
                  {f.leadDays}d lead • {f.stayDays}d stay
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chart: Migrant Returnee Presence vs Harvest Deficit */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              <span>{t.festival.presenceChartTitle}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Notice how the green returnee supply peak cushions the red harvest labour deficit during late October and early November.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              Harvest Deficit (Person-Days)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              Returnee Available Supply
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDeficit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val: any, name: any) => [
                  `${val} person-days`,
                  name === 'deficit' ? 'Harvest Deficit' : 'Returnee Supply',
                ]}
                labelFormatter={(_, payload) => {
                  const item = payload?.[0]?.payload;
                  return item ? `Date: ${item.date} (${item.rawDate})` : '';
                }}
              />
              <Area
                type="monotone"
                dataKey="deficit"
                stroke="#e11d48"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDeficit)"
                name="deficit"
              />
              <Area
                type="monotone"
                dataKey="returneeSupply"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorSupply)"
                name="returneeSupply"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Harvest Gap Overlap Analysis Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{t.festival.overlapTitle}</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {overlaps.length} Deficit Windows Analyzed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {overlaps.slice(0, 6).map((ov, idx) => (
            <div
              key={`${ov.villageId}-${ov.festivalId}-${idx}`}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-brand-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {ov.villageName} • {ov.festivalName}
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {ov.coveragePct}% Covered
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800 mt-2.5 leading-snug">
                  {ov.headlineSummary}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
                  <div>
                    <span className="block text-[11px] text-slate-400">Peak Window</span>
                    <span className="font-bold text-slate-700">
                      {formatDateShort(ov.windowStart)} - {formatDateShort(ov.windowEnd)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">Gap vs Supply</span>
                    <span className="font-bold text-slate-700">
                      {ov.harvestDeficitPersonDays} pd / +{ov.returneeSupplyPersonDays} pd
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Target Action:</span>
                <span className="text-xs font-bold text-brand-600 hover:text-brand-800 cursor-pointer">
                  Pre-Book Short Stint →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-Commitment Short-Stint Offers & Pledge Kanban */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-600" />
              <span>{t.festival.precommitTitle}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Farmers post guaranteed short-stint gigs (5-8 days) with assured perks. Returning migrants claim or pledge slots before boarding their train home.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowOfferModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs min-h-touch"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.festival.postOfferBtn}</span>
          </button>
        </div>

        {/* Short-Stint Offers Available */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {shortStintOffers.map((offer) => {
            const relatedPledges = pledges.filter((p) => p.offerId === offer.id);
            const slotsFilled = relatedPledges.length;

            return (
              <div
                key={offer.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{offer.operation}</span>
                    <span className="text-xs font-black text-brand-700">
                      {formatINR(offer.wagePerDay)}/day
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {formatDateShort(offer.startDate)} to {formatDateShort(offer.endDate)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {offer.perks.map((perk, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded"
                      >
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">
                    {slotsFilled} / {offer.slotsAvailable} slots pledged
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      const msg = getFestivalWhatsAppReminder('Sunil Kumar', 'Diwali', offer, lang);
                      navigator.clipboard.writeText(msg);
                      setCopiedLink(offer.id);
                      setTimeout(() => setCopiedLink(null), 3000);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded min-h-[36px]"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedLink === offer.id ? 'Copied wa.me!' : 'WhatsApp Stint'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Kanban Board */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Migrant Returnee Pledge Pipeline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {kanbanColumns.map((col) => {
              const colPledges = pledges.filter((p) => p.status === col.id);

              return (
                <div
                  key={col.id}
                  className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 flex flex-col min-h-[220px]"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800">{col.label}</span>
                    <span className="text-xs font-extrabold px-1.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                      {colPledges.length}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {colPledges.map((p) => {
                      const migrant = migrantProfiles.find((m) => m.id === p.migrantId);
                      const homeVillage = villages.find((v) => v.id === migrant?.homeVillageId);

                      return (
                        <div
                          key={p.id}
                          className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-brand-400 transition-all text-xs"
                        >
                          <div className="font-bold text-slate-900">
                            Migrant #{p.migrantId.replace('mig-', '')} ({migrant?.workCity || 'Delhi'})
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Home: {homeVillage?.name || 'Rampur'} • {migrant?.sector || 'Construction'}
                          </div>

                          {/* Quick advance status dropdown */}
                          <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">Move status:</span>
                            <select
                              value={p.status}
                              onChange={(e) =>
                                updatePledgeStatus(p.id, e.target.value as Pledge['status'])
                              }
                              className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700"
                            >
                              <option value="interested">Interested</option>
                              <option value="pledged">Pledged</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="arrived">Arrived</option>
                              <option value="worked">Worked</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}

                    {colPledges.length === 0 && (
                      <div className="text-[11px] text-slate-400 text-center py-6">
                        No workers in this stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Field Validation Survey Form */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-brand-600" />
              <span>{t.festival.surveyTitle.replace('{n}', surveyResponses.length.toString())}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical ground-truthing form for Gram Panchayat coordinators to record returning workers' real availability and wage thresholds.
            </p>
          </div>
          {surveySubmitted && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
              ✓ Survey Recorded & Calibrated!
            </span>
          )}
        </div>

        <form onSubmit={handleSurveySubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Festival Visited
            </label>
            <select
              value={surveyFestivals[0] || 'fest-diwali'}
              onChange={(e) => setSurveyFestivals([e.target.value])}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 min-h-touch"
            >
              {FESTIVALS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({formatDateShort(f.date)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Days Stayed in Village
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={surveyDays}
              onChange={(e) => setSurveyDays(parseInt(e.target.value) || 7)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 min-h-touch"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Willing for Paid Local Farm Stint?
            </label>
            <select
              value={surveyWilling}
              onChange={(e) => setSurveyWilling(e.target.value as 'yes' | 'maybe' | 'no')}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 min-h-touch"
            >
              <option value="yes">Yes (Eager for income)</option>
              <option value="maybe">Maybe (Depends on wage & perks)</option>
              <option value="no">No (Strictly family time)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Minimum Daily Wage Demanded (₹)
            </label>
            <input
              type="number"
              min="300"
              max="1000"
              step="20"
              value={surveyWage}
              onChange={(e) => setSurveyWage(parseInt(e.target.value) || 450)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 min-h-touch"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Key Incentive or Perk Reported
            </label>
            <input
              type="text"
              value={surveyPerk}
              onChange={(e) => setSurveyPerk(e.target.value)}
              placeholder="e.g. Daily cash payment, Midday family meal, Short 5-hour shifts"
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 min-h-touch"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md min-h-touch"
            >
              <Send className="w-4 h-4" />
              <span>{t.festival.surveySubmit}</span>
            </button>
          </div>
        </form>

        {/* Existing Survey Entries Table */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 mb-2">Recent Recorded Survey Feedback</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-2">ID</th>
                  <th className="p-2">Stay Length</th>
                  <th className="p-2">Willingness</th>
                  <th className="p-2">Min Wage</th>
                  <th className="p-2">Key Reported Perk</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {surveyResponses.map((sr) => (
                  <tr key={sr.id} className="hover:bg-slate-50/50">
                    <td className="p-2 font-mono text-[11px] text-slate-500">{sr.id}</td>
                    <td className="p-2 font-semibold text-slate-800">{sr.daysStayed} days</td>
                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          sr.willingLocal === 'yes'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sr.willingLocal === 'maybe'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sr.willingLocal.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2 font-bold text-slate-800">{formatINR(sr.minDailyWage)}</td>
                    <td className="p-2 text-slate-600">{sr.keyPerk}</td>
                    <td className="p-2 text-slate-400 text-[11px]">{sr.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Post New Short-Stint Offer */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Post Guaranteed Short-Stint Stint</h3>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Crop Operation</label>
                <input
                  type="text"
                  value={newOfferOp}
                  onChange={(e) => setNewOfferOp(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newOfferStart}
                    onChange={(e) => setNewOfferStart(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newOfferEnd}
                    onChange={(e) => setNewOfferEnd(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Daily Wage (₹)</label>
                  <input
                    type="number"
                    value={newOfferWage}
                    onChange={(e) => setNewOfferWage(parseInt(e.target.value) || 450)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slots Available</label>
                  <input
                    type="number"
                    value={newOfferSlots}
                    onChange={(e) => setNewOfferSlots(parseInt(e.target.value) || 5)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Guaranteed Perks (comma-separated)
                </label>
                <input
                  type="text"
                  value={newOfferPerks}
                  onChange={(e) => setNewOfferPerks(e.target.value)}
                  placeholder="e.g. Free lunch, Evening cash payout"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  Publish Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

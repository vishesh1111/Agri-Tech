import {
  Festival,
  MigrantProfile,
  Village,
  Assumptions,
  Pledge,
  ShortStintOffer,
} from '../types';
import { addDaysIso, diffDaysIso } from '../dates';

export type FestivalPresenceDay = {
  date: string;
  festivalId: string;
  festivalName: string;
  expectedPresence: number; // headcount in village
  addedLaborSupply: number; // person-days available for farm work
};

export type VillageFestivalSupply = {
  villageId: string;
  villageName: string;
  totalMigrantsTracked: number;
  expectedReturneesByFestival: Record<string, number>;
  presenceTimeline: Record<string, number>; // date -> presence count
  addedSupplyTimeline: Record<string, number>; // date -> added person-days
};

export type HarvestGapOverlap = {
  festivalId: string;
  festivalName: string;
  villageId: string;
  villageName: string;
  windowStart: string;
  windowEnd: string;
  harvestDeficitPersonDays: number;
  returneeSupplyPersonDays: number;
  coveragePct: number;
  headlineSummary: string;
};

export type SurveyResponse = {
  id: string;
  timestamp: string;
  festivalsReturned: string[];
  daysStayed: number;
  willingLocal: 'yes' | 'maybe' | 'no';
  minDailyWage: number;
  keyIncentive: string;
};

/**
 * Get willingness coefficient from status
 */
export function getWillingnessFactor(
  willing: 'yes' | 'maybe' | 'no',
  assumptions: Assumptions
): number {
  switch (willing) {
    case 'yes':
      return assumptions.willingnessFactorYes;
    case 'maybe':
      return assumptions.willingnessFactorMaybe;
    case 'no':
      return assumptions.willingnessFactorNo;
  }
}

/**
 * Compute expected returnees for each village and festival
 * expectedReturnees = sum over migrants of (returnProb * willingnessFactor)
 */
export function computeExpectedReturnees(
  villageId: string,
  festival: Festival,
  migrants: MigrantProfile[],
  assumptions: Assumptions,
  rateMultiplier: number = 1.0
): number {
  const villageMigrants = migrants.filter((m) => m.homeVillageId === villageId && m.consent);
  let total = 0;

  for (const m of villageMigrants) {
    const rawProb = m.returnProbByFestival[festival.id] ?? 0.3;
    const adjustedProb = Math.min(1.0, Math.max(0.0, rawProb * rateMultiplier));
    const factor = getWillingnessFactor(m.willingLocal, assumptions);
    total += adjustedProb * factor;
  }

  return total;
}

/**
 * Compute day-by-day presence curve for a festival
 * Triangular distribution over [date - leadDays, date - 1] peaking 2 days before.
 * Departures spread over [date + 1, date + stayDays].
 */
export function computeFestivalPresenceCurve(
  festival: Festival,
  expectedReturnees: number,
  localWorkShare: number
): FestivalPresenceDay[] {
  if (expectedReturnees <= 0) return [];

  const days: FestivalPresenceDay[] = [];
  const festDate = festival.date;
  const leadDays = festival.leadDays;
  const stayDays = festival.stayDays;

  const startDate = addDaysIso(festDate, -leadDays);
  const endDate = addDaysIso(festDate, stayDays);
  const totalSpan = diffDaysIso(startDate, endDate) + 1;

  // Triangular weights
  // Arrival window: [festDate - leadDays ... festDate - 1]
  // Peak: 2 days before festival (or festDate - 1 if leadDays is small)
  const peakDate = addDaysIso(festDate, -Math.min(2, Math.max(1, leadDays - 1)));

  for (let i = 0; i < totalSpan; i++) {
    const d = addDaysIso(startDate, i);
    let presenceFraction = 0;

    if (d < peakDate) {
      // Ascending ramp from arrival
      const daysFromStart = diffDaysIso(startDate, d) + 1;
      const rampLen = diffDaysIso(startDate, peakDate) + 1;
      presenceFraction = daysFromStart / rampLen;
    } else if (d <= addDaysIso(festDate, 1)) {
      // Peak holiday plateau
      presenceFraction = 1.0;
    } else {
      // Descending departure ramp
      const departureDaysRemaining = diffDaysIso(d, endDate) + 1;
      const departureSpan = diffDaysIso(addDaysIso(festDate, 1), endDate);
      presenceFraction = Math.max(0, departureDaysRemaining / (departureSpan + 1));
    }

    const presence = Math.round(expectedReturnees * presenceFraction * 10) / 10;
    const addedSupply = Math.round(presence * localWorkShare * 10) / 10;

    days.push({
      date: d,
      festivalId: festival.id,
      festivalName: festival.name,
      expectedPresence: presence,
      addedLaborSupply: addedSupply,
    });
  }

  return days;
}

/**
 * Compute aggregate festival labor supply for all villages across a horizon
 */
export function computeAllVillagesFestivalSupply(
  villages: Village[],
  festivals: Festival[],
  migrants: MigrantProfile[],
  assumptions: Assumptions,
  rateMultiplier: number = 1.0
): {
  villageSupplies: VillageFestivalSupply[];
  supplyLookup: Record<string, Record<string, number>>; // villageId -> date -> addedPersonDays
} {
  const villageSupplies: VillageFestivalSupply[] = [];
  const supplyLookup: Record<string, Record<string, number>> = {};

  for (const v of villages) {
    const vMigrants = migrants.filter((m) => m.homeVillageId === v.id && m.consent);
    const expectedByFest: Record<string, number> = {};
    const presenceTimeline: Record<string, number> = {};
    const addedSupplyTimeline: Record<string, number> = {};

    supplyLookup[v.id] = {};

    for (const fest of festivals) {
      const returnees = computeExpectedReturnees(v.id, fest, vMigrants, assumptions, rateMultiplier);
      expectedByFest[fest.id] = Math.round(returnees * 10) / 10;

      const curve = computeFestivalPresenceCurve(fest, returnees, assumptions.festivalLocalWorkShare);
      for (const p of curve) {
        presenceTimeline[p.date] = (presenceTimeline[p.date] || 0) + p.expectedPresence;
        addedSupplyTimeline[p.date] = (addedSupplyTimeline[p.date] || 0) + p.addedLaborSupply;
        supplyLookup[v.id][p.date] = (supplyLookup[v.id][p.date] || 0) + p.addedLaborSupply;
      }
    }

    villageSupplies.push({
      villageId: v.id,
      villageName: v.name,
      totalMigrantsTracked: vMigrants.length,
      expectedReturneesByFestival: expectedByFest,
      presenceTimeline,
      addedSupplyTimeline,
    });
  }

  return { villageSupplies, supplyLookup };
}

/**
 * Overlap analysis: compare festival returnee supply with LPI harvest gaps
 */
export function computeFestivalHarvestOverlap(
  villageSupplies: VillageFestivalSupply[],
  festivals: Festival[],
  demandByVillageDate: Record<string, Record<string, number>>, // villageId -> date -> demand
  baseSupplyByVillageDate: Record<string, Record<string, number>> // villageId -> date -> baseSupply
): HarvestGapOverlap[] {
  const overlaps: HarvestGapOverlap[] = [];

  for (const vSupply of villageSupplies) {
    for (const fest of festivals) {
      const windowStart = addDaysIso(fest.date, -fest.leadDays);
      const windowEnd = addDaysIso(fest.date, fest.stayDays);
      const span = diffDaysIso(windowStart, windowEnd) + 1;

      let deficit = 0;
      let returneeSupply = 0;

      for (let i = 0; i < span; i++) {
        const d = addDaysIso(windowStart, i);
        const dem = demandByVillageDate[vSupply.villageId]?.[d] || 0;
        const sup = baseSupplyByVillageDate[vSupply.villageId]?.[d] || 0;
        if (dem > sup) {
          deficit += dem - sup;
        }
        returneeSupply += vSupply.addedSupplyTimeline[d] || 0;
      }

      const coveragePct = deficit > 0 ? Math.min(100, Math.round((returneeSupply / deficit) * 100)) : 100;

      if (deficit > 5) {
        overlaps.push({
          festivalId: fest.id,
          festivalName: fest.name,
          villageId: vSupply.villageId,
          villageName: vSupply.villageName,
          windowStart,
          windowEnd,
          harvestDeficitPersonDays: Math.round(deficit),
          returneeSupplyPersonDays: Math.round(returneeSupply),
          coveragePct,
          headlineSummary: `Returnees could cover ${coveragePct}% of the ${deficit} person-day harvest gap during ${fest.name} in ${vSupply.villageName}.`,
        });
      }
    }
  }

  return overlaps;
}

/**
 * WhatsApp reminder templates in English and Hindi
 */
export function getFestivalWhatsAppReminder(
  migrantName: string,
  festivalName: string,
  offerDetails: ShortStintOffer,
  lang: 'en' | 'hi'
): string {
  if (lang === 'hi') {
    return `नमस्ते ${migrantName} जी, ${festivalName} की अग्रिम शुभकामनाएं! गांव लौटते समय आपके लिए ${offerDetails.operation} में ${offerDetails.startDate} से ${offerDetails.endDate} तक ₹${offerDetails.wagePerDay}/दिन पर काम आरक्षित है। सुविधाएं: ${offerDetails.perks.join(', ')}। कृपया अपनी उपस्थिति पक्की करें।`;
  }
  return `Hello ${migrantName}, greetings for ${festivalName}! A pre-booked harvest stint for ${offerDetails.operation} is reserved for you from ${offerDetails.startDate} to ${offerDetails.endDate} at ₹${offerDetails.wagePerDay}/day. Perks: ${offerDetails.perks.join(', ')}. Please confirm your arrival.`;
}

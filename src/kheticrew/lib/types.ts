export type Village = {
  id: string;
  name: string;
  xKm: number;
  yKm: number;
};

export type Farm = {
  id: string;
  villageId: string;
  ownerName: string;
  acres: number;
  crop: 'paddy' | 'wheat' | 'mustard';
  sowingDate: string; // ISO date 'YYYY-MM-DD'
  sowingFlexDays: number;
};

export type Worker = {
  id: string;
  name: string;
  villageId: string;
  skillLevel: 0 | 1 | 2;
  history: { booked: number; showed: number };
  unavailableDates: string[];
  isMigrant: boolean;
  certifiedForHazard: boolean;
};

export type Crew = {
  id: string;
  name: string;
  size: number;
  skills: string[];
  homeVillageId: string;
  availableFrom: string;
  availableTo: string;
  maxTravelKm: number;
};

export type Job = {
  id: string;
  farmId: string;
  operation: string;
  crewSizeMin: number;
  crewSizeMax: number;
  durationDays: number;
  earliestStart: string;
  latestStart: string;
  skillRequired: 0 | 1 | 2;
  wagePerPersonDay: number;
  weatherSensitive: boolean;
};

export type CropOperation = {
  cropId: string;
  operation: string;
  startOffsetDays: number;
  durationDays: number;
  personDaysPerAcre: number;
  skill: 0 | 1 | 2;
  shape: 'uniform' | 'peak';
  weatherSensitive: boolean;
};

export type MicroTask = {
  id: string;
  operation: string;
  name: string;
  load: 1 | 2 | 3; // 1: light, 2: medium, 3: heavy
  skillLevel: 0 | 1 | 2;
  hazard: boolean;
  workShare: number; // 0 to 1
  throughputUnitsPerHour: number;
};

export type MicroProfile = {
  workerId: string;
  windows: { start: string; end: string; days: string[] }[];
  maxLoad: 1 | 2 | 3;
  maxDistanceKm: number;
  maxHoursPerDay: number;
  canWorkSeated: boolean;
  adultVerified: true;
};

export type Festival = {
  id: string;
  name: string;
  date: string;
  leadDays: number;
  stayDays: number;
  verified: boolean;
};

export type MigrantProfile = {
  id: string;
  homeVillageId: string;
  workCity: string;
  sector: string;
  returnProbByFestival: Record<string, number>;
  willingLocal: 'yes' | 'maybe' | 'no';
  minDailyWage: number;
  consent: boolean;
};

export type Pledge = {
  id: string;
  migrantId: string;
  offerId: string;
  status: 'interested' | 'pledged' | 'confirmed' | 'arrived' | 'worked';
};

export type ShortStintOffer = {
  id: string;
  farmId: string;
  operation: string;
  startDate: string;
  endDate: string;
  wagePerDay: number;
  perks: string[];
  slotsAvailable: number;
};

export type WeatherForecast = {
  date: string; // YYYY-MM-DD
  rainProb: number; // 0 to 1
  isHeatWave: boolean;
  maxTempC: number;
  rainfallMm: number;
};

export type Assumptions = {
  // Overbooking
  priorBetaAlpha: number; // 8
  priorBetaBeta: number; // 2
  oddsRainFactor: number; // 0.8
  oddsFestivalFactor: number; // 0.7
  oddsDistanceFactor: number; // 0.9
  oddsEarlyStartFactor: number; // 0.9
  oddsHighWageFactor: number; // 1.15
  oddsConfirmedFactor: number; // 3.0
  oddsNoResponseFactor: number; // 0.6
  reportingAllowanceRatio: number; // 0.3
  shortfallPenaltyRatio: number; // 1.5
  defaultConfidenceTarget: number; // 0.95

  // LPI
  baseWorkerAvailability: number; // 0.75
  wageElasticity: number; // 0.6
  minimumDailyWage: number; // 380 ₹
  lpiCapRatio: number; // 3.0
  rainWeatherWindowDays: number; // 3

  // Crew Relay
  relayMaxIdleDays: number; // 3
  relayMaxFreeTravelKm: number; // 8
  relayUrgencyWeight: number; // 0.40
  relayGapWeight: number; // 0.25
  relayDistanceWeight: number; // 0.20
  relayWageWeight: number; // 0.15

  // Micro-Shift
  microShiftPremiumRate: number; // 0.10 (10%)
  heatIndexThreshold: number; // 40
  maxDailyHoursDefault: number; // 6
  restMinutesBetweenSlots: number; // 30

  // Festival
  festivalLocalWorkShare: number; // 0.50
  willingnessFactorYes: number; // 0.85
  willingnessFactorMaybe: number; // 0.40
  willingnessFactorNo: number; // 0.0
};

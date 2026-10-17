import { Assumptions } from './types';

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  // Overbooking Engine
  priorBetaAlpha: 8,
  priorBetaBeta: 2,
  oddsRainFactor: 0.8,
  oddsFestivalFactor: 0.7,
  oddsDistanceFactor: 0.9,
  oddsEarlyStartFactor: 0.9,
  oddsHighWageFactor: 1.15,
  oddsConfirmedFactor: 3.0,
  oddsNoResponseFactor: 0.6,
  reportingAllowanceRatio: 0.3,
  shortfallPenaltyRatio: 1.5,
  defaultConfidenceTarget: 0.95,

  // Labour Pressure Index (LPI)
  baseWorkerAvailability: 0.75,
  wageElasticity: 0.6,
  minimumDailyWage: 380, // ₹ per day statutory guideline
  lpiCapRatio: 3.0,
  rainWeatherWindowDays: 3,

  // Crew Relay
  relayMaxIdleDays: 3,
  relayMaxFreeTravelKm: 8,
  relayUrgencyWeight: 0.40,
  relayGapWeight: 0.25,
  relayDistanceWeight: 0.20,
  relayWageWeight: 0.15,

  // Micro-Shift
  microShiftPremiumRate: 0.10,
  heatIndexThreshold: 38, // °C
  maxDailyHoursDefault: 6,
  restMinutesBetweenSlots: 30,

  // Festival Return
  festivalLocalWorkShare: 0.50,
  willingnessFactorYes: 0.85,
  willingnessFactorMaybe: 0.40,
  willingnessFactorNo: 0.0,
};

export type AssumptionMeta = {
  key: keyof Assumptions;
  labelEn: string;
  labelHi: string;
  category: 'Overbooking' | 'LPI' | 'Relay' | 'MicroShift' | 'Festival';
  descriptionEn: string;
  descriptionHi: string;
  min: number;
  max: number;
  step: number;
  unit: string;
};

export const ASSUMPTIONS_META: AssumptionMeta[] = [
  {
    key: 'priorBetaAlpha',
    labelEn: 'Prior Beta Alpha (Show-up weight)',
    labelHi: 'प्रारंभिक उपस्थिति भार (अल्फा)',
    category: 'Overbooking',
    descriptionEn: 'Represents prior positive observations. Prior mean = 8 / (8 + 2) = 80%.',
    descriptionHi: 'पूर्व सकारात्मक उपस्थिति का भार। प्रारंभिक औसत 80%।',
    min: 1,
    max: 20,
    step: 1,
    unit: 'pts',
  },
  {
    key: 'oddsRainFactor',
    labelEn: 'Rain Odds Multiplier (>60% rain)',
    labelHi: 'बारिश ऑड्स गुणक (>60% बारिश)',
    category: 'Overbooking',
    descriptionEn: 'Multiplier on attendance odds when heavy rain is forecast.',
    descriptionHi: 'भारी बारिश के पूर्वानुमान पर उपस्थिति ऑड्स का गुणक।',
    min: 0.1,
    max: 1.0,
    step: 0.05,
    unit: 'x',
  },
  {
    key: 'oddsFestivalFactor',
    labelEn: 'Festival Proximity Odds Multiplier (<=2 days)',
    labelHi: 'त्योहार निकटता ऑड्स गुणक',
    category: 'Overbooking',
    descriptionEn: 'Multiplier on attendance odds within 2 days of a major festival.',
    descriptionHi: 'त्योहार के 2 दिन पहले या बाद उपस्थिति में बदलाव।',
    min: 0.1,
    max: 1.0,
    step: 0.05,
    unit: 'x',
  },
  {
    key: 'reportingAllowanceRatio',
    labelEn: 'Reporting Allowance Ratio for Standby Workers',
    labelHi: 'स्टैंडबाय कामगारों का रिपोर्टिंग भत्ता अनुपात',
    category: 'Overbooking',
    descriptionEn: 'Fraction of daily wage paid to extra workers turned away on standby.',
    descriptionHi: 'अतिरिक्त स्टैंडबाय कामगारों को दिया जाने वाला मुआवजा अनुपात।',
    min: 0.1,
    max: 1.0,
    step: 0.05,
    unit: 'x wage',
  },
  {
    key: 'shortfallPenaltyRatio',
    labelEn: 'Shortfall Penalty Ratio (Delay/Harvest Risk)',
    labelHi: 'मजदूर कमी दंड अनुपात (फसल हानि जोखिम)',
    category: 'Overbooking',
    descriptionEn: 'Cost per missing worker below Nmin due to harvest spoilage risk.',
    descriptionHi: 'न्यूनतम आवश्यकता से कम मजदूर होने पर फसल क्षति का अनुमानित मूल्य।',
    min: 0.5,
    max: 3.0,
    step: 0.1,
    unit: 'x wage',
  },
  {
    key: 'baseWorkerAvailability',
    labelEn: 'Baseline Worker Availability Factor',
    labelHi: 'आधारभूत श्रमिक उपलब्धता दर',
    category: 'LPI',
    descriptionEn: 'Fraction of available pool active on an unconstrained day.',
    descriptionHi: 'बिना किसी बाधा के काम के लिए तैयार श्रमिकों का अनुपात।',
    min: 0.4,
    max: 1.0,
    step: 0.05,
    unit: 'fraction',
  },
  {
    key: 'wageElasticity',
    labelEn: 'LPI Wage Elasticity Factor',
    labelHi: 'मजदूरी संवेदनशीलता दर',
    category: 'LPI',
    descriptionEn: 'Projected wage surge rate when demand ratio exceeds 0.8.',
    descriptionHi: 'मांग-आपूर्ति अनुपात 0.8 से ऊपर जाने पर मजदूरी दर में वृद्धि।',
    min: 0.1,
    max: 1.5,
    step: 0.05,
    unit: 'elasticity',
  },
  {
    key: 'minimumDailyWage',
    labelEn: 'Statutory / Recommended Minimum Daily Wage',
    labelHi: 'न्यूनतम दैनिक मजदूरी दर',
    category: 'LPI',
    descriptionEn: 'Floor wage per person-day across the block.',
    descriptionHi: 'ब्लॉक में न्यूनतम मजदूरी दर का पैमाना।',
    min: 250,
    max: 600,
    step: 10,
    unit: '₹',
  },
  {
    key: 'relayMaxFreeTravelKm',
    labelEn: 'Relay Same-Day Travel Distance Limit',
    labelHi: 'रिले उसी दिन यात्रा दूरी सीमा',
    category: 'Relay',
    descriptionEn: 'Up to this distance, travel takes 0 days. Beyond it takes 1 day.',
    descriptionHi: 'इस दूरी तक यात्रा में 0 दिन लगते हैं, अधिक होने पर 1 दिन।',
    min: 3,
    max: 15,
    step: 1,
    unit: 'km',
  },
  {
    key: 'microShiftPremiumRate',
    labelEn: 'Micro-Shift Hourly Wage Premium',
    labelHi: 'माइक्रो-शिफ्ट प्रति घंटा प्रीमियम दर',
    category: 'MicroShift',
    descriptionEn: 'Hourly incentive above pro-rata daily wage (e.g. +10%).',
    descriptionHi: 'छोटे स्लॉट के लिए प्रति घंटा मिलने वाला अतिरिक्त प्रोत्साहन।',
    min: 0.0,
    max: 0.3,
    step: 0.02,
    unit: 'x',
  },
  {
    key: 'festivalLocalWorkShare',
    labelEn: 'Festival Returnee Local Work Share',
    labelHi: 'त्योहार पर लौटे कामगारों की स्थानीय काम भागीदारी',
    category: 'Festival',
    descriptionEn: 'Proportion of returning migrants willing to take local paid stint.',
    descriptionHi: 'घर लौटे प्रवासी कामगारों का अनुपात जो स्थानीय काम के लिए उपलब्ध हैं।',
    min: 0.1,
    max: 0.9,
    step: 0.05,
    unit: 'fraction',
  },
];

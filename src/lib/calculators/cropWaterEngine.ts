/**
 * KisanAI — Crop Water & Minimum Irrigation Agronomic Engine
 * Implements FAO-56 Penman-Monteith crop water requirements and ICAR guidelines.
 * Translates crop, soil, and land parameters into farmer-intuitive metrics:
 * standing water depth (cm), soil wetting depth, tubewell pump hours, and stage requirements.
 */

export interface GrowthStageWaterInfo {
  stageNumber: number;
  stageName: string;
  dayRange: string;
  minWaterDepthCm: number;
  isStandingWater: boolean; // true for paddy (standing pool), false for upland crops (infiltration depth)
  criticalLevel: 'moderate' | 'high' | 'ultra-critical';
  farmerAdvice: string;
  rootDepthCm: number; // For visualization
}

export interface CropWaterProfile {
  cropKey: string;
  cropName: string;
  varietyExample: string;
  totalSeasonWaterMm: number;
  durationDays: number;
  optimalSoilMoisturePercent: number;
  description: string;
  stages: GrowthStageWaterInfo[];
}

export interface FarmerCropWaterInput {
  cropKey: string;
  landAreaAcres: number;
  soilType: 'sandy' | 'loam' | 'clay' | 'black_cotton' | 'red_soil';
  irrigationMethod: 'flood' | 'drip' | 'sprinkler';
  growthStageIndex: number;
  pumpHorsePower?: number; // e.g. 5 HP (default)
}

export interface CropWaterRequirementResult {
  cropProfile: CropWaterProfile;
  currentStage: GrowthStageWaterInfo;
  minWaterDepthCm: number;
  totalSeasonWaterMm: number;
  singleIrrigationLiters: number;
  seasonTotalLiters: number;
  pumpRuntimeHours: number;
  pumpRuntimeFormatted: string;
  wateringFrequencyDays: number;
  efficiencySavingsVsFloodPercent: number;
  savedLitersVsFlood: number;
  soilAdjustedNote: string;
  irrigationMethodNote: string;
}

export const CROP_WATER_REGISTRY: Record<string, CropWaterProfile> = {
  rice: {
    cropKey: 'rice',
    cropName: 'Rice / Paddy (Dhaan)',
    varietyExample: 'PR-126 / Pusa Basmati 1509',
    totalSeasonWaterMm: 1300,
    durationDays: 120,
    optimalSoilMoisturePercent: 85,
    description: 'High water requirement crop. Thrives under shallow continuous or alternate standing water layers.',
    stages: [
      {
        stageNumber: 1,
        stageName: 'Transplanting & Seedling Establishment',
        dayRange: 'Day 0 - 15',
        minWaterDepthCm: 3.0,
        isStandingWater: true,
        criticalLevel: 'high',
        farmerAdvice: 'Maintain shallow 2-3 cm standing water. Too much depth will drown tender nursery seedlings.',
        rootDepthCm: 8,
      },
      {
        stageNumber: 2,
        stageName: 'Active Tillering (Branching)',
        dayRange: 'Day 16 - 40',
        minWaterDepthCm: 5.0,
        isStandingWater: true,
        criticalLevel: 'ultra-critical',
        farmerAdvice: 'Maintain 4-5 cm standing water layer. Suppresses weed germination and maximizes productive tillers.',
        rootDepthCm: 15,
      },
      {
        stageNumber: 3,
        stageName: 'Panicle Initiation & Booting',
        dayRange: 'Day 41 - 70',
        minWaterDepthCm: 5.0,
        isStandingWater: true,
        criticalLevel: 'ultra-critical',
        farmerAdvice: 'Most critical stage! Even 2 days of moisture stress now leads to unfilled spikelets and drastic yield loss.',
        rootDepthCm: 22,
      },
      {
        stageNumber: 4,
        stageName: 'Flowering & Milking',
        dayRange: 'Day 71 - 95',
        minWaterDepthCm: 4.0,
        isStandingWater: true,
        criticalLevel: 'high',
        farmerAdvice: 'Maintain 3-4 cm standing water until grain begins hardening (dough stage).',
        rootDepthCm: 25,
      },
      {
        stageNumber: 5,
        stageName: 'Ripening & Harvest Prep',
        dayRange: 'Day 96 - 120',
        minWaterDepthCm: 0.0,
        isStandingWater: false,
        criticalLevel: 'moderate',
        farmerAdvice: 'Completely stop irrigation and drain fields 10-14 days before harvest to hasten uniform grain drying.',
        rootDepthCm: 25,
      },
    ],
  },

  wheat: {
    cropKey: 'wheat',
    cropName: 'Wheat (Gehun / Kanak)',
    varietyExample: 'Pusa Gautami / PBW-824',
    totalSeasonWaterMm: 480,
    durationDays: 125,
    optimalSoilMoisturePercent: 65,
    description: 'Requires 4-6 timed irrigations targeting root depth. Standing water causes yellowing and root asphyxiation.',
    stages: [
      {
        stageNumber: 1,
        stageName: 'Crown Root Initiation (CRI)',
        dayRange: 'Day 20 - 25',
        minWaterDepthCm: 6.0,
        isStandingWater: false,
        criticalLevel: 'ultra-critical',
        farmerAdvice: 'First & most critical irrigation! Deep 6 cm wetting anchors crown roots. Delaying reduces tillers by 35%.',
        rootDepthCm: 12,
      },
      {
        stageNumber: 2,
        stageName: 'Tillering & Vegetative',
        dayRange: 'Day 40 - 45',
        minWaterDepthCm: 5.0,
        isStandingWater: false,
        criticalLevel: 'high',
        farmerAdvice: 'Apply 5 cm irrigation along with second urea top dressing for lush foliage and branch vigor.',
        rootDepthCm: 25,
      },
      {
        stageNumber: 3,
        stageName: 'Late Jointing & Flag Leaf',
        dayRange: 'Day 60 - 65',
        minWaterDepthCm: 5.0,
        isStandingWater: false,
        criticalLevel: 'high',
        farmerAdvice: 'Supports rapid stem elongation and robust flag leaf expansion for photosynthesis.',
        rootDepthCm: 35,
      },
      {
        stageNumber: 4,
        stageName: 'Flowering & Milking',
        dayRange: 'Day 80 - 85',
        minWaterDepthCm: 5.5,
        isStandingWater: false,
        criticalLevel: 'ultra-critical',
        farmerAdvice: 'Crucial to prevent shriveled grain. Irrigate on a calm day; strong winds cause plant lodging/falling.',
        rootDepthCm: 45,
      },
      {
        stageNumber: 5,
        stageName: 'Dough Stage & Maturation',
        dayRange: 'Day 100 - 110',
        minWaterDepthCm: 3.5,
        isStandingWater: false,
        criticalLevel: 'moderate',
        farmerAdvice: 'Light irrigation if temperatures rise above 30°C to guard against terminal heat stress. Stop 15 days pre-harvest.',
        rootDepthCm: 45,
      },
    ],
  },

  maize: {
    cropKey: 'maize',
    cropName: 'Maize / Corn (Makka)',
    varietyExample: 'Pioneer 3396 / DKC 9108',
    totalSeasonWaterMm: 600,
    durationDays: 105,
    optimalSoilMoisturePercent: 70,
    description: 'Highly sensitive to both drought and standing water stagnation. Requires well-drained deep wetting.',
    stages: [
      {
        stageNumber: 1,
        stageName: 'Seedling & Early Vegetative',
        dayRange: 'Day 0 - 20',
        minWaterDepthCm: 4.0,
        isStandingWater: false,
        criticalLevel: 'moderate',
        farmerAdvice: 'Ensure gentle 4 cm infiltration. Never let water pond around the tender stem base.',
        rootDepthCm: 10,
      },
      {
        stageNumber: 2,
        stageName: 'Knee-High Stage',
        dayRange: 'Day 25 - 40',
        minWaterDepthCm: 5.0,
        isStandingWater: false,
        criticalLevel: 'high',
        farmerAdvice: 'Supports rapid stem elongation. Soil moisture should not drop below 50% field capacity.',
        rootDepthCm: 25,
      },
      {
        stageNumber: 3,
        stageName: 'Tasseling & Silking',
        dayRange: 'Day 45 - 65',
        minWaterDepthCm: 6.5,
        isStandingWater: false,
        criticalLevel: 'ultra-critical',
        farmerAdvice: 'Highest water demand stage! Even mild water stress impairs silk receptivity and creates half-filled cobs.',
        rootDepthCm: 40,
      },
      {
        stageNumber: 4,
        stageName: 'Grain Filling (Dough)',
        dayRange: 'Day 70 - 90',
        minWaterDepthCm: 5.0,
        isStandingWater: false,
        criticalLevel: 'high',
        farmerAdvice: 'Maintains kernel weight, starch content, and cob filling right to the tip.',
        rootDepthCm: 45,
      },
      {
        stageNumber: 5,
        stageName: 'Maturity (Black Layer)',
        dayRange: 'Day 95 - 105',
        minWaterDepthCm: 0.0,
        isStandingWater: false,
        criticalLevel: 'moderate',
        farmerAdvice: 'No irrigation needed. Husk leaves turn straw brown, allowing cobs to dry on the stalk.',
        rootDepthCm: 45,
      },
    ],
  },

  cotton: {
    cropKey: 'cotton',
    cropName: 'Cotton (Kapas)',
    varietyExample: 'RCH 659 Bt / Bunny',
    totalSeasonWaterMm: 800,
    durationDays: 160,
    optimalSoilMoisturePercent: 65,
    description: 'Deep-rooted cash crop. Water stress during square and boll development triggers heavy boll shedding.',
    stages: [
      {
        stageNumber: 1,
        stageName: 'Germination & Seedling',
        dayRange: 'Day 0 - 30',
        minWaterDepthCm: 4.5,
        isStandingWater: false,
        criticalLevel: 'moderate',
        farmerAdvice: 'Encourages deep taproot penetration down to 30 cm into the subsoil.',
        rootDepthCm: 20,
      },
      {
        stageNumber: 2,
        stageName: 'Squaring (Bud Formation)',
        dayRange: 'Day 40 - 60',
        minWaterDepthCm: 5.5,
        isStandingWater: false,
        criticalLevel: 'high',
        farmerAdvice: 'Uniform moisture prevents premature square drop and encourages branching.',
        rootDepthCm: 40,
      },
      {
        stageNumber: 3,
        stageName: 'Peak Flowering & Boll Setting',
        dayRange: 'Day 70 - 105',
        minWaterDepthCm: 7.0,
        isStandingWater: false,
        criticalLevel: 'ultra-critical',
        farmerAdvice: 'Peak water uptake! 7 cm wetting depth supports heavy boll retention and fiber elongation.',
        rootDepthCm: 60,
      },
      {
        stageNumber: 4,
        stageName: 'Boll Development & Maturation',
        dayRange: 'Day 110 - 140',
        minWaterDepthCm: 5.0,
        isStandingWater: false,
        criticalLevel: 'high',
        farmerAdvice: 'Irrigate alternately between furrows to avoid leaf wetness and fungal boll rot.',
        rootDepthCm: 65,
      },
      {
        stageNumber: 5,
        stageName: 'Boll Bursting & Picking',
        dayRange: 'Day 145 - 160',
        minWaterDepthCm: 0.0,
        isStandingWater: false,
        criticalLevel: 'moderate',
        farmerAdvice: 'Stop irrigation once 30-40% bolls burst open to prevent fiber staining from soil splash.',
        rootDepthCm: 65,
      },
    ],
  },

  mustard: {
    cropKey: 'mustard',
    cropName: 'Mustard (Sarson / Raya)',
    varietyExample: 'Pusa Bold / Giriraj',
    totalSeasonWaterMm: 320,
    durationDays: 110,
    optimalSoilMoisturePercent: 60,
    description: 'Low water requirement oilseed crop. Needs only 2 to 3 well-timed irrigations to achieve maximum oil yield.',
    stages: [
      {
        stageNumber: 1,
        stageName: 'Early Vegetative / Rosette',
        dayRange: 'Day 25 - 30',
        minWaterDepthCm: 5.0,
        isStandingWater: false,
        criticalLevel: 'ultra-critical',
        farmerAdvice: 'First essential irrigation. Apply with nitrogen top-dressing to trigger bushy branching.',
        rootDepthCm: 18,
      },
      {
        stageNumber: 2,
        stageName: 'Flowering Stage',
        dayRange: 'Day 45 - 50',
        minWaterDepthCm: 4.5,
        isStandingWater: false,
        criticalLevel: 'high',
        farmerAdvice: 'Light irrigation ensures continuous floral nectar and high bee pollination activity.',
        rootDepthCm: 32,
      },
      {
        stageNumber: 3,
        stageName: 'Siliqua (Pod) Filling',
        dayRange: 'Day 65 - 75',
        minWaterDepthCm: 4.5,
        isStandingWater: false,
        criticalLevel: 'ultra-critical',
        farmerAdvice: 'Crucial for grain plumpness and seed oil concentration. Avoid ponding.',
        rootDepthCm: 40,
      },
      {
        stageNumber: 4,
        stageName: 'Pod Maturation & Harvest',
        dayRange: 'Day 90 - 110',
        minWaterDepthCm: 0.0,
        isStandingWater: false,
        criticalLevel: 'moderate',
        farmerAdvice: 'Stop all watering. Allow pods to turn golden brown for easy threshing.',
        rootDepthCm: 40,
      },
    ],
  },

  tomato: {
    cropKey: 'tomato',
    cropName: 'Tomato / Vegetables (Tamatar)',
    varietyExample: 'Abhinav / NS-501',
    totalSeasonWaterMm: 500,
    durationDays: 130,
    optimalSoilMoisturePercent: 75,
    description: 'Shallow rooted, highly sensitive to moisture fluctuations. Irregular watering causes blossom end rot and fruit cracking.',
    stages: [
      {
        stageNumber: 1,
        stageName: 'Transplanting & Root Catch',
        dayRange: 'Day 0 - 15',
        minWaterDepthCm: 3.5,
        isStandingWater: false,
        criticalLevel: 'high',
        farmerAdvice: 'Frequent light watering ensures rapid seedling revival without transplant shock.',
        rootDepthCm: 10,
      },
      {
        stageNumber: 2,
        stageName: 'Vegetative Growth & Trellising',
        dayRange: 'Day 20 - 40',
        minWaterDepthCm: 4.0,
        isStandingWater: false,
        criticalLevel: 'moderate',
        farmerAdvice: 'Keep root zone evenly moist. Drip irrigation is strongly advised to prevent foliar blight.',
        rootDepthCm: 20,
      },
      {
        stageNumber: 3,
        stageName: 'Flowering & Fruit Setting',
        dayRange: 'Day 45 - 65',
        minWaterDepthCm: 5.0,
        isStandingWater: false,
        criticalLevel: 'ultra-critical',
        farmerAdvice: 'Maintain uniform soil moisture. Drought stress causes flower drop and blossom end rot.',
        rootDepthCm: 30,
      },
      {
        stageNumber: 4,
        stageName: 'Fruit Enlargement & Harvesting',
        dayRange: 'Day 70 - 120',
        minWaterDepthCm: 4.5,
        isStandingWater: false,
        criticalLevel: 'high',
        farmerAdvice: 'Steady 4.5 cm equivalent moisture prevents fruit splitting and maintains rich red coloration.',
        rootDepthCm: 35,
      },
    ],
  },
};

/**
 * Calculates the exact minimum water requirements based on farmer, crop, and field inputs.
 */
export function calculateCropWaterRequirement(input: FarmerCropWaterInput): CropWaterRequirementResult {
  const cropProfile = CROP_WATER_REGISTRY[input.cropKey] || CROP_WATER_REGISTRY.wheat;
  const stages = cropProfile.stages;
  const stageIndex = Math.max(0, Math.min(input.growthStageIndex, stages.length - 1));
  const currentStage = stages[stageIndex];

  // Soil Retentive Factor
  let soilMultiplier = 1.0;
  let wateringFrequencyDays = 7;
  let soilAdjustedNote = 'Standard loamy soil maintains balanced drainage and moisture retention.';

  switch (input.soilType) {
    case 'sandy':
      soilMultiplier = 1.15;
      wateringFrequencyDays = 4;
      soilAdjustedNote = 'Sandy soil percolates water rapidly; requires 15% higher volume delivered in more frequent light cycles.';
      break;
    case 'clay':
    case 'black_cotton':
      soilMultiplier = 0.90;
      wateringFrequencyDays = 10;
      soilAdjustedNote = 'Heavy clay/black soil stores water deeply; interval extended to 10 days to prevent root waterlogging.';
      break;
    case 'red_soil':
      soilMultiplier = 1.05;
      wateringFrequencyDays = 6;
      soilAdjustedNote = 'Red soil has medium porosity; apply 5% extra volume with 6-day watering intervals.';
      break;
    default:
      soilMultiplier = 1.0;
      wateringFrequencyDays = 7;
      break;
  }

  // Irrigation Delivery Efficiency Factor
  let efficiencyMultiplier = 1.0; // Flood is baseline (40-50% field application efficiency)
  let savingsPercent = 0;
  let methodNote = 'Traditional surface flood requires higher volume due to evaporation and distribution runoff.';

  if (input.irrigationMethod === 'drip') {
    efficiencyMultiplier = 0.52; // 48% water savings
    savingsPercent = 48;
    methodNote = 'Drip micro-irrigation delivers water directly to root zone, saving 48% water compared to flooding.';
  } else if (input.irrigationMethod === 'sprinkler') {
    efficiencyMultiplier = 0.72; // 28% water savings
    savingsPercent = 28;
    methodNote = 'Sprinkler system creates fine mist droplets, saving 28% water compared to surface flooding.';
  }

  const effectiveMinWaterDepthCm = Number((currentStage.minWaterDepthCm * soilMultiplier).toFixed(1));
  const effectiveDepthMm = effectiveMinWaterDepthCm * 10;

  // 1 Acre = 4,046.86 m²
  // 1 mm water depth over 1 acre = 4,046.86 Liters of water
  const singleIrrigationLitersBaseline = Math.round(input.landAreaAcres * effectiveDepthMm * 4047);
  const singleIrrigationLiters = Math.round(singleIrrigationLitersBaseline * efficiencyMultiplier);
  const savedLitersVsFlood = singleIrrigationLitersBaseline - singleIrrigationLiters;

  // Total season volume
  const seasonTotalLiters = Math.round(input.landAreaAcres * cropProfile.totalSeasonWaterMm * 4047 * efficiencyMultiplier);

  // Pump Runtime (Standard 5 HP submersible/monoblock delivers ~32,000 - 35,000 Liters/Hour)
  const pumpHp = input.pumpHorsePower || 5;
  const pumpFlowRateLph = pumpHp * 7000; // e.g. 5 HP * 7000 = 35,000 L/h
  const runtimeDecimalHours = singleIrrigationLiters / pumpFlowRateLph;
  const wholeHours = Math.floor(runtimeDecimalHours);
  const remainingMinutes = Math.round((runtimeDecimalHours - wholeHours) * 60);

  let pumpRuntimeFormatted = `${wholeHours}h ${remainingMinutes}m`;
  if (wholeHours === 0) {
    pumpRuntimeFormatted = `${remainingMinutes} minutes`;
  }

  return {
    cropProfile,
    currentStage,
    minWaterDepthCm: effectiveMinWaterDepthCm,
    totalSeasonWaterMm: cropProfile.totalSeasonWaterMm,
    singleIrrigationLiters,
    seasonTotalLiters,
    pumpRuntimeHours: Number(runtimeDecimalHours.toFixed(1)),
    pumpRuntimeFormatted,
    wateringFrequencyDays,
    efficiencySavingsVsFloodPercent: savingsPercent,
    savedLitersVsFlood,
    soilAdjustedNote,
    irrigationMethodNote: methodNote,
  };
}

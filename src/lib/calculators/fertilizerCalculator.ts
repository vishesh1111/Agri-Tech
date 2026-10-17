import { FertilizerDosageRecommendation } from '../types';

export interface CropNutritionProfile {
  cropName: string;
  season: string;
  nKgPerHa: number;
  pKgPerHa: number;
  kKgPerHa: number;
  zincKgPerHa: number;
  compostTonnesPerHa: number;
  basalRatio: string;
  topDress1Ratio: string;
  topDress2Ratio: string;
  foliarSprayAdvice: string;
}

const cropProfiles: Record<string, CropNutritionProfile> = {
  'Wheat': {
    cropName: 'Wheat',
    season: 'Rabi',
    nKgPerHa: 120.0,
    pKgPerHa: 60.0,
    kKgPerHa: 40.0,
    zincKgPerHa: 25.0,
    compostTonnesPerHa: 6.0,
    basalRatio: 'Full P & K + 1/3 N at Sowing',
    topDress1Ratio: '1/3 N at 1st CRI Irrigation (21 DAS)',
    topDress2Ratio: '1/3 N at Jointing / Tillering stage (45 DAS)',
    foliarSprayAdvice: 'Foliar 13:0:45 (Potassium Nitrate) 1.5kg/acre at grain filling to maximize grain weight.',
  },
  'Paddy / Rice': {
    cropName: 'Paddy / Rice',
    season: 'Kharif',
    nKgPerHa: 120.0,
    pKgPerHa: 60.0,
    kKgPerHa: 60.0,
    zincKgPerHa: 25.0,
    compostTonnesPerHa: 8.0,
    basalRatio: 'Full P + 50% K + 1/3 N at Puddling',
    topDress1Ratio: '1/3 N at Active Tillering (25-30 DAT)',
    topDress2Ratio: '1/3 N + 50% K at Panicle Initiation (50-55 DAT)',
    foliarSprayAdvice: 'Apply 25 kg Zinc Sulphate (21%) or 12 kg (33%) per ha to prevent Khaira disease.',
  },
  'Basmati Rice': {
    cropName: 'Basmati Rice',
    season: 'Kharif',
    nKgPerHa: 90.0,
    pKgPerHa: 40.0,
    kKgPerHa: 40.0,
    zincKgPerHa: 20.0,
    compostTonnesPerHa: 7.0,
    basalRatio: 'Full P + 50% K + 1/3 N at Transplanting',
    topDress1Ratio: '1/3 N at Tillering (21-25 DAT)',
    topDress2Ratio: '1/3 N at Panicle Emergence (45-50 DAT)',
    foliarSprayAdvice: 'Avoid excess nitrogen to prevent lodging and maintain aromatic grain elongation.',
  },
  'Cotton': {
    cropName: 'Cotton',
    season: 'Kharif',
    nKgPerHa: 150.0,
    pKgPerHa: 60.0,
    kKgPerHa: 75.0,
    zincKgPerHa: 25.0,
    compostTonnesPerHa: 10.0,
    basalRatio: 'Full P + 1/3 K + 1/4 N at Sowing',
    topDress1Ratio: '1/2 N + 1/3 K at Square Formation (40-45 DAS)',
    topDress2Ratio: '1/4 N + 1/3 K at Peak Flowering & Boll Setting (70-75 DAS)',
    foliarSprayAdvice: 'Foliar spray of 2% Magnesium Sulphate + 1% 13:0:45 at 75 & 90 DAS to prevent leaf reddening.',
  },
  'Sugarcane': {
    cropName: 'Sugarcane',
    season: 'Perennial',
    nKgPerHa: 250.0,
    pKgPerHa: 80.0,
    kKgPerHa: 100.0,
    zincKgPerHa: 30.0,
    compostTonnesPerHa: 15.0,
    basalRatio: 'Full P + 1/3 N + 1/3 K at Planting in furrows',
    topDress1Ratio: '1/3 N at Tillering (45-60 DAP)',
    topDress2Ratio: '1/3 N + 2/3 K at Formative Earthing Up (90-120 DAP)',
    foliarSprayAdvice: 'Ferrous sulphate (0.5%) foliar spray if yellow interveinal chlorosis develops on ratoon.',
  },
  'Maize': {
    cropName: 'Maize',
    season: 'Kharif / Rabi',
    nKgPerHa: 120.0,
    pKgPerHa: 60.0,
    kKgPerHa: 40.0,
    zincKgPerHa: 20.0,
    compostTonnesPerHa: 6.0,
    basalRatio: 'Full P & K + 1/3 N at Sowing',
    topDress1Ratio: '1/3 N at Knee-High Stage (30-35 DAS)',
    topDress2Ratio: '1/3 N at Tasseling / Silking (50-55 DAS)',
    foliarSprayAdvice: 'Apply Zinc Sulphate at sowing. Spray 19:19:19 @ 1% at knee-high stage.',
  },
  'Potato': {
    cropName: 'Potato',
    season: 'Rabi',
    nKgPerHa: 180.0,
    pKgPerHa: 100.0,
    kKgPerHa: 150.0,
    zincKgPerHa: 25.0,
    compostTonnesPerHa: 12.0,
    basalRatio: 'Full P + 1/2 K + 1/2 N at Planting',
    topDress1Ratio: '1/2 N + 1/2 K at Earthing Up (30-35 DAP)',
    topDress2Ratio: 'Foliar micronutrients at tuber bulking (55-60 DAP)',
    foliarSprayAdvice: 'High potassium requirement. Spray 0:0:50 (SOP) @ 1.5% twice during tuber enlargement.',
  },
  'Mustard': {
    cropName: 'Mustard',
    season: 'Rabi',
    nKgPerHa: 80.0,
    pKgPerHa: 40.0,
    kKgPerHa: 20.0,
    zincKgPerHa: 20.0,
    compostTonnesPerHa: 5.0,
    basalRatio: 'Full P, K & Sulphur + 1/2 N at Sowing',
    topDress1Ratio: '1/2 N at 1st Irrigation / Rosette stage (30 DAS)',
    topDress2Ratio: 'Foliar Boron spray at flowering initiation',
    foliarSprayAdvice: 'Apply 20-30 kg/ha elemental Sulphur or Gypsum as basal dose to maximize seed oil content.',
  },
};

export const FertilizerCalculator = {
  getAvailableCrops(): string[] {
    return Object.keys(cropProfiles);
  },

  calculateDosage(
    cropName: string,
    area: number,
    unit: string,
    soilNitrogenKgHa = 140,
    soilPhosphorusKgHa = 38,
    soilPotassiumKgHa = 200
  ): FertilizerDosageRecommendation {
    const profile = cropProfiles[cropName] || cropProfiles['Wheat'];

    // Convert area to Hectares
    const areaInHa = (() => {
      switch (unit.toLowerCase()) {
        case 'acres':
        case 'acre':
          return area * 0.404686;
        case 'bigha':
          return area * 0.161874;
        case 'guntha':
          return area * 0.010117;
        case 'cent':
          return area * 0.004047;
        case 'sq ft':
          return area / 107639.0;
        default:
          return area; // Hectares
      }
    })();

    // Soil test correction factors
    const nFactor = soilNitrogenKgHa < 120 ? 1.2 : soilNitrogenKgHa > 180 ? 0.8 : 1.0;
    const pFactor = soilPhosphorusKgHa < 30 ? 1.25 : soilPhosphorusKgHa > 50 ? 0.75 : 1.0;
    const kFactor = soilPotassiumKgHa < 150 ? 1.2 : soilPotassiumKgHa > 250 ? 0.8 : 1.0;

    const pureN = profile.nKgPerHa * areaInHa * nFactor;
    const pureP = profile.pKgPerHa * areaInHa * pFactor;
    const pureK = profile.kKgPerHa * areaInHa * kFactor;

    // Commercial Bag Conversions:
    // DAP (18:46:00) gives 46% P2O5 and 18% N
    const dapKg = (pureP / 0.46);
    const dapBags = Math.round((dapKg / 50.0) * 10) / 10;
    const nitrogenSuppliedByDap = dapKg * 0.18;

    // Remaining Nitrogen supplied by Urea (46% N, 45kg bags)
    const remainingN = Math.max(0.0, pureN - nitrogenSuppliedByDap);
    const ureaKg = (remainingN / 0.46);
    const ureaBags = Math.round((ureaKg / 45.0) * 10) / 10;

    // Potassium supplied by MOP (Muriate of Potash, 60% K2O, 50kg bags)
    const mopKg = (pureK / 0.60);
    const mopBags = Math.round((mopKg / 50.0) * 10) / 10;

    const zincKg = Math.round(profile.zincKgPerHa * areaInHa * 10) / 10;
    const compostTonnes = Math.round(profile.compostTonnesPerHa * areaInHa * 10) / 10;
    const nanoUreaBottles = Math.ceil(ureaBags * 0.5);

    // Cost estimation (Indian subsidized prices)
    const estimatedCost = Math.round(
      ureaBags * 266.5 + dapBags * 1350.0 + mopBags * 1700.0 + zincKg * 60.0
    );

    return {
      cropName: profile.cropName,
      fieldArea: area,
      areaUnit: unit,
      recommendedNpkRatio: `${Math.round(profile.nKgPerHa)} : ${Math.round(profile.pKgPerHa)} : ${Math.round(profile.kKgPerHa)} kg/ha`,
      pureNitrogenKg: Math.round(pureN * 10) / 10,
      purePhosphorusKg: Math.round(pureP * 10) / 10,
      purePotassiumKg: Math.round(pureK * 10) / 10,
      ureaBags45Kg: ureaBags,
      dapBags50Kg: dapBags,
      mopBags50Kg: mopBags,
      zincSulphateKg: zincKg,
      nanoUreaBottles,
      basalDoseSummary: `${profile.basalRatio} (${dapBags} bags DAP + ${mopBags} bags MOP)`,
      topDressing1Summary: `${profile.topDress1Ratio} (${Math.round((ureaBags * 0.5) * 10) / 10} bags Urea)`,
      topDressing2Summary: `${profile.topDress2Ratio} (${Math.round((ureaBags * 0.5) * 10) / 10} bags Urea)`,
      organicCompostRecommendedTonnes: compostTonnes,
      estimatedCostInr: estimatedCost,
      applicationAdvice: profile.foliarSprayAdvice,
    };
  },
};

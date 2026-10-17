/**
 * KisanAI — Data Entity Types
 * Ported from: app/src/main/java/com/example/data/model/Entities.kt
 * Every field, type, and default value matches the Android Kotlin data classes.
 */

// ── User & Farm ──

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  farmerId: string;
  aadhaarNumber: string;
  isPhoneVerified: boolean;
  age: number;
  gender: string;
  farmingType: string;
  selectedLanguage: string;
  isDarkTheme: boolean;
  houseNo: string;
  landmark: string;
  state: string;
  district: string;
  village: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  biggestProblem: string;
  primaryGoal: string;
  aiPreferredMode: string;
  isOnboardingComplete: boolean;
}

export interface Farm {
  id: string;
  name: string;
  farmType: string;
  location: string;
  houseNo: string;
  landmark: string;
  village: string;
  district: string;
  state: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  totalArea: number;
  unit: string;
  ownership: string;
  waterAvailability: string;
  electricityBackup: boolean;
  roadAccessible: boolean;
  soilType: string;
  terrain: string;
  primaryCropOrAnimal: string;
  isPrimary: boolean;
  healthScore: number;
  healthStatus: string;
  soilTestingStatus: string;
  fertilizerPractice: string;
  drainageCondition: string;
  waterSource: string;
  pestPressure: string;
  diseaseSigns: string;
  seedQuality: string;
  boundaryFencing: string;
  soilHealthScore: number;
  waterHealthScore: number;
  pestHealthScore: number;
  healthSummary: string;
  activeDay: number;
  isWeekUnlocked: boolean;
  lastTaskCycleTimestamp: number;
}

export interface LandParcel {
  id: string;
  farmId: string;
  name: string;
  area: number;
  areaAcres?: number;
  currentCrop: string;
  soilType: string;
  ph: number;
  phLevel?: number;
  nitrogen: number;
  nitrogenPpm?: number;
  phosphorus: number;
  phosphorusPpm?: number;
  potassium: number;
  potassiumPpm?: number;
  organicMatter: number;
  organicMatterPercent?: number;
  moisture: number;
  soilMoisturePercent?: number;
  overallSoilScore: number;
  verifiedSampleDate: string;
}

export interface CropRecord {
  id: string;
  farmId: string;
  parcelId: string;
  cropName: string;
  variety: string;
  growthStage: string;
  healthScore: number;
  sowingDate: string;
  expectedHarvest: string;
  expectedYieldPerAcre: number;
  expectedYield?: string | number;
  daysRemaining?: number;
  icon?: string;
  notes: string;
  isNewCrop: boolean;
  daysElapsed: number;
}

export interface IrrigationZone {
  id: string;
  farmId: string;
  zoneName: string;
  name?: string;
  cropName: string;
  isRunning: boolean;
  remainingMinutes: number;
  soilMoisture: number;
  currentMoisture?: number;
  targetMoisture?: number;
  flowRateLpm?: number;
  isSmartScheduleEnabled: boolean;
  scheduledTime: string;
  durationMinutes: number;
  activeDaysSummary: string;
  estimatedUsageLiters: number;
  waterUsedLiters?: number;
}

// ── Livestock & Poultry ──

export interface Livestock {
  id: string;
  farmId: string;
  name: string;
  tagId: string;
  type: string;
  breed: string;
  ageYears: number;
  barnSection: string;
  healthScore: number;
  lastVaccineDaysAgo: number;
  nextVaccineDays?: number;
  nextVaccineDaysAgo?: number;
  nextVaccineName?: string;
  nextVaccineInDays?: number;
  dailyMilkYield: number;
  status: string;
  insight: string;
  hasBleTracker: boolean;
  bleDeviceName: string;
  trackerDeviceId?: string;
  isInsideFence: boolean;
  distanceMetersFromCenter: number;
  distanceFromCenterM?: number;
  fenceRadiusMeters: number;
  fenceRadiusM?: number;
  lastPingTime: string;
  batteryPercent: number;
  trackerBatteryPercent?: number;
}

export interface PoultryBatch {
  id: string;
  farmId: string;
  farmName: string;
  batchName?: string;
  birdType: string;
  totalBirds: number;
  birdCount?: number;
  dailyEggs: number;
  dailyEggCount?: number;
  feedRemainingDays: number;
  ageWeeks?: number;
  status: string;
}

// ── Market & Finance ──

export interface MarketPrice {
  id: string;
  cropName: string;
  mandiName: string;
  pricePerQuintal: number;
  changePercent: number;
  isBestPrice: boolean;
  trend7Day: string;
  distanceKm: number;
}

export interface FinancialTransaction {
  id: string;
  farmId: string;
  title: string;
  category: string;
  amount: number;
  isIncome: boolean;
  dateDisplay: string;
  timestamp: number;
}

export interface FarmTask {
  id: string;
  farmId: string;
  title: string;
  description: string;
  priority: string;
  priorityLabel: string;
  targetArea: string;
  category: string;
  whyReason: string;
  isCompleted: boolean;
  estimatedTimeMinutes: number;
}

export interface ChatMessage {
  id?: number;
  isFromUser: boolean;
  text: string;
  timestamp: number;
  timeFormatted: string;
  attachedImageUri?: string | null;
  actionDoToday?: string | null;
  actionAvoid?: string | null;
  isDiagnosis: boolean;
  diagnosisTitle?: string | null;
  diagnosisConfidence?: number | null;
}

export interface AppNotification {
  id: string;
  farmId: string;
  farmName: string;
  title: string;
  message: string;
  severity: string;
  type?: string;
  timeFormatted: string;
  timestamp?: string;
  isRead: boolean;
  dateMillis: number;
}

// ── E-Commerce & Market ──

export interface AgriProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewsCount: number;
  packSize: string;
  packSizes?: string[];
  packSizesAvailable: string[];
  inStock: boolean;
  imageUrl: string;
  description: string;
  composition: string;
  recommendedDosage: string;
  isSubsidyEligible: boolean;
  deliveryDays: number;
}

export interface AgriShop {
  id: string;
  name: string;
  shopName?: string;
  shopType: string;
  address: string;
  distanceKm: number;
  rating: number;
  phone: string;
  phoneNumber?: string;
  isOpenNow: boolean;
  openingHours: string;
  openHours?: string;
  availableStock: string[];
  directionsSummary: string;
}

export interface CropSellListing {
  id: string;
  cropName: string;
  variety: string;
  quantityQuintals: number;
  askingPricePerQuintal: number;
  moisturePercent: number;
  moisturePercentage?: number;
  grade: string;
  pickupLocation: string;
  listedDate: string;
  status: string;
  activeBidsCount: number;
  offersReceivedCount?: number;
  highestBidPrice: number;
}

export interface CropBuyerBid {
  id: string;
  buyerName: string;
  buyerType: string;
  bidPricePerQuintal: number;
  offeredPricePerQuintal?: number;
  quantityDemandedQuintals?: number;
  totalAmount: number;
  pickupPromise: string;
  paymentTerms: string;
  rating: number;
}

export interface PhysicalMandi {
  id: string;
  name: string;
  mandiName?: string;
  district: string;
  state: string;
  distanceKm: number;
  todayArrivalsQuintals: number;
  todayArrivalQuintals?: number;
  openHours: string;
  modalPriceToday: number;
  currentModalPrice?: number;
  activeTradersCount: number;
  mspAssistanceCounter: boolean;
  helplinePhone: string;
  helplineNumber?: string;
}

export interface SoilTestingPackage {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  isGovtSubsidized: boolean;
  turnaroundDays: number;
  parametersTested: string[];
  description: string;
  sampleCollectionType: string;
  imageUrl: string;
}

// ── Government ──

export interface GovtScheme {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  subsidyAmount: string;
  eligibility: string;
  requiredDocuments: string[];
  applicationProcess: string;
  officialPortalUrl: string;
  isFeaturedHome?: boolean;
}

export interface GovtNewsItem {
  id: string;
  title: string;
  dateDisplay: string;
  category: string;
  summary: string;
  officialSource?: string;
}

// ── Weather ──

export interface HourlyForecast {
  timeLabel: string;
  tempC: number;
  rainChance: number;
  icon: string;
  windSpeedKm: number;
  et0Rate: number;
}

export interface DailyForecast {
  dayLabel: string;
  condition: string;
  tempMax: number;
  tempMin: number;
  rainPercent: number;
  rainMm: number;
  et0Sum: number;
}

export interface FarmWeather {
  farmId: string;
  farmName: string;
  locationName: string;
  state: string;
  currentTempC: number;
  currentTemp?: number;
  conditionText: string;
  conditionIcon: string;
  humidityPercent: number;
  windSpeedKm: number;
  rainProbabilityPercent: number;
  soilMoisturePercent: number;
  uvIndex: number;
  isSevereAlert: boolean;
  alertHeader: string | null;
  agriculturalAdvisory: string;
  hourlyForecast: HourlyForecast[];
  weeklyForecast: DailyForecast[];
  feelsLikeTempC: number;
  precipitationMm: number;
  dewPointC: number;
  dewPointCelsius?: number;
  windGustsKm: number;
  windDirection: string;
  surfacePressureHpa: number;
  soilTemperatureC: number;
  soilTemperature0to10cm?: number;
  et0EvapotranspirationMm: number;
  sprayingWindowStatus: string;
  sprayingReason: string;
  irrigationAdvice: string;
  diseaseRiskLevel: string;
  diseaseRiskReason: string;
  fieldWorkabilityScore: number;
  livestockThiScore: number;
  livestockThiIndex?: number;
  livestockStressLevel: string;
  livestockStressCategory?: string;
  lastUpdatedTime: string;
}

// ── AI / Diagnostics ──

export interface CropPathologyResult {
  diseaseName: string;
  category: string;
  confidence: string;
  confidencePercent?: number;
  severity: string;
  symptomsSummary: string;
  symptomsDescription?: string;
  treatmentSteps: string[];
  recommendedChemical: string;
  dosageRecommendation?: string;
  organicRemedy: string;
  soilAndNutrientAdvice: string;
  isGeminiVisionAnalyzed: boolean;
}

export interface CropGrowthVisionAnalysis {
  cropType: string;
  variety: string;
  growthStage: string;
  growthPercentage: number;
  daysGrown: number;
  totalDaysToMaturity: number;
  estimatedDaysRemaining: number;
  estimatedHarvestDate: string;
  diseaseStatus: string;
  healthScore: number;
  keyActionRecommendation: string;
  confidence: string;
}

// ── Soil Health ──

export interface SoilHealthRecord {
  id: string;
  farmId: string;
  dateLabel: string;
  timestamp: number;
  phLevel: number;
  moisturePercent: number;
  nitrogenKgHa: number;
  phosphorusKgHa: number;
  potassiumKgHa: number;
  organicCarbonPercent: number;
  soilTemperatureCelsius: number;
  electricalConductivityEc: number;
  source: string;
  sensorDeviceName: string;
  sensorBatteryPercent: number;
  notes: string;
}

// ── Crop Tasks ──

export interface CropTask {
  id: string;
  farmId: string;
  cropName: string;
  season: string;
  stage: string;
  taskTitle: string;
  taskDescription: string;
  isIrrigationReminder: boolean;
  isPlantingSchedule: boolean;
  recommendedDateDisplay: string;
  daysFromSowing: number;
  irrigationDurationMinutes: number;
  waterRequirementMm: number;
  fertilizerRecommendation: string;
  npkRatio: string;
  priority: string;
  isCompleted: boolean;
  createdTimestamp: number;
  dueTimestamp: number;
}

// ── Fertilizer Dosage ──

export interface FertilizerDosageRecommendation {
  cropName: string;
  fieldArea: number;
  areaUnit: string;
  recommendedNpkRatio: string;
  pureNitrogenKg: number;
  purePhosphorusKg: number;
  purePotassiumKg: number;
  ureaBags45Kg: number;
  dapBags50Kg: number;
  mopBags50Kg: number;
  zincSulphateKg: number;
  nanoUreaBottles: number;
  basalDoseSummary: string;
  topDressing1Summary: string;
  topDressing2Summary: string;
  organicCompostRecommendedTonnes: number;
  estimatedCostInr: number;
  applicationAdvice: string;
}

// ── Navigation ──

export type MainTab = 'home' | 'farms' | 'ai_agent' | 'market' | 'more';

export type SubScreen =
  | 'none'
  | 'soil_report'
  | 'irrigation_detail'
  | 'set_schedule'
  | 'irrigation_schedule'
  | 'livestock_list'
  | 'animal_detail'
  | 'add_animal'
  | 'finance_dashboard'
  | 'crop_doctor'
  | 'tasks_list'
  | 'notifications'
  | 'settings'
  | 'user_profile'
  | 'farmer_profile'
  | 'weather_report'
  | 'govt_schemes'
  | 'crop_growth_tracker'
  | 'cctv_monitor'
  | 'poultry_scanner'
  | 'mastitis_scanner'
  | 'officer_portal'
  | 'farms_manager'
  | 'market_soil_testing';


// ── Language ──

export interface AppLanguage {
  code: string;
  displayName: string;
  nativeName: string;
  letterIcon: string;
}

export const LANGUAGES: AppLanguage[] = [
  { code: 'en', displayName: 'English', nativeName: 'English', letterIcon: 'A' },
  { code: 'hi', displayName: 'Hindi', nativeName: 'हिंदी', letterIcon: 'अ' },
  { code: 'pa', displayName: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', letterIcon: 'ਪੰ' },
  { code: 'mr', displayName: 'Marathi', nativeName: 'मराठी', letterIcon: 'म' },
  { code: 'bn', displayName: 'Bengali', nativeName: 'বাংলা', letterIcon: 'বাং' },
];

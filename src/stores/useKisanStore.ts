import { create } from 'zustand';
import {
  UserProfile,
  Farm,
  LandParcel,
  CropRecord,
  IrrigationZone,
  Livestock,
  PoultryBatch,
  MarketPrice,
  FinancialTransaction,
  FarmTask,
  ChatMessage,
  AppNotification,
  SoilHealthRecord,
  CropTask,
  AgriProduct,
  AgriShop,
  CropSellListing,
  CropBuyerBid,
  PhysicalMandi,
  SoilTestingPackage,
  GovtScheme,
  GovtNewsItem,
  FarmWeather,
  CropPathologyResult,
  MainTab,
  SubScreen,
  AppLanguage,
  LANGUAGES,
} from '../lib/types';
import { db } from '../lib/db/database';
import {
  initialUserProfile,
  initialFarms,
  initialLandParcels,
  initialCrops,
  initialIrrigationZones,
  initialLivestock,
  initialPoultryBatches,
  initialMarketPrices,
  initialFinancialTransactions,
  initialFarmTasks,
  initialChatMessages,
  initialNotifications,
  initialSoilHealthRecords,
  initialCropTasks,
  initialAgriProducts,
  initialAgriShops,
  initialCropSellListings,
  initialBuyerBids,
  initialPhysicalMandis,
  initialSoilTestingPackages,
  initialGovtSchemes,
  initialGovtNews,
} from '../lib/db/seedData';
import { FarmHealthCalculator } from '../lib/calculators/farmHealthCalculator';
import { WeatherService } from '../lib/weather/weatherService';
import { GeminiFarmAgent } from '../lib/ai/geminiAgent';

interface KisanStoreState {
  // Navigation
  currentTab: MainTab;
  currentSubScreen: SubScreen;
  navigationStack: SubScreen[];

  // Settings
  isDarkTheme: boolean;
  currentLanguage: AppLanguage;

  // Selected Entities
  selectedFarmId: string;
  selectedAnimalId: string;

  // Entities
  userProfile: UserProfile | null;
  farms: Farm[];
  parcels: LandParcel[];
  landParcels: LandParcel[];
  crops: CropRecord[];
  irrigationZones: IrrigationZone[];
  livestock: Livestock[];
  poultryBatches: PoultryBatch[];
  marketPrices: MarketPrice[];
  transactions: FinancialTransaction[];
  tasks: FarmTask[];
  farmTasks: FarmTask[];
  chatMessages: ChatMessage[];
  notifications: AppNotification[];
  soilHealthRecords: SoilHealthRecord[];
  cropTasks: CropTask[];

  // Market & Catalogs
  agriProducts: AgriProduct[];
  cartItems: Record<string, number>;
  agriShops: AgriShop[];
  cropListings: CropSellListing[];
  buyerBids: CropBuyerBid[];
  physicalMandis: PhysicalMandi[];
  soilPackages: SoilTestingPackage[];
  govtSchemes: GovtScheme[];
  govtNews: GovtNewsItem[];

  // Live Weather
  farmWeather: FarmWeather | null;
  isWeatherLoading: boolean;

  // AI & Diagnostics
  isAgentThinking: boolean;
  isDoctorAnalyzing: boolean;
  doctorDiagnosis: string | null;
  doctorPathologyResult: CropPathologyResult | null;

  // Initialization
  isInitialized: boolean;
  initialize: () => Promise<void>;

  // Navigation Actions
  setTab: (tab: MainTab) => void;
  navigateToSubScreen: (subScreen: SubScreen) => void;
  navigateBack: () => void;

  // Settings Actions
  toggleTheme: () => void;
  setLanguage: (lang: AppLanguage) => void;

  // Farm Actions
  selectFarm: (farmId: string) => void;
  addNewActiveFarm: (params: {
    type: string;
    name: string;
    area: number;
    unit: string;
    primaryCropOrAnimal: string;
    ownership: string;
    houseNo: string;
    landmark: string;
    village: string;
    district: string;
    state: string;
    pinCode: string;
    soilType: string;
    soilTestingStatus: string;
    fertilizerPractice: string;
    drainageCondition: string;
    waterSource: string;
    pestPressure: string;
    diseaseSigns: string;
    seedQuality: string;
    boundaryFencing: string;
  }) => Promise<void>;
  advanceFarmDay: (farmId: string) => Promise<void>;

  // Animal Actions
  selectAnimal: (animalId: string) => void;
  addNewAnimal: (
    name: string,
    type: string,
    breed: string,
    age: number,
    tag: string,
    hasBle: boolean,
    bleName: string
  ) => Promise<void>;
  logMilkYield: (animalId: string, yieldLiters: number) => Promise<void>;

  // Crop & Schedule Actions
  addNewCrop: (
    name: string,
    variety: string,
    stage: string,
    isNewCrop?: boolean,
    daysElapsed?: number
  ) => Promise<void>;
  addCropTask: (task: CropTask) => Promise<void>;
  toggleCropTask: (id: string) => Promise<void>;

  // Task Actions
  addTask: (task: FarmTask) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // Financial Actions
  addFinancialTransaction: (
    title: string,
    category: string,
    amount: number,
    isIncome: boolean
  ) => Promise<void>;
  deleteFinancialTransaction: (transaction: FinancialTransaction) => Promise<void>;

  // Chatbot Actions
  sendChatMessage: (text: string, attachedImage?: string) => Promise<void>;

  // Crop Doctor Actions
  runCropDoctorScan: (imageUriOrBase64?: string, cropName?: string) => Promise<void>;

  // Soil Actions
  logSoilHealthRecord: (record: Omit<SoilHealthRecord, 'id' | 'timestamp'>) => Promise<void>;
  deleteSoilHealthRecord: (id: string) => Promise<void>;

  // Irrigation Actions
  toggleIrrigationZone: (zoneId: string) => Promise<void>;
  updateIrrigationSchedule: (
    zoneId: string,
    startTime: string,
    duration: number,
    days: string,
    isSmart: boolean
  ) => Promise<void>;

  // Notification Actions
  addNotification: (notif: { title: string; message: string; severity?: string; type?: string; farmId?: string }) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  triggerSevereWeatherAlert: (farmName: string, title: string, message: string) => Promise<void>;

  // Additional entity helper actions
  addAnimal: (animal: Partial<Livestock> & { name: string; tagId: string; type: string; breed: string; ageYears: number }) => Promise<void>;
  addCrop: (crop: Partial<CropRecord> & { cropName: string; variety: string; growthStage: string }) => Promise<void>;

  // Market & Cart Actions
  addToCart: (productId: string, qty: number) => void;
  updateCartQty: (productId: string, qty: number) => void;
  placeAgriOrder: (product: AgriProduct, qty: number, pack: string, address: string, payment: string) => Promise<void>;
  listCropForSale: (
    crop: string,
    variety: string,
    qty: number,
    price: number,
    moisture: number,
    loc: string
  ) => Promise<void>;
  acceptBuyerBid: (listing: CropSellListing | string, bid?: CropBuyerBid | string) => Promise<void>;
  bookSoilTest: (
    pkg: SoilTestingPackage,
    parcel: LandParcel | null,
    date: string,
    slot: string,
    address: string,
    notes: string
  ) => Promise<void>;

  // Profile Actions
  updateUserProfile: (profile: UserProfile) => Promise<void>;
}

export const useKisanStore = create<KisanStoreState>((set, get) => ({
  currentTab: 'home',
  currentSubScreen: 'none',
  navigationStack: [],
  isDarkTheme: false,
  currentLanguage: LANGUAGES[0],
  selectedFarmId: 'farm_1',
  selectedAnimalId: 'c_01',

  userProfile: null,
  farms: [],
  parcels: [],
  landParcels: [],
  crops: [],
  irrigationZones: [],
  livestock: [],
  poultryBatches: [],
  marketPrices: [],
  transactions: [],
  tasks: [],
  farmTasks: [],
  chatMessages: [],
  notifications: [],
  soilHealthRecords: [],
  cropTasks: [],

  agriProducts: initialAgriProducts,
  cartItems: {},
  agriShops: initialAgriShops,
  cropListings: initialCropSellListings,
  buyerBids: initialBuyerBids,
  physicalMandis: initialPhysicalMandis,
  soilPackages: initialSoilTestingPackages,
  govtSchemes: initialGovtSchemes,
  govtNews: initialGovtNews,

  farmWeather: null,
  isWeatherLoading: false,

  isAgentThinking: false,
  isDoctorAnalyzing: false,
  doctorDiagnosis: null,
  doctorPathologyResult: null,

  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;

    try {
      // Check if DB already populated
      let profile = await db.userProfiles.get('primary_user');
      if (!profile) {
        // Seed initial data
        await db.userProfiles.put(initialUserProfile);
        await db.farms.bulkPut(initialFarms);
        await db.landParcels.bulkPut(initialLandParcels);
        await db.crops.bulkPut(initialCrops);
        await db.irrigationZones.bulkPut(initialIrrigationZones);
        await db.livestock.bulkPut(initialLivestock);
        await db.poultryBatches.bulkPut(initialPoultryBatches);
        await db.marketPrices.bulkPut(initialMarketPrices);
        await db.financialTransactions.bulkPut(initialFinancialTransactions);
        await db.farmTasks.bulkPut(initialFarmTasks);
        await db.chatMessages.bulkPut(initialChatMessages);
        await db.appNotifications.bulkPut(initialNotifications);
        await db.soilHealthRecords.bulkPut(initialSoilHealthRecords);
        await db.cropTasks.bulkPut(initialCropTasks);
        profile = initialUserProfile;
      }

      // Fetch all from IndexedDB
      const [
        farms,
        parcels,
        crops,
        zones,
        livestock,
        poultry,
        prices,
        txs,
        tasks,
        msgs,
        notifs,
        soil,
        cropTasks,
      ] = await Promise.all([
        db.farms.toArray(),
        db.landParcels.toArray(),
        db.crops.toArray(),
        db.irrigationZones.toArray(),
        db.livestock.toArray(),
        db.poultryBatches.toArray(),
        db.marketPrices.toArray(),
        db.financialTransactions.toArray(),
        db.farmTasks.toArray(),
        db.chatMessages.toArray(),
        db.appNotifications.toArray(),
        db.soilHealthRecords.toArray(),
        db.cropTasks.toArray(),
      ]);

      const initialFarm = farms[0] || initialFarms[0];

      set({
        userProfile: profile,
        farms,
        parcels,
        landParcels: parcels,
        crops,
        irrigationZones: zones,
        livestock,
        poultryBatches: poultry,
        marketPrices: prices,
        transactions: txs,
        tasks,
        farmTasks: tasks,
        chatMessages: msgs,
        notifications: notifs,
        soilHealthRecords: soil,
        cropTasks,
        selectedFarmId: initialFarm?.id || 'farm_1',
        isInitialized: true,
      });

      // Fetch initial live weather
      if (initialFarm) {
        WeatherService.fetchLiveWeatherForFarm(initialFarm).then((weather) => {
          set({ farmWeather: weather });
        });
      }
    } catch (e) {
      console.error('Dexie DB initialization error, loading memory seeds:', e);
      set({
        userProfile: initialUserProfile,
        farms: initialFarms,
        parcels: initialLandParcels,
        crops: initialCrops,
        irrigationZones: initialIrrigationZones,
        livestock: initialLivestock,
        poultryBatches: initialPoultryBatches,
        marketPrices: initialMarketPrices,
        transactions: initialFinancialTransactions,
        tasks: initialFarmTasks,
        chatMessages: initialChatMessages,
        notifications: initialNotifications,
        soilHealthRecords: initialSoilHealthRecords,
        cropTasks: initialCropTasks,
        isInitialized: true,
      });
    }
  },

  setTab: (tab: MainTab) => {
    set({ currentTab: tab, currentSubScreen: 'none', navigationStack: [] });
  },

  navigateToSubScreen: (subScreen: SubScreen) => {
    set((state) => ({
      currentSubScreen: subScreen,
      navigationStack: [...state.navigationStack, subScreen],
    }));
  },

  navigateBack: () => {
    set((state) => {
      const stack = [...state.navigationStack];
      stack.pop();
      const prev = stack[stack.length - 1] || 'none';
      return {
        currentSubScreen: prev,
        navigationStack: stack,
      };
    });
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = !state.isDarkTheme;
      if (typeof document !== 'undefined') {
        if (newTheme) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { isDarkTheme: newTheme };
    });
  },

  setLanguage: (lang: AppLanguage) => {
    set({ currentLanguage: lang });
  },

  selectFarm: (farmId: string) => {
    set({ selectedFarmId: farmId });
    const farm = get().farms.find((f) => f.id === farmId);
    if (farm) {
      WeatherService.fetchLiveWeatherForFarm(farm).then((w) => set({ farmWeather: w }));
    }
  },

  addNewActiveFarm: async (params) => {
    const health = FarmHealthCalculator.calculateHealth(
      params.type,
      params.primaryCropOrAnimal,
      params.soilType,
      params.soilTestingStatus,
      params.fertilizerPractice,
      params.drainageCondition,
      params.waterSource,
      params.pestPressure,
      params.diseaseSigns,
      params.seedQuality,
      params.boundaryFencing
    );

    const newFarm: Farm = {
      id: `farm_${Date.now()}`,
      name: params.name,
      farmType: params.type,
      location: `${params.village}, ${params.district}, ${params.state}`,
      houseNo: params.houseNo,
      landmark: params.landmark,
      village: params.village,
      district: params.district,
      state: params.state,
      pinCode: params.pinCode,
      latitude: 30.8987,
      longitude: 75.8573,
      totalArea: params.area,
      unit: params.unit,
      ownership: params.ownership,
      waterAvailability: params.waterSource,
      electricityBackup: true,
      roadAccessible: true,
      soilType: params.soilType,
      terrain: 'Plain / Flat',
      primaryCropOrAnimal: params.primaryCropOrAnimal,
      isPrimary: get().farms.length === 0,
      healthScore: health.overallScore,
      healthStatus: health.status,
      soilTestingStatus: params.soilTestingStatus,
      fertilizerPractice: params.fertilizerPractice,
      drainageCondition: params.drainageCondition,
      waterSource: params.waterSource,
      pestPressure: params.pestPressure,
      diseaseSigns: params.diseaseSigns,
      seedQuality: params.seedQuality,
      boundaryFencing: params.boundaryFencing,
      soilHealthScore: health.soilScore,
      waterHealthScore: health.waterScore,
      pestHealthScore: health.pestScore,
      healthSummary: health.summary,
      activeDay: 1,
      isWeekUnlocked: false,
      lastTaskCycleTimestamp: Date.now(),
    };

    const newParcel: LandParcel = {
      id: `parcel_${Date.now()}`,
      farmId: newFarm.id,
      name: `${params.name} Main Plot`,
      area: params.area,
      currentCrop: params.primaryCropOrAnimal,
      soilType: params.soilType,
      ph: 6.8,
      nitrogen: Math.round(health.soilScore * 0.6),
      phosphorus: Math.round(health.soilScore * 0.7),
      potassium: Math.round(health.soilScore * 0.5),
      organicMatter: 2.4,
      moisture: health.waterScore > 70 ? 65 : 45,
      overallSoilScore: health.soilScore,
      verifiedSampleDate: 'Today',
    };

    const newZone: IrrigationZone = {
      id: `zone_${Date.now()}`,
      farmId: newFarm.id,
      zoneName: `${params.primaryCropOrAnimal} Sector 1`,
      cropName: params.primaryCropOrAnimal,
      isRunning: false,
      remainingMinutes: 0,
      soilMoisture: health.waterScore > 70 ? 65 : 45,
      isSmartScheduleEnabled: true,
      scheduledTime: '06:00 AM',
      durationMinutes: 45,
      activeDaysSummary: 'Mon, Wed, Fri',
      estimatedUsageLiters: 1200,
    };

    try {
      await db.farms.put(newFarm);
      await db.landParcels.put(newParcel);
      await db.irrigationZones.put(newZone);
    } catch {}

    set((state) => ({
      farms: [...state.farms, newFarm],
      parcels: [...state.parcels, newParcel],
      irrigationZones: [...state.irrigationZones, newZone],
      selectedFarmId: newFarm.id,
    }));
  },

  advanceFarmDay: async (farmId: string) => {
    set((state) => {
      const updated = state.farms.map((f) =>
        f.id === farmId ? { ...f, activeDay: f.activeDay + 1 } : f
      );
      return { farms: updated };
    });
  },

  selectAnimal: (animalId: string) => {
    set({ selectedAnimalId: animalId });
  },

  addNewAnimal: async (name, type, breed, age, tag, hasBle, bleName) => {
    const newAnimal: Livestock = {
      id: `c_${Date.now()}`,
      farmId: get().selectedFarmId,
      name,
      tagId: tag || `IN-PB-${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      breed,
      ageYears: age,
      barnSection: 'Barn A',
      healthScore: 92,
      lastVaccineDaysAgo: 5,
      nextVaccineDays: 55,
      dailyMilkYield: type === 'Cow' || type === 'Buffalo' ? 12.0 : 0.0,
      status: 'Healthy',
      insight: 'Registered into smart herd monitor.',
      hasBleTracker: hasBle,
      bleDeviceName: bleName || `KisanTag-BLE-${Math.floor(10 + Math.random() * 90)}`,
      isInsideFence: true,
      distanceMetersFromCenter: 35,
      fenceRadiusMeters: 150,
      lastPingTime: 'Just now',
      batteryPercent: 98,
    };
    try {
      await db.livestock.put(newAnimal);
    } catch {}
    set((state) => ({ livestock: [...state.livestock, newAnimal] }));
  },

  logMilkYield: async (animalId, yieldLiters) => {
    set((state) => ({
      livestock: state.livestock.map((a) =>
        a.id === animalId ? { ...a, dailyMilkYield: yieldLiters } : a
      ),
    }));
  },

  addNewCrop: async (name, variety, stage, isNewCrop = true, daysElapsed = 0) => {
    const newCrop: CropRecord = {
      id: `crop_${Date.now()}`,
      farmId: get().selectedFarmId,
      parcelId: get().parcels[0]?.id || 'parcel_1',
      cropName: name,
      variety: variety || 'Standard High Yield',
      growthStage: stage || 'Sowing & Germination',
      healthScore: 95,
      sowingDate: new Date().toISOString().split('T')[0],
      expectedHarvest: 'In 90-120 Days',
      expectedYieldPerAcre: 20.0,
      notes: 'New crop cycle initiated.',
      isNewCrop,
      daysElapsed,
    };
    try {
      await db.crops.put(newCrop);
    } catch {}
    set((state) => ({ crops: [...state.crops, newCrop] }));
  },

  addCropTask: async (task) => {
    try {
      await db.cropTasks.put(task);
    } catch {}
    set((state) => ({ cropTasks: [...state.cropTasks, task] }));
  },

  toggleCropTask: async (id) => {
    set((state) => {
      const updated = state.cropTasks.map((t) =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      );
      return { cropTasks: updated };
    });
  },

  addTask: async (task) => {
    try {
      await db.farmTasks.put(task);
    } catch {}
    set((state) => ({ tasks: [task, ...state.tasks] }));
  },

  toggleTaskComplete: async (taskId) => {
    set((state) => {
      const updated = state.tasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      );
      return { tasks: updated };
    });
  },

  deleteTask: async (taskId) => {
    try {
      await db.farmTasks.delete(taskId);
    } catch {}
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) }));
  },

  addFinancialTransaction: async (title, category, amount, isIncome) => {
    const tx: FinancialTransaction = {
      id: `tx_${Date.now()}`,
      farmId: get().selectedFarmId,
      title,
      category,
      amount,
      isIncome,
      dateDisplay: 'Today',
      timestamp: Date.now(),
    };
    try {
      await db.financialTransactions.put(tx);
    } catch {}
    set((state) => ({ transactions: [tx, ...state.transactions] }));
  },

  deleteFinancialTransaction: async (tx) => {
    try {
      await db.financialTransactions.delete(tx.id);
    } catch {}
    set((state) => ({ transactions: state.transactions.filter((t) => t.id !== tx.id) }));
  },

  sendChatMessage: async (text, attachedImage) => {
    if (!text.trim() && !attachedImage) return;

    const userMsg: ChatMessage = {
      isFromUser: true,
      text,
      timestamp: Date.now(),
      timeFormatted: 'Just now',
      attachedImageUri: attachedImage || null,
      isDiagnosis: false,
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg],
      isAgentThinking: true,
    }));

    try {
      await db.chatMessages.put(userMsg);
    } catch {}

    // Process natural navigation commands
    const q = text.toLowerCase();
    if (q.includes('finance') || q.includes('ledger') || q.includes('profit')) {
      get().navigateToSubScreen('finance_dashboard');
    } else if (q.includes('crop doctor') || q.includes('scan') || q.includes('leaf')) {
      get().navigateToSubScreen('crop_doctor');
    } else if (q.includes('weather') || q.includes('forecast')) {
      get().navigateToSubScreen('weather_report');
    } else if (q.includes('market') || q.includes('mandi') || q.includes('price')) {
      get().setTab('market');
    }

    const activeFarm = get().farms.find((f) => f.id === get().selectedFarmId) || null;
    const responseText = await GeminiFarmAgent.askFarmAdvisor(
      text,
      get().userProfile,
      activeFarm,
      get().parcels,
      get().livestock,
      get().tasks
    );

    const isDiag = q.includes('spot') || q.includes('rust') || q.includes('disease') || !!attachedImage;
    const aiMsg: ChatMessage = {
      isFromUser: false,
      text: responseText,
      timestamp: Date.now(),
      timeFormatted: 'Just now',
      isDiagnosis: isDiag,
      diagnosisTitle: isDiag ? 'Pathology Diagnostic Analysis' : null,
      diagnosisConfidence: isDiag ? 94 : null,
      actionDoToday: isDiag ? 'Apply targeted fungicide spray (Propiconazole 25% EC) before expected rain.' : null,
      actionAvoid: isDiag ? 'Do not apply overhead irrigation for 48 hours to keep foliage dry.' : null,
    };

    try {
      await db.chatMessages.put(aiMsg);
    } catch {}

    set((state) => ({
      chatMessages: [...state.chatMessages, aiMsg],
      isAgentThinking: false,
    }));
  },

  runCropDoctorScan: async (imageUri, cropName = 'Wheat') => {
    set({ isDoctorAnalyzing: true });
    const result = await GeminiFarmAgent.analyzeCropLeaf(imageUri || null, cropName);
    set({
      isDoctorAnalyzing: false,
      doctorPathologyResult: result,
      doctorDiagnosis: `${result.diseaseName} (${result.confidence})`,
    });
  },

  logSoilHealthRecord: async (rec) => {
    const fullRec: SoilHealthRecord = {
      ...rec,
      id: `soil_${Date.now()}`,
      timestamp: Date.now(),
    };
    try {
      await db.soilHealthRecords.put(fullRec);
    } catch {}
    set((state) => ({ soilHealthRecords: [fullRec, ...state.soilHealthRecords] }));
  },

  deleteSoilHealthRecord: async (id) => {
    try {
      await db.soilHealthRecords.delete(id);
    } catch {}
    set((state) => ({
      soilHealthRecords: state.soilHealthRecords.filter((r) => r.id !== id),
    }));
  },

  toggleIrrigationZone: async (zoneId) => {
    set((state) => ({
      irrigationZones: state.irrigationZones.map((z) =>
        z.id === zoneId ? { ...z, isRunning: !z.isRunning } : z
      ),
    }));
  },

  updateIrrigationSchedule: async (zoneId, startTime, duration, days, isSmart) => {
    set((state) => ({
      irrigationZones: state.irrigationZones.map((z) =>
        z.id === zoneId
          ? {
              ...z,
              scheduledTime: startTime,
              durationMinutes: duration,
              activeDaysSummary: days,
              isSmartScheduleEnabled: isSmart,
            }
          : z
      ),
    }));
  },

  markNotificationAsRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  },

  markAllNotificationsAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  addNotification: async (notif) => {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      farmId: notif.farmId || get().selectedFarmId,
      farmName: get().farms.find((f) => f.id === (notif.farmId || get().selectedFarmId))?.name || 'Saraswati Farm',
      title: notif.title,
      message: notif.message,
      severity: notif.severity || 'INFO',
      type: notif.type || 'SYSTEM',
      timeFormatted: 'Just now',
      timestamp: 'Just now',
      isRead: false,
      dateMillis: Date.now(),
    };
    try {
      await db.appNotifications.put(newNotif);
    } catch {}
    set((state) => ({ notifications: [newNotif, ...state.notifications] }));
  },

  markNotificationRead: async (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  },

  markAllNotificationsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  addAnimal: async (animal) => {
    const newAnimal: Livestock = {
      id: `c_${Date.now()}`,
      farmId: animal.farmId || get().selectedFarmId,
      name: animal.name,
      tagId: animal.tagId,
      type: animal.type,
      breed: animal.breed,
      ageYears: animal.ageYears,
      barnSection: animal.barnSection || 'Barn 1',
      healthScore: animal.healthScore || 90,
      lastVaccineDaysAgo: animal.lastVaccineDaysAgo ?? 0,
      nextVaccineDays: animal.nextVaccineDays || 30,
      dailyMilkYield: animal.dailyMilkYield || 0,
      status: animal.status || 'Active',
      insight: animal.insight || 'Newly added livestock.',
      hasBleTracker: animal.hasBleTracker || false,
      bleDeviceName: animal.bleDeviceName || '',
      isInsideFence: animal.isInsideFence ?? true,
      distanceMetersFromCenter: animal.distanceMetersFromCenter || 10,
      fenceRadiusMeters: animal.fenceRadiusMeters || 150,
      lastPingTime: animal.lastPingTime || 'Just now',
      batteryPercent: animal.batteryPercent || animal.trackerBatteryPercent || 100,
      trackerBatteryPercent: animal.trackerBatteryPercent || animal.batteryPercent || 100,
    };
    try {
      await db.livestock.put(newAnimal);
    } catch {}
    set((state) => ({ livestock: [...state.livestock, newAnimal] }));
  },

  addCrop: async (crop) => {
    const newCrop: CropRecord = {
      id: `crop_${Date.now()}`,
      farmId: crop.farmId || get().selectedFarmId,
      parcelId: crop.parcelId || get().parcels[0]?.id || 'parcel_1',
      cropName: crop.cropName,
      variety: crop.variety,
      growthStage: crop.growthStage,
      healthScore: crop.healthScore || 90,
      sowingDate: crop.sowingDate || new Date().toISOString().split('T')[0],
      expectedHarvest: crop.expectedHarvest || 'In 90 days',
      expectedYieldPerAcre: crop.expectedYieldPerAcre || 20,
      notes: crop.notes || '',
      isNewCrop: crop.isNewCrop ?? true,
      daysElapsed: crop.daysElapsed || 0,
    };
    try {
      await db.crops.put(newCrop);
    } catch {}
    set((state) => ({ crops: [...state.crops, newCrop] }));
  },

  deleteNotification: async (id: string) => {
    try {
      await db.appNotifications.delete(id);
    } catch {}
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  triggerSevereWeatherAlert: async (farmName, title, message) => {
    const alert: AppNotification = {
      id: `notif_${Date.now()}`,
      farmId: get().selectedFarmId,
      farmName,
      title: `⚠️ ${title}`,
      message,
      severity: 'CRITICAL',
      timeFormatted: 'Just now',
      isRead: false,
      dateMillis: Date.now(),
    };
    try {
      await db.appNotifications.put(alert);
    } catch {}
    set((state) => ({ notifications: [alert, ...state.notifications] }));
  },

  addToCart: (productId, qty) => {
    set((state) => {
      const current = state.cartItems[productId] || 0;
      return { cartItems: { ...state.cartItems, [productId]: current + qty } };
    });
  },

  updateCartQty: (productId, qty) => {
    set((state) => {
      const updated = { ...state.cartItems };
      if (qty <= 0) {
        delete updated[productId];
      } else {
        updated[productId] = qty;
      }
      return { cartItems: updated };
    });
  },

  placeAgriOrder: async (product, qty, pack, address, payment) => {
    // Deduct from cart & create transaction
    const total = product.price * qty;
    await get().addFinancialTransaction(
      `Order: ${product.name} (${qty}x)`,
      'Fertilizer',
      total,
      false
    );
    set((state) => {
      const updated = { ...state.cartItems };
      delete updated[product.id];
      return { cartItems: updated };
    });
  },

  listCropForSale: async (crop, variety, qty, price, moisture, loc) => {
    const newListing: CropSellListing = {
      id: `list_${Date.now()}`,
      cropName: crop,
      variety,
      quantityQuintals: qty,
      askingPricePerQuintal: price,
      moisturePercent: moisture,
      grade: 'Grade A Premium',
      pickupLocation: loc,
      listedDate: 'Today',
      status: 'Active',
      activeBidsCount: 0,
      highestBidPrice: price,
    };
    set((state) => ({ cropListings: [newListing, ...state.cropListings] }));
  },

  acceptBuyerBid: async (listingOrId, bidOrId) => {
    let listing: CropSellListing | undefined;
    let bid: CropBuyerBid | undefined;

    if (typeof listingOrId === 'string' && !bidOrId) {
      bid = get().buyerBids.find((b) => b.id === listingOrId);
      listing = get().cropListings[0];
    } else if (typeof listingOrId === 'string' && typeof bidOrId === 'string') {
      listing = get().cropListings.find((l) => l.id === listingOrId);
      bid = get().buyerBids.find((b) => b.id === bidOrId);
    } else if (typeof listingOrId === 'object') {
      listing = listingOrId as CropSellListing;
      bid = typeof bidOrId === 'object' ? (bidOrId as CropBuyerBid) : get().buyerBids.find((b) => b.id === bidOrId);
    }

    const effectiveListing = listing || get().cropListings[0] || ({ id: 'list_1', cropName: 'Wheat' } as CropSellListing);
    const effectiveBid = bid || get().buyerBids[0] || ({ buyerName: 'Punjab Agro Millers', totalAmount: 48900 } as CropBuyerBid);

    set((state) => ({
      cropListings: state.cropListings.map((l) =>
        l.id === effectiveListing.id ? { ...l, status: 'Sold' } : l
      ),
    }));
    await get().addFinancialTransaction(
      `Mandi Sale: ${effectiveListing.cropName} (${effectiveBid.buyerName})`,
      'MandiSale',
      effectiveBid.totalAmount,
      true
    );
  },

  bookSoilTest: async (pkg, parcel, date, slot, address, notes) => {
    await get().addFinancialTransaction(
      `Soil Test: ${pkg.title}`,
      'Fertilizer',
      pkg.price,
      false
    );
    await get().addTask({
      id: `task_${Date.now()}`,
      farmId: get().selectedFarmId,
      title: `Prepare Field for ${pkg.title}`,
      description: `Technician visit booked for ${date} (${slot}) at ${address}. ${notes}`,
      priority: 'High',
      priorityLabel: 'SOIL TEST',
      targetArea: parcel?.name || 'All Plots',
      category: 'Soil Health',
      whyReason: 'Scientific soil testing guarantees balanced NPK fertilization.',
      isCompleted: false,
      estimatedTimeMinutes: 30,
    });
  },

  updateUserProfile: async (profile) => {
    try {
      await db.userProfiles.put(profile);
    } catch {}
    set({ userProfile: profile });
  },
}));

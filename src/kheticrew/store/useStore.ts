import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Village,
  Farm,
  Worker,
  Crew,
  Job,
  WeatherForecast,
  MigrantProfile,
  MicroProfile,
  ShortStintOffer,
  Pledge,
  Assumptions,
} from '../lib/types';
import { DEFAULT_ASSUMPTIONS } from '../lib/config';
import { generateSeedData } from '../data/seed';
import { en } from '../i18n/en';
import { hi } from '../i18n/hi';

export type NavTab =
  | 'dashboard'
  | 'overbooking'
  | 'relay'
  | 'lpi'
  | 'microshift'
  | 'festival'
  | 'settings';

export type SurveyEntry = {
  id: string;
  festivals: string[];
  daysStayed: number;
  willingLocal: 'yes' | 'maybe' | 'no';
  minDailyWage: number;
  keyPerk: string;
  timestamp: string;
};

interface AppState {
  lang: 'en' | 'hi';
  activeTab: NavTab;
  guidedTourStep: number; // 0 = inactive, 1..6 = step
  assumptions: Assumptions;

  // Seed Data State
  villages: Village[];
  farms: Farm[];
  workers: Worker[];
  crews: Crew[];
  jobs: Job[];
  forecast: WeatherForecast[];
  migrantProfiles: MigrantProfile[];
  microProfiles: MicroProfile[];
  shortStintOffers: ShortStintOffer[];
  pledges: Pledge[];

  // User interactive state
  farmShifts: Record<string, number>;
  surveyResponses: SurveyEntry[];
  selectedCrewId: string | null;
  selectedFarmId: string | null;

  // Actions
  setLang: (lang: 'en' | 'hi') => void;
  setActiveTab: (tab: NavTab) => void;
  setGuidedTourStep: (step: number) => void;
  updateAssumption: <K extends keyof Assumptions>(key: K, value: Assumptions[K]) => void;
  resetAssumptions: () => void;
  resetDemoData: () => void;
  setFarmShift: (farmId: string, shift: number) => void;
  setSelectedCrewId: (crewId: string | null) => void;
  setSelectedFarmId: (farmId: string | null) => void;
  updateWorkerAttendance: (workerId: string, showed: boolean) => void;
  addSurveyResponse: (entry: Omit<SurveyEntry, 'id' | 'timestamp'>) => void;
  addPledge: (pledge: Pledge) => void;
  updatePledgeStatus: (pledgeId: string, status: Pledge['status']) => void;
  addShortStintOffer: (offer: ShortStintOffer) => void;
}

const initialSeed = generateSeedData(42);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      lang: 'en',
      activeTab: 'dashboard',
      guidedTourStep: 0,
      assumptions: { ...DEFAULT_ASSUMPTIONS },

      villages: initialSeed.villages,
      farms: initialSeed.farms,
      workers: initialSeed.workers,
      crews: initialSeed.crews,
      jobs: initialSeed.jobs,
      forecast: initialSeed.forecast,
      migrantProfiles: initialSeed.migrantProfiles,
      microProfiles: initialSeed.microProfiles,
      shortStintOffers: initialSeed.shortStintOffers,
      pledges: initialSeed.pledges,

      farmShifts: {},
      surveyResponses: [
        {
          id: 'surv-1',
          festivals: ['fest-diwali', 'fest-chhath'],
          daysStayed: 10,
          willingLocal: 'yes',
          minDailyWage: 450,
          keyPerk: 'Midday meal + prompt evening cash payout',
          timestamp: '2026-10-15',
        },
        {
          id: 'surv-2',
          festivals: ['fest-diwali'],
          daysStayed: 7,
          willingLocal: 'maybe',
          minDailyWage: 480,
          keyPerk: 'Advance booking guarantee and flexible morning hours',
          timestamp: '2026-10-16',
        },
      ],
      selectedCrewId: initialSeed.crews[0]?.id || null,
      selectedFarmId: initialSeed.farms[0]?.id || null,

      setLang: (lang) => set({ lang }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setGuidedTourStep: (guidedTourStep) => set({ guidedTourStep }),

      updateAssumption: (key, value) =>
        set((state) => ({
          assumptions: { ...state.assumptions, [key]: value },
        })),

      resetAssumptions: () =>
        set({
          assumptions: { ...DEFAULT_ASSUMPTIONS },
        }),

      resetDemoData: () => {
        const fresh = generateSeedData(42);
        set({
          villages: fresh.villages,
          farms: fresh.farms,
          workers: fresh.workers,
          crews: fresh.crews,
          jobs: fresh.jobs,
          forecast: fresh.forecast,
          migrantProfiles: fresh.migrantProfiles,
          microProfiles: fresh.microProfiles,
          shortStintOffers: fresh.shortStintOffers,
          pledges: fresh.pledges,
          farmShifts: {},
          assumptions: { ...DEFAULT_ASSUMPTIONS },
          selectedCrewId: fresh.crews[0]?.id || null,
          selectedFarmId: fresh.farms[0]?.id || null,
        });
      },

      setFarmShift: (farmId, shift) =>
        set((state) => ({
          farmShifts: { ...state.farmShifts, [farmId]: shift },
        })),

      setSelectedCrewId: (selectedCrewId) => set({ selectedCrewId }),
      setSelectedFarmId: (selectedFarmId) => set({ selectedFarmId }),

      updateWorkerAttendance: (workerId, showed) =>
        set((state) => ({
          workers: state.workers.map((w) => {
            if (w.id === workerId) {
              const booked = w.history.booked + 1;
              const sCount = w.history.showed + (showed ? 1 : 0);
              return { ...w, history: { booked, showed: sCount } };
            }
            return w;
          }),
        })),

      addSurveyResponse: (entry) =>
        set((state) => ({
          surveyResponses: [
            ...state.surveyResponses,
            {
              ...entry,
              id: `surv-${Date.now()}`,
              timestamp: new Date().toISOString().split('T')[0],
            },
          ],
        })),

      addPledge: (pledge) =>
        set((state) => ({
          pledges: [...state.pledges, pledge],
        })),

      updatePledgeStatus: (pledgeId, status) =>
        set((state) => ({
          pledges: state.pledges.map((p) => (p.id === pledgeId ? { ...p, status } : p)),
        })),

      addShortStintOffer: (offer) =>
        set((state) => ({
          shortStintOffers: [offer, ...state.shortStintOffers],
        })),
    }),
    {
      name: 'kheticrew_storage_v1',
      partialize: (state) => ({
        lang: state.lang,
        assumptions: state.assumptions,
        farmShifts: state.farmShifts,
        surveyResponses: state.surveyResponses,
        pledges: state.pledges,
      }),
    }
  )
);

export function useTranslation() {
  const lang = useStore((state) => state.lang);
  return lang === 'hi' ? hi : en;
}

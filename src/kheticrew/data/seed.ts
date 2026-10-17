import {
  Village,
  Farm,
  Worker,
  Crew,
  Job,
  CropOperation,
  MicroTask,
  MicroProfile,
  Festival,
  MigrantProfile,
  Pledge,
  WeatherForecast,
  ShortStintOffer,
} from '../lib/types';
import { createRNG, normalRandom, sampleInt, sampleChoice } from '../lib/rng';
import { addDaysIso, SIMULATED_TODAY } from '../lib/dates';
import rawOps from './ops.json';
import rawTasks from './tasks.json';
import rawFestivals from './festivals.json';

export const CROP_OPERATIONS: CropOperation[] = rawOps as CropOperation[];
export const MICRO_TASKS: MicroTask[] = rawTasks as MicroTask[];
export const FESTIVALS: Festival[] = rawFestivals as Festival[];

export function generateSeedData(seed = 42) {
  const rng = createRNG(seed);

  // 1. 6 Villages on ~25x25 km grid
  const villages: Village[] = [
    { id: 'v-1', name: 'Rampur', xKm: 5, yKm: 8 },
    { id: 'v-2', name: 'Kishanpur', xKm: 12, yKm: 6 },
    { id: 'v-3', name: 'Mohanpur', xKm: 19, yKm: 12 },
    { id: 'v-4', name: 'Shivpur', xKm: 7, yKm: 19 },
    { id: 'v-5', name: 'Devgaon', xKm: 22, yKm: 7 },
    { id: 'v-6', name: 'Harinagar', xKm: 15, yKm: 21 },
  ];

  // 2. 40 Farms (1 to 6 acres) across paddy, wheat and mustard
  const farmerNames = [
    'Ramesh Patel', 'Suresh Yadav', 'Balbir Singh', 'Dharmendra Kumar', 'Jagdish Prasad',
    'Mukesh Verma', 'Rajesh Sharma', 'Harish Chandra', 'Om Prakash', 'Mahendra Pal',
    'Ram Avtar', 'Kishore Lal', 'Satish Chandra', 'Devendra Singh', 'Manoj Kumar',
    'Pawan Tiwari', 'Anand Kumar', 'Vijay Bahadur', 'Subhash Yadav', 'Gopal Das',
    'Santosh Rawat', 'Brijesh Pandey', 'Ashok Tyagi', 'Dinesh Soni', 'Kamal Nayan',
    'Arun Choudhary', 'Prem Chand', 'Lalit Mohan', 'Sunil Gangwar', 'Vinod Kushwaha',
    'Chhotey Lal', 'Raghuraj Pratap', 'Nathu Ram', 'Giriraj Kishore', 'Bhagwan Das',
    'Chetan Swaroop', 'Daya Shankar', 'Pradeep Gupta', 'Suraj Bhan', 'Kalyan Singh'
  ];

  const farms: Farm[] = [];
  const crops: ('paddy' | 'wheat' | 'mustard')[] = ['paddy', 'wheat', 'mustard'];
  
  // Sowing dates are planned so paddy harvest hits late Oct to mid Nov
  // Paddy: 120-day offset for harvest. If sown between 2026-06-20 and 2026-07-15 -> harvest 2026-10-18 to 2026-11-12
  // Mustard: sown 2026-10-18 to 2026-11-05
  // Wheat: sown 2026-11-01 to 2026-11-25
  for (let i = 0; i < 40; i++) {
    const village = villages[i % villages.length];
    const crop = crops[i % 3 === 0 ? 0 : (i % 2 === 0 ? 1 : 2)];
    const acres = Number((1.2 + (rng() * 4.8)).toFixed(1)); // 1.2 to 6.0 acres
    const flex = sampleChoice(rng, [4, 5, 6, 7]);
    
    let sowingDate = '2026-06-25';
    if (crop === 'paddy') {
      const dayOffset = sampleInt(rng, -5, 18);
      sowingDate = addDaysIso('2026-06-25', dayOffset);
    } else if (crop === 'mustard') {
      const dayOffset = sampleInt(rng, 2, 20);
      sowingDate = addDaysIso('2026-10-18', dayOffset);
    } else {
      const dayOffset = sampleInt(rng, 10, 32);
      sowingDate = addDaysIso('2026-10-25', dayOffset);
    }

    farms.push({
      id: `farm-${i + 1}`,
      villageId: village.id,
      ownerName: farmerNames[i % farmerNames.length],
      acres,
      crop,
      sowingDate,
      sowingFlexDays: flex,
    });
  }

  // 3. 120 Local workers with history
  // booked ~ N(10, 4) clipped 0-25, show rate 0.55-0.95, 30 migrants
  const workerFirstNames = [
    'Rajendra', 'Shyamlal', 'Virendra', 'Amar', 'Kallu', 'Chhedi', 'Moolchand', 'Suraj',
    'Badri', 'Sohan', 'Ganesh', 'Laxman', 'Bharat', 'Shatrughan', 'Brijlal', 'Chhote',
    'Bhure', 'Pappu', 'Bablu', 'Dheeraj', 'Jitendra', 'Naresh', 'Kailash', 'Mohit',
    'Sonu', 'Monu', 'Sunita', 'Geeta', 'Kamla', 'Meena', 'Radha', 'Kanti', 'Usha',
    'Sharda', 'Vimla', 'Anita', 'Sunil', 'Banti', 'Rakesh', 'Rohit'
  ];

  const workers: Worker[] = [];
  const migrantProfiles: MigrantProfile[] = [];
  const microProfiles: MicroProfile[] = [];

  for (let i = 0; i < 120; i++) {
    const village = villages[i % villages.length];
    const isMigrant = i < 30; // 30 migrants
    const rawBooked = Math.round(normalRandom(rng, 10, 4));
    const booked = Math.max(2, Math.min(25, rawBooked));
    const showRate = 0.55 + rng() * 0.40; // 0.55 to 0.95
    const showed = Math.max(1, Math.min(booked, Math.round(booked * showRate)));
    const skillLevel = (rng() < 0.35 ? 0 : rng() < 0.75 ? 1 : 2) as 0 | 1 | 2;
    const certifiedForHazard = skillLevel >= 1 && rng() < 0.4;

    // A few random unavailable dates around festivals / personal events
    const unavailable: string[] = [];
    if (rng() < 0.3) {
      unavailable.push(addDaysIso(SIMULATED_TODAY, sampleInt(rng, 2, 8)));
    }
    if (rng() < 0.25) {
      unavailable.push(addDaysIso(SIMULATED_TODAY, sampleInt(rng, 18, 25)));
    }

    const workerId = `w-${i + 1}`;
    const name = `${sampleChoice(rng, workerFirstNames)} ${village.name[0]}.${i + 1}`;

    workers.push({
      id: workerId,
      name,
      villageId: village.id,
      skillLevel,
      history: { booked, showed },
      unavailableDates: unavailable,
      isMigrant,
      certifiedForHazard,
    });

    // If migrant, create profile
    if (isMigrant) {
      const cities = ['Surat', 'Delhi NCR', 'Ludhiana', 'Mumbai', 'Ahmedabad', 'Jaipur'];
      const sectors = ['Textiles', 'Construction', 'Foundry', 'Brick Kiln', 'Logistics'];
      const willing = rng() < 0.6 ? 'yes' : rng() < 0.85 ? 'maybe' : 'no';
      migrantProfiles.push({
        id: `mig-${i + 1}`,
        homeVillageId: village.id,
        workCity: sampleChoice(rng, cities),
        sector: sampleChoice(rng, sectors),
        returnProbByFestival: {
          'fest-dussehra': Number((0.25 + rng() * 0.4).toFixed(2)),
          'fest-diwali': Number((0.70 + rng() * 0.28).toFixed(2)),
          'fest-chhath': Number((0.40 + rng() * 0.45).toFixed(2)),
          'fest-sankranti': Number((0.20 + rng() * 0.3).toFixed(2)),
          'fest-holi': Number((0.65 + rng() * 0.3).toFixed(2)),
          'fest-baisakhi': Number((0.15 + rng() * 0.3).toFixed(2)),
        },
        willingLocal: willing,
        minDailyWage: sampleChoice(rng, [400, 420, 450, 480]),
        consent: true,
      });
    }

    // Micro-profile for partial slot availability
    const windows = [
      { start: '06:00', end: '09:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
      { start: '15:30', end: '18:30', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
    ];
    if (rng() < 0.4) {
      windows.push({ start: '09:00', end: '12:00', days: ['Mon', 'Wed', 'Sat'] });
    }

    microProfiles.push({
      workerId,
      windows,
      maxLoad: (rng() < 0.25 ? 1 : rng() < 0.65 ? 2 : 3) as 1 | 2 | 3,
      maxDistanceKm: sampleChoice(rng, [4, 6, 8, 12]),
      maxHoursPerDay: sampleChoice(rng, [4, 6, 8]),
      canWorkSeated: rng() < 0.6,
      adultVerified: true,
    });
  }

  // 4. 12 Crews of size 3 to 8
  const crewNames = [
    'Jai Kisan Toli', 'Surya Shakti Dal', 'Shiv Shambhu Crew', 'Maa Durga Harvest Group',
    'Kisan Ekta Toli', 'Veer Tejaji Group', 'Bholenath Dal', 'Shri Ram Krishi Toli',
    'Pawan Putra Crew', 'Gramin Vikas Toli', 'Khet Mazdoor Sangha', 'Kisan Mitr Toli'
  ];

  const crews: Crew[] = [];
  for (let i = 0; i < 12; i++) {
    const homeVillage = villages[i % villages.length];
    const size = sampleChoice(rng, [3, 4, 5, 6, 7, 8]);
    const skills = ['manual_harvest', 'post_harvest', 'land_prep', 'sowing'];
    crews.push({
      id: `crew-${i + 1}`,
      name: crewNames[i],
      size,
      skills: size > 5 ? skills : skills.slice(0, 3),
      homeVillageId: homeVillage.id,
      availableFrom: addDaysIso(SIMULATED_TODAY, sampleInt(rng, 0, 3)),
      availableTo: addDaysIso(SIMULATED_TODAY, sampleInt(rng, 28, 45)),
      maxTravelKm: sampleChoice(rng, [14, 18, 22, 26]),
    });
  }

  // 5. ~35 Explicit Jobs
  const jobs: Job[] = [];
  const operationsList = [
    'Paddy manual harvest',
    'Paddy post-harvest handling',
    'Wheat land prep and sowing',
    'Mustard sowing and thinning'
  ];

  for (let i = 0; i < 35; i++) {
    const farm = farms[i % farms.length];
    const operation = farm.crop === 'paddy'
      ? (i % 2 === 0 ? 'Paddy manual harvest' : 'Paddy post-harvest handling')
      : (farm.crop === 'wheat' ? 'Wheat land prep and sowing' : 'Mustard sowing and thinning');
    
    // Spread earliest start between today + 1 and today + 25
    const startOffset = sampleInt(rng, 1, 22);
    const earliestStart = addDaysIso(SIMULATED_TODAY, startOffset);
    const flex = sampleChoice(rng, [2, 3, 4, 5]);
    const latestStart = addDaysIso(earliestStart, flex);
    const durationDays = sampleChoice(rng, [2, 3, 4, 5]);
    const minSize = Math.max(3, Math.min(8, Math.round(farm.acres * 1.5)));
    const maxSize = minSize + sampleChoice(rng, [1, 2, 3]);

    jobs.push({
      id: `job-${i + 1}`,
      farmId: farm.id,
      operation,
      crewSizeMin: minSize,
      crewSizeMax: maxSize,
      durationDays,
      earliestStart,
      latestStart,
      skillRequired: (operation.includes('harvest') ? 1 : 0) as 0 | 1 | 2,
      wagePerPersonDay: sampleChoice(rng, [400, 420, 450, 475]),
      weatherSensitive: operation.includes('harvest') || operation.includes('Paddy'),
    });
  }

  // 6. 21-day weather forecast array starting today (2026-10-17)
  // Include a few rainy days (e.g., day 7 and 17) and two heat days (day 11 and 12)
  const forecast: WeatherForecast[] = [];
  for (let i = 0; i < 28; i++) {
    const date = addDaysIso(SIMULATED_TODAY, i);
    let rainProb = 0.05;
    let rainfallMm = 0;
    let maxTempC = 31 + Math.round(rng() * 4);
    let isHeatWave = false;

    // Day 7 (2026-10-24) and Day 17 (2026-11-03) heavy unseasonal rain
    if (i === 7) {
      rainProb = 0.85;
      rainfallMm = 28;
    } else if (i === 17) {
      rainProb = 0.75;
      rainfallMm = 18;
    } else if (i === 6 || i === 18) {
      rainProb = 0.40;
      rainfallMm = 5;
    }

    // Day 11 and 12 (2026-10-28 and 2026-10-29) heatwave spike
    if (i === 11 || i === 12) {
      maxTempC = 39 + (i === 11 ? 1 : 2);
      isHeatWave = true;
    }

    forecast.push({
      date,
      rainProb,
      isHeatWave,
      maxTempC,
      rainfallMm,
    });
  }

  // 7. Initial Short-Stint Offers and Pledges around Diwali & Dussehra
  const shortStintOffers: ShortStintOffer[] = [
    {
      id: 'sso-1',
      farmId: 'farm-3',
      operation: 'Paddy manual harvest',
      startDate: '2026-11-05',
      endDate: '2026-11-10',
      wagePerDay: 500,
      perks: ['Free Midday Meal', 'Evening Tea & Snacks', '₹50/day Travel Allowance'],
      slotsAvailable: 8,
    },
    {
      id: 'sso-2',
      farmId: 'farm-12',
      operation: 'Paddy post-harvest handling',
      startDate: '2026-11-08',
      endDate: '2026-11-13',
      wagePerDay: 480,
      perks: ['Free Lunch', 'Farm Produce Incentive (5kg Rice)'],
      slotsAvailable: 6,
    },
    {
      id: 'sso-3',
      farmId: 'farm-25',
      operation: 'Wheat land prep and sowing',
      startDate: '2026-11-12',
      endDate: '2026-11-16',
      wagePerDay: 470,
      perks: ['Free Chai', 'Direct Bank Transfer (Instant)'],
      slotsAvailable: 5,
    },
  ];

  const pledges: Pledge[] = [
    { id: 'plg-1', migrantId: 'mig-1', offerId: 'sso-1', status: 'confirmed' },
    { id: 'plg-2', migrantId: 'mig-2', offerId: 'sso-1', status: 'pledged' },
    { id: 'plg-3', migrantId: 'mig-4', offerId: 'sso-1', status: 'interested' },
    { id: 'plg-4', migrantId: 'mig-7', offerId: 'sso-2', status: 'confirmed' },
    { id: 'plg-5', migrantId: 'mig-9', offerId: 'sso-2', status: 'pledged' },
    { id: 'plg-6', migrantId: 'mig-14', offerId: 'sso-3', status: 'pledged' },
  ];

  return {
    villages,
    farms,
    workers,
    crews,
    jobs,
    forecast,
    migrantProfiles,
    microProfiles,
    shortStintOffers,
    pledges,
  };
}

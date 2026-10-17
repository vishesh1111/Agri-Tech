export interface DynamicTaskTemplate {
  title: string;
  description: string;
  priority: string;
  priorityLabel: string;
  category: string;
  whyReason: string;
}

export interface FarmHealthAssessment {
  overallScore: number;
  status: string;
  soilScore: number;
  waterScore: number;
  pestScore: number;
  vitalityScore: number;
  summary: string;
  issuesIdentified: string[];
  generatedActionTasks: DynamicTaskTemplate[];
}

export const FarmHealthCalculator = {
  calculateHealth(
    farmType: string,
    primaryCropOrAnimal: string,
    soilType: string,
    soilTestingStatus: string,
    fertilizerPractice: string,
    drainageCondition: string,
    waterSource: string,
    pestPressure: string,
    diseaseSigns: string,
    seedQuality: string,
    boundaryFencing: string
  ): FarmHealthAssessment {
    const issues: string[] = [];
    const tasks: DynamicTaskTemplate[] = [];

    // 1. SOIL SCORE (Max 100)
    let soilPts = 0;
    if (soilTestingStatus.toLowerCase().includes('recent')) {
      soilPts += 35;
    } else if (soilTestingStatus.toLowerCase().includes('1-2')) {
      soilPts += 22;
      issues.push('Soil testing is over 1 year old');
      tasks.push({
        title: 'Schedule Soil NPK & pH Test',
        description: 'Collect 5 composite soil core samples from root zones to re-test micronutrient and organic carbon levels.',
        priority: 'Medium',
        priorityLabel: 'RECOMMENDED',
        category: 'Soil Health',
        whyReason: 'Soil testing renewal prevents nutrient over-application and balances fertilizer costs.',
      });
    } else {
      soilPts += 10;
      issues.push('Soil has never been lab-tested');
      tasks.push({
        title: 'Collect Soil Sample for Lab Test',
        description: 'Send topsoil sample to nearest Krishi Vigyan Kendra (KVK) for comprehensive NPK, pH, and organic matter lab testing.',
        priority: 'High',
        priorityLabel: 'DO FIRST',
        category: 'Soil Health',
        whyReason: 'Knowing exact soil fertility prevents crop stunting and saves fertilizer expenditure.',
      });
    }

    if (fertilizerPractice.toLowerCase().includes('organic')) {
      soilPts += 40;
    } else if (fertilizerPractice.toLowerCase().includes('balanced')) {
      soilPts += 35;
    } else if (fertilizerPractice.toLowerCase().includes('chemical')) {
      soilPts += 20;
      issues.push('Heavy synthetic fertilizer reliance');
      tasks.push({
        title: 'Apply 3-4 Tonnes Farm Yard Manure',
        description: 'Incorporate well-rotted cow dung manure or vermicompost to rebuild beneficial soil microbiology.',
        priority: 'Medium',
        priorityLabel: 'SOIL QUALITY',
        category: 'Fertilizer',
        whyReason: 'Continuous heavy urea use lowers soil organic carbon and hardens the topsoil profile.',
      });
    } else {
      soilPts += 15;
    }

    if (soilType.toLowerCase().includes('loam') || soilType.toLowerCase().includes('alluvial')) {
      soilPts += 25;
    } else if (soilType.toLowerCase().includes('black')) {
      soilPts += 22;
    } else if (soilType.toLowerCase().includes('clay')) {
      soilPts += 18;
    } else {
      soilPts += 15;
    }
    const finalSoilScore = Math.min(100, Math.max(20, soilPts));

    // 2. WATER SCORE (Max 100)
    let waterPts = 0;
    if (waterSource.toLowerCase().includes('solar') || waterSource.toLowerCase().includes('drip')) {
      waterPts += 50;
    } else if (waterSource.toLowerCase().includes('borewell')) {
      waterPts += 40;
    } else if (waterSource.toLowerCase().includes('canal')) {
      waterPts += 35;
    } else {
      waterPts += 15;
      issues.push('Rainfed dependence with no backup borewell');
      tasks.push({
        title: 'Construct Farm Pond or Rainwater Trench',
        description: 'Excavate 10x10m lined farm pond or watershed trench under PMKSY subsidy for supplementary irrigation.',
        priority: 'High',
        priorityLabel: 'CRITICAL',
        category: 'Irrigation',
        whyReason: 'Rainfed plots face drought stress during critical grain filling or pod formation stages.',
      });
    }

    if (drainageCondition.toLowerCase().includes('excellent')) {
      waterPts += 50;
    } else if (drainageCondition.toLowerCase().includes('moderate')) {
      waterPts += 35;
    } else {
      waterPts += 10;
      issues.push('Prone to seasonal waterlogging');
      tasks.push({
        title: 'Excavate Peripheral Drainage Furrows',
        description: 'Dig 40cm perimeter field drains to discharge monsoon stagnant water into drainage channels.',
        priority: 'High',
        priorityLabel: 'URGENT',
        category: 'Irrigation',
        whyReason: 'Standing water suffocates root respiration and causes phytophthora root rot within 48 hours.',
      });
    }
    const finalWaterScore = Math.min(100, Math.max(15, waterPts));

    // 3. PEST & BIOSECURITY SCORE (Max 100)
    let pestPts = 0;
    if (pestPressure.toLowerCase().includes('none')) {
      pestPts += 50;
    } else if (pestPressure.toLowerCase().includes('low') || pestPressure.toLowerCase().includes('moderate')) {
      pestPts += 30;
      issues.push('Moderate pest/insect pressure active');
      tasks.push({
        title: 'Install Yellow & Blue Sticky Traps',
        description: 'Hang 10 yellow sticky cards per acre to trap whiteflies and aphids before threshold levels.',
        priority: 'High',
        priorityLabel: 'PREVENTIVE',
        category: 'Pest Control',
        whyReason: 'Early monitoring with bio-traps cuts chemical insecticide spray frequency by 50%.',
      });
    } else {
      pestPts += 10;
      issues.push('Severe recurring pest attack pressure');
      tasks.push({
        title: 'Spray Recommended Bio-Pesticide (Neem 10,000 PPM)',
        description: 'Conduct comprehensive foliar spray @ 3ml/L water in evening hours when pest mobility is peak.',
        priority: 'High',
        priorityLabel: 'EMERGENCY',
        category: 'Pest Control',
        whyReason: 'Heavy pest presence rapidly causes economic leaf area defoliation and viral transmission.',
      });
    }

    if (diseaseSigns.toLowerCase().includes('no') || diseaseSigns.toLowerCase().includes('healthy')) {
      pestPts += 50;
    } else {
      pestPts += 20;
      issues.push('Active leaf lesions / blight signs observed');
      tasks.push({
        title: 'Perform Crop Doctor Leaf Scan',
        description: 'Take close-up photograph of 3 affected leaves to get AI pathology identification and chemical cure.',
        priority: 'High',
        priorityLabel: 'DIAGNOSE',
        category: 'Crop Doctor',
        whyReason: 'Targeted fungal or bacterial treatment within 72 hours prevents irreversible yield reduction.',
      });
    }
    const finalPestScore = Math.min(100, Math.max(20, pestPts));

    // 4. VITALITY & MANAGEMENT SCORE (Max 100)
    let vitalityPts = 0;
    if (seedQuality.toLowerCase().includes('certified') || seedQuality.toLowerCase().includes('govt')) {
      vitalityPts += 50;
    } else {
      vitalityPts += 25;
      issues.push('Farm-saved uncertified seed lot');
    }

    if (boundaryFencing.toLowerCase().includes('fence') || boundaryFencing.toLowerCase().includes('solar')) {
      vitalityPts += 50;
    } else {
      vitalityPts += 20;
      issues.push('Unfenced perimeter (stray cattle / wild boar risk)');
      tasks.push({
        title: 'Set Up Solar / Bio-Hedge Fencing',
        description: 'Plant thorny Karonda/Agave live hedge or install low-voltage solar energizer fencing along boundary.',
        priority: 'Medium',
        priorityLabel: 'SECURITY',
        category: 'Farm Protection',
        whyReason: 'Unprotected boundaries risk 15-20% nocturnal crop grazing damage from stray animals.',
      });
    }
    const finalVitalityScore = Math.min(100, Math.max(20, vitalityPts));

    // Weighted Overall Score (Soil 35%, Water 25%, Pest 25%, Vitality 15%)
    const overall = Math.round(
      finalSoilScore * 0.35 +
      finalWaterScore * 0.25 +
      finalPestScore * 0.25 +
      finalVitalityScore * 0.15
    );

    const status =
      overall >= 80 ? 'Optimal Condition' :
      overall >= 65 ? 'Good Health' :
      overall >= 45 ? 'Needs Attention' :
      'Critical Health Risk';

    const summary =
      overall >= 80
        ? 'Excellent farm baseline. High organic matter, certified seed, and reliable water guarantee strong yields.'
        : overall >= 65
        ? 'Stable foundation. Addressing 1-2 minor soil or drainage recommendations will maximize profit margins.'
        : 'Farm is currently operating under stress factors. Follow the generated high-priority action plan immediately.';

    return {
      overallScore: overall,
      status,
      soilScore: finalSoilScore,
      waterScore: finalWaterScore,
      pestScore: finalPestScore,
      vitalityScore: finalVitalityScore,
      summary,
      issuesIdentified: issues,
      generatedActionTasks: tasks,
    };
  },
};

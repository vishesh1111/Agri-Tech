import React from 'react';
import { useStore, useTranslation } from '../store/useStore';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  BarChart3,
  Calendar,
  Gauge,
  Workflow,
  Split,
  CalendarDays,
  CheckCircle,
} from 'lucide-react';

export const GuidedTourModal: React.FC = () => {
  const { guidedTourStep, setGuidedTourStep, setActiveTab, setFarmShift } = useStore();
  const t = useTranslation();

  if (guidedTourStep < 1 || guidedTourStep > 6) return null;

  const steps = [
    {
      step: 1,
      titleEn: 'Step 1: See the Labour Squeeze (Timing)',
      titleHi: 'चरण 1: श्रम संकट का अग्रिम पूर्वानुमान (LPI)',
      descEn:
        'Farm labour shortages are predictable timing squeezes. The Labour Availability Forecast evaluates 40 farms and climate forecasts to reveal that between 8 Nov and 14 Nov, Village Rampur faces a critical labour deficit, with projected wages surging by +38%.',
      descHi:
        'मजदूरों की कमी अचानक नहीं होती। 21-दिवसीय मजदूर उपलब्धता पूर्वानुमान दर्शाता है कि 8 से 14 नवंबर के बीच रामपुर गांव में भारी मांग और बारिश संपीड़न के कारण गंभीर श्रमिक कमी और 38% मजदूरी वृद्धि होने वाली है।',
      tab: 'lpi' as const,
      icon: <BarChart3 className="w-6 h-6 text-brand-600" />,
      actionTextEn: 'Inspect Heatmap & Critical Alerts',
      actionTextHi: 'हीटमैप और अलर्ट देखें',
      onEnter: () => setActiveTab('lpi'),
    },
    {
      step: 2,
      titleEn: 'Step 2: Defuse the Peak by Date Shifting (What-If)',
      titleHi: 'चरण 2: बुवाई/कटाई तिथि बदलकर संकट टालें',
      descEn:
        'Instead of fighting over scarce workers, farmers can stagger operations within their safe agronomic window. Using the What-If Simulator, shifting Ramesh Patel’s paddy harvest start by +3 days drops the village peak LPI by -28 points, saving ₹45/day per worker.',
      descHi:
        'व्हाट-इफ सिम्युलेटर के जरिए किसान रमेश पटेल की कटाई को केवल +3 दिन आगे खिसकाकर गांव के चरम दबाव (Peak LPI) को 28 अंक नीचे लाया जा सकता है, जिससे अनावश्यक मजदूरी उछाल से बचाव होता है।',
      tab: 'lpi' as const,
      icon: <Calendar className="w-6 h-6 text-amber-600" />,
      actionTextEn: 'Simulate +3 Day Shift on Farm',
      actionTextHi: '+3 दिन बदलाव लागू करें',
      onEnter: () => {
        setActiveTab('lpi');
        setFarmShift('farm-1', 3);
      },
    },
    {
      step: 3,
      titleEn: 'Step 3: Solve No-Shows via Overbooking (Reliability)',
      titleHi: 'चरण 3: एयरलाइन शैली ओवरबुकिंग से पूर्ण हाजिरी',
      descEn:
        'Farmers experience 30-45% worker no-shows on critical mornings. The Overbooking Engine models individual worker reliability with a Beta prior and odds adjustments. For a 10-person job, naive booking gives only 31% confidence. Overbooking to 13 workers with a paid standby Tier B guarantees 95% attendance.',
      descHi:
        'सुबह मजदूर न आने से फसल खराब होती है। 10 मजदूरों की जरूरत पर केवल 10 बुलाने पर केवल 31% संभावना होती है कि टीम पूरी हो। 13 मजदूर बुक करने और स्टैंडबाय भत्ता देने से 95% निश्चितता मिलती है।',
      tab: 'overbooking' as const,
      icon: <Gauge className="w-6 h-6 text-sky-600" />,
      actionTextEn: 'View Overbooking Distribution & Standby Roster',
      actionTextHi: 'ओवरबुकिंग रोस्टर और मोंटे कार्लो चार्ट देखें',
      onEnter: () => setActiveTab('overbooking'),
    },
    {
      step: 4,
      titleEn: 'Step 4: Chain Work Sequences with Crew Relay (Continuity)',
      titleHi: 'चरण 4: क्रू रिले से हफ्तों का निरंतर रोजगार',
      descEn:
        'Workers migrate to cities because village work is patchy with idle days. The Crew Relay Engine sequences back-to-back jobs on adjacent farms within travel range. This boosts average continuous work streaks from 4.2 days to 12.8 days, cutting idle time by 60%.',
      descHi:
        'गांव में लगातार काम न मिलने से मजदूर शहरों की ओर पलायन करते हैं। क्रू रिले इंजन पड़ोस के खेतों में काम की लगातार लड़ी बनाकर टोलियों को 12+ दिन का अटूट काम देता है।',
      tab: 'relay' as const,
      icon: <Workflow className="w-6 h-6 text-indigo-600" />,
      actionTextEn: 'Explore Multi-Crew Gantt Schedule & Route Polyline',
      actionTextHi: 'गैंट चार्ट और रिले रूट देखें',
      onEnter: () => setActiveTab('relay'),
    },
    {
      step: 5,
      titleEn: 'Step 5: Micro-Shift Task Splitter (Untapped Labour)',
      titleHi: 'चरण 5: 3-घंटे के माइक्रो-स्लॉट से नए कामगार',
      descEn:
        'Many village adults cannot commit to grueling 8-hour days. Micro-Shift splits post-harvest work into 3-hour slots (winnowing, bundling, bagging), freeing 64% of heavy person-hours. Strict climate safeguards drop midday slots during heatwaves and restrict machinery to certified adults.',
      descHi:
        'महिलाएं व अन्य वयस्क जो पूरे 8 घंटे काम नहीं कर सकते, 3-घंटे के छोटे स्लॉट (छनाई, बंधाई) में भाग लेते हैं। इससे भारी काम के लिए 64% पूर्णकालिक मजदूर मुक्त हो जाते हैं और लू से सुरक्षा रहती है।',
      tab: 'microshift' as const,
      icon: <Split className="w-6 h-6 text-emerald-600" />,
      actionTextEn: 'Inspect 3-Hour Slot Grid & Safeguards',
      actionTextHi: 'माइक्रो-स्लॉट और सुरक्षा मानक देखें',
      onEnter: () => setActiveTab('microshift'),
    },
    {
      step: 6,
      titleEn: 'Step 6: Festival Return Calendar (Seasonal Supply)',
      titleHi: 'चरण 6: त्योहार पर लौटे प्रवासियों का पूर्व-आरक्षण',
      descEn:
        'Around Diwali and Chhath, tens of thousands of migrant workers return home. By pre-booking short harvest stints with transparent wages and meals, KhetiCrew captures returning labour to eliminate 78% of the November harvest deficit.',
      descHi:
        'दिवाली और छठ पर घर लौटने वाले कामगारों को अग्रिम कार्य प्रस्ताव और भत्ते देकर फसल कटाई में जोड़ा जाता है, जिससे नवंबर का मौसमी घाटा समाप्त हो जाता है।',
      tab: 'festival' as const,
      icon: <CalendarDays className="w-6 h-6 text-purple-600" />,
      actionTextEn: 'View Overlap Curve & Pledge Kanban Board',
      actionTextHi: 'वापसी वक्र और प्रतिज्ञा बोर्ड देखें',
      onEnter: () => setActiveTab('festival'),
    },
  ];

  const current = steps[guidedTourStep - 1];

  const handleNext = () => {
    if (guidedTourStep < 6) {
      const nextStep = guidedTourStep + 1;
      setGuidedTourStep(nextStep);
      steps[nextStep - 1].onEnter();
    } else {
      setGuidedTourStep(0);
      setActiveTab('dashboard');
    }
  };

  const handlePrev = () => {
    if (guidedTourStep > 1) {
      const prevStep = guidedTourStep - 1;
      setGuidedTourStep(prevStep);
      steps[prevStep - 1].onEnter();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 overflow-hidden relative animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-50 border border-brand-200">
              {current.icon}
            </span>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-brand-600 uppercase">
                Hackathon Demo Tour • {guidedTourStep} of 6
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                {t.app.title === 'KhetiCrew' ? current.titleEn : current.titleHi}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setGuidedTourStep(0)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-touch min-w-touch flex items-center justify-center"
            aria-label="Close Tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="py-4">
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            {t.app.title === 'KhetiCrew' ? current.descEn : current.descHi}
          </p>

          {/* Direct Engine Trigger */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Target Engine: <strong className="text-brand-700 capitalize">{current.tab}</strong>
            </span>
            <button
              type="button"
              onClick={current.onEnter}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 underline flex items-center gap-1 min-h-[36px]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.app.title === 'KhetiCrew' ? current.actionTextEn : current.actionTextHi}</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setGuidedTourStep(s.step);
                  s.onEnter();
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  s.step === guidedTourStep ? 'w-6 bg-brand-600' : 'bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Jump to step ${s.step}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {guidedTourStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg min-h-touch"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.common.back}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm min-h-touch"
            >
              <span>{guidedTourStep === 6 ? 'Finish Tour' : t.common.next}</span>
              {guidedTourStep === 6 ? <CheckCircle className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

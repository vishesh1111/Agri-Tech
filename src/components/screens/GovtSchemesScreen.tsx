'use client';

import React, { useState } from 'react';
import { 
  Building2, Search, ExternalLink, FileText, CheckCircle2, 
  AlertCircle, ChevronRight, ShieldCheck, Sparkles, ArrowLeft,
  X, HelpCircle, Newspaper, Award
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GovtScheme, GovtNewsItem } from '@/lib/types';
import { useKisanStore } from '@/stores/useKisanStore';

const CATEGORIES = [
  'All Schemes',
  'Subsidies',
  'Direct Transfer',
  'Insurance',
  'Loans & Credit'
];

export const GovtSchemesScreen: React.FC = () => {
  const { govtSchemes, govtNews, navigateToSubScreen } = useKisanStore();
  const [selectedCategory, setSelectedCategory] = useState('All Schemes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<GovtScheme | null>(null);
  const [applyModalScheme, setApplyModalScheme] = useState<GovtScheme | null>(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState<string | null>(null);

  // Fallback defaults if store is empty
  const schemes: GovtScheme[] = govtSchemes?.length ? govtSchemes : [
    {
      id: 'scheme_1',
      title: 'PM-KISAN Samman Nidhi Yojana',
      shortDescription: 'Direct income support of ₹6,000 per year directly into farmers\' bank accounts in 3 equal installments.',
      category: 'Direct Transfer',
      subsidyAmount: '₹6,000 / Year',
      eligibility: 'All landholding farmer families across India holding cultivate land in their name.',
      requiredDocuments: ['Aadhaar Card', 'Land Khatauni / Khasra Proof', 'Bank Passbook with IFSC', 'Aadhaar-Linked Mobile Number'],
      applicationProcess: 'Step 1: Visit PM-KISAN official portal or nearest CSC Center.\nStep 2: Enter Aadhaar number & Land Registration ID.\nStep 3: Complete OTP e-KYC verification.',
      officialPortalUrl: 'https://pmkisan.gov.in'
    },
    {
      id: 'scheme_2',
      title: 'PM-KUSUM Solar Pump Subsidy Scheme',
      shortDescription: '80% financial subsidy on installation of stand-alone solar water pumps for irrigation.',
      category: 'Subsidies',
      subsidyAmount: 'Up to 80% Subsidy',
      eligibility: 'Individual farmers, water user associations, and cooperatives having borewell or open well.',
      requiredDocuments: ['Land Ownership Document', 'Borewell / Tube-well NOC', 'Bank Account Details', 'Aadhaar Card'],
      applicationProcess: 'Apply through State Renewable Energy Agency (PEDA) online portal with land coordinates.',
      officialPortalUrl: 'https://pmkusum.mnre.gov.in'
    },
    {
      id: 'scheme_3',
      title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      shortDescription: 'Comprehensive crop insurance cover for natural calamities, pests, and unseasonal rainfall.',
      category: 'Insurance',
      subsidyAmount: '1.5% to 2% Low Premium',
      eligibility: 'All farmers growing notified crops in notified areas including sharecroppers.',
      requiredDocuments: ['Crop Sowing Certificate', 'Aadhaar Card', 'Land Bank Document', 'Cancelled Bank Cheque'],
      applicationProcess: 'Register through bank branch, insurance intermediary, or PMFBY mobile app within 14 days of sowing.',
      officialPortalUrl: 'https://pmfby.gov.in'
    },
    {
      id: 'scheme_4',
      title: 'Kisan Credit Card (KCC) Scheme',
      shortDescription: 'Collateral-free agricultural credit limit up to ₹3,00,000 at a low effective interest rate of 4%.',
      category: 'Loans & Credit',
      subsidyAmount: '4% Interest Rate',
      eligibility: 'Farmers, tenant farmers, oral lessees, sharecroppers, and livestock/poultry keepers.',
      requiredDocuments: ['Filled KCC Application Form', 'Pahani / Land Records', '2 Passport Photos', 'Aadhaar & PAN'],
      applicationProcess: 'Submit application at any commercial bank branch or PACS cooperative society.',
      officialPortalUrl: 'https://agricoop.gov.in'
    },
    {
      id: 'scheme_5',
      title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
      shortDescription: '50% to 80% subsidy for purchasing Tractors, Rotavators, Combine Harvesters, and Agri-Drones.',
      category: 'Subsidies',
      subsidyAmount: '50% - 80% Subsidy',
      eligibility: 'Small and marginal farmers, women farmers, and Custom Hiring Centers (CHCs).',
      requiredDocuments: ['Aadhaar Card', 'Land Ownership Proof', 'Quotation from Dealer', 'Bank Account Details'],
      applicationProcess: 'Apply online on DBT Agriculture portal (agrimachinery.nic.in).',
      officialPortalUrl: 'https://agrimachinery.nic.in'
    }
  ];

  const news: GovtNewsItem[] = govtNews?.length ? govtNews : [
    {
      id: 'news_1',
      title: 'Cabinet approves MSP Hike for Kharif Crops 2026-27 (Paddy MSP ₹2,300/Q)',
      dateDisplay: 'Today, 09:30 AM',
      category: 'MSP Update',
      summary: 'Union Cabinet has approved higher Minimum Support Prices (MSP) for Kharif crops ensuring 50% profit over cost of production.'
    },
    {
      id: 'news_2',
      title: 'PM-KISAN 17th Installment Direct Benefit Transfer Notice Issued',
      dateDisplay: 'Yesterday',
      category: 'DBT Notice',
      summary: 'DBT funds will be transferred to Aadhaar-seeded accounts. Farmers are advised to complete e-KYC.'
    }
  ];

  const filteredSchemes = schemes.filter(scheme => {
    const matchesCat = selectedCategory === 'All Schemes' || scheme.category === selectedCategory;
    const matchesSearch = 
      scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.subsidyAmount.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModalScheme) return;
    setApplicationSubmitted(`Application for ${applyModalScheme.title} submitted successfully! Your application reference number is KISAN-${Date.now().toString().slice(-6)}.`);
    setApplyModalScheme(null);
    setTimeout(() => setApplicationSubmitted(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>🏛️</span>
            <span>Government Agricultural Schemes & Subsidies</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Direct benefit transfers (PM-KISAN), solar irrigation (PM-KUSUM), crop insurance & low-interest credit
          </p>
        </div>

        <button
          onClick={() => navigateToSubScreen('officer_portal')}
          className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-all active:scale-95"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Officer Verification Portal</span>
        </button>
      </div>

      {/* 2. Success Alert */}
      {applicationSubmitted && (
        <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 border border-emerald-300 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{applicationSubmitted}</span>
        </div>
      )}

      {/* 3. Search & Category Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes, solar pumps, loans, subsidies..."
            className="w-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main 12-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Schemes Cards Grid (2-column responsive grid) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Eligible Agricultural Programs ({filteredSchemes.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSchemes.map((scheme) => (
              <Card
                key={scheme.id}
                className="p-5 border border-gray-200 dark:border-zinc-800 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                      {scheme.category}
                    </span>
                    <span className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-extrabold text-xs px-2.5 py-1 rounded-xl">
                      {scheme.subsidyAmount}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-zinc-100">
                      {scheme.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-3 mt-1 leading-relaxed">
                      {scheme.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    View Guidelines →
                  </button>
                  <button
                    onClick={() => setApplyModalScheme(scheme)}
                    className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    Fast-Track Apply
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column (4 Cols): Live News & Directives */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live News Bulletins */}
          <Card className="p-5 border border-gray-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-zinc-100">
                Latest Agricultural Directives & MSP
              </h3>
            </div>

            <div className="space-y-3">
              {news.map((item) => (
                <div 
                  key={item.id}
                  className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3.5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-bold mb-1">
                    <span className="bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded text-[10px] uppercase">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-gray-400">{item.dateDisplay}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-zinc-100">{item.title}</h4>
                  <p className="text-gray-600 dark:text-zinc-400 leading-relaxed">{item.summary}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* PMFBY Crop Damage Claim fast-track */}
          <Card
            onClick={() => navigateToSubScreen('officer_portal')}
            className="p-5 border-2 border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 cursor-pointer hover:shadow-md transition-all space-y-2"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-300">
                Crop Loss Compensation (PMFBY)
              </h4>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-400">
              Prepare and submit geotagged crop damage evidence within 72 hours of hailstorm or waterlogging for fast-track DBT compensation.
            </p>
            <span className="text-xs font-bold text-emerald-700 hover:underline inline-block pt-1">
              Open Evidence Desk →
            </span>
          </Card>
        </div>
      </div>

      {/* Scheme Details Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="max-w-xl w-full p-6 space-y-4 bg-white dark:bg-zinc-900 border-2 border-emerald-500 shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  {selectedScheme.category}
                </span>
                <h3 className="font-black text-lg text-gray-900 dark:text-zinc-100">
                  {selectedScheme.title}
                </h3>
                <span className="text-xs font-bold text-amber-600">{selectedScheme.subsidyAmount}</span>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <h4 className="font-bold text-gray-700 dark:text-zinc-300">Eligibility Criteria:</h4>
                <p className="text-gray-600 dark:text-zinc-400">{selectedScheme.eligibility}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 dark:text-zinc-300">Required Documents:</h4>
                <ul className="list-disc pl-4 text-gray-600 dark:text-zinc-400 space-y-0.5 mt-1">
                  {selectedScheme.requiredDocuments.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 dark:text-zinc-300">Application Procedure:</h4>
                <p className="whitespace-pre-line text-gray-600 dark:text-zinc-400">{selectedScheme.applicationProcess}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedScheme(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-500"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const s = selectedScheme;
                  setSelectedScheme(null);
                  setApplyModalScheme(s);
                }}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                Apply for this Scheme
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Apply Modal */}
      {applyModalScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="max-w-md w-full p-6 space-y-4 bg-white dark:bg-zinc-900 border-2 border-emerald-500 shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-black text-base text-gray-900 dark:text-zinc-100">
                  Fast-Track Application: {applyModalScheme.title}
                </h3>
                <p className="text-xs text-gray-500">Auto-filled from verified Kisan profile</p>
              </div>
              <button
                onClick={() => setApplyModalScheme(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold">Applicant Farmer Name</label>
                <input
                  type="text"
                  defaultValue="Ramesh Kumar"
                  required
                  className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="font-bold">Aadhaar Linked Mobile Number</label>
                <input
                  type="tel"
                  defaultValue="+91 98765 43210"
                  required
                  className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="font-bold">Land Parcel Khasra / Khatauni Number</label>
                <input
                  type="text"
                  defaultValue="Khasra 402/1A (5.0 Acres, Ludhiana)"
                  required
                  className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalScheme(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  Submit Application Dossier
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GovtSchemesScreen;

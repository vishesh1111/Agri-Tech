'use client';

import React, { useState } from 'react';
import { 
  Building2, Search, ExternalLink, FileText, CheckCircle2, 
  AlertCircle, ChevronRight, ShieldCheck, Sparkles, ArrowLeft,
  X, HelpCircle, Newspaper, Award, Landmark
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
    setApplicationSubmitted(`Application for ${applyModalScheme.title} submitted successfully! Reference number: KISAN-${Date.now().toString().slice(-6)}.`);
    setApplyModalScheme(null);
    setTimeout(() => setApplicationSubmitted(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Landmark className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              Government Schemes & Subsidies
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Direct income support (PM-KISAN), solar pumps (PM-KUSUM), crop insurance (PMFBY) & credit lines
          </p>
        </div>

        <button
          onClick={() => navigateToSubScreen('officer_portal')}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 hover:scale-105 active:scale-95 transition-all shadow-xs"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-700" />
          <span>Officer Verification Portal</span>
        </button>
      </div>

      {/* 2. Success Alert */}
      {applicationSubmitted && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2 border border-emerald-200 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{applicationSubmitted}</span>
        </div>
      )}

      {/* 3. Search & Category Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes, solar pumps, loans..."
            className="w-full bg-white text-zinc-900 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                selectedCategory === cat 
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300'
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
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Schemes & Programs ({filteredSchemes.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSchemes.map((scheme) => (
              <Card
                key={scheme.id}
                className="p-5 border border-zinc-200/80 bg-white hover:border-emerald-300 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded transition-transform duration-200 hover:scale-105">
                      {scheme.category}
                    </span>
                    <span className="text-xs font-semibold text-zinc-900">
                      {scheme.subsidyAmount}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900">
                      {scheme.title}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-3 mt-1 leading-relaxed">
                      {scheme.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:translate-x-0.5 transition-all"
                  >
                    Guidelines →
                  </button>
                  <button
                    onClick={() => setApplyModalScheme(scheme)}
                    className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 hover:scale-105 active:scale-95 transition-all shadow-xs"
                  >
                    Fast Apply
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column (4 Cols): Live News & Directives */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live News Bulletins */}
          <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-sm transition-all duration-200">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-emerald-700" />
              <h3 className="font-semibold text-sm text-zinc-900">
                Official Updates & MSP
              </h3>
            </div>

            <div className="space-y-2.5">
              {news.map((item) => (
                <div 
                  key={item.id}
                  className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-xs space-y-1 hover:bg-zinc-100/70 hover:translate-x-0.5 hover:border-zinc-200 transition-all duration-150"
                >
                  <div className="flex items-center justify-between text-zinc-500 text-[10px] mb-0.5">
                    <span className="font-medium text-zinc-700">{item.category}</span>
                    <span>{item.dateDisplay}</span>
                  </div>
                  <h4 className="font-medium text-zinc-900">{item.title}</h4>
                  <p className="text-zinc-500 leading-relaxed text-[11px]">{item.summary}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* PMFBY Crop Damage Claim fast-track */}
          <Card
            onClick={() => navigateToSubScreen('officer_portal')}
            className="p-5 border border-zinc-200/80 bg-white cursor-pointer hover:border-emerald-300 hover:-translate-y-1 hover:shadow-md transition-all duration-200 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)] group"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700 transition-transform duration-200 group-hover:scale-110" />
              <h4 className="font-semibold text-sm text-zinc-900">
                Crop Damage Verification
              </h4>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Prepare and submit geotagged crop damage evidence within 72 hours of adverse weather for compensation review.
            </p>
            <span className="text-xs font-semibold text-emerald-700 group-hover:underline group-hover:translate-x-1 inline-flex items-center gap-1 pt-1 transition-all">
              Open Evidence Desk →
            </span>
          </Card>
        </div>
      </div>

      {/* Scheme Details Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="max-w-lg w-full p-5 space-y-4 bg-white rounded-xl border border-zinc-200 shadow-xl animate-scale-in">
            <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedScheme.category}
                </span>
                <h3 className="font-semibold text-base text-zinc-900 mt-1">
                  {selectedScheme.title}
                </h3>
                <span className="text-xs font-medium text-zinc-500">{selectedScheme.subsidyAmount}</span>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="text-zinc-400 hover:text-zinc-600 hover:scale-110 active:scale-90 transition-all p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <h4 className="font-medium text-zinc-800">Eligibility:</h4>
                <p className="text-zinc-600 mt-0.5">{selectedScheme.eligibility}</p>
              </div>

              <div>
                <h4 className="font-medium text-zinc-800">Required Documents:</h4>
                <ul className="list-disc pl-4 text-zinc-600 space-y-0.5 mt-0.5">
                  {selectedScheme.requiredDocuments.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-zinc-800">Procedure:</h4>
                <p className="whitespace-pre-line text-zinc-600 mt-0.5">{selectedScheme.applicationProcess}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setSelectedScheme(null)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-800 hover:scale-105 active:scale-95 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const s = selectedScheme;
                  setSelectedScheme(null);
                  setApplyModalScheme(s);
                }}
                className="rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 hover:scale-105 active:scale-95 transition-all shadow-xs"
              >
                Apply for this Scheme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyModalScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="max-w-md w-full p-5 space-y-4 bg-white rounded-xl border border-zinc-200 shadow-xl animate-scale-in">
            <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900">
                  Fast Application: {applyModalScheme.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Auto-filled from verified Kisan profile</p>
              </div>
              <button
                onClick={() => setApplyModalScheme(null)}
                className="text-zinc-400 hover:text-zinc-600 hover:scale-110 active:scale-90 transition-all p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-zinc-700">Applicant Name</label>
                <input
                  type="text"
                  defaultValue="Ramesh Kumar"
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-200 p-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                />
              </div>

              <div>
                <label className="font-medium text-zinc-700">Mobile Number (Aadhaar Linked)</label>
                <input
                  type="tel"
                  defaultValue="+91 98765 43210"
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-200 p-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                />
              </div>

              <div>
                <label className="font-medium text-zinc-700">Land Parcel / Khasra Number</label>
                <input
                  type="text"
                  defaultValue="Khasra 402/1A (5.0 Acres, Ludhiana)"
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-200 p-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalScheme(null)}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-800 hover:scale-105 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 hover:scale-105 active:scale-95 transition-all shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovtSchemesScreen;

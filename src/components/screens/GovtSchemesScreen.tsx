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
  const { navigateBack, govtSchemes, govtNews } = useKisanStore();
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
      category: 'Direct Transfer',
      summary: 'Over ₹20,000 Crores released directly to eligible verified farmers bank accounts via DBT.'
    },
    {
      id: 'news_3',
      title: '80% Subsidy on Solar Agriculture Pumps extended in Punjab & Haryana',
      dateDisplay: '3 days ago',
      category: 'Solar Subsidy',
      summary: 'Farmers with verified tube-wells can claim 80% subsidy on 3HP to 7.5HP solar pumps.'
    }
  ];

  const filteredSchemes = schemes.filter(scheme => {
    const matchesCategory = selectedCategory === 'All Schemes' || scheme.category === selectedCategory;
    const matchesSearch = scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          scheme.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          scheme.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (applyModalScheme) {
      setApplicationSubmitted(`Application interest registered for ${applyModalScheme.title}! CSC representative will reach out.`);
      setApplyModalScheme(null);
      setTimeout(() => setApplicationSubmitted(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-700 text-white px-4 pt-4 pb-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={navigateBack}
            className="p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-300" />
              Govt Schemes & Subsidies
            </h1>
            <p className="text-xs text-emerald-100">Central & State welfare programs, direct benefits & insurance</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-emerald-300" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes, solar pumps, loans, subsidies..."
            className="w-full bg-emerald-800/60 placeholder-emerald-200 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none border border-emerald-600 focus:border-white transition-colors"
          />
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Success Alert */}
        {applicationSubmitted && (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-xl flex items-center gap-2 text-sm shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{applicationSubmitted}</span>
          </div>
        )}

        {/* Live News Bulletins */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-emerald-600" />
              Latest Agricultural Directives & MSP
            </h2>
          </div>
          <div className="space-y-2">
            {news.map(item => (
              <div 
                key={item.id}
                className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-xs"
              >
                <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-semibold mb-1">
                  <span className="bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.dateDisplay}</span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-1">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div>
          <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Browse By Category
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Schemes List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Found {filteredSchemes.length} schemes
            </span>
          </div>

          {filteredSchemes.map(scheme => (
            <Card key={scheme.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                    {scheme.category}
                  </span>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mt-1">
                    {scheme.title}
                  </h3>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold text-xs px-2.5 py-1 rounded-lg text-center flex-shrink-0">
                  {scheme.subsidyAmount}
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                {scheme.shortDescription}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedScheme(scheme)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
                >
                  View Details & Documents
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setApplyModalScheme(scheme)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
                >
                  Apply / Assistance
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  {selectedScheme.category}
                </span>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {selectedScheme.title}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedScheme(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">Subsidy / Benefit:</span>
              <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">{selectedScheme.subsidyAmount}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">About the Scheme</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{selectedScheme.shortDescription}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Who is Eligible?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                {selectedScheme.eligibility}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Mandatory Documents</h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                {selectedScheme.requiredDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Application Steps</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                {selectedScheme.applicationProcess}
              </p>
            </div>

            <div className="pt-2 flex gap-3">
              <a 
                href={selectedScheme.officialPortalUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Official Govt Portal
              </a>
              <button
                onClick={() => {
                  const s = selectedScheme;
                  setSelectedScheme(null);
                  setApplyModalScheme(s);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-xl shadow-sm transition-colors"
              >
                Apply Assistance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply / Help Modal */}
      {applyModalScheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <form 
            onSubmit={handleApplySubmit}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  Government Application Assistance
                </h3>
                <p className="text-xs text-slate-500">{applyModalScheme.title}</p>
              </div>
              <button 
                type="button"
                onClick={() => setApplyModalScheme(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Submit your farmer credentials. A certified Krishi Vigyan Kendra (KVK) or CSC representative will help you verify land documents and submit the online application.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Farmer Full Name</label>
                <input 
                  type="text" 
                  defaultValue="Ramesh Kumar" 
                  required
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Aadhaar Linked Phone</label>
                <input 
                  type="tel" 
                  defaultValue="+91 98765 43210" 
                  required
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Land Parcel / Khatauni Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. Khasra 402/1A (Ludhiana)" 
                  required
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApplyModalScheme(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                Submit Claim / Form
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default GovtSchemesScreen;

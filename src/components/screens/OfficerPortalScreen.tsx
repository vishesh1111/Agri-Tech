'use client';

import React, { useState } from 'react';
import { 
  Building, CheckCircle2, XCircle, Clock, ShieldCheck, 
  ArrowLeft, FileText, Camera, Upload, AlertTriangle, 
  MapPin, Eye, Search, Filter, Sparkles, UserCheck, Check
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';

interface CompensationClaim {
  id: string;
  farmerName: string;
  farmerId: string;
  phone: string;
  cropName: string;
  damageReason: string;
  affectedAcres: number;
  estimatedLossRs: number;
  submittedDate: string;
  status: 'PENDING_INSPECTION' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
  khasraNo: string;
  evidenceFiles: { name: string; type: 'image' | 'video' | 'pdf' }[];
  pesticideLogVerified: boolean;
  satelliteIndexChange: string;
  officerNotes?: string;
}

const INITIAL_CLAIMS: CompensationClaim[] = [
  {
    id: 'CLM-2026-9041',
    farmerName: 'Ramesh Kumar',
    farmerId: 'PB-LDH-8841',
    phone: '+91 98765 43210',
    cropName: 'Wheat (HD-3086)',
    damageReason: 'Unseasonal Hailstorm & Waterlogging (72h submersion)',
    affectedAcres: 3.5,
    estimatedLossRs: 78500,
    submittedDate: 'Oct 14, 2026',
    status: 'PENDING_INSPECTION',
    khasraNo: 'Khasra 402/1A (Ludhiana)',
    evidenceFiles: [
      { name: 'lodged_crop_field_geo.jpg', type: 'image' },
      { name: 'drone_survey_hail.mp4', type: 'video' },
      { name: 'patwari_girdawari_cert.pdf', type: 'pdf' }
    ],
    pesticideLogVerified: true,
    satelliteIndexChange: 'Sentinel-2 NDVI dropped from 0.72 to 0.31 post-storm (-56%)'
  },
  {
    id: 'CLM-2026-8812',
    farmerName: 'Gurpreet Singh',
    farmerId: 'PB-LDH-7721',
    phone: '+91 98123 45678',
    cropName: 'Mustard (Pusa Bold)',
    damageReason: 'Severe Aphid Outbreak post continuous cloudy spell',
    affectedAcres: 2.0,
    estimatedLossRs: 34000,
    submittedDate: 'Oct 12, 2026',
    status: 'VERIFIED',
    khasraNo: 'Khasra 118/3 (Samrala)',
    evidenceFiles: [
      { name: 'aphid_infestation_close.jpg', type: 'image' },
      { name: 'kisan_call_center_report.pdf', type: 'pdf' }
    ],
    pesticideLogVerified: true,
    satelliteIndexChange: 'NDVI drop -24% over 10 days'
  }
];

export const OfficerPortalScreen: React.FC = () => {
  const { addNotification } = useKisanStore();

  const [activeTab, setActiveTab] = useState<'OFFICER_PORTAL' | 'FARMER_SUBMIT'>('OFFICER_PORTAL');
  const [claims, setClaims] = useState<CompensationClaim[]>(INITIAL_CLAIMS);
  const [selectedClaim, setSelectedClaim] = useState<CompensationClaim | null>(claims[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Farmer submission form
  const [claimCrop, setClaimCrop] = useState('Wheat (HD-3086)');
  const [claimReason, setClaimReason] = useState('Hailstorm & Inundation');
  const [claimAcres, setClaimAcres] = useState('3.5');
  const [claimLoss, setClaimLoss] = useState('75000');
  const [claimSubmittedNotice, setClaimSubmittedNotice] = useState(false);

  const handleUpdateStatus = (claimId: string, newStatus: CompensationClaim['status']) => {
    setClaims(claims.map(c => c.id === claimId ? { ...c, status: newStatus } : c));
    if (selectedClaim?.id === claimId) {
      setSelectedClaim({ ...selectedClaim, status: newStatus });
    }

    addNotification({
      farmId: 'farm_1',
      title: `Compensation Claim ${newStatus}: ${claimId}`,
      message: `District Agriculture Officer updated status to ${newStatus}. Direct benefit disbursement queued.`,
      severity: newStatus === 'APPROVED' ? 'INFO' : newStatus === 'REJECTED' ? 'CRITICAL' : 'WARNING',
      type: 'GOVT_SCHEME'
    });
  };

  const handleFarmerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClaim: CompensationClaim = {
      id: `CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerName: 'Ramesh Kumar',
      farmerId: 'PB-LDH-8841',
      phone: '+91 98765 43210',
      cropName: claimCrop,
      damageReason: claimReason,
      affectedAcres: parseFloat(claimAcres) || 1,
      estimatedLossRs: parseInt(claimLoss) || 50000,
      submittedDate: 'Just Now',
      status: 'PENDING_INSPECTION',
      khasraNo: 'Khasra 402/1A (Ludhiana)',
      evidenceFiles: [
        { name: 'field_evidence_geotag.jpg', type: 'image' },
        { name: 'panchnama_loss_dossier.pdf', type: 'pdf' }
      ],
      pesticideLogVerified: true,
      satelliteIndexChange: 'Sentinel-2 Sentinel pass scheduled within 24h'
    };

    setClaims([newClaim, ...claims]);
    setSelectedClaim(newClaim);
    setClaimSubmittedNotice(true);
    setTimeout(() => setClaimSubmittedNotice(false), 6000);
  };

  const filteredClaims = claims.filter(c =>
    c.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.cropName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>🏛️</span>
            <span>Government Officer & Damage Compensation Verification Portal</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            PMFBY Claim Verification, Satellite remote sensing NDVI loss audits & direct farmer compensation submission
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('OFFICER_PORTAL')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'OFFICER_PORTAL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-gray-200'
            }`}
          >
            District Officer Review Desk
          </button>
          <button
            onClick={() => setActiveTab('FARMER_SUBMIT')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'FARMER_SUBMIT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-gray-200'
            }`}
          >
            Submit Crop Damage Claim
          </button>
        </div>
      </div>

      {activeTab === 'FARMER_SUBMIT' ? (
        /* Farmer Submission View */
        <div className="max-w-3xl mx-auto space-y-4">
          {claimSubmittedNotice && (
            <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 border border-emerald-300 shadow-xs animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Claim dossier generated & dispatched to District Agriculture Officer for fast-track DBT disbursement!</span>
            </div>
          )}

          <Card className="p-6 border border-gray-200 dark:border-zinc-800 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-zinc-100">
                Pradhan Mantri Fasal Bima (PMFBY) Crop Damage Claim
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Submit photographic and field records within 72 hours of natural calamity for government compensation.
              </p>
            </div>

            <form onSubmit={handleFarmerSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 dark:text-zinc-300">Damaged Crop</label>
                  <select
                    value={claimCrop}
                    onChange={(e) => setClaimCrop(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1"
                  >
                    <option value="Wheat (HD-3086)">Wheat (HD-3086)</option>
                    <option value="Paddy / Basmati">Paddy / Basmati</option>
                    <option value="Mustard (Pusa Bold)">Mustard (Pusa Bold)</option>
                    <option value="Cotton (Bt)">Cotton (Bt)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-zinc-300">Affected Land Area (Acres)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={claimAcres}
                    onChange={(e) => setClaimAcres(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-zinc-300">Cause of Calamity / Damage</label>
                <select
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1"
                >
                  <option value="Hailstorm & Inundation">Hailstorm & Unseasonal Rain Inundation</option>
                  <option value="Pest Outbreak (Locust / Aphid / Pink Bollworm)">Severe Pest / Disease Epidemic</option>
                  <option value="Drought / Heat Wave Terminal Stress">Severe Drought / Scorching Heat Wave</option>
                  <option value="Frost / Freezing Shock">Frost & Cold Wave Injury</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-zinc-300">Estimated Total Financial Loss (₹)</label>
                <input 
                  type="number"
                  value={claimLoss}
                  onChange={(e) => setClaimLoss(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1"
                />
              </div>

              {/* Evidence Upload */}
              <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-2xl p-5 text-center space-y-2 bg-gray-50/50 dark:bg-zinc-800/40">
                <Camera className="w-8 h-8 text-emerald-600 mx-auto" />
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 block">
                  Geo-Tagged Photos & Video of Crop Inundation
                </span>
                <p className="text-[11px] text-gray-500">
                  Photos automatically record GPS latitude, longitude, and timestamp for tamper-proof officer verification.
                </p>
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  2 Files Attached (Geo-tagged)
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-sm text-xs transition-all active:scale-95"
              >
                Submit Official PMFBY Claim Dossier
              </button>
            </form>
          </Card>
        </div>
      ) : (
        /* Officer Review Desk View (12-Column Desktop Grid) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Claims Queue List (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search claim ID or farmer..."
                className="w-full text-xs bg-white dark:bg-zinc-800 p-2.5 pl-9 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              {filteredClaims.map((claim) => (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaim(claim)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedClaim?.id === claim.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                      : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-gray-400">{claim.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      claim.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      claim.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                      claim.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {claim.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                    {claim.farmerName}
                  </h4>
                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                    {claim.cropName} • {claim.damageReason}
                  </p>
                  <span className="text-xs font-black text-emerald-600 block mt-1">
                    ₹{claim.estimatedLossRs.toLocaleString()} Claim
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Claim Details & Evidence Review Pane (7 Cols) */}
          {selectedClaim && (
            <div className="lg:col-span-7 space-y-4">
              <Card className="p-6 space-y-4 border border-gray-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-start justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 block">{selectedClaim.id}</span>
                    <h3 className="text-lg font-black text-gray-900 dark:text-zinc-100">
                      {selectedClaim.farmerName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Farmer ID: {selectedClaim.farmerId} • {selectedClaim.phone}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Claim Amount</span>
                    <span className="text-xl font-black text-emerald-600">
                      ₹{selectedClaim.estimatedLossRs.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-zinc-800/40 p-3 rounded-xl">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Crop & Area</span>
                    <strong className="text-gray-800 dark:text-zinc-200">{selectedClaim.cropName} ({selectedClaim.affectedAcres} Acres)</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Land Parcel</span>
                    <strong className="text-gray-800 dark:text-zinc-200">{selectedClaim.khasraNo}</strong>
                  </div>
                </div>

                {/* Remote Sensing Verification */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl p-3.5 text-xs space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Satellite Remote Sensing Verification (ISRO / Sentinel)
                  </span>
                  <p className="text-gray-800 dark:text-zinc-200 font-mono text-[11px]">
                    {selectedClaim.satelliteIndexChange}
                  </p>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px] pt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Farmer Sowing & Pesticide Log Verified on Digital Portal</span>
                  </div>
                </div>

                {/* Evidence Files */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-zinc-300 mb-2">
                    Submitted Digital Evidence ({selectedClaim.evidenceFiles.length} files):
                  </h4>
                  <div className="space-y-2">
                    {selectedClaim.evidenceFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 text-xs border border-gray-100 dark:border-zinc-700">
                        <span className="flex items-center gap-2 font-mono text-[11px] text-gray-800 dark:text-zinc-200">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          {file.name}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                          Geo-Tagged & Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Officer Actions */}
                <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedClaim.id, 'APPROVED')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Claim & Release DBT</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedClaim.id, 'REJECTED')}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Claim</span>
                  </button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OfficerPortalScreen;

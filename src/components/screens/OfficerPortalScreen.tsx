'use client';

import React, { useState } from 'react';
import { 
  Building, CheckCircle2, XCircle, Clock, ShieldCheck, 
  ArrowLeft, FileText, Camera, Upload, AlertTriangle, 
  MapPin, Eye, Search, Filter, Sparkles, UserCheck, Check,
  ShieldAlert
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
      title: `Claim ${newStatus}: ${claimId}`,
      message: `District Agriculture Officer updated status to ${newStatus}.`,
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
      satelliteIndexChange: 'Sentinel-2 pass scheduled within 24h'
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              Crop Damage Verification & Inspection Portal
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            PMFBY loss evidence verification, satellite NDVI damage audits, and claim submission
          </p>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('OFFICER_PORTAL')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'OFFICER_PORTAL'
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            Officer Review Desk
          </button>
          <button
            onClick={() => setActiveTab('FARMER_SUBMIT')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'FARMER_SUBMIT'
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            Submit Damage Claim
          </button>
        </div>
      </div>

      {activeTab === 'FARMER_SUBMIT' ? (
        /* Farmer Submission View */
        <div className="max-w-2xl mx-auto space-y-4">
          {claimSubmittedNotice && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Claim submitted to the District Agriculture Office for review.</span>
            </div>
          )}

          <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Crop Damage Claim Form (PMFBY)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Submit photos and field records within 72 hours of damage for compensation processing
              </p>
            </div>

            <form onSubmit={handleFarmerSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-zinc-700">Affected Crop</label>
                  <select
                    value={claimCrop}
                    onChange={(e) => setClaimCrop(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 mt-1"
                  >
                    <option value="Wheat (HD-3086)">Wheat (HD-3086)</option>
                    <option value="Paddy / Basmati">Paddy / Basmati</option>
                    <option value="Mustard (Pusa Bold)">Mustard (Pusa Bold)</option>
                    <option value="Cotton (Bt)">Cotton (Bt)</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-zinc-700">Affected Area (Acres)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={claimAcres}
                    onChange={(e) => setClaimAcres(e.target.value)}
                    required
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-zinc-700">Cause of Damage</label>
                <select
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 mt-1"
                >
                  <option value="Hailstorm & Inundation">Hailstorm & Waterlogging</option>
                  <option value="Pest Outbreak (Locust / Aphid / Pink Bollworm)">Severe Pest / Disease Outbreak</option>
                  <option value="Drought / Heat Wave Terminal Stress">Drought / Heat Wave</option>
                  <option value="Frost / Freezing Shock">Frost & Cold Injury</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-zinc-700">Estimated Loss Amount (₹)</label>
                <input 
                  type="number"
                  value={claimLoss}
                  onChange={(e) => setClaimLoss(e.target.value)}
                  required
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 mt-1"
                />
              </div>

              {/* Evidence Upload */}
              <div className="border border-dashed border-zinc-200 rounded-lg p-4 text-center space-y-1.5 bg-zinc-50">
                <Camera className="w-6 h-6 text-zinc-400 mx-auto" />
                <span className="text-xs font-medium text-zinc-800 block">
                  Geo-Tagged Photos & Video Evidence
                </span>
                <p className="text-[11px] text-zinc-400">
                  Photos automatically record GPS location and timestamp for official review.
                </p>
                <span className="inline-block bg-zinc-200 text-zinc-700 text-[10px] font-medium px-2 py-0.5 rounded">
                  2 files attached
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-2.5 rounded-lg text-xs transition-colors shadow-xs"
              >
                Submit PMFBY Claim
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
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search claim ID or farmer..."
                className="w-full text-xs bg-white p-2 pl-8 rounded-lg border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-2">
              {filteredClaims.map((claim) => (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaim(claim)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    selectedClaim?.id === claim.id
                      ? 'bg-zinc-50 border-zinc-900 shadow-xs'
                      : 'bg-white border-zinc-200/80 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-zinc-400">{claim.id}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      claim.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' :
                      claim.status === 'REJECTED' ? 'bg-rose-50 text-rose-800 border border-rose-200/60' :
                      claim.status === 'VERIFIED' ? 'bg-zinc-100 text-zinc-700' :
                      'bg-amber-50 text-amber-800 border border-amber-200/60'
                    }`}>
                      {claim.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-zinc-900">
                    {claim.farmerName}
                  </h4>
                  <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                    {claim.cropName} · {claim.damageReason}
                  </p>
                  <span className="text-xs font-semibold text-zinc-900 block mt-1">
                    ₹{claim.estimatedLossRs.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Claim Details & Evidence Review Pane (7 Cols) */}
          {selectedClaim && (
            <div className="lg:col-span-7 space-y-4">
              <Card className="p-5 space-y-4 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block">{selectedClaim.id}</span>
                    <h3 className="text-base font-semibold text-zinc-900">
                      {selectedClaim.farmerName}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      ID: {selectedClaim.farmerId} · {selectedClaim.phone}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block">Claimed Loss</span>
                    <span className="text-lg font-semibold text-zinc-900">
                      ₹{selectedClaim.estimatedLossRs.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Crop & Area</span>
                    <span className="font-medium text-zinc-800">{selectedClaim.cropName} ({selectedClaim.affectedAcres} Acres)</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Land Parcel</span>
                    <span className="font-medium text-zinc-800">{selectedClaim.khasraNo}</span>
                  </div>
                </div>

                {/* Remote Sensing Verification */}
                <div className="bg-zinc-50 border border-zinc-200/80 rounded-lg p-3 text-xs space-y-1">
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block">
                    Satellite Remote Sensing (NDVI Analysis)
                  </span>
                  <p className="text-zinc-700 font-mono text-[11px]">
                    {selectedClaim.satelliteIndexChange}
                  </p>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px] pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Farmer Sowing & Pesticide Log Verified</span>
                  </div>
                </div>

                {/* Evidence Files */}
                <div>
                  <h4 className="text-xs font-medium text-zinc-700 mb-2">
                    Submitted Evidence ({selectedClaim.evidenceFiles.length} files):
                  </h4>
                  <div className="space-y-1.5">
                    {selectedClaim.evidenceFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 text-xs border border-zinc-100">
                        <span className="flex items-center gap-2 font-mono text-[11px] text-zinc-700">
                          <FileText className="w-3.5 h-3.5 text-zinc-500" />
                          {file.name}
                        </span>
                        <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          Geo-Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Officer Actions */}
                <div className="pt-3 border-t border-zinc-100 flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedClaim.id, 'APPROVED')}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Claim</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedClaim.id, 'REJECTED')}
                    className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
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

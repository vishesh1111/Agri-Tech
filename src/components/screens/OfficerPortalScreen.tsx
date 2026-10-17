'use client';

import React, { useState } from 'react';
import { 
  Building, CheckCircle2, XCircle, Clock, ShieldCheck, 
  ArrowLeft, FileText, Camera, Upload, AlertTriangle, 
  MapPin, Eye, Search, Filter, Sparkles, UserCheck
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
  const { navigateBack, addNotification } = useKisanStore();

  const [activeTab, setActiveTab] = useState<'OFFICER_PORTAL' | 'FARMER_SUBMIT'>('OFFICER_PORTAL');
  const [claims, setClaims] = useState<CompensationClaim[]>(INITIAL_CLAIMS);
  const [selectedClaim, setSelectedClaim] = useState<CompensationClaim | null>(claims[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Farmer submission form
  const [claimCrop, setClaimCrop] = useState('Wheat');
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
      estimatedLossRs: parseFloat(claimLoss) || 50000,
      submittedDate: 'Today',
      status: 'PENDING_INSPECTION',
      khasraNo: 'Khasra 402/1A',
      evidenceFiles: [
        { name: 'field_evidence_photo_1.jpg', type: 'image' },
        { name: 'sowing_receipt_verified.pdf', type: 'pdf' }
      ],
      pesticideLogVerified: true,
      satelliteIndexChange: 'Pending satellite pass'
    };

    setClaims([newClaim, ...claims]);
    setClaimSubmittedNotice(true);
    setTimeout(() => {
      setClaimSubmittedNotice(false);
      setActiveTab('OFFICER_PORTAL');
      setSelectedClaim(newClaim);
    }, 2000);
  };

  const filteredClaims = claims.filter(c => 
    c.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.cropName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white px-4 pt-4 pb-5 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={navigateBack}
              className="p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-400" />
                Govt Officer & Damage Portal
              </h1>
              <p className="text-xs text-emerald-200">PMFBY Claim Verification & Compensation Registry</p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('OFFICER_PORTAL')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'OFFICER_PORTAL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            🏛️ District Officer Review Desk
          </button>
          <button
            onClick={() => setActiveTab('FARMER_SUBMIT')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'FARMER_SUBMIT'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            📝 Submit Crop Damage Claim
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-4xl mx-auto">
        {activeTab === 'FARMER_SUBMIT' ? (
          /* Farmer Submission View */
          <div className="space-y-4">
            {claimSubmittedNotice && (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Claim dossier generated & dispatched to District Agriculture Officer for fast-track DBT!</span>
              </div>
            )}

            <Card className="p-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Pradhan Mantri Fasal Bima (PMFBY) Crop Damage Claim
                </h3>
                <p className="text-xs text-slate-500">
                  Submit photographic and field records within 72 hours of natural calamity for government compensation.
                </p>
              </div>

              <form onSubmit={handleFarmerSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Damaged Crop</label>
                    <select
                      value={claimCrop}
                      onChange={(e) => setClaimCrop(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
                    >
                      <option value="Wheat (HD-3086)">Wheat (HD-3086)</option>
                      <option value="Paddy / Basmati">Paddy / Basmati</option>
                      <option value="Mustard (Pusa Bold)">Mustard (Pusa Bold)</option>
                      <option value="Cotton (Bt)">Cotton (Bt)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Affected Land Area (Acres)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={claimAcres}
                      onChange={(e) => setClaimAcres(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cause of Calamity / Damage</label>
                  <select
                    value={claimReason}
                    onChange={(e) => setClaimReason(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
                  >
                    <option value="Hailstorm & Inundation">Hailstorm & Unseasonal Rain Inundation</option>
                    <option value="Pest Outbreak (Locust / Aphid / Pink Bollworm)">Severe Pest / Disease Epidemic</option>
                    <option value="Drought / Heat Wave Terminal Stress">Severe Drought / Scorching Heat Wave</option>
                    <option value="Frost / Freezing Shock">Frost & Cold Wave Injury</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Estimated Total Financial Loss (₹)</label>
                  <input 
                    type="number"
                    value={claimLoss}
                    onChange={(e) => setClaimLoss(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
                  />
                </div>

                {/* Evidence Upload */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center space-y-2 bg-slate-50 dark:bg-slate-800/40">
                  <Camera className="w-8 h-8 text-emerald-600 mx-auto" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Upload Geo-Tagged Photos & Video of Crop Inundation
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Photos automatically record GPS latitude, longitude, and timestamp for tamper-proof officer verification.
                  </p>
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    2 Files Attached (Geo-tagged)
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition-colors"
                >
                  Submit Official PMFBY Claim Dossier
                </button>
              </form>
            </Card>
          </div>
        ) : (
          /* Officer Review Desk View */
          <div className="grid md:grid-cols-12 gap-4">
            {/* Claims Queue list */}
            <div className="md:col-span-5 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search claim ID or farmer..."
                  className="w-full text-xs bg-white dark:bg-slate-800 p-2.5 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                {filteredClaims.map(claim => (
                  <div
                    key={claim.id}
                    onClick={() => setSelectedClaim(claim)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedClaim?.id === claim.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold text-slate-400">{claim.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        claim.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        claim.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        claim.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {claim.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {claim.farmerName}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{claim.cropName} • {claim.damageReason}</p>
                    <span className="text-[10px] font-bold text-emerald-600 block mt-1">₹{claim.estimatedLossRs.toLocaleString()} Claim</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Claim Details & Evidence Review Pane */}
            {selectedClaim && (
              <div className="md:col-span-7 space-y-3">
                <Card className="p-4 space-y-4 shadow-md">
                  <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">{selectedClaim.id}</span>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                        {selectedClaim.farmerName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Farmer ID: {selectedClaim.farmerId} • {selectedClaim.phone}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Claim Amount</span>
                      <span className="text-lg font-black text-emerald-600">
                        ₹{selectedClaim.estimatedLossRs.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Crop & Area</span>
                      <strong className="text-slate-700 dark:text-slate-200">{selectedClaim.cropName} ({selectedClaim.affectedAcres} Acres)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Land Parcel</span>
                      <strong className="text-slate-700 dark:text-slate-200">{selectedClaim.khasraNo}</strong>
                    </div>
                  </div>

                  {/* Remote Sensing Verification */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl p-3 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Satellite Remote Sensing Verification (ISRO / Sentinel)
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      {selectedClaim.satelliteIndexChange}
                    </p>
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px] pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Farmer Sowing & Pesticide Log Verified on Blockchain
                    </div>
                  </div>

                  {/* Evidence Files */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Submitted Digital Evidence ({selectedClaim.evidenceFiles.length} files):
                    </h4>
                    <div className="space-y-1.5">
                      {selectedClaim.evidenceFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700">
                          <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            {file.name}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Geo-Tagged & Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Officer Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedClaim.id, 'APPROVED')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Release DBT
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedClaim.id, 'REJECTED')}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Claim
                    </button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default OfficerPortalScreen;

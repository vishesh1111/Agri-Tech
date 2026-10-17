'use client';

import React, { useState } from 'react';
import { 
  User, Phone, MapPin, Award, CheckCircle2, 
  ArrowLeft, Edit3, Save, Shield, HelpCircle, Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';
import { UserProfile } from '@/lib/types';

export const FarmerProfileScreen: React.FC = () => {
  const { userProfile, navigateBack, navigateToSubScreen } = useKisanStore();

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [name, setName] = useState(userProfile?.name || 'Ramesh Kumar');
  const [phone, setPhone] = useState(userProfile?.phone || '+91 98765 43210');
  const [age, setAge] = useState(userProfile?.age?.toString() || '46');
  const [village, setVillage] = useState(userProfile?.village || 'Khanna Kalan');
  const [district, setDistrict] = useState(userProfile?.district || 'Ludhiana');
  const [state, setState] = useState(userProfile?.state || 'Punjab');
  const [pinCode, setPinCode] = useState(userProfile?.pinCode || '141401');
  const [farmingType, setFarmingType] = useState(userProfile?.farmingType || 'Commercial Grain & Dairy');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-700 text-white px-4 pt-4 pb-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={navigateBack}
              className="p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Farmer Profile</h1>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-semibold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel' : 'Edit Details'}
          </button>
        </div>

        {/* Profile Avatar Banner */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white text-emerald-800 font-black text-xl flex items-center justify-center shadow-lg border-2 border-emerald-300">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-lg font-bold">{name}</h2>
            <p className="text-xs text-emerald-100 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {village}, {district}, {state}
            </p>
            <span className="inline-block mt-1 bg-emerald-800/80 text-[10px] font-bold px-2 py-0.5 rounded text-emerald-200">
              Verified Farmer ID: PB-LDH-2024-8841
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {savedSuccess && (
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Identity & Aadhaar */}
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Identity & Govt Registration
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Farmer Full Name</label>
              <input 
                type="text"
                disabled={!isEditing}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1 disabled:opacity-75"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mobile (Aadhaar linked)</label>
                <input 
                  type="tel"
                  disabled={!isEditing}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1 disabled:opacity-75"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Age</label>
                <input 
                  type="number"
                  disabled={!isEditing}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1 disabled:opacity-75"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Aadhaar Card (e-KYC Verified)</label>
              <div className="text-xs font-mono p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 mt-1 flex items-center justify-between">
                <span>XXXX-XXXX-9842</span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>
          </Card>

          {/* Location & Farm Holding */}
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Residential & Land Location
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Village</label>
                <input 
                  type="text"
                  disabled={!isEditing}
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1 disabled:opacity-75"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">District</label>
                <input 
                  type="text"
                  disabled={!isEditing}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1 disabled:opacity-75"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">State</label>
                <input 
                  type="text"
                  disabled={!isEditing}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1 disabled:opacity-75"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">PIN Code</label>
                <input 
                  type="text"
                  disabled={!isEditing}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1 disabled:opacity-75"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Farming Operation Type</label>
              <input 
                type="text"
                disabled={!isEditing}
                value={farmingType}
                onChange={(e) => setFarmingType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1 disabled:opacity-75"
              />
            </div>
          </Card>

          {isEditing && (
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition-colors"
            >
              Save Profile Changes
            </button>
          )}
        </form>

        {/* Quick Links */}
        <div className="pt-2">
          <button
            onClick={() => navigateToSubScreen('settings')}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-3 rounded-xl text-xs hover:bg-slate-200 transition-colors"
          >
            Open App Settings & Language
          </button>
        </div>
      </div>
    </div>
  );
};
export default FarmerProfileScreen;

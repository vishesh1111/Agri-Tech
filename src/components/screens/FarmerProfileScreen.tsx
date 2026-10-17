'use client';

import React, { useState } from 'react';
import { 
  User, Phone, MapPin, Award, CheckCircle2, 
  Edit3, Save, Shield, HelpCircle, Sparkles, Building
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';
import { UserProfile } from '@/lib/types';

export const FarmerProfileScreen: React.FC = () => {
  const { userProfile, navigateToSubScreen } = useKisanStore();

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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>👤</span>
            <span>Farmer Profile & Government Credentials</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Verified PM-KISAN Aadhaar linkage, landholding credentials & agricultural certifications
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all active:scale-95"
        >
          <Edit3 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile Information'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 border border-emerald-300 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile details updated successfully!</span>
        </div>
      )}

      {/* 2. Profile Avatar Banner */}
      <Card className="p-6 border border-gray-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-600 to-green-800 text-white">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-white text-emerald-800 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-emerald-300">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              <h2 className="text-2xl font-black">{name}</h2>
              <span className="bg-emerald-950/80 text-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Verified Landowner
              </span>
            </div>
            <p className="text-xs text-emerald-100 mt-1 flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{village}, {district}, {state} ({pinCode})</span>
            </p>
            <span className="inline-block mt-2 bg-emerald-900/60 font-mono text-xs font-bold px-3 py-1 rounded-xl text-emerald-200">
              Kisan Registration ID: PB-LDH-2026-8841
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Form Grid (2 Columns) */}
      <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        {/* Left Column: Personal & Contact */}
        <Card className="p-6 border border-gray-200 dark:border-zinc-800 space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-zinc-100 uppercase tracking-wider">
            Identity & Contact Details
          </h3>

          <div>
            <label className="font-bold text-gray-700 dark:text-zinc-300">Full Name</label>
            <input 
              type="text"
              disabled={!isEditing}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1 disabled:opacity-75"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-zinc-300">Phone Number</label>
            <input 
              type="tel"
              disabled={!isEditing}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1 disabled:opacity-75"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-zinc-300">Age</label>
            <input 
              type="number"
              disabled={!isEditing}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1 disabled:opacity-75"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-zinc-300">Aadhaar Verification Status</label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 mt-1 font-mono font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>XXXX-XXXX-4819 (e-KYC Completed)</span>
            </div>
          </div>
        </Card>

        {/* Right Column: Agricultural & Holding Details */}
        <Card className="p-6 border border-gray-200 dark:border-zinc-800 space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-zinc-100 uppercase tracking-wider">
            Agricultural Holding & Operations
          </h3>

          <div>
            <label className="font-bold text-gray-700 dark:text-zinc-300">Farming Operation Type</label>
            <input 
              type="text"
              disabled={!isEditing}
              value={farmingType}
              onChange={(e) => setFarmingType(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1 disabled:opacity-75"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-zinc-300">Village / Town</label>
            <input 
              type="text"
              disabled={!isEditing}
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1 disabled:opacity-75"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300">District</label>
              <input 
                type="text"
                disabled={!isEditing}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1 disabled:opacity-75"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300">State</label>
              <input 
                type="text"
                disabled={!isEditing}
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1 disabled:opacity-75"
              />
            </div>
          </div>

          {isEditing && (
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all mt-4"
            >
              Save Profile Changes
            </button>
          )}
        </Card>
      </form>
    </div>
  );
};

export default FarmerProfileScreen;

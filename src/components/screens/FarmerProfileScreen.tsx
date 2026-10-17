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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <User className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              Farmer Profile & Landholder Identity
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            PM-KISAN Aadhaar linkage, landholding credentials & agricultural details
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 hover:scale-105 active:scale-95 transition-all shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Information'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2 border border-emerald-200 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile details saved successfully!</span>
        </div>
      )}

      {/* 2. Profile Avatar Banner */}
      <Card className="p-5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-sm transition-all duration-200">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-xl bg-zinc-100 text-zinc-800 font-semibold text-xl flex items-center justify-center border border-zinc-200 shadow-2xs hover:scale-105 transition-transform duration-200">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-zinc-900">{name}</h2>
              <span className="bg-emerald-50 text-emerald-800 text-[11px] font-medium px-2 py-0.5 rounded border border-emerald-200/60 hover:scale-105 transition-transform duration-200">
                Verified Landowner
              </span>
            </div>
            <p className="text-xs text-zinc-500 flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>{village}, {district}, {state} ({pinCode})</span>
            </p>
            <span className="text-[11px] font-mono text-zinc-500 block">
              Registration ID: PB-LDH-2026-8841
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Form Grid (2 Columns) */}
      <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        {/* Left Column: Personal & Contact */}
        <Card className="p-5 border border-zinc-200/80 bg-white space-y-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h3 className="font-semibold text-sm text-zinc-900">
            Identity & Contact
          </h3>

          <div>
            <label className="font-medium text-zinc-700">Full Name</label>
            <input 
              type="text"
              disabled={!isEditing}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 mt-1 disabled:bg-zinc-50 disabled:text-zinc-500"
            />
          </div>

          <div>
            <label className="font-medium text-zinc-700">Phone Number</label>
            <input 
              type="tel"
              disabled={!isEditing}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 mt-1 disabled:bg-zinc-50 disabled:text-zinc-500"
            />
          </div>

          <div>
            <label className="font-medium text-zinc-700">Age</label>
            <input 
              type="number"
              disabled={!isEditing}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 mt-1 disabled:bg-zinc-50 disabled:text-zinc-500"
            />
          </div>

          <div>
            <label className="font-medium text-zinc-700">Aadhaar Status</label>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 mt-1 font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>XXXX-XXXX-4819 · e-KYC Verified</span>
            </div>
          </div>
        </Card>

        {/* Right Column: Agricultural & Holding Details */}
        <Card className="p-5 border border-zinc-200/80 bg-white space-y-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h3 className="font-semibold text-sm text-zinc-900">
            Farming Holding & Location
          </h3>

          <div>
            <label className="font-medium text-zinc-700">Farming Operation Type</label>
            <input 
              type="text"
              disabled={!isEditing}
              value={farmingType}
              onChange={(e) => setFarmingType(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 mt-1 disabled:bg-zinc-50 disabled:text-zinc-500"
            />
          </div>

          <div>
            <label className="font-medium text-zinc-700">Village / Town</label>
            <input 
              type="text"
              disabled={!isEditing}
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 mt-1 disabled:bg-zinc-50 disabled:text-zinc-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-zinc-700">District</label>
              <input 
                type="text"
                disabled={!isEditing}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 mt-1 disabled:bg-zinc-50 disabled:text-zinc-500"
              />
            </div>
            <div>
              <label className="font-medium text-zinc-700">State</label>
              <input 
                type="text"
                disabled={!isEditing}
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 mt-1 disabled:bg-zinc-50 disabled:text-zinc-500"
              />
            </div>
          </div>

          {isEditing && (
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-700 py-2.5 text-xs font-medium text-white hover:bg-emerald-800 hover:scale-102 active:scale-98 transition-all shadow-xs mt-2"
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

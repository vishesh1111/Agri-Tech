'use client';

import React, { useState } from 'react';
import {
  Plus,
  Sprout,
  Calculator,
  Droplets,
  Calendar,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { Card, Badge } from '@/components/ui/Card';
import { FertilizerCalculator } from '@/lib/calculators/fertilizerCalculator';

export function FarmsScreen() {
  const {
    farms,
    selectedFarmId,
    selectFarm,
    parcels,
    tasks,
    soilHealthRecords,
    advanceFarmDay,
    logSoilHealthRecord,
    addNewActiveFarm,
    navigateToSubScreen,
  } = useKisanStore();

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];
  const farmParcels = parcels.filter((p) => p.farmId === (selectedFarmId || activeFarm?.id));
  const farmTasks = tasks.filter((t) => t.farmId === (selectedFarmId || activeFarm?.id));

  // Add Farm Collapsible State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmType, setNewFarmType] = useState('Agriculture');
  const [newArea, setNewArea] = useState('5.0');
  const [newUnit, setNewUnit] = useState('Acres');
  const [newPrimary, setNewPrimary] = useState('Wheat');
  const [newOwnership, setNewOwnership] = useState('Ancestral Owned');
  const [newVillage, setNewVillage] = useState('Samrala');
  const [newDistrict, setNewDistrict] = useState('Ludhiana');
  const [newState, setNewState] = useState('Punjab');
  const [newSoilType, setNewSoilType] = useState('Loamy Alluvial');
  const [newTestingStatus, setNewTestingStatus] = useState('Recent Test (Within 6 Months)');
  const [newFertilizerPractice, setNewFertilizerPractice] = useState('Balanced Organic + NPK');
  const [newDrainage, setNewDrainage] = useState('Excellent (No Waterlogging)');
  const [newWaterSource, setNewWaterSource] = useState('Borewell & Solar Pump');
  const [newPestPressure, setNewPestPressure] = useState('None (Clean & Healthy)');
  const [newDiseaseSigns, setNewDiseaseSigns] = useState('No Disease Signs (Vibrant Green)');
  const [newSeedQuality, setNewSeedQuality] = useState('Certified Hybrid / Govt Verified');
  const [newBoundaryFencing, setNewBoundaryFencing] = useState('Solar / Wire Fenced');

  // Fertilizer Calculator interactive state
  const [calcCrop, setCalcCrop] = useState('Wheat');
  const [calcArea, setCalcArea] = useState(activeFarm?.totalArea || 5.0);
  const dosage = FertilizerCalculator.calculateDosage(calcCrop, calcArea, activeFarm?.unit || 'Acres');

  // Soil entry state
  const [showSoilEntry, setShowSoilEntry] = useState(false);
  const [soilPh, setSoilPh] = useState('6.8');
  const [soilMoisture, setSoilMoisture] = useState('58');
  const [soilNotes, setSoilNotes] = useState('');

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmName.trim()) return;
    await addNewActiveFarm({
      name: newFarmName,
      type: newFarmType,
      area: parseFloat(newArea) || 5.0,
      unit: newUnit,
      primaryCropOrAnimal: newPrimary,
      ownership: newOwnership,
      houseNo: '',
      landmark: '',
      village: newVillage,
      district: newDistrict,
      state: newState,
      pinCode: '141114',
      soilType: newSoilType,
      soilTestingStatus: newTestingStatus,
      fertilizerPractice: newFertilizerPractice,
      drainageCondition: newDrainage,
      waterSource: newWaterSource,
      pestPressure: newPestPressure,
      diseaseSigns: newDiseaseSigns,
      seedQuality: newSeedQuality,
      boundaryFencing: newBoundaryFencing,
    });
    setNewFarmName('');
    setShowAddForm(false);
  };

  const handleAddSoilRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    await logSoilHealthRecord({
      farmId: selectedFarmId || activeFarm?.id || 'farm_1',
      dateLabel: 'Today',
      phLevel: parseFloat(soilPh) || 6.8,
      moisturePercent: parseFloat(soilMoisture) || 58.0,
      nitrogenKgHa: 144,
      phosphorusKgHa: 40,
      potassiumKgHa: 205,
      organicCarbonPercent: 0.72,
      soilTemperatureCelsius: 24.0,
      electricalConductivityEc: 1.15,
      source: 'Digital Soil Probe',
      sensorDeviceName: 'KrishiProbe V3',
      sensorBatteryPercent: 92,
      notes: soilNotes || 'Regular field check',
    });
    setShowSoilEntry(false);
    setSoilNotes('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar with Farm Selector & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            Fields & Land Parcels
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage field boundaries, soil parameters, and nutrient dosage plans
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeFarm && (
            <button
              onClick={() => advanceFarmDay(activeFarm.id)}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 px-4 py-2.5 text-xs font-semibold text-zinc-700 transition-all cursor-pointer shadow-2xs"
            >
              <Calendar className="h-4 w-4 text-zinc-500" />
              <span>Advance Day (+1)</span>
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-xs cursor-pointer hover:shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{showAddForm ? 'Cancel' : 'Add Field'}</span>
          </button>
        </div>
      </div>

      {/* Farm Selection Tabs Bar */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {farms.map((f) => (
          <button
            key={f.id}
            onClick={() => selectFarm(f.id)}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center gap-2 ${
              (selectedFarmId || activeFarm?.id) === f.id
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
            }`}
          >
            <Sprout className={`h-4 w-4 ${(selectedFarmId || activeFarm?.id) === f.id ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span>{f.name}</span>
            <span className={`text-[11px] font-normal ${(selectedFarmId || activeFarm?.id) === f.id ? 'text-zinc-300' : 'text-zinc-400'}`}>({f.totalArea} {f.unit})</span>
          </button>
        ))}
      </div>

      {/* Add New Farm Form (Collapsible) */}
      {showAddForm && (
        <Card className="p-6 rounded-2xl border border-zinc-200/80 bg-white space-y-5 shadow-xs">
          <div className="border-b border-zinc-100 pb-3">
            <h3 className="font-bold text-base text-zinc-900">
              Register New Land Parcel / Farm
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Provide boundary and soil details for automated agronomic recommendations</p>
          </div>
          <form onSubmit={handleCreateFarm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700">Farm Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Field"
                  value={newFarmName}
                  onChange={(e) => setNewFarmName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5 text-sm font-medium text-zinc-900 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">Primary Crop</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wheat, Basmati Rice"
                  value={newPrimary}
                  onChange={(e) => setNewPrimary(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5 text-sm font-medium text-zinc-900 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">Total Area & Unit</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-1/2 rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5 text-sm font-medium text-zinc-900 outline-none focus:bg-white focus:border-emerald-500"
                  />
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-1/2 rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5 text-sm font-semibold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500"
                  >
                    <option>Acres</option>
                    <option>Bigha</option>
                    <option>Hectares</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">Soil Type</label>
                <select
                  value={newSoilType}
                  onChange={(e) => setNewSoilType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5 text-sm font-semibold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500"
                >
                  <option>Loamy Alluvial</option>
                  <option>Black Cotton Soil</option>
                  <option>Clay Loam</option>
                  <option>Sandy Loam</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">Water Source</label>
                <select
                  value={newWaterSource}
                  onChange={(e) => setNewWaterSource(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5 text-sm font-semibold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500"
                >
                  <option>Borewell & Solar Pump</option>
                  <option>Canal Irrigation</option>
                  <option>Drip Irrigation</option>
                  <option>Rainfed Only</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">Drainage Condition</label>
                <select
                  value={newDrainage}
                  onChange={(e) => setNewDrainage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5 text-sm font-semibold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500"
                >
                  <option>Excellent (No Waterlogging)</option>
                  <option>Moderate (Occasional standing water)</option>
                  <option>Poor (Frequent waterlogging)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">Location (Village, State)</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Village"
                    value={newVillage}
                    onChange={(e) => setNewVillage(e.target.value)}
                    className="w-1/2 rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5 text-sm font-medium text-zinc-900 outline-none focus:bg-white focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-1/2 rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5 text-sm font-medium text-zinc-900 outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">Ownership</label>
                <select
                  value={newOwnership}
                  onChange={(e) => setNewOwnership(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5 text-sm font-semibold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500"
                >
                  <option>Ancestral Owned</option>
                  <option>Leased / Rented</option>
                  <option>Sharecropping (Batai)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
              >
                Save Farm
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Selected Farm High-Level Overview Card */}
      {activeFarm && (
        <Card className="p-5 sm:p-6 rounded-2xl border border-zinc-200/80 bg-white space-y-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                  {activeFarm.name}
                </h2>
                <Badge variant={activeFarm.healthScore >= 80 ? 'success' : 'warning'}>
                  Score: {activeFarm.healthScore}/100
                </Badge>
                <span className="text-xs font-semibold text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full">
                  Day {activeFarm.activeDay} of season
                </span>
              </div>
              <p className="text-sm text-zinc-600 mt-1.5 font-medium">
                {activeFarm.totalArea} {activeFarm.unit} · {activeFarm.soilType} · {activeFarm.ownership} · {activeFarm.location}
              </p>
            </div>

            {/* Quick links */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => navigateToSubScreen('soil_report')}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-emerald-300 hover:shadow-xs px-3.5 py-2 text-xs font-semibold text-zinc-800 transition-all duration-200 cursor-pointer"
              >
                <Sprout className="h-4 w-4 text-emerald-700" />
                <span>Soil Card</span>
              </button>
              <button
                onClick={() => navigateToSubScreen('irrigation_detail')}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-blue-300 hover:shadow-xs px-3.5 py-2 text-xs font-semibold text-zinc-800 transition-all duration-200 cursor-pointer"
              >
                <Droplets className="h-4 w-4 text-blue-600" />
                <span>Irrigation</span>
              </button>
              <button
                onClick={() => navigateToSubScreen('crop_doctor')}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-amber-300 hover:shadow-xs px-3.5 py-2 text-xs font-semibold text-zinc-800 transition-all duration-200 cursor-pointer"
              >
                <Activity className="h-4 w-4 text-amber-600" />
                <span>Crop Doctor</span>
              </button>
            </div>
          </div>

          {/* Sub-Score Bars - Prominent & Focused */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-zinc-100">
            <div className="rounded-xl bg-zinc-50/80 border border-zinc-200/70 p-4 hover:border-emerald-200 transition-colors">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block">Soil Health</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">{activeFarm.soilHealthScore}%</span>
                <span className="text-xs font-medium text-emerald-700">Optimal NPK</span>
              </div>
            </div>
            <div className="rounded-xl bg-zinc-50/80 border border-zinc-200/70 p-4 hover:border-blue-200 transition-colors">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block">Water Delivery</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">{activeFarm.waterHealthScore}%</span>
                <span className="text-xs font-medium text-blue-700">Borewell & Solar</span>
              </div>
            </div>
            <div className="rounded-xl bg-zinc-50/80 border border-zinc-200/70 p-4 hover:border-teal-200 transition-colors">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block">Pest Pressure</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">{activeFarm.pestHealthScore}%</span>
                <span className="text-xs font-medium text-emerald-700">Clean Field</span>
              </div>
            </div>
            <div className="rounded-xl bg-zinc-50/80 border border-zinc-200/70 p-4 hover:border-purple-200 transition-colors">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block">Active Tasks</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">{farmTasks.length}</span>
                <span className="text-xs font-medium text-purple-700">Actions Today</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 2. Main 12-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Columns): Parcels Grid + Soil Health Logs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Field Plots Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Land Parcels ({farmParcels.length})
                </h3>
              </div>
              <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-md">
                Total: {activeFarm?.totalArea} {activeFarm?.unit}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {farmParcels.map((p) => {
                const cleanCrop = p.currentCrop
                  ? p.currentCrop.replace(/\s*\(HD-?\d+\)/gi, ' (Pusa Gautami)').replace(/HD-?\d+\s*/gi, '')
                  : 'Wheat (Pusa Gautami)';
                return (
                  <Card key={p.id} className="p-5 rounded-2xl border border-zinc-200/80 bg-white space-y-4 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-zinc-900">
                          {p.name}
                        </h4>
                        <p className="text-xs font-medium text-zinc-600 mt-1">
                          Crop: <span className="font-semibold text-zinc-800">{cleanCrop}</span>
                        </p>
                      </div>
                      <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70 px-2.5 py-1 rounded-lg shrink-0">
                        {p.area} Acres
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 rounded-xl bg-zinc-50 border border-zinc-200/70 p-3 text-center">
                      <div>
                        <span className="text-xs font-semibold text-zinc-500 block">pH</span>
                        <p className="font-bold text-sm sm:text-base text-zinc-900 mt-0.5">{p.ph}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-500 block">N</span>
                        <p className="font-bold text-sm sm:text-base text-zinc-900 mt-0.5">{p.nitrogen}%</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-500 block">P</span>
                        <p className="font-bold text-sm sm:text-base text-zinc-900 mt-0.5">{p.phosphorus}%</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-500 block">K</span>
                        <p className="font-bold text-sm sm:text-base text-zinc-900 mt-0.5">{p.potassium}%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-600 pt-2 border-t border-zinc-100 font-medium">
                      <span>Soil Moisture: <strong className="text-zinc-900 font-bold">62%</strong></span>
                      <button
                        onClick={() => navigateToSubScreen('soil_report')}
                        className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <span>Soil Card</span>
                        <span>→</span>
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Soil Telemetry Logs */}
          <Card className="p-5 sm:p-6 rounded-2xl border border-zinc-200/80 bg-white space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-zinc-900">
                  KrishiProbe Telemetry & Soil Health Logs
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Verified laboratory and sensor probe records
                </p>
              </div>
              <button
                onClick={() => setShowSoilEntry(!showSoilEntry)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                {showSoilEntry ? 'Close' : '+ Log Soil Test'}
              </button>
            </div>

            {showSoilEntry && (
              <form onSubmit={handleAddSoilRecord} className="rounded-xl bg-zinc-50 p-4 text-xs space-y-3.5 border border-zinc-200">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700">pH Level (0-14)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={soilPh}
                      onChange={(e) => setSoilPh(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 font-medium outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-700">Moisture (%)</label>
                    <input
                      type="number"
                      required
                      value={soilMoisture}
                      onChange={(e) => setSoilMoisture(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 font-medium outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Observation Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. 24h after drip fertigation cycle"
                    value={soilNotes}
                    onChange={(e) => setSoilNotes(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 font-medium outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex justify-end gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSoilEntry(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
                  >
                    Save Soil Telemetry
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {soilHealthRecords.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl bg-zinc-50/80 border border-zinc-200/60 p-3.5 text-xs hover:bg-zinc-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 text-sm">{s.dateLabel}</span>
                      <span className="text-xs text-zinc-400 font-medium">· {s.source}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{s.notes}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-zinc-900 text-sm">
                      pH {s.phLevel} · {s.moisturePercent}% Moisture
                    </p>
                    <span className="text-xs text-zinc-400 font-medium">N: {s.nitrogenKgHa} kg/ha</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (5 Columns): Fertilizer Dosage Engine */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 sm:p-6 rounded-2xl border border-zinc-200/80 bg-white space-y-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-zinc-900">
                  Fertilizer Dosage Calculator
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">PAU & ICAR Agronomic Standard</p>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                Target Crop & Area
              </label>
              <div className="flex gap-2.5">
                <select
                  value={calcCrop}
                  onChange={(e) => setCalcCrop(e.target.value)}
                  className="w-1/2 rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5 text-sm font-semibold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500"
                >
                  {FertilizerCalculator.getAvailableCrops().map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="relative w-1/2">
                  <input
                    type="number"
                    step="0.5"
                    value={calcArea}
                    onChange={(e) => setCalcArea(parseFloat(e.target.value) || 1)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5 pr-14 text-sm font-semibold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500"
                    placeholder="Plot Area"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-semibold text-zinc-400">
                    {activeFarm?.unit || 'Acres'}
                  </span>
                </div>
              </div>
            </div>

            {/* Output Dosage Breakdown */}
            <div className="rounded-xl bg-zinc-50/80 border border-zinc-200/80 p-4 text-xs space-y-3.5">
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-xl bg-white p-3 border border-zinc-200/70 shadow-2xs">
                  <span className="text-xs font-semibold text-zinc-500 block">Urea (45kg)</span>
                  <p className="font-bold text-base sm:text-lg text-zinc-900 mt-1">
                    {dosage.ureaBags45Kg} Bags
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-zinc-200/70 shadow-2xs">
                  <span className="text-xs font-semibold text-zinc-500 block">DAP (50kg)</span>
                  <p className="font-bold text-base sm:text-lg text-zinc-900 mt-1">
                    {dosage.dapBags50Kg} Bags
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-zinc-200/70 shadow-2xs">
                  <span className="text-xs font-semibold text-zinc-500 block">MOP (50kg)</span>
                  <p className="font-bold text-base sm:text-lg text-zinc-900 mt-1">
                    {dosage.mopBags50Kg} Bags
                  </p>
                </div>
              </div>

              <div className="text-xs text-zinc-700 space-y-1.5 pt-1 leading-relaxed bg-white p-3 rounded-xl border border-zinc-200/60">
                <p>
                  <strong className="text-zinc-900 font-semibold">Basal dose:</strong> {dosage.basalDoseSummary}
                </p>
                <p>
                  <strong className="text-zinc-900 font-semibold">Top dressing:</strong> {dosage.topDressing1Summary}
                </p>
                <div className="flex items-center justify-between pt-2.5 border-t border-zinc-200/70 text-xs">
                  <span className="text-zinc-500 font-medium">Estimated input cost:</span>
                  <span className="font-bold text-base text-emerald-800">
                    ₹{dosage.estimatedCostInr.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToSubScreen('crop_doctor')}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 py-3 text-xs font-bold text-zinc-800 transition-colors cursor-pointer"
            >
              <span>Scan Leaf with Crop Doctor</span>
              <ArrowRight className="h-4 w-4 text-zinc-500" />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default FarmsScreen;

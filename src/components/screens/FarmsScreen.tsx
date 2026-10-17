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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">
            Fields & Land Parcels
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage field boundaries, soil parameters, and nutrient dosage plans
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeFarm && (
            <button
              onClick={() => advanceFarmDay(activeFarm.id)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors"
            >
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              <span>Advance Day (+1)</span>
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-medium text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Add Field'}</span>
          </button>
        </div>
      </div>

      {/* Farm Selection Tabs Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {farms.map((f) => (
          <button
            key={f.id}
            onClick={() => selectFarm(f.id)}
            className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors flex items-center gap-2 ${
              (selectedFarmId || activeFarm?.id) === f.id
                ? 'bg-zinc-100 border border-zinc-300 text-zinc-900 font-semibold'
                : 'border border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <Sprout className="h-3.5 w-3.5 text-zinc-400" />
            <span>{f.name}</span>
            <span className="text-[11px] text-zinc-400 font-normal">({f.totalArea} {f.unit})</span>
          </button>
        ))}
      </div>

      {/* Add New Farm Form (Collapsible) */}
      {showAddForm && (
        <Card className="p-5 border border-zinc-200 space-y-4">
          <div className="border-b border-zinc-100 pb-2">
            <h3 className="font-semibold text-sm text-zinc-900">
              Register New Land Parcel / Farm
            </h3>
            <p className="text-xs text-zinc-500">Provide boundary and soil details for recommendations</p>
          </div>
          <form onSubmit={handleCreateFarm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-700">Farm Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Field"
                  value={newFarmName}
                  onChange={(e) => setNewFarmName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700">Primary Crop</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wheat, Basmati Rice"
                  value={newPrimary}
                  onChange={(e) => setNewPrimary(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700">Total Area & Unit</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-1/2 rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                  />
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-1/2 rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                  >
                    <option>Acres</option>
                    <option>Bigha</option>
                    <option>Hectares</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700">Soil Type</label>
                <select
                  value={newSoilType}
                  onChange={(e) => setNewSoilType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                >
                  <option>Loamy Alluvial</option>
                  <option>Black Cotton Soil</option>
                  <option>Clay Loam</option>
                  <option>Sandy Loam</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700">Water Source</label>
                <select
                  value={newWaterSource}
                  onChange={(e) => setNewWaterSource(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                >
                  <option>Borewell & Solar Pump</option>
                  <option>Canal Irrigation</option>
                  <option>Drip Irrigation</option>
                  <option>Rainfed Only</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700">Drainage Condition</label>
                <select
                  value={newDrainage}
                  onChange={(e) => setNewDrainage(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                >
                  <option>Excellent (No Waterlogging)</option>
                  <option>Moderate (Occasional standing water)</option>
                  <option>Poor (Frequent waterlogging)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700">Location (Village, State)</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Village"
                    value={newVillage}
                    onChange={(e) => setNewVillage(e.target.value)}
                    className="w-1/2 rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-1/2 rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700">Ownership</label>
                <select
                  value={newOwnership}
                  onChange={(e) => setNewOwnership(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                >
                  <option>Ancestral Owned</option>
                  <option>Leased / Rented</option>
                  <option>Sharecropping (Batai)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 text-xs text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Save Farm
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Selected Farm High-Level Overview Card */}
      {activeFarm && (
        <Card className="p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-semibold text-zinc-900">
                  {activeFarm.name}
                </h2>
                <Badge variant={activeFarm.healthScore >= 80 ? 'success' : 'warning'}>
                  Score: {activeFarm.healthScore}/100
                </Badge>
                <span className="text-xs text-zinc-500 font-medium">
                  Day {activeFarm.activeDay} of season
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {activeFarm.totalArea} {activeFarm.unit} · {activeFarm.soilType} · {activeFarm.ownership} · {activeFarm.location}
              </p>
            </div>

            {/* Quick links */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => navigateToSubScreen('soil_report')}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors"
              >
                <Sprout className="h-3.5 w-3.5 text-emerald-700" />
                <span>Soil Card</span>
              </button>
              <button
                onClick={() => navigateToSubScreen('irrigation_detail')}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors"
              >
                <Droplets className="h-3.5 w-3.5 text-blue-600" />
                <span>Irrigation</span>
              </button>
              <button
                onClick={() => navigateToSubScreen('crop_doctor')}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors"
              >
                <Activity className="h-3.5 w-3.5 text-amber-600" />
                <span>Crop Doctor</span>
              </button>
            </div>
          </div>

          {/* Sub-Score Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-100 text-xs">
            <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2.5">
              <span className="text-[10px] text-zinc-400 block font-medium">Soil Health</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-bold text-zinc-900">{activeFarm.soilHealthScore}%</span>
                <span className="text-[10px] text-zinc-500">Optimal NPK</span>
              </div>
            </div>
            <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2.5">
              <span className="text-[10px] text-zinc-400 block font-medium">Water Delivery</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-bold text-zinc-900">{activeFarm.waterHealthScore}%</span>
                <span className="text-[10px] text-zinc-500">Borewell & Solar</span>
              </div>
            </div>
            <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2.5">
              <span className="text-[10px] text-zinc-400 block font-medium">Pest Pressure</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-bold text-zinc-900">{activeFarm.pestHealthScore}%</span>
                <span className="text-[10px] text-zinc-500">Clean</span>
              </div>
            </div>
            <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2.5">
              <span className="text-[10px] text-zinc-400 block font-medium">Active Tasks</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-bold text-zinc-900">{farmTasks.length}</span>
                <span className="text-[10px] text-zinc-500">Actions</span>
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
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Land Parcels ({farmParcels.length})
              </span>
              <span className="text-xs text-zinc-400">
                Total: {activeFarm?.totalArea} {activeFarm?.unit}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {farmParcels.map((p) => (
                <Card key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-xs text-zinc-900">
                        {p.name}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Crop: {p.currentCrop}
                      </p>
                    </div>
                    <span className="text-xs font-medium bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                      {p.area} Acres
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 rounded-lg bg-zinc-50 border border-zinc-100 p-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400">pH</span>
                      <p className="font-semibold text-zinc-800">{p.ph}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400">N</span>
                      <p className="font-semibold text-zinc-800">{p.nitrogen}%</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400">P</span>
                      <p className="font-semibold text-zinc-800">{p.phosphorus}%</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400">K</span>
                      <p className="font-semibold text-zinc-800">{p.potassium}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-100">
                    <span>Moisture: <strong>62%</strong></span>
                    <button
                      onClick={() => navigateToSubScreen('soil_report')}
                      className="text-emerald-700 font-medium hover:underline"
                    >
                      Soil Card →
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Soil Telemetry Logs */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-xs text-zinc-900">
                  KrishiProbe Telemetry & Soil Health Logs
                </h3>
                <p className="text-xs text-zinc-500">
                  Verified laboratory and sensor probe records
                </p>
              </div>
              <button
                onClick={() => setShowSoilEntry(!showSoilEntry)}
                className="text-xs text-emerald-700 hover:underline font-medium"
              >
                {showSoilEntry ? 'Close' : '+ Log Soil Test'}
              </button>
            </div>

            {showSoilEntry && (
              <form onSubmit={handleAddSoilRecord} className="rounded-lg bg-zinc-50 p-3.5 text-xs space-y-3 border border-zinc-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-zinc-700">pH Level (0-14)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={soilPh}
                      onChange={(e) => setSoilPh(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-zinc-700">Moisture (%)</label>
                    <input
                      type="number"
                      required
                      value={soilMoisture}
                      onChange={(e) => setSoilMoisture(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs text-zinc-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-700">Observation Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. 24h after drip fertigation cycle"
                    value={soilNotes}
                    onChange={(e) => setSoilNotes(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs text-zinc-900"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSoilEntry(false)}
                    className="px-3 py-1.5 text-xs text-zinc-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-white font-medium hover:bg-emerald-700"
                  >
                    Save Soil Telemetry
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-1.5">
              {soilHealthRecords.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg bg-zinc-50 border border-zinc-100 p-2.5 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-zinc-800">{s.dateLabel}</span>
                      <span className="text-[10px] text-zinc-400">· {s.source}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{s.notes}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-zinc-800">
                      pH {s.phLevel} · {s.moisturePercent}% Moisture
                    </p>
                    <span className="text-[10px] text-zinc-400">N: {s.nitrogenKgHa} kg/ha</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (5 Columns): Fertilizer Dosage Engine */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                <Calculator className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-zinc-900">
                  Fertilizer Dosage Calculator
                </h3>
                <p className="text-[11px] text-zinc-500">PAU & ICAR Agronomic Standard</p>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">
                Target Crop & Area
              </label>
              <div className="flex gap-2">
                <select
                  value={calcCrop}
                  onChange={(e) => setCalcCrop(e.target.value)}
                  className="w-1/2 rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs font-medium text-zinc-800 outline-none"
                >
                  {FertilizerCalculator.getAvailableCrops().map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.5"
                  value={calcArea}
                  onChange={(e) => setCalcArea(parseFloat(e.target.value) || 1)}
                  className="w-1/2 rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs font-medium text-zinc-800 outline-none"
                  placeholder="Plot Area"
                />
              </div>
            </div>

            {/* Output Dosage Breakdown */}
            <div className="rounded-lg bg-zinc-50 border border-zinc-200/80 p-3.5 text-xs space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white p-2.5 border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 font-medium">Urea (45kg)</span>
                  <p className="font-bold text-sm text-zinc-900 mt-0.5">
                    {dosage.ureaBags45Kg} Bags
                  </p>
                </div>
                <div className="rounded-lg bg-white p-2.5 border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 font-medium">DAP (50kg)</span>
                  <p className="font-bold text-sm text-zinc-900 mt-0.5">
                    {dosage.dapBags50Kg} Bags
                  </p>
                </div>
                <div className="rounded-lg bg-white p-2.5 border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 font-medium">MOP (50kg)</span>
                  <p className="font-bold text-sm text-zinc-900 mt-0.5">
                    {dosage.mopBags50Kg} Bags
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-zinc-600 space-y-1 pt-1">
                <p>
                  <strong>Basal dose:</strong> {dosage.basalDoseSummary}
                </p>
                <p>
                  <strong>Top dressing:</strong> {dosage.topDressing1Summary}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-200 text-xs">
                  <span className="text-zinc-500">Estimated input cost:</span>
                  <span className="font-bold text-emerald-800">
                    ₹{dosage.estimatedCostInr.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToSubScreen('crop_doctor')}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 py-2 text-xs font-medium text-zinc-700 transition-colors"
            >
              <span>Scan Leaf with Crop Doctor</span>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default FarmsScreen;

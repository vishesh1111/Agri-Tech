'use client';

import React, { useState } from 'react';
import {
  Plus,
  Sprout,
  Calculator,
  Droplets,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FertilizerCalculator } from '@/lib/calculators/fertilizerCalculator';

export function FarmsScreen() {
  const {
    farms,
    selectedFarmId,
    selectFarm,
    parcels,
    tasks,
    irrigationZones,
    soilHealthRecords,
    toggleTaskComplete,
    toggleIrrigationZone,
    advanceFarmDay,
    logSoilHealthRecord,
    addNewActiveFarm,
    navigateToSubScreen,
  } = useKisanStore();

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];
  const farmParcels = parcels.filter((p) => p.farmId === selectedFarmId);
  const farmTasks = tasks.filter((t) => t.farmId === selectedFarmId);

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

  // Soil entry modal state
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
      farmId: selectedFarmId,
      dateLabel: 'Today',
      phLevel: parseFloat(soilPh) || 6.8,
      moisturePercent: parseFloat(soilMoisture) || 58.0,
      nitrogenKgHa: 144,
      phosphorusKgHa: 40,
      potassiumKgHa: 205,
      organicCarbonPercent: 0.72,
      soilTemperatureCelsius: 24.0,
      electricalConductivityEc: 1.15,
      source: 'Manual Field Entry',
      sensorDeviceName: 'Digital Soil Probe',
      sensorBatteryPercent: 100,
      notes: soilNotes || 'Field verification logged',
    });
    setShowSoilEntry(false);
    setSoilNotes('');
  };

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* 1. Header with Farm Tabs & Add Farm Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
            Farms Management
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Plots, soil conditions, nutrition calculator & day cycle
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{showAddForm ? 'Close' : 'Add Farm'}</span>
        </button>
      </div>

      {/* Farm Selection Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {farms.map((f) => (
          <button
            key={f.id}
            onClick={() => selectFarm(f.id)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              selectedFarmId === f.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
            }`}
          >
            {f.name} ({f.totalArea} {f.unit})
          </button>
        ))}
      </div>

      {/* 2. Add New Farm Form (Collapsible) */}
      {showAddForm && (
        <Card className="border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
          <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-300 mb-2">
            🌱 Register New Farm / Land Parcel
          </h3>
          <form onSubmit={handleCreateFarm} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                  Farm Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guru Nanak Farm"
                  value={newFarmName}
                  onChange={(e) => setNewFarmName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-gray-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                  Primary Crop or Animal
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wheat, Basmati Rice, Dairy"
                  value={newPrimary}
                  onChange={(e) => setNewPrimary(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-gray-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                  Total Area & Unit
                </label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-1/2 rounded-lg border border-gray-300 bg-white p-2 text-xs text-gray-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-1/2 rounded-lg border border-gray-300 bg-white p-2 text-xs text-gray-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option>Acres</option>
                    <option>Bigha</option>
                    <option>Hectares</option>
                    <option>Guntha</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                  Soil Type
                </label>
                <select
                  value={newSoilType}
                  onChange={(e) => setNewSoilType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-gray-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option>Loamy Alluvial</option>
                  <option>Black Cotton Soil</option>
                  <option>Clay Loam</option>
                  <option>Sandy Loam</option>
                  <option>Red Soil</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                  Water Source
                </label>
                <select
                  value={newWaterSource}
                  onChange={(e) => setNewWaterSource(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-gray-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option>Borewell & Solar Pump</option>
                  <option>Canal Irrigation</option>
                  <option>Drip Irrigation System</option>
                  <option>Rainfed Only</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                  Location (Village, State)
                </label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Village"
                    value={newVillage}
                    onChange={(e) => setNewVillage(e.target.value)}
                    className="w-1/2 rounded-lg border border-gray-300 bg-white p-2 text-xs text-gray-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-1/2 rounded-lg border border-gray-300 bg-white p-2 text-xs text-gray-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                Save & Run Farm Assessment
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* 3. Selected Farm Overview & Day Progression */}
      {activeFarm && (
        <Card className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">
                  {activeFarm.name}
                </h3>
                <Badge variant={activeFarm.healthScore >= 80 ? 'success' : 'warning'}>
                  Score: {activeFarm.healthScore}/100
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {activeFarm.totalArea} {activeFarm.unit} • {activeFarm.soilType} • {activeFarm.ownership}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                Water: {activeFarm.waterSource} • Drainage: {activeFarm.drainageCondition}
              </p>
            </div>

            <button
              onClick={() => advanceFarmDay(activeFarm.id)}
              className="flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Day {activeFarm.activeDay} (Advance +1)</span>
            </button>
          </div>

          {/* Quick Sub-Navigation Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
            <button
              onClick={() => navigateToSubScreen('soil_report')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gray-50 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Sprout className="h-4 w-4 text-emerald-600" />
              <span>Soil Health</span>
            </button>
            <button
              onClick={() => navigateToSubScreen('irrigation_detail')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gray-50 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Droplets className="h-4 w-4 text-blue-600" />
              <span>Irrigation</span>
            </button>
            <button
              onClick={() => navigateToSubScreen('crop_doctor')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gray-50 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Sprout className="h-4 w-4 text-amber-600" />
              <span>Crop Doctor</span>
            </button>
          </div>
        </Card>
      )}

      {/* 4. Active Land Parcels Grid */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
          Field Plots & Soil Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {farmParcels.map((p) => (
            <Card key={p.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-gray-900 dark:text-zinc-100">
                  {p.name}
                </span>
                <span className="text-xs text-gray-500">{p.area} Acres</span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Crop: {p.currentCrop}
              </p>
              <div className="grid grid-cols-4 gap-1 rounded-xl bg-gray-50 p-2 text-center text-[10px] dark:bg-zinc-800">
                <div>
                  <span className="text-gray-400">pH</span>
                  <p className="font-bold text-gray-800 dark:text-zinc-200">{p.ph}</p>
                </div>
                <div>
                  <span className="text-gray-400">N</span>
                  <p className="font-bold text-gray-800 dark:text-zinc-200">{p.nitrogen}%</p>
                </div>
                <div>
                  <span className="text-gray-400">P</span>
                  <p className="font-bold text-gray-800 dark:text-zinc-200">{p.phosphorus}%</p>
                </div>
                <div>
                  <span className="text-gray-400">K</span>
                  <p className="font-bold text-gray-800 dark:text-zinc-200">{p.potassium}%</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 5. Precision Fertilizer Dosage Calculator Section */}
      <Card className="space-y-3 border-emerald-200 dark:border-emerald-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100">
                Precision Fertilizer Dosage Engine
              </h3>
              <p className="text-xs text-gray-500">ICAR & PAU Recommended Formulation</p>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="flex gap-2">
          <select
            value={calcCrop}
            onChange={(e) => setCalcCrop(e.target.value)}
            className="w-1/2 rounded-xl border border-gray-200 bg-white p-2 text-xs font-semibold text-gray-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
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
            className="w-1/2 rounded-xl border border-gray-200 bg-white p-2 text-xs font-semibold text-gray-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            placeholder="Plot Area"
          />
        </div>

        {/* Output Dosage Breakdown */}
        <div className="rounded-xl bg-emerald-50/70 p-3 text-xs space-y-2 dark:bg-emerald-950/30">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-white p-2 shadow-xs dark:bg-zinc-800">
              <span className="text-[10px] text-gray-400">Urea (45kg)</span>
              <p className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                {dosage.ureaBags45Kg} Bags
              </p>
            </div>
            <div className="rounded-lg bg-white p-2 shadow-xs dark:bg-zinc-800">
              <span className="text-[10px] text-gray-400">DAP (50kg)</span>
              <p className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                {dosage.dapBags50Kg} Bags
              </p>
            </div>
            <div className="rounded-lg bg-white p-2 shadow-xs dark:bg-zinc-800">
              <span className="text-[10px] text-gray-400">MOP (50kg)</span>
              <p className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                {dosage.mopBags50Kg} Bags
              </p>
            </div>
          </div>

          <div className="text-[11px] text-gray-700 dark:text-zinc-300 space-y-1">
            <p>
              <strong>Basal:</strong> {dosage.basalDoseSummary}
            </p>
            <p>
              <strong>1st Top-Dress:</strong> {dosage.topDressing1Summary}
            </p>
            <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
              💡 {dosage.applicationAdvice}
            </p>
            <p className="text-right text-[11px] text-gray-500">
              Estimated Input Cost: <strong>₹{dosage.estimatedCostInr}</strong>
            </p>
          </div>
        </div>
      </Card>

      {/* 6. Soil Health Historical Logs & Entry Modal */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100">
            Soil Health Logs & KrishiProbe Sensors
          </h3>
          <button
            onClick={() => setShowSoilEntry(!showSoilEntry)}
            className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            {showSoilEntry ? 'Close' : '+ Log Soil Test'}
          </button>
        </div>

        {showSoilEntry && (
          <form onSubmit={handleAddSoilRecord} className="rounded-xl bg-gray-50 p-3 text-xs space-y-2 dark:bg-zinc-800">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold">pH Level (0-14)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={soilPh}
                  onChange={(e) => setSoilPh(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-1.5 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold">Moisture (%)</label>
                <input
                  type="number"
                  required
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-1.5 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold">Observation Notes</label>
              <input
                type="text"
                placeholder="e.g. 24h after drip cycle"
                value={soilNotes}
                onChange={(e) => setSoilNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-1.5 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-3 py-1 text-white font-bold hover:bg-emerald-700"
              >
                Save Record
              </button>
            </div>
          </form>
        )}

        <div className="space-y-1.5">
          {soilHealthRecords.slice(0, 3).map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl bg-gray-50 p-2.5 text-xs dark:bg-zinc-800"
            >
              <div>
                <span className="font-bold text-gray-800 dark:text-zinc-200">{s.dateLabel}</span>
                <span className="text-gray-400 text-[10px] ml-2">• {s.source}</span>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">{s.notes}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  pH {s.phLevel} • {s.moisturePercent}% Moist
                </p>
                <span className="text-[10px] text-gray-400">N: {s.nitrogenKgHa} kg/ha</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default FarmsScreen;

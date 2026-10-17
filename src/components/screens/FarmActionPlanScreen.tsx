'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, Plus, Trash2, ArrowLeft, Filter, AlertTriangle, 
  Droplets, Bug, Sprout, Wind, HelpCircle, Check, X, ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FarmTask, Farm } from '@/lib/types';
import { useKisanStore } from '@/stores/useKisanStore';

const CATEGORIES = [
  { id: 'ALL', label: 'All Tasks', icon: CheckSquare },
  { id: 'IRRIGATION', label: 'Water & Irrigation', icon: Droplets },
  { id: 'NUTRITION', label: 'Fertilizers & Nutrients', icon: Sprout },
  { id: 'PEST_MANAGEMENT', label: 'Pest & Diseases', icon: Bug },
  { id: 'WEATHER_ALERT', label: 'Weather Alerts', icon: Wind },
  { id: 'GENERAL', label: 'General Farm Work', icon: Filter }
];

export const FarmActionPlanScreen: React.FC = () => {
  const { 
    farms, 
    farmTasks, 
    toggleTaskComplete, 
    deleteTask, 
    addTask, 
    navigateBack,
    navigateToSubScreen 
  } = useKisanStore();

  const [selectedFarmFilter, setSelectedFarmFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('IRRIGATION');
  const [newPriority, setNewPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newTargetArea, setNewTargetArea] = useState('Plot A');
  const [newWhyReason, setNewWhyReason] = useState('');
  const [newFarmId, setNewFarmId] = useState(farms[0]?.id || 'farm_1');

  if (farms.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mb-4">
          <Sprout className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No Farms Registered</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-6">
          Please register or add a farm first to generate an autonomous AI Action Plan, daily irrigation schedules, and crop management tasks tailored to your location.
        </p>
        <button
          onClick={() => navigateToSubScreen('farms_manager')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-colors"
        >
          Add Your First Farm
        </button>
      </div>
    );
  }

  const filteredTasks = farmTasks.filter((task: FarmTask) => {
    const matchesFarm = selectedFarmFilter === 'ALL' || task.farmId === selectedFarmFilter;
    const matchesCat = selectedCategoryFilter === 'ALL' || task.category === selectedCategoryFilter;
    return matchesFarm && matchesCat;
  });

  const pendingTasks = filteredTasks.filter((t: FarmTask) => !t.isCompleted);
  const completedTasks = filteredTasks.filter((t: FarmTask) => t.isCompleted);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      id: `task_${Date.now()}`,
      farmId: newFarmId,
      title: newTitle,
      description: newDescription,
      category: newCategory,
      priority: newPriority,
      priorityLabel: `${newPriority} PRIORITY`,
      targetArea: newTargetArea,
      whyReason: newWhyReason || 'Scheduled agricultural recommendation',
      isCompleted: false,
      estimatedTimeMinutes: 30
    });

    setNewTitle('');
    setNewDescription('');
    setNewWhyReason('');
    setShowAddDialog(false);
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'HIGH': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
      default: return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-700 text-white px-4 pt-4 pb-5 shadow-md">
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
                <CheckSquare className="w-5 h-5 text-emerald-300" />
                Today&apos;s Farm Action Plan
              </h1>
              <p className="text-xs text-emerald-100">
                {pendingTasks.length} pending • {completedTasks.length} completed
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddDialog(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 backdrop-blur-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Farm Selector Pill */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedFarmFilter('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedFarmFilter === 'ALL'
                ? 'bg-white text-emerald-800 font-bold shadow-sm'
                : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            All Farms ({farms.length})
          </button>
          {farms.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFarmFilter(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedFarmFilter === f.id
                  ? 'bg-white text-emerald-800 font-bold shadow-sm'
                : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Pending Tasks */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pending Recommendations ({pendingTasks.length})
          </h2>

          {pendingTasks.length === 0 ? (
            <Card className="p-6 text-center text-slate-500">
              <Check className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All tasks completed!</p>
              <p className="text-xs text-slate-400">Your farm actions are fully up-to-date today.</p>
            </Card>
          ) : (
            pendingTasks.map((task: FarmTask) => (
              <Card 
                key={task.id} 
                className="p-4 border-l-4 border-l-emerald-600 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="mt-0.5 w-5 h-5 rounded border border-slate-300 dark:border-slate-600 hover:border-emerald-600 flex items-center justify-center flex-shrink-0 transition-colors"
                    >
                      {task.isCompleted && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                          {task.priority} PRIORITY
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {task.targetArea}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {task.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {task.description}
                      </p>

                      {task.whyReason && (
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-2 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 mt-2 flex items-start gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
                          <span><strong>Why:</strong> {task.whyReason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completed Today ({completedTasks.length})
            </h2>

            {completedTasks.map((task: FarmTask) => (
              <div 
                key={task.id}
                className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between opacity-70"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="w-5 h-5 bg-emerald-600 rounded flex items-center justify-center text-white"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 line-through">
                      {task.title}
                    </h4>
                    <span className="text-[10px] text-slate-400">{task.targetArea} • {task.category}</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <form 
            onSubmit={handleCreateTask}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Add Farm Task</h3>
              <button 
                type="button" 
                onClick={() => setShowAddDialog(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assign To Farm</label>
              <select
                value={newFarmId}
                onChange={(e) => setNewFarmId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
              >
                {farms.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Task Title</label>
              <input 
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Spray fungicide in Plot A"
                required
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea 
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Detailed instructions or quantities..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
                >
                  <option value="IRRIGATION">Irrigation</option>
                  <option value="NUTRITION">Nutrition</option>
                  <option value="PEST_MANAGEMENT">Pest Management</option>
                  <option value="WEATHER_ALERT">Weather Alert</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
                >
                  <option value="HIGH">High (Urgent)</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Area / Parcel</label>
              <input 
                type="text"
                value={newTargetArea}
                onChange={(e) => setNewTargetArea(e.target.value)}
                placeholder="e.g. Saraswati North, Plot 2"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reason / Why</label>
              <input 
                type="text"
                value={newWhyReason}
                onChange={(e) => setNewWhyReason(e.target.value)}
                placeholder="e.g. Leaf spot detected during morning inspection"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddDialog(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default FarmActionPlanScreen;

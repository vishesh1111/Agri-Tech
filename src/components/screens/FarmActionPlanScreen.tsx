'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, Plus, Trash2, ArrowLeft, Filter, AlertTriangle, 
  Droplets, Bug, Sprout, Wind, HelpCircle, Check, X, ShieldAlert,
  ChevronDown, CheckCircle2, ListTodo
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
  } = useKisanStore();

  const [selectedFarmFilter, setSelectedFarmFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('IRRIGATION');
  const [newPriority, setNewPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newTargetArea, setNewTargetArea] = useState('Plot A');
  const [newWhyReason, setNewWhyReason] = useState('');
  const [newFarmId, setNewFarmId] = useState(farms[0]?.id || 'farm_1');

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
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <ListTodo className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              Farm Action Plan
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Prioritized daily operational schedule based on weather forecasts, growth stages, and sensor alerts
          </p>
        </div>

        {farms.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500">Filter Farm:</span>
            <select
              value={selectedFarmFilter}
              onChange={(e) => setSelectedFarmFilter(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="ALL">All Farms</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Main 12-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 Cols): Categories Filter & Quick Add Task Form */}
        <div className="lg:col-span-4 space-y-6">
          {/* Categories Nav */}
          <Card className="p-4 border border-zinc-200/80 bg-white space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">
              Categories
            </h3>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSel = selectedCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors ${
                      isSel
                        ? 'bg-zinc-900 text-white'
                        : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{cat.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Quick Add Form Card */}
          <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <h3 className="font-semibold text-sm text-zinc-900">
              Create New Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-zinc-700">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspect Flag Leaves for Rust"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="font-medium text-zinc-700">Description</label>
                <textarea
                  rows={2}
                  placeholder="Specific instructions or tools needed"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-zinc-700">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-zinc-700">Target Plot</label>
                  <input
                    type="text"
                    value={newTargetArea}
                    onChange={(e) => setNewTargetArea(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-zinc-700">Reason / Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Prevent yield loss during booting"
                  value={newWhyReason}
                  onChange={(e) => setNewWhyReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-700 py-2.5 text-xs font-medium text-white hover:bg-emerald-800 transition-colors mt-2"
              >
                Schedule Task
              </button>
            </form>
          </Card>
        </div>

        {/* Right Column (8 Cols): Task Checklist Cards & Archive */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Pending Actions ({pendingTasks.length})
            </h3>
            <span className="text-xs text-zinc-400 font-medium">
              Completed: {completedTasks.length} of {filteredTasks.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {pendingTasks.map((t) => (
              <Card
                key={t.id}
                className="p-4 border border-zinc-200/80 bg-white hover:border-zinc-300 transition-colors flex items-start justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={t.isCompleted}
                    onChange={() => toggleTaskComplete(t.id)}
                    className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm text-zinc-900">
                        {t.title}
                      </h4>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          t.priority === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                        {t.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-2 font-normal">
                      <span>Plot: {t.targetArea}</span>
                      <span>·</span>
                      <span>{t.whyReason}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(t.id)}
                  className="text-zinc-400 hover:text-rose-600 p-1 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            ))}

            {pendingTasks.length === 0 && (
              <Card className="p-8 text-center border border-zinc-200/80 bg-white">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-medium text-zinc-900">All caught up!</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  No pending tasks in this category. Your plots and livestock schedules are up to date.
                </p>
              </Card>
            )}
          </div>

          {completedTasks.length > 0 && (
            <div className="pt-4 border-t border-zinc-200/80 space-y-2">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Completed Tasks ({completedTasks.length})
              </h4>
              <div className="space-y-2 opacity-60">
                {completedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 line-through text-zinc-500">
                      <input
                        type="checkbox"
                        checked={t.isCompleted}
                        onChange={() => toggleTaskComplete(t.id)}
                        className="h-4 w-4 rounded border-zinc-300 text-emerald-700 cursor-pointer"
                      />
                      <span>{t.title}</span>
                    </div>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="text-zinc-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmActionPlanScreen;

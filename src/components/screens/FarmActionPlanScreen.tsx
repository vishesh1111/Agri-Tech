'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, Plus, Trash2, Filter, 
  Droplets, Bug, Sprout, Wind, X,
  CheckCircle2, ListTodo, ChevronDown
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { FarmTask } from '@/lib/types';
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
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());

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

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleOpenCreateModal = () => {
    // Default modal category to selected category if it's specific
    if (selectedCategoryFilter !== 'ALL') {
      setNewCategory(selectedCategoryFilter);
    }
    setShowCreateModal(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      id: `task_${Date.now()}`,
      farmId: newFarmId,
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      priority: newPriority,
      priorityLabel: `${newPriority} PRIORITY`,
      targetArea: newTargetArea.trim() || 'Plot A',
      whyReason: newWhyReason.trim() || 'Scheduled agricultural recommendation',
      isCompleted: false,
      estimatedTimeMinutes: 30
    });

    setNewTitle('');
    setNewDescription('');
    setNewWhyReason('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Bar: Header, Farm Filter, + New Task Button & Category Navigation */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Main Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <ListTodo className="h-5 w-5" />
              </span>
              <h1 className="text-xl font-semibold text-zinc-900">
                Farm Tasks & Plan
              </h1>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Prioritized daily operational schedule based on weather forecasts, growth stages, and sensor alerts
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {farms.length > 1 && (
              <div className="flex items-center gap-2 mr-1">
                <span className="text-xs font-medium text-zinc-500 hidden sm:inline">Filter Farm:</span>
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

            {/* + Icon Button for Creating New Tasks */}
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors shadow-xs shrink-0 cursor-pointer"
              title="Create New Task"
            >
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Categories Bar in the Top Bar */}
        <div className="border-t border-zinc-100 bg-zinc-50/60 px-5 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-1 hidden sm:inline shrink-0">
            Categories:
          </span>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSel = selectedCategoryFilter === cat.id;
            const count = cat.id === 'ALL'
              ? farmTasks.filter((t) => !t.isCompleted && (selectedFarmFilter === 'ALL' || t.farmId === selectedFarmFilter)).length
              : farmTasks.filter((t) => !t.isCompleted && t.category === cat.id && (selectedFarmFilter === 'ALL' || t.farmId === selectedFarmFilter)).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSel
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white text-zinc-600 border border-zinc-200/80 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSel ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Tasks Main Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Pending Actions ({pendingTasks.length})
            </h3>
            {selectedCategoryFilter !== 'ALL' && (
              <span className="text-xs text-zinc-400 font-medium">
                · {CATEGORIES.find((c) => c.id === selectedCategoryFilter)?.label}
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-400 font-medium">
            Completed: {completedTasks.length} of {filteredTasks.length}
          </span>
        </div>

        <div className="space-y-2.5">
          {pendingTasks.map((t) => {
            const isExpanded = expandedTaskIds.has(t.id);
            return (
              <Card
                key={t.id}
                onClick={() => toggleTaskExpand(t.id)}
                className={`p-3.5 sm:p-4 border transition-all cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)] ${
                  isExpanded
                    ? 'border-emerald-300 bg-white ring-1 ring-emerald-500/20'
                    : 'border-zinc-200/80 bg-white hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Checkbox + Title + Badges */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={t.isCompleted}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleTaskComplete(t.id)}
                      className="h-4 w-4 rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer shrink-0"
                    />
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <h4 className="font-medium text-sm text-zinc-900">
                        {t.title}
                      </h4>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                          t.priority === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : t.priority === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                        }`}
                      >
                        {t.priority}
                      </span>
                      {t.category && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-50 text-zinc-500 border border-zinc-200/60 shrink-0">
                          {CATEGORIES.find((c) => c.id === t.category)?.label || t.category}
                        </span>
                      )}
                      {t.targetArea && (
                        <span className="text-[11px] text-zinc-400 font-medium shrink-0">
                          · {t.targetArea}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Expand Chevron + Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskExpand(t.id);
                      }}
                      className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
                      title={isExpanded ? 'Collapse details' : 'Show all description'}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-emerald-700' : ''
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(t.id);
                      }}
                      className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Full Description, Objective/Reason, Plot, Duration */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3.5 border-t border-zinc-100 space-y-2.5 pl-7 animate-in fade-in duration-150">
                    {t.description && (
                      <div>
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                          Description & Instructions
                        </span>
                        <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50/70 p-3 rounded-lg border border-zinc-200/70">
                          {t.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {t.whyReason && (
                        <div className="bg-emerald-50/60 border border-emerald-100/80 p-2.5 rounded-lg">
                          <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
                            Reason / Objective
                          </span>
                          <p className="text-xs text-emerald-950 mt-0.5">
                            {t.whyReason}
                          </p>
                        </div>
                      )}

                      <div className="bg-zinc-50 border border-zinc-200/70 p-2.5 rounded-lg flex items-center justify-between text-zinc-600">
                        <div>
                          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                            Target Plot
                          </span>
                          <span className="font-medium text-zinc-800">{t.targetArea || 'General Farm'}</span>
                        </div>
                        {t.estimatedTimeMinutes && (
                          <div className="text-right">
                            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                              Est. Duration
                            </span>
                            <span className="font-medium text-zinc-800">{t.estimatedTimeMinutes} mins</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          {pendingTasks.length === 0 && (
            <Card className="p-8 text-center border border-zinc-200/80 bg-white space-y-3">
              <CheckCircle2 className="h-9 w-9 text-emerald-600 mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">All caught up!</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  No pending tasks in this category. Your plots and operational schedules are up to date.
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create New Task</span>
              </button>
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
                    className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="max-w-lg w-full p-5 sm:p-6 space-y-4 bg-white rounded-xl border border-zinc-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <Plus className="h-4 w-4" />
                </span>
                <h3 className="font-semibold text-base text-zinc-900">
                  Create New Task
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-zinc-700">Task Title *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Inspect Flag Leaves for Rust"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="font-medium text-zinc-700">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-zinc-700">Description</label>
                <textarea
                  rows={2}
                  placeholder="Specific instructions, tools, or chemicals needed"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-zinc-700">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
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
                    placeholder="e.g. Plot A or Zone 1"
                    value={newTargetArea}
                    onChange={(e) => setNewTargetArea(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {farms.length > 1 && (
                <div>
                  <label className="font-medium text-zinc-700">Farm</label>
                  <select
                    value={newFarmId}
                    onChange={(e) => setNewFarmId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-medium text-zinc-700">Reason / Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Prevent yield loss during booting"
                  value={newWhyReason}
                  onChange={(e) => setNewWhyReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Schedule Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmActionPlanScreen;

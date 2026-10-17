'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function FinanceScreen() {
  const {
    transactions,
    addFinancialTransaction,
    deleteFinancialTransaction,
    navigateToSubScreen,
  } = useKisanStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Fertilizer');
  const [amount, setAmount] = useState('');
  const [isIncome, setIsIncome] = useState(false);

  const totalIncome = transactions
    .filter((t) => t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => !t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    await addFinancialTransaction(
      title,
      category,
      parseFloat(amount) || 0,
      isIncome
    );
    setTitle('');
    setAmount('');
    setShowAddForm(false);
  };

  const categories = [
    'Fertilizer',
    'Seeds',
    'Pesticides',
    'Labor',
    'Irrigation',
    'MandiSale',
    'Livestock',
    'Equipment',
    'Other',
  ];

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* 1. Header with Add Transaction Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
            Farm Finance & Ledger
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Dynamic profitability optimizer & cash ledger
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          <span>{showAddForm ? 'Close' : 'Add Entry'}</span>
        </button>
      </div>

      {/* 2. Financial Overview Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
            Income
          </span>
          <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
            ₹{totalIncome.toLocaleString()}
          </p>
          <span className="text-[9px] text-emerald-600 block mt-0.5">Crop & Milk Sales</span>
        </Card>

        <Card className="p-3 text-center bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900">
          <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400">
            Expenses
          </span>
          <p className="text-base font-extrabold text-rose-700 dark:text-rose-300 mt-1">
            ₹{totalExpense.toLocaleString()}
          </p>
          <span className="text-[9px] text-rose-600 block mt-0.5">Inputs & Labor</span>
        </Card>

        <Card className="p-3 text-center bg-sky-50/60 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900">
          <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-400">
            Net Margin
          </span>
          <p
            className={`text-base font-extrabold mt-1 ${
              netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700'
            }`}
          >
            ₹{netProfit.toLocaleString()}
          </p>
          <span className="text-[9px] text-sky-600 block mt-0.5">Operating Profit</span>
        </Card>
      </div>

      {/* 3. Add Transaction Form (Collapsible) */}
      {showAddForm && (
        <Card className="border-emerald-300 bg-emerald-50/40 p-4 dark:bg-emerald-950/20">
          <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-2">
            Record New Transaction
          </h3>
          <form onSubmit={handleAdd} className="space-y-3 text-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsIncome(false)}
                className={`w-1/2 py-2 rounded-xl font-bold transition-all ${
                  !isIncome
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                Expense (Outflow)
              </button>
              <button
                type="button"
                onClick={() => setIsIncome(true)}
                className={`w-1/2 py-2 rounded-xl font-bold transition-all ${
                  isIncome
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                Income (Inflow)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold">Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2 Bags DAP Fertilizer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold">Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2700"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-1.5 font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                Save Entry
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* 4. Transactions List */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
          Transaction History ({transactions.length})
        </h3>

        <div className="space-y-2">
          {transactions.map((tx) => (
            <Card key={tx.id} className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    tx.isIncome
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                  }`}
                >
                  {tx.isIncome ? (
                    <ArrowDownLeft className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-zinc-100">{tx.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Badge variant="neutral">{tx.category}</Badge>
                    <span>{tx.dateDisplay}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`font-black text-sm ${
                    tx.isIncome
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-900 dark:text-zinc-100'
                  }`}
                >
                  {tx.isIncome ? '+' : '-'}₹{tx.amount.toLocaleString()}
                </span>

                <button
                  onClick={() => deleteFinancialTransaction(tx)}
                  className="text-gray-400 hover:text-rose-600 p-1 transition-all"
                  title="Delete Entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FinanceScreen;

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
  Search,
  Filter,
  CheckCircle,
  FileSpreadsheet,
  Receipt,
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function FinanceScreen() {
  const {
    transactions,
    addFinancialTransaction,
    deleteFinancialTransaction,
  } = useKisanStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Fertilizer');
  const [amount, setAmount] = useState('');
  const [isIncome, setIsIncome] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('ALL');

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

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedFilterCategory === 'ALL' || tx.category === selectedFilterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header with Export & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Receipt className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              Farm Financial Ledger
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Track operational expenses, crop produce sales, inputs, and operating margins
          </p>
        </div>

        <button
          onClick={() => alert('Exporting financial ledger as CSV...')}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 hover:scale-105 active:scale-95 transition-all shadow-xs"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
          <span>Export Ledger</span>
        </button>
      </div>

      {/* 2. Top Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-md hover:border-emerald-200 transition-all duration-200 group cursor-default">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-500">
                Total Inflow (Revenue)
              </span>
              <p className="text-2xl font-semibold text-zinc-900 mt-1">
                ₹{totalIncome.toLocaleString()}
              </p>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Mandi sales, dairy & procurement
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-200">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-md hover:border-zinc-300 transition-all duration-200 group cursor-default">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-500">
                Total Outflow (Expenses)
              </span>
              <p className="text-2xl font-semibold text-zinc-900 mt-1">
                ₹{totalExpense.toLocaleString()}
              </p>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Inputs, labor, diesel & seeds
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 group-hover:scale-110 group-hover:bg-zinc-200 transition-all duration-200">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-md hover:border-emerald-200 transition-all duration-200 group cursor-default">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-500">
                Net Operating Balance
              </span>
              <p
                className={`text-2xl font-semibold mt-1 ${
                  netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                ₹{netProfit.toLocaleString()}
              </p>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Season net surplus
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 group-hover:scale-110 group-hover:bg-zinc-200 transition-all duration-200">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Main 12-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Columns): Transactions Ledger Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
              {['ALL', 'Fertilizer', 'MandiSale', 'Labor', 'Seeds'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilterCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                    selectedFilterCategory === cat
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden border border-zinc-200/80 bg-white p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/70 border-b border-zinc-100 text-zinc-400 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Transaction</th>
                    <th className="py-2.5 px-4 font-medium">Category</th>
                    <th className="py-2.5 px-4 font-medium">Date</th>
                    <th className="py-2.5 px-4 font-medium text-right">Amount</th>
                    <th className="py-2.5 px-4 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-normal">
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-emerald-50/40 hover:translate-x-0.5 transition-all duration-150 group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-transform duration-200 group-hover:scale-110 ${
                              tx.isIncome
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {tx.isIncome ? (
                              <ArrowDownLeft className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <span className="font-medium text-zinc-900">
                            {tx.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-500">{tx.dateDisplay}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-semibold ${
                            tx.isIncome ? 'text-emerald-700' : 'text-zinc-900'
                          }`}
                        >
                          {tx.isIncome ? '+' : '-'}₹{tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => deleteFinancialTransaction(tx)}
                          className="text-zinc-400 hover:text-rose-600 p-1 hover:scale-120 active:scale-90 transition-all rounded"
                          title="Delete entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-zinc-400">
                        No transactions recorded matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column (5 Columns): Quick Add Form + Expense Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 border border-zinc-200/80 bg-white space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-zinc-900">
                Record New Transaction
              </h3>
              <p className="text-xs text-zinc-500">Record an operational expense or sale receipt</p>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsIncome(false)}
                  className={`w-1/2 py-2 rounded-lg font-medium text-xs transition-all duration-200 hover:scale-102 active:scale-98 ${
                    !isIncome
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  Expense (Outflow)
                </button>
                <button
                  type="button"
                  onClick={() => setIsIncome(true)}
                  className={`w-1/2 py-2 rounded-lg font-medium text-xs transition-all duration-200 hover:scale-102 active:scale-98 ${
                    isIncome
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  Income (Inflow)
                </button>
              </div>

              <div>
                <label className="font-medium text-zinc-700">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2 Bags DAP Fertilizer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-zinc-700">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="2700"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                  />
                </div>
                <div>
                  <label className="font-medium text-zinc-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-700 py-2.5 text-xs font-medium text-white hover:bg-emerald-800 hover:scale-102 active:scale-98 transition-all shadow-xs mt-2"
              >
                Save Transaction
              </button>
            </form>
          </Card>

          {/* Category Expense Distribution breakdown */}
          <Card className="p-5 border border-zinc-200/80 bg-white space-y-4">
            <h4 className="font-semibold text-sm text-zinc-900">
              Input Expense Breakdown
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between text-zinc-500 mb-1">
                  <span>Fertilizer & Nutrition</span>
                  <span className="font-medium text-zinc-900">38%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '38%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-zinc-500 mb-1">
                  <span>Farm Labor & Machinery</span>
                  <span className="font-medium text-zinc-900">29%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-600 rounded-full" style={{ width: '29%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-zinc-500 mb-1">
                  <span>Seeds & Cultivars</span>
                  <span className="font-medium text-zinc-900">18%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '18%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-zinc-500 mb-1">
                  <span>Irrigation & Energy</span>
                  <span className="font-medium text-zinc-900">15%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-400 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default FinanceScreen;

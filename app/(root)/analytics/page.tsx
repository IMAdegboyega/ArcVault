'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { apiGetAccounts, apiGetAccountTransactions } from '@/lib/api';
import HeaderBox from '@/components/HeaderBox';
import { Skeleton } from '@/components/ui/skeleton';
import { formatAmount } from '@/lib/utils';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const CATEGORY_COLORS: Record<string, string> = {
  Shopping:       'rgb(59, 130, 246)',
  'Food and Drink': 'rgb(236, 72, 153)',
  Travel:         'rgb(16, 185, 129)',
  Bills:          'rgb(245, 158, 11)',
  Entertainment:  'rgb(139, 92, 246)',
  Health:         'rgb(20, 184, 166)',
  Income:         'rgb(34, 197, 94)',
  Transfer:       'rgb(249, 115, 22)',
  Other:          'rgb(156, 163, 175)',
};

const summaryItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

const summaryContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [dailySpend, setDailySpend] = useState<{ date: string; amount: number }[]>([]);
  const [summary, setSummary] = useState({ spent: 0, income: 0, net: 0, count: 0 });

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const accRes = await apiGetAccounts();
      if (!accRes.success || !accRes.data) { setLoading(false); return; }

      const accounts = accRes.data.accounts;
      const allTxns: Transaction[] = [];

      await Promise.all(
        accounts.map(async (acc) => {
          const res = await apiGetAccountTransactions(acc.id, {
            startDate: thirtyDaysAgo,
            endDate: today,
            limit: 200,
          });
          if (res.success && res.data) allTxns.push(...res.data.transactions);
        })
      );

      // Category totals (current month, debits only)
      const catMap: Record<string, number> = {};
      let spent = 0, income = 0, count = 0;

      for (const t of allTxns) {
        const txDate = new Date(t.date);
        const inMonth = txDate >= new Date(firstOfMonth);
        count++;
        if (t.amount > 0) {
          spent += t.amount;
          if (inMonth) {
            const cat = t.category || 'Other';
            catMap[cat] = (catMap[cat] || 0) + t.amount;
          }
        } else {
          income += Math.abs(t.amount);
        }
      }

      // Daily spend (last 30 days, debits only)
      const dailyMap: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        dailyMap[d.toISOString().split('T')[0]] = 0;
      }
      for (const t of allTxns) {
        if (t.amount > 0 && dailyMap[t.date] !== undefined) {
          dailyMap[t.date] = (dailyMap[t.date] || 0) + t.amount;
        }
      }

      setCategoryTotals(catMap);
      setDailySpend(Object.entries(dailyMap).map(([date, amount]) => ({ date, amount })));
      setSummary({ spent, income, net: income - spent, count });
      setLoading(false);
    };
    load();
  }, []);

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  const barData = {
    labels: sortedCategories.map(([cat]) => cat),
    datasets: [{
      label: 'Spending ($)',
      data: sortedCategories.map(([, val]) => val),
      backgroundColor: sortedCategories.map(([cat]) => CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other),
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const barOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` $${ctx.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6b7280', font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { color: '#374151', font: { size: 12 } } },
    },
  };

  const lineData = {
    labels: dailySpend.map((d) => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [{
      label: 'Daily Spend',
      data: dailySpend.map((d) => d.amount),
      borderColor: 'rgb(37, 99, 235)',
      backgroundColor: 'rgba(37, 99, 235, 0.08)',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      fill: true,
      tension: 0.4,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` $${ctx.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11 }, maxTicksLimit: 10 } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6b7280', font: { size: 11 }, callback: (v: any) => `$${v}` } },
    },
  };

  const summaryCards = [
    { label: 'Total Spent (30d)', value: formatAmount(summary.spent), color: 'text-rose-600' },
    { label: 'Total Income (30d)', value: formatAmount(summary.income), color: 'text-emerald-600' },
    { label: 'Net (30d)', value: formatAmount(summary.net), color: summary.net >= 0 ? 'text-emerald-600' : 'text-rose-600' },
    { label: 'Transactions', value: String(summary.count), color: 'text-blue-600' },
  ];

  return (
    <div className="no-scrollbar flex flex-col gap-8 p-5 py-8 sm:px-8 lg:py-10 xl:max-h-screen xl:overflow-y-auto">
      <HeaderBox title="Analytics" subtext="Spending insights for the last 30 days." />

      {loading ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex flex-col gap-6"
        >
          {/* Summary cards */}
          <motion.div
            variants={summaryContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {summaryCards.map((card) => (
              <motion.div key={card.label} variants={summaryItem} className="rounded-2xl border border-gray-100 bg-white px-4 py-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">{card.label}</p>
                <p className={`mt-1 text-xl font-bold ${card.color}`}>{card.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Spending trend */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Daily Spending — Last 30 Days</h3>
            <div className="h-52 w-full">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>

          {/* Category breakdown */}
          {sortedCategories.length > 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Spending by Category — This Month</h3>
              <div style={{ height: `${Math.max(200, sortedCategories.length * 44)}px` }} className="w-full">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
              <p className="text-sm font-medium text-gray-400">No spending data for this month yet.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;

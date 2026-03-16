'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiGetAccounts, apiGetAccount, apiGetAccountTransactions } from '@/lib/api';
import HeaderBox from '@/components/HeaderBox';
import TransactionsTable from '@/components/TransactionsTable';
import { Pagination } from '@/components/Pagination';
import { formatAmount, formatDateTime, getTransactionStatus } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

const CATEGORIES = ['All', 'Shopping', 'Food and Drink', 'Bills', 'Travel', 'Entertainment', 'Health', 'Income', 'Transfer'];

const TransactionHistory = () => {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const accountId = searchParams.get('id') || '';
  const currentPage = Number(searchParams.get('page')) || 1;
  const activeId = accountId || accounts[0]?.id;

  const hasActiveFilters = !!(category || startDate || endDate || search);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const accRes = await apiGetAccounts();
        if (accRes.success && accRes.data) {
          setAccounts(accRes.data.accounts);
          const id = accountId || accRes.data.accounts[0]?.id;
          if (id) {
            const [detail, txn] = await Promise.all([
              apiGetAccount(id),
              apiGetAccountTransactions(id, {
                page: currentPage,
                limit: 20,
                ...(category && category !== 'All' ? { category } : {}),
                ...(startDate ? { startDate } : {}),
                ...(endDate ? { endDate } : {}),
              }),
            ]);
            if (detail.success && detail.data) setSelectedAccount(detail.data.account);
            if (txn.success && txn.data) {
              setTransactions(txn.data.transactions);
              setTotalPages(txn.data.pagination.totalPages);
            }
          }
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [accountId, currentPage, category, startDate, endDate]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setStartDate('');
    setEndDate('');
  };

  // Client-side search filter
  const displayedTransactions = search
    ? transactions.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : transactions;

  // #9 — CSV export
  const handleExportCSV = () => {
    if (displayedTransactions.length === 0) {
      toast.error('No transactions to export.');
      return;
    }
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Status', 'Account'];
    const rows = displayedTransactions.map((t) => [
      formatDateTime(new Date(t.date)).dateOnly,
      `"${t.name.replace(/"/g, '""')}"`,
      t.amount > 0 ? `-${Math.abs(t.amount).toFixed(2)}` : `+${Math.abs(t.amount).toFixed(2)}`,
      t.category || 'Other',
      getTransactionStatus(new Date(t.date)),
      selectedAccount?.name || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arcvault-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Transactions exported.');
  };

  return (
    <div className="no-scrollbar flex flex-col gap-6 p-5 py-8 sm:px-8 lg:py-10 xl:max-h-screen xl:overflow-y-auto">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <HeaderBox title="Transaction History" subtext="View detailed transaction records across your accounts." />
        <button
          onClick={handleExportCSV}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
      </div>

      {/* #3 — Filter bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[160px] flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="h-9 w-full rounded-lg border border-gray-200 pl-8 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c === 'All' ? '' : c}>{c}</option>
            ))}
          </select>

          {/* Date from */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          {/* Date to */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              Clear
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-4"
          >
            <Skeleton className="h-24 rounded-2xl" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-9 w-28 rounded-full" />)}
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white">
              <div className="flex flex-col gap-px">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <Skeleton className="size-9 rounded-full shrink-0" />
                    <div className="flex flex-1 flex-col gap-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col gap-6"
          >
            {/* Account balance card */}
            {selectedAccount && (
              <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-6 py-5 text-white shadow-lg shadow-blue-600/15 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">{selectedAccount.officialName || selectedAccount.name}</p>
                  <p className="mt-0.5 text-lg font-bold tracking-wide">●●●● ●●●● ●●●● {selectedAccount.mask}</p>
                </div>
                <div className="rounded-xl bg-white/15 px-5 py-3 backdrop-blur-sm">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-white/60">Current Balance</p>
                  <p className="text-xl font-bold">{formatAmount(selectedAccount.currentBalance)}</p>
                </div>
              </div>
            )}

            {/* Account tabs */}
            {accounts.length > 1 && (
              <div className="flex w-full flex-wrap gap-2">
                {accounts.map((acc) => (
                  <a key={acc.id} href={`/transaction-history?id=${acc.id}`}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      acc.id === activeId
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}>
                    <span className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      acc.id === activeId ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>{acc.name[0]}</span>
                    {acc.name}
                  </a>
                ))}
              </div>
            )}

            <TransactionsTable transactions={displayedTransactions} />
            <Pagination page={currentPage} totalPages={totalPages} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionHistory;

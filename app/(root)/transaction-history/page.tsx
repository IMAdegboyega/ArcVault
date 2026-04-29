'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiGetAccounts, apiGetAccountTransactions } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import HeaderBox from '@/components/HeaderBox';
import TransactionsTable from '@/components/TransactionsTable';
import { Pagination } from '@/components/Pagination';
import { formatAmount, formatDateTime, getTransactionStatus, getBankDesign } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import Image from 'next/image';

const CATEGORIES = ['All', 'Shopping', 'Food and Drink', 'Bills', 'Travel', 'Entertainment', 'Health', 'Income', 'Transfer'];

const TransactionHistory = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [cardLoading, setCardLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Holds the latest accounts list without causing effect deps issues
  const accountsRef = useRef<Account[]>([]);
  // Prevents Effect 2 from running on initial mount (Effect 1 handles that)
  const mountedRef = useRef(false);

  const accountId = searchParams.get('id') || '';
  const currentPage = Number(searchParams.get('page')) || 1;
  const activeId = accountId || accounts[0]?.id;

  const hasActiveFilters = !!(category || startDate || endDate || search);

  // Effect 1: load accounts + initial transactions once on mount
  useEffect(() => {
    setCardLoading(true);
    setTxLoading(true);

    apiGetAccounts().then(async (accRes) => {
      if (!accRes.success || !accRes.data) {
        setCardLoading(false);
        setTxLoading(false);
        return;
      }
      const list = accRes.data.accounts;
      accountsRef.current = list;
      setAccounts(list);

      const id = accountId || list[0]?.id;
      setSelectedAccount(list.find((a) => a.id === id) ?? list[0] ?? null);
      setCardLoading(false);

      if (!id) { setTxLoading(false); return; }

      try {
        const txn = await apiGetAccountTransactions(id, {
          page: currentPage, limit: 20,
          ...(category && category !== 'All' ? { category } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        });
        if (txn.success && txn.data) {
          setTransactions(txn.data.transactions);
          setTotalPages(txn.data.pagination.totalPages);
        }
      } finally {
        setTxLoading(false);
        mountedRef.current = true;
      }
    }).catch(() => { setCardLoading(false); setTxLoading(false); mountedRef.current = true; });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect 2: tab switches and filter changes — card switches instantly, only transactions reload
  useEffect(() => {
    if (!mountedRef.current) return;

    const list = accountsRef.current;
    const id = accountId || list[0]?.id;
    if (!id) return;

    // Instant card switch from cached list — no API call, no flicker
    setSelectedAccount(list.find((a) => a.id === id) ?? list[0] ?? null);

    setTxLoading(true);
    apiGetAccountTransactions(id, {
      page: currentPage, limit: 20,
      ...(category && category !== 'All' ? { category } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    }).then((txn) => {
      if (txn.success && txn.data) {
        setTransactions(txn.data.transactions);
        setTotalPages(txn.data.pagination.totalPages);
      }
      setTxLoading(false);
    }).catch(() => setTxLoading(false));
  }, [accountId, currentPage, category, startDate, endDate]);

  const handleTabClick = (acc: Account) => {
    setSelectedAccount(acc); // Instant — no waiting
    router.push(`/transaction-history?id=${acc.id}`, { scroll: false });
  };

  const clearFilters = () => { setSearch(''); setCategory(''); setStartDate(''); setEndDate(''); };

  const displayedTransactions = search
    ? transactions.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : transactions;

  const handleExportCSV = () => {
    if (displayedTransactions.length === 0) { toast.error('No transactions to export.'); return; }
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

  const userName = user ? `${user.firstName} ${user.lastName}` : '';

  return (
    <div className="no-scrollbar flex flex-col gap-6 p-5 py-8 sm:px-8 lg:py-10 xl:max-h-screen xl:overflow-y-auto">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <HeaderBox title="Transaction History" subtext="View detailed transaction records across your accounts." />
        <button onClick={handleExportCSV}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[160px] flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..."
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {CATEGORIES.map((c) => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
          </select>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:[color-scheme:dark]" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:[color-scheme:dark]" />
          {hasActiveFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Account card */}
      <AnimatePresence mode="wait">
        {cardLoading ? (
          <motion.div key="card-skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <Skeleton className="h-[190px] rounded-2xl" />
          </motion.div>
        ) : selectedAccount ? (
          <motion.div
            key={selectedAccount.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {(() => {
              const { gradient, shadow, cardType } = getBankDesign(selectedAccount.name);
              return (
                <div className={`relative flex h-[190px] w-full justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} shadow-lg ${shadow}`}>
                  <div className="relative z-10 flex flex-col justify-between p-5">
                    <div>
                      <h2 className="text-[15px] font-semibold text-white/90">{selectedAccount.name}</h2>
                      <p className="mt-1 text-[22px] font-bold text-white">{formatAmount(selectedAccount.currentBalance)}</p>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[11px] font-medium text-white/60">{userName}</p>
                      <p className="text-sm font-semibold tracking-[2px] text-white">●●●● {selectedAccount.mask}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between p-5">
                    <Image src="/icons/Paypass.svg" width={20} height={24} alt="" className="opacity-80" />
                    {cardType === 'visa'
                      ? <Image src="/icons/visa.svg" width={58} height={20} alt="Visa" />
                      : <Image src="/icons/mastercard.svg" width={45} height={32} alt="Mastercard" />
                    }
                  </div>
                  <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/10" />
                  <div className="absolute -bottom-10 -right-10 size-40 rounded-full bg-white/5" />
                  <div className="absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03]" />
                </div>
              );
            })()}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Account tabs */}
      {!cardLoading && accounts.length > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
          className="flex w-full flex-wrap gap-2">
          {accounts.map((acc) => {
            const isActive = acc.id === activeId;
            const { gradient, shadow } = getBankDesign(acc.name);
            return (
              <button
                key={acc.id}
                onClick={() => handleTabClick(acc)}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-br ${gradient} text-white shadow-md ${shadow}`
                    : 'border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {acc.name}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Transactions */}
      <AnimatePresence mode="wait">
        {txLoading ? (
          <motion.div key="tx-skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="rounded-2xl border border-gray-100 bg-white">
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
          </motion.div>
        ) : (
          <motion.div key="tx-content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col gap-6">
            <TransactionsTable transactions={displayedTransactions} />
            <Pagination page={currentPage} totalPages={totalPages} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionHistory;

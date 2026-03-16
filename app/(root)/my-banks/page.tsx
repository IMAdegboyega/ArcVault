'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiGetAccounts, apiDeleteBank } from '@/lib/api';
import HeaderBox from '@/components/HeaderBox';
import BankCard from '@/components/BankCard';
import ConnectBank from '@/components/ConnectBank';
import { formatAmount } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

const cardContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

const summaryContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const summaryItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

const MyBanks = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnectDialog, setDisconnectDialog] = useState<{ open: boolean; account: Account | null }>({ open: false, account: null });
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const loadAccounts = () => {
    apiGetAccounts().then((res) => {
      if (res.success && res.data) setAccounts(res.data.accounts);
      setLoading(false);
    });
  };

  useEffect(() => { loadAccounts(); }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  const handleDisconnect = async () => {
    if (!disconnectDialog.account) return;
    setIsDisconnecting(true);
    try {
      const res = await apiDeleteBank(disconnectDialog.account.id);
      if (res.success) {
        toast.success(`${disconnectDialog.account.name} disconnected.`);
        setDisconnectDialog({ open: false, account: null });
        setLoading(true);
        loadAccounts();
      } else {
        toast.error(res.error?.message || 'Failed to disconnect. Please try again.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="no-scrollbar flex flex-col gap-8 p-5 py-8 sm:px-8 lg:py-10 xl:max-h-screen xl:overflow-y-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <HeaderBox title="My Bank Accounts" subtext="Manage your linked bank accounts effortlessly." />
        {user && <ConnectBank user={user} variant="ghost" />}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-8"
          >
            {/* #10 — mobile fix: grid-cols-1 sm:grid-cols-3 */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
            </div>
          </motion.div>
        ) : accounts.length > 0 ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-8"
          >
            {/* Summary row — #10 mobile fix */}
            <motion.div
              variants={summaryContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              {[
                { label: 'Total Balance', value: formatAmount(totalBalance) },
                { label: 'Accounts', value: String(accounts.length) },
                { label: 'Primary', value: accounts[0]?.name || '—' },
              ].map((stat) => (
                <motion.div key={stat.label} variants={summaryItem} className="rounded-2xl border border-gray-100 bg-white px-4 py-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">{stat.label}</p>
                  <p className="mt-1 truncate text-xl font-bold text-gray-900">{stat.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Bank card grid */}
            <motion.div
              variants={cardContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {accounts.map((account) => (
                <motion.div key={account.id} variants={cardItem} className="flex flex-col">
                  <BankCard account={account} userName={`${user?.firstName} ${user?.lastName}`} />
                  {/* #5 — Disconnect button */}
                  <button
                    onClick={() => setDisconnectDialog({ open: true, account })}
                    className="mt-2 flex items-center gap-1.5 self-end rounded-md px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    Disconnect
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20"
          >
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-blue-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 6-6"/></svg>
            </div>
            <p className="text-base font-semibold text-gray-900">No bank accounts yet</p>
            <p className="mt-1 text-sm text-gray-500">Click &quot;Connect Bank&quot; to link your first account.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* #5 — Disconnect confirmation dialog */}
      {disconnectDialog.open && disconnectDialog.account && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDisconnectDialog({ open: false, account: null }); }}>
          <div className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="px-6 py-5">
              <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-rose-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round"><path d="m3 3 18 18"/><path d="M10.584 10.587a2 2 0 0 0 2.828 2.83"/><path d="M9.363 5.365A9.466 9.466 0 0 1 12 5c4.418 0 8 3.582 8 8 0 .823-.12 1.618-.34 2.37m-1.99 3.33A9.953 9.953 0 0 1 12 20c-4.418 0-8-3.582-8-8 0-1.48.405-2.867 1.11-4.05"/></svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900">Disconnect {disconnectDialog.account.name}?</h2>
              <p className="mt-1.5 text-sm text-gray-500">
                This will remove the account and all associated transaction history. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setDisconnectDialog({ open: false, account: null })}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-60"
              >
                {isDisconnecting ? (
                  <><div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />Disconnecting...</>
                ) : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBanks;

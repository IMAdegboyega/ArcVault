'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiGetAccounts, apiGetAccountTransactions } from '@/lib/api';
import HeaderBox from '@/components/HeaderBox';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import RecentTransactions from '@/components/RecentTransactions';
import RightSidebar from '@/components/RightSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';

const Home = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalBanks, setTotalBanks] = useState(0);
  const [totalCurrentBalance, setTotalCurrentBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const accountId = searchParams.get('id') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const accRes = await apiGetAccounts();
        if (accRes.success && accRes.data) {
          const { accounts: accs, totalBanks: tb, totalCurrentBalance: tcb } = accRes.data;
          setAccounts(accs);
          setTotalBanks(tb);
          setTotalCurrentBalance(tcb);

          const activeId = accountId || accs[0]?.id;
          if (activeId) {
            const txnRes = await apiGetAccountTransactions(activeId, { limit: 10 });
            if (txnRes.success && txnRes.data) {
              setTransactions(txnRes.data.transactions);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accountId]);

  if (!user) return null;

  return (
    <section className="flex h-full w-full flex-row max-xl:max-h-screen max-xl:overflow-y-auto">
      <div className="no-scrollbar flex flex-1 flex-col gap-8 p-5 py-8 sm:px-8 lg:py-10 xl:max-h-screen xl:overflow-y-auto">
        <HeaderBox
          type="greeting"
          title="Welcome,"
          user={user.firstName || 'Guest'}
          subtext="Access and manage your account and transactions efficiently."
        />

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
              <Skeleton className="h-40 rounded-2xl" />
              <div className="flex flex-col gap-5">
                <Skeleton className="h-6 w-48" />
                <div className="rounded-2xl border border-gray-100 bg-white">
                  <div className="flex flex-col gap-px">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 px-6 py-4">
                        <Skeleton className="size-9 shrink-0 rounded-full" />
                        <div className="flex flex-1 flex-col gap-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
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
              className="flex flex-col gap-8"
            >
              <TotalBalanceBox
                accounts={accounts}
                totalBanks={totalBanks}
                totalCurrentBalance={totalCurrentBalance}
              />

              {accounts.length > 0 ? (
                <RecentTransactions
                  accounts={accounts}
                  transactions={transactions}
                  selectedAccountId={accountId || accounts[0]?.id}
                  page={currentPage}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 dark:border-gray-700 dark:bg-gray-900">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 10h18" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">No accounts linked yet</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Connect a bank to see your balances and recent activity.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <RightSidebar user={user} transactions={transactions} banks={accounts} />
    </section>
  );
};

export default Home;

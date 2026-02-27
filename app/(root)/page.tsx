'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiGetAccounts, apiGetAccountTransactions } from '@/lib/api';
import HeaderBox from '@/components/HeaderBox';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import RecentTransactions from '@/components/RecentTransactions';
import RightSidebar from '@/components/RightSidebar';

const Home = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBanks, setTotalBanks] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const paramId = searchParams.get('id') || '';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiGetAccounts();
        if (res.success && res.data) {
          setAccounts(res.data.accounts);
          setTotalBanks(res.data.totalBanks);
          setTotalBalance(res.data.totalCurrentBalance);

          const activeId = paramId || res.data.accounts[0]?.id;
          if (activeId) {
            const txn = await apiGetAccountTransactions(activeId, { limit: 10 });
            if (txn.success && txn.data) setTransactions(txn.data.transactions);
          }
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [paramId]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const activeId = paramId || accounts[0]?.id || '';

  return (
    <div className="flex w-full">
      {/* Main content */}
      <div className="no-scrollbar flex flex-1 flex-col gap-8 px-5 py-8 sm:px-8 lg:py-10 xl:max-h-screen xl:overflow-y-auto">
        <HeaderBox type="greeting" title="Welcome," user={user?.firstName || 'Guest'} subtext="Access & manage your accounts and transactions." />

        <TotalBalanceBox accounts={accounts} totalBanks={totalBanks} totalCurrentBalance={totalBalance} />

        {accounts.length > 0 ? (
          <RecentTransactions accounts={accounts} transactions={transactions} selectedAccountId={activeId} page={1} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-blue-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            </div>
            <p className="text-base font-semibold text-gray-900">No bank accounts linked</p>
            <p className="mt-1 max-w-[280px] text-center text-sm text-gray-500">
              Connect a bank account from the sidebar to see your balances and transactions.
            </p>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <RightSidebar user={user!} transactions={transactions} banks={accounts} />
    </div>
  );
};

export default Home;

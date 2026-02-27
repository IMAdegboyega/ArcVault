'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiGetAccounts } from '@/lib/api';
import HeaderBox from '@/components/HeaderBox';
import BankCard from '@/components/BankCard';
import ConnectBank from '@/components/ConnectBank';
import { formatAmount } from '@/lib/utils';

const MyBanks = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetAccounts().then((res) => {
      if (res.success && res.data) setAccounts(res.data.accounts);
      setLoading(false);
    });
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  return (
    <div className="no-scrollbar flex flex-col gap-6 p-5 py-8 sm:px-8 lg:py-10 xl:max-h-screen xl:overflow-y-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <HeaderBox title="My Bank Accounts" subtext="Manage your linked bank accounts effortlessly." />
        {user && <ConnectBank user={user} variant="ghost" />}
      </div>

      {/* Summary row */}
      {!loading && accounts.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Total Balance</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{formatAmount(totalBalance)}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Accounts</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{accounts.length}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Primary</p>
            <p className="mt-1 truncate text-base font-bold text-gray-900">{accounts[0]?.name || '—'}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
        </div>
      ) : accounts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {accounts.map((account) => (
            <BankCard key={account.id} account={account} userName={`${user?.firstName} ${user?.lastName}`} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-blue-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 6-6"/></svg>
          </div>
          <p className="text-base font-semibold text-gray-900">No bank accounts yet</p>
          <p className="mt-1 text-sm text-gray-500">Click &quot;Connect Bank&quot; to link your first account.</p>
        </div>
      )}
    </div>
  );
};

export default MyBanks;

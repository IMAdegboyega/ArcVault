'use client';

import { useEffect, useState } from 'react';
import { apiGetAccounts } from '@/lib/api';
import HeaderBox from '@/components/HeaderBox';
import PaymentTransferForm from '@/components/PaymentTransferForm';

const PaymentTransfer = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetAccounts().then((res) => {
      if (res.success && res.data) setAccounts(res.data.accounts);
      setLoading(false);
    });
  }, []);

  return (
    <div className="no-scrollbar flex flex-col gap-8 p-5 py-8 sm:px-8 lg:py-10 xl:max-h-screen xl:overflow-y-auto">
      <HeaderBox title="Transfer Funds" subtext="Send money to other ArcVault users securely and instantly." />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
        </div>
      ) : accounts.length > 0 ? (
        <PaymentTransferForm accounts={accounts} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-blue-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"><path d="M12 2v20"/><path d="m17 7-5-5-5 5"/><path d="m17 17-5 5-5-5"/></svg>
          </div>
          <p className="text-base font-semibold text-gray-900">No bank accounts linked</p>
          <p className="mt-1 text-sm text-gray-500">Connect a bank account first to make transfers.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentTransfer;

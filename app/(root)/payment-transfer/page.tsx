'use client';

import { useEffect, useState } from 'react';
import { apiGetAccounts } from '@/lib/api';
import HeaderBox from '@/components/HeaderBox';
import PaymentTransferForm from '@/components/PaymentTransferForm';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';

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

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-5"
          >
            <Skeleton className="h-32 rounded-2xl" />
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-56" />
              <div className="mt-2 flex flex-col gap-4 max-w-[500px]">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-11 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
            <Skeleton className="h-12 max-w-[500px] rounded-lg" />
          </motion.div>
        ) : accounts.length > 0 ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <PaymentTransferForm accounts={accounts} />
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"><path d="M12 2v20"/><path d="m17 7-5-5-5 5"/><path d="m17 17-5 5-5-5"/></svg>
            </div>
            <p className="text-base font-semibold text-gray-900">No bank accounts linked</p>
            <p className="mt-1 text-sm text-gray-500">Connect a bank account first to make transfers.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentTransfer;

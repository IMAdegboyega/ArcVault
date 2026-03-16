'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TransactionsTable from './TransactionsTable';
import { apiGetAccountTransactions } from '@/lib/api';
import { AnimatePresence, motion } from 'framer-motion';

const RecentTransactions = ({ accounts, transactions: initialTxns, selectedAccountId, page = 1 }: RecentTransactionsProps) => {
  const [activeId, setActiveId] = useState(selectedAccountId || accounts[0]?.id);
  const [transactions, setTransactions] = useState(initialTxns);

  useEffect(() => {
    if (activeId && activeId !== selectedAccountId) {
      apiGetAccountTransactions(activeId, { limit: 10 }).then((res) => {
        if (res.success && res.data) setTransactions(res.data.transactions);
      });
    }
  }, [activeId, selectedAccountId]);

  return (
    <section className="flex w-full flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
        <Link
          href={`/transaction-history?id=${activeId}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all →
        </Link>
      </div>

      {/* Account tabs */}
      {accounts.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {accounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setActiveId(acc.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                acc.id === activeId
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                acc.id === activeId ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {acc.name[0]}
              </span>
              {acc.name}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <TransactionsTable transactions={transactions} />
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default RecentTransactions;

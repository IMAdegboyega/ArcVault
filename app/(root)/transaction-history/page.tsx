'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiGetAccounts, apiGetAccount, apiGetAccountTransactions } from '@/lib/api';
import HeaderBox from '@/components/HeaderBox';
import TransactionsTable from '@/components/TransactionsTable';
import { Pagination } from '@/components/Pagination';
import { formatAmount } from '@/lib/utils';

const TransactionHistory = () => {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const accountId = searchParams.get('id') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const accRes = await apiGetAccounts();
        if (accRes.success && accRes.data) {
          setAccounts(accRes.data.accounts);
          const activeId = accountId || accRes.data.accounts[0]?.id;
          if (activeId) {
            const [detail, txn] = await Promise.all([
              apiGetAccount(activeId),
              apiGetAccountTransactions(activeId, { page: currentPage, limit: 20 }),
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
  }, [accountId, currentPage]);

  const activeId = accountId || accounts[0]?.id;

  return (
    <div className="no-scrollbar flex flex-col gap-6 p-5 py-8 sm:px-8 lg:py-10 xl:max-h-screen xl:overflow-y-auto">
      <HeaderBox title="Transaction History" subtext="View detailed transaction records across your accounts." />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <>
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

          {/* Account tabs — visible, scrollable, never clipped */}
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

          <TransactionsTable transactions={transactions} />
          <Pagination page={currentPage} totalPages={totalPages} />
        </>
      )}
    </div>
  );
};

export default TransactionHistory;

import { formatAmount, formatDateTime, getTransactionStatus, removeSpecialCharacters } from '@/lib/utils';
import { transactionCategoryStyles } from '@/constants';

const StatusBadge = ({ status }: { status: string }) => {
  const isSuccess = status === 'Success';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
      isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
    }`}>
      <span className={`size-1.5 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {status}
    </span>
  );
};

const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const style = transactionCategoryStyles[category as keyof typeof transactionCategoryStyles] || transactionCategoryStyles.default;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${style.borderColor} ${style.chipBackgroundColor} ${style.textColor}`}>
      <span className={`size-1.5 rounded-full ${style.backgroundColor}`} />
      {category}
    </span>
  );
};

const TransactionsTable = ({ transactions }: TransactionTableProps) => {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-gray-50">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>
        </div>
        <p className="text-sm font-medium text-gray-400">No transactions yet</p>
        <p className="mt-0.5 text-xs text-gray-300">Connect a bank to see activity</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Transaction</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Amount</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Date</th>
              <th className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 md:table-cell">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((t) => {
              const status = getTransactionStatus(new Date(t.date));
              const isDebit = t.amount > 0;
              const initial = removeSpecialCharacters(t.name)[0]?.toUpperCase() || '?';
              return (
                <tr key={t.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${isDebit ? 'bg-rose-400' : 'bg-emerald-400'}`}>
                        {initial}
                      </div>
                      <span className="truncate text-sm font-medium text-gray-900 max-w-[200px]">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm font-semibold tabular-nums ${isDebit ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isDebit ? '-' : '+'}{formatAmount(Math.abs(t.amount))}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-gray-500">{formatDateTime(new Date(t.date)).dateOnly}</span>
                  </td>
                  <td className="hidden px-5 py-3.5 md:table-cell">
                    <CategoryBadge category={t.category || 'Other'} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;

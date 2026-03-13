import { formatAmount } from '@/lib/utils';
import Category from './Category';
import { countTransactionCategories } from '@/lib/utils';
import Link from 'next/link';

const RightSidebar = ({ user, transactions, banks }: RightSidebarProps) => {
  const categories = countTransactionCategories(transactions);

  return (
    <aside className="no-scrollbar hidden h-screen w-[360px] shrink-0 flex-col overflow-y-auto border-l border-gray-100 bg-white xl:flex">
      {/* Profile header */}
      <div className="relative">
        <div className="h-[100px] bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />
        <div className="px-6 pb-6">
          <div className="relative -mt-8 flex items-end gap-4">
            <div className="flex size-[60px] shrink-0 items-center justify-center rounded-xl border-4 border-white bg-blue-600 text-lg font-bold text-white shadow-md">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="pb-1">
              <p className="text-base font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Banks — compact card list */}
      <div className="flex flex-col gap-4 border-t border-gray-50 px-6 py-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">My Banks</h3>
          <Link href="/my-banks" className="text-xs font-medium text-blue-600 hover:text-blue-700">View all</Link>
        </div>
        {banks.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {banks.slice(0, 4).map((bank) => (
              <Link
                key={bank.id}
                href={`/transaction-history?id=${bank.id}`}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 transition-all hover:border-blue-100 hover:bg-blue-50/30 hover:shadow-sm"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-sm font-bold text-white shadow-sm">
                  {bank.name[0]}
                </div>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <p className="truncate text-sm font-semibold text-gray-900">{bank.name}</p>
                  <p className="text-xs text-gray-500">●●●● {bank.mask}</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-gray-900">{formatAmount(bank.currentBalance)}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No banks linked yet</p>
        )}
      </div>

      {/* Top Categories */}
      {categories.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-gray-50 px-6 py-6">
          <h3 className="text-sm font-semibold text-gray-900">Top Categories</h3>
          <div className="flex flex-col gap-2.5">
            {categories.slice(0, 5).map((cat) => (
              <Category key={cat.name} category={cat} />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;

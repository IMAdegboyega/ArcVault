import { formatAmount } from '@/lib/utils';

const BankInfo = ({ account, selectedAccountId, type }: BankInfoProps) => {
  const isSelected = selectedAccountId === account.id;
  return (
    <div className={`flex items-center gap-3 rounded-xl p-4 transition-all ${isSelected ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border border-transparent'}`}>
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
        {account.name[0]}
      </div>
      <div className="flex flex-1 items-center justify-between gap-2 overflow-hidden">
        <div>
          <p className="truncate text-sm font-semibold text-gray-900">{account.name}</p>
          <p className="text-xs text-gray-500">{account.subtype} ●●●● {account.mask}</p>
        </div>
        {type !== 'card' && (
          <p className="shrink-0 text-sm font-semibold text-gray-900">{formatAmount(account.currentBalance)}</p>
        )}
      </div>
    </div>
  );
};

export default BankInfo;

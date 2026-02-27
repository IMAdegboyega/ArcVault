'use client';

import { useState, useRef, useEffect } from 'react';
import { formatAmount } from '@/lib/utils';

const BankDropdown = ({ accounts, setValue, otherStyles }: BankDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(accounts[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleSelect = (account: Account) => {
    setSelected(account);
    if (setValue) setValue('senderAccountId', account.id);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${otherStyles || ''}`}>
      <button type="button" onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm transition-colors hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
            {selected?.name?.[0]}
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">{selected?.name}</p>
            <p className="text-xs text-gray-500">{formatAmount(selected?.currentBalance || 0)}</p>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          {accounts.map((acc) => (
            <button key={acc.id} type="button" onClick={() => handleSelect(acc)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-gray-50 ${acc.id === selected?.id ? 'bg-blue-50/50' : ''}`}>
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">{acc.name[0]}</div>
              <div className="text-left">
                <p className="font-medium text-gray-900">{acc.name}</p>
                <p className="text-xs text-gray-500">{formatAmount(acc.currentBalance)}</p>
              </div>
              {acc.id === selected?.id && (
                <svg className="ml-auto text-blue-600" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BankDropdown;

import { formatAmount, getBankDesign } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import Copy from './Copy';

const BankCard = ({ account, userName, showBalance = true }: CreditCardProps) => {
  const { gradient, shadow, hoverShadow, cardType } = getBankDesign(account.name);
  return (
    <div className="flex flex-col">
      <Link
        href={`/transaction-history/?id=${account.id}`}
        className={`relative flex h-[190px] w-full justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} shadow-lg ${shadow} transition-[transform,box-shadow] duration-200 ease-out hover:scale-[1.02] hover:shadow-xl ${hoverShadow} active:scale-[0.98] will-change-transform`}
      >
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-5">
          <div>
            <h2 className="text-[15px] font-semibold text-white/90">{account.name}</h2>
            {showBalance && (
              <p className="mt-1 text-[22px] font-bold text-white">
                {formatAmount(account.currentBalance)}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[11px] font-medium text-white/60">{userName}</p>
            <p className="text-sm font-semibold tracking-[2px] text-white">
              ●●●● {account.mask}
            </p>
          </div>
        </div>
        {/* Right side decoration */}
        <div className="flex flex-col items-end justify-between p-5">
          <Image src="/icons/Paypass.svg" width={20} height={24} alt="" className="opacity-80" />
          {cardType === 'visa'
            ? <Image src="/icons/visa.svg" width={58} height={20} alt="Visa" />
            : <Image src="/icons/mastercard.svg" width={45} height={32} alt="Mastercard" />
          }
        </div>
        {/* Background circles */}
        <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 size-40 rounded-full bg-white/5" />
        <div className="absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03]" />
      </Link>
      {showBalance && (
        <div className="mt-3">
          <Copy title={account.shareableId} />
        </div>
      )}
    </div>
  );
};

export default BankCard;

import AnimatedCounter from './AnimatedCounter';
import DoughnutChart from './DoughnutChart';

const TotalBalanceBox = ({ accounts = [], totalBanks, totalCurrentBalance }: TotalBalanceBoxProps) => {
  return (
    <section className="flex w-full items-center gap-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex size-full max-w-[120px] items-center sm:max-w-[140px]">
        {accounts.length > 0 ? (
          <DoughnutChart accounts={accounts} />
        ) : (
          <div className="flex size-[120px] items-center justify-center rounded-full bg-gray-50">
            <span className="text-3xl text-gray-300">$</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div className="flex size-2 rounded-full bg-blue-600" />
          <p className="text-sm font-medium text-gray-500">
            {totalBanks === 0 ? 'No accounts' : totalBanks === 1 ? '1 Bank Account' : `${totalBanks} Bank Accounts`}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Balance</p>
          <div className="text-[28px] font-bold leading-tight text-gray-900 lg:text-[32px]">
            <AnimatedCounter amount={totalCurrentBalance} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TotalBalanceBox;

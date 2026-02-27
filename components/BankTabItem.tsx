const BankTabItem = ({ account, selectedAccountId }: BankTabItemProps) => {
  const isActive = selectedAccountId === account.id;
  return (
    <div className={`flex items-center gap-2 border-b-2 px-3 py-2.5 cursor-pointer transition-all ${isActive ? 'border-blue-600' : 'border-transparent hover:border-gray-200'}`}>
      <div className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
        {account.name[0]}
      </div>
      <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
        {account.name}
      </span>
    </div>
  );
};

export default BankTabItem;

const HeaderBox = ({ type = 'title', title, subtext, user }: HeaderBoxProps) => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold text-gray-900 lg:text-[28px] dark:text-white">
        {title}
        {type === 'greeting' && (
          <span className="text-blue-600">&nbsp;{user}</span>
        )}
      </h1>
      <p className="text-sm text-gray-500 lg:text-[15px] dark:text-gray-400">{subtext}</p>
    </div>
  );
};

export default HeaderBox;

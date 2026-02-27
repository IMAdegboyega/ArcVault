import { topCategoryStyles } from '@/constants';

const Category = ({ category }: CategoryProps) => {
  const style = topCategoryStyles[category.name as keyof typeof topCategoryStyles] || topCategoryStyles.default;
  const pct = category.totalCount > 0 ? Math.round((category.count / category.totalCount) * 100) : 0;

  return (
    <div className={`flex items-center gap-3 rounded-xl p-3.5 ${style.bg}`}>
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${style.circleBg}`}>
        <span className={`text-sm font-bold ${style.text.main}`}>{category.name[0]}</span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${style.text.main}`}>{category.name}</span>
          <span className={`text-xs font-semibold ${style.text.count}`}>{category.count}</span>
        </div>
        <div className={`h-1.5 w-full overflow-hidden rounded-full ${style.progress.bg}`}>
          <div className={`h-full rounded-full transition-all duration-500 ${style.progress.indicator}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
};

export default Category;

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { formUrlQuery } from '@/lib/utils';

export const Pagination = ({ page, totalPages }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const handleNav = (dir: 'prev' | 'next') => {
    const url = formUrlQuery({
      params: searchParams.toString(),
      key: 'page',
      value: (dir === 'prev' ? page - 1 : page + 1).toString(),
    });
    router.push(url, { scroll: false });
  };

  return (
    <div className="flex items-center justify-between pt-2">
      <button onClick={() => handleNav('prev')} disabled={page <= 1}
        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        ← Previous
      </button>
      <span className="text-sm text-gray-500">
        <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
      </span>
      <button onClick={() => handleNav('next')} disabled={page >= totalPages}
        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        Next →
      </button>
    </div>
  );
};

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiGetTransfers } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import HeaderBox from '@/components/HeaderBox';
import { Pagination } from '@/components/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { formatAmount, formatDateTime } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const STATUS_STYLES: Record<string, string> = {
  COMPLETED:  'bg-emerald-50 text-emerald-700',
  PENDING:    'bg-amber-50 text-amber-700',
  PROCESSING: 'bg-amber-50 text-amber-700',
  FAILED:     'bg-rose-50 text-rose-700',
  CANCELLED:  'bg-gray-100 text-gray-600',
};

const STATUS_DOTS: Record<string, string> = {
  COMPLETED:  'bg-emerald-500',
  PENDING:    'bg-amber-500',
  PROCESSING: 'bg-amber-500',
  FAILED:     'bg-rose-500',
  CANCELLED:  'bg-gray-400',
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

const tableVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const TransferHistory = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    setLoading(true);
    apiGetTransfers(currentPage, 10).then((res) => {
      if (res.success && res.data) {
        setTransfers(res.data.transfers);
        setTotalPages(res.data.pagination.totalPages);
      }
      setLoading(false);
    });
  }, [currentPage]);

  return (
    <div className="no-scrollbar flex flex-col gap-8 p-5 py-8 sm:px-8 lg:py-10 xl:max-h-screen xl:overflow-y-auto">
      <HeaderBox title="Transfer History" subtext="View all your sent and received transfers." />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-px overflow-hidden rounded-2xl border border-gray-100 bg-white"
          >
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="size-9 rounded-full shrink-0" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </motion.div>
        ) : transfers.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20"
          >
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-blue-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"><path d="M12 2v20"/><path d="m17 7-5-5-5 5"/><path d="m17 17-5 5-5-5"/></svg>
            </div>
            <p className="text-base font-semibold text-gray-900">No transfers yet</p>
            <p className="mt-1 text-sm text-gray-500">Your transfer history will appear here.</p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col gap-6"
          >
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Date</th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Counterpart</th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Note</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={tableVariants}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-gray-50"
                  >
                    {transfers.map((t) => {
                      const isSent = t.senderUserId === user?.id;
                      const isExpanded = expandedId === t.id;
                      return (
                        <>
                          <motion.tr
                            key={t.id}
                            variants={rowVariants}
                            onClick={() => setExpandedId(isExpanded ? null : t.id)}
                            className="cursor-pointer transition-colors hover:bg-gray-50/60"
                          >
                            <td className="px-5 py-3.5">
                              <span className="text-sm text-gray-500">
                                {formatDateTime(new Date(t.createdAt)).dateOnly}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${isSent ? 'bg-rose-400' : 'bg-emerald-400'}`}>
                                  {isSent ? '↑' : '↓'}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {isSent
                                      ? (t.receiverAccount?.name || t.email || 'Unknown')
                                      : (t.senderAccount?.name || 'Unknown')}
                                  </p>
                                  <p className="text-xs text-gray-400">{isSent ? 'Sent' : 'Received'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`text-sm font-semibold tabular-nums ${isSent ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {isSent ? '-' : '+'}{formatAmount(t.amount)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[t.status] || STATUS_STYLES.PENDING}`}>
                                <span className={`size-1.5 rounded-full ${STATUS_DOTS[t.status] || STATUS_DOTS.PENDING}`} />
                                {t.status.charAt(0) + t.status.slice(1).toLowerCase()}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="truncate text-sm text-gray-500 max-w-[160px] block">
                                {t.description || '—'}
                              </span>
                            </td>
                          </motion.tr>

                          {/* Expanded detail row */}
                          {isExpanded && (
                            <tr key={`${t.id}-detail`} className="bg-gray-50/50">
                              <td colSpan={5} className="px-5 py-4">
                                <div className="flex flex-wrap gap-6 text-xs text-gray-500">
                                  <div>
                                    <span className="font-medium text-gray-700">Transfer ID</span>
                                    <p className="mt-0.5 font-mono text-gray-500 select-all">{t.id}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">From Account</span>
                                    <p className="mt-0.5">{t.senderAccount?.name || '—'} {t.senderAccount?.mask ? `••••${t.senderAccount.mask}` : ''}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">To Account</span>
                                    <p className="mt-0.5">{t.receiverAccount?.name || t.email || '—'} {t.receiverAccount?.mask ? `••••${t.receiverAccount.mask}` : ''}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">Timestamp</span>
                                    <p className="mt-0.5">{formatDateTime(new Date(t.createdAt)).dateTime}</p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </motion.tbody>
                </table>
              </div>
            </div>

            <Pagination page={currentPage} totalPages={totalPages} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransferHistory;

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import BankDropdown from './BankDropdown';
import { apiCreateTransfer } from '@/lib/api';
import { useRouter } from 'next/navigation';

const transferSchema = z.object({
  email: z.string().email('Enter a valid email'),
  shareableId: z.string().optional(),
  amount: z.string().min(1, 'Enter an amount'),
  description: z.string().optional(),
  senderAccountId: z.string().min(1, 'Select a bank account'),
});

const PaymentTransferForm = ({ accounts }: PaymentTransferFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const form = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: { email: '', shareableId: '', amount: '', description: '', senderAccountId: accounts[0]?.id || '' },
  });

  const onSubmit = async (data: z.infer<typeof transferSchema>) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiCreateTransfer({
        senderAccountId: data.senderAccountId,
        email: data.email,
        shareableId: data.shareableId || undefined,
        amount: parseFloat(data.amount),
        description: data.description || undefined,
      });
      if (res.success) {
        setSuccess(res.message || 'Transfer completed!');
        form.reset();
        setTimeout(() => router.push('/'), 2000);
      } else {
        setError(res.error?.message || 'Transfer failed');
      }
    } catch { setError('Something went wrong'); }
    finally { setIsLoading(false); }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        {/* Source bank */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="text-base font-semibold text-gray-900">Source Account</h3>
          <p className="mt-0.5 text-sm text-gray-500">Select the account to send from</p>
          <div className="mt-4">
            <BankDropdown accounts={accounts} setValue={form.setValue} otherStyles="w-full max-w-[500px]" />
          </div>
        </div>

        {/* Recipient details */}
        <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="text-base font-semibold text-gray-900">Recipient Details</h3>
          <p className="mt-0.5 text-sm text-gray-500">Enter the recipient information</p>

          <div className="mt-5 flex max-w-[500px] flex-col gap-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <FormLabel className="text-sm font-medium text-gray-700">Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="recipient@email.com" className="h-11 rounded-lg border-gray-200 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" {...field} />
                </FormControl>
                <FormMessage className="text-xs text-rose-500" />
              </div>
            )} />

            <FormField control={form.control} name="shareableId" render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <FormLabel className="text-sm font-medium text-gray-700">
                  Shareable ID <span className="text-gray-400 font-normal">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Public account number" className="h-11 rounded-lg border-gray-200 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" {...field} />
                </FormControl>
              </div>
            )} />

            <FormField control={form.control} name="amount" render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <FormLabel className="text-sm font-medium text-gray-700">Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                    <Input type="number" step="0.01" min="0.01" placeholder="0.00"
                      className="h-11 rounded-lg border-gray-200 pl-7 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" {...field} />
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-rose-500" />
              </div>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <FormLabel className="text-sm font-medium text-gray-700">
                  Note <span className="text-gray-400 font-normal">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea placeholder="What's this for?" rows={3}
                    className="resize-none rounded-lg border-gray-200 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" {...field} />
                </FormControl>
              </div>
            )} />
          </div>
        </div>

        {/* Feedback */}
        {error && <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
        {success && <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

        {/* Submit */}
        <div className="mt-6 max-w-[500px]">
          <button type="submit" disabled={isLoading}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-60">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </div>
            ) : 'Transfer Funds'}
          </button>
        </div>
      </form>
    </Form>
  );
};

export default PaymentTransferForm;

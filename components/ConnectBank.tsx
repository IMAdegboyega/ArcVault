'use client';

import { useState } from 'react';
import { apiCreateLinkToken, apiConnectBank } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Institution { id: string; name: string; logo: string; }

const ConnectBank = ({ user, variant }: PlaidLinkProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [linkToken, setLinkToken] = useState('');
  const [selected, setSelected] = useState<Institution | null>(null);
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [error, setError] = useState('');

  const handleOpen = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiCreateLinkToken();
      if (res.success && res.data) {
        setLinkToken(res.data.linkToken);
        setInstitutions(res.data.institutions || []);
        setIsOpen(true);
        setStep('select');
        setSelected(null);
      }
    } catch (err) {
      console.error('Failed to create link token:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!selected || !linkToken) return;
    setIsConnecting(true);
    setError('');
    try {
      const res = await apiConnectBank(linkToken, selected.id);
      if (res.success) {
        setStep('success');
        setTimeout(() => { setIsOpen(false); router.push('/'); router.refresh(); }, 1800);
      } else {
        setError(res.error?.message || 'Connection failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Trigger
  const Trigger = () => {
    if (variant === 'primary') {
      return (
        <button onClick={handleOpen} disabled={isLoading}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-60">
          {isLoading ? <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Connect Bank'}
        </button>
      );
    }
    return (
      <button onClick={handleOpen} disabled={isLoading}
        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-gray-50 justify-center xl:justify-start">
        <Image src="/icons/connect-bank.svg" alt="" width={20} height={20} className="opacity-50 group-hover:opacity-70 transition-opacity" />
        <span className="hidden text-sm font-semibold text-gray-600 xl:block">Connect Bank</span>
      </button>
    );
  };

  return (
    <>
      <Trigger />
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div className="w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-blue-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {step === 'select' ? 'Link a Bank Account' : step === 'confirm' ? 'Confirm Connection' : 'Connected!'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {step === 'select' ? `Step 1 of 2 — Choose your bank` : step === 'confirm' ? `Step 2 of 2 — Review & confirm` : `${selected?.name} linked`}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Progress bar */}
            {step !== 'success' && (
              <div className="flex gap-1.5 px-6 pt-4">
                <div className="h-1 flex-1 rounded-full bg-blue-600" />
                <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step === 'confirm' ? 'bg-blue-600' : 'bg-gray-100'}`} />
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-5">

              {/* STEP 1: Select bank */}
              {step === 'select' && (
                <div className="flex flex-col gap-2">
                  {institutions.map((inst) => (
                    <button key={inst.id} onClick={() => { setSelected(inst); setStep('confirm'); }}
                      className="flex items-center gap-3.5 rounded-xl border border-gray-100 p-3.5 text-left transition-all hover:border-blue-200 hover:bg-blue-50/40 active:scale-[0.99]">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gray-50 text-xl">
                        {inst.logo}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{inst.name}</p>
                        <p className="text-[11px] text-gray-400">Checking & Savings</p>
                      </div>
                      <svg className="text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 2: Confirm */}
              {step === 'confirm' && selected && (
                <div className="flex flex-col gap-4">
                  {/* Selected bank summary */}
                  <div className="flex items-center gap-3.5 rounded-xl bg-blue-600 p-4 text-white shadow-md shadow-blue-600/20">
                    <div className="flex size-11 items-center justify-center rounded-lg bg-white/20 text-xl backdrop-blur-sm">
                      {selected.logo}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{selected.name}</p>
                      <p className="text-xs text-white/70">Checking & Savings accounts</p>
                    </div>
                  </div>

                  {/* What will happen */}
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">What happens next:</p>
                    <div className="flex flex-col gap-2">
                      {[
                        'Account details will be securely linked',
                        'Transaction history will sync automatically',
                        'Balance updates in real time',
                      ].map((text, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                          <p className="text-xs text-gray-600">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 text-center">
                    This is a simulated connection for demo purposes. No real data is accessed.
                  </p>

                  {error && (
                    <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button onClick={() => setStep('select')}
                      className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Back
                    </button>
                    <button onClick={handleConnect} disabled={isConnecting}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-all">
                      {isConnecting ? (
                        <>
                          <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Connecting...
                        </>
                      ) : 'Connect Account'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Success */}
              {step === 'success' && (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-gray-900">Bank Connected!</p>
                    <p className="mt-1 text-sm text-gray-500">{selected?.name} has been linked to your account.</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <div className="size-3 animate-spin rounded-full border-[1.5px] border-gray-300 border-t-transparent" />
                    Redirecting to dashboard...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectBank;

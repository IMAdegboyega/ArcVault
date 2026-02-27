'use client';

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import Image from "next/image";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="flex h-screen w-full font-inter">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-5 sm:px-8 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icons/logo.svg" width={28} height={28} alt="ArcVault" />
            <span className="text-lg font-bold font-ibm-plex-serif text-gray-900">ArcVault</span>
          </Link>
          <MobileNav user={user} />
        </header>
        <div className="flex-1 overflow-y-auto bg-gray-50/60">
          {children}
        </div>
      </div>
    </main>
  );
}

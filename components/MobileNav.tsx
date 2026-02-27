'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetClose, SheetTrigger } from './ui/sheet';
import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

const MobileNav = ({ user }: MobileNavProps) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex size-9 items-center justify-center rounded-lg hover:bg-gray-50">
          <Image src="/icons/hamburger.svg" width={22} height={22} alt="Menu" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] border-none bg-white p-0">
        <div className="flex h-full flex-col justify-between">
          <div>
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 px-6 py-7">
              <Image src="/icons/logo.svg" width={28} height={28} alt="ArcVault" />
              <span className="text-lg font-bold font-ibm-plex-serif text-gray-900">ArcVault</span>
            </Link>
            <nav className="flex flex-col gap-1 px-4">
              {sidebarLinks.map((item) => {
                const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
                return (
                  <SheetClose asChild key={item.route}>
                    <Link
                      href={item.route}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all',
                        isActive ? 'bg-blue-600 shadow-md shadow-blue-600/20' : 'hover:bg-gray-50'
                      )}
                    >
                      <Image src={item.imgURL} alt="" width={20} height={20}
                        className={cn(isActive ? 'brightness-0 invert' : 'opacity-50')} />
                      <span className={cn('text-sm font-semibold', isActive ? 'text-white' : 'text-gray-600')}>
                        {item.label}
                      </span>
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>
          </div>
          <div className="px-3 pb-4">
            <Footer user={user} type="mobile" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;

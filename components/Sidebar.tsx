'use client';

import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Footer from './Footer';
import ConnectBank from './ConnectBank';

const Sidebar = ({ user }: SiderbarProps) => {
  const pathname = usePathname();

  return (
    <section className="sticky left-0 top-0 hidden h-screen w-[72px] flex-col justify-between border-r border-gray-100 bg-white md:flex xl:w-[264px] dark:border-gray-800 dark:bg-gray-900">
      {/* Logo */}
      <div>
        <Link href="/" className="flex items-center gap-2.5 px-5 py-7 xl:px-6">
          <Image src="/icons/logo.svg" width={30} height={30} alt="ArcVault" className="min-w-[30px]" />
          <h1 className="hidden text-[22px] font-bold font-ibm-plex-serif text-gray-900 xl:block dark:text-white">
            ArcVault
          </h1>
        </Link>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-3 xl:px-4">
          {sidebarLinks.map((item) => {
            const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
            return (
              <Link
                href={item.route}
                key={item.label}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                  'justify-center xl:justify-start',
                  isActive
                    ? 'bg-blue-600 shadow-md shadow-blue-600/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <div className="relative size-5">
                  <Image
                    src={item.imgURL}
                    alt={item.label}
                    fill
                    className={cn(
                      'transition-all',
                      isActive ? 'brightness-0 invert' : 'opacity-50 group-hover:opacity-70 dark:opacity-40 dark:group-hover:opacity-60'
                    )}
                  />
                </div>
                <span className={cn(
                  'hidden text-sm font-semibold xl:block',
                  isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Connect Bank in sidebar */}
          <div className="mt-2 border-t border-gray-100 pt-3 dark:border-gray-800">
            <ConnectBank user={user} />
          </div>
        </nav>
      </div>

      {/* Footer */}
      <Footer user={user} />
    </section>
  );
};

export default Sidebar;

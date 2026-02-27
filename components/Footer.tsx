'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import Image from 'next/image';

const Footer = ({ user, type = 'desktop' }: FooterProps) => {
  const { logout } = useAuth();

  return (
    <footer className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-4 xl:px-5">
      <div className={`flex items-center gap-2.5 ${type === 'mobile' ? '' : 'hidden xl:flex'}`}>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="truncate text-sm font-semibold text-gray-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="truncate text-xs text-gray-500">{user?.email}</p>
        </div>
      </div>
      <button
        onClick={logout}
        title="Logout"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors mx-auto xl:mx-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </footer>
  );
};

export default Footer;

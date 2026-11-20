import React from 'react';
import { Compass, FolderOpen, Home, Store, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { user } = useApp();
  const location = useLocation();
  const accountPath = user.isLoggedIn ? '/account' : '/auth';
  const items = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/collections', label: 'Folders', icon: FolderOpen },
    ...(user.isLoggedIn && user.role === 'seller' ? [{ path: '/studio', label: 'Studio', icon: Store }] : []),
    { path: accountPath, label: user.isLoggedIn ? 'Account' : 'Sign in', icon: User },
  ];

  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-stone-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
      {items.map(({ path, label, icon: Icon }) => {
        const selected = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
        return <Link key={path} to={path} className={`flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 ${selected ? 'text-amber-900' : 'text-stone-500'}`}><Icon className="h-4 w-4" /><span>{label}</span></Link>;
      })}
    </nav>
  );
};

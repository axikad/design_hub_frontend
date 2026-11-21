import React, { useEffect, useState } from 'react';
import { Heart, LogOut, Menu, Search, ShoppingBag, Store, User, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { user, savedDesignIds, purchases, logout, searchQuery, setSearchQuery } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState(searchQuery);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setMenuOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    setSearchQuery(value);
    setSearchOpen(false);
    navigate(value ? `/explore?q=${encodeURIComponent(value)}` : '/explore');
  };

  const active = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  const navClass = (path: string) =>
    `transition hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-4 ${active(path) ? 'font-semibold text-stone-950' : 'text-stone-600'}`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-stone-200/90 bg-[#FAF8F5]/95 backdrop-blur-lg">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-950 font-serif text-lg font-bold text-amber-300">T</span>
            <span className="leading-tight">
              <span className="block font-serif text-lg font-bold text-stone-950 sm:text-xl">Textile Design Hub</span>
              <span className="hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-500 sm:block">Digital textile marketplace</span>
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-7 text-sm lg:flex">
            <Link to="/explore" aria-current={active('/explore') ? 'page' : undefined} className={navClass('/explore')}>Explore</Link>
            <Link to="/collections" aria-current={active('/collections') ? 'page' : undefined} className={navClass('/collections')}>Design folders</Link>
            {user.isLoggedIn && user.role === 'seller' && <Link to="/studio" aria-current={active('/studio') ? 'page' : undefined} className={navClass('/studio')}>My studio</Link>}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button type="button" onClick={() => setSearchOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-600 transition hover:border-stone-300 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700" aria-label="Search designs">
              <Search className="h-4 w-4" />
              <span className="hidden md:inline">Search</span>
              <kbd className="hidden rounded border border-stone-200 px-1.5 py-0.5 font-mono text-[10px] text-stone-400 md:inline">/</kbd>
            </button>

            {user.isLoggedIn ? (
              <>
                <Link to="/account?tab=saved" className="relative hidden h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 sm:flex" aria-label="Saved designs">
                  <Heart className="h-5 w-5" />
                  {savedDesignIds.length > 0 && <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-amber-800 px-1 text-center text-[9px] font-bold leading-4 text-white">{savedDesignIds.length}</span>}
                </Link>
                <Link to="/account/purchases" className="relative hidden h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 sm:flex" aria-label="Purchases">
                  <ShoppingBag className="h-5 w-5" />
                  {purchases.length > 0 && <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-emerald-700 px-1 text-center text-[9px] font-bold leading-4 text-white">{purchases.length}</span>}
                </Link>
                <div className="relative hidden sm:block">
                  <button type="button" onClick={() => setProfileOpen((value) => !value)} className="flex h-10 items-center gap-2 rounded-lg p-1.5 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700" aria-expanded={profileOpen} aria-label="Open account menu">
                    {user.avatar ? <img src={user.avatar} alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-stone-300" /> : <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-900 ring-1 ring-amber-200">{user.name.slice(0, 1).toUpperCase()}</span>}
                    <span className="hidden max-w-28 truncate text-xs font-semibold text-stone-700 xl:block">{user.name}</span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl border border-stone-200 bg-white p-2 shadow-xl">
                      <div className="border-b border-stone-100 px-3 py-2"><p className="truncate text-sm font-semibold text-stone-950">{user.name}</p><p className="truncate text-xs text-stone-500">{user.email || user.phone}</p></div>
                      {user.role === 'seller' && <Link to="/studio" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"><Store className="h-4 w-4" />My studio</Link>}
                      <Link to="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"><User className="h-4 w-4" />Account</Link>
                      <button type="button" onClick={() => { void logout(); setProfileOpen(false); navigate('/'); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"><LogOut className="h-4 w-4" />Sign out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/auth" state={{ returnTo: location.pathname }} className="rounded-lg bg-stone-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2">Sign in</Link>
            )}

            <button type="button" onClick={() => setMenuOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-stone-950/55 px-4 pt-24 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="search-title" onMouseDown={(event) => { if (event.currentTarget === event.target) setSearchOpen(false); }}>
          <div className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between"><h2 id="search-title" className="font-serif text-xl font-semibold text-stone-950">Search marketplace</h2><button type="button" onClick={() => setSearchOpen(false)} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100" aria-label="Close search"><X className="h-5 w-5" /></button></div>
            <form onSubmit={submitSearch} className="mt-4 flex gap-2">
              <label htmlFor="global-search" className="sr-only">Search by title, machine or category</label>
              <input id="global-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, machine or category" className="min-w-0 flex-1 rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20" />
              <button type="submit" className="rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-900">Search</button>
            </form>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button type="button" className="absolute inset-0 bg-stone-950/55" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4"><p className="font-serif text-xl font-semibold">Menu</p><button type="button" onClick={() => setMenuOpen(false)} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100" aria-label="Close menu"><X className="h-5 w-5" /></button></div>
            <nav className="mt-6 flex flex-col gap-1 text-base">
              <Link to="/explore" className="rounded-lg px-3 py-3 hover:bg-stone-50">Explore designs</Link>
              <Link to="/collections" className="rounded-lg px-3 py-3 hover:bg-stone-50">Design folders</Link>
              {user.isLoggedIn && <Link to="/account" className="rounded-lg px-3 py-3 hover:bg-stone-50">My account</Link>}
              {user.isLoggedIn && <Link to="/account/purchases" className="rounded-lg px-3 py-3 hover:bg-stone-50">Purchases</Link>}
              {user.isLoggedIn && user.role === 'seller' && <Link to="/studio" className="rounded-lg px-3 py-3 font-semibold text-amber-900 hover:bg-amber-50">My studio</Link>}
              {!user.isLoggedIn && <Link to="/auth" className="mt-3 rounded-lg bg-stone-950 px-4 py-3 text-center font-semibold text-white">Sign in</Link>}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

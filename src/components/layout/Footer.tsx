import React from 'react';
import { Link } from 'react-router-dom';

const linkClass = 'text-sm text-stone-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300';

export const Footer: React.FC = () => (
  <footer className="border-t border-stone-800 bg-stone-950 pb-20 text-stone-300 lg:pb-0">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
      <div>
        <Link to="/" className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-300 font-serif text-lg font-bold text-stone-950">T</span>
          <span className="font-serif text-xl font-semibold text-white">Textile Design Hub</span>
        </Link>
        <p className="mt-4 max-w-sm text-sm leading-6 text-stone-400">
          A digital marketplace for discovering, sharing and purchasing textile design files.
        </p>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Marketplace</h2>
        <nav className="mt-4 flex flex-col gap-3"><Link className={linkClass} to="/explore">Explore designs</Link><Link className={linkClass} to="/collections">Design folders</Link><Link className={linkClass} to="/catalogs">Catalogs</Link></nav>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Account</h2>
        <nav className="mt-4 flex flex-col gap-3"><Link className={linkClass} to="/account">My account</Link><Link className={linkClass} to="/account/purchases">Purchases</Link><Link className={linkClass} to="/studio">Creator studio</Link></nav>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Support</h2>
        <nav className="mt-4 flex flex-col gap-3"><Link className={linkClass} to="/help">Help centre</Link><Link className={linkClass} to="/contact">Contact</Link><Link className={linkClass} to="/terms">Terms</Link><Link className={linkClass} to="/privacy">Privacy</Link></nav>
      </div>
    </div>

    <div className="border-t border-stone-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Textile Design Hub.</p>
        <p>Product availability and file details are shown on each listing.</p>
      </div>
    </div>
  </footer>
);

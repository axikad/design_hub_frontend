import React, { useMemo, useState } from 'react';
import { ArrowRight, Compass, FolderOpen, Search, ShieldCheck, Store, UploadCloud } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CollectionCard } from '../components/common/CollectionCard';
import { DesignCard } from '../components/common/DesignCard';
import { useApp } from '../context/AppContext';
import { ASSET_IMAGES } from '../data/mockData';

export const HomePage: React.FC = () => {
  const { designs, collections, user, setSearchQuery } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const activeDesigns = useMemo(() => designs.filter((design) => design.status === 'active'), [designs]);
  const latestDesigns = activeDesigns.slice(0, 8);
  const visibleCollections = collections.slice(0, 3);
  const machines = useMemo(() => Array.from(new Set(activeDesigns.map((design) => design.machine))).slice(0, 6), [activeDesigns]);
  const categories = useMemo(() => Array.from(new Set(activeDesigns.map((design) => design.category))).slice(0, 8), [activeDesigns]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    setSearchQuery(value);
    navigate(value ? `/explore?q=${encodeURIComponent(value)}` : '/explore');
  };

  return (
    <main>
      <section className="border-b border-stone-200 bg-[radial-gradient(circle_at_top_right,_rgba(217,119,6,0.08),_transparent_34%)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800">Digital textile design marketplace</p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl font-bold leading-[1.08] text-stone-950 sm:text-5xl lg:text-6xl">
              Find textile designs for your machine and production needs.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
              Browse embroidery and textile design files by machine, category, design type and practical production specifications.
            </p>

            <form onSubmit={submitSearch} className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-2 shadow-lg shadow-stone-900/5 sm:flex-row">
              <label htmlFor="home-search" className="sr-only">Search designs</label>
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                <input id="home-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, machine or category" className="h-12 w-full rounded-xl border-0 bg-transparent pl-12 pr-4 text-sm text-stone-950 outline-none placeholder:text-stone-400 focus:ring-2 focus:ring-amber-700/25" />
              </div>
              <button type="submit" className="h-12 rounded-xl bg-stone-950 px-6 text-sm font-semibold text-white transition hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2">Browse designs</button>
            </form>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-500">
              <span className="inline-flex items-center gap-1.5"><Compass className="h-4 w-4 text-amber-700" />Filter by production specifications</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-amber-700" />Secure purchase and protected downloads</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-100 shadow-2xl shadow-stone-900/10">
              <img src={ASSET_IMAGES.hero} alt="Detailed textile embroidery design" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-stone-700 bg-stone-950 p-4 text-white shadow-xl sm:left-8 sm:right-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Browse with confidence</p>
              <p className="mt-1 text-sm text-stone-200">Review machine, dimensions and design-type details before purchase.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Machine catalog</p><h2 className="mt-2 font-serif text-3xl font-semibold text-stone-950">Browse by machine</h2></div>
            <Link to="/explore" className="hidden items-center gap-1 text-sm font-semibold text-stone-700 hover:text-amber-900 sm:flex">View all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {machines.map((machine) => (
              <Link key={machine} to={`/explore?machine=${encodeURIComponent(machine)}`} className="group flex items-center justify-between rounded-xl border border-stone-200 bg-[#FAF8F5] p-4 transition hover:border-amber-300 hover:bg-amber-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700">
                <span className="font-semibold text-stone-800 group-hover:text-amber-950">{machine}</span><ArrowRight className="h-4 w-4 text-stone-400 group-hover:translate-x-0.5 group-hover:text-amber-800" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Marketplace</p><h2 className="mt-2 font-serif text-3xl font-semibold text-stone-950">Latest designs</h2><p className="mt-2 text-sm text-stone-500">Recently added designs from the current marketplace catalog.</p></div>
            <Link to="/explore" className="hidden items-center gap-1 text-sm font-semibold text-stone-700 hover:text-amber-900 sm:flex">Explore all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {latestDesigns.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{latestDesigns.map((design) => <DesignCard key={design.id} design={design} />)}</div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center text-sm text-stone-500">No published designs are available yet.</div>
          )}
          <Link to="/explore" className="mt-7 inline-flex items-center gap-1 text-sm font-semibold text-stone-800 hover:text-amber-900 sm:hidden">Explore all designs <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Textile categories</p><h2 className="mt-2 font-serif text-3xl font-semibold text-stone-950">Browse by category</h2></div>
          <div className="mt-7 flex flex-wrap gap-3">
            {categories.map((category) => <Link key={category} to={`/explore?category=${encodeURIComponent(category)}`} className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700">{category}</Link>)}
          </div>
        </div>
      </section>

      {visibleCollections.length > 0 && (
        <section className="py-14 sm:py-18">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Design folders</p><h2 className="mt-2 font-serif text-3xl font-semibold text-stone-950">Browse grouped design files</h2></div><Link to="/collections" className="hidden items-center gap-1 text-sm font-semibold text-stone-700 hover:text-amber-900 sm:flex">View folders <ArrowRight className="h-4 w-4" /></Link></div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">{visibleCollections.map((collection) => <CollectionCard key={collection.id} collection={collection} />)}</div>
          </div>
        </section>
      )}

      <section className="bg-stone-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">How it works</p><h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">A clear path from discovery to download.</h2></div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[['01', 'Find', 'Search and filter the catalog for a suitable design.'], ['02', 'Review', 'Check machine, design type and specification details.'], ['03', 'Purchase', 'Complete checkout and access eligible downloads.']].map(([step, title, copy]) => <div key={step} className="rounded-2xl border border-stone-700 bg-stone-900 p-5"><span className="font-mono text-xs text-amber-300">{step}</span><h3 className="mt-3 font-serif text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-400">{copy}</p></div>)}
            </div>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-5 rounded-2xl border border-stone-700 bg-stone-900 p-6 sm:flex-row sm:items-center">
            <div><h3 className="font-serif text-2xl font-semibold">Share your textile designs</h3><p className="mt-2 max-w-2xl text-sm text-stone-400">Creators can manage designs, folders and wallet activity from the studio workspace.</p></div>
            <Link to={user.isLoggedIn && user.role === 'seller' ? '/studio' : '/auth'} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-stone-950 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950">{user.isLoggedIn && user.role === 'seller' ? <Store className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}{user.isLoggedIn && user.role === 'seller' ? 'Open my studio' : 'Sign in to continue'}</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

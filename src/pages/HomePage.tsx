import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, Compass, Search, Store, UploadCloud } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CollectionCard } from '../components/common/CollectionCard';
import { DesignCard } from '../components/common/DesignCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useApp } from '../context/AppContext';
import { ASSET_IMAGES } from '../data/mockData';
import { getErrorMessage, marketplaceApi } from '../lib/api-client';
import { toDesignCard, toFolderCard } from '../lib/marketplace-mappers';
import type { ApiFolder, ApiHomeData, BrowseFilters } from '../types/marketplace';

export const HomePage: React.FC = () => {
  const { user, setSearchQuery } = useApp();
  const [query, setQuery] = useState('');
  const [home, setHome] = useState<ApiHomeData | null>(null);
  const [filters, setFilters] = useState<BrowseFilters | null>(null);
  const [folders, setFolders] = useState<ApiFolder[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    Promise.all([
      marketplaceApi.home(controller.signal),
      marketplaceApi.browseFilters(controller.signal),
      marketplaceApi.folders({ page: 1, per_page: 3 }, controller.signal),
    ])
      .then(([homeResponse, filterResponse, folderResponse]) => {
        setHome(homeResponse.data);
        setFilters(filterResponse.data);
        setFolders(folderResponse.data);
      })
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  const latestDesigns = useMemo(
    () => (home?.latest.items ?? []).map((design) => toDesignCard(design, filters)),
    [home, filters],
  );
  const folderCards = useMemo(() => folders.map(toFolderCard), [folders]);

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
            <h1 className="mt-4 max-w-3xl font-serif text-4xl font-bold leading-[1.08] text-stone-950 sm:text-5xl lg:text-6xl">Find textile designs for your machine and production needs.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">Browse the live catalog by machine type, category, design type and production specifications.</p>
            <form onSubmit={submitSearch} className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-2 shadow-lg shadow-stone-900/5 sm:flex-row">
              <label htmlFor="home-search" className="sr-only">Search designs</label>
              <div className="relative min-w-0 flex-1"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" /><input id="home-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search designs by title" className="h-12 w-full rounded-xl border-0 bg-transparent pl-12 pr-4 text-sm text-stone-950 outline-none placeholder:text-stone-400 focus:ring-2 focus:ring-amber-700/25" /></div>
              <button type="submit" className="h-12 rounded-xl bg-stone-950 px-6 text-sm font-semibold text-white transition hover:bg-amber-900 focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2">Browse designs</button>
            </form>
            <p className="mt-6 inline-flex items-center gap-2 text-xs text-stone-500"><Compass className="h-4 w-4 text-amber-700" />Catalog data is loaded from the live marketplace service.</p>
          </div>
          <div className="relative mx-auto w-full max-w-xl"><div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-100 shadow-2xl shadow-stone-900/10"><img src={ASSET_IMAGES.hero} alt="Detailed textile embroidery design" className="aspect-[4/3] w-full object-cover" /></div><div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-stone-700 bg-stone-950 p-4 text-white shadow-xl sm:left-8 sm:right-8"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Review before purchase</p><p className="mt-1 text-sm text-stone-200">Compare machine, dimensions and design-type specifications.</p></div></div>
        </div>
      </section>

      {error && <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between"><span className="inline-flex items-center gap-2"><AlertCircle className="h-5 w-5" />{error}</span><button type="button" onClick={() => setReloadKey((value) => value + 1)} className="rounded-lg bg-red-900 px-4 py-2 text-xs font-semibold text-white">Try again</button></div></section>}

      <section className="border-b border-stone-200 bg-white py-14"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Machine catalog</p><h2 className="mt-2 font-serif text-3xl font-semibold text-stone-950">Browse by machine type</h2></div><Link to="/explore" className="hidden items-center gap-1 text-sm font-semibold text-stone-700 hover:text-amber-900 sm:flex">View all <ArrowRight className="h-4 w-4" /></Link></div>{loading ? <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-stone-100" />)}</div> : <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(filters?.machineTypes ?? []).slice(0, 6).map((machine) => <Link key={machine.id} to={`/explore?machineType=${encodeURIComponent(machine.id)}`} className="group flex items-center justify-between rounded-xl border border-stone-200 bg-[#FAF8F5] p-4 transition hover:border-amber-300 hover:bg-amber-50/50"><span className="font-semibold text-stone-800 group-hover:text-amber-950">{machine.name}</span><ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-amber-800" /></Link>)}</div>}</div></section>

      <section className="py-14 sm:py-18"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Marketplace</p><h2 className="mt-2 font-serif text-3xl font-semibold text-stone-950">Latest designs</h2><p className="mt-2 text-sm text-stone-500">Recently published designs from the live catalog.</p></div><Link to="/explore" className="hidden items-center gap-1 text-sm font-semibold text-stone-700 hover:text-amber-900 sm:flex">Explore all <ArrowRight className="h-4 w-4" /></Link></div>{loading ? <div className="mt-8"><LoadingSkeleton count={8} /></div> : latestDesigns.length > 0 ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{latestDesigns.map((design) => <DesignCard key={design.id} design={design} />)}</div> : <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center text-sm text-stone-500">No published designs are available yet.</div>}</div></section>

      <section className="border-y border-stone-200 bg-white py-14"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Textile categories</p><h2 className="mt-2 font-serif text-3xl font-semibold text-stone-950">Browse by category</h2></div><div className="mt-7 flex flex-wrap gap-3">{(filters?.categories ?? []).slice(0, 12).map((category) => <Link key={category.id} to={`/explore?category=${encodeURIComponent(category.id)}`} className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-950">{category.name}</Link>)}</div></div></section>

      {(loading || folderCards.length > 0) && <section className="py-14 sm:py-18"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Design folders</p><h2 className="mt-2 font-serif text-3xl font-semibold text-stone-950">Browse grouped design files</h2></div><Link to="/collections" className="hidden items-center gap-1 text-sm font-semibold text-stone-700 hover:text-amber-900 sm:flex">View folders <ArrowRight className="h-4 w-4" /></Link></div>{loading ? <div className="mt-8"><LoadingSkeleton count={3} /></div> : <div className="mt-8 grid gap-5 md:grid-cols-3">{folderCards.map((folder) => <CollectionCard key={folder.id} collection={folder} />)}</div>}</div></section>}

      <section className="bg-stone-950 py-16 text-white"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">How it works</p><h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">A clear path from discovery to download.</h2></div><div className="grid gap-4 sm:grid-cols-3">{[['01', 'Find', 'Search and filter the live catalog.'], ['02', 'Review', 'Check machine and specification details.'], ['03', 'Purchase', 'Checkout integration follows in a later phase.']].map(([step, title, copy]) => <div key={step} className="rounded-2xl border border-stone-700 bg-stone-900 p-5"><span className="font-mono text-xs text-amber-300">{step}</span><h3 className="mt-3 font-serif text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-400">{copy}</p></div>)}</div></div><div className="mt-12 flex flex-col justify-between gap-5 rounded-2xl border border-stone-700 bg-stone-900 p-6 sm:flex-row sm:items-center"><div><h3 className="font-serif text-2xl font-semibold">Share your textile designs</h3><p className="mt-2 max-w-2xl text-sm text-stone-400">Creator authentication and studio API integration are planned after public marketplace integration.</p></div><Link to={user.isLoggedIn && user.role === 'seller' ? '/studio' : '/auth'} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-stone-950 hover:bg-amber-200">{user.isLoggedIn && user.role === 'seller' ? <Store className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}{user.isLoggedIn && user.role === 'seller' ? 'Open preview studio' : 'Preview sign in'}</Link></div></div></section>
    </main>
  );
};

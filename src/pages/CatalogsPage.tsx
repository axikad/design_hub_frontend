import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Archive, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { CollectionCard } from '../components/common/CollectionCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { getErrorMessage, marketplaceApi } from '../lib/api-client';
import { toFolderCard } from '../lib/marketplace-mappers';
import type { ApiCatalog, PaginationMeta } from '../types/marketplace';

export const CatalogsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [catalogs, setCatalogs] = useState<ApiCatalog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [reloadKey, setReloadKey] = useState(0);
  const queryKey = searchParams.toString();
  const page = Math.max(1, Number(searchParams.get('page') || 1));

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    marketplaceApi.catalogs({ page, per_page: 12, search: searchParams.get('q') || undefined }, controller.signal)
      .then((response) => {
        setCatalogs(response.data);
        setMeta(response.meta);
      })
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(getErrorMessage(requestError));
        setCatalogs([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, queryKey, reloadKey]);

  const cards = useMemo(() => catalogs.map(toFolderCard), [catalogs]);
  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams();
    if (search.trim()) next.set('q', search.trim());
    setSearchParams(next);
  };

  const changePage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-24">
      <section className="border-b border-stone-200 bg-white py-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-end lg:px-8"><div className="max-w-2xl"><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-800"><Archive className="h-4 w-4" />Archive catalogs</p><h1 className="mt-2 font-serif text-3xl font-bold text-stone-950 sm:text-4xl">Browse grouped design files</h1><p className="mt-2 text-sm leading-6 text-stone-600">Catalogs are ZIP or RAR archives extracted by the marketplace and listed with their real file count and price.</p></div><form onSubmit={submitSearch} className="flex w-full max-w-md gap-2"><label htmlFor="catalog-search" className="sr-only">Search catalogs</label><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input id="catalog-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search catalog name" className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-3 text-sm" /></div><button className="rounded-xl bg-stone-950 px-5 text-sm font-semibold text-white">Search</button></form></div></section>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {error && <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 sm:flex-row sm:items-center"><span className="inline-flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span><button type="button" onClick={() => setReloadKey((value) => value + 1)} className="rounded-lg bg-red-900 px-4 py-2 text-xs font-semibold text-white">Try again</button></div>}
        {!loading && meta && <p className="mb-5 text-sm text-stone-500">{meta.total.toLocaleString('en-IN')} catalog{meta.total === 1 ? '' : 's'}</p>}
        {loading ? <LoadingSkeleton count={6} /> : cards.length > 0 ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{cards.map((catalog) => <CollectionCard key={catalog.id} collection={catalog} basePath="/catalogs" itemLabel="catalog" />)}</div> : <EmptyState icon={Archive} title="No catalogs found" description="Try another search term or return later when new archives are published." actionLabel={searchParams.has('q') ? 'Clear search' : undefined} onAction={searchParams.has('q') ? () => { setSearch(''); setSearchParams(new URLSearchParams()); } : undefined} />}
        {meta && meta.last_page > 1 && <nav aria-label="Catalog result pages" className="mt-8 flex items-center justify-center gap-3"><button type="button" disabled={meta.current_page <= 1} onClick={() => changePage(meta.current_page - 1)} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button><span className="text-sm text-stone-500">Page {meta.current_page} of {meta.last_page}</span><button type="button" disabled={meta.current_page >= meta.last_page} onClick={() => changePage(meta.current_page + 1)} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button></nav>}
      </div>
    </main>
  );
};

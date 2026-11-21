import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Filter, Grid, List, RotateCcw, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DesignCard } from '../components/common/DesignCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { getErrorMessage, marketplaceApi } from '../lib/api-client';
import { toDesignCard } from '../lib/marketplace-mappers';
import type { ApiDesign, BrowseFilters, PaginationMeta } from '../types/marketplace';

const stitchOptions = Array.from({ length: 10 }, (_, index) => {
  const minimum = index * 25000;
  const maximum = minimum + 25000;
  return { value: `${minimum}:${maximum}`, label: `${minimum.toLocaleString('en-IN')}–${maximum.toLocaleString('en-IN')}` };
});

const areaOptions = [
  ['0:100', '0–100'],
  ['100:200', '100–200'],
  ['200:300', '200–300'],
  ['300:400', '300–400'],
  ['400:500', '400–500'],
  ['500:*', '500 and above'],
] as const;

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<BrowseFilters | null>(null);
  const [designs, setDesigns] = useState<ApiDesign[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(true);
  const [error, setError] = useState('');
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const queryKey = searchParams.toString();
  const selectedSection = searchParams.get('section') || '';
  const selectedMachine = searchParams.get('machine') || '';
  const selectedMachineType = searchParams.get('machineType') || '';
  const selectedCategories = searchParams.getAll('category');
  const selectedDesignTypes = searchParams.getAll('designType');
  const selectedStitches = searchParams.getAll('stitch');
  const selectedNeedles = searchParams.getAll('needle');
  const selectedAreas = searchParams.getAll('area');
  const currentPage = Math.max(1, Number(searchParams.get('page') || 1));

  useEffect(() => {
    const controller = new AbortController();
    setFilterLoading(true);
    marketplaceApi.browseFilters(controller.signal)
      .then((response) => setFilters(response.data))
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setFilterLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    marketplaceApi.designs({
      page: currentPage,
      per_page: 12,
      section: selectedSection || undefined,
      search: searchParams.get('q') || undefined,
      machine_id: selectedMachine || undefined,
      machine_type_id: selectedMachineType || undefined,
      category_ids: selectedCategories,
      design_type_ids: selectedDesignTypes,
      stitch_ranges: selectedStitches,
      needle_values: selectedNeedles.map(Number),
      area_ranges: selectedAreas,
    }, controller.signal)
      .then((response) => {
        setDesigns(response.data);
        setMeta(response.meta);
      })
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(getErrorMessage(requestError));
        setDesigns([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [queryKey, reloadKey]);

  const cardDesigns = useMemo(() => designs.map((design) => toDesignCard(design, filters)), [designs, filters]);
  const visibleMachineTypes = useMemo(() => {
    if (!filters) return [];
    return selectedMachine
      ? filters.machineTypes.filter((machineType) => machineType.machineId === selectedMachine)
      : filters.machineTypes;
  }, [filters, selectedMachine]);
  const visibleCategories = useMemo(() => {
    if (!filters) return [];
    if (selectedMachineType) return filters.categories.filter((category) => category.machineTypeIds.includes(selectedMachineType));
    if (!selectedMachine) return filters.categories;
    const machineTypeIds = new Set(visibleMachineTypes.map((machineType) => machineType.id));
    return filters.categories.filter((category) => category.machineTypeIds.some((id) => machineTypeIds.has(id)));
  }, [filters, selectedMachine, selectedMachineType, visibleMachineTypes]);
  const visibleDesignTypes = useMemo(() => {
    if (!filters) return [];
    if (selectedCategories.length === 0) return filters.designTypes;
    return filters.designTypes.filter((type) => type.categoryIds.some((id) => selectedCategories.includes(id)));
  }, [filters, selectedCategories]);

  const updateParams = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    mutate(next);
    next.delete('page');
    setSearchParams(next);
  };

  const setSingle = (key: string, value: string) => updateParams((next) => {
    if (value) next.set(key, value); else next.delete(key);
    if (key === 'machine') {
      next.delete('machineType');
      next.delete('category');
      next.delete('designType');
    }
    if (key === 'machineType') {
      next.delete('category');
      next.delete('designType');
    }
  });

  const toggleMultiple = (key: string, value: string) => updateParams((next) => {
    const values = next.getAll(key);
    next.delete(key);
    const updated = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
    updated.forEach((item) => next.append(key, item));
    if (key === 'category') next.delete('designType');
  });

  const resetFilters = () => {
    setLocalSearch('');
    setSearchParams(new URLSearchParams());
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSingle('q', localSearch.trim());
  };

  const activeCount = [selectedSection, selectedMachine, selectedMachineType, ...selectedCategories, ...selectedDesignTypes, ...selectedStitches, ...selectedNeedles, ...selectedAreas, searchParams.get('q') || ''].filter(Boolean).length;

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="font-serif text-lg font-semibold text-stone-950">Filter designs</h2>{activeCount > 0 && <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900"><RotateCcw className="h-3.5 w-3.5" />Reset</button>}</div>
      <label className="block text-xs font-semibold text-stone-700">Machine<select value={selectedMachine} onChange={(event) => setSingle('machine', event.target.value)} className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm"><option value="">All machines</option>{(filters?.machines ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="block text-xs font-semibold text-stone-700">Machine type<select value={selectedMachineType} onChange={(event) => setSingle('machineType', event.target.value)} className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm"><option value="">All machine types</option>{visibleMachineTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <FilterGroup title="Categories" loading={filterLoading} items={visibleCategories.map((item) => ({ id: item.id, name: item.name }))} selected={selectedCategories} onToggle={(value) => toggleMultiple('category', value)} />
      <FilterGroup title="Design types" loading={filterLoading} items={visibleDesignTypes.map((item) => ({ id: item.id, name: item.name }))} selected={selectedDesignTypes} onToggle={(value) => toggleMultiple('designType', value)} limit={18} />
      <FilterGroup title="Stitch count" items={stitchOptions.map((item) => ({ id: item.value, name: item.label }))} selected={selectedStitches} onToggle={(value) => toggleMultiple('stitch', value)} />
      <FilterGroup title="Needles" items={Array.from({ length: 13 }, (_, value) => ({ id: String(value), name: String(value) }))} selected={selectedNeedles} onToggle={(value) => toggleMultiple('needle', value)} compact />
      <FilterGroup title="Area" items={areaOptions.map(([id, name]) => ({ id, name }))} selected={selectedAreas} onToggle={(value) => toggleMultiple('area', value)} />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-24">
      <section className="border-b border-stone-200 bg-white py-8"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Live marketplace catalog</p><div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><h1 className="font-serif text-3xl font-bold text-stone-950">Explore textile designs</h1><p className="mt-2 text-sm text-stone-500">{meta ? `${meta.total.toLocaleString('en-IN')} matching designs` : 'Filter by catalog and production specifications.'}</p></div><form onSubmit={submitSearch} className="flex w-full max-w-xl gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder="Search design title" className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-3 text-sm" /></div><button className="rounded-xl bg-stone-950 px-5 text-sm font-semibold text-white">Search</button></form></div></div></section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 sm:flex-row sm:items-center"><span className="inline-flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span><button type="button" onClick={() => setReloadKey((value) => value + 1)} className="rounded-lg bg-red-900 px-4 py-2 text-xs font-semibold text-white">Try again</button></div>}
        <div className="mb-5 flex items-center justify-between gap-3 lg:justify-end"><button type="button" onClick={() => setMobileFiltersOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold lg:hidden"><Filter className="h-4 w-4" />Filters{activeCount > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">{activeCount}</span>}</button><div className="flex rounded-lg border border-stone-300 bg-white p-1"><button type="button" onClick={() => setViewMode('grid')} aria-label="Grid view" className={`rounded-md p-2 ${viewMode === 'grid' ? 'bg-stone-900 text-white' : 'text-stone-500'}`}><Grid className="h-4 w-4" /></button><button type="button" onClick={() => setViewMode('list')} aria-label="List view" className={`rounded-md p-2 ${viewMode === 'list' ? 'bg-stone-900 text-white' : 'text-stone-500'}`}><List className="h-4 w-4" /></button></div></div>
        <div className="grid gap-8 lg:grid-cols-[17rem_1fr]"><aside className="hidden rounded-2xl border border-stone-200 bg-white p-5 lg:block">{filterPanel}</aside><section>{loading ? <LoadingSkeleton count={8} viewMode={viewMode} /> : cardDesigns.length > 0 ? <div className={viewMode === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}>{cardDesigns.map((design) => <DesignCard key={design.id} design={design} viewMode={viewMode} />)}</div> : <EmptyState icon={Search} title="No matching designs" description="Try removing one or more filters or use a different search term." actionLabel="Clear filters" onAction={resetFilters} />}
          {meta && meta.last_page > 1 && <nav aria-label="Design result pages" className="mt-8 flex items-center justify-center gap-3"><button type="button" disabled={meta.current_page <= 1} onClick={() => { const next = new URLSearchParams(searchParams); next.set('page', String(meta.current_page - 1)); setSearchParams(next); }} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button><span className="text-sm text-stone-500">Page {meta.current_page} of {meta.last_page}</span><button type="button" disabled={meta.current_page >= meta.last_page} onClick={() => { const next = new URLSearchParams(searchParams); next.set('page', String(meta.current_page + 1)); setSearchParams(next); }} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button></nav>}
        </section></div>
      </div>

      {mobileFiltersOpen && <div className="fixed inset-0 z-50 bg-stone-950/50 lg:hidden" role="dialog" aria-modal="true" aria-label="Design filters"><div className="ml-auto h-full w-[min(92vw,24rem)] overflow-y-auto bg-[#FAF8F5] p-5"><div className="mb-5 flex items-center justify-between"><h2 className="font-serif text-xl font-semibold">Filters</h2><button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="rounded-lg border border-stone-300 bg-white p-2"><X className="h-4 w-4" /></button></div>{filterPanel}<button type="button" onClick={() => setMobileFiltersOpen(false)} className="mt-8 w-full rounded-xl bg-stone-950 py-3 text-sm font-semibold text-white">Show {meta?.total ?? 0} results</button></div></div>}
    </main>
  );
};

const FilterGroup: React.FC<{
  title: string;
  items: Array<{ id: string; name: string }>;
  selected: string[];
  onToggle: (value: string) => void;
  loading?: boolean;
  compact?: boolean;
  limit?: number;
}> = ({ title, items, selected, onToggle, loading = false, compact = false, limit }) => (
  <fieldset><legend className="mb-2 text-xs font-semibold text-stone-700">{title}</legend>{loading ? <div className="h-20 animate-pulse rounded-xl bg-stone-100" /> : <div className={compact ? 'flex flex-wrap gap-2' : 'max-h-52 space-y-1 overflow-y-auto pr-1'}>{items.slice(0, limit).map((item) => <label key={item.id} className={compact ? `flex cursor-pointer items-center justify-center rounded-lg border px-3 py-1.5 text-xs ${selected.includes(item.id) ? 'border-amber-700 bg-amber-50 text-amber-950' : 'border-stone-200 bg-white text-stone-600'}` : 'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-stone-600 hover:bg-stone-50'}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} className={compact ? 'sr-only' : 'rounded border-stone-300 text-amber-800'} />{item.name}</label>)}</div>}</fieldset>
);

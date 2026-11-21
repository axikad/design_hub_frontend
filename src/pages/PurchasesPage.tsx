import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { ProtectedDownloadButton } from '../components/common/ProtectedDownloadButton';
import { accountApi } from '../lib/api-client';
import { normalizeAssetUrl } from '../lib/marketplace-mappers';
import type { ApiPurchase } from '../types/account';
import type { PaginationMeta } from '../types/marketplace';

const money = (paise: number, currency: string) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR' }).format(paise / 100);
const date = (raw: string | null) => raw ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(raw)) : 'Date unavailable';

export const PurchasesPage: React.FC = () => {
  const [items, setItems] = useState<ApiPurchase[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    accountApi.purchases({ page, per_page: 12 }, controller.signal)
      .then((response) => { setItems(response.data); setMeta(response.meta); })
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(requestError instanceof Error ? requestError.message : 'Could not load purchases.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, reloadKey]);

  return <main className="min-h-screen bg-[#FAF8F5] pb-24">
    <header className="border-b border-stone-200 bg-white py-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 sm:flex-row sm:items-end sm:px-6 lg:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Buyer library</p><h1 className="mt-2 font-serif text-3xl font-bold text-stone-950">Your purchases</h1><p className="mt-1 text-sm text-stone-500">Paid design entitlements synchronized from your server account.</p></div><Link to="/explore" className="self-start rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white">Browse designs</Link></div></header>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {loading ? <div className="space-y-4 animate-pulse">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 rounded-2xl border border-stone-200 bg-white" />)}</div>
        : error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-900"><AlertCircle className="mx-auto h-8 w-8" /><h2 className="mt-3 font-serif text-xl font-semibold">Purchases unavailable</h2><p className="mt-2 text-sm">{error}</p><button type="button" onClick={() => setReloadKey((current) => current + 1)} className="mt-5 rounded-lg bg-rose-900 px-4 py-2 text-sm font-semibold text-white">Try again</button></div>
        : items.length === 0 ? <EmptyState icon={PackageOpen} title="No paid purchases yet" description="Designs successfully paid for with this account will appear here." actionLabel="Explore designs" onAction={() => window.location.assign('/explore')} />
        : <div className="space-y-4">{items.map((purchase) => {
          const design = purchase.design;
          const image = normalizeAssetUrl(design.images[0]?.thumbnailUri || design.images[0]?.uri || design.imageUri);
          return <article key={purchase.id} className="grid gap-5 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-[7rem_1fr_auto] sm:items-center"><div className="aspect-square overflow-hidden rounded-xl bg-stone-100">{image ? <img src={image} alt={design.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-stone-400">No preview</div>}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2 text-xs"><span className="inline-flex items-center gap-1 font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Paid</span><span className="text-stone-300">·</span><span className="font-mono text-stone-500">{purchase.id}</span></div><h2 className="mt-2 truncate font-serif text-xl font-semibold text-stone-950">{design.title}</h2><p className="mt-1 text-xs text-stone-500">{design.categoryName || 'Uncategorized'} · {date(purchase.purchasedAt)}</p><p className="mt-3 text-xs text-stone-500">Protected links are created on demand and expire automatically.</p></div><div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0"><p className="font-mono text-lg font-bold text-stone-950">{money(purchase.amountPaise, purchase.currency)}</p><ProtectedDownloadButton type="design" id={design.id} label="Download files" /><Link to={`/design/${design.id}`} className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-800">View design</Link></div></article>;
        })}</div>}
      {meta && meta.last_page > 1 && <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Purchase pages"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button><span className="text-sm text-stone-500">Page {meta.current_page} of {meta.last_page}</span><button type="button" disabled={page >= meta.last_page || loading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button></nav>}
    </div>
  </main>;
};

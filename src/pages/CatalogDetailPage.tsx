import React, { useEffect, useState } from 'react';
import { AlertCircle, Archive, CheckCircle2, File, FileImage, LockKeyhole, Maximize2, ShoppingBag, X } from 'lucide-react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ProtectedDownloadButton } from '../components/common/ProtectedDownloadButton';
import { EmptyState } from '../components/common/EmptyState';
import { useApp } from '../context/AppContext';
import { commerceApi, getErrorMessage, marketplaceApi } from '../lib/api-client';
import { formatBytes, normalizeAssetUrl } from '../lib/marketplace-mappers';
import type { PurchaseStatus } from '../types/commerce';
import type { ApiCatalog, ApiCatalogFile, PaginationMeta } from '../types/marketplace';

const inr = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(paise / 100);

export const CatalogDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [catalog, setCatalog] = useState<ApiCatalog | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [purchase, setPurchase] = useState<PurchaseStatus | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<{ src: string; name: string } | null>(null);
  const page = Math.max(1, Number(searchParams.get('page') || 1));

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    marketplaceApi.catalog(id, { page, per_page: 24 }, controller.signal)
      .then((response) => {
        setCatalog(response.data);
        setMeta(response.meta);
      })
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(getErrorMessage(requestError));
        setCatalog(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, page, reloadKey]);

  useEffect(() => {
    if (!user.isLoggedIn) { setPurchase(null); return; }
    const controller = new AbortController();
    commerceApi.purchaseStatus('catalog', id, controller.signal)
      .then((response) => setPurchase(response.data))
      .catch(() => setPurchase(null));
    return () => controller.abort();
  }, [id, user.isLoggedIn]);

  useEffect(() => {
    if (!selectedPreview) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPreview(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedPreview]);

  const changePage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
  };

  if (loading) return <CatalogDetailSkeleton />;
  if (error || !catalog) return <main className="mx-auto min-h-[60vh] max-w-3xl px-4 py-16"><div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-900"><AlertCircle className="mx-auto h-8 w-8" /><h1 className="mt-3 font-serif text-2xl font-semibold">Catalog unavailable</h1><p className="mt-2 text-sm">{error || 'This catalog could not be found.'}</p><div className="mt-5 flex justify-center gap-3"><Link to="/catalogs" className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold">Back to catalogs</Link><button type="button" onClick={() => setReloadKey((value) => value + 1)} className="rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white">Try again</button></div></div></main>;

  const cover = normalizeAssetUrl(catalog.coverImageUri);

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-24">
      {selectedPreview && <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 p-4" role="dialog" aria-modal="true" aria-label={`${selectedPreview.name} preview`} onClick={() => setSelectedPreview(null)}><button type="button" onClick={() => setSelectedPreview(null)} aria-label="Close preview" className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"><X className="h-6 w-6" /></button><div className="flex max-h-[90vh] max-w-[94vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex min-h-0 items-center justify-center bg-stone-100 p-3"><img src={selectedPreview.src} alt={selectedPreview.name} className="max-h-[80vh] max-w-full object-contain" /></div><p className="max-w-[90vw] truncate border-t border-stone-200 px-4 py-3 text-sm font-semibold text-stone-800">{selectedPreview.name}</p></div></div>}
      <div className="border-b border-stone-200 bg-white py-3"><div className="mx-auto flex max-w-7xl items-center gap-2 px-4 text-xs text-stone-500 sm:px-6 lg:px-8"><Link to="/">Home</Link><span>/</span><Link to="/catalogs">Catalogs</Link><span>/</span><span className="truncate font-medium text-stone-900">{catalog.name}</span></div></div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:grid-cols-[22rem_1fr] lg:p-8">
          <div className="aspect-[4/3] overflow-hidden rounded-xl border border-stone-200 bg-stone-100">{cover ? <img src={cover} alt={`${catalog.name} catalog preview`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Archive className="h-12 w-12 text-stone-300" /></div>}</div>
          <div className="flex flex-col justify-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Design archive</p><h1 className="mt-2 font-serif text-3xl font-bold text-stone-950">{catalog.name}</h1><dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3"><div><dt className="text-stone-500">Catalog price</dt><dd className="mt-1 font-mono text-xl font-bold text-stone-950">{inr(catalog.pricePaise)}</dd></div><div><dt className="text-stone-500">Files</dt><dd className="mt-1 font-semibold text-stone-900">{catalog.fileCount.toLocaleString('en-IN')}</dd></div><div><dt className="text-stone-500">Total size</dt><dd className="mt-1 font-semibold text-stone-900">{formatBytes(catalog.totalSize)}</dd></div></dl>
            {purchase?.status === 'paid' ? <div className="mt-7 space-y-3"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950"><p className="inline-flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4" />Purchased and ready</p><p className="mt-1 text-xs text-emerald-800">The server will create a fresh protected archive link.</p></div><ProtectedDownloadButton type="catalog" id={catalog.id} label="Download catalog archive" className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white" /></div> : user.isLoggedIn ? <Link to={`/checkout/catalog/${catalog.id}`} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white"><ShoppingBag className="h-4 w-4" />Buy catalog securely</Link> : <Link to="/auth" state={{ returnTo: `${location.pathname}${location.search}` }} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white"><LockKeyhole className="h-4 w-4" />Sign in to purchase</Link>}
          </div>
        </section>

        <section className="mt-10"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Archive contents</p><h2 className="mt-2 font-serif text-2xl font-semibold text-stone-950">Files in this catalog</h2></div>{meta && <p className="text-sm text-stone-500">{meta.from ?? 0}–{meta.to ?? 0} of {meta.total}</p>}</div>
          {catalog.files && catalog.files.length > 0 ? <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{catalog.files.map((file) => <CatalogFileCard key={file.id} file={file} onPreview={(src) => setSelectedPreview({ src, name: file.name })} />)}</div> : <EmptyState icon={Archive} title="No files on this page" description="This catalog does not currently return any file records for the selected page." />}
          {meta && meta.last_page > 1 && <nav aria-label="Catalog file pages" className="mt-8 flex items-center justify-center gap-3"><button type="button" disabled={meta.current_page <= 1} onClick={() => changePage(meta.current_page - 1)} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button><span className="text-sm text-stone-500">Page {meta.current_page} of {meta.last_page}</span><button type="button" disabled={meta.current_page >= meta.last_page} onClick={() => changePage(meta.current_page + 1)} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button></nav>}
        </section>
      </div>
    </main>
  );
};

const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif', 'svg']);

const CatalogFileCard: React.FC<{ file: ApiCatalogFile; onPreview: (src: string) => void }> = ({ file, onPreview }) => {
  const extension = (file.extension || file.name.split('.').pop() || '').toLowerCase().replace(/^\./, '');
  const isImage = file.mimeType?.toLowerCase().startsWith('image/') || imageExtensions.has(extension);
  const preview = isImage ? normalizeAssetUrl(file.previewUri) : null;
  const label = extension ? extension.toUpperCase() : 'FILE';

  const content = <>
    <div className="relative aspect-square overflow-hidden border-b border-stone-200 bg-stone-100">
      {preview ? <img src={preview} alt="" loading="lazy" className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]" /> : <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${isImage ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-500'}`}>{isImage ? <FileImage className="h-5 w-5" /> : <File className="h-5 w-5" />}</span><span className="text-[10px] font-semibold text-stone-400">{isImage ? 'Preview unavailable' : `${label} file`}</span></div>}
      {preview && <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-stone-950/80 px-2 py-1 text-[9px] font-semibold text-white"><Maximize2 className="h-3 w-3" />Preview</span>}
      <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-1 font-mono text-[9px] font-bold text-stone-700 shadow-sm">{label}</span>
    </div>
    <div className="min-w-0 p-3 text-left">
      <p className="truncate text-xs font-semibold text-stone-900" title={file.name}>{file.name}</p>
      {file.relativePath && file.relativePath !== file.name && <p className="mt-1 truncate text-[10px] text-stone-400" title={file.relativePath}>{file.relativePath}</p>}
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-stone-100 pt-2 text-[10px] text-stone-500"><span>{formatBytes(file.size)}</span><span>{preview ? 'View image' : isImage ? 'Image' : 'No preview'}</span></div>
    </div>
  </>;

  return preview ? <button type="button" onClick={() => onPreview(preview)} className="group min-w-0 overflow-hidden rounded-xl border border-stone-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-600/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2">{content}</button> : <article className="group min-w-0 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">{content}</article>;
};

const CatalogDetailSkeleton = () => <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="grid animate-pulse gap-8 rounded-2xl border border-stone-200 bg-white p-8 lg:grid-cols-[22rem_1fr]"><div className="aspect-[4/3] rounded-xl bg-stone-200" /><div className="space-y-4"><div className="h-4 w-28 rounded bg-stone-200" /><div className="h-10 w-2/3 rounded bg-stone-200" /><div className="h-24 rounded bg-stone-100" /></div></div></main>;

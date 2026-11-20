import React, { useEffect, useState } from 'react';
import { AlertCircle, Archive, ExternalLink, File, LockKeyhole } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { getErrorMessage, marketplaceApi } from '../lib/api-client';
import { formatBytes, normalizeAssetUrl } from '../lib/marketplace-mappers';
import type { ApiFolder, PaginationMeta } from '../types/marketplace';

const inr = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(paise / 100);

export const CollectionDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [folder, setFolder] = useState<ApiFolder | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const page = Math.max(1, Number(searchParams.get('page') || 1));

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    marketplaceApi.folder(id, { page, per_page: 24 }, controller.signal)
      .then((response) => {
        setFolder(response.data);
        setMeta(response.meta);
      })
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(getErrorMessage(requestError));
        setFolder(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, page, reloadKey]);

  const changePage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
  };

  if (loading) return <FolderDetailSkeleton />;
  if (error || !folder) return <main className="mx-auto min-h-[60vh] max-w-3xl px-4 py-16"><div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-900"><AlertCircle className="mx-auto h-8 w-8" /><h1 className="mt-3 font-serif text-2xl font-semibold">Folder unavailable</h1><p className="mt-2 text-sm">{error || 'This folder could not be found.'}</p><div className="mt-5 flex justify-center gap-3"><Link to="/collections" className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold">Back to folders</Link><button type="button" onClick={() => setReloadKey((value) => value + 1)} className="rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white">Try again</button></div></div></main>;

  const cover = normalizeAssetUrl(folder.coverImageUri);

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-24">
      <div className="border-b border-stone-200 bg-white py-3"><div className="mx-auto flex max-w-7xl items-center gap-2 px-4 text-xs text-stone-500 sm:px-6 lg:px-8"><Link to="/">Home</Link><span>/</span><Link to="/collections">Folders</Link><span>/</span><span className="truncate font-medium text-stone-900">{folder.name}</span></div></div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:grid-cols-[22rem_1fr] lg:p-8">
          <div className="aspect-[4/3] overflow-hidden rounded-xl border border-stone-200 bg-stone-100">{cover ? <img src={cover} alt={`${folder.name} folder preview`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Archive className="h-12 w-12 text-stone-300" /></div>}</div>
          <div className="flex flex-col justify-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Design archive</p><h1 className="mt-2 font-serif text-3xl font-bold text-stone-950">{folder.name}</h1><dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3"><div><dt className="text-stone-500">Folder price</dt><dd className="mt-1 font-mono text-xl font-bold text-stone-950">{inr(folder.pricePaise)}</dd></div><div><dt className="text-stone-500">Files</dt><dd className="mt-1 font-semibold text-stone-900">{folder.fileCount.toLocaleString('en-IN')}</dd></div><div><dt className="text-stone-500">Total size</dt><dd className="mt-1 font-semibold text-stone-900">{formatBytes(folder.totalSize)}</dd></div></dl><div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><p className="inline-flex items-center gap-2 font-semibold"><LockKeyhole className="h-4 w-4" />Purchase and download integration follows in the checkout phase.</p><p className="mt-1 text-xs text-amber-800">The folder metadata and previews shown here are live server data.</p></div></div>
        </section>

        <section className="mt-10"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Archive contents</p><h2 className="mt-2 font-serif text-2xl font-semibold text-stone-950">Files in this folder</h2></div>{meta && <p className="text-sm text-stone-500">{meta.from ?? 0}–{meta.to ?? 0} of {meta.total}</p>}</div>
          {folder.files && folder.files.length > 0 ? <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white"><ul className="divide-y divide-stone-100">{folder.files.map((file) => <li key={file.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100"><File className="h-5 w-5 text-stone-500" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-stone-900">{file.name}</p><p className="mt-0.5 text-xs text-stone-500">{file.extension?.toUpperCase() || 'FILE'} · {formatBytes(file.size)}</p></div></div>{file.previewUri ? <a href={normalizeAssetUrl(file.previewUri) || file.previewUri} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:underline">Open preview <ExternalLink className="h-3.5 w-3.5" /></a> : <span className="text-xs text-stone-400">No browser preview</span>}</li>)}</ul></div> : <EmptyState icon={Archive} title="No files on this page" description="This folder does not currently return any file records for the selected page." />}
          {meta && meta.last_page > 1 && <nav aria-label="Folder file pages" className="mt-8 flex items-center justify-center gap-3"><button type="button" disabled={meta.current_page <= 1} onClick={() => changePage(meta.current_page - 1)} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button><span className="text-sm text-stone-500">Page {meta.current_page} of {meta.last_page}</span><button type="button" disabled={meta.current_page >= meta.last_page} onClick={() => changePage(meta.current_page + 1)} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button></nav>}
        </section>
      </div>
    </main>
  );
};

const FolderDetailSkeleton = () => <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="grid animate-pulse gap-8 rounded-2xl border border-stone-200 bg-white p-8 lg:grid-cols-[22rem_1fr]"><div className="aspect-[4/3] rounded-xl bg-stone-200" /><div className="space-y-4"><div className="h-4 w-28 rounded bg-stone-200" /><div className="h-10 w-2/3 rounded bg-stone-200" /><div className="h-24 rounded bg-stone-100" /></div></div></main>;

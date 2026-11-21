import React, { useCallback, useEffect, useState } from 'react';
import { Archive, Eye, LoaderCircle, Search, UploadCloud, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { StudioNavigation } from '../../components/studio/StudioNavigation';
import { useApp } from '../../context/AppContext';
import { ApiError, getErrorMessage, studioApi } from '../../lib/api-client';
import type { ApiFolder, PaginationMeta } from '../../types/marketplace';

const money = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const formatBytes = (bytes: number) => bytes >= 1024 * 1024
  ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
  : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const MyCollectionsPage: React.FC = () => {
  const { showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [folders, setFolders] = useState<ApiFolder[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('399');
  const [archive, setArchive] = useState<File | null>(null);

  const loadFolders = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await studioApi.myFolders({ page, per_page: 12, search: appliedSearch }, signal);
      setFolders(response.data);
      setMeta(response.meta);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      showToast('Could not load folders', getErrorMessage(error), 'error');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [appliedSearch, page, showToast]);

  useEffect(() => {
    const controller = new AbortController();
    void loadFolders(controller.signal);
    return () => controller.abort();
  }, [loadFolders]);

  useEffect(() => {
    if (searchParams.get('create') !== '1') return;
    setDialogOpen(true);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const createFolder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!archive) {
      showToast('Archive required', 'Select one ZIP or RAR archive.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await studioApi.createFolder(name.trim(), Math.round(Number(price) * 100), archive);
      showToast('Folder created', 'The archive was extracted and your marketplace folder is ready.', 'success');
      setDialogOpen(false);
      setName('');
      setPrice('399');
      setArchive(null);
      setPage(1);
      setAppliedSearch('');
      setSearch('');
      await loadFolders();
    } catch (error) {
      const detail = error instanceof ApiError && error.errors
        ? Object.values(error.errors).flat()[0]
        : getErrorMessage(error);
      showToast('Could not create folder', detail || 'Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-24">
      <StudioNavigation />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Creator studio</p><h1 className="mt-2 font-serif text-4xl font-semibold text-stone-950">Design folders</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">Upload one ZIP or RAR archive. The server extracts its files and prepares buyer previews.</p></div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center">
          <form onSubmit={(event) => { event.preventDefault(); setPage(1); setAppliedSearch(search.trim()); }} className="flex w-full max-w-lg gap-2">
            <label className="relative block flex-1"><span className="sr-only">Search folders</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your folders" className="w-full rounded-lg border border-stone-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20" /></label>
            <button className="rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white">Search</button>
          </form>
          <Link to="/studio" className="text-sm font-semibold text-stone-600 hover:text-amber-900">Back to studio</Link>
        </div>

        {loading ? (
          <div className="mt-6 flex min-h-64 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-500"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> Loading your folders…</div>
        ) : folders.length > 0 ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500"><tr><th className="px-5 py-3">Folder</th><th className="px-5 py-3">Files</th><th className="px-5 py-3">Size</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Created</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-stone-100">{folders.map((folder) => <tr key={folder.id} className="hover:bg-stone-50/70"><td className="px-5 py-4"><div className="flex items-center gap-3">{folder.coverImageUri ? <img src={folder.coverImageUri} alt="" className="h-11 w-11 rounded-lg border border-stone-200 object-cover" /> : <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-stone-100 text-amber-800"><Archive className="h-5 w-5" /></span>}<p className="font-semibold text-stone-900">{folder.name}</p></div></td><td className="px-5 py-4 font-mono text-stone-700">{folder.fileCount}</td><td className="px-5 py-4 text-stone-600">{formatBytes(folder.totalSize)}</td><td className="px-5 py-4 font-mono font-bold text-stone-900">{money(folder.pricePaise)}</td><td className="px-5 py-4 text-stone-500">{folder.createdAt ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(folder.createdAt)) : '—'}</td><td className="px-5 py-4 text-right"><Link to={`/collections/${folder.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:underline"><Eye className="h-3.5 w-3.5" />Preview</Link></td></tr>)}</tbody>
              </table>
            </div>
            {meta && meta.last_page > 1 && <div className="flex items-center justify-between border-t border-stone-200 px-5 py-4 text-sm"><span className="text-stone-500">Page {meta.current_page} of {meta.last_page}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-stone-300 px-3 py-2 font-semibold disabled:opacity-40">Previous</button><button disabled={page >= meta.last_page} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-stone-300 px-3 py-2 font-semibold disabled:opacity-40">Next</button></div></div>}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center"><Archive className="mx-auto h-8 w-8 text-stone-300" /><h2 className="mt-4 font-serif text-xl font-semibold text-stone-900">{appliedSearch ? 'No matching folders' : 'No folders yet'}</h2><p className="mt-2 text-sm text-stone-500">{appliedSearch ? 'Try a different folder name.' : 'Create your first purchasable design folder.'}</p></div>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="create-folder-title" onMouseDown={(event) => { if (!submitting && event.currentTarget === event.target) setDialogOpen(false); }}>
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-amber-800">Design folder</p><h2 id="create-folder-title" className="mt-1 font-serif text-2xl font-semibold text-stone-950">Add folder</h2></div><button type="button" disabled={submitting} onClick={() => setDialogOpen(false)} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 disabled:opacity-50" aria-label="Close"><X className="h-5 w-5" /></button></div>
            <form onSubmit={(event) => void createFolder(event)} className="mt-6 space-y-5">
              <label className="block"><span className="text-sm font-semibold text-stone-700">Folder name</span><input value={name} onChange={(event) => setName(event.target.value)} required maxLength={150} className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20" /></label>
              <label className="block"><span className="text-sm font-semibold text-stone-700">Price (INR)</span><input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 font-mono text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20" /></label>
              <label className="block cursor-pointer rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5 text-center hover:border-amber-500"><UploadCloud className="mx-auto h-7 w-7 text-amber-800" /><span className="mt-2 block text-sm font-semibold text-stone-800">Select ZIP or RAR archive</span><span className="mt-1 block text-xs text-stone-500">{archive?.name || 'No archive selected'}</span><input type="file" required accept=".zip,.rar,application/zip,application/vnd.rar" onChange={(event) => setArchive(event.target.files?.[0] || null)} className="sr-only" /></label>
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950">Large archives can take a little time to extract. Keep this window open until the success message appears.</p>
              <div className="flex justify-end gap-3 border-t border-stone-100 pt-5"><button type="button" disabled={submitting} onClick={() => setDialogOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100 disabled:opacity-50">Cancel</button><button type="submit" disabled={submitting} className="inline-flex items-center rounded-lg bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-60">{submitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}{submitting ? 'Processing archive…' : 'Create folder'}</button></div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

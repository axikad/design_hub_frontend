import React, { useEffect, useState } from 'react';
import { ArrowRight, FolderOpen, LoaderCircle, UploadCloud, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StudioNavigation } from '../../components/studio/StudioNavigation';
import { useApp } from '../../context/AppContext';
import { getErrorMessage, studioApi } from '../../lib/api-client';
import type { ApiDesign, ApiFolder } from '../../types/marketplace';

export const StudioDashboardPage: React.FC = () => {
  const { showToast } = useApp();
  const [designs, setDesigns] = useState<ApiDesign[]>([]);
  const [folders, setFolders] = useState<ApiFolder[]>([]);
  const [designTotal, setDesignTotal] = useState(0);
  const [folderTotal, setFolderTotal] = useState(0);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      studioApi.myDesigns({ page: 1, per_page: 5 }, controller.signal),
      studioApi.myFolders({ page: 1, per_page: 5 }, controller.signal),
      studioApi.myCatalogs({ page: 1, per_page: 1 }, controller.signal),
    ]).then(([designResponse, folderResponse, catalogResponse]) => {
      setDesigns(designResponse.data);
      setFolders(folderResponse.data);
      setDesignTotal(designResponse.meta.total);
      setFolderTotal(folderResponse.meta.total);
      setCatalogTotal(catalogResponse.meta.total);
    }).catch((error) => {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        showToast('Could not load studio summary', getErrorMessage(error), 'error');
      }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [showToast]);

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-24">
      <StudioNavigation />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {loading ? <div className="flex min-h-48 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-500"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" />Loading studio…</div> : <>
          <section className="grid gap-4 sm:grid-cols-3">
            <Link to="/studio/designs" className="rounded-2xl border border-stone-200 bg-white p-6 transition hover:border-amber-400"><UploadCloud className="h-5 w-5 text-amber-800" /><p className="mt-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Marketplace designs</p><p className="mt-1 font-mono text-3xl font-bold text-stone-950">{designTotal}</p><p className="mt-2 text-sm text-stone-500">Create, edit and remove records owned by this account.</p></Link>
            <Link to="/studio/collections" className="rounded-2xl border border-stone-200 bg-white p-6 transition hover:border-amber-400"><FolderOpen className="h-5 w-5 text-amber-800" /><p className="mt-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Design folders</p><p className="mt-1 font-mono text-3xl font-bold text-stone-950">{folderTotal}</p><p className="mt-2 text-sm text-stone-500">Archive listings created by this account.</p></Link>
            <Link to="/studio/catalogs" className="rounded-2xl border border-stone-200 bg-white p-6 transition hover:border-amber-400"><FolderOpen className="h-5 w-5 text-amber-800" /><p className="mt-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Catalogs</p><p className="mt-1 font-mono text-3xl font-bold text-stone-950">{catalogTotal}</p><p className="mt-2 text-sm text-stone-500">Independent catalog archives created by this account.</p></Link>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-stone-200 bg-white">
              <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4"><div><h2 className="font-serif text-xl font-semibold text-stone-950">Recent designs</h2><p className="mt-1 text-xs text-stone-500">Latest server records.</p></div><Link to="/studio/designs" className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-amber-900">Manage <ArrowRight className="h-3.5 w-3.5" /></Link></div>
              {designs.length ? <div className="divide-y divide-stone-100">{designs.map((design) => { const image = design.images[0]?.thumbnailUri || design.imageUri; return <div key={design.id} className="flex items-center gap-4 px-5 py-4">{image ? <img src={image} alt="" className="h-12 w-12 rounded-lg bg-stone-100 object-cover" /> : <span className="h-12 w-12 rounded-lg bg-stone-100" />}<div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-stone-900">{design.title}</p><p className="mt-1 text-xs text-stone-500">{design.categoryName || 'No category'} · {design.publishDate || 'No publish date'}</p></div><Link to={`/studio/designs/edit/${design.id}`} className="text-xs font-semibold text-amber-900 hover:underline">Edit</Link></div>; })}</div> : <div className="p-10 text-center text-sm text-stone-500">No designs yet.</div>}
            </section>
            <section className="rounded-2xl border border-stone-200 bg-white">
              <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4"><div><h2 className="font-serif text-xl font-semibold text-stone-950">Recent folders</h2><p className="mt-1 text-xs text-stone-500">Latest uploaded archives.</p></div><Link to="/studio/collections" className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-amber-900">Manage <ArrowRight className="h-3.5 w-3.5" /></Link></div>
              {folders.length ? <div className="divide-y divide-stone-100">{folders.map((folder) => <div key={folder.id} className="flex items-center gap-4 px-5 py-4"><span className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100 text-amber-800"><FolderOpen className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-stone-900">{folder.name}</p><p className="mt-1 text-xs text-stone-500">{folder.fileCount} files</p></div><Link to={`/collections/${folder.id}`} className="text-xs font-semibold text-amber-900 hover:underline">View</Link></div>)}</div> : <div className="p-10 text-center text-sm text-stone-500">No folders yet.</div>}
            </section>
          </div>
        </>}

        <section className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3"><Wallet className="mt-0.5 h-5 w-5 text-amber-800" /><div><h2 className="font-semibold text-stone-950">Wallet and settlement timeline</h2><p className="mt-1 text-sm text-stone-500">Review server-managed balances, earnings and withdrawal history.</p></div></div>
          <Link to="/studio/wallet" className="inline-flex items-center justify-center gap-1 rounded-lg bg-stone-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-900">Open wallet <ArrowRight className="h-3.5 w-3.5" /></Link>
        </section>
      </div>
    </main>
  );
};

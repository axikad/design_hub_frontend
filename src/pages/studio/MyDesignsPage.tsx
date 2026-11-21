import React, { useCallback, useEffect, useState } from 'react';
import { Edit2, Eye, Layers, LoaderCircle, Search, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { StudioNavigation } from '../../components/studio/StudioNavigation';
import { useApp } from '../../context/AppContext';
import { ApiError, getErrorMessage, studioApi } from '../../lib/api-client';
import type { ApiDesign, PaginationMeta } from '../../types/marketplace';

const money = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const displayDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value))
  : 'Not scheduled';

export const MyDesignsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [designs, setDesigns] = useState<ApiDesign[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<ApiDesign | null>(null);

  const loadDesigns = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await studioApi.myDesigns({ page, per_page: 12, search: appliedSearch }, signal);
      setDesigns(response.data);
      setMeta(response.meta);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      showToast('Could not load designs', getErrorMessage(error), 'error');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [appliedSearch, page, showToast]);

  useEffect(() => {
    const controller = new AbortController();
    void loadDesigns(controller.signal);
    return () => controller.abort();
  }, [loadDesigns]);

  const applySearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  };

  const confirmDelete = async () => {
    if (!designToDelete || deleting) return;
    setDeleting(true);
    try {
      await studioApi.deleteDesign(designToDelete.id);
      showToast('Design deleted', `“${designToDelete.title}” was removed from your marketplace inventory.`, 'success');
      setDesignToDelete(null);
      await loadDesigns();
    } catch (error) {
      const detail = error instanceof ApiError && error.errors
        ? Object.values(error.errors).flat()[0]
        : getErrorMessage(error);
      showToast('Could not delete design', detail || 'Please try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-24">
      <ConfirmationDialog
        isOpen={Boolean(designToDelete)}
        title="Delete marketplace design?"
        message={`Remove “${designToDelete?.title ?? ''}” from your listings? Existing buyer access is preserved.`}
        confirmLabel={deleting ? 'Deleting…' : 'Delete design'}
        isDestructive
        onCancel={() => !deleting && setDesignToDelete(null)}
        onConfirm={() => void confirmDelete()}
      />

      <StudioNavigation />

      <div className="mx-auto max-w-7xl space-y-6 px-4 pt-8 sm:px-6 lg:px-8">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Marketplace inventory</p><h2 className="mt-1 font-serif text-3xl font-semibold text-stone-950">My designs</h2><p className="mt-1 text-sm text-stone-500">Manage the listings owned by your account.</p></div>

        <form onSubmit={applySearch} className="flex gap-2 rounded-xl border border-stone-200 bg-white p-4">
          <label className="relative block flex-1">
            <span className="sr-only">Search your designs</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by design title" className="w-full rounded-lg border border-stone-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20" />
          </label>
          <button className="rounded-lg bg-stone-900 px-5 text-sm font-semibold text-white hover:bg-amber-900">Search</button>
        </form>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-500"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> Loading your designs…</div>
        ) : designs.length === 0 ? (
          <EmptyState icon={Layers} title={appliedSearch ? 'No matching designs' : 'Your studio is ready'} description={appliedSearch ? 'Try a different title.' : 'Add your first design to publish it in the marketplace.'} actionLabel="Add design" onAction={() => navigate('/studio/designs/new')} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500"><tr><th className="px-5 py-3">Design</th><th className="px-5 py-3">Classification</th><th className="px-5 py-3">Specifications</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Publish date</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-stone-100">
                  {designs.map((design) => {
                    const specification = design.designTypes[0]?.details;
                    const image = design.images[0]?.thumbnailUri || design.images[0]?.uri || design.imageUri;
                    return <tr key={design.id} className="hover:bg-stone-50/70">
                      <td className="px-5 py-4"><div className="flex items-center gap-3">{image ? <img src={image} alt="" className="h-12 w-12 rounded-lg border border-stone-200 object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100"><Layers className="h-5 w-5 text-stone-400" /></span>}<div><p className="max-w-56 truncate font-semibold text-stone-950">{design.title}</p><p className="mt-1 text-xs text-stone-400">{design.fileName || 'No stitch filename'}</p></div></div></td>
                      <td className="px-5 py-4"><p className="font-medium text-stone-800">{design.categoryName || 'No category'}</p><p className="mt-1 text-xs text-stone-500">{design.designTypes.map((item) => item.typeName).filter(Boolean).join(', ') || 'No design type'}</p></td>
                      <td className="px-5 py-4 font-mono text-xs text-stone-600"><p>{specification?.stitchCount?.toLocaleString('en-IN') ?? 0} stitches</p><p className="mt-1 text-stone-400">{specification?.height ?? 0} × {specification?.width ?? 0} mm</p></td>
                      <td className="px-5 py-4 font-mono font-bold text-stone-950">{design.showPrice ? money(design.pricePaise) : 'Hidden'}</td>
                      <td className="px-5 py-4 text-stone-600">{displayDate(design.publishDate)}</td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-1"><Link to={`/design/${design.id}`} title="Public preview" className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"><Eye className="h-4 w-4" /></Link><Link to={`/studio/designs/edit/${design.id}`} title="Edit design" className="rounded-lg p-2 text-stone-500 hover:bg-amber-50 hover:text-amber-900"><Edit2 className="h-4 w-4" /></Link><button type="button" onClick={() => setDesignToDelete(design)} title="Delete design" className="rounded-lg p-2 text-stone-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button></div></td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
            {meta && meta.last_page > 1 && <div className="flex items-center justify-between border-t border-stone-200 px-5 py-4 text-sm"><span className="text-stone-500">Page {meta.current_page} of {meta.last_page}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-stone-300 px-3 py-2 font-semibold disabled:opacity-40">Previous</button><button disabled={page >= meta.last_page} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-stone-300 px-3 py-2 font-semibold disabled:opacity-40">Next</button></div></div>}
          </div>
        )}
      </div>
    </main>
  );
};

import React, { useMemo, useState } from 'react';
import { Archive, Eye, FolderPlus, Search, UploadCloud, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ASSET_IMAGES } from '../../data/mockData';

export const MyCollectionsPage: React.FC = () => {
  const { collections, user, addCollection, showToast } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState(399);
  const [archive, setArchive] = useState<File | null>(null);

  const ownFolders = useMemo(
    () => collections.filter((item) => item.sellerId === user.id || item.sellerName === user.name),
    [collections, user.id, user.name],
  );
  const filtered = ownFolders.filter((item) => item.title.toLowerCase().includes(search.trim().toLowerCase()));

  const createFolder = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !archive) {
      showToast('Folder details required', 'Enter a folder name and select a ZIP or RAR archive.', 'error');
      return;
    }
    addCollection({
      title: name.trim(),
      description: `Archive selected: ${archive.name}`,
      category: 'Design folder',
      price,
      originalTotal: price,
      designCount: 0,
      includedDesignIds: [],
      coverImage: ASSET_IMAGES.sareeBorder,
    });
    setName('');
    setPrice(399);
    setArchive(null);
    setDialogOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-24">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Creator studio</p><h1 className="mt-2 font-serif text-4xl font-semibold text-stone-950">Design folders</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">Create a purchasable folder from one ZIP or RAR archive. File previews are generated after the archive is processed.</p></div>
          <button type="button" onClick={() => setDialogOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-900"><FolderPlus className="h-4 w-4" />Add folder</button>
        </div>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"><strong>UI preview:</strong> archive upload and extracted-file progress will be connected to the folder API in the integration phase.</div>

        <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center">
          <label className="relative block w-full max-w-md"><span className="sr-only">Search folders</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your folders" className="w-full rounded-lg border border-stone-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20" /></label>
          <Link to="/studio" className="text-sm font-semibold text-stone-600 hover:text-amber-900">Back to studio</Link>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500"><tr><th className="px-5 py-3">Folder</th><th className="px-5 py-3">Files</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Created</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-stone-100">{filtered.map((folder) => <tr key={folder.id} className="hover:bg-stone-50/70"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-amber-800"><Archive className="h-5 w-5" /></span><div><p className="font-semibold text-stone-900">{folder.title}</p><p className="mt-1 max-w-xs truncate text-xs text-stone-400">{folder.description}</p></div></div></td><td className="px-5 py-4 font-mono text-stone-700">{folder.designCount}</td><td className="px-5 py-4 font-mono font-bold text-stone-900">₹{folder.price.toLocaleString('en-IN')}</td><td className="px-5 py-4 text-stone-500">{folder.createdAt}</td><td className="px-5 py-4 text-right"><Link to={`/collections/${folder.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:underline"><Eye className="h-3.5 w-3.5" />Preview</Link></td></tr>)}</tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center"><Archive className="mx-auto h-8 w-8 text-stone-300" /><h2 className="mt-4 font-serif text-xl font-semibold text-stone-900">No folders found</h2><p className="mt-2 text-sm text-stone-500">Create a folder or change your search.</p></div>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="create-folder-title" onMouseDown={(event) => { if (event.currentTarget === event.target) setDialogOpen(false); }}>
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-amber-800">Design folder</p><h2 id="create-folder-title" className="mt-1 font-serif text-2xl font-semibold text-stone-950">Add folder</h2></div><button type="button" onClick={() => setDialogOpen(false)} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100" aria-label="Close"><X className="h-5 w-5" /></button></div>
            <form onSubmit={createFolder} className="mt-6 space-y-5">
              <label className="block"><span className="text-sm font-semibold text-stone-700">Folder name</span><input value={name} onChange={(event) => setName(event.target.value)} required className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20" /></label>
              <label className="block"><span className="text-sm font-semibold text-stone-700">Price (INR)</span><input type="number" min="0" step="1" value={price} onChange={(event) => setPrice(Number(event.target.value))} required className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 font-mono text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20" /></label>
              <label className="block rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5 text-center hover:border-amber-500"><UploadCloud className="mx-auto h-7 w-7 text-amber-800" /><span className="mt-2 block text-sm font-semibold text-stone-800">Select ZIP or RAR archive</span><span className="mt-1 block text-xs text-stone-500">{archive?.name || 'No archive selected'}</span><input type="file" accept=".zip,.rar,application/zip,application/vnd.rar" onChange={(event) => setArchive(event.target.files?.[0] || null)} className="sr-only" /></label>
              <div className="flex justify-end gap-3 border-t border-stone-100 pt-5"><button type="button" onClick={() => setDialogOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100">Cancel</button><button type="submit" className="rounded-lg bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-900">Create folder</button></div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

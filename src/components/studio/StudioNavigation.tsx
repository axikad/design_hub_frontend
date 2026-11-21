import React, { useEffect, useState } from 'react';
import { FolderPlus, Folders, LayoutDashboard, Layers3, UploadCloud, Wallet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { studioApi } from '../../lib/api-client';

const tabClass = (active: boolean) => `inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${active
  ? 'bg-stone-950 text-white'
  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'}`;

export const StudioNavigation: React.FC = () => {
  const { user } = useApp();
  const { pathname } = useLocation();
  const [designTotal, setDesignTotal] = useState<number | null>(null);
  const [folderTotal, setFolderTotal] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      studioApi.myDesigns({ page: 1, per_page: 1 }, controller.signal),
      studioApi.myFolders({ page: 1, per_page: 1 }, controller.signal),
    ]).then(([designResponse, folderResponse]) => {
      setDesignTotal(designResponse.meta.total);
      setFolderTotal(folderResponse.meta.total);
    }).catch(() => {
      // Page content handles API errors; navigation counts can safely remain hidden.
    });
    return () => controller.abort();
  }, []);

  return (
    <>
      <section className="border-b border-stone-800 bg-stone-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <img src={user.avatar} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-stone-700" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Creator studio</p>
              <h1 className="mt-1 truncate font-serif text-3xl font-semibold">{user.name}</h1>
              <p className="mt-1 text-sm text-stone-400">Manage your marketplace designs, folders and earnings.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/studio/collections?create=1" className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm font-bold text-white hover:border-amber-300 hover:text-amber-200">
              <FolderPlus className="h-4 w-4" /> Add folder
            </Link>
            <Link to="/studio/designs/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-bold text-stone-950 hover:bg-amber-200">
              <UploadCloud className="h-4 w-4" /> Add design
            </Link>
          </div>
        </div>
      </section>

      <div className="border-b border-stone-200 bg-[#FAF8F5]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav aria-label="Studio sections" className="flex gap-2 overflow-x-auto rounded-xl border border-stone-200 bg-white p-2">
            <Link to="/studio" className={tabClass(pathname === '/studio')}><LayoutDashboard className="h-4 w-4" /> Overview</Link>
            <Link to="/studio/designs" className={tabClass(pathname.startsWith('/studio/designs'))}><Layers3 className="h-4 w-4" /> My designs{designTotal === null ? '' : ` (${designTotal})`}</Link>
            <Link to="/studio/collections" className={tabClass(pathname.startsWith('/studio/collections'))}><Folders className="h-4 w-4" /> Folders{folderTotal === null ? '' : ` (${folderTotal})`}</Link>
            <Link to="/studio/wallet" className={tabClass(pathname.startsWith('/studio/wallet'))}><Wallet className="h-4 w-4" /> Wallet</Link>
          </nav>
        </div>
      </div>
    </>
  );
};

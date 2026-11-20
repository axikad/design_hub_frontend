import React from 'react';
import { ArrowRight, FolderOpen, Hourglass, IndianRupee, LayoutDashboard, UploadCloud, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export const StudioDashboardPage: React.FC = () => {
  const { user, designs, collections, wallet, earnings } = useApp();
  const myDesigns = designs.filter((design) => design.sellerId === user.id);
  const myCollections = collections.filter((collection) => collection.sellerId === user.id);
  const recentEarnings = earnings.slice(0, 4);

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-24">
      <section className="border-b border-stone-800 bg-stone-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div className="flex items-center gap-4">
            <img src={user.avatar} alt="" className="h-14 w-14 rounded-2xl object-cover ring-1 ring-stone-700" />
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Creator studio</p><h1 className="mt-1 font-serif text-3xl font-semibold">{user.name}</h1><p className="mt-1 text-sm text-stone-400">Manage your marketplace records and seller activity.</p></div>
          </div>
          <Link to="/studio/designs/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-stone-950 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"><UploadCloud className="h-4 w-4" />Add design</Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>UI preview:</strong> figures on this screen remain fixture data until the seller APIs are connected. Live wallet values must always come from the server.
        </div>

        <nav aria-label="Studio sections" className="flex gap-2 overflow-x-auto rounded-xl border border-stone-200 bg-white p-2 text-sm">
          <Link to="/studio" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-stone-950 px-4 py-2.5 font-semibold text-white"><LayoutDashboard className="h-4 w-4" />Overview</Link>
          <Link to="/studio/designs" className="shrink-0 rounded-lg px-4 py-2.5 font-medium text-stone-600 hover:bg-stone-50">My designs ({myDesigns.length})</Link>
          <Link to="/studio/collections" className="shrink-0 rounded-lg px-4 py-2.5 font-medium text-stone-600 hover:bg-stone-50">Folders ({myCollections.length})</Link>
          <Link to="/studio/wallet" className="shrink-0 rounded-lg px-4 py-2.5 font-medium text-stone-600 hover:bg-stone-50">Wallet</Link>
        </nav>

        <section aria-labelledby="studio-summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <h2 id="studio-summary" className="sr-only">Studio summary</h2>
          {[
            ['Published designs', String(myDesigns.filter((design) => design.status === 'active').length), 'Your active marketplace designs', UploadCloud],
            ['Design folders', String(myCollections.length), 'Grouped archive listings', FolderOpen],
            ['Available', money(wallet.available), 'Current available balance', IndianRupee],
            ['Waiting settlement', money(wallet.waitingAmount), 'Pending settlement schedule', Hourglass],
          ].map(([label, value, note, Icon]) => (
            <article key={String(label)} className="rounded-2xl border border-stone-200 bg-white p-5">
              <Icon className="h-5 w-5 text-amber-800" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-stone-500">{String(label)}</p>
              <p className="mt-1 font-mono text-2xl font-bold text-stone-950">{String(value)}</p>
              <p className="mt-1 text-xs text-stone-400">{String(note)}</p>
            </article>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-2xl border border-stone-200 bg-white">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4"><div><h2 className="font-serif text-xl font-semibold text-stone-950">Recent designs</h2><p className="mt-1 text-xs text-stone-500">Your latest marketplace records.</p></div><Link to="/studio/designs" className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-amber-900">Manage <ArrowRight className="h-3.5 w-3.5" /></Link></div>
            {myDesigns.length > 0 ? (
              <div className="divide-y divide-stone-100">{myDesigns.slice(0, 5).map((design) => <div key={design.id} className="flex items-center gap-4 px-5 py-4"><img src={design.images[0]} alt="" className="h-12 w-12 rounded-lg bg-stone-100 object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-stone-900">{design.title}</p><p className="mt-1 text-xs text-stone-500">{design.machine} · {design.status}</p></div><Link to={`/studio/designs/edit/${design.id}`} className="text-xs font-semibold text-amber-900 hover:underline">Edit</Link></div>)}</div>
            ) : <div className="p-10 text-center text-sm text-stone-500">No designs yet. Add your first design to begin.</div>}
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4"><div><h2 className="font-serif text-xl font-semibold text-stone-950">Recent earnings</h2><p className="mt-1 text-xs text-stone-500">Settlement status preview.</p></div><Link to="/studio/wallet" className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-amber-900">Wallet <ArrowRight className="h-3.5 w-3.5" /></Link></div>
            {recentEarnings.length > 0 ? <div className="divide-y divide-stone-100">{recentEarnings.map((earning) => <div key={earning.id} className="px-5 py-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-stone-900">{earning.designName}</p><p className="mt-1 text-xs text-stone-500">{earning.settlementCycle}</p></div><div className="text-right"><p className="font-mono text-sm font-bold text-emerald-700">+{money(earning.netEarning)}</p><p className="mt-1 text-[10px] uppercase text-stone-400">{earning.status}</p></div></div></div>)}</div> : <div className="p-10 text-center text-sm text-stone-500">No earnings yet.</div>}
          </section>
        </div>

        <section className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3"><Wallet className="mt-0.5 h-5 w-5 text-amber-800" /><div><h2 className="font-semibold text-stone-950">Wallet and settlement timeline</h2><p className="mt-1 text-sm text-stone-500">Review balances, earnings, settlement snapshots and withdrawal history.</p></div></div>
          <Link to="/studio/wallet" className="inline-flex items-center justify-center gap-1 rounded-lg bg-stone-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-900">Open wallet <ArrowRight className="h-3.5 w-3.5" /></Link>
        </section>
      </div>
    </main>
  );
};

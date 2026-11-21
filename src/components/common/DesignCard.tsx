import React from 'react';
import { CheckCircle2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { DesignCardData } from '../../types/marketplace';

interface DesignCardProps {
  design: DesignCardData;
  viewMode?: 'grid' | 'list';
}

const formatInr = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(value);

const SellerAvatar: React.FC<{ design: DesignCardData }> = ({ design }) => design.sellerAvatar ? (
  <img src={design.sellerAvatar} alt="" loading="lazy" className="h-5 w-5 shrink-0 rounded-full object-cover" />
) : (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[9px] font-bold uppercase text-amber-900">{design.sellerName.charAt(0)}</span>
);

export const DesignCard: React.FC<DesignCardProps> = ({ design, viewMode = 'grid' }) => {
  const { user, isSaved, toggleSaveDesign, isPurchased, showToast } = useApp();
  const saved = isSaved(design.id);
  const purchased = user.isLoggedIn && isPurchased(design.id);
  const preview = design.images[0];
  const dimensions = design.heightMm > 0 || design.widthMm > 0 ? `${design.heightMm}×${design.widthMm} mm` : 'Specs available';

  const handleSave = () => {
    if (!user.isLoggedIn) {
      showToast('Sign in required', 'Sign in with your mobile OTP to save this design.', 'info');
      return;
    }
    toggleSaveDesign(design.id);
  };

  const saveButton = (compact = false) => (
    <button type="button" onClick={handleSave}
      className={`inline-flex ${compact ? 'h-8 w-8 rounded-lg' : 'h-9 w-9 rounded-full'} items-center justify-center border shadow-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 ${saved ? 'border-rose-400 bg-rose-500 text-white' : 'border-stone-200 bg-white/95 text-stone-700 hover:bg-white hover:text-rose-600'}`}
      aria-label={saved ? `Remove ${design.title} from saved designs` : `Save ${design.title}`} title={saved ? 'Remove from saved designs' : 'Save design'}>
      <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
    </button>
  );

  if (viewMode === 'list') {
    return (
      <article className="group grid gap-4 rounded-xl border border-stone-200 bg-white p-4 transition hover:border-stone-300 hover:shadow-sm sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-center">
        <Link to={`/design/${design.id}`} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone-100 sm:aspect-square">
          {preview ? <img src={preview} alt={design.title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center px-2 text-center text-xs text-stone-400">No preview</div>}
          {purchased && <span className="absolute bottom-1.5 left-1.5 rounded bg-stone-950/90 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">Owned</span>}
        </Link>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] uppercase tracking-wider text-stone-500">
            <span className="font-semibold text-amber-800">{design.category}</span><span>·</span><span>{design.machine}</span><span>·</span><span className="font-mono">{design.stitches.toLocaleString('en-IN')} stitches</span>
          </div>
          <Link to={`/design/${design.id}`} className="mt-1.5 block truncate font-serif text-base font-semibold text-stone-950 transition group-hover:text-amber-900">{design.title}</Link>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-stone-500">
            {design.formats.length > 0 && <><span className="font-mono">{design.formats.slice(0, 4).join(' / ')}</span><span>·</span></>}
            <span className="inline-flex min-w-0 items-center gap-1.5"><SellerAvatar design={design} /><span className="truncate">By {design.sellerName}</span></span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
          <div className="text-right"><p className="font-mono text-lg font-bold text-stone-950">{formatInr(design.price)}</p><p className="text-[10px] text-stone-400">Production file</p></div>
          <div className="flex items-center gap-2">{saveButton(true)}<Link to={`/design/${design.id}`} className="rounded-lg bg-stone-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2">{purchased ? 'Open files' : 'View specs'}</Link></div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <Link to={`/design/${design.id}`} className="block h-full w-full">
          {preview ? <img src={preview} alt={design.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-xs text-stone-400">No preview available</div>}
        </Link>
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between">
          {purchased ? <span className="pointer-events-auto inline-flex items-center gap-1 rounded bg-stone-950/90 px-2 py-1 text-[10px] font-semibold text-emerald-300"><CheckCircle2 className="h-3 w-3" /> Owned</span> : design.isNew ? <span className="rounded bg-amber-100/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-950">New drop</span> : <span />}
          <span className="pointer-events-auto">{saveButton()}</span>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-stone-950/90 via-stone-950/45 to-transparent px-3 pb-3 pt-10 text-[10px] text-white">
          <span className="font-mono font-semibold">{design.stitches.toLocaleString('en-IN')} stitches</span><span className="font-mono text-stone-200">{dimensions}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-stone-500"><span className="truncate font-semibold text-amber-800">{design.category}</span><span>·</span><span className="truncate">{design.machine}</span></div>
        <Link to={`/design/${design.id}`} title={design.title} className="mt-2 block line-clamp-2 font-serif text-lg font-semibold leading-6 text-stone-950 transition group-hover:text-amber-900">{design.title}</Link>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone-500">{design.description}</p>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-stone-100 pt-3 text-[11px] text-stone-500">
          <span className="inline-flex min-w-0 items-center gap-1.5"><SellerAvatar design={design} /><span className="truncate">{design.sellerName}</span></span>
          <span className="shrink-0 font-mono text-[10px] text-stone-400">{design.formats.slice(0, 3).join(' · ') || 'FILE'}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-400">Price</p>
            <p className="font-mono text-xl font-bold leading-none text-stone-950">{formatInr(design.price)}</p>
          </div>
          <Link to={`/design/${design.id}`} className="inline-flex shrink-0 items-center rounded-lg bg-stone-950 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap text-white transition hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2">{purchased ? 'Open files' : 'View details'} <span aria-hidden="true" className="ml-1">→</span></Link>
        </div>
      </div>
    </article>
  );
};

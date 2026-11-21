import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Search,
  Sparkles,
  Store,
  UploadCloud,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CollectionCard } from '../components/common/CollectionCard';
import { DesignCard } from '../components/common/DesignCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { SearchByImageModal } from '../components/common/SearchByImageModal';
import { useApp } from '../context/AppContext';
import heroImage from '../assets/images/hero_textile_embroidery_1793879816875.jpg';
import { getErrorMessage, marketplaceApi } from '../lib/api-client';
import { toDesignCard, toFolderCard } from '../lib/marketplace-mappers';
import type { ApiFolder, ApiHomeData, BrowseFilters, DesignCardData } from '../types/marketplace';

export const HomePage: React.FC = () => {
  const { user, setSearchQuery } = useApp();
  const [query, setQuery] = useState('');
  const [home, setHome] = useState<ApiHomeData | null>(null);
  const [filters, setFilters] = useState<BrowseFilters | null>(null);
  const [folders, setFolders] = useState<ApiFolder[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    Promise.all([
      marketplaceApi.home(controller.signal),
      marketplaceApi.browseFilters(controller.signal),
      marketplaceApi.folders({ page: 1, per_page: 3 }, controller.signal),
    ])
      .then(([homeResponse, filterResponse, folderResponse]) => {
        setHome(homeResponse.data);
        setFilters(filterResponse.data);
        setFolders(folderResponse.data);
      })
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const latestDesigns = useMemo(
    () => (home?.latest.items ?? []).map((design) => toDesignCard(design, filters)),
    [home, filters],
  );
  const todayDesigns = useMemo(
    () => (home?.today.items ?? []).map((design) => toDesignCard(design, filters)),
    [home, filters],
  );
  const tomorrowDesigns = useMemo(
    () => (home?.tomorrow.items ?? []).map((design) => toDesignCard(design, filters)),
    [home, filters],
  );
  const folderCards = useMemo(() => folders.map(toFolderCard), [folders]);
  const heroDesign = latestDesigns[0] ?? null;

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    setSearchQuery(value);
    navigate(value ? `/explore?q=${encodeURIComponent(value)}` : '/explore');
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      <SearchByImageModal isOpen={imageSearchOpen} onClose={() => setImageSearchOpen(false)} />
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-gradient-to-b from-[#F5F2EB] to-[#FAF8F5] py-12 lg:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="space-y-6 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wide text-amber-900/90">
              <span>Digital textile design marketplace</span>
              <span aria-hidden="true">·</span>
              <span>Browse by machine and production needs</span>
            </div>

            <h1 className="max-w-3xl text-balance font-serif text-4xl font-bold leading-[1.08] tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
              Production-ready textile designs and stitch files.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
              Find designs by machine, machine type, category and exact production specifications. Review every available detail before you purchase.
            </p>

            <form onSubmit={submitSearch} className="max-w-2xl">
              <div className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg shadow-stone-900/5 sm:flex-row">
                <label htmlFor="home-search" className="sr-only">Search designs</label>
                <div className="relative flex min-w-0 flex-1 items-center">
                  <Search className="ml-3.5 h-5 w-5 shrink-0 text-stone-400" aria-hidden="true" />
                  <input
                    id="home-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search design title"
                    className="w-full bg-transparent px-3 py-3 text-sm text-stone-950 outline-none placeholder:text-stone-400"
                  />
                </div>
                <button type="button" onClick={() => setImageSearchOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-stone-600 transition hover:bg-amber-50 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2">
                  <Camera className="h-4 w-4 text-amber-700" aria-hidden="true" />
                  Swatch Match
                </button>
                <button type="submit" className="rounded-lg bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2">
                  Explore designs
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1 text-xs text-stone-500">
              {['Live machine catalog', 'Server-priced checkout', 'Protected downloads after payment'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />{item}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="group relative overflow-hidden rounded-2xl border border-stone-300/80 bg-stone-100 shadow-2xl shadow-stone-900/15">
              <img src={heroImage} width="1376" height="768" fetchPriority="high" alt="Detailed textile embroidery design" className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-stone-700/80 bg-stone-950/90 p-4 text-white shadow-xl backdrop-blur-md">
                {heroDesign ? (
                  <>
                    <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">
                      <span>Latest design</span>
                      <span className="font-mono font-medium tracking-normal text-stone-300">{heroDesign.stitches.toLocaleString('en-IN')} stitches</span>
                    </div>
                    <h2 className="mt-2 line-clamp-1 font-serif text-lg font-semibold">{heroDesign.title}</h2>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-stone-700 pt-3 text-xs">
                      <span className="truncate text-stone-300">{heroDesign.machine}</span>
                      <Link to={`/design/${heroDesign.id}`} className="inline-flex shrink-0 items-center gap-1 font-semibold text-amber-300 hover:text-amber-200">View details <ArrowRight className="h-3.5 w-3.5" /></Link>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">Review before purchase</p>
                    <p className="mt-2 text-sm text-stone-200">Compare machine, dimensions and design-type specifications.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2"><AlertCircle className="h-5 w-5" />{error}</span>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="rounded-lg bg-red-900 px-4 py-2 text-xs font-semibold text-white">Try again</button>
          </div>
        </section>
      )}

      <section className="border-b border-stone-200 bg-white py-9">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Machine catalog" title="Browse by machine" link="/explore" linkLabel="All machines" compact />
          {loading ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-stone-100" />)}</div>
          ) : (filters?.machines ?? []).length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
              {(filters?.machines ?? []).map((machine) => (
                <Link key={machine.id} to={`/explore?machine=${encodeURIComponent(machine.id)}`} className="group flex min-h-24 items-center gap-3 rounded-xl border border-stone-200/80 bg-stone-50/60 p-3 transition hover:-translate-y-0.5 hover:border-amber-600/60 hover:bg-amber-50/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 sm:p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-200/80 text-stone-600 transition group-hover:bg-amber-100 group-hover:text-amber-900">
                    {machine.imageUri ? <img src={machine.imageUri} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <Cpu className="h-5 w-5" aria-hidden="true" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-stone-900 group-hover:text-amber-950">{machine.name}</h3>
                    <p className="mt-1 text-[10px] text-stone-500">View matching designs</p>
                  </div>
                  <ChevronRight className="hidden h-4 w-4 shrink-0 text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-amber-800 xl:block" aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptySection copy="No active machines are available yet." />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Garment and textile segments" title="Browse popular categories" link="/explore" linkLabel="Explore all categories" />
        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-xl bg-stone-100" />)}</div>
        ) : (filters?.categories ?? []).length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(filters?.categories ?? []).slice(0, 8).map((category) => (
              <Link key={category.id} to={`/explore?category=${encodeURIComponent(category.id)}`} className="group rounded-xl border border-stone-200/90 bg-white p-4 transition hover:-translate-y-0.5 hover:border-stone-400 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2">
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 font-serif text-sm font-bold text-amber-900">{category.name.charAt(0).toUpperCase()}</span>
                  <ChevronRight className="h-4 w-4 text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-amber-800" aria-hidden="true" />
                </div>
                <h3 className="font-serif text-base font-semibold text-stone-950 group-hover:text-amber-900">{category.name}</h3>
                <p className="mt-1 text-xs text-stone-500">Explore matching designs</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptySection copy="No active categories are available yet." />
        )}
      </section>

      <section className="border-y border-stone-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Recently published" title="Latest production designs" link="/explore" linkLabel="View all designs" />
          {loading ? (
            <div className="mt-8"><LoadingSkeleton count={8} /></div>
          ) : latestDesigns.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{latestDesigns.slice(0, 8).map((design) => <DesignCard key={design.id} design={design} />)}</div>
          ) : (
            <EmptySection copy="No published designs are available yet." />
          )}
        </div>
      </section>

      {(loading || folderCards.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Design folders" title="Browse grouped design files" link="/collections" linkLabel="View all folders" />
          <p className="mt-2 max-w-2xl text-sm text-stone-500">Explore purchasable design archives with file previews and server-provided pricing.</p>
          {loading ? <div className="mt-8"><LoadingSkeleton count={3} /></div> : <div className="mt-8 grid gap-6 md:grid-cols-3">{folderCards.map((folder) => <CollectionCard key={folder.id} collection={folder} />)}</div>}
        </section>
      )}

      {!loading && (todayDesigns.length > 0 || tomorrowDesigns.length > 0) && (
        <section className="border-y border-stone-200 bg-white py-16">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <FeedColumn eyebrow="Available today" title="Today's designs" designs={todayDesigns} viewAll="/explore?section=today" />
            <FeedColumn eyebrow="Coming next" title="Tomorrow's designs" designs={tomorrowDesigns} viewAll="/explore?section=tomorrow" />
          </div>
        </section>
      )}

      <section className="bg-stone-950 py-16 text-stone-200">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">For buyers and manufacturers</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">A clear path from discovery to download.</h2>
            <div className="mt-8 space-y-4">
              {[
                ['1', 'Discover', 'Filter the live catalog by machine and production specifications.'],
                ['2', 'Review', 'Check available images, design-type details, file type and server price.'],
                ['3', 'Purchase', 'Complete checkout and receive protected downloads after payment confirmation.'],
              ].map(([step, title, copy]) => (
                <div key={step} className="flex gap-4 rounded-xl border border-stone-700 bg-stone-900 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-800 font-mono text-sm font-bold text-amber-300">{step}</span>
                  <div><h3 className="font-semibold text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-stone-400">{copy}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-700 bg-gradient-to-br from-stone-900 to-stone-800 p-7 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">For textile creators</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-white">Share and manage your design catalog.</h2>
            <p className="mt-4 text-sm leading-7 text-stone-300">Use My Studio to create designs and folders, manage your records, review seller earnings and follow the settlement mode configured for your account.</p>
            <div className="mt-7 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-stone-700 bg-stone-950/60 p-4"><Sparkles className="h-5 w-5 text-amber-300" /><p className="mt-3 font-semibold text-white">Catalog tools</p><p className="mt-1 text-xs text-stone-400">Designs and folders</p></div>
              <div className="rounded-xl border border-stone-700 bg-stone-950/60 p-4"><Store className="h-5 w-5 text-amber-300" /><p className="mt-3 font-semibold text-white">Seller workspace</p><p className="mt-1 text-xs text-stone-400">Wallet and records</p></div>
            </div>
            <Link to={user.isLoggedIn && user.role === 'seller' ? '/studio' : '/auth'} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-stone-950 transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900">
              {user.isLoggedIn && user.role === 'seller' ? <Store className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
              {user.isLoggedIn && user.role === 'seller' ? 'Open My Studio' : 'Sign in or register'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

const SectionHeading: React.FC<{
  eyebrow: string;
  title: string;
  link: string;
  linkLabel: string;
  compact?: boolean;
}> = ({ eyebrow, title, link, linkLabel, compact = false }) => (
  <div className="flex items-end justify-between gap-4">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">{eyebrow}</p>
      <h2 className={`${compact ? 'mt-1 text-2xl' : 'mt-2 text-3xl'} font-serif font-semibold text-stone-950`}>{title}</h2>
    </div>
    <Link to={link} className="hidden items-center gap-1 text-sm font-semibold text-stone-700 hover:text-amber-900 sm:inline-flex">{linkLabel} <ArrowRight className="h-4 w-4" /></Link>
  </div>
);

const EmptySection: React.FC<{ copy: string }> = ({ copy }) => (
  <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">{copy}</div>
);

const FeedColumn: React.FC<{
  eyebrow: string;
  title: string;
  designs: DesignCardData[];
  viewAll: string;
}> = ({ eyebrow, title, designs, viewAll }) => (
  <div>
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-stone-200 pb-4">
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">{eyebrow}</p><h2 className="mt-1 font-serif text-2xl font-semibold text-stone-950">{title}</h2></div>
      {designs.length > 0 && <Link to={viewAll} className="text-xs font-semibold text-stone-600 hover:text-amber-900">View all</Link>}
    </div>
    {designs.length > 0 ? <div className="space-y-4">{designs.slice(0, 3).map((design) => <DesignCard key={design.id} design={design} viewMode="list" />)}</div> : <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">No designs in this section yet.</div>}
  </div>
);

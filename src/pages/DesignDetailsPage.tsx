import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, FileCheck, Maximize2, Share2, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { DesignCard } from '../components/common/DesignCard';
import { getErrorMessage, marketplaceApi } from '../lib/api-client';
import { normalizeAssetUrl, toDesignCard } from '../lib/marketplace-mappers';
import type { ApiDesign, BrowseFilters } from '../types/marketplace';

const inr = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(paise / 100);
const numeric = (value: string | number | null | undefined) => Number(value ?? 0) || 0;

export const DesignDetailsPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [design, setDesign] = useState<ApiDesign | null>(null);
  const [filters, setFilters] = useState<BrowseFilters | null>(null);
  const [related, setRelated] = useState<ApiDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setActiveImage(0);
    (async () => {
      try {
        const [designResponse, filterResponse] = await Promise.all([
          marketplaceApi.design(id, controller.signal),
          marketplaceApi.browseFilters(controller.signal),
        ]);
        if (controller.signal.aborted) return;
        setDesign(designResponse.data);
        setFilters(filterResponse.data);
        if (designResponse.data.categoryId) {
          const relatedResponse = await marketplaceApi.designs({ category_ids: [designResponse.data.categoryId], page: 1, per_page: 4 }, controller.signal);
          setRelated(relatedResponse.data.filter((item) => item.id !== id).slice(0, 3));
        } else {
          setRelated([]);
        }
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(getErrorMessage(requestError));
        setDesign(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id, reloadKey]);

  const gallery = useMemo(() => {
    if (!design) return [];
    const images = design.images.map((image) => normalizeAssetUrl(image.uri)).filter((uri): uri is string => Boolean(uri));
    const fallback = normalizeAssetUrl(design.imageUri);
    if (images.length === 0 && fallback) images.push(fallback);
    return images;
  }, [design]);

  if (loading) return <DesignDetailSkeleton />;
  if (error || !design) return <main className="mx-auto min-h-[60vh] max-w-3xl px-4 py-16"><div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-900"><AlertCircle className="mx-auto h-8 w-8" /><h1 className="mt-3 font-serif text-2xl font-semibold">Design unavailable</h1><p className="mt-2 text-sm">{error || 'This design could not be found.'}</p><div className="mt-5 flex justify-center gap-3"><Link to="/explore" className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold">Back to designs</Link><button type="button" onClick={() => setReloadKey((value) => value + 1)} className="rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white">Try again</button></div></div></main>;

  const machineName = filters?.machineTypes.find((item) => item.id === design.machineTypeId)?.name || design.machineTypeId || 'Not specified';
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage('Link copied');
    } catch {
      setShareMessage('Copy the URL from your browser');
    }
    window.setTimeout(() => setShareMessage(''), 2500);
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-24">
      {lightboxOpen && gallery[activeImage] && <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 p-4" role="dialog" aria-modal="true" aria-label="Design image preview"><button type="button" onClick={() => setLightboxOpen(false)} aria-label="Close preview" className="absolute right-6 top-6 rounded-full bg-stone-800 p-2 text-white"><X className="h-6 w-6" /></button><img src={gallery[activeImage]} alt={design.title} className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain" /></div>}
      <div className="border-b border-stone-200 bg-white py-3"><div className="mx-auto flex max-w-7xl items-center gap-2 px-4 text-xs text-stone-500 sm:px-6 lg:px-8"><Link to="/">Home</Link><span>/</span><Link to="/explore">Explore</Link><span>/</span>{design.categoryId ? <Link to={`/explore?category=${encodeURIComponent(design.categoryId)}`}>{design.categoryName || 'Category'}</Link> : <span>{design.categoryName || 'Category'}</span>}<span>/</span><span className="truncate font-medium text-stone-900">{design.title}</span></div></div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm">{gallery[activeImage] ? <img src={gallery[activeImage]} alt={design.title} className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center text-sm text-stone-400">No preview image</div>}{gallery[activeImage] && <button type="button" onClick={() => setLightboxOpen(true)} aria-label="Open full image" className="absolute bottom-4 right-4 rounded-xl bg-stone-900/85 p-2.5 text-white"><Maximize2 className="h-4 w-4" /></button>}</div>
            {gallery.length > 1 && <div className="flex gap-3 overflow-x-auto pb-2">{gallery.map((image, index) => <button type="button" key={image} onClick={() => setActiveImage(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${activeImage === index ? 'border-amber-800' : 'border-stone-200'}`}><img src={image} alt={`${design.title} preview ${index + 1}`} className="h-full w-full object-cover" /></button>)}</div>}
            <DesignTypeSection design={design} />
            <section className="rounded-2xl border border-stone-200 bg-white p-6"><h2 className="font-serif text-lg font-semibold text-stone-950">Files listed with this design</h2>{design.files.length > 0 ? <ul className="mt-4 divide-y divide-stone-100">{design.files.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center gap-3 py-3"><FileCheck className="h-4 w-4 text-amber-800" /><div><p className="text-sm font-semibold text-stone-900">{file.displayName || file.name}</p><p className="text-xs text-stone-500">Download access is confirmed after purchase.</p></div></li>)}</ul> : <p className="mt-3 text-sm text-stone-500">No file metadata is currently available.</p>}</section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:col-span-5"><section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-4 text-xs text-stone-500"><span className="font-semibold uppercase tracking-wider text-amber-900">{design.categoryName || 'Uncategorized'}</span><div className="relative"><button type="button" onClick={share} aria-label="Share design" className="rounded-lg border border-stone-200 p-2"><Share2 className="h-4 w-4" /></button>{shareMessage && <span className="absolute right-0 top-11 z-10 w-max rounded-md bg-stone-950 px-2 py-1 text-[10px] text-white">{shareMessage}</span>}</div></div><h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-stone-950">{design.title}</h1><dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-stone-50 p-4 text-xs"><div><dt className="text-stone-500">Machine type</dt><dd className="mt-1 font-semibold text-stone-900">{machineName}</dd></div><div><dt className="text-stone-500">File type</dt><dd className="mt-1 font-semibold text-stone-900">{design.designFileTypeName || design.designFileExtension?.toUpperCase() || 'Not specified'}</dd></div><div><dt className="text-stone-500">Sequence</dt><dd className="mt-1 font-semibold text-stone-900">{design.sequenceType || 'Not specified'}</dd></div><div><dt className="text-stone-500">Published</dt><dd className="mt-1 font-semibold text-stone-900">{design.publishDate || 'Not specified'}</dd></div></dl><div className="mt-6 border-t border-stone-100 pt-5"><p className="text-xs uppercase tracking-wider text-stone-400">Price</p><p className="mt-1 font-mono text-3xl font-bold text-stone-950">{design.showPrice ? inr(design.pricePaise) : 'Price hidden'}</p></div><div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><p className="font-semibold">Live catalog details are connected.</p><p className="mt-1 text-xs leading-5 text-amber-800">Authentication, purchase status, checkout and protected downloads will be connected in the next phases.</p></div><button type="button" disabled className="mt-4 w-full cursor-not-allowed rounded-xl bg-stone-200 px-4 py-3 text-sm font-semibold text-stone-500">Checkout integration pending</button></section></aside>
        </div>

        {related.length > 0 && <section className="mt-16 border-t border-stone-200 pt-10"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">More designs</p><h2 className="mt-2 font-serif text-2xl font-semibold text-stone-950">Similar category results</h2></div>{design.categoryId && <Link to={`/explore?category=${encodeURIComponent(design.categoryId)}`} className="text-sm font-semibold text-amber-900">View all</Link>}</div><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <DesignCard key={item.id} design={toDesignCard(item, filters)} />)}</div></section>}
      </div>
    </main>
  );
};

const DesignTypeSection: React.FC<{ design: ApiDesign }> = ({ design }) => {
  if (design.designTypes.length === 0) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="font-serif text-lg font-semibold text-stone-950">Design type specifications</h2>
        <p className="mt-4 text-sm text-stone-500">No design-type specifications are available.</p>
      </section>
    );
  }

  if (design.designTypeImageCards) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="font-serif text-lg font-semibold text-stone-950">Design components</h2>
        <p className="mt-1 text-xs text-stone-500">Preview each design type included with this design.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {design.designTypes.map((type, index) => {
            const image = normalizeAssetUrl(type.details.image?.thumbnailUri || type.details.image?.uri);
            const typeName = type.typeName || type.customTypeName || 'Custom type';
            return (
              <article key={`${type.typeId || typeName}-${index}`} className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                <div className="aspect-[4/3] bg-stone-100">
                  {image ? <img src={image} alt={typeName} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-4 text-center text-xs text-stone-400">No component image</div>}
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-lg font-semibold text-stone-950">{typeName}</h3>
                  {type.details.nameOrNumber && <p className="mt-1 text-sm text-stone-600">{type.details.nameOrNumber}</p>}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="font-serif text-lg font-semibold text-stone-950">Design type specifications</h2>
      <p className="mt-1 text-xs text-stone-500">Measurements are shown in {design.measurementUnit || 'mm'}.</p>
      <div className="mt-5 grid gap-4">
        {design.designTypes.map((type, index) => {
          const typeName = type.typeName || type.customTypeName || 'Custom type';
          return (
            <article key={`${type.typeId || typeName}-${index}`} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <h3 className="font-serif text-lg font-semibold text-stone-950">{typeName}</h3>
              {type.details.nameOrNumber && <p className="mt-1 text-xs text-stone-500">{type.details.nameOrNumber}</p>}
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:grid-cols-3">
                <Spec label="Stitches" value={numeric(type.details.stitchCount).toLocaleString('en-IN')} />
                <Spec label="Needles" value={String(numeric(type.details.needle))} />
                <Spec label="Area" value={String(type.details.area ?? 0)} />
                <Spec label="Height" value={`${type.details.height ?? 0} ${design.measurementUnit}`} />
                <Spec label="Width" value={`${type.details.width ?? 0} ${design.measurementUnit}`} />
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
};

const Spec: React.FC<{ label: string; value: string }> = ({ label, value }) => <div><dt className="text-stone-500">{label}</dt><dd className="mt-0.5 font-mono font-semibold text-stone-900">{value}</dd></div>;
const DesignDetailSkeleton = () => <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="grid animate-pulse gap-10 lg:grid-cols-12"><div className="aspect-[4/3] rounded-2xl bg-stone-200 lg:col-span-7" /><div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 lg:col-span-5"><div className="h-4 w-28 rounded bg-stone-200" /><div className="h-12 w-3/4 rounded bg-stone-200" /><div className="h-32 rounded bg-stone-100" /></div></div></main>;

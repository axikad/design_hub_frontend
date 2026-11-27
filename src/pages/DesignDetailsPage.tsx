import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, FileCheck, Maximize2, Share2, ShoppingBag, X } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { DesignCard } from '../components/common/DesignCard';
import { ProtectedDownloadButton } from '../components/common/ProtectedDownloadButton';
import { useApp } from '../context/AppContext';
import { getErrorMessage, marketplaceApi } from '../lib/api-client';
import { normalizeAssetUrl, toDesignCard } from '../lib/marketplace-mappers';
import type { ApiDesign, BrowseFilters } from '../types/marketplace';

const inr = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(paise / 100);
const value = (raw: string | number | null | undefined, suffix = '') => raw === null || raw === undefined || raw === '' ? '—' : `${raw}${suffix}`;

export const DesignDetailsPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const location = useLocation();
  const { user, isPurchased } = useApp();
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
    setLoading(true); setError(''); setActiveImage(0);
    (async () => {
      try {
        const [designResponse, filterResponse] = await Promise.all([
          marketplaceApi.design(id, controller.signal), marketplaceApi.browseFilters(controller.signal),
        ]);
        if (controller.signal.aborted) return;
        setDesign(designResponse.data); setFilters(filterResponse.data);
        if (designResponse.data.categoryId) {
          const relatedResponse = await marketplaceApi.designs({ category_ids: [designResponse.data.categoryId], page: 1, per_page: 4 }, controller.signal);
          setRelated(relatedResponse.data.filter((item) => item.id !== id).slice(0, 3));
        } else setRelated([]);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(getErrorMessage(requestError)); setDesign(null);
      } finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [id, reloadKey]);

  const gallery = useMemo(() => {
    if (!design) return [];
    const images = design.images.map((image) => normalizeAssetUrl(image.uri)).filter((uri): uri is string => Boolean(uri));
    const fallback = normalizeAssetUrl(design.imageUri);
    if (!images.length && fallback) images.push(fallback);
    return images;
  }, [design]);

  if (loading) return <DesignDetailSkeleton />;
  if (error || !design) return <main className="mx-auto min-h-[60vh] max-w-3xl px-4 py-16"><div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-900"><AlertCircle className="mx-auto h-8 w-8" /><h1 className="mt-3 font-serif text-2xl font-semibold">Design unavailable</h1><p className="mt-2 text-sm">{error || 'This design could not be found.'}</p><div className="mt-5 flex justify-center gap-3"><Link to="/explore" className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold">Back to designs</Link><button type="button" onClick={() => setReloadKey((current) => current + 1)} className="rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white">Try again</button></div></div></main>;

  const machineName = filters?.machineTypes.find((item) => item.id === design.machineTypeId)?.name || design.machineTypeId || 'Not specified';
  const purchased = isPurchased(design.id);
  const ownerKey = `${user.countryCode}${user.phone}`;
  const owned = user.isLoggedIn && Boolean(design.ownerKey) && design.ownerKey === ownerKey;
  const canDownload = purchased || owned;
  const designProperties = design.designTypes.filter((item) => item.specificationMode === 'design_property');
  const technicalSpecifications = design.designTypes.filter((item) => item.specificationMode !== 'design_property');
  const showTechnicalImages = design.designTypeImageCards && technicalSpecifications.some((item) => Boolean(item.details.image?.thumbnailUri || item.details.image?.uri));
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setShareMessage('Link copied'); }
    catch { setShareMessage('Copy the URL from your browser'); }
    window.setTimeout(() => setShareMessage(''), 2500);
  };

  return <main className="min-h-screen bg-[#FAF8F5] pb-24">
    {lightboxOpen && gallery[activeImage] && <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 p-4" role="dialog" aria-modal="true" aria-label="Design image preview"><button type="button" onClick={() => setLightboxOpen(false)} aria-label="Close preview" className="absolute right-6 top-6 rounded-full bg-stone-800 p-2 text-white"><X className="h-6 w-6" /></button><img src={gallery[activeImage]} alt={design.title} className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain" /></div>}
    <div className="border-b border-stone-200 bg-white py-3"><div className="mx-auto flex max-w-7xl items-center gap-2 px-4 text-xs text-stone-500 sm:px-6 lg:px-8"><Link to="/">Home</Link><span>/</span><Link to="/explore">Explore</Link><span>/</span><span className="truncate font-medium text-stone-900">{design.title}</span></div></div>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="grid items-start gap-10 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-7"><div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm">{gallery[activeImage] ? <img src={gallery[activeImage]} alt={design.title} className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center text-sm text-stone-400">No preview image</div>} {gallery[activeImage] && <button type="button" onClick={() => setLightboxOpen(true)} className="absolute bottom-4 right-4 rounded-lg bg-stone-950/85 p-2 text-white" aria-label="Open full image"><Maximize2 className="h-5 w-5" /></button>}</div>{gallery.length > 1 && <div className="grid grid-cols-5 gap-3">{gallery.map((image, index) => <button type="button" key={image} onClick={() => setActiveImage(index)} className={`aspect-square overflow-hidden rounded-xl border-2 bg-stone-100 ${activeImage === index ? 'border-amber-700' : 'border-transparent'}`}><img src={image} alt={`${design.title} preview ${index + 1}`} className="h-full w-full object-cover" /></button>)}</div>}
        {design.designTypes.length > 0 && <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="border-b border-stone-200 px-5 py-4 sm:px-6 sm:py-5"><h2 className="font-serif text-2xl font-semibold text-stone-950">Design specifications</h2><p className="mt-1 text-xs text-stone-500">Design properties and production measurements included in this listing.</p></div>
          {designProperties.length > 0 && <div className="p-4 sm:p-5">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800">Design properties</h3>
            <div className="grid gap-3 sm:grid-cols-2">{designProperties.map((item, index) => {
              const image = normalizeAssetUrl(item.details.image?.thumbnailUri || item.details.image?.uri);
              const typeName = item.typeName || item.customTypeName || 'Design type';
              return <article key={`${item.typeId}-${index}`} className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                <div className="aspect-[4/3] bg-stone-100">{image ? <img src={image} alt={`${typeName} design property`} className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center px-4 text-center text-xs text-stone-400">No property image</div>}</div>
                <div className="border-t border-stone-200 bg-white px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">{typeName}</p><p className="mt-1 font-serif text-lg font-semibold text-stone-950">{value(item.details.nameOrNumber)}</p></div>
              </article>;
            })}</div>
          </div>}
          {technicalSpecifications.length > 0 && <div className={designProperties.length > 0 ? 'border-t border-stone-200' : ''}>
            {designProperties.length > 0 && <h3 className="px-5 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800">Technical specifications</h3>}
            <div className="overflow-x-auto"><table className="w-full min-w-[680px] table-fixed text-left text-[11px] sm:text-xs"><thead className="border-b border-stone-200 bg-stone-50 text-[9px] uppercase tracking-wide text-stone-500 sm:text-[10px]"><tr>{showTechnicalImages && <th scope="col" className="w-[12%] px-3 py-3 text-center">Preview</th>}<th scope="col" className="w-[20%] px-3 py-3">Type</th><th scope="col" className="w-[16%] px-3 py-3">Name</th><th scope="col" className="px-3 py-3">Stitches</th><th scope="col" className="px-3 py-3">Needle</th><th scope="col" className="px-3 py-3">Area</th><th scope="col" className="px-3 py-3">Height</th><th scope="col" className="px-3 py-3">Width</th></tr></thead><tbody className="divide-y divide-stone-100">{technicalSpecifications.map((item, index) => {
              const image = normalizeAssetUrl(item.details.image?.thumbnailUri || item.details.image?.uri);
              return <tr key={`${item.typeId}-${index}`} className="align-middle text-stone-700 hover:bg-stone-50/70">{showTechnicalImages && <td className="px-3 py-2 text-center">{image ? <img src={image} alt="" className="mx-auto h-10 w-10 rounded-md border border-stone-200 object-cover" /> : <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-stone-100 text-[8px] leading-tight text-stone-400">No image</span>}</td>}<th scope="row" className="break-words px-3 py-3 font-semibold leading-tight text-stone-950">{item.typeName || item.customTypeName || 'Design type'}</th><td className="break-words px-3 py-3 leading-tight">{value(item.details.nameOrNumber)}</td><td className="break-words px-3 py-3 font-mono leading-tight">{value(item.details.stitchCount)}</td><td className="break-words px-3 py-3 font-mono leading-tight">{value(item.details.needle)}</td><td className="break-words px-3 py-3 font-mono leading-tight">{value(item.details.area, ' mm')}</td><td className="break-words px-3 py-3 font-mono leading-tight">{value(item.details.height, ' mm')}</td><td className="break-words px-3 py-3 font-mono leading-tight">{value(item.details.width, ' mm')}</td></tr>;
            })}</tbody></table></div>
          </div>}
        </section>}
      </div>
      <aside className="space-y-5 lg:sticky lg:top-28 lg:col-span-5"><section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-4 text-xs text-stone-500"><span className="font-semibold uppercase tracking-wider text-amber-900">{design.categoryName || 'Uncategorized'}</span><div className="relative"><button type="button" onClick={share} aria-label="Share design" className="rounded-lg border border-stone-200 p-2"><Share2 className="h-4 w-4" /></button>{shareMessage && <span className="absolute right-0 top-11 z-10 w-max rounded-md bg-stone-950 px-2 py-1 text-[10px] text-white">{shareMessage}</span>}</div></div><h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-stone-950">{design.title}</h1><dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-stone-50 p-4 text-xs"><Spec label="Machine type" data={machineName} /><Spec label="File type" data={design.designFileTypeName || design.designFileExtension?.toUpperCase() || 'Not specified'} /><Spec label="Sequence" data={design.sequenceType || 'Not specified'} /><Spec label="Published" data={design.publishDate || 'Not specified'} /></dl><div className="mt-6 border-t border-stone-100 pt-5"><p className="text-xs uppercase tracking-wider text-stone-400">Price</p><p className="mt-1 font-mono text-3xl font-bold text-stone-950">{design.showPrice ? inr(design.pricePaise) : 'Price hidden'}</p></div>
        <div className="mt-6">{canDownload ? <div className="space-y-3"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950"><p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4" />{owned ? 'This is your design' : 'Purchased and ready'}</p><p className="mt-1 text-xs text-emerald-800">A fresh protected link is created for every download.</p></div>{design.hasFile && <ProtectedDownloadButton type="design" id={design.id} label="Download stitch file" className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white" />}{design.images.map((image, index) => image.downloadUri && <ProtectedDownloadButton key={index} type="design" id={design.id} imageIndex={index} label={`Download image ${index + 1}`} className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-800" />)}</div> : user.isLoggedIn ? <Link to={`/checkout/design/${design.id}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white"><ShoppingBag className="h-4 w-4" />Buy design securely</Link> : <Link to="/auth" state={{ returnTo: `${location.pathname}${location.search}` }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white"><ShoppingBag className="h-4 w-4" />Sign in to purchase</Link>}</div>
        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-stone-500"><FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />Payment status and download permission are checked by the server.</p></section></aside>
    </div>
    {related.length > 0 && <section className="mt-14"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">More to explore</p><h2 className="mt-2 font-serif text-3xl font-semibold text-stone-950">Related designs</h2></div><Link to={`/explore${design.categoryId ? `?category=${encodeURIComponent(design.categoryId)}` : ''}`} className="text-sm font-semibold text-stone-700">View all</Link></div><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <DesignCard key={item.id} design={toDesignCard(item)} />)}</div></section>}
    </div>
  </main>;
};

const Spec: React.FC<{ label: string; data: string }> = ({ label, data }) => <div><dt className="text-stone-500">{label}</dt><dd className="mt-1 font-semibold text-stone-900">{data}</dd></div>;
const DesignDetailSkeleton = () => <main className="mx-auto min-h-[70vh] max-w-7xl animate-pulse px-4 py-10"><div className="grid gap-10 lg:grid-cols-12"><div className="aspect-[4/3] rounded-2xl bg-stone-200 lg:col-span-7" /><div className="h-96 rounded-2xl bg-white lg:col-span-5" /></div></main>;

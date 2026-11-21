import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, Image as ImageIcon, LoaderCircle, Search, UploadCloud, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getErrorMessage, marketplaceApi } from '../../lib/api-client';
import { normalizeAssetUrl } from '../../lib/marketplace-mappers';
import type { ApiImageSearchResult } from '../../types/marketplace';

interface SearchByImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const acceptedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maximumBytes = 10 * 1024 * 1024;

const formatInr = (paise: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(paise / 100);

export const SearchByImageModal: React.FC<SearchByImageModalProps> = ({ isOpen, onClose }) => {
  const { user } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [searching, setSearching] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState<ApiImageSearchResult[]>([]);
  const [engine, setEngine] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !searching) onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose, searching]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  if (!isOpen) return null;

  const searchFile = async (file?: File) => {
    if (!file || searching) return;
    setError('');
    setResults([]);
    setEngine('');

    if (!acceptedTypes.has(file.type)) {
      setError('Choose a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > maximumBytes) {
      setError('The image must not be larger than 10 MB.');
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setFilename(file.name);
    setSearching(true);

    try {
      const response = await marketplaceApi.searchByImage(file);
      setResults(response.data.results);
      setEngine(response.data.engine);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSearching(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="image-search-title">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stone-100 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-800"><ImageIcon className="h-4 w-4" /></span>
            <div>
              <h2 id="image-search-title" className="font-serif text-xl font-bold text-stone-950">Search designs by image</h2>
              <p className="mt-1 text-xs leading-5 text-stone-500">Upload a fabric swatch, border photo or sketch to find visually related designs.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={searching} aria-label="Close image search" className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-40"><X className="h-5 w-5" /></button>
        </div>

        {!user.isLoggedIn ? (
          <div className="p-6 sm:p-10">
            <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-7 text-center">
              <Camera className="mx-auto h-8 w-8 text-amber-800" />
              <h3 className="mt-4 font-serif text-2xl font-semibold text-stone-950">Sign in to search by image</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">Image matching searches the current marketplace catalog and is available to signed-in accounts.</p>
              <Link to="/auth" state={{ returnTo: '/' }} onClick={onClose} className="mt-5 inline-flex rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-900">Continue with mobile OTP</Link>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <div
              onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                void searchFile(event.dataTransfer.files[0]);
              }}
              className={`rounded-2xl border-2 border-dashed p-5 transition sm:p-7 ${dragOver ? 'border-amber-600 bg-amber-50' : 'border-stone-300 bg-stone-50/70'}`}
            >
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:text-left">
                <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-white">
                  {preview ? <img src={preview} alt="Selected search reference" className="h-full w-full object-cover" /> : <UploadCloud className="h-8 w-8 text-stone-400" />}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="font-semibold text-stone-950">{filename || 'Drop an image here or select one from your device'}</p>
                  <p className="mt-1 text-xs text-stone-500">JPG, PNG or WebP · Maximum 10 MB</p>
                  <button type="button" disabled={searching} onClick={() => inputRef.current?.click()} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-900 shadow-sm hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50">
                    {searching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4 text-amber-800" />}
                    {searching ? 'Searching catalog…' : preview ? 'Choose another image' : 'Select image'}
                  </button>
                  <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => void searchFile(event.target.files?.[0])} />
                </div>
              </div>
            </div>

            {error && <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

            {searching && <div className="mt-6 flex items-center justify-center gap-3 rounded-xl border border-stone-200 bg-white p-8 text-sm text-stone-600"><LoaderCircle className="h-5 w-5 animate-spin text-amber-800" />Comparing the image with marketplace designs…</div>}

            {!searching && preview && !error && (
              <section className="mt-7" aria-live="polite">
                <div className="flex items-end justify-between gap-3">
                  <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Visual matches</p><h3 className="mt-1 font-serif text-2xl font-semibold text-stone-950">{results.length} related {results.length === 1 ? 'design' : 'designs'}</h3></div>
                  {engine && <span className="rounded-full bg-stone-100 px-3 py-1 text-[10px] font-medium text-stone-500">Search engine: {engine.replaceAll('_', ' ')}</span>}
                </div>

                {results.length > 0 ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results.map((result) => {
                      const image = normalizeAssetUrl(result.images[0]?.thumbnailUri || result.images[0]?.uri || result.imageUri);
                      return (
                        <Link key={result.id} to={`/design/${result.id}`} onClick={onClose} className="group overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md">
                          <div className="aspect-[4/3] overflow-hidden bg-stone-100">{image ? <img src={image} alt={result.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center text-xs text-stone-400">No preview</div>}</div>
                          <div className="p-4">
                            <div className="flex items-center justify-between gap-2 text-[10px]"><span className="font-bold uppercase tracking-wider text-emerald-700">{result.similarityLabel}</span><span className="font-mono text-stone-500">{result.similarityScore.toFixed(1)}%</span></div>
                            <h4 className="mt-2 line-clamp-2 font-serif text-lg font-semibold leading-6 text-stone-950">{result.title}</h4>
                            <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 text-xs"><span className="truncate text-stone-500">{result.categoryName || 'Uncategorized'}</span><span className="font-mono font-bold text-stone-950">{result.showPrice ? formatInr(result.pricePaise) : 'Price hidden'}</span></div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-dashed border-stone-300 p-10 text-center"><Search className="mx-auto h-6 w-6 text-stone-400" /><p className="mt-3 font-semibold text-stone-800">No close matches found</p><p className="mt-1 text-sm text-stone-500">Try a clearer crop or another textile image.</p></div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { ArrowRight, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CollectionItem } from '../../data/mockData';

interface CollectionCardProps {
  collection: CollectionItem;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => (
  <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:border-stone-300 hover:shadow-md">
    <Link to={`/collections/${collection.id}`} className="relative block aspect-[16/10] overflow-hidden bg-stone-100">
      <img src={collection.coverImage} alt={collection.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-stone-950/90 px-2.5 py-1 text-[11px] font-semibold text-white"><Archive className="h-3.5 w-3.5 text-amber-300" />{collection.designCount} files</span>
    </Link>
    <div className="p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">{collection.category}</p>
      <Link to={`/collections/${collection.id}`} className="mt-2 block line-clamp-2 font-serif text-xl font-semibold text-stone-950 group-hover:text-amber-900">{collection.title}</Link>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">{collection.description}</p>
      <div className="mt-5 flex items-end justify-between gap-3 border-t border-stone-100 pt-4">
        <div><p className="text-[10px] uppercase tracking-wider text-stone-400">Folder price</p><p className="font-mono text-xl font-bold text-stone-950">₹{collection.price.toLocaleString('en-IN')}</p></div>
        <Link to={`/collections/${collection.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-stone-950 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2">View folder <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
    </div>
  </article>
);

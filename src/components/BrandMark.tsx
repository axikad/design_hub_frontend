import { Link } from 'react-router-dom'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return <Link to="/" className="group inline-flex items-center gap-3" aria-label="Textile Design Hub home"><span className="brand-mark" aria-hidden="true"><span /></span>{!compact && <span className="leading-none"><strong className="block font-display text-[17px] tracking-[-0.03em] text-ink">Textile Design</strong><span className="mt-1 block text-[10px] font-bold tracking-[0.24em] text-clay uppercase">Hub</span></span>}</Link>
}

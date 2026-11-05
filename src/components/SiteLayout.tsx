import { Heart, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { BrandMark } from './BrandMark'

const navigation = [{ label: 'Explore', to: '/designs' }, { label: 'Collections', to: '/folders' }, { label: 'Sell your work', to: '/studio' }]

export function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="min-h-screen bg-canvas text-ink">
    <div className="border-b border-ink/10 bg-ink px-4 py-2 text-center text-xs font-semibold tracking-wide text-cream">Production-ready embroidery files from independent textile creators</div>
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-canvas/95 backdrop-blur-xl">
      <div className="page-shell flex h-[76px] items-center justify-between gap-5">
        <BrandMark />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">{navigation.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `text-sm font-semibold transition-colors ${isActive ? 'text-clay' : 'text-ink/65 hover:text-ink'}`}>{item.label}</NavLink>)}</nav>
        <div className="hidden items-center gap-1.5 sm:flex"><Link to="/designs" className="icon-button" aria-label="Search"><Search size={18} /></Link><Link to="/saved" className="icon-button" aria-label="Saved designs"><Heart size={18} /></Link><Link to="/purchases" className="icon-button" aria-label="Purchases"><ShoppingBag size={18} /></Link><Link to="/login" className="ml-2 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-cream transition-transform hover:-translate-y-0.5"><UserRound size={17} /> Sign in</Link></div>
        <button type="button" className="icon-button sm:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {menuOpen && <div className="border-t border-ink/10 bg-canvas px-4 py-4 sm:hidden"><div className="page-shell grid gap-2">{navigation.map((item) => <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-sand">{item.label}</Link>)}<Link to="/login" onClick={() => setMenuOpen(false)} className="mt-2 rounded-xl bg-ink px-4 py-3 text-center text-sm font-bold text-cream">Sign in</Link></div></div>}
    </header>
    <main><Outlet /></main>
    <footer className="mt-24 bg-ink text-cream"><div className="page-shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]"><div><BrandMark compact /><p className="mt-5 max-w-xs text-sm leading-6 text-cream/60">A focused marketplace for textile professionals to discover, sell and safely download machine-ready design files.</p></div><FooterGroup title="Marketplace" links={['Explore designs', 'Collections', 'New arrivals', 'Popular this week']} /><FooterGroup title="Creators" links={['Open My Studio', 'Pricing & commission', 'Seller earnings', 'Creator guidelines']} /><FooterGroup title="Support" links={['Help centre', 'Terms & conditions', 'Privacy policy', 'Refund policy']} /></div><div className="border-t border-cream/10"><div className="page-shell flex flex-col gap-2 py-5 text-xs text-cream/45 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 Textile Design Hub</p><p>Designed for the textile community in India</p></div></div></footer>
  </div>
}

function FooterGroup({ title, links }: { title: string; links: string[] }) {
  return <div><h3 className="text-xs font-bold tracking-[0.18em] text-peach uppercase">{title}</h3><ul className="mt-5 space-y-3">{links.map((link) => <li key={link}><a href="#" className="text-sm text-cream/60 transition-colors hover:text-cream">{link}</a></li>)}</ul></div>
}

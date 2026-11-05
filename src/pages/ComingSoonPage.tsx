import { ArrowLeft, Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const titles: Record<string, string> = { '/designs': 'Explore designs', '/folders': 'Curated collections', '/studio': 'My Studio', '/saved': 'Saved designs', '/purchases': 'Your purchases', '/login': 'Welcome back' }

export function ComingSoonPage() {
  const location = useLocation()
  const title = titles[location.pathname] || (location.pathname.startsWith('/studio') ? 'My Studio' : 'Page in progress')
  return <section className="page-shell grid min-h-[62vh] place-items-center py-20 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-peach text-clay"><Sparkles size={22} /></span><p className="mt-6 text-xs font-bold tracking-[.18em] text-clay uppercase">Foundation ready</p><h1 className="mt-3 font-display text-5xl tracking-[-.05em] text-ink sm:text-6xl">{title}</h1><p className="mx-auto mt-5 max-w-md text-sm leading-6 text-ink/55">This route is prepared and will be connected to the existing DesignHub API in the next implementation slice.</p><Link to="/" className="secondary-button mt-8"><ArrowLeft size={17} /> Back to home</Link></div></section>
}

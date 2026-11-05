import { ArrowRight, BadgeCheck, Download, IndianRupee, Search, ShieldCheck, Sparkles, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PatternArtwork } from '../components/PatternArtwork'

const designs = [
  { name: 'Midnight Garden', type: 'Saree border', price: '₹180', variant: 0 },
  { name: 'Mogra Vine', type: 'Pallu motif', price: '₹145', variant: 1 },
  { name: 'Royal Jaal', type: 'All-over design', price: '₹220', variant: 2 },
  { name: 'Heritage Bloom', type: 'Blouse motif', price: '₹120', variant: 3 },
]

export function HomePage() {
  return <>
    <section className="relative overflow-hidden border-b border-ink/10">
      <div className="page-shell grid min-h-[690px] items-center gap-12 py-16 lg:grid-cols-[1.02fr_.98fr] lg:py-20">
        <div className="relative z-10">
          <p className="eyebrow"><Sparkles size={14} /> The textile design marketplace</p>
          <h1 className="mt-6 max-w-3xl font-display text-[clamp(3.25rem,7vw,6.9rem)] leading-[.86] tracking-[-0.065em] text-ink">Designs made <span className="font-serif italic text-clay">to stitch.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-ink/62 sm:text-lg">Discover production-ready embroidery files from skilled creators. Preview with confidence, pay securely, and download instantly.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link to="/designs" className="primary-button">Explore designs <ArrowRight size={18} /></Link><Link to="/studio" className="secondary-button">Start selling</Link></div>
          <div className="mt-11 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-ink/55"><span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-clay" /> Verified file formats</span><span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-clay" /> Secure payments</span><span className="inline-flex items-center gap-2"><Download size={16} className="text-clay" /> Instant access</span></div>
        </div>
        <div className="hero-gallery relative mx-auto h-[510px] w-full max-w-[570px]">
          <div className="absolute top-0 right-[5%] h-[60%] w-[62%] rotate-[3deg] overflow-hidden rounded-[2rem] border-[7px] border-canvas shadow-2xl"><PatternArtwork variant={0} className="h-full" /></div>
          <div className="absolute bottom-[2%] left-[2%] h-[53%] w-[55%] -rotate-[5deg] overflow-hidden rounded-[2rem] border-[7px] border-canvas shadow-2xl"><PatternArtwork variant={2} className="h-full" /></div>
          <div className="absolute right-[2%] bottom-[5%] z-10 rounded-2xl border border-ink/10 bg-canvas/95 p-4 shadow-xl backdrop-blur"><p className="text-[10px] font-bold tracking-[0.16em] text-ink/45 uppercase">Ready to run</p><p className="mt-1 font-display text-xl text-ink">12 file formats</p><p className="mt-1 text-xs text-ink/50">DST · EMB · PES · JEF</p></div>
          <div className="absolute top-[8%] left-[4%] z-20 grid size-24 place-items-center rounded-full bg-peach text-center text-[11px] font-bold leading-4 text-ink shadow-lg">CURATED<br />QUALITY</div>
        </div>
      </div>
    </section>

    <section className="page-shell relative z-20 -mt-7"><form className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-canvas p-3 shadow-xl shadow-ink/8 sm:flex-row" onSubmit={(event) => event.preventDefault()}><div className="flex flex-1 items-center gap-3 px-3"><Search size={20} className="text-ink/40" /><input className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-ink/35" placeholder="Search saree, blouse, lace, border designs..." /></div><select className="h-12 rounded-xl border border-ink/10 bg-sand px-4 text-sm font-semibold outline-none"><option>All machines</option><option>Embroidery</option><option>Multi-head</option></select><button className="h-12 rounded-xl bg-clay px-7 text-sm font-bold text-white">Search designs</button></form></section>

    <section className="page-shell py-24"><SectionHeading kicker="Fresh from the studio" title="Designs worth discovering" description="Curated files with clear dimensions, stitch counts and compatible machine formats." /><div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{designs.map((design) => <DesignCard key={design.name} {...design} />)}</div><div className="mt-9 text-center"><Link to="/designs" className="text-link">Browse all designs <ArrowRight size={16} /></Link></div></section>

    <section className="bg-ink py-24 text-cream"><div className="page-shell"><SectionHeading light kicker="A simpler workflow" title="From idea to machine in minutes" description="Everything needed to confidently choose, buy and use a textile design." /><div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-cream/10 bg-cream/10 md:grid-cols-3"><Step icon={Search} number="01" title="Find your pattern" text="Filter by machine, category, design type and production measurements." /><Step icon={ShieldCheck} number="02" title="Buy with clarity" text="See the complete price breakdown before making a secure payment." /><Step icon={Download} number="03" title="Download & stitch" text="Get protected access to the purchased files in supported formats." /></div></div></section>

    <section className="page-shell py-24"><div className="relative overflow-hidden rounded-[2.5rem] bg-peach p-8 sm:p-12 lg:p-16"><div className="relative z-10 max-w-2xl"><p className="eyebrow">Built for creators</p><h2 className="mt-5 font-display text-4xl leading-[.95] tracking-[-.045em] sm:text-6xl">Your craft deserves a wider market.</h2><p className="mt-6 max-w-xl text-base leading-7 text-ink/65">Create your studio, publish machine-ready designs, understand the commission before listing, and follow every earning through its settlement cycle.</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/studio" className="primary-button"><Upload size={17} /> Open My Studio</Link><Link to="/studio/earnings" className="secondary-button"><IndianRupee size={17} /> How earnings work</Link></div></div><div className="absolute -right-16 -bottom-24 size-80 rounded-full border-[50px] border-clay/20" /><div className="absolute top-8 right-[22%] size-20 rotate-12 rounded-3xl bg-clay/15" /></div></section>
  </>
}

function SectionHeading({ kicker, title, description, light = false }: { kicker: string; title: string; description: string; light?: boolean }) {
  return <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className={`text-xs font-bold tracking-[.18em] uppercase ${light ? 'text-peach' : 'text-clay'}`}>{kicker}</p><h2 className={`mt-3 max-w-2xl font-display text-4xl tracking-[-.045em] sm:text-5xl ${light ? 'text-cream' : 'text-ink'}`}>{title}</h2></div><p className={`max-w-md text-sm leading-6 ${light ? 'text-cream/55' : 'text-ink/55'}`}>{description}</p></div>
}

function DesignCard({ name, type, price, variant }: { name: string; type: string; price: string; variant: number }) {
  return <Link to="/designs" className="group"><div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand"><PatternArtwork variant={variant} className="h-full transition-transform duration-500 group-hover:scale-105" /><span className="absolute bottom-3 left-3 rounded-full bg-ink/85 px-3 py-1.5 text-[10px] font-bold tracking-wide text-cream uppercase backdrop-blur">Machine ready</span></div><div className="flex items-start justify-between gap-3 pt-4"><div><h3 className="font-display text-xl tracking-[-.02em] text-ink group-hover:text-clay">{name}</h3><p className="mt-1 text-xs text-ink/45">{type}</p></div><strong className="text-sm text-ink">{price}</strong></div></Link>
}

function Step({ icon: Icon, number, title, text }: { icon: typeof Search; number: string; title: string; text: string }) {
  return <div className="bg-ink p-8 sm:p-10"><div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-cream/8 text-peach"><Icon size={19} /></span><span className="font-display text-3xl text-cream/15">{number}</span></div><h3 className="mt-10 font-display text-2xl text-cream">{title}</h3><p className="mt-3 text-sm leading-6 text-cream/50">{text}</p></div>
}

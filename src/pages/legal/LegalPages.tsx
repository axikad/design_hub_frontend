import React, { useState } from 'react';
import { ChevronDown, FileText, HelpCircle, Mail, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const PageShell: React.FC<{ eyebrow: string; title: string; intro: string; children: React.ReactNode }> = ({ eyebrow, title, intro, children }) => (
  <main className="min-h-[70vh] bg-[#FAF8F5] py-14 sm:py-18">
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">{eyebrow}</p>
      <h1 className="mt-3 font-serif text-4xl font-semibold text-stone-950 sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600">{intro}</p>
      <div className="mt-10">{children}</div>
    </div>
  </main>
);

const Notice = () => (
  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
    This page currently contains UI placeholder content. Final business and legal wording must be approved before production launch.
  </div>
);

export const AboutPage: React.FC = () => (
  <PageShell eyebrow="About" title="A focused marketplace for textile design files." intro="Textile Design Hub is being built to help buyers discover design files through practical catalog information and to give creators one place to manage their listings and seller activity.">
    <div className="grid gap-4 sm:grid-cols-3">
      {[['Discover', 'Browse by machine, category, design type and specifications.'], ['Review', 'Open a listing to review its available images, measurements and file information.'], ['Manage', 'Use account and studio workspaces for purchases, designs, folders and wallet activity.']].map(([title, copy]) => <article key={title} className="rounded-2xl border border-stone-200 bg-white p-5"><h2 className="font-serif text-xl font-semibold text-stone-950">{title}</h2><p className="mt-2 text-sm leading-6 text-stone-500">{copy}</p></article>)}
    </div>
  </PageShell>
);

const PolicyPage: React.FC<{ title: string; intro: string; sections: Array<[string, string]> }> = ({ title, intro, sections }) => (
  <PageShell eyebrow="Policy" title={title} intro={intro}>
    <Notice />
    <div className="mt-6 space-y-4">{sections.map(([heading, copy]) => <section key={heading} className="rounded-2xl border border-stone-200 bg-white p-6"><h2 className="font-serif text-xl font-semibold text-stone-950">{heading}</h2><p className="mt-3 text-sm leading-7 text-stone-600">{copy}</p></section>)}</div>
  </PageShell>
);

export const TermsPage: React.FC = () => <PolicyPage title="Terms of service" intro="The final marketplace terms will describe account use, listing ownership, purchases, digital delivery and prohibited activity." sections={[["Marketplace use", "Users must provide accurate information and may access only records and files they are authorized to use."], ["Creator listings", "Creators remain responsible for the rights, accuracy and permitted use of the files they publish."], ["Purchases", "Prices, payment status and download eligibility are determined by the server-side marketplace records."]]} />;

export const PrivacyPage: React.FC = () => <PolicyPage title="Privacy policy" intro="The final privacy policy will explain what data is collected, why it is processed, how long it is retained and how account requests are handled." sections={[["Account data", "The service may process profile, contact, machine-preference and authentication information needed to operate an account."], ["Commerce records", "Purchase and seller-finance records may be retained where required for marketplace integrity, reconciliation and legal obligations."], ["Security", "Sensitive credentials and payment secrets must remain on the server and are never placed in the public frontend bundle."]]} />;

export const RefundPage: React.FC = () => <PolicyPage title="Refund and issue policy" intro="Refund and reversal behavior is still a planned product area and must not be promised by the UI until the backend workflow and business policy are approved." sections={[["Digital products", "The final policy will define when a digital-file issue is eligible for review and what evidence is required."], ["Support review", "Purchase and payment identifiers should be used to locate a request without exposing protected files."], ["Current status", "No automatic refund promise is represented by this UI prototype."]]} />;

const faqItems: Array<[string, string]> = [
  ['Can I browse without signing in?', 'Yes. Public catalog, design and folder browsing is planned for guests. Protected actions require an account.'],
  ['How are filters selected?', 'Browse filters use the active machine, category and design-type catalog maintained by the platform.'],
  ['When can I download a purchased file?', 'Download access is based on server-confirmed ownership or payment status.'],
  ['How are seller balances calculated?', 'Balances, commission, settlement dates and withdrawal eligibility are returned by the backend and are not calculated in the browser.'],
];

export const HelpCenterPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<number | null>(0);
  const visible = faqItems.filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <PageShell eyebrow="Support" title="Help centre" intro="Find quick answers about browsing, purchases, downloads and seller activity.">
      <label className="relative block"><span className="sr-only">Search help topics</span><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search help topics" className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20" /></label>
      <div className="mt-6 space-y-3">{visible.map(([question, answer], index) => <section key={question} className="overflow-hidden rounded-xl border border-stone-200 bg-white"><button type="button" onClick={() => setOpen(open === index ? null : index)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-700" aria-expanded={open === index}>{question}<ChevronDown className={`h-4 w-4 shrink-0 transition ${open === index ? 'rotate-180' : ''}`} /></button>{open === index && <p className="border-t border-stone-100 px-5 py-4 text-sm leading-6 text-stone-600">{answer}</p>}</section>)}</div>
      {visible.length === 0 && <div className="mt-6 rounded-xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500">No matching help topic.</div>}
    </PageShell>
  );
};

export const ContactPage: React.FC = () => (
  <PageShell eyebrow="Support" title="Contact support" intro="The final contact channel and service hours will be configured before production launch.">
    <div className="grid gap-5 sm:grid-cols-2">
      <article className="rounded-2xl border border-stone-200 bg-white p-6"><Mail className="h-6 w-6 text-amber-800" /><h2 className="mt-4 font-serif text-xl font-semibold">Email support</h2><p className="mt-2 text-sm leading-6 text-stone-500">A support address will be shown here when the support workflow is enabled.</p></article>
      <article className="rounded-2xl border border-stone-200 bg-white p-6"><FileText className="h-6 w-6 text-amber-800" /><h2 className="mt-4 font-serif text-xl font-semibold">Order help</h2><p className="mt-2 text-sm leading-6 text-stone-500">Keep your purchase or payment identifier ready when reporting a checkout or download issue.</p></article>
    </div>
  </PageShell>
);

export const NotFoundPage: React.FC = () => (
  <main className="flex min-h-[65vh] items-center justify-center bg-[#FAF8F5] px-4 text-center">
    <div><HelpCircle className="mx-auto h-10 w-10 text-amber-800" /><p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-amber-800">404</p><h1 className="mt-2 font-serif text-4xl font-semibold text-stone-950">Page not found</h1><p className="mt-3 text-sm text-stone-500">The page may have moved or the address may be incorrect.</p><Link to="/" className="mt-6 inline-flex rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-900">Back to home</Link></div>
  </main>
);

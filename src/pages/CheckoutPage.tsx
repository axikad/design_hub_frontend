import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, CreditCard, LoaderCircle, LockKeyhole, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ProtectedDownloadButton } from '../components/common/ProtectedDownloadButton';
import { useApp } from '../context/AppContext';
import { indiaGstStates } from '../data/indiaGstStates';
import { commerceApi, getErrorMessage } from '../lib/api-client';
import { createRazorpay, loadRazorpay, type RazorpayFailureResponse, type RazorpaySuccessResponse } from '../lib/razorpay';
import type { CheckoutItemType, CheckoutPreview, PurchaseStatus } from '../types/commerce';

type ScreenState = 'loading' | 'ready' | 'creating' | 'gateway' | 'verifying' | 'pending' | 'paid' | 'error';

const money = (paise: number, currency = 'INR') => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency, maximumFractionDigits: 2,
}).format(paise / 100);
const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export const CheckoutPage: React.FC = () => {
  const { type: rawType = 'design', id = '' } = useParams<{ type: string; id: string }>();
  const type: CheckoutItemType = rawType === 'folder' || rawType === 'collection' ? 'folder' : 'design';
  const { user, showToast, refreshAccountData } = useApp();
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [purchase, setPurchase] = useState<PurchaseStatus | null>(null);
  const [screen, setScreen] = useState<ScreenState>('loading');
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [billingState, setBillingState] = useState(user.taxStateCode);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    return () => { activeRef.current = false; };
  }, []);

  const applyStatus = useCallback(async (status: PurchaseStatus) => {
    if (!activeRef.current) return status;
    setPurchase(status);
    if (status.status === 'paid') {
      setScreen('paid');
      if (type === 'design') await refreshAccountData().catch(() => undefined);
    } else if (status.status === 'pending') setScreen('pending');
    else setScreen('ready');
    return status;
  }, [refreshAccountData, type]);

  const reconcile = useCallback(async (silent = false) => {
    if (!silent) { setError(''); setScreen('loading'); }
    try {
      const response = await commerceApi.purchaseStatus(type, id);
      return await applyStatus(response.data);
    } catch (requestError) {
      if (!silent && activeRef.current) { setError(getErrorMessage(requestError)); setScreen('error'); }
      return null;
    }
  }, [applyStatus, id, type]);

  useEffect(() => {
    const controller = new AbortController();
    setScreen('loading'); setError(''); setPreview(null); setPurchase(null);
    if (!billingState) {
      setScreen('ready');
      return () => controller.abort();
    }
    (async () => {
      try {
        const previewResponse = await commerceApi.checkoutPreview(type, id, billingState, controller.signal);
        if (controller.signal.aborted) return;
        setPreview(previewResponse.data);
        const statusResponse = await commerceApi.purchaseStatus(type, id, controller.signal);
        if (!controller.signal.aborted) await applyStatus(statusResponse.data);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        if (activeRef.current) { setError(getErrorMessage(requestError)); setScreen('error'); }
      }
    })();
    return () => controller.abort();
  }, [applyStatus, billingState, id, reloadKey, type]);

  const pollUntilSettled = useCallback(async () => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const status = await reconcile(true);
      if (!status || status.status === 'paid' || status.status === 'unpaid') return status;
      await wait(1500);
    }
    if (activeRef.current) setScreen('pending');
    return null;
  }, [reconcile]);

  const verifyPayment = useCallback(async (response: RazorpaySuccessResponse) => {
    setScreen('verifying'); setError('');
    try {
      const verified = await commerceApi.verify(type, id, response);
      await applyStatus(verified.data);
      if (verified.data.status === 'paid') showToast('Payment successful', 'Your purchase is confirmed and the protected download is ready.', 'success');
      else await pollUntilSettled();
    } catch (requestError) {
      const latest = await reconcile(true);
      if (latest?.status !== 'paid' && activeRef.current) {
        setError(getErrorMessage(requestError));
        setScreen(latest?.status === 'pending' ? 'pending' : 'error');
      }
    }
  }, [applyStatus, id, pollUntilSettled, reconcile, showToast, type]);

  const beginPayment = async () => {
    if (!preview || ['creating', 'gateway', 'verifying'].includes(screen)) return;
    setScreen('creating'); setError('');
    try {
      await loadRazorpay();
      const response = await commerceApi.createOrder(type, id, billingState);
      const order = response.data;
      setPreview(order.checkoutBreakdown);
      let callbackStarted = false;
      const razorpay = createRazorpay({
        key: order.keyId, amount: order.amount, currency: order.currency, order_id: order.orderId,
        name: 'Textile Design Hub', description: order.checkoutBreakdown.item.name,
        prefill: { name: user.name, email: user.email || undefined, contact: user.phone || undefined },
        theme: { color: '#1c1917' },
        modal: { confirm_close: true, ondismiss: () => {
          if (callbackStarted) return;
          void (async () => {
            const latest = await reconcile(true);
            if (!latest || latest.status === 'unpaid') {
              setScreen('ready');
              showToast('Checkout closed', 'No confirmed payment was found. You can safely try again.', 'info');
            }
          })();
        } },
        handler: (payment) => { callbackStarted = true; void verifyPayment(payment); },
      });
      razorpay.on('payment.failed', (failure: RazorpayFailureResponse) => {
        callbackStarted = true;
        const message = failure.error?.description || failure.error?.reason || 'The payment was not completed.';
        void (async () => {
          const latest = await reconcile(true);
          if (latest?.status !== 'paid') { setError(message); setScreen(latest?.status === 'pending' ? 'pending' : 'error'); }
        })();
      });
      setScreen('gateway');
      razorpay.open();
    } catch (requestError) {
      setError(getErrorMessage(requestError)); setScreen('error');
    }
  };

  const backPath = type === 'design' ? `/design/${id}` : `/collections/${id}`;
  const taxLines = useMemo(() => preview?.taxes.lines ?? [], [preview]);

  if (!billingState) return <BillingStateSelection backPath={backPath} onSelect={setBillingState} />;
  if (screen === 'loading' && !preview) return <CheckoutLoading />;
  if (!preview) return <main className="mx-auto min-h-[60vh] max-w-xl px-4 py-16"><div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-900"><AlertCircle className="mx-auto h-9 w-9" /><h1 className="mt-4 font-serif text-2xl font-semibold">Checkout unavailable</h1><p className="mt-2 text-sm leading-6">{error || 'The server could not prepare this checkout.'}</p><div className="mt-6 flex justify-center gap-3"><Link to={backPath} className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold">Go back</Link><button type="button" onClick={() => setReloadKey((value) => value + 1)} className="rounded-lg bg-rose-900 px-4 py-2 text-sm font-semibold text-white">Try again</button></div></div></main>;
  const busy = ['creating', 'gateway', 'verifying', 'loading'].includes(screen);

  return <main className="min-h-screen bg-[#FAF8F5] px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl space-y-6">
    <Link to={backPath} className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-950"><ArrowLeft className="h-4 w-4" />Back to {type === 'design' ? 'design' : 'folder'}</Link>
    {preview.isTestMode && <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between"><span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4" /><strong>Test mode:</strong> No real money will be transferred.</span><span className="w-fit rounded-full bg-amber-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">{preview.paymentEnvironment}</span></div>}
    {screen === 'paid' ? <PaidCheckout type={type} id={id} preview={preview} purchase={purchase} /> : <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Secure checkout</p><h1 className="mt-2 font-serif text-3xl font-semibold text-stone-950">Complete your purchase</h1></div><LockKeyhole className="h-6 w-6 text-emerald-700" /></div><div className="mt-7 rounded-xl border border-stone-200 bg-stone-50 p-5"><p className="text-xs uppercase tracking-wider text-stone-500">{preview.item.type}</p><h2 className="mt-2 font-serif text-xl font-semibold text-stone-950">{preview.item.name}</h2></div>
        {screen === 'pending' && <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950"><p className="flex items-center gap-2 font-semibold"><Clock3 className="h-4 w-4" />Payment confirmation is pending</p><p className="mt-1 text-xs leading-5 text-sky-800">Do not pay again yet. Ask the server to check Razorpay for the latest status.</p></div>}
        {error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><p className="flex items-center gap-2 font-semibold"><AlertCircle className="h-4 w-4" />Payment was not completed</p><p className="mt-1 text-xs leading-5">{error}</p></div>}
        <div className="mt-6 space-y-3"><button type="button" onClick={() => void beginPayment()} disabled={busy || screen === 'pending'} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-5 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}{screen === 'creating' ? 'Creating secure order…' : screen === 'gateway' ? 'Razorpay is open…' : screen === 'verifying' ? 'Verifying payment…' : `Pay ${money(preview.totalPayablePaise, preview.currency)} with Razorpay`}</button>{screen === 'pending' && <button type="button" onClick={() => void reconcile()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800"><RefreshCw className="h-4 w-4" />Check payment status</button>}{screen === 'error' && <button type="button" onClick={() => { setError(''); setScreen('ready'); }} className="w-full rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800">Try checkout again</button>}</div><p className="mt-5 flex items-start gap-2 text-xs leading-5 text-stone-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />Your final amount and payment result come directly from the server and Razorpay. DesignHub never stores card or UPI credentials.</p></section>
      <aside className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"><h2 className="font-serif text-xl font-semibold text-stone-950">Order summary</h2><label className="mt-5 block text-xs font-semibold text-stone-600">Billing state<select value={billingState} onChange={(event) => setBillingState(event.target.value)} className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-amber-700">{indiaGstStates.map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}</select></label>{preview.taxes.enabled && <p className="mt-2 text-[11px] text-stone-500">{preview.taxes.supplyType === 'intra_state' ? 'Same-state supply: CGST + SGST' : 'Interstate supply: IGST'}</p>}<dl className="mt-6 space-y-3 text-sm"><div className="flex justify-between gap-4 text-stone-600"><dt>Design/folder price</dt><dd className="font-mono text-stone-900">{money(preview.itemPricePaise, preview.currency)}</dd></div>{taxLines.map((line, index) => <div key={line.type ?? index} className="flex justify-between gap-4 text-stone-600"><dt>{line.label || line.name || `Tax ${index + 1}`}{typeof line.percent === 'number' ? ` (${line.percent}%)` : ''}</dt><dd className="font-mono text-stone-900">{money(line.amountPaise, preview.currency)}</dd></div>)}{preview.taxes.enabled && taxLines.length === 0 && <div className="flex justify-between gap-4 text-stone-600"><dt>India GST</dt><dd className="font-mono text-stone-900">{money(preview.taxes.totalPaise, preview.currency)}</dd></div>}{preview.buyerFee.enabled && <div className="flex justify-between gap-4 text-stone-600"><dt>Buyer fee</dt><dd className="font-mono text-stone-900">{money(preview.buyerFee.amountPaise, preview.currency)}</dd></div>}<div className="flex justify-between gap-4 border-t border-stone-200 pt-4 text-base font-bold text-stone-950"><dt>Total payable</dt><dd className="font-mono">{money(preview.totalPayablePaise, preview.currency)}</dd></div></dl><div className="mt-6 rounded-xl bg-stone-50 p-4 text-xs leading-5 text-stone-600">{preview.notice}</div></aside>
    </div>}
  </div></main>;
};

const PaidCheckout: React.FC<{ type: CheckoutItemType; id: string; preview: CheckoutPreview; purchase: PurchaseStatus | null }> = ({ type, id, preview, purchase }) => <section className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" /><p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Payment confirmed</p><h1 className="mt-2 font-serif text-3xl font-semibold text-stone-950">Your files are ready</h1><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-600">{preview.item.name} is linked to your account. Download links are generated securely and expire after a short time.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><ProtectedDownloadButton type={type} id={id} label={type === 'design' ? 'Download stitch file' : 'Download folder archive'} className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white" />{type === 'design' && <Link to="/account/purchases" className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800">View purchases</Link>}</div>{purchase?.purchaseId && <p className="mt-5 font-mono text-xs text-stone-400">Purchase {purchase.purchaseId}</p>}</section>;
const CheckoutLoading = () => <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-12"><div className="grid animate-pulse gap-6 lg:grid-cols-[1.15fr_0.85fr]"><div className="h-96 rounded-2xl border border-stone-200 bg-white" /><div className="h-72 rounded-2xl border border-stone-200 bg-white" /></div></main>;
const BillingStateSelection: React.FC<{ backPath: string; onSelect: (value: string) => void }> = ({ backPath, onSelect }) => <main className="min-h-[65vh] bg-[#FAF8F5] px-4 py-12"><section className="mx-auto max-w-lg rounded-2xl border border-stone-200 bg-white p-7 shadow-sm"><Link to={backPath} className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600"><ArrowLeft className="h-4 w-4" />Go back</Link><p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-amber-800">India GST</p><h1 className="mt-2 font-serif text-3xl font-semibold text-stone-950">Select your billing state</h1><p className="mt-3 text-sm leading-6 text-stone-600">Your state is required to calculate the correct CGST + SGST or IGST breakdown before payment.</p><select defaultValue="" onChange={(event) => event.target.value && onSelect(event.target.value)} className="mt-6 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm outline-none focus:border-amber-700"><option value="" disabled>Select state or union territory</option>{indiaGstStates.map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}</select></section></main>;

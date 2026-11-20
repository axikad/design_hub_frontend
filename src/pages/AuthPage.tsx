import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, Cpu, Loader2, Phone, RotateCcw, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError, authApi } from '../lib/api-client';
import type { AccountMachine, AuthPayload } from '../types/account';
import { useApp } from '../context/AppContext';

type Mode = 'login' | 'register';
type Step = 'details' | 'otp';

export const AuthPage: React.FC = () => {
  const { user, authReady, establishSession, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = useMemo(() => {
    const value = (location.state as { returnTo?: string } | null)?.returnTo;
    return value?.startsWith('/') ? value : '/account';
  }, [location.state]);
  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('details');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [name, setName] = useState('');
  const [machines, setMachines] = useState<AccountMachine[]>([]);
  const [machineIds, setMachineIds] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingMachines, setLoadingMachines] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (mode !== 'register' || machines.length > 0) return;
    const controller = new AbortController();
    setLoadingMachines(true);
    authApi.registrationMachines(controller.signal)
      .then((response) => setMachines(response.data))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not load machines.'))
      .finally(() => setLoadingMachines(false));
    return () => controller.abort();
  }, [mode, machines.length]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setInterval(() => setResendSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  if (authReady && user.isLoggedIn) return <Navigate to={returnTo} replace />;

  const payload = (): AuthPayload => ({
    flow: mode,
    name: mode === 'register' ? name.trim() : null,
    countryCode,
    mobileNumber: mobileNumber.replace(/\D/g, ''),
    ...(mode === 'register' ? { machineIds } : {}),
  });

  const reportError = (requestError: unknown) => {
    if (requestError instanceof ApiError) {
      setError(requestError.message);
      setFieldErrors(requestError.errors ?? {});
    } else {
      setError('Unable to complete the request. Please try again.');
    }
  };

  const requestOtp = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      await authApi.requestOtp(payload());
      setStep('otp');
      setCode('');
      setResendSeconds(30);
      showToast('OTP sent', `Verification code sent to ${countryCode} ${mobileNumber}.`, 'success');
    } catch (requestError) {
      reportError(requestError);
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      const response = await authApi.verifyOtp({ ...payload(), code });
      await establishSession(response.data);
      navigate(returnTo, { replace: true });
    } catch (requestError) {
      reportError(requestError);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setStep('details');
    setError('');
    setFieldErrors({});
    setCode('');
  };

  const fieldError = (key: string) => fieldErrors[key]?.[0];

  return (
    <main className="flex min-h-[calc(100vh-9rem)] items-center justify-center bg-[#FAF8F5] px-4 py-14">
      <section className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl sm:p-8" aria-labelledby="auth-title">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-stone-950 font-serif text-xl font-bold text-amber-300">T</div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Secure marketplace account</p>
          <h1 id="auth-title" className="mt-2 font-serif text-2xl font-bold text-stone-950">{step === 'otp' ? 'Verify your mobile' : mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mt-2 text-sm text-stone-500">{step === 'otp' ? `Enter the 4-digit code sent to ${countryCode} ${mobileNumber}.` : 'Use mobile OTP to access purchases, saved designs and creator tools.'}</p>
        </div>

        {error && <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{error}</div>}

        {step === 'details' ? (
          <form onSubmit={requestOtp} className="mt-7 space-y-5">
            <div className="grid grid-cols-2 rounded-xl bg-stone-100 p-1 text-xs font-semibold">
              <button type="button" onClick={() => switchMode('login')} className={`rounded-lg px-3 py-2.5 ${mode === 'login' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500'}`}>Sign in</button>
              <button type="button" onClick={() => switchMode('register')} className={`rounded-lg px-3 py-2.5 ${mode === 'register' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500'}`}>Register</button>
            </div>

            {mode === 'register' && <label className="block text-sm font-semibold text-stone-700">Name or studio name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="mt-1.5 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20" placeholder="Your name" />{fieldError('name') && <span className="mt-1 block text-xs text-rose-700">{fieldError('name')}</span>}</label>}

            <label className="block text-sm font-semibold text-stone-700">Mobile number<div className="mt-1.5 flex gap-2"><select value={countryCode} onChange={(event) => setCountryCode(event.target.value)} className="w-28 rounded-xl border border-stone-300 bg-stone-50 px-2 py-3 text-sm"><option value="+91">India +91</option><option value="+1">USA +1</option><option value="+44">UK +44</option><option value="+971">UAE +971</option><option value="+880">BD +880</option></select><div className="relative min-w-0 flex-1"><Phone className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" /><input value={mobileNumber} onChange={(event) => setMobileNumber(event.target.value)} inputMode="tel" autoComplete="tel-national" className="w-full rounded-xl border border-stone-300 bg-stone-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20" placeholder="9876543210" /></div></div>{fieldError('mobileNumber') && <span className="mt-1 block text-xs text-rose-700">{fieldError('mobileNumber')}</span>}</label>

            {mode === 'register' && <fieldset><legend className="text-sm font-semibold text-stone-700">Machines you work with</legend><p className="mt-1 text-xs text-stone-500">Select at least one. This controls your marketplace catalog.</p>{loadingMachines ? <div className="mt-3 flex items-center gap-2 text-sm text-stone-500"><Loader2 className="h-4 w-4 animate-spin" />Loading machines…</div> : <div className="mt-3 grid max-h-56 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">{machines.map((machine) => { const selected = machineIds.includes(machine.id); return <button key={machine.id} type="button" onClick={() => setMachineIds((previous) => selected ? previous.filter((id) => id !== machine.id) : [...previous, machine.id])} className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs font-semibold ${selected ? 'border-amber-400 bg-amber-50 text-amber-950' : 'border-stone-200 bg-stone-50 text-stone-700'}`}><span className="flex items-center gap-2"><Cpu className="h-4 w-4" />{machine.name}</span>{selected && <Check className="h-4 w-4" />}</button>; })}</div>}{fieldError('machineIds') && <span className="mt-2 block text-xs text-rose-700">{fieldError('machineIds')}</span>}</fieldset>}

            <button type="submit" disabled={submitting || (mode === 'register' && loadingMachines)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}{mode === 'login' ? 'Send login OTP' : 'Send registration OTP'}</button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="mt-7 space-y-5">
            <button type="button" onClick={() => setStep('details')} className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900"><ChevronLeft className="h-4 w-4" />Change details</button>
            <label className="block text-sm font-semibold text-stone-700">Verification code<input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" autoComplete="one-time-code" autoFocus className="mt-2 w-full rounded-xl border-2 border-stone-300 bg-stone-50 px-4 py-4 text-center font-mono text-2xl font-bold tracking-[0.6em] outline-none focus:border-amber-700" placeholder="0000" />{fieldError('code') && <span className="mt-1 block text-xs text-rose-700">{fieldError('code')}</span>}</label>
            <div className="flex items-center justify-between text-xs text-stone-500"><span>Code expires after the server OTP window.</span><button type="button" disabled={resendSeconds > 0 || submitting} onClick={() => void requestOtp()} className="inline-flex items-center gap-1 font-semibold text-amber-900 disabled:text-stone-400"><RotateCcw className="h-3.5 w-3.5" />{resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend OTP'}</button></div>
            <button type="submit" disabled={submitting || code.length !== 4} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}Verify and continue</button>
          </form>
        )}

        <p className="mt-7 text-center text-xs leading-5 text-stone-500">By continuing, you agree to the <Link to="/terms" className="font-semibold text-amber-900">terms</Link> and <Link to="/privacy" className="font-semibold text-amber-900">privacy policy</Link>.</p>
      </section>
    </main>
  );
};

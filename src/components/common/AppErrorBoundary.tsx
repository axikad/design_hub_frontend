import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { reportClientError } from '../../lib/error-reporting';

interface State { hasError: boolean }

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportClientError({ kind: 'render', message: error.message, componentStack: info.componentStack ?? undefined });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 py-16">
        <section className="w-full max-w-lg rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm" role="alert">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-700"><AlertTriangle className="h-6 w-6" /></span>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-stone-950">This page could not be displayed</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">Your account data has not been changed. Reload the application or return to the marketplace.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" />Reload</button>
            <a href="/" className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-800">Back to marketplace</a>
          </div>
        </section>
      </main>
    );
  }
}

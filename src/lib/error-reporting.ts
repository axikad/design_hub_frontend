interface ClientErrorReport {
  kind: 'render' | 'window' | 'promise';
  message: string;
  componentStack?: string;
  appVersion?: string;
  occurredAt: string;
}

const endpoint = import.meta.env.VITE_ERROR_REPORTING_URL?.trim();
const appVersion = import.meta.env.VITE_APP_VERSION?.trim();

export const reportClientError = (report: Omit<ClientErrorReport, 'occurredAt' | 'appVersion'>) => {
  if (!endpoint || import.meta.env.DEV) return;
  const payload: ClientErrorReport = {
    ...report,
    appVersion: appVersion || undefined,
    occurredAt: new Date().toISOString(),
  };
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }));
    return;
  }
  void fetch(endpoint, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    credentials: 'omit',
  }).catch(() => undefined);
};

export const installGlobalErrorReporting = () => {
  const onError = (event: ErrorEvent) => reportClientError({ kind: 'window', message: event.message || 'Unknown browser error' });
  const onRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    reportClientError({ kind: 'promise', message: reason instanceof Error ? reason.message : String(reason || 'Unhandled promise rejection') });
  };
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
};

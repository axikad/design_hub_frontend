const DEPLOY_QUERY_KEY = '__deploy';
const CHECK_INTERVAL_MS = 60_000;

const currentEntryScript = () => {
  const script = document.querySelector<HTMLScriptElement>('script[type="module"][src]');
  return script ? new URL(script.src, window.location.href).pathname : '';
};

const entryScriptFromHtml = (html: string) => {
  const documentCopy = new DOMParser().parseFromString(html, 'text/html');
  const script = documentCopy.querySelector<HTMLScriptElement>('script[type="module"][src]');
  return script ? new URL(script.getAttribute('src') || '', window.location.origin).pathname : '';
};

const reloadLatestBuild = () => {
  const url = new URL(window.location.href);
  url.searchParams.set(DEPLOY_QUERY_KEY, Date.now().toString());
  window.location.replace(url.toString());
};

export const installDeployRefresh = () => {
  // Vite uses /src/main.tsx during local development. Deployment polling is
  // only useful for a production build with a fingerprinted entry file.
  const loadedEntry = currentEntryScript();
  if (!loadedEntry.startsWith('/assets/')) return;

  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.has(DEPLOY_QUERY_KEY)) {
    currentUrl.searchParams.delete(DEPLOY_QUERY_KEY);
    window.history.replaceState(window.history.state, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
  }

  let checking = false;
  let reloading = false;

  const checkForDeployment = async () => {
    if (checking || reloading || document.visibilityState === 'hidden') return;
    checking = true;

    try {
      const response = await fetch(`/?${DEPLOY_QUERY_KEY}=${Date.now()}`, {
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!response.ok) return;

      const latestEntry = entryScriptFromHtml(await response.text());
      if (latestEntry && latestEntry !== loadedEntry) {
        reloading = true;
        reloadLatestBuild();
      }
    } catch {
      // A temporary network failure must not interrupt the current session.
    } finally {
      checking = false;
    }
  };

  const interval = window.setInterval(checkForDeployment, CHECK_INTERVAL_MS);
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') void checkForDeployment();
  };
  const onPageShow = () => void checkForDeployment();
  const onPreloadError = (event: Event) => {
    // An older open tab can request a chunk removed by a newer deployment.
    // Reload through a unique URL so intermediary caches cannot serve the old shell.
    event.preventDefault();
    if (!reloading) {
      reloading = true;
      reloadLatestBuild();
    }
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pageshow', onPageShow);
  window.addEventListener('vite:preloadError', onPreloadError);

  return () => {
    window.clearInterval(interval);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pageshow', onPageShow);
    window.removeEventListener('vite:preloadError', onPreloadError);
  };
};

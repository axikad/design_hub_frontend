/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { ToastContainer } from './components/common/ToastContainer';

const page = <T extends Record<string, React.ComponentType>>(load: () => Promise<T>, name: keyof T) =>
  lazy(async () => ({ default: (await load())[name] }));

const HomePage = page(() => import('./pages/HomePage'), 'HomePage');
const ExplorePage = page(() => import('./pages/ExplorePage'), 'ExplorePage');
const DesignDetailsPage = page(() => import('./pages/DesignDetailsPage'), 'DesignDetailsPage');
const CollectionsPage = page(() => import('./pages/CollectionsPage'), 'CollectionsPage');
const CollectionDetailPage = page(() => import('./pages/CollectionDetailPage'), 'CollectionDetailPage');
const CheckoutPage = page(() => import('./pages/CheckoutPage'), 'CheckoutPage');
const AuthPage = page(() => import('./pages/AuthPage'), 'AuthPage');
const BuyerAccountPage = page(() => import('./pages/BuyerAccountPage'), 'BuyerAccountPage');
const PurchasesPage = page(() => import('./pages/PurchasesPage'), 'PurchasesPage');
const StudioDashboardPage = page(() => import('./pages/studio/StudioDashboardPage'), 'StudioDashboardPage');
const MyDesignsPage = page(() => import('./pages/studio/MyDesignsPage'), 'MyDesignsPage');
const AddEditDesignPage = page(() => import('./pages/studio/AddEditDesignPage'), 'AddEditDesignPage');
const MyCollectionsPage = page(() => import('./pages/studio/MyCollectionsPage'), 'MyCollectionsPage');
const SellerWalletPage = page(() => import('./pages/studio/SellerWalletPage'), 'SellerWalletPage');
const AboutPage = page(() => import('./pages/legal/LegalPages'), 'AboutPage');
const TermsPage = page(() => import('./pages/legal/LegalPages'), 'TermsPage');
const PrivacyPage = page(() => import('./pages/legal/LegalPages'), 'PrivacyPage');
const RefundPage = page(() => import('./pages/legal/LegalPages'), 'RefundPage');
const HelpCenterPage = page(() => import('./pages/legal/LegalPages'), 'HelpCenterPage');
const ContactPage = page(() => import('./pages/legal/LegalPages'), 'ContactPage');
const NotFoundPage = page(() => import('./pages/legal/LegalPages'), 'NotFoundPage');

const routeTitles: Record<string, string> = {
  '/': 'Textile Design Hub',
  '/explore': 'Explore designs',
  '/collections': 'Design folders',
  '/auth': 'Sign in',
  '/account': 'My account',
  '/account/purchases': 'My purchases',
  '/studio': 'My studio',
  '/studio/designs': 'My designs',
  '/studio/collections': 'My folders',
  '/studio/wallet': 'Wallet & settlements',
};

const RouteEffects = () => {
  const { pathname } = useLocation();
  const firstRender = useRef(true);
  useEffect(() => {
    window.scrollTo(0, 0);
    const exactTitle = routeTitles[pathname];
    const sectionTitle = pathname.startsWith('/design/') ? 'Design details' : pathname.startsWith('/collections/') ? 'Folder details' : undefined;
    document.title = `${exactTitle || sectionTitle || 'Textile Design Hub'} | Textile Design Hub`;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.requestAnimationFrame(() => document.getElementById('main-content')?.focus());
  }, [pathname]);
  return null;
};

const PageLoading = () => (
  <div className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center px-4" role="status" aria-live="polite">
    <div className="flex items-center gap-3 text-sm text-stone-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-amber-800" />Loading page…</div>
  </div>
);

const RequireAccount: React.FC<{ children: React.ReactNode; seller?: boolean }> = ({ children, seller = false }) => {
  const { user, authReady } = useApp();
  const location = useLocation();
  if (!authReady) return <PageLoading />;
  if (!user.isLoggedIn) return <Navigate to="/auth" replace state={{ returnTo: `${location.pathname}${location.search}` }} />;
  if (seller && user.role !== 'seller') return <div className="mx-auto flex min-h-[55vh] max-w-xl items-center px-4 py-16"><div className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">403 · Permission required</p><h1 className="mt-3 font-serif text-2xl font-semibold text-stone-950">Creator access is not enabled</h1><p className="mt-2 text-sm leading-6 text-stone-600">Your account is signed in, but it does not have permission to use seller tools.</p></div></div>;
  return <>{children}</>;
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <RouteEffects />
        <div className="flex flex-col min-h-screen text-stone-900 bg-[#FAF8F5]">
          <a href="#main-content" className="sr-only z-[100] rounded-lg bg-stone-950 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to main content</a>
          <Header />
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-[11px] font-medium text-amber-950">
            Live marketplace catalog, secure Razorpay checkout and protected buyer downloads
          </div>
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            <Suspense fallback={<PageLoading />}>
            <Routes>
              {/* Public Discovery Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/design/:id" element={<DesignDetailsPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collections/:id" element={<CollectionDetailPage />} />
              <Route path="/creator/:id" element={<Navigate to="/explore" replace />} />

              {/* Checkout & Commerce */}
              <Route path="/checkout/:type/:id" element={<RequireAccount><CheckoutPage /></RequireAccount>} />

              {/* Authentication */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Buyer Account */}
              <Route path="/account" element={<RequireAccount><BuyerAccountPage /></RequireAccount>} />
              <Route path="/account/purchases" element={<RequireAccount><PurchasesPage /></RequireAccount>} />

              {/* Seller Studio */}
              <Route path="/studio" element={<RequireAccount seller><StudioDashboardPage /></RequireAccount>} />
              <Route path="/studio/designs" element={<RequireAccount seller><MyDesignsPage /></RequireAccount>} />
              <Route path="/studio/designs/new" element={<RequireAccount seller><AddEditDesignPage /></RequireAccount>} />
              <Route path="/studio/designs/edit/:id" element={<RequireAccount seller><AddEditDesignPage /></RequireAccount>} />
              <Route path="/studio/collections" element={<RequireAccount seller><MyCollectionsPage /></RequireAccount>} />
              <Route path="/studio/wallet" element={<RequireAccount seller><SellerWalletPage /></RequireAccount>} />

              {/* Settings, Legal & Support */}
              <Route path="/settings" element={<RequireAccount><Navigate to="/account?tab=security" replace /></RequireAccount>} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/refund" element={<RefundPage />} />
              <Route path="/help" element={<HelpCenterPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </Suspense>
          </main>
          <Footer />
          <MobileBottomNav />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

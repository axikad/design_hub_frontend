import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  CollectionItem,
  CreatorItem,
  DesignItem,
  PurchaseRecord,
  COLLECTIONS as INITIAL_COLLECTIONS,
  CREATORS,
  DESIGNS as INITIAL_DESIGNS,
} from '../data/mockData';
import { accountApi, ApiError, authApi, sessionToken } from '../lib/api-client';
import { normalizeAssetUrl } from '../lib/marketplace-mappers';
import type { ApiPurchase, ApiUser, AuthResult } from '../types/account';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  message?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  avatar: string;
  role: 'buyer' | 'seller';
  machinePreferences: string[];
  settlementMode: 'manual' | 'automatic';
  isLoggedIn: boolean;
  bankAccount: string;
  companyName: string;
  gstNumber: string;
  location: string;
  permissions: string[];
}

interface AppContextType {
  user: UserProfile;
  designs: DesignItem[];
  collections: CollectionItem[];
  creators: CreatorItem[];
  savedDesignIds: string[];
  purchases: PurchaseRecord[];
  toasts: ToastMessage[];
  authReady: boolean;
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  toggleSaveDesign: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
  isPurchased: (id: string) => boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  establishSession: (result: AuthResult) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshAccountData: () => Promise<void>;
  logout: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const emptyUser: UserProfile = {
  id: '', name: '', email: '', phone: '', countryCode: '+91', avatar: '', role: 'buyer',
  machinePreferences: [], settlementMode: 'manual', isLoggedIn: false, bankAccount: '',
  companyName: '', gstNumber: '', location: '', permissions: [],
};

const canUseSellerTools = (user: ApiUser) =>
  user.permissions.includes('marketplace.manage_own') ||
  user.permissions.some((permission) => permission.endsWith('.view_own') || permission.endsWith('.create_own'));

const mapUser = (user: ApiUser): UserProfile => ({
  ...emptyUser,
  id: user.id,
  name: user.name,
  email: user.email ?? '',
  phone: user.mobileNumber ?? '',
  countryCode: user.countryCode ?? '+91',
  avatar: normalizeAssetUrl(user.avatarUri) ?? '',
  role: canUseSellerTools(user) ? 'seller' : 'buyer',
  machinePreferences: user.selectedMachineIds,
  settlementMode: user.sellerSettlementMode ?? 'manual',
  isLoggedIn: true,
  permissions: user.permissions,
});

const mapPurchase = (purchase: ApiPurchase): PurchaseRecord => ({
  id: purchase.id,
  orderNumber: purchase.id,
  type: 'design',
  itemId: purchase.design.id,
  itemTitle: purchase.design.title,
  itemImage: normalizeAssetUrl(purchase.design.images[0]?.thumbnailUri || purchase.design.images[0]?.uri || purchase.design.imageUri) ?? '',
  category: purchase.design.categoryName ?? 'Uncategorized',
  sellerName: 'Marketplace seller',
  amountPaid: purchase.amountPaise / 100,
  date: purchase.purchasedAt ?? '',
  status: 'completed',
  downloadUrls: [],
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(emptyUser);
  const [authReady, setAuthReady] = useState(false);
  const [designs] = useState<DesignItem[]>(() => {
    const saved = localStorage.getItem('tdh_designs');
    return saved ? JSON.parse(saved) : INITIAL_DESIGNS;
  });
  const [collections] = useState<CollectionItem[]>(() => {
    const saved = localStorage.getItem('tdh_collections');
    return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
  });
  const [savedDesignIds, setSavedDesignIds] = useState<string[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast_${Math.random().toString(36).substring(2, 9)}`;
    setToasts((previous) => [...previous, { id, title, message, type }]);
    window.setTimeout(() => setToasts((previous) => previous.filter((toast) => toast.id !== id)), 4500);
  };
  const removeToast = (id: string) => setToasts((previous) => previous.filter((toast) => toast.id !== id));

  const loadAccountCollections = useCallback(async () => {
    const [saved, paid] = await Promise.all([
      accountApi.savedDesigns({ page: 1, per_page: 100 }),
      accountApi.purchases({ page: 1, per_page: 100 }),
    ]);
    setSavedDesignIds(saved.data.map((design) => design.id));
    setPurchases(paid.data.map(mapPurchase));
  }, []);

  const refreshUser = async () => {
    const response = await authApi.me();
    setUser(mapUser(response.data));
  };

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      if (!sessionToken.get()) { if (active) setAuthReady(true); return; }
      try {
        const response = await authApi.me();
        if (!active) return;
        setUser(mapUser(response.data));
        try { await loadAccountCollections(); } catch { setSavedDesignIds([]); setPurchases([]); }
      } catch {
        if (active) { sessionToken.clear(); setUser(emptyUser); setSavedDesignIds([]); setPurchases([]); }
      } finally { if (active) setAuthReady(true); }
    };
    const unauthorized = () => { setUser(emptyUser); setSavedDesignIds([]); setPurchases([]); setAuthReady(true); };
    window.addEventListener('designhub:unauthorized', unauthorized);
    void bootstrap();
    return () => { active = false; window.removeEventListener('designhub:unauthorized', unauthorized); };
  }, [loadAccountCollections]);

  const toggleSaveDesign = async (id: string) => {
    const exists = savedDesignIds.includes(id);
    try {
      if (exists) {
        await accountApi.unsaveDesign(id);
        setSavedDesignIds((previous) => previous.filter((item) => item !== id));
        showToast('Design removed', 'Removed from your saved designs.', 'info');
      } else {
        await accountApi.saveDesign(id);
        setSavedDesignIds((previous) => previous.includes(id) ? previous : [...previous, id]);
        showToast('Design saved', 'Added to your saved designs.', 'success');
      }
    } catch (error) {
      showToast('Could not update saved designs', error instanceof ApiError ? error.message : 'Please try again.', 'error');
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((previous) => ({ ...previous, ...updates }));
    showToast('Profile updated', 'Your local account view has been updated.', 'success');
  };
  const establishSession = async (result: AuthResult) => {
    sessionToken.set(result.accessToken); setUser(mapUser(result.user)); setAuthReady(true);
    try { await loadAccountCollections(); } catch { setSavedDesignIds([]); setPurchases([]); }
    showToast('Welcome to Textile Design Hub', 'Signed in successfully.', 'success');
  };
  const logout = async () => {
    try { if (sessionToken.get()) await authApi.logout(); } catch { /* Local sign-out still completes. */ }
    sessionToken.clear(); setUser(emptyUser); setSavedDesignIds([]); setPurchases([]);
    showToast('Signed out', 'You have been safely signed out.', 'info');
  };

  return <AppContext.Provider value={{
    user, designs, collections, creators: CREATORS, savedDesignIds, purchases, toasts, authReady,
    showToast, removeToast, toggleSaveDesign, isSaved: (id) => savedDesignIds.includes(id),
    isPurchased: (id) => purchases.some((purchase) => purchase.itemId === id), updateUserProfile,
    establishSession, refreshUser, refreshAccountData: loadAccountCollections, logout, searchQuery, setSearchQuery,
  }}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

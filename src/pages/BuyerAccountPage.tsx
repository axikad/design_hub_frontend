import React, { useEffect, useState } from 'react';
import { Check, Heart, Loader2, Settings2, Shield, ShoppingBag, User } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { DesignCard } from '../components/common/DesignCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useApp } from '../context/AppContext';
import { accountApi, ApiError } from '../lib/api-client';
import { toDesignCard } from '../lib/marketplace-mappers';
import type { ApiDesign } from '../types/marketplace';
import type { MachinePreferencePayload } from '../types/account';

type Tab = 'profile' | 'saved' | 'machines' | 'security';

export const BuyerAccountPage: React.FC = () => {
  const { user, purchases, savedDesignIds, refreshUser, logout, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedTab = searchParams.get('tab');
  const activeTab: Tab = requestedTab === 'saved' || requestedTab === 'machines' || requestedTab === 'security' ? requestedTab : 'profile';
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState<ApiDesign[]>([]);
  const [machineData, setMachineData] = useState<MachinePreferencePayload | null>(null);
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => setName(user.name), [user.name]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    Promise.all([
      accountApi.savedDesigns({ page: 1, per_page: 100 }, controller.signal),
      accountApi.machines(controller.signal),
    ]).then(([savedResponse, machineResponse]) => {
      setSaved(savedResponse.data);
      setMachineData(machineResponse.data);
      setSelectedMachineIds(machineResponse.data.selectedMachineIds);
    }).catch((requestError) => {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
      setError(requestError instanceof Error ? requestError.message : 'Could not load your account.');
    }).finally(() => setLoading(false));
    return () => controller.abort();
  }, [savedDesignIds]);

  const switchTab = (tab: Tab) => setSearchParams(tab === 'profile' ? {} : { tab });

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await accountApi.updateProfile(name.trim());
      await refreshUser();
      showToast('Profile updated', 'Your account name has been saved.', 'success');
    } catch (requestError) {
      showToast('Profile update failed', requestError instanceof Error ? requestError.message : 'Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveMachines = async () => {
    setSaving(true);
    try {
      const response = await accountApi.updateMachines(selectedMachineIds);
      setMachineData(response.data);
      setSelectedMachineIds(response.data.selectedMachineIds);
      await refreshUser();
      showToast('Machine preferences updated', 'Your marketplace catalog now uses these machines.', 'success');
    } catch (requestError) {
      showToast('Could not update machines', requestError instanceof ApiError ? requestError.message : 'Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    setSaving(true);
    try {
      await accountApi.deleteAccount();
      await logout();
      navigate('/', { replace: true });
    } catch (requestError) {
      showToast('Account deletion failed', requestError instanceof Error ? requestError.message : 'Please try again.', 'error');
    } finally {
      setSaving(false);
      setDeleteOpen(false);
    }
  };

  const tabs: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'saved', label: `Saved (${savedDesignIds.length})`, icon: Heart },
    { id: 'machines', label: 'Machines', icon: Settings2 },
    { id: 'security', label: 'Account', icon: Shield },
  ];

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-24">
      <header className="border-b border-stone-200 bg-white py-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 sm:flex-row sm:items-end sm:px-6 lg:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Buyer account</p><h1 className="mt-2 font-serif text-3xl font-bold text-stone-950">Welcome, {user.name}</h1><p className="mt-1 text-sm text-stone-500">{user.countryCode} {user.phone}{user.email ? ` · ${user.email}` : ''}</p></div><Link to="/account/purchases" className="inline-flex items-center gap-2 self-start rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white"><ShoppingBag className="h-4 w-4" />Purchases ({purchases.length})</Link></div></header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[15rem_1fr] lg:px-8">
        <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-stone-200 bg-white p-2 lg:flex-col" aria-label="Account sections">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => switchTab(id)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold ${activeTab === id ? 'bg-stone-950 text-white' : 'text-stone-600 hover:bg-stone-50'}`}><Icon className="h-4 w-4" />{label}</button>)}</nav>

        <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          {error && <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
          {loading ? <LoadingSkeleton count={3} /> : activeTab === 'profile' ? (
            <form onSubmit={saveProfile} className="max-w-2xl space-y-6"><div><h2 className="font-serif text-2xl font-semibold text-stone-950">Profile details</h2><p className="mt-1 text-sm text-stone-500">Your verified mobile and email cannot be changed without contact verification.</p></div><label className="block text-sm font-semibold text-stone-700">Name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-amber-700" /></label><div className="grid gap-4 sm:grid-cols-2"><ReadOnly label="Verified mobile" value={`${user.countryCode} ${user.phone}`} /><ReadOnly label="Email" value={user.email || 'Not added'} /></div><button disabled={saving || !name.trim()} className="inline-flex items-center gap-2 rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save profile</button></form>
          ) : activeTab === 'saved' ? (
            <div><h2 className="font-serif text-2xl font-semibold text-stone-950">Saved designs</h2><p className="mt-1 text-sm text-stone-500">Your saved list is synchronized with the server.</p>{saved.length === 0 ? <div className="mt-6"><EmptyState icon={Heart} title="No saved designs" description="Save a design from the marketplace to find it here." actionLabel="Explore designs" onAction={() => navigate('/explore')} /></div> : <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{saved.map((design) => <DesignCard key={design.id} design={toDesignCard(design)} />)}</div>}</div>
          ) : activeTab === 'machines' ? (
            <div><h2 className="font-serif text-2xl font-semibold text-stone-950">Machine preferences</h2><p className="mt-1 text-sm text-stone-500">Only designs for selected machines will appear in your authenticated marketplace catalog.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{machineData?.machines.map((machine) => { const selected = selectedMachineIds.includes(machine.id); return <button type="button" key={machine.id} onClick={() => setSelectedMachineIds((previous) => selected ? previous.filter((id) => id !== machine.id) : [...previous, machine.id])} className={`flex items-center justify-between rounded-xl border p-4 text-left text-sm font-semibold ${selected ? 'border-amber-400 bg-amber-50 text-amber-950' : 'border-stone-200 bg-stone-50 text-stone-700'}`}><span>{machine.name}</span>{selected && <Check className="h-4 w-4" />}</button>; })}</div><button type="button" onClick={saveMachines} disabled={saving || selectedMachineIds.length === 0} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save machines</button></div>
          ) : (
            <div className="max-w-2xl"><h2 className="font-serif text-2xl font-semibold text-stone-950">Account and security</h2><div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-5"><p className="font-semibold text-stone-900">OTP authentication</p><p className="mt-1 text-sm text-stone-500">This website uses the mobile OTP method enabled for your account. Your access token is cleared when you sign out.</p></div><div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-5"><p className="font-semibold text-rose-900">Delete account</p><p className="mt-1 text-sm leading-6 text-rose-800">Personal contact data and saved designs will be removed. Marketplace integrity records may be retained by the server.</p><button type="button" onClick={() => setDeleteOpen(true)} className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white">Delete my account</button></div></div>
          )}
        </section>
      </div>

      <ConfirmationDialog isOpen={deleteOpen} title="Delete your account?" message="This action cannot be undone. The server will anonymize your profile and revoke every active token." confirmLabel={saving ? 'Deleting…' : 'Delete account'} isDestructive onConfirm={() => void deleteAccount()} onCancel={() => setDeleteOpen(false)} />
    </main>
  );
};

const ReadOnly: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="rounded-xl border border-stone-200 bg-stone-50 p-4"><p className="text-xs uppercase tracking-wider text-stone-400">{label}</p><p className="mt-1 text-sm font-semibold text-stone-900">{value}</p></div>;

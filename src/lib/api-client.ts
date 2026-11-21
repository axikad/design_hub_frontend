import type {
  ApiDesign,
  ApiEnvelope,
  ApiFolder,
  ApiHomeData,
  BrowseFilters,
  PaginatedEnvelope,
} from '../types/marketplace';
import type {
  AccountMachine,
  ApiUser,
  AuthPayload,
  AuthResult,
  MachinePreferencePayload,
  PurchaseEnvelope,
  SavedDesignEnvelope,
} from '../types/account';
import type {
  CheckoutItemType,
  CheckoutOrder,
  CheckoutPreview,
  DesignDownloadGrant,
  FolderDownloadGrant,
  PaymentVerification,
  PurchaseStatus,
} from '../types/commerce';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = (configuredBaseUrl || 'https://app.designshub.org/api/v1').replace(/\/$/, '');

type QueryValue = string | number | boolean | null | undefined | Array<string | number>;
type Query = Record<string, QueryValue>;
type RequestBody = Record<string, unknown> | FormData | undefined;

const TOKEN_KEY = 'designhub_access_token';

export const sessionToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

interface ApiErrorBody {
  success?: false;
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code = 'request_failed',
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const buildUrl = (path: string, query?: Query) => {
  const url = new URL(path.replace(/^\//, ''), `${API_BASE_URL}/`);
  Object.entries(query ?? {}).forEach(([key, rawValue]) => {
    if (rawValue === undefined || rawValue === null || rawValue === '') return;
    if (Array.isArray(rawValue)) {
      rawValue.forEach((value) => url.searchParams.append(`${key}[]`, String(value)));
      return;
    }
    url.searchParams.set(key, String(rawValue));
  });
  return url.toString();
};

export const apiRequest = async <T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Query;
    body?: RequestBody;
    signal?: AbortSignal;
    authenticated?: boolean;
  } = {},
): Promise<T> => {
  let response: Response;
  const token = sessionToken.get();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? 'GET',
      headers,
      body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('Unable to reach the marketplace service. Check your connection and try again.', 0, 'network_error');
  }

  const body = (await response.json().catch(() => null)) as ApiErrorBody | T | null;
  if (!response.ok) {
    const failure = (body ?? {}) as ApiErrorBody;
    const apiError = new ApiError(
      failure.message || `Request failed (${response.status}).`,
      response.status,
      failure.code,
      failure.errors,
    );
    if (response.status === 401 && (options.authenticated || token)) {
      sessionToken.clear();
      window.dispatchEvent(new CustomEvent('designhub:unauthorized'));
    }
    throw apiError;
  }
  return body as T;
};

export const apiGet = <T>(path: string, query?: Query, signal?: AbortSignal) =>
  apiRequest<T>(path, { query, signal });

export const marketplaceApi = {
  home: (signal?: AbortSignal) => apiGet<ApiEnvelope<ApiHomeData>>('home', {
    sliderLimit: 8,
    sectionLimit: 8,
    categoryLimit: 4,
  }, signal),
  browseFilters: (signal?: AbortSignal) =>
    apiGet<ApiEnvelope<BrowseFilters>>('catalog/browse-filters', undefined, signal),
  designs: (query: Query, signal?: AbortSignal) =>
    apiGet<PaginatedEnvelope<ApiDesign[]>>('designs', query, signal),
  design: (id: string, signal?: AbortSignal) =>
    apiGet<ApiEnvelope<ApiDesign>>(`designs/${encodeURIComponent(id)}`, undefined, signal),
  folders: (query: Query, signal?: AbortSignal) =>
    apiGet<PaginatedEnvelope<ApiFolder[]>>('folders', query, signal),
  folder: (id: string, query: Query, signal?: AbortSignal) =>
    apiGet<PaginatedEnvelope<ApiFolder>>(`folders/${encodeURIComponent(id)}`, query, signal),
};

export const authApi = {
  registrationMachines: (signal?: AbortSignal) =>
    apiGet<ApiEnvelope<AccountMachine[]>>('auth/register/machines', undefined, signal),
  requestOtp: (payload: AuthPayload, signal?: AbortSignal) =>
    apiRequest<ApiEnvelope<{ message: string }>>('auth/request-otp', { method: 'POST', body: payload as unknown as Record<string, unknown>, signal }),
  verifyOtp: (payload: AuthPayload & { code: string }, signal?: AbortSignal) =>
    apiRequest<ApiEnvelope<AuthResult>>('auth/verify-otp', { method: 'POST', body: payload as unknown as Record<string, unknown>, signal }),
  logout: () => apiRequest<ApiEnvelope<{ message: string }>>('auth/logout', { method: 'POST', authenticated: true }),
  me: (signal?: AbortSignal) => apiRequest<ApiEnvelope<ApiUser>>('users/me', { signal, authenticated: true }),
};

export const accountApi = {
  updateProfile: (name: string) => apiRequest<ApiEnvelope<ApiUser>>('users/me', { method: 'PATCH', body: { name }, authenticated: true }),
  machines: (signal?: AbortSignal) => apiRequest<ApiEnvelope<MachinePreferencePayload>>('users/me/machines', { signal, authenticated: true }),
  updateMachines: (machineIds: string[]) => apiRequest<ApiEnvelope<MachinePreferencePayload>>('users/me/machines', { method: 'PUT', body: { machineIds }, authenticated: true }),
  savedDesigns: (query: Query = {}, signal?: AbortSignal) => apiRequest<SavedDesignEnvelope>('users/me/saved-designs', { query, signal, authenticated: true }),
  saveDesign: (id: string) => apiRequest<ApiEnvelope<{ message: string }>>(`users/me/saved-designs/${encodeURIComponent(id)}`, { method: 'PUT', authenticated: true }),
  unsaveDesign: (id: string) => apiRequest<ApiEnvelope<{ message: string }>>(`users/me/saved-designs/${encodeURIComponent(id)}`, { method: 'DELETE', authenticated: true }),
  purchases: (query: Query = {}, signal?: AbortSignal) => apiRequest<PurchaseEnvelope>('users/me/purchases', { query, signal, authenticated: true }),
  deleteAccount: () => apiRequest<ApiEnvelope<{ message: string }>>('users/me', { method: 'DELETE', body: { confirmation: 'DELETE' }, authenticated: true }),
};

const itemPayload = (type: CheckoutItemType, id: string) =>
  type === 'design' ? { designId: id } : { folderId: id };

export const commerceApi = {
  checkoutPreview: (type: CheckoutItemType, id: string, signal?: AbortSignal) =>
    apiRequest<ApiEnvelope<CheckoutPreview>>('payments/checkout-preview', { query: itemPayload(type, id), signal, authenticated: true }),
  createOrder: (type: CheckoutItemType, id: string) =>
    apiRequest<ApiEnvelope<CheckoutOrder>>('payments/orders', { method: 'POST', body: itemPayload(type, id), authenticated: true }),
  verify: (type: CheckoutItemType, id: string, verification: PaymentVerification) =>
    apiRequest<ApiEnvelope<PurchaseStatus>>('payments/verify', { method: 'POST', body: { ...itemPayload(type, id), ...verification }, authenticated: true }),
  purchaseStatus: (type: CheckoutItemType, id: string, signal?: AbortSignal) =>
    apiRequest<ApiEnvelope<PurchaseStatus>>(`purchases/${type === 'design' ? 'designs' : 'folders'}/${encodeURIComponent(id)}`, { signal, authenticated: true }),
  downloadDesign: (id: string, file = 0) =>
    apiRequest<ApiEnvelope<DesignDownloadGrant>>(`designs/${encodeURIComponent(id)}/download`, { method: 'POST', body: { file }, authenticated: true }),
  downloadDesignImage: (id: string, imageIndex: number) =>
    apiRequest<ApiEnvelope<DesignDownloadGrant>>(`designs/${encodeURIComponent(id)}/images/${imageIndex}/download`, { method: 'POST', authenticated: true }),
  downloadFolder: (id: string) =>
    apiRequest<ApiEnvelope<FolderDownloadGrant>>(`folders/${encodeURIComponent(id)}/download`, { method: 'POST', authenticated: true }),
};

export const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

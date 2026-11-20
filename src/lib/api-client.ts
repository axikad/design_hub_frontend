import type {
  ApiDesign,
  ApiEnvelope,
  ApiFolder,
  ApiHomeData,
  BrowseFilters,
  PaginatedEnvelope,
} from '../types/marketplace';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = (configuredBaseUrl || 'https://app.designshub.org/api/v1').replace(/\/$/, '');

type QueryValue = string | number | boolean | null | undefined | Array<string | number>;
type Query = Record<string, QueryValue>;

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

export const apiGet = async <T>(path: string, query?: Query, signal?: AbortSignal): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('Unable to reach the marketplace service. Check your connection and try again.', 0, 'network_error');
  }

  const body = (await response.json().catch(() => null)) as ApiErrorBody | T | null;
  if (!response.ok) {
    const failure = (body ?? {}) as ApiErrorBody;
    throw new ApiError(
      failure.message || `Request failed (${response.status}).`,
      response.status,
      failure.code,
      failure.errors,
    );
  }
  return body as T;
};

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

export const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

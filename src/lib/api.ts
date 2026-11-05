const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://app.designshub.org/api/v1').replace(/\/$/, '')

export type ApiEnvelope<T> = { success: boolean; message: string; data: T }

export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${path.replace(/^\//, '')}`, {
    ...init,
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init.headers },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(body?.message || 'Something went wrong. Please try again.', response.status, body)
  return (body?.data ?? body) as T
}

export { API_BASE_URL }

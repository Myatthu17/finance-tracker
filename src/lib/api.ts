const BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Fired when an authenticated request comes back 401/403 - i.e. the stored
// token was rejected by the server (expired, or the user no longer exists).
// AuthContext subscribes to this to force-clear the session; login/register
// requests never carry a token so their own 401s (bad credentials) never
// trigger it.
type UnauthorizedListener = () => void
const unauthorizedListeners = new Set<UnauthorizedListener>()

export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('ft_token')
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    if (token && (res.status === 401 || res.status === 403)) {
      unauthorizedListeners.forEach((listener) => listener())
    }
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed with status ${res.status}`)
  }

  return res.json()
}

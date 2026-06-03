const BASE_URL = '/api'

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
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed with status ${res.status}`)
  }

  return res.json()
}

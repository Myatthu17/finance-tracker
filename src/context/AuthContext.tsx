import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api, onUnauthorized } from '../lib/api'

interface User {
  id: string
  email: string
  username: string
}

interface DecodedToken {
  userId: string
  email?: string
  username?: string
  exp?: number
}

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  sessionExpired: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => void
  dismissSessionExpired: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthResponse {
  token: string
  user: User
}

function decodeToken(token: string): DecodedToken | null {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ft_token'))
  const [loading, setLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  const clearSession = useCallback(() => {
    localStorage.removeItem('ft_token')
    setToken(null)
    setUser(null)
  }, [])

  // Called when the token is found to be expired, either up front on load/tick
  // or reactively because the server rejected it - surfaces a banner so the
  // user understands why they landed back on the login page.
  const forceLogout = useCallback(() => {
    clearSession()
    setSessionExpired(true)
  }, [clearSession])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    const payload = decodeToken(token)
    const isExpired = payload?.exp != null && payload.exp * 1000 <= Date.now()

    if (!payload || isExpired) {
      if (isExpired) {
        forceLogout()
      } else {
        clearSession()
      }
      setLoading(false)
      return
    }

    const userData: User = {
      id: payload.userId,
      email: payload.email || '',
      username: payload.username || '',
    }
    if (userData.email || userData.username) {
      setUser(userData)
    }
    setLoading(false)

    if (payload.exp == null) return
    const msUntilExpiry = payload.exp * 1000 - Date.now()
    const timer = setTimeout(forceLogout, msUntilExpiry)
    return () => clearTimeout(timer)
  }, [token, clearSession, forceLogout])

  useEffect(() => onUnauthorized(forceLogout), [forceLogout])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setSessionExpired(false)
    localStorage.setItem('ft_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const register = useCallback(async (email: string, username: string, password: string) => {
    const data = await api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    })
    setSessionExpired(false)
    localStorage.setItem('ft_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const loginWithGoogle = useCallback(async (credential: string) => {
    const data = await api<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    })
    setSessionExpired(false)
    localStorage.setItem('ft_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    setSessionExpired(false)
    clearSession()
  }, [clearSession])

  const dismissSessionExpired = useCallback(() => setSessionExpired(false), [])

  return (
    <AuthContext.Provider
      value={{ user, token, loading, sessionExpired, login, register, loginWithGoogle, logout, dismissSessionExpired }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

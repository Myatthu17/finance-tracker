import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from '../lib/api'

interface User {
  id: string
  email: string
  username: string
}

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthResponse {
  token: string
  user: User
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ft_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const userData: User = {
          id: payload.userId,
          email: payload.email || '',
          username: payload.username || '',
        }
        if (userData.email || userData.username) {
          setUser(userData)
        }
      } catch {
        localStorage.removeItem('ft_token')
        setToken(null)
      }
    }
    setLoading(false)
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('ft_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const register = useCallback(async (email: string, username: string, password: string) => {
    const data = await api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    })
    localStorage.setItem('ft_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const loginWithGoogle = useCallback(async (credential: string) => {
    const data = await api<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    })
    localStorage.setItem('ft_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ft_token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

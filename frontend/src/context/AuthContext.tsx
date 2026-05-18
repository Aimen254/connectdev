import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../api'

interface User {
  id: number
  name: string
  email: string
  headline?: string
  bio?: string
  location?: string
  website?: string
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (partial: Partial<User>) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [token, setToken]     = useState<string | null>(() => localStorage.getItem('cd_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    // Warm render from cache, then refresh from server
    const cached = localStorage.getItem('cd_user')
    if (cached) { try { setUser(JSON.parse(cached)) } catch {} }
    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data)
        localStorage.setItem('cd_user', JSON.stringify(data))
      })
      .catch(() => doLogout())
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const doLogout = () => {
    localStorage.removeItem('cd_token')
    localStorage.removeItem('cd_user')
    setToken(null)
    setUser(null)
  }

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('cd_token', newToken)
    localStorage.setItem('cd_user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
  }

  const updateUser = (partial: Partial<User>) => {
    setUser(prev => {
      const next = prev ? { ...prev, ...partial } : null
      if (next) localStorage.setItem('cd_user', JSON.stringify(next))
      return next
    })
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout: doLogout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

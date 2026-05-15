import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// ── Types ─────────────────────────────────────────────
interface User {
  id: number
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  loading: boolean
}

// ── Context ───────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null)

// ── Provider ──────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]     = useState<User | null>(null)
  const [token, setToken]   = useState<string | null>(() => localStorage.getItem('cd_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const isExpired = payload.exp * 1000 < Date.now()
        if (isExpired) {
          logout()
        } else {
          setUser(payload as User)
        }
      } catch {
        logout()
      }
    }
    setLoading(false)
  }, [token])

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('cd_token', newToken)
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('cd_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
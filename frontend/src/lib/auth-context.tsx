import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, type ApiUser } from './api'

interface AuthContextValue {
  user: ApiUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<ApiUser>
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: ApiUser | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'eatwise_token'
const USER_KEY = 'eatwise_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  )
  const [loading, setLoading] = useState(false)

  // Keep localStorage in sync whenever user/token changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }, [user])

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      setUser(res.data.user)
      setToken(res.token)
      return res.data.user
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true)
      try {
        const res = await authApi.register({ name, email, password, confirmPassword: password })
        setUser(res.data.user)
        setToken(res.token)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore – clear local state regardless
    } finally {
      setUser(null)
      setToken(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, setUser }}
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
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/endpoints.js'

const AuthContext = createContext(null)
const TOKEN_KEY = 'shopnest_token'
const USER_KEY = 'shopnest_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(true)

  // Re-validate a stored token on first load.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(({ data }) => {
        setUser(data)
        localStorage.setItem(USER_KEY, JSON.stringify(data))
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const persist = ({ token, user: profile }) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(profile))
    setUser(profile)
  }

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password })
    persist(data)
    return data.user
  }

  const register = async (payload) => {
    const { data } = await authApi.register(payload)
    persist(data)
    return data.user
  }

  /** Re-reads the profile from the server, e.g. after the Account page saves. */
  const refreshUser = async () => {
    const { data } = await authApi.me()
    setUser(data)
    localStorage.setItem(USER_KEY, JSON.stringify(data))
    return data
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ROLE_ADMIN',
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

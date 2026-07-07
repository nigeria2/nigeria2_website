import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { API_BASE } from './config'

export type User = {
  id: number
  email: string
  full_name: string
  given_name?: string | null
  picture?: string | null
  is_admin: boolean
  onboarded: boolean
  phone?: string | null
  gender?: string | null
  year_of_birth?: number | null
  home_state?: string | null
  home_lga?: string | null
  residence_state?: string | null
  voter_status?: string | null
  known_states?: string[]
  bio?: string | null
}

type AuthState = {
  user: User | null
  token: string | null
  loading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
  refresh: () => Promise<void>
}

const TOKEN_KEY = 'n2_token'

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  setUser: () => {},
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (t: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
      if (res.ok) {
        setUser((await res.json()) as User)
        setToken(t)
      } else {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      }
    } catch {
      setToken(null)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
    if (t) {
      load(t).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [load])

  const login = (t: string, u: User) => {
    localStorage.setItem(TOKEN_KEY, t)
    setToken(t)
    setUser(u)
  }
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }
  const refresh = async () => {
    if (token) await load(token)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

/** Authenticated fetch helper: attaches the bearer token. */
export async function apiFetch(path: string, token: string | null, init: RequestInit = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  })
}

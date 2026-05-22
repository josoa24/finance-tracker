import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const TOKEN_KEY = 'auth_token'

export const authService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),

  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token)
  },

  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY)
  },

  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),

  getUsernameFromToken: (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return null
    
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      
      const payload = JSON.parse(atob(parts[1]))
      return payload.sub || null
    } catch {
      return null
    }
  },

  async register(username: string, password: string): Promise<string> {
    const response = await axios.post<{ token: string }>(`${API_URL}/api/auth/register`, {
      username,
      password,
    })
    const token = response.data.token
    authService.setToken(token)
    return token
  },

  async login(username: string, password: string): Promise<string> {
    const response = await axios.post<{ token: string }>(`${API_URL}/api/auth/login`, {
      username,
      password,
    })
    const token = response.data.token
    authService.setToken(token)
    return token
  },

  logout() {
    authService.clearToken()
  },
}

// Add JWT token to all axios requests
axios.interceptors.request.use((config) => {
  const token = authService.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * 사용자 인증 훅
 */
import { useState, useEffect } from 'react'
import { User, getStoredUser, isLoggedIn, logout as apiLogout } from '../api/auth'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 초기 로드
    checkAuth()
  }, [])

  const checkAuth = () => {
    const loggedIn = isLoggedIn()
    setIsAuthenticated(loggedIn)
    
    if (loggedIn) {
      const storedUser = getStoredUser()
      setUser(storedUser)
    }
    
    setIsLoading(false)
  }

  const login = (token: string, userData: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(userData))
    }
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    await apiLogout()
    setUser(null)
    setIsAuthenticated(false)
    router.push('/login')
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  }
}


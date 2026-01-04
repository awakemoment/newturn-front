/**
 * 사용자 인증 API
 */
import { apiClient } from '../axios'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

export interface LoginResponse {
  token: string
  user: User
  is_new_user: boolean
}

/**
 * 카카오 로그인
 */
export async function kakaoLogin(accessToken: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/api/users/kakao/login/', {
    access_token: accessToken
  })
  
  // 토큰 저장
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }
  
  return data
}

/**
 * 구글 로그인
 */
export async function googleLogin(accessToken: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/api/users/google/login/', {
    access_token: accessToken
  })
  
  // 토큰 저장
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }
  
  return data
}

/**
 * 로그아웃
 */
export async function logout() {
  try {
    await apiClient.post('/api/users/logout/')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // 로컬 토큰 삭제
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }
}

/**
 * 현재 사용자 정보
 */
export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>('/api/users/me/')
  return data
}

/**
 * 저장된 사용자 정보 가져오기
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

/**
 * 로그인 여부 확인
 */
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('auth_token')
}


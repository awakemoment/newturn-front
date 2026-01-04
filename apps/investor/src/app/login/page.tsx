'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { kakaoLogin, googleLogin } from '@/lib/api/auth'
import { useAuth } from '@/lib/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleKakaoLogin = async () => {
    setLoading(true)
    try {
      // 실제로는 카카오 SDK를 사용해서 액세스 토큰을 받아야 함
      // 현재는 임시로 더미 토큰 사용
      const response = await kakaoLogin('kakao_dummy_token')
      login(response.token, response.user)
      
      if (response.is_new_user) {
        router.push('/welcome')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Kakao login error:', error)
      alert('로그인 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      // 실제로는 구글 SDK를 사용해서 액세스 토큰을 받아야 함
      // 현재는 임시로 더미 토큰 사용
      const response = await googleLogin('google_dummy_token')
      login(response.token, response.user)
      
      if (response.is_new_user) {
        router.push('/welcome')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Google login error:', error)
      alert('로그인 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          newturn
        </h1>
        <p className="text-gray-700 text-lg">
          나만의 투자 근거를 언제 어디서나 꺼내보세요
        </p>
      </div>

      {/* Login Buttons */}
      <div className="w-full max-w-sm space-y-3">
        {/* Kakao Login */}
        <button
          onClick={handleKakaoLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#FEE500] text-black rounded-lg hover:bg-[#F5DC00] font-medium"
        >
          카카오로 시작하기
        </button>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          구글로 시작하기
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <a href="#" className="hover:text-gray-700">개인정보처리방침</a>
        <div className="mt-2">© 2024 Toktokhan.dev, Inc. All Right Reserved.</div>
      </div>
    </div>
  )
}



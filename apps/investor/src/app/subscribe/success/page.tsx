'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

// 동적 라우트 설정
export const dynamic = 'force-dynamic'

function SubscribeSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // 3초 후 홈으로 리다이렉트
    const timer = setTimeout(() => {
      router.push('/')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-12 max-w-md text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          구독 완료!
        </h1>
        <p className="text-gray-600 mb-8">
          뉴턴 {sessionId ? 'Premium' : 'Standard'} 구독이 시작되었습니다.
          <br />
          이제 모든 기능을 이용하실 수 있습니다!
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            홈으로 이동
          </button>
          <button
            onClick={() => router.push('/screen')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200"
          >
            500개 종목 탐색하기
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          3초 후 자동으로 홈으로 이동합니다...
        </p>
      </div>
    </div>
  )
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <SubscribeSuccessContent />
    </Suspense>
  )
}


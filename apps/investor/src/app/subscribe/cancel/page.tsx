'use client'

import { useRouter } from 'next/navigation'

export default function SubscribeCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-12 max-w-md text-center">
        <div className="text-6xl mb-6">😔</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          구독이 취소되었습니다
        </h1>
        <p className="text-gray-600 mb-8">
          언제든지 다시 구독하실 수 있습니다.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push('/subscribe')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            다시 구독하기
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  )
}


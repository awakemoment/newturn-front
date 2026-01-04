'use client'

import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Happy Face */}
      <div className="text-8xl mb-8">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto">
          <span className="text-white text-6xl">😊</span>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-4xl">🎉</span>
          <h1 className="text-4xl font-bold text-gray-900">
            환영해요
          </h1>
          <span className="text-4xl">🎉</span>
        </div>
        <p className="text-gray-700 text-lg">
          뉴턴의 더 많은 기능을 활용할 수 있어요!
        </p>
      </div>

      {/* Go to Main Button */}
      <button
        onClick={() => router.push('/')}
        className="px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium text-lg"
      >
        메인 홈으로 이동
      </button>
    </div>
  )
}



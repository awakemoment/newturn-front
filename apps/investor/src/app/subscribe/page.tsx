'use client'

import { useRouter } from 'next/navigation'
import DisclaimerFooter from '@/components/DisclaimerFooter'
import AppHeader from '@/components/AppHeader'

export default function SubscribePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-16">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">구독</h1>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-green-700">준비 중</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">지금은 모두 무료입니다</h2>
          <p className="mt-3 text-gray-600">
            같은 날, 같은 참고 정보를 모두에게 보여 줍니다. 결제는 받지 않으며,
            계좌 맞춤 상담이나 1:1 리딩도 하지 않습니다.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            원금이나 수익률을 보장하지 않습니다. 투자 판단은 본인 몫입니다.
          </p>
          <button
            onClick={() => router.push('/ops')}
            className="mt-6 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
          >
            오늘의 투자 안내 보러 가기
          </button>
        </div>
      </main>

      <DisclaimerFooter />
    </div>
  )
}

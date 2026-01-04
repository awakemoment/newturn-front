'use client'

import { useRouter } from 'next/navigation'
import WeeklyBriefingTemplate from '@/components/WeeklyBriefingTemplate'
import DisclaimerFooter from '@/components/DisclaimerFooter'

export default function WeeklyBriefingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={() => router.push('/')} className="text-lg font-bold text-green-600">
            Newturn
          </button>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <button onClick={() => router.push('/screen')} className="hover:text-gray-900">
              종목 탐색
            </button>
            <button onClick={() => router.push('/watchlist')} className="hover:text-gray-900">
              관심종목
            </button>
            <button onClick={() => router.push('/weekly-briefing')} className="text-green-600">
              주간 브리핑
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-2xl border border-green-100 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">주간 브리핑 템플릿</h1>
          <p className="mt-3 text-sm text-gray-600">
            매주 일요일 저녁 ~ 월요일 아침, 시장과 산업을 복기하고 관심종목과 신규 아이디어를 정리할 때 참고하세요.
            이 문서로 작성한 내용을 Notion/Docs에 복사해서 사용하거나, 추후 자동화된 브리핑 페이지로 확장할 수 있습니다.
          </p>
          <div className="mt-6 rounded-xl border border-dashed border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">
            ✔️ 팁: 작성 후 월요일 아침 다시 읽고 이번 주 행동 계획을 확정하세요. “신규 아이디어”는 다음 주 관심종목으로 이동하거나 폐기 여부를 결정합니다.
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <WeeklyBriefingTemplate />
        </div>
      </main>

      <DisclaimerFooter />
    </div>
  )
}



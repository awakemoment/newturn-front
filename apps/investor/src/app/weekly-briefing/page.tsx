'use client'

import WeeklyBriefingTemplate from '@/components/WeeklyBriefingTemplate'
import DisclaimerFooter from '@/components/DisclaimerFooter'
import AppHeader from '@/components/AppHeader'

export default function WeeklyBriefingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <AppHeader />

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



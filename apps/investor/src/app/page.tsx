'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchOpsToday } from '@/lib/api/ops'
import { getSignals, getWatchlist } from '@/lib/api/watchlist'
import { getScreeningTable } from '@/lib/api/stocks'
import DisclaimerFooter from '@/components/DisclaimerFooter'
import AppHeader from '@/components/AppHeader'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [ops, setOps] = useState<{ asOf: string; buys: number; sells: number } | null>(null)
  const [watch, setWatch] = useState<{ total: number; buys: number; sells: number } | null>(null)
  const [screenCount, setScreenCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [today, signals, list, table] = await Promise.all([
          fetchOpsToday(100000, false).catch(() => null),
          getSignals().catch(() => null),
          getWatchlist().catch(() => null),
          getScreeningTable({ page_size: 1 }).catch(() => null),
        ])
        if (cancelled) return
        if (today) {
          const actions = today.actions || []
          setOps({
            asOf: today.as_of,
            buys: actions.filter((a) => a.action === 'buy').length,
            sells: actions.filter((a) => a.action === 'sell').length,
          })
        }
        const watchItems = Array.isArray(list) ? list : []
        setWatch({
          total: watchItems.length,
          buys: signals?.buy_signals?.length || 0,
          sells: signals?.sell_signals?.length || 0,
        })
        setScreenCount(typeof table?.count === 'number' ? table.count : null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <AppHeader active="home" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold text-green-700">AI 투자 분석 메이트</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">오늘 뭘 보고, 뭘 살지 쉽게</h2>
          <p className="mt-3 text-gray-600">
            많이 빠진 뒤 다시 오를 종목과, 좋은 회사를 싸게 사서 오래 들고 갈 종목을 나눠 보여줍니다.
            같은 날에는 같은 참고 정보를 모두에게 보여 주며, 은행 계좌를 연결하지 않아도 바로 볼 수 있습니다.
          </p>
        </section>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" />
            <p className="mt-4 text-gray-500">오늘 볼거리를 준비하고 있어요...</p>
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-3">
            <button
              type="button"
              onClick={() => router.push('/ops')}
              className="rounded-2xl border border-green-200 bg-white p-6 text-left shadow-sm hover:border-green-400 hover:shadow-md transition"
            >
              <p className="text-sm font-semibold text-green-700">오늘의 투자 안내</p>
              <h3 className="mt-2 text-xl font-bold text-gray-900">오늘 사고팔 일</h3>
              <p className="mt-2 text-sm text-gray-600">
                왜 이 종목을 사고, 왜 기다리라고 하는지 쉬운 말로 알려줍니다.
              </p>
              <p className="mt-4 text-sm text-gray-800">
                {ops
                  ? `${ops.asOf} · 매수 ${ops.buys}개 · 매도 ${ops.sells}개`
                  : '오늘 추천을 보러 가세요'}
              </p>
              <span className="mt-5 inline-block text-sm font-semibold text-green-700">안내 보기 →</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/screen')}
              className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm hover:border-green-300 hover:shadow-md transition"
            >
              <p className="text-sm font-semibold text-green-700">종목 탐색</p>
              <h3 className="mt-2 text-xl font-bold text-gray-900">한국·미국 종목 찾기</h3>
              <p className="mt-2 text-sm text-gray-600">
                회사가 튼튼한지, 지금 가격이 싼지를 점수로 비교해 볼 수 있습니다.
              </p>
              <p className="mt-4 text-sm text-gray-800">
                {screenCount != null ? `지금 ${screenCount}개 종목을 볼 수 있어요` : '종목을 찾아보세요'}
              </p>
              <span className="mt-5 inline-block text-sm font-semibold text-green-700">탐색하기 →</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/watchlist')}
              className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm hover:border-green-300 hover:shadow-md transition"
            >
              <p className="text-sm font-semibold text-green-700">관심 종목</p>
              <h3 className="mt-2 text-xl font-bold text-gray-900">지켜보는 종목</h3>
              <p className="mt-2 text-sm text-gray-600">
                담아 둔 종목이 싸졌는지, 비싸졌는지를 한곳에 모아 보여줍니다.
              </p>
              <p className="mt-4 text-sm text-gray-800">
                {watch
                  ? watch.total
                    ? `${watch.total}개 관심 · 살 만함 ${watch.buys} · 비쌈 ${watch.sells}`
                    : '아직 담은 종목이 없어요. 종목 탐색에서 추가해 보세요'
                  : '관심 종목을 보러 가세요'}
              </p>
              <span className="mt-5 inline-block text-sm font-semibold text-green-700">관심 종목 보기 →</span>
            </button>
          </section>
        )}
      </main>

      <DisclaimerFooter />
    </div>
  )
}

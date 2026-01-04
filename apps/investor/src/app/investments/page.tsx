'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSavingsRewards, type SavingsReward } from '@/lib/api/accounts'

export default function InvestmentsPage() {
  const router = useRouter()
  const [rewards, setRewards] = useState<SavingsReward[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRewards()
  }, [])

  const loadRewards = async () => {
    try {
      const data = await getSavingsRewards()
      setRewards(data)
    } catch (error) {
      console.error('투자 목록 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // pending 상태도 포함 (투자 진행 중)
  const activeRewards = rewards.filter(r => r.status === 'invested' || r.status === 'pending')
  const soldRewards = rewards.filter(r => r.status === 'sold')
  
  console.log('📊 전체 리워드:', rewards)
  console.log('📊 활성 리워드 (invested/pending):', activeRewards)
  console.log('📊 매도 완료 리워드:', soldRewards)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-green-600 cursor-pointer" onClick={() => router.push('/')}>
              Newturn
            </h1>
            <button onClick={() => router.push('/')} className="text-gray-600 hover:text-gray-900 text-sm">
              홈
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">내 투자 현황</h2>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : (
          <>
            {/* 투자 중 */}
            {activeRewards.length > 0 && (
              <section className="mb-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">투자 중 ({activeRewards.length})</h3>
                <div className="space-y-4">
                  {activeRewards.map((reward) => {
                    const purchaseCost = reward.purchase_price * reward.shares
                    const profit = (reward.current_value || 0) - purchaseCost
                    const profitRate = ((profit / purchaseCost) * 100) || 0

                    return (
                      <div
                        key={reward.id}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm cursor-pointer hover:border-green-300 transition"
                        onClick={() => router.push(`/investments/${reward.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-lg font-semibold text-gray-900">
                                {reward.stock.stock_code}
                              </span>
                              <span className="text-gray-600">{reward.stock.stock_name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">투자 금액:</span>
                                <span className="ml-2 font-semibold">${reward.savings_amount.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">현재 가치:</span>
                                <span className="ml-2 font-semibold">
                                  ${(reward.current_value || 0).toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">수익률:</span>
                                <span className={`ml-2 font-semibold ${profitRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">수익:</span>
                                <span className={`ml-2 font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ${profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-6">
                            {reward.can_sell ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/investments/${reward.id}`)
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                              >
                                매도하기 ✅
                              </button>
                            ) : (
                              <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                                보유 중 ⏸️
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* 매도 완료 */}
            {soldRewards.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">매도 완료 ({soldRewards.length})</h3>
                <div className="space-y-4">
                  {soldRewards.map((reward) => {
                    const purchaseCost = reward.purchase_price * reward.shares
                    const profit = (reward.net_proceeds || 0) - purchaseCost
                    const profitRate = ((profit / purchaseCost) * 100) || 0

                    return (
                      <div
                        key={reward.id}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm opacity-75"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-lg font-semibold text-gray-900">
                            {reward.stock.stock_code}
                          </span>
                          <span className="text-gray-600">{reward.stock.stock_name}</span>
                          <span className="ml-auto text-xs text-gray-500">
                            매도일: {new Date(reward.sell_date || '').toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">투자 금액:</span>
                            <span className="ml-2 font-semibold">${reward.savings_amount.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">순수익:</span>
                            <span className={`ml-2 font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {activeRewards.length === 0 && soldRewards.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <p className="text-gray-500 mb-4">아직 투자가 없습니다.</p>
                <button
                  onClick={() => router.push('/accounts')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  통장에서 투자하기
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}


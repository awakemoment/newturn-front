'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSavingsReward, sellSavingsReward, type SavingsReward } from '@/lib/api/accounts'

export default function InvestmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const rewardId = parseInt(params.id as string)

  const [reward, setReward] = useState<SavingsReward | null>(null)
  const [loading, setLoading] = useState(true)
  const [selling, setSelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (rewardId) {
      loadReward()
    }
  }, [rewardId])

  const loadReward = async () => {
    try {
      const data = await getSavingsReward(rewardId)
      setReward(data)
    } catch (error) {
      console.error('투자 정보 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSell = async () => {
    if (!reward || !reward.can_sell) return

    const isProfitable = reward.is_profitable
    const confirmMessage = isProfitable
      ? '정말 매도하시겠습니까? 수익이 실현됩니다.'
      : '손실 상태에서 매도하시겠습니까? Marshmallow Experiment에 따르면 인내심을 가지고 보유하면 회복 가능성이 있습니다. 그래도 매도하시겠습니까?'
    
    if (!confirm(confirmMessage)) {
      return
    }

    setSelling(true)
    setError(null)
    try {
      await sellSavingsReward(rewardId)
      router.push('/investments')
    } catch (err: any) {
      setError(err.message || '매도에 실패했습니다.')
    } finally {
      setSelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  if (!reward) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">투자 정보를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push('/investments')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            투자 목록으로
          </button>
        </div>
      </div>
    )
  }

  const purchasePrice = Number(reward.purchase_price || 0)
  const shares = Number(reward.shares || 0)
  const currentValue = Number(reward.current_value || 0)
  const purchaseCost = purchasePrice * shares
  const profit = currentValue - purchaseCost
  const profitRate = Number(reward.return_rate || 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-green-600 cursor-pointer" onClick={() => router.push('/')}>
              Newturn
            </h1>
            <button onClick={() => router.push('/investments')} className="text-gray-600 hover:text-gray-900 text-sm">
              투자 목록
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 종목 정보 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-gray-900">{reward.stock.stock_code}</span>
            <span className="text-lg text-gray-600">{reward.stock.stock_name}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">투자 금액</div>
              <div className="text-xl font-semibold text-gray-900">${Number(reward.savings_amount || 0).toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">매수 가격</div>
              <div className="text-xl font-semibold text-gray-900">${purchasePrice.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">매수 주수</div>
              <div className="text-xl font-semibold text-gray-900">{shares.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">매수일</div>
              <div className="text-sm font-semibold text-gray-900">
                {new Date(reward.purchase_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* 현재 상태 */}
        <div className={`rounded-xl border-2 p-6 shadow-sm mb-6 ${
          reward.is_profitable 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">현재 상태</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600">현재가</div>
              <div className="text-xl font-semibold text-gray-900">
                ${Number(reward.current_price || 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">현재 가치</div>
              <div className="text-xl font-semibold text-gray-900">
                ${currentValue.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">수익률</div>
              <div className={`text-xl font-semibold ${profitRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">수익</div>
              <div className={`text-xl font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${profit >= 0 ? '+' : ''}{profit.toFixed(2)}
              </div>
            </div>
          </div>

          {reward.status === 'invested' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {reward.can_sell ? (
                <div>
                  {reward.is_profitable ? (
                    <p className="text-sm text-green-700 mb-3">
                      ✅ 수익 상태입니다. 매도할 수 있습니다.
                    </p>
                  ) : (
                    <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800 mb-3">
                      ⚠️ 손실 상태입니다. Marshmallow Experiment에 따르면 인내심을 가지고 보유하면 회복 가능성이 있습니다. 그래도 매도하시겠습니까?
                    </div>
                  )}
                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 mb-3">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handleSell}
                    disabled={selling}
                    className={`w-full px-4 py-3 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                      reward.is_profitable
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    {selling ? '매도 중...' : '매도하기'}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-red-700 mb-3">
                    ⏸️ 매도할 수 없는 상태입니다.
                  </p>
                  <div className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg text-center font-medium">
                    매도 불가
                  </div>
                </div>
              )}
            </div>
          )}

          {reward.status === 'sold' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">매도 완료</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">매도 가격:</span>
                  <span className="ml-2 font-semibold">${Number(reward.sell_price || 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">매도일:</span>
                  <span className="ml-2 font-semibold">
                    {reward.sell_date ? new Date(reward.sell_date).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">수수료:</span>
                  <span className="ml-2 font-semibold">${Number(reward.commission || 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">순수익:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    ${Number(reward.net_proceeds || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 투자 정보 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">투자 정보</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">절약 기간:</span>
              <span className="font-semibold">
                {new Date(reward.period_start).toLocaleDateString()} ~ {new Date(reward.period_end).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">예산:</span>
              <span className="font-semibold">${Number(reward.budget || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">실제 사용:</span>
              <span className="font-semibold">${Number(reward.actual_spent || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">절약 금액:</span>
              <span className="font-semibold text-green-600">${Number(reward.savings_amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">상태:</span>
              <span className={`font-semibold ${
                reward.status === 'invested' ? 'text-blue-600' :
                reward.status === 'sold' ? 'text-green-600' :
                reward.status === 'locked' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {reward.status === 'invested' ? '투자 중' :
                 reward.status === 'sold' ? '매도 완료' :
                 reward.status === 'locked' ? '보유 강제' :
                 '대기 중'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ValuationDashboard from '@/components/ValuationDashboard'
import MateInfoModal from '@/components/MateInfoModal'
import DisclaimerFooter from '@/components/DisclaimerFooter'

interface ProperPrice {
  mate_type: string
  proper_price: number
  current_price: number
  gap_ratio: number
  calculation_method: string
  recommendation: string
}

interface Signal {
  watchlist_id: number
  stock: {
    id: number
    stock_code: string
    stock_name: string
  }
  current_price: number
  proper_price: number
  gap_ratio: number
  signal: string
  icon: string
  mate: string
  all_proper_prices?: ProperPrice[]
}

export default function WatchlistPage() {
  const router = useRouter()
  const [buySignals, setBuySignals] = useState<Signal[]>([])
  const [sellSignals, setSellSignals] = useState<Signal[]>([])
  const [holdSignals, setHoldSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStock, setSelectedStock] = useState<Signal | null>(null)
  const [selectedMate, setSelectedMate] = useState<string | null>(null)

  useEffect(() => {
    fetchSignals()
  }, [])

  const fetchSignals = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/watchlist/signals/')
      const data = await response.json()
      
      setBuySignals(data.buy_signals || [])
      setSellSignals(data.sell_signals || [])
      setHoldSignals(data.hold_signals || [])
    } catch (error) {
      console.error('Failed to fetch signals:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMateIcon = (mate: string) => {
    const icons: Record<string, string> = {
      benjamin: '🎩',
      fisher: '🌱',
      greenblatt: '🔮',
      lynch: '🎯'
    }
    return icons[mate] || '🤖'
  }

  const getMateName = (mate: string) => {
    const names: Record<string, string> = {
      benjamin: '베니',
      fisher: '그로우',
      greenblatt: '매직',
      lynch: '데일리'
    }
    return names[mate] || mate
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-green-600 cursor-pointer" onClick={() => router.push('/')}>
                newturn
              </h1>
              <h2 className="text-lg font-semibold text-gray-900">⭐ 관심 종목</h2>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-600">데이터 로딩 중...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 저평가 알림 */}
            {buySignals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-2xl font-bold text-green-600">🟢 저평가 알림</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {buySignals.length}개
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {buySignals.map((signal) => (
                    <div 
                      key={signal.watchlist_id}
                      className="bg-white rounded-xl border-2 border-green-200 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{signal.stock.stock_name}</div>
                          <div className="text-sm text-gray-500">{signal.stock.stock_code}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">{getMateIcon(signal.mate)} {getMateName(signal.mate)} 기준</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600">현재가</div>
                          <div className="text-xl font-bold text-gray-900">${signal.current_price.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">적정가</div>
                          <div className="text-xl font-bold text-green-600">${signal.proper_price.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-green-700">{signal.signal}</span>
                          <span className="text-2xl font-bold text-green-600">{signal.gap_ratio.toFixed(1)}%</span>
                        </div>
                        <div className="text-sm text-green-600 mt-2">
                          {Math.abs(signal.gap_ratio).toFixed(1)}% 저평가 상태입니다!
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedStock(signal)
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                        >
                          📊 전체 밸류에이션 보기
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/stocks/${signal.stock.id}`)
                          }}
                          className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                        >
                          상세 정보 →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 고평가 알림 */}
            {sellSignals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-2xl font-bold text-red-600">🔴 고평가 알림</h3>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                    {sellSignals.length}개
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sellSignals.map((signal) => (
                    <div 
                      key={signal.watchlist_id}
                      className="bg-white rounded-xl border-2 border-red-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/stocks/${signal.stock.id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{signal.stock.stock_name}</div>
                          <div className="text-sm text-gray-500">{signal.stock.stock_code}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">{getMateIcon(signal.mate)} {getMateName(signal.mate)} 기준</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600">현재가</div>
                          <div className="text-xl font-bold text-gray-900">${signal.current_price.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">적정가</div>
                          <div className="text-xl font-bold text-red-600">${signal.proper_price.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-red-700">{signal.signal}</span>
                          <span className="text-2xl font-bold text-red-600">+{signal.gap_ratio.toFixed(1)}%</span>
                        </div>
                        <div className="text-sm text-red-600 mt-2">
                          {signal.gap_ratio.toFixed(1)}% 고평가 상태입니다.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 적정가 범위 */}
            {holdSignals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-2xl font-bold text-gray-700">🟡 적정가 범위</h3>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                    {holdSignals.length}개
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {holdSignals.map((signal) => (
                    <div 
                      key={signal.watchlist_id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/stocks/${signal.stock.id}`)}
                    >
                      <div className="font-bold text-lg text-gray-900 mb-1">{signal.stock.stock_name}</div>
                      <div className="text-sm text-gray-500 mb-3">{signal.stock.stock_code}</div>
                      
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">현재가</span>
                        <span className="font-bold">${signal.current_price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-gray-600">적정가</span>
                        <span className="font-bold">${signal.proper_price.toFixed(2)}</span>
                      </div>
                      
                      <div className="bg-gray-50 rounded px-3 py-2 text-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {signal.gap_ratio > 0 ? '+' : ''}{signal.gap_ratio.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 빈 상태 */}
            {buySignals.length === 0 && sellSignals.length === 0 && holdSignals.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">관심 종목을 추가해보세요</h3>
                <p className="text-gray-600 mb-6">
                  스크리닝에서 마음에 드는 종목을 발견하고<br />
                  관심 종목에 추가하면 적정가격을 자동으로 계산해드립니다!
                </p>
                <button
                  onClick={() => router.push('/screen')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  종목 탐색하러 가기 →
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Legal Disclaimer */}
      <DisclaimerFooter />

      {/* Valuation Modal */}
      {selectedStock && selectedStock.all_proper_prices && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedStock.stock.stock_name}</h2>
                <p className="text-sm text-gray-600">{selectedStock.stock.stock_code}</p>
              </div>
              <button
                onClick={() => setSelectedStock(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ValuationDashboard
                currentPrice={selectedStock.current_price}
                properPrices={selectedStock.all_proper_prices}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mate Info Modal */}
      {selectedMate && (
        <MateInfoModal
          isOpen={!!selectedMate}
          onClose={() => setSelectedMate(null)}
          mateType={selectedMate}
        />
      )}
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPortfolios, deletePortfolio, type Portfolio } from '@/lib/api/portfolio'
import AddPortfolioModal from '@/components/add-portfolio-modal'

export default function PortfolioPage() {
  const router = useRouter()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadPortfolios()
  }, [])

  const loadPortfolios = async () => {
    try {
      setLoading(true)
      const data = await getPortfolios()
      setPortfolios(data)
    } catch (err) {
      setError('포트폴리오를 불러오는 중 오류가 발생했습니다')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    try {
      await deletePortfolio(id)
      setPortfolios(portfolios.filter(p => p.id !== id))
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다')
      console.error(err)
    }
  }

  const handleAddSuccess = () => {
    setShowAddModal(false)
    loadPortfolios()
  }

  const calculateReturn = (purchasePrice: string, currentPrice?: number) => {
    if (!currentPrice) return null
    const purchase = parseFloat(purchasePrice)
    const returnPct = ((currentPrice - purchase) / purchase) * 100
    return returnPct
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-green-600 cursor-pointer" onClick={() => router.push('/')}>
                newturn
              </h1>
              <span className="text-gray-700">내 포트폴리오</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                종목 추가
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {!loading && portfolios.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">포트폴리오가 비어있습니다</h3>
            <p className="mt-2 text-gray-500">첫 번째 종목을 추가해보세요</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              종목 추가
            </button>
          </div>
        )}

        {!loading && portfolios.length > 0 && (
          <div>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">보유 종목</div>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {portfolios.filter(p => !p.is_sold).length}개
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">총 투자금액</div>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  ${portfolios
                    .filter(p => !p.is_sold)
                    .reduce((sum, p) => sum + (parseFloat(p.purchase_price) * p.shares), 0)
                    .toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">매도 완료</div>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {portfolios.filter(p => p.is_sold).length}개
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">평균 보유기간</div>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {Math.floor(
                    portfolios
                      .filter(p => !p.is_sold)
                      .reduce((sum, p) => {
                        const days = Math.floor(
                          (new Date().getTime() - new Date(p.purchase_date).getTime()) / (1000 * 60 * 60 * 24)
                        )
                        return sum + days
                      }, 0) / (portfolios.filter(p => !p.is_sold).length || 1)
                  )}일
                </div>
              </div>
            </div>

            {/* Portfolio Cards */}
            <div className="space-y-4">
              {portfolios.filter(p => !p.is_sold).map((portfolio) => {
                const returnPct = calculateReturn(portfolio.purchase_price)
                const isProfit = returnPct !== null && returnPct > 0
                
                return (
                  <div
                    key={portfolio.id}
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900">
                            {portfolio.stock.stock_code}
                          </h3>
                          <span className="text-gray-600">{portfolio.stock.stock_name}</span>
                          
                          {/* 시그널 배지 */}
                          {portfolio.holding_signals && portfolio.holding_signals.length > 0 && (() => {
                            const latestSignal = portfolio.holding_signals[0]
                            const getSignalConfig = (signal: string) => {
                              const configs: Record<string, { bg: string, text: string, label: string }> = {
                                'STRONG_HOLD': { bg: 'bg-green-100', text: 'text-green-700', label: '✓ 강력 보유' },
                                'HOLD': { bg: 'bg-blue-100', text: 'text-blue-700', label: '보유' },
                                'REVIEW': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '⚠ 재검토' },
                                'CONSIDER_SELL': { bg: 'bg-orange-100', text: 'text-orange-700', label: '매도 고려' },
                              }
                              return configs[signal] || { bg: 'bg-gray-100', text: 'text-gray-700', label: signal }
                            }
                            const config = getSignalConfig(latestSignal.signal)
                            return (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                                {config.label}
                              </span>
                            )
                          })()}
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-gray-600">매수일</div>
                            <div className="mt-1 font-semibold text-gray-900">
                              {new Date(portfolio.purchase_date).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">매수가</div>
                            <div className="mt-1 font-semibold text-gray-900">
                              ${parseFloat(portfolio.purchase_price).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">보유 수량</div>
                            <div className="mt-1 font-semibold text-gray-900">
                              {portfolio.shares.toLocaleString()}주
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">투자금액</div>
                            <div className="mt-1 font-semibold text-gray-900">
                              ${(parseFloat(portfolio.purchase_price) * portfolio.shares).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                        </div>

                        {portfolio.memo && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600">매수 메모</div>
                            <div className="mt-1 text-gray-900">{portfolio.memo}</div>
                          </div>
                        )}

                        {portfolio.sell_criteria && (
                          <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                            <div className="text-sm text-yellow-800">매도 기준</div>
                            <div className="mt-1 text-yellow-900">{portfolio.sell_criteria}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => router.push(`/portfolio/${portfolio.id}`)}
                          className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          상세
                        </button>
                        <button
                          onClick={() => handleDelete(portfolio.id)}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Sold Stocks */}
            {portfolios.filter(p => p.is_sold).length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-900 mb-4">매도 완료</h2>
                <div className="space-y-2">
                  {portfolios.filter(p => p.is_sold).map((portfolio) => (
                    <div
                      key={portfolio.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-900">{portfolio.stock.stock_code}</span>
                          <span className="ml-2 text-gray-600">{portfolio.stock.stock_name}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {portfolio.sold_date && new Date(portfolio.sold_date).toLocaleDateString('ko-KR')} 매도
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Portfolio Modal */}
      {showAddModal && (
        <AddPortfolioModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  )
}


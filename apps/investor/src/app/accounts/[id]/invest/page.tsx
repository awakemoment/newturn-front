'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getMonthlySavings, investSavings } from '@/lib/api/accounts'
import { searchStocks, type Stock } from '@/lib/api/stocks'

export default function InvestPage() {
  const router = useRouter()
  const params = useParams()
  const accountId = parseInt(params.id as string)

  const [savings, setSavings] = useState<number>(0)
  const [query, setQuery] = useState('')
  const [stocks, setStocks] = useState<Stock[]>([])
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(false)
  const [investing, setInvesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (accountId) {
      loadSavings()
    }
  }, [accountId])

  const loadSavings = async () => {
    try {
      const data = await getMonthlySavings(accountId)
      setSavings(data.savings)
    } catch (error) {
      console.error('절약 금액 로딩 실패:', error)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    try {
      const data = await searchStocks(query)
      setStocks(data.results)
    } catch (err: any) {
      setError(err.message || '종목 검색에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleInvest = async () => {
    if (!selectedStock) return

    setInvesting(true)
    setError(null)
    try {
      await investSavings(accountId, selectedStock.id)
      router.push(`/accounts/${accountId}`)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || '투자에 실패했습니다.'
      console.error('투자 실패:', err.response?.data || err)
      setError(errorMessage)
    } finally {
      setInvesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-green-600 cursor-pointer" onClick={() => router.push('/')}>
              Newturn
            </h1>
            <button 
              onClick={() => router.push(`/accounts/${accountId}`)} 
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              취소
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">절약 금액으로 투자하기</h2>

        {/* 절약 금액 표시 */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <div className="text-sm text-green-700 mb-2">이번 달 절약 금액</div>
          <div className="text-3xl font-bold text-green-600">${savings.toFixed(2)}</div>
          <p className="text-sm text-green-600 mt-2">
            이 금액으로 주식을 매수하고, 수익이 나면 매도할 수 있습니다.
          </p>
        </div>

        {savings <= 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500 mb-4">절약 금액이 없습니다.</p>
            <button
              onClick={() => router.push(`/accounts/${accountId}`)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              통장으로 돌아가기
            </button>
          </div>
        ) : (
          <>
            {/* 종목 검색 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">투자할 종목 선택</h3>
              
              <form onSubmit={handleSearch} className="mb-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="종목명 또는 종목 코드로 검색 (예: NVDA, NVIDIA)"
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? '검색 중...' : '검색'}
                  </button>
                </div>
              </form>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600 mb-4">
                  {error}
                </div>
              )}

              {/* 검색 결과 */}
              {stocks.length > 0 && (
                <div className="space-y-2">
                  {stocks.map((stock) => (
                    <button
                      key={stock.id}
                      onClick={() => setSelectedStock(stock)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selectedStock?.id === stock.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900">{stock.stock_code}</span>
                            <span className="text-gray-600">{stock.stock_name}</span>
                          </div>
                          {stock.exchange && (
                            <div className="text-xs text-gray-500 mt-1">
                              {stock.exchange.toUpperCase()}
                            </div>
                          )}
                        </div>
                        {selectedStock?.id === stock.id && (
                          <span className="text-green-600">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 투자 확인 */}
            {selectedStock && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">투자 확인</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">종목:</span>
                    <span className="font-semibold">{selectedStock.stock_code} - {selectedStock.stock_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">투자 금액:</span>
                    <span className="font-semibold">${savings.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      • 수익이 나면 매도할 수 있습니다.<br/>
                      • 손실이면 보유를 유지해야 합니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/accounts/${accountId}`)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleInvest}
                    disabled={investing}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {investing ? '투자 중...' : '투자하기'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}


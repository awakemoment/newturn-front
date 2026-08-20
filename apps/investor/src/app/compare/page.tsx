'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { searchStocks, compareStocks, getStock, type Stock } from '@/lib/api/stocks'
import { useComparisonCart } from '@/lib/hooks/useComparisonCart'
import AppHeader from '@/components/AppHeader'

export default function ComparePage() {
  const router = useRouter()
  const { stocks: cartStocks, clearAll } = useComparisonCart()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Stock[]>([])
  const [selectedStocks, setSelectedStocks] = useState<Stock[]>([])
  const [comparison, setComparison] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCart, setLoadingCart] = useState(true)

  // 장바구니 종목 자동 로드
  useEffect(() => {
    const loadCartStocks = async () => {
      if (cartStocks.length > 0) {
        try {
          const stockPromises = cartStocks.map(async (item) => {
            try {
              const stockDetail = await getStock(item.id)
              // StockDetail을 Stock으로 변환
              const stock: Stock = {
                id: stockDetail.id,
                stock_code: stockDetail.stock_code,
                stock_name: stockDetail.stock_name,
                stock_name_en: stockDetail.stock_name_en,
                exchange: stockDetail.exchange,
                sector: stockDetail.sector,
              }
              return stock
            } catch {
              return null
            }
          })
          
          const stockResults = await Promise.all(stockPromises)
          const validStocks: Stock[] = stockResults.filter((s): s is Stock => s !== null)
          setSelectedStocks(validStocks)
        } catch (error) {
          console.error('Failed to load cart stocks:', error)
        }
      }
      setLoadingCart(false)
    }

    loadCartStocks()
  }, [cartStocks.length])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (query.length < 2) return

    try {
      const data = await searchStocks(query)
      setSearchResults(data.results)
    } catch (err) {
      console.error(err)
    }
  }

  const addStock = (stock: Stock) => {
    if (selectedStocks.length >= 5) {
      alert('최대 5개까지 선택 가능합니다')
      return
    }
    
    if (selectedStocks.find(s => s.id === stock.id)) {
      alert('이미 추가된 종목입니다')
      return
    }

    setSelectedStocks([...selectedStocks, stock])
    setSearchResults([])
    setQuery('')
  }

  const removeStock = (stockId: number) => {
    setSelectedStocks(selectedStocks.filter(s => s.id !== stockId))
  }

  const handleCompare = async () => {
    if (selectedStocks.length < 2) {
      alert('최소 2개 종목을 선택해주세요')
      return
    }

    setLoading(true)
    try {
      const data = await compareStocks(selectedStocks.map(s => s.id))
      setComparison(data.comparison)
    } catch (err) {
      console.error(err)
      alert('비교 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (num: number) => {
    const billion = num / 1_000_000_000
    return billion >= 1 ? `$${billion.toFixed(2)}B` : `$${(num / 1_000_000).toFixed(2)}M`
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader active="compare" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">종목 비교</h2>
        {/* Search & Selected */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              비교할 종목 선택 (최대 5개)
            </h2>
            {selectedStocks.length > 0 && (
              <button
                onClick={() => {
                  setSelectedStocks([])
                  clearAll()
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                전체 삭제
              </button>
            )}
          </div>

          {/* Selected Stocks */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {selectedStocks.map(stock => (
                <div 
                  key={stock.id}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg"
                >
                  <span className="font-medium">{stock.stock_code}</span>
                  <span className="text-sm">{stock.stock_name.substring(0, 20)}</span>
                  <button
                    onClick={() => removeStock(stock.id)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              ))}
              {selectedStocks.length === 0 && (
                <div className="text-gray-400 text-sm">종목을 검색해서 추가하세요</div>
              )}
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="종목 검색 (예: Apple, AAPL)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              검색
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 border rounded-lg divide-y max-h-60 overflow-y-auto">
              {searchResults.map(stock => (
                <button
                  key={stock.id}
                  onClick={() => addStock(stock)}
                  className="w-full p-3 hover:bg-gray-50 text-left flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium">{stock.stock_code}</span>
                    <span className="ml-2 text-gray-600">{stock.stock_name}</span>
                  </div>
                  <span className="text-blue-600 text-sm">+ 추가</span>
                </button>
              ))}
            </div>
          )}

          {/* Compare Button */}
          {selectedStocks.length >= 2 && (
            <button
              onClick={handleCompare}
              disabled={loading}
              className="mt-4 w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? '비교 중...' : `🔍 ${selectedStocks.length}개 종목 비교하기`}
            </button>
          )}
        </div>

        {/* Comparison Results */}
        {comparison.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">비교 결과</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">종목</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">FCF</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">FCF 마진</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ROE</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">부채비율</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">매출</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comparison.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={() => router.push(`/stocks/${item.stock.id}`)}
                        >
                          {item.stock.stock_code}
                        </div>
                        <div className="text-sm text-gray-500">{item.stock.stock_name.substring(0, 25)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={item.ttm_fcf > 0 ? 'text-blue-600 font-semibold' : 'text-red-600'}>
                          {formatCurrency(item.ttm_fcf)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={item.fcf_margin > 5 ? 'text-green-600' : 'text-gray-900'}>
                          {item.fcf_margin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={item.roe > 15 ? 'text-green-600' : 'text-gray-900'}>
                          {item.roe.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={item.debt_ratio < 100 ? 'text-green-600' : 'text-orange-600'}>
                          {item.debt_ratio.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                        {formatCurrency(item.ttm_revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Visual Comparison */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* FCF 비교 */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">FCF 비교</h3>
                {comparison.map((item, index) => {
                  const maxFcf = Math.max(...comparison.map(c => c.ttm_fcf))
                  const width = maxFcf > 0 ? (item.ttm_fcf / maxFcf) * 100 : 0
                  return (
                    <div key={index} className="mb-2">
                      <div className="text-xs text-gray-600 mb-1">{item.stock.stock_code}</div>
                      <div className="h-6 bg-gray-100 rounded">
                        <div 
                          className={`h-full rounded ${item.ttm_fcf > 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.abs(width)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{formatCurrency(item.ttm_fcf)}</div>
                    </div>
                  )
                })}
              </div>

              {/* ROE 비교 */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">ROE 비교</h3>
                {comparison.map((item, index) => {
                  const maxRoe = Math.max(...comparison.map(c => c.roe))
                  const width = maxRoe > 0 ? (item.roe / maxRoe) * 100 : 0
                  return (
                    <div key={index} className="mb-2">
                      <div className="text-xs text-gray-600 mb-1">{item.stock.stock_code}</div>
                      <div className="h-6 bg-gray-100 rounded">
                        <div 
                          className={`h-full rounded ${item.roe > 15 ? 'bg-green-500' : 'bg-orange-500'}`}
                          style={{ width: `${Math.abs(width)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{item.roe.toFixed(1)}%</div>
                    </div>
                  )
                })}
              </div>

              {/* 부채비율 비교 */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">부채비율 비교</h3>
                {comparison.map((item, index) => {
                  const maxDebt = Math.max(...comparison.map(c => c.debt_ratio))
                  const width = maxDebt > 0 ? (item.debt_ratio / maxDebt) * 100 : 0
                  return (
                    <div key={index} className="mb-2">
                      <div className="text-xs text-gray-600 mb-1">{item.stock.stock_code}</div>
                      <div className="h-6 bg-gray-100 rounded">
                        <div 
                          className={`h-full rounded ${item.debt_ratio < 100 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{item.debt_ratio.toFixed(1)}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { screenStocks, getScreeningTable, type ScreeningTableRow } from '@/lib/api/stocks'
import { useComparisonCart } from '@/lib/hooks/useComparisonCart'
import { addToWatchlist } from '@/lib/api/watchlist'
import DisclaimerFooter from '@/components/DisclaimerFooter'

interface StockCard {
  id: number
  name: string
  ticker: string
  industry: string
  color: string
  roe?: number
  fcf_margin?: number
}

export default function ScreenPage() {
  const router = useRouter()
  const { stocks: comparisonStocks, addStock, removeStock, hasStock, count } = useComparisonCart()
  const [selectedMarket, setSelectedMarket] = useState('전체 시장')
  const [selectedIndustry, setSelectedIndustry] = useState('전체 산업군')
  const [selectedCuration, setSelectedCuration] = useState(1)
  const [showAddedNotification, setShowAddedNotification] = useState(false)
  const [stockCards, setStockCards] = useState<StockCard[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table') // 기본값 테이블
  const [tableData, setTableData] = useState<ScreeningTableRow[]>([])
  const [sortBy, setSortBy] = useState<'benjamin' | 'fisher' | 'greenblatt' | 'lynch' | 'avg'>('avg')
  const [addedToWatchlist, setAddedToWatchlist] = useState<Set<number>>(new Set())

  const curations = [
    { id: 1, icon: '🎩', name: '베니 관점 우량주', desc: '안전마진', color: 'text-blue-600', filter: { mate: 'benjamin', min_mate_score: 70, sort: 'mate_score' as const } },
    { id: 2, icon: '🌱', name: '그로우 관점 성장주', desc: '성장성', color: 'text-green-600', filter: { mate: 'fisher', min_mate_score: 70, sort: 'mate_score' as const } },
    { id: 3, icon: '🔮', name: '매직 관점 우량주', desc: '마법공식', color: 'text-purple-600', filter: { mate: 'greenblatt', min_mate_score: 70, sort: 'mate_score' as const } },
    { id: 4, icon: '🎯', name: '데일리 관점 종목', desc: '일상발견', color: 'text-orange-600', filter: { mate: 'lynch', min_mate_score: 70, sort: 'mate_score' as const } },
  ]

  useEffect(() => {
    if (viewMode === 'card') {
      fetchStocks()
    } else {
      fetchTableData()
    }
  }, [selectedCuration, viewMode, sortBy])

  const fetchStocks = async () => {
    setLoading(true)
    try {
      // 테이블 데이터로 가져와서 메이트 점수 포함
      const curation = curations.find(c => c.id === selectedCuration)
      const mateType = curation?.filter.mate || 'benjamin'
      
      const data = await getScreeningTable({ 
        sort_by: mateType as any,
        min_avg_score: 60  // 평균 60점 이상만
      })

      const colors = ['bg-gray-400', 'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-black']
      
      const cards: StockCard[] = (data.results || []).slice(0, 12).map((item: any, index: number) => ({
        id: item.stock.id,
        name: item.stock.stock_name,
        ticker: item.stock.stock_code,
        industry: '기타',  // sector 정보 없음
        color: colors[index % colors.length],
        roe: undefined,
        fcf_margin: undefined,
      }))

      setStockCards(cards)
      
      // 테이블 데이터도 저장 (카드에서 메이트 점수 표시용)
      setTableData(data.results.slice(0, 12))
    } catch (error) {
      console.error('Failed to fetch stocks:', error)
      setStockCards([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTableData = async () => {
    setLoading(true)
    try {
      const data = await getScreeningTable({ sort_by: sortBy })
      setTableData(data.results)
    } catch (error) {
      console.error('Failed to fetch table data:', error)
      setTableData([])
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 70) return 'text-blue-600 bg-blue-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return '🟢'
    if (score >= 70) return '🔵'
    if (score >= 60) return '🟡'
    return '⚪'
  }

  const handleAddToComparison = (stock: StockCard) => {
    const added = addStock({
      id: stock.id,
      stock_code: stock.ticker,
      stock_name: stock.name,
    })
    if (added) {
      setShowAddedNotification(true)
      setTimeout(() => setShowAddedNotification(false), 3000)
    }
  }

  const handleAddToWatchlist = async (stockId: number) => {
    try {
      // 이미 추가되었는지 확인
      if (addedToWatchlist.has(stockId)) {
        alert('이미 관심종목에 추가되어 있습니다.')
        return
      }
      
      await addToWatchlist({ stock_id: stockId })
      setAddedToWatchlist(prev => new Set(prev).add(stockId))
      
      // 성공 알림
      alert('✅ 관심종목에 추가되었습니다!\n📊 적정가격을 자동으로 계산 중입니다...')
    } catch (error) {
      console.error('Failed to add to watchlist:', error)
      alert('❌ 관심종목 추가에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-green-600 cursor-pointer" onClick={() => router.push('/')}>
                newturn
              </h1>
              <button 
                onClick={() => router.push('/watchlist')}
                className="text-gray-700 hover:text-gray-900 flex items-center gap-2"
              >
                ⭐ 관심종목
              </button>
              <button 
                onClick={() => router.push('/portfolio')}
                className="text-gray-700 hover:text-gray-900"
              >
                포트폴리오
              </button>
            </div>

            {/* Right: Search */}
            <div className="flex items-center gap-4">
              <button className="p-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Left: View Mode Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-green-600 shadow-sm font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📊 테이블
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    viewMode === 'card'
                      ? 'bg-white text-green-600 shadow-sm font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🎴 카드
                </button>
              </div>

              {viewMode === 'card' && (
                <>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    {selectedMarket}
                  </button>

                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    {selectedIndustry}
                  </button>
                </>
              )}
            </div>

            {/* Right: Comparison Cart */}
            <button 
              onClick={() => router.push('/compare')}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              종목 비교함 보기
              <span className="ml-1 px-2 py-0.5 bg-white text-green-600 rounded font-semibold">
                {count}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {showAddedNotification && (
        <div className="bg-green-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <span>종목 비교함에 추가했어요!</span>
              <button 
                onClick={() => router.push('/compare')}
                className="flex items-center gap-2 text-white hover:underline"
              >
                종목 비교함 보기 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Curation Tabs - 카드 뷰일 때만 */}
      {viewMode === 'card' && (
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-3">
              {curations.map((curation) => (
                <button
                  key={curation.id}
                  onClick={() => setSelectedCuration(curation.id)}
                  className={`flex-shrink-0 px-6 py-3 rounded-lg whitespace-nowrap transition-all ${
                    selectedCuration === curation.id
                      ? 'bg-green-50 text-green-600 border-2 border-green-500 shadow-sm'
                      : 'border-2 border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">{curation.icon}</span>
                    <span className="text-sm font-semibold">{curation.name}</span>
                    <span className="text-xs text-gray-500">{curation.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table Sort Bar - 테이블 뷰일 때만 */}
      {viewMode === 'table' && (
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">정렬:</span>
              {[
                { value: 'avg' as const, label: '평균 점수', icon: '⭐' },
                { value: 'benjamin' as const, label: '베니', icon: '🎩' },
                { value: 'fisher' as const, label: '그로우', icon: '🌱' },
                { value: 'greenblatt' as const, label: '매직', icon: '🔮' },
                { value: 'lynch' as const, label: '데일리', icon: '🎯' },
              ].map((sort) => (
                <button
                  key={sort.value}
                  onClick={() => setSortBy(sort.value)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    sortBy === sort.value
                      ? 'bg-green-500 text-white shadow-sm font-semibold'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {sort.icon} {sort.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-600">데이터 로딩 중...</p>
          </div>
        ) : viewMode === 'table' ? (
          /* 테이블 뷰 */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      종목
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      🎩 베니
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      🌱 그로우
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      🔮 매직
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      🎯 데일리
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider bg-green-50">
                      ⭐ 평균
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tableData.map((row, index) => (
                    <tr 
                      key={row.stock.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/stocks/${row.stock.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{row.stock.stock_name}</div>
                          <div className="text-sm text-gray-500">{row.stock.stock_code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(row.benjamin)}`}>
                          {getScoreIcon(row.benjamin)} {row.benjamin}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(row.fisher)}`}>
                          {getScoreIcon(row.fisher)} {row.fisher}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(row.greenblatt)}`}>
                          {getScoreIcon(row.greenblatt)} {row.greenblatt}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(row.lynch)}`}>
                          {getScoreIcon(row.lynch)} {row.lynch}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center bg-green-50">
                        <span className="text-xl font-bold text-green-600">
                          {row.avg_score}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddToWatchlist(row.stock.id)
                            }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              addedToWatchlist.has(row.stock.id)
                                ? 'bg-yellow-500 text-white'
                                : 'bg-white border border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                            }`}
                            disabled={addedToWatchlist.has(row.stock.id)}
                          >
                            {addedToWatchlist.has(row.stock.id) ? '⭐' : '⭐'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              addStock(row.stock)
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              hasStock(row.stock.id)
                                ? 'bg-green-500 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                            disabled={hasStock(row.stock.id)}
                          >
                            {hasStock(row.stock.id) ? '담김 ✓' : '비교'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {tableData.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                조건에 맞는 종목이 없습니다.
              </div>
            )}
          </div>
        ) : (
          /* 카드 뷰 */
          stockCards.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              조건에 맞는 종목이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stockCards.map((stock, index) => {
                // 해당 종목의 메이트 점수 데이터 찾기
                const scoreData = tableData.find(t => t.stock.id === stock.id)
                
                return (
                  <div 
                    key={stock.id} 
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => router.push(`/stocks/${stock.id}`)}
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 ${stock.color} rounded-full flex-shrink-0`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{stock.name}</div>
                        <div className="text-sm text-gray-600">{stock.ticker}</div>
                      </div>
                    </div>

                    {/* 메이트 점수 */}
                    {scoreData && (
                      <div className="mb-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-blue-50 rounded px-2 py-1.5">
                            <div className="text-xs text-blue-600 font-medium">🎩 베니</div>
                            <div className="text-lg font-bold text-blue-700">{scoreData.benjamin}</div>
                          </div>
                          <div className="bg-green-50 rounded px-2 py-1.5">
                            <div className="text-xs text-green-600 font-medium">🌱 그로우</div>
                            <div className="text-lg font-bold text-green-700">{scoreData.fisher}</div>
                          </div>
                          <div className="bg-purple-50 rounded px-2 py-1.5">
                            <div className="text-xs text-purple-600 font-medium">🔮 매직</div>
                            <div className="text-lg font-bold text-purple-700">{scoreData.greenblatt}</div>
                          </div>
                          <div className="bg-orange-50 rounded px-2 py-1.5">
                            <div className="text-xs text-orange-600 font-medium">🎯 데일리</div>
                            <div className="text-lg font-bold text-orange-700">{scoreData.lynch}</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-3 py-2 border border-green-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-green-700">⭐ 평균 점수</span>
                            <span className="text-2xl font-bold text-green-600">{scoreData.avg_score}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Add to Comparison Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToComparison(stock)
                      }}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm ${
                        hasStock(stock.id)
                          ? 'bg-green-500 text-white border border-green-500'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={hasStock(stock.id)}
                    >
                      {hasStock(stock.id) ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          비교함에 담김
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          비교함에 담기
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* Scroll to Top Button */}
        <div className="fixed bottom-8 right-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </main>

      {/* Legal Disclaimer Footer */}
      <DisclaimerFooter />
    </div>
  )
}

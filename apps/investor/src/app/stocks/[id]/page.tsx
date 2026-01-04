'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  getStock, 
  getIndicators, 
  getChartData,
  getScore,
  getMatesAnalysis,
  getTenKInsights,
  type StockDetail,
  type Indicators,
  type ChartData,
  type MateAnalysis,
  type TenKInsight
} from '@/lib/api/stocks'
import { CashflowChart } from '@/components/cashflow-chart'
import TenKInsightsReport from '@/components/TenKInsightsReport'
import LearnTab from './learn-tab'
import DisclaimerFooter from '@/components/DisclaimerFooter'

export default function StockDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const [stock, setStock] = useState<StockDetail | null>(null)
  const [indicators, setIndicators] = useState<Indicators | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [score, setScore] = useState<any>(null)
  const [matesAnalysis, setMatesAnalysis] = useState<any>(null)
  const [selectedMate, setSelectedMate] = useState<'benjamin' | 'fisher' | 'greenblatt' | 'lynch'>('benjamin')
  const [tenKInsights, setTenKInsights] = useState<TenKInsight[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMates, setLoadingMates] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const [stockData, indicatorsData, chartDataRes, scoreData, matesData] = await Promise.all([
          getStock(id),
          getIndicators(id),
          getChartData(id, 20),
          getScore(id).catch(() => null),  // 점수는 선택적
          getMatesAnalysis(id).catch(() => null)  // 메이트 분석도 선택적
        ])
        
        setStock(stockData)
        setIndicators(indicatorsData)
        setChartData(chartDataRes.data)  // 왼쪽→오른쪽 시간 흐름
        setScore(scoreData)
        setMatesAnalysis(matesData)
        
        // 10-K 인사이트
        try {
          const tenKData = await getTenKInsights(id)
          setTenKInsights(tenKData.insights)
        } catch (err) {
          console.log('10-K insights not available')
        }
      } catch (err: any) {
        setError(err.response?.data?.error || '데이터를 불러오는 중 오류가 발생했습니다')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A'
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatCurrency = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A'
    const billion = num / 1_000_000_000
    return billion >= 1
      ? `$${billion.toFixed(2)}B`
      : `$${(num / 1_000_000).toFixed(2)}M`
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-50'
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50'
    if (grade.startsWith('C')) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error || !stock || !indicators) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || '데이터를 찾을 수 없습니다'}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              검색으로 돌아가기
            </button>
            <button
              onClick={() => router.push('/screen')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              스크리닝
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stock Info + Score */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{stock.stock_name}</h1>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xl font-semibold text-blue-600">{stock.stock_code}</span>
                {stock.exchange && (
                  <span className="px-3 py-1 bg-gray-100 rounded text-sm">
                    {stock.exchange.toUpperCase()}
                  </span>
                )}
                {stock.sector && (
                  <span className="text-gray-600">{stock.sector}</span>
                )}
              </div>
            </div>
            
            {/* Score Badge */}
            {score && (
              <div className="text-center">
                <div className={`inline-block px-6 py-3 rounded-lg ${getGradeColor(score.grade)}`}>
                  <div className="text-3xl font-bold">{score.grade}</div>
                  <div className="text-sm mt-1">종합 {score.total_score}점</div>
                </div>
              </div>
            )}
          </div>

          {/* AI Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">🤖 AI 투자 인사이트</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold">{stock.stock_name}</span>은(는) 
                  {indicators.roe >= 20 && ' 뛰어난 자기자본이익률(ROE ' + indicators.roe.toFixed(1) + '%)로 높은 수익성을 보여주고 있으며,'}
                  {indicators.roe >= 10 && indicators.roe < 20 && ' 양호한 수익성(ROE ' + indicators.roe.toFixed(1) + '%)을 보이고 있으며,'}
                  {indicators.fcf_positive_quarters >= 18 && ' 최근 20분기 중 ' + indicators.fcf_positive_quarters + '분기 양수 FCF를 기록하며 안정적인 현금창출력을 입증했습니다.'}
                  {indicators.fcf_positive_quarters >= 12 && indicators.fcf_positive_quarters < 18 && ' ' + indicators.fcf_positive_quarters + '분기 양수 FCF로 양호한 현금흐름을 보이고 있습니다.'}
                  {indicators.debt_ratio < 50 && ' 부채비율 ' + indicators.debt_ratio.toFixed(1) + '%로 매우 건전한 재무구조를 갖추고 있으며,'}
                  {indicators.debt_ratio >= 50 && indicators.debt_ratio < 100 && ' 부채비율 ' + indicators.debt_ratio.toFixed(1) + '%로 안정적인 재무구조이며,'}
                  {(indicators.revenue_growth || 0) > 15 && ' 매출이 전년 대비 ' + (indicators.revenue_growth || 0).toFixed(1) + '% 급성장하고 있어 향후 실적 개선이 기대됩니다.'}
                  {(indicators.revenue_growth || 0) > 5 && (indicators.revenue_growth || 0) <= 15 && ' 매출이 꾸준히 성장하고 있습니다(' + (indicators.revenue_growth || 0).toFixed(1) + '%).'}
                  {score && score.total_score >= 70 && ' 종합 평가 ' + score.grade + ' 등급으로 투자 가치가 높은 기업입니다.'}
                  {score && score.total_score >= 50 && score.total_score < 70 && ' 종합 평가 ' + score.grade + ' 등급으로 관심을 가질 만한 기업입니다.'}
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  * AI가 재무 데이터를 기반으로 자동 생성한 요약입니다. 투자 권유가 아닙니다.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mates Analysis */}
        {matesAnalysis && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🤖 투자 메이트 분석</h2>
            <p className="text-sm text-gray-600 mb-6">4명의 투자 대가가 같은 종목을 어떻게 평가하는지 비교해보세요</p>
            
            {/* Mate Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {[
                { id: 'benjamin', name: '베니', icon: '🎩', desc: '안전마진', fullName: 'Benny' },
                { id: 'fisher', name: '그로우', icon: '🌱', desc: '성장주', fullName: 'Grow' },
                { id: 'greenblatt', name: '매직', icon: '🔮', desc: '마법공식', fullName: 'Magic' },
                { id: 'lynch', name: '데일리', icon: '🎯', desc: '일상발견', fullName: 'Daily' },
              ].map((mate) => (
                <button
                  key={mate.id}
                  onClick={() => setSelectedMate(mate.id as any)}
                  className={`flex-1 min-w-[140px] px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedMate === mate.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{mate.icon}</div>
                  <div className="font-semibold text-gray-900">{mate.name}</div>
                  <div className="text-xs text-gray-500">{mate.desc}</div>
                  {matesAnalysis.mates[mate.id] && (
                    <div className={`mt-2 text-lg font-bold ${
                      matesAnalysis.mates[mate.id].score >= 70 ? 'text-green-600' :
                      matesAnalysis.mates[mate.id].score >= 60 ? 'text-blue-600' :
                      matesAnalysis.mates[mate.id].score >= 50 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {matesAnalysis.mates[mate.id].score}점
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Selected Mate Analysis */}
            {matesAnalysis.mates[selectedMate] && (() => {
              const analysis = matesAnalysis.mates[selectedMate]
              return (
                <div className="border-2 border-green-500 rounded-lg p-6 bg-gradient-to-br from-green-50 to-white">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{analysis.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{analysis.mate} 메이트의 분석</h3>
                      <p className="text-gray-600 text-sm mb-3">{analysis.summary}</p>
                      <div className={`inline-block px-4 py-2 rounded-lg font-bold text-2xl ${
                        analysis.score >= 70 ? 'bg-green-500 text-white' :
                        analysis.score >= 60 ? 'bg-blue-500 text-white' :
                        analysis.score >= 50 ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {analysis.score}점
                      </div>
                    </div>
                  </div>

                  {/* Reasons */}
                  {analysis.reasons && analysis.reasons.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-900 mb-2">✅ 좋은 점:</div>
                      <ul className="space-y-1">
                        {analysis.reasons.map((reason: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cautions */}
                  {analysis.cautions && analysis.cautions.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-900 mb-2">⚠️ 주의할 점:</div>
                      <ul className="space-y-1">
                        {analysis.cautions.map((caution: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>{caution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm font-semibold text-gray-900 mb-2">💡 {analysis.mate}의 판단:</div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {analysis.recommendation}
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Score Details */}
        {score && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">점수 상세</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 현금흐름 */}
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-600 mb-2">💰 현금흐름</div>
                <div className={`text-3xl font-bold ${getScoreColor(score.scores.cashflow)}`}>
                  {score.scores.cashflow}점
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <div>FCF+ 분기: {score.details.fcf_positive_quarters}/20</div>
                  <div>FCF 마진: {score.details.fcf_margin.toFixed(1)}%</div>
                  <div>OCF/순이익: {score.details.ocf_to_net_income?.toFixed(2) || 'N/A'}</div>
                </div>
              </div>

              {/* 안전성 */}
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-600 mb-2">🛡️ 안전성</div>
                <div className={`text-3xl font-bold ${getScoreColor(score.scores.safety)}`}>
                  {score.scores.safety}점
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <div>부채비율: {score.details.debt_ratio.toFixed(1)}%</div>
                  <div>유동비율: {score.details.current_ratio.toFixed(1)}%</div>
                  <div>TTM FCF: {formatCurrency(score.details.ttm_fcf)}</div>
                </div>
              </div>

              {/* 성장성 */}
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-600 mb-2">📈 성장성</div>
                <div className={`text-3xl font-bold ${getScoreColor(score.scores.growth)}`}>
                  {score.scores.growth}점
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <div>ROE: {score.details.roe.toFixed(1)}%</div>
                  <div>매출 성장률: {score.details.revenue_growth !== null ? `${score.details.revenue_growth.toFixed(1)}%` : 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Indicators */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            핵심 지표 (TTM: {indicators.ttm_period})
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* FCF */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">잉여현금흐름 (FCF)</div>
              <div className="mt-1 text-2xl font-bold text-blue-600">
                {formatCurrency(indicators.ttm_fcf)}
              </div>
            </div>

            {/* OCF */}
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">영업현금흐름 (OCF)</div>
              <div className="mt-1 text-2xl font-bold text-green-600">
                {formatCurrency(indicators.ttm_ocf)}
              </div>
            </div>

            {/* FCF Margin */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600">FCF 마진</div>
              <div className="mt-1 text-2xl font-bold text-purple-600">
                {indicators.fcf_margin.toFixed(1)}%
              </div>
            </div>

            {/* ROE */}
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-gray-600">ROE</div>
              <div className="mt-1 text-2xl font-bold text-orange-600">
                {indicators.roe.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-gray-600">부채비율</div>
              <div className="mt-1 text-lg font-semibold">
                {indicators.debt_ratio.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">유동비율</div>
              <div className="mt-1 text-lg font-semibold">
                {indicators.current_ratio.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">매출 성장률 (YoY)</div>
              <div className="mt-1 text-lg font-semibold">
                {indicators.revenue_growth !== null ? `${indicators.revenue_growth.toFixed(1)}%` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">FCF 양수 분기</div>
              <div className="mt-1 text-lg font-semibold">
                {indicators.fcf_positive_quarters}/20
              </div>
            </div>
          </div>
        </div>

        {/* Valuation - 적정가격 계산 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 적정가격 분석 (간단 DCF)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DCF 기반 적정가격 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">현금흐름 할인 모델 (DCF)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">TTM FCF</span>
                  <span className="font-semibold">{formatCurrency(indicators.ttm_fcf)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">성장률 가정</span>
                  <span className="font-semibold">{(indicators.revenue_growth || 5).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">할인율 (WACC)</span>
                  <span className="font-semibold">10%</span>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200 flex justify-between">
                  <span className="text-blue-900 font-semibold">예상 기업가치</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(indicators.ttm_fcf * 15)}
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                * 간단한 멀티플 방식 (FCF × 15배)
              </div>
            </div>

            {/* 현재 시가총액 비교 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">투자 판단</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-600 mb-1">FCF 멀티플</div>
                  <div className="text-2xl font-bold text-gray-900">
                    약 15배 가정
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-xs text-yellow-800">
                    ⚠️ 이 계산은 매우 단순화된 모델입니다. 실제 투자 시에는 더 정교한 분석이 필요합니다.
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <div>✓ 산업 평균 멀티플 미반영</div>
                  <div>✓ 성장률 변동성 미반영</div>
                  <div>✓ 현금 및 부채 미반영</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <>
            {/* FCF Chart */}
            <div className="mb-6">
              <CashflowChart data={chartData} stockName={stock.stock_name} />
            </div>

            {/* Additional Trend Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* ROE 추세 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">ROE 추세</h3>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold mb-2 text-green-600">
                    {indicators.roe.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">현재 ROE</div>
                  {indicators.roe >= 15 && (
                    <div className="mt-3">
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        ✓ 우수
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 부채비율 추세 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">부채비율</h3>
                <div className="text-center py-8">
                  <div className={`text-4xl font-bold mb-2 ${indicators.debt_ratio < 100 ? 'text-green-600' : 'text-orange-600'}`}>
                    {indicators.debt_ratio.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">현재 부채비율</div>
                  <div className="mt-3">
                    <span className={`px-3 py-1 text-xs rounded-full ${indicators.debt_ratio < 100 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {indicators.debt_ratio < 100 ? '✓ 안정적' : '⚠ 주의'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 매출 성장률 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">매출 성장률</h3>
                <div className="text-center py-8">
                  <div className={`text-4xl font-bold mb-2 ${(indicators.revenue_growth || 0) > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {indicators.revenue_growth !== null ? `${indicators.revenue_growth > 0 ? '+' : ''}${indicators.revenue_growth.toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">YoY 성장률</div>
                  {indicators.revenue_growth !== null && indicators.revenue_growth > 10 && (
                    <div className="mt-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        📈 고성장
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sector Comparison */}
        {stock.sector && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📊 동종업계 비교 - {stock.sector}
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">종목</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ROE</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">FCF 마진</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">부채비율</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">매출성장</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">등급</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Current Stock - Highlighted */}
                  <tr className="bg-blue-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-blue-900">{stock.stock_code}</div>
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">현재</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-blue-900">
                      {indicators.roe.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-blue-900">
                      {indicators.fcf_margin.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-blue-900">
                      {indicators.debt_ratio.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-blue-900">
                      {indicators.revenue_growth?.toFixed(1) || 'N/A'}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {score && (
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${getGradeColor(score.grade)}`}>
                          {score.grade}
                        </span>
                      )}
                    </td>
                  </tr>
                  
                  {/* Sector Average */}
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-700">업계 평균</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600">-</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600">-</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600">-</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600">-</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              💡 <strong>업계 비교:</strong> 동종업계 다른 기업들의 데이터는 준비 중입니다. 
              현재 종목의 지표가 업계 평균보다 높은지 확인해보세요.
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            분기별 데이터 (최근 20분기)
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">분기</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">OCF</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">FCF</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">매출</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">순이익</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.period}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      item.ocf && item.ocf > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(item.ocf)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      item.fcf && item.fcf > 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(item.fcf)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                      item.net_income && item.net_income > 0 ? 'text-gray-900' : 'text-red-600'
                    }`}>
                      {formatCurrency(item.net_income)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              💡 <strong>현금흐름 품질:</strong> OCF/순이익 비율 = {indicators.ocf_to_net_income?.toFixed(2) || 'N/A'}
              {indicators.ocf_to_net_income && indicators.ocf_to_net_income > 1 && (
                <span className="text-green-600 font-semibold"> (우수!)</span>
              )}
            </p>
          </div>
        </div>

        {/* 10-K Business Insights - 사업보고서 느낌 */}
        {tenKInsights && tenKInsights.length > 0 && (
          <div className="mb-8">
            <TenKInsightsReport 
              insights={tenKInsights}
              stockName={stock?.stock_name || ''}
              stockCode={stock?.stock_code || ''}
            />
          </div>
        )}

        {/* Learn Section - 학습 콘텐츠 */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <LearnTab
              stockId={id}
              stockCode={stock?.stock_code || ''}
              stockName={stock?.stock_name || ''}
            />
          </div>
        </div>

      </main>

      {/* Legal Disclaimer */}
      <DisclaimerFooter />
    </div>
  )
}

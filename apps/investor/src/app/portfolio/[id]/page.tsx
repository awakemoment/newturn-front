'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getPortfolioDetail, getHoldingDecision, type PortfolioDetail, type HoldingSignalDetail } from '@/lib/api/portfolio'

export default function PortfolioDetailPage() {
  const router = useRouter()
  const params = useParams()
  const portfolioId = parseInt(params.id as string)

  const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(null)
  const [holdingSignal, setHoldingSignal] = useState<HoldingSignalDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingSignal, setLoadingSignal] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPortfolioDetail()
  }, [portfolioId])

  const loadPortfolioDetail = async () => {
    try {
      setLoading(true)
      const data = await getPortfolioDetail(portfolioId)
      setPortfolio(data)
    } catch (err) {
      setError('포트폴리오를 불러오는 중 오류가 발생했습니다')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGetHoldingSignal = async () => {
    try {
      setLoadingSignal(true)
      const signal = await getHoldingDecision(portfolioId)
      setHoldingSignal(signal)
    } catch (err) {
      alert('보유 결정 분석 중 오류가 발생했습니다')
      console.error(err)
    } finally {
      setLoadingSignal(false)
    }
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'STRONG_HOLD':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'HOLD':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'CONSIDER_SELL':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'SELL':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getSignalLabel = (signal: string) => {
    switch (signal) {
      case 'STRONG_HOLD':
        return '강력 보유'
      case 'HOLD':
        return '보유'
      case 'REVIEW':
        return '재검토'
      case 'CONSIDER_SELL':
        return '매도 고려'
      case 'SELL':
        return '매도'
      default:
        return signal
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || '포트폴리오를 찾을 수 없습니다'}</p>
          <button
            onClick={() => router.push('/portfolio')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            목록으로
          </button>
        </div>
      </div>
    )
  }

  const holdingDays = Math.floor(
    (new Date().getTime() - new Date(portfolio.purchase_date).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/portfolio')}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                포트폴리오 목록
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {portfolio.stock.stock_code}
              </h1>
              <p className="mt-2 text-gray-600">{portfolio.stock.stock_name}</p>
            </div>
            <button
              onClick={handleGetHoldingSignal}
              disabled={loadingSignal}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {loadingSignal ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  분석 중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  보유 결정 분석
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Holding Signal */}
        {holdingSignal && (
          <div className={`mb-8 p-6 rounded-lg border-2 ${getSignalColor(holdingSignal.signal)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">
                    {getSignalLabel(holdingSignal.signal)}
                  </h2>
                  {holdingSignal.current_score != null && (
                    <span className="text-lg font-semibold">
                      현재 점수: {holdingSignal.current_score}점
                    </span>
                  )}
                  {holdingSignal.score_change != null && (
                    <span className={`text-lg ${holdingSignal.score_change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      ({holdingSignal.score_change >= 0 ? '+' : ''}{holdingSignal.score_change})
                    </span>
                  )}
                </div>
                {holdingSignal.fcf_trend && (
                  <div className="mt-2 text-sm">
                    FCF 추세: {holdingSignal.fcf_trend}
                  </div>
                )}
                {holdingSignal.warnings && (
                  <div className="mt-3 p-3 bg-white bg-opacity-50 rounded">
                    <div className="font-semibold">⚠️ 경고사항</div>
                    <div className="mt-1 text-sm whitespace-pre-wrap">{holdingSignal.warnings}</div>
                  </div>
                )}
                {holdingSignal.recommendation && (
                  <div className="mt-3 p-3 bg-white bg-opacity-50 rounded">
                    <div className="font-semibold">💡 추천 의견</div>
                    <div className="mt-1 text-sm whitespace-pre-wrap">{holdingSignal.recommendation}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">매수일</div>
            <div className="mt-2 text-xl font-bold text-gray-900">
              {new Date(portfolio.purchase_date).toLocaleDateString('ko-KR')}
            </div>
            <div className="mt-1 text-sm text-gray-500">{holdingDays}일 보유</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">매수가</div>
            <div className="mt-2 text-xl font-bold text-gray-900">
              ${parseFloat(portfolio.purchase_price).toLocaleString()}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">보유 수량</div>
            <div className="mt-2 text-xl font-bold text-gray-900">
              {portfolio.shares.toLocaleString()}주
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">투자금액</div>
            <div className="mt-2 text-xl font-bold text-gray-900">
              ${(parseFloat(portfolio.purchase_price) * portfolio.shares).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Memos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {portfolio.memo && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">매수 메모</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{portfolio.memo}</p>
            </div>
          )}

          {portfolio.sell_criteria && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">매도 기준</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{portfolio.sell_criteria}</p>
            </div>
          )}
        </div>

        {/* Snapshots History */}
        {portfolio.snapshots && portfolio.snapshots.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">스냅샷 히스토리</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">날짜</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">총점</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">FCF Margin</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ROE</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Debt Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {portfolio.snapshots.map((snapshot, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(snapshot.snapshot_date).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {snapshot.total_score || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {snapshot.fcf_margin ? `${parseFloat(snapshot.fcf_margin).toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {snapshot.roe ? `${parseFloat(snapshot.roe).toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {snapshot.debt_ratio ? `${parseFloat(snapshot.debt_ratio).toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Holding Signals History */}
        {portfolio.holding_signals && portfolio.holding_signals.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">보유 시그널 히스토리</h3>
            <div className="space-y-3">
              {portfolio.holding_signals.map((signal) => (
                <div
                  key={signal.id}
                  className={`p-4 rounded-lg border ${getSignalColor(signal.signal)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          {getSignalLabel(signal.signal)}
                        </span>
                        <span className="text-sm">
                          {new Date(signal.signal_date).toLocaleDateString('ko-KR')}
                        </span>
                        {signal.current_score !== null && (
                          <span className="text-sm">점수: {signal.current_score}</span>
                        )}
                      </div>
                      {signal.warnings && (
                        <div className="mt-2 text-sm">{signal.warnings}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


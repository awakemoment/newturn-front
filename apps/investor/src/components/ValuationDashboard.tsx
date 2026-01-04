'use client'

import { useState } from 'react'
import MateInfoModal from './MateInfoModal'

interface ProperPrice {
  mate_type: string
  proper_price: number
  current_price: number
  gap_ratio: number
  calculation_method: string
  recommendation: string
}

interface Props {
  currentPrice: number
  properPrices: ProperPrice[]
}

const MATE_ICONS: Record<string, string> = {
  benjamin: '🎩',
  fisher: '🌱',
  greenblatt: '🔮',
  lynch: '🎯'
}

const MATE_NAMES: Record<string, string> = {
  benjamin: '베니',
  fisher: '그로우',
  greenblatt: '매직',
  lynch: '데일리'
}

export default function ValuationDashboard({ currentPrice, properPrices }: Props) {
  const [selectedMate, setSelectedMate] = useState<string | null>(null)

  // 컨센서스 계산
  const buyCount = properPrices.filter(p => p.gap_ratio <= -10).length
  const sellCount = properPrices.filter(p => p.gap_ratio >= 20).length
  const holdCount = properPrices.length - buyCount - sellCount

  const getConsensus = () => {
    if (buyCount === 4) return { text: '🟢 4개 관점 모두 저평가', color: 'bg-green-100 text-green-800 border-green-300' }
    if (buyCount >= 3) return { text: '🟢 3개 관점 저평가', color: 'bg-green-100 text-green-700 border-green-300' }
    if (sellCount === 4) return { text: '🔴 4개 관점 모두 고평가', color: 'bg-red-100 text-red-800 border-red-300' }
    if (sellCount >= 3) return { text: '🔴 3개 관점 고평가', color: 'bg-red-100 text-red-700 border-red-300' }
    if (holdCount >= 3) return { text: '🟡 3개 관점 적정가', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' }
    return { text: '🟡 관점별 의견 상이', color: 'bg-gray-100 text-gray-800 border-gray-300' }
  }

  const consensus = getConsensus()

  const getSignalColor = (gapRatio: number) => {
    if (gapRatio <= -20) return 'text-green-600'
    if (gapRatio <= -10) return 'text-green-500'
    if (gapRatio <= 10) return 'text-yellow-600'
    if (gapRatio <= 20) return 'text-orange-600'
    return 'text-red-600'
  }

  const getSignalBg = (gapRatio: number) => {
    if (gapRatio <= -20) return 'bg-green-50 border-green-200'
    if (gapRatio <= -10) return 'bg-green-50 border-green-200'
    if (gapRatio <= 10) return 'bg-yellow-50 border-yellow-200'
    if (gapRatio <= 20) return 'bg-orange-50 border-orange-200'
    return 'bg-red-50 border-red-200'
  }

  const getSignalIcon = (gapRatio: number) => {
    if (gapRatio <= -10) return '🟢'
    if (gapRatio <= 10) return '🟡'
    return '🔴'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 밸류에이션 분석</h2>
        <p className="text-sm text-gray-600">
          4명의 투자 전설이 계산한 적정가격입니다. 메이트를 클릭하면 자세한 설명을 볼 수 있습니다.
        </p>
      </div>

      {/* Current Price */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="text-sm text-gray-600 mb-1">현재 주가</div>
        <div className="text-3xl font-bold text-gray-900">${currentPrice.toFixed(2)}</div>
      </div>

      {/* Mate Valuations */}
      <div className="space-y-3 mb-6">
        {properPrices.map((price) => (
          <div
            key={price.mate_type}
            className={`${getSignalBg(price.gap_ratio)} border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer`}
            onClick={() => setSelectedMate(price.mate_type)}
          >
            <div className="flex items-center justify-between">
              {/* Mate Info */}
              <div className="flex items-center gap-3">
                <span className="text-3xl">{MATE_ICONS[price.mate_type]}</span>
                <div>
                  <div className="font-bold text-gray-900">{MATE_NAMES[price.mate_type]}</div>
                  <div className="text-xs text-gray-500">{price.calculation_method}</div>
                </div>
              </div>

              {/* Price & Signal */}
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  ${price.proper_price.toFixed(2)}
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm">{getSignalIcon(price.gap_ratio)}</span>
                  <span className={`text-lg font-bold ${getSignalColor(price.gap_ratio)}`}>
                    {price.gap_ratio > 0 ? '+' : ''}{price.gap_ratio.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                {price.gap_ratio <= -20 && '🟢 20% 이상 저평가 - 매우 저평가 구간'}
                {price.gap_ratio > -20 && price.gap_ratio <= -10 && '🟢 10% 이상 저평가 - 저평가 구간'}
                {price.gap_ratio > -10 && price.gap_ratio <= 10 && '🟡 적정가 범위 - ±10% 이내'}
                {price.gap_ratio > 10 && price.gap_ratio <= 20 && '🟠 10% 이상 고평가 - 고평가 구간'}
                {price.gap_ratio > 20 && '🔴 20% 이상 고평가 - 매우 고평가 구간'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 분석 종합 */}
      <div className={`${consensus.color} border-2 rounded-xl p-6 text-center`}>
        <div className="text-sm font-semibold text-gray-600 mb-2">분석 종합 (참고용)</div>
        <div className="text-2xl font-bold mb-3">{consensus.text}</div>
        <div className="flex items-center justify-center gap-6 text-sm">
          <div>
            <span className="text-green-600 font-bold">{buyCount}</span>
            <span className="text-gray-600"> 저평가</span>
          </div>
          <div>
            <span className="text-yellow-600 font-bold">{holdCount}</span>
            <span className="text-gray-600"> 적정</span>
          </div>
          <div>
            <span className="text-red-600 font-bold">{sellCount}</span>
            <span className="text-gray-600"> 고평가</span>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="text-xs text-blue-800">
          <strong>💡 활용 팁:</strong> 4개 관점이 모두 동일하면 밸류에이션 확신도가 높습니다. 
          의견이 엇갈린다면 신중하게 추가 분석을 진행하세요.
          <br />
          <strong className="text-red-600">⚠️</strong> 이는 분석 참고용이며 투자 권유가 아닙니다.
        </div>
      </div>

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


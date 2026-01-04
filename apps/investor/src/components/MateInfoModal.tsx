'use client'

import * as Dialog from '@radix-ui/react-dialog'

interface MateInfo {
  id: string
  icon: string
  name: string
  fullName: string
  title: string
  philosophy: string
  method: string
  formula: string
  characteristics: string[]
  bestFor: string[]
  example: string
  pros: string[]
  cons: string[]
}

const MATE_INFO: Record<string, MateInfo> = {
  benjamin: {
    id: 'benjamin',
    icon: '🎩',
    name: '베니',
    fullName: 'Benjamin Graham',
    title: '가치투자의 아버지',
    philosophy: '안전마진을 확보하라. 내재가치보다 훨씬 싼 가격에 사라.',
    method: 'Graham Number',
    formula: '√(22.5 × EPS × BVPS)',
    characteristics: [
      '보수적이고 안전한 투자',
      '자산 가치를 중시',
      '저평가된 우량주 선호',
      '장기 보유 전략'
    ],
    bestFor: [
      '리스크를 최소화하고 싶은 투자자',
      '안정적인 수익을 원하는 투자자',
      '가치주(Value Stock) 선호',
      '배당 수익 중시'
    ],
    example: 'EPS $10, BVPS $50일 때\nGraham Number = √(22.5 × 10 × 50) = √11,250 = $106\n\n현재가 $80이면 24.5% 저평가 → 매수',
    pros: [
      '검증된 안전한 방법론',
      '손실 리스크 최소화',
      '객관적 지표 기반',
      '시장 변동성에 강함'
    ],
    cons: [
      '성장 잠재력 과소평가',
      '고성장주에는 부적합',
      '기회비용 발생 가능',
      '보수적 평가'
    ]
  },
  fisher: {
    id: 'fisher',
    icon: '🌱',
    name: '그로우',
    fullName: 'Philip Fisher',
    title: '성장주 투자의 선구자',
    philosophy: '뛰어난 기업을 찾아 오래 보유하라. 성장이 가치를 만든다.',
    method: 'DCF (현금흐름 할인)',
    formula: 'Σ(미래 FCF / (1+할인율)^n) + Terminal Value',
    characteristics: [
      '미래 성장성 중시',
      '현금흐름 기반 평가',
      '10년 장기 전망',
      '질적 요소 중시'
    ],
    bestFor: [
      '고성장주에 투자하고 싶은 투자자',
      '장기 투자자 (5년 이상)',
      '테크/바이오 등 성장 산업',
      '미래 가치를 믿는 투자자'
    ],
    example: '현재 FCF $100B, 성장률 10%\n\n10년간 FCF 합계 (할인 후) + 영구가치\n= 기업가치 $1,500B\n\n발행주식 10억주 → 주당 $1,500',
    pros: [
      '성장 잠재력 반영',
      '미래 지향적',
      '고성장주 발굴 가능',
      '워렌 버핏도 사용'
    ],
    cons: [
      '성장률 예측 어려움',
      '변동성 큼',
      '계산 복잡',
      '보수적 투자자에 부적합'
    ]
  },
  greenblatt: {
    id: 'greenblatt',
    icon: '🔮',
    name: '매직',
    fullName: 'Joel Greenblatt',
    title: '마법공식의 창시자',
    philosophy: '좋은 회사를 싼 가격에. 우량도와 저평가의 조합.',
    method: 'ROE 기반 PBR',
    formula: '적정 PBR = ROE / 10\n적정가 = BVPS × 적정 PBR',
    characteristics: [
      '우량도(Quality) 중시',
      '수익성 × 저평가',
      '계량적 접근',
      '중장기 투자'
    ],
    bestFor: [
      '우량주를 싸게 사고 싶은 투자자',
      '수익성 높은 기업 선호',
      '밸류 + 모멘텀 조합',
      '시스템 트레이딩'
    ],
    example: 'ROE 20%, BVPS $100\n\n적정 PBR = 20 / 10 = 2.0\n적정가 = $100 × 2.0 = $200\n\n현재가 $150이면 25% 저평가 → 매수',
    pros: [
      '우량도와 가격 동시 고려',
      '간단하고 명확',
      '백테스팅 검증됨',
      '시장 수익률 초과 가능'
    ],
    cons: [
      'ROE 이상치 주의',
      '성장률 미반영',
      '단기 변동성 큼',
      '회계 조작 리스크'
    ]
  },
  lynch: {
    id: 'lynch',
    icon: '🎯',
    name: '데일리',
    fullName: 'Peter Lynch',
    title: '전설의 펀드매니저',
    philosophy: '당신이 아는 것에 투자하라. 일상에서 기회를 찾아라.',
    method: 'PEG (성장률 대비 PER)',
    formula: 'PEG = PER / 성장률\n적정 PEG = 1.0\n적정 PER = 성장률',
    characteristics: [
      '일상 소비재 중심',
      '성장률 대비 밸류에이션',
      '이해하기 쉬운 비즈니스',
      '합리적 성장주'
    ],
    bestFor: [
      '일상에서 투자 아이디어를 찾는 투자자',
      '성장주 + 합리적 가격',
      '소비재/리테일 투자',
      '중소형주 발굴'
    ],
    example: 'EPS $10, 성장률 15%\n\n적정 PER = 15\n적정가 = $10 × 15 = $150\n\n현재가 $100 → PEG = 0.67 < 1.0\n→ 저평가 매수',
    pros: [
      '이해하기 쉬움',
      '성장률 직접 반영',
      '실용적',
      '다양한 업종 적용 가능'
    ],
    cons: [
      '성장률 지속성 불확실',
      '저성장주에 부적합',
      '단순화의 한계',
      '업종별 특성 미반영'
    ]
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  mateType: string
}

export default function MateInfoModal({ isOpen, onClose, mateType }: Props) {
  const mate = MATE_INFO[mateType]
  
  if (!mate) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] overflow-y-auto max-h-[90vh] rounded-2xl bg-white p-8 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-6xl mb-2">{mate.icon}</div>
              <Dialog.Title className="text-3xl font-bold text-gray-900">
                {mate.name}
              </Dialog.Title>
              <p className="text-lg text-gray-600">{mate.fullName}</p>
              <p className="text-sm text-green-600 font-semibold mt-1">{mate.title}</p>
            </div>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Dialog.Close>
          </div>

                {/* Philosophy */}
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                  <p className="text-lg text-gray-800 italic">"{mate.philosophy}"</p>
                </div>

                <div className="space-y-6">
                  {/* Method */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">📐 평가 방법</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-lg font-semibold text-gray-800 mb-2">{mate.method}</p>
                      <pre className="text-sm text-gray-700 font-mono bg-white p-3 rounded border border-gray-200">
{mate.formula}
                      </pre>
                    </div>
                  </div>

                  {/* Characteristics */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">✨ 투자 특징</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {mate.characteristics.map((char, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span className="text-gray-700">{char}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best For */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">🎯 이런 분께 추천</h4>
                    <div className="space-y-2">
                      {mate.bestFor.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">→</span>
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Example */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">💡 계산 예시</h4>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
{mate.example}
                      </pre>
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-green-700 mb-2">👍 장점</h4>
                      <ul className="space-y-1">
                        {mate.pros.map((pro, idx) => (
                          <li key={idx} className="text-sm text-gray-700">• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-red-700 mb-2">👎 단점</h4>
                      <ul className="space-y-1">
                        {mate.cons.map((con, idx) => (
                          <li key={idx} className="text-sm text-gray-700">• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Dialog.Close className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
              확인
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}


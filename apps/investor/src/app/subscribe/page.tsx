'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { subscribeToTier } from '@/lib/api/payments'

export default function SubscribePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (tier: 'standard' | 'premium') => {
    try {
      setLoading(true)
      
      // Stripe Checkout 세션 생성
      const { checkout_url } = await subscribeToTier(tier)
      
      // Stripe Checkout으로 리다이렉트
      window.location.href = checkout_url
      
    } catch (error: any) {
      alert(error.response?.data?.error || '구독 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            ← 뒤로
          </button>
          <h1 className="text-3xl font-bold text-gray-900">구독 플랜</h1>
          <p className="text-gray-600 mt-2">
            완벽한 10-K 데이터로 투자 수익률을 높이세요
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Free */}
          <div className="bg-white rounded-lg shadow p-8 border-2 border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Free</h2>
              <div className="mt-4">
                <span className="text-5xl font-bold">$0</span>
              </div>
              <p className="text-gray-600 mt-2">평생 무료</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">기본 재무 지표 (TTM)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">메이트 점수 조회</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">최신 10-K 요약 (1개/월)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">종목 비교 (최대 3개)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">포트폴리오 (최대 5개)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">✗</span>
                <span className="text-gray-400">과거 10-K/10-Q</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">✗</span>
                <span className="text-gray-400">리스크 알림</span>
              </li>
            </ul>

            <button
              disabled
              className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed"
            >
              현재 플랜
            </button>
          </div>

          {/* Standard */}
          <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                추천
              </span>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Standard</h2>
              <div className="mt-4">
                <span className="text-5xl font-bold">$19.99</span>
                <span className="text-gray-600">/월</span>
              </div>
              <p className="text-gray-600 mt-2">₩29,000 상당</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 font-semibold">모든 Free 기능</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <span className="text-gray-900 font-semibold">500개 종목 전체 접근</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <span className="text-gray-900 font-semibold">과거 5년 10-K/10-Q</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <span className="text-gray-900">포트폴리오 무제한</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <span className="text-gray-900">실시간 리스크 알림</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <span className="text-gray-900">상세 경쟁사 분석</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">✗</span>
                <span className="text-gray-400">증권사 연동</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">✗</span>
                <span className="text-gray-400">백테스트</span>
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe('standard')}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '처리 중...' : 'Standard 구독하기'}
            </button>
          </div>

          {/* Premium */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow p-8 border-2 border-purple-500">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Premium</h2>
              <div className="mt-4">
                <span className="text-5xl font-bold">$49.99</span>
                <span className="text-gray-600">/월</span>
              </div>
              <p className="text-gray-600 mt-2">₩69,000 상당</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 font-semibold">모든 Standard 기능</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">✓</span>
                <span className="text-gray-900 font-semibold">증권사 계좌 연동 (Plaid)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">✓</span>
                <span className="text-gray-900 font-semibold">AI 포트폴리오 추천</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">✓</span>
                <span className="text-gray-900 font-semibold">백테스트 시뮬레이션</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">✓</span>
                <span className="text-gray-900">API 접근</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">✓</span>
                <span className="text-gray-900">월간 PDF 리포트</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">✓</span>
                <span className="text-gray-900">우선 고객 지원</span>
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe('premium')}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? '처리 중...' : 'Premium 구독하기'}
            </button>
          </div>

        </div>

        {/* 비교 테이블 */}
        <div className="mt-16 bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-center mb-8">상세 기능 비교</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-4 px-4">기능</th>
                  <th className="text-center py-4 px-4">Free</th>
                  <th className="text-center py-4 px-4 bg-blue-50">Standard</th>
                  <th className="text-center py-4 px-4 bg-purple-50">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-4 px-4">종목 접근</td>
                  <td className="text-center py-4 px-4">8개</td>
                  <td className="text-center py-4 px-4 bg-blue-50 font-semibold">500개</td>
                  <td className="text-center py-4 px-4 bg-purple-50 font-semibold">500개</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">10-K 인사이트</td>
                  <td className="text-center py-4 px-4">최신만</td>
                  <td className="text-center py-4 px-4 bg-blue-50 font-semibold">5년 전체</td>
                  <td className="text-center py-4 px-4 bg-purple-50 font-semibold">5년 전체</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">포트폴리오</td>
                  <td className="text-center py-4 px-4">5개</td>
                  <td className="text-center py-4 px-4 bg-blue-50 font-semibold">무제한</td>
                  <td className="text-center py-4 px-4 bg-purple-50 font-semibold">무제한</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">리스크 알림</td>
                  <td className="text-center py-4 px-4">✗</td>
                  <td className="text-center py-4 px-4 bg-blue-50">✓</td>
                  <td className="text-center py-4 px-4 bg-purple-50">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">증권사 연동</td>
                  <td className="text-center py-4 px-4">✗</td>
                  <td className="text-center py-4 px-4 bg-blue-50">✗</td>
                  <td className="text-center py-4 px-4 bg-purple-50 font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">백테스트</td>
                  <td className="text-center py-4 px-4">✗</td>
                  <td className="text-center py-4 px-4 bg-blue-50">✗</td>
                  <td className="text-center py-4 px-4 bg-purple-50 font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">API 접근</td>
                  <td className="text-center py-4 px-4">✗</td>
                  <td className="text-center py-4 px-4 bg-blue-50">✗</td>
                  <td className="text-center py-4 px-4 bg-purple-50 font-semibold">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">자주 묻는 질문</h2>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <details className="bg-white rounded-lg shadow p-6">
              <summary className="font-semibold cursor-pointer">
                언제든지 취소할 수 있나요?
              </summary>
              <p className="mt-4 text-gray-600">
                네, 언제든지 취소 가능합니다. 취소 시 현재 결제 기간이 끝날 때까지 서비스를 이용할 수 있습니다.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow p-6">
              <summary className="font-semibold cursor-pointer">
                환불 정책은 어떻게 되나요?
              </summary>
              <p className="mt-4 text-gray-600">
                결제 후 7일 이내 전액 환불 가능합니다. 단, 서비스를 적극적으로 사용한 경우는 제외됩니다.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow p-6">
              <summary className="font-semibold cursor-pointer">
                결제 수단은 무엇이 있나요?
              </summary>
              <p className="mt-4 text-gray-600">
                Visa, Mastercard, American Express 등 모든 주요 신용/체크카드를 지원합니다.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow p-6">
              <summary className="font-semibold cursor-pointer">
                플랜을 변경할 수 있나요?
              </summary>
              <p className="mt-4 text-gray-600">
                네, Standard → Premium 업그레이드는 즉시 가능하며, 다운그레이드는 현재 결제 기간 종료 후 적용됩니다.
              </p>
            </details>
          </div>
        </div>

      </div>
    </div>
  )
}


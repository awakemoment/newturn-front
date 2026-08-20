'use client'

export default function DisclaimerFooter() {
  return (
    <footer className="mt-auto py-8 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-yellow-800">투자 유의사항</h3>
              <div className="mt-2 text-sm text-yellow-700 space-y-1">
                <p>
                  본 서비스는 <strong>투자 참고용 정보 제공</strong> 목적이며,
                  특정 종목의 매수/매도를 권유하지 않습니다.
                </p>
                <p>
                  같은 날에는 <strong>같은 참고 정보</strong>를 모두에게 보여 줍니다.
                  계좌 맞춤 상담, 1:1 리딩, 카톡 리딩은 하지 않습니다.
                </p>
                <p>
                  <strong>원금이나 수익률을 보장하지 않습니다.</strong>
                  모든 투자 판단과 결과는 투자자 본인의 책임이며, 당사는 투자 손실에 대해 책임지지 않습니다.
                </p>
                <p>
                  증권사 연동 주문은 이용자 본인이 직접 실험하는 기능입니다.
                  당사가 타인의 계좌를 대신 매매하거나 자동매매 서비스로 제공하지 않습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p className="mb-2">© 2026 Newturn. All rights reserved.</p>
          <p>투자 분석 도구 • 데이터 기반 정보 제공 • 지금은 모두 무료</p>
        </div>
      </div>
    </footer>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createLinkToken, exchangePublicToken } from '@/lib/api/accounts'

/**
 * 은행 계좌 연동 페이지 (Plaid Link 시뮬레이션)
 * 
 * 실제 Plaid Link와 동일한 플로우:
 * 1. Link Token 생성
 * 2. Plaid Link UI 열기 (시뮬레이션)
 * 3. 은행 선택 및 로그인
 * 4. 계좌 선택
 * 5. Public Token 받기
 * 6. Access Token으로 교환
 */
export default function LinkBankPage() {
  const router = useRouter()
  const [step, setStep] = useState<'loading' | 'select-bank' | 'login' | 'select-accounts' | 'success' | 'error'>('loading')
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [publicToken, setPublicToken] = useState<string | null>(null)
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 시뮬레이션 계좌 목록 (실제 Plaid에서는 사용자가 선택한 은행의 계좌가 표시됨)
  const simulationAccounts = [
    {
      id: 'acc-checking',
      name: 'Everyday Checking',
      mask: '1234',
      type: 'checking',
      balance: 5000.00,
    },
    {
      id: 'acc-savings',
      name: 'Way2Save Savings',
      mask: '5678',
      type: 'savings',
      balance: 10000.00,
    },
  ]

  useEffect(() => {
    // 1. Link Token 생성
    initializeLinkToken()
  }, [])

  const initializeLinkToken = async () => {
    try {
      const data = await createLinkToken()
      setLinkToken(data.link_token)
      setStep('select-bank')
    } catch (err: any) {
      console.error('Link Token 생성 실패:', err)
      setError('은행 계좌 연동을 시작할 수 없습니다.')
      setStep('error')
    }
  }

  const handleSelectBank = () => {
    // 은행 선택 → 로그인 화면 (실제 Plaid Link에서는 이 단계가 자동으로 진행됨)
    setStep('login')
  }

  const handleLogin = () => {
    // 로그인 완료 → 계좌 선택 화면
    setStep('select-accounts')
  }

  const handleToggleAccount = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }

  const handleConnect = async () => {
    if (selectedAccounts.length === 0) {
      setError('최소 1개 이상의 계좌를 선택해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Public Token 생성 (시뮬레이션)
      const publicToken = `public-simulation-${Date.now()}`
      setPublicToken(publicToken)

      // Public Token을 Access Token으로 교환
      const selectedAccountData = simulationAccounts.filter(acc => 
        selectedAccounts.includes(acc.id)
      ).map(acc => ({
        id: acc.id,
        name: acc.name,
        mask: acc.mask,
      }))

      const data = await exchangePublicToken({
        public_token: publicToken,
        institution_id: 'ins_109508', // 시뮬레이션 institution ID (실제로는 Plaid에서 제공)
        accounts: selectedAccountData,
      })

      console.log('✅ 계좌 연동 성공:', data)
      setStep('success')

      // 즉시 통장 목록으로 이동하고 새로고침
      router.push('/accounts')
      // 페이지 이동 후 강제 새로고침
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err: any) {
      console.error('계좌 연동 실패:', err)
      setError(err.response?.data?.error || '계좌 연동에 실패했습니다.')
    } finally {
      setLoading(false)
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
            <button onClick={() => router.push('/accounts')} className="text-gray-600 hover:text-gray-900 text-sm">
              취소
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">은행 계좌 연동</h2>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          {/* 로딩 */}
          {step === 'loading' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">연동 준비 중...</p>
            </div>
          )}

          {/* 은행 선택 (시뮬레이션 - 실제 Plaid Link에서는 이 단계가 자동으로 진행됨) */}
          {step === 'select-bank' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">은행을 선택하세요</h3>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 시뮬레이션 모드: 실제 Plaid Link에서는 11,000개 이상의 금융기관을 지원합니다.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleSelectBank}
                  className="w-full rounded-lg border-2 border-gray-200 p-4 text-left hover:border-green-500 hover:bg-green-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      🏦
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">은행 계좌 연동</div>
                      <div className="text-sm text-gray-500">Checking, Savings, Credit Cards</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* 로그인 (시뮬레이션 - 실제 Plaid Link에서는 이 단계가 자동으로 진행됨) */}
          {step === 'login' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">은행 로그인</h3>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 시뮬레이션 모드: 실제 Plaid Link에서는 선택한 은행의 보안 로그인 화면이 표시됩니다.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사용자명
                  </label>
                  <input
                    type="text"
                    placeholder="은행 사용자명"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    defaultValue="demo_user"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    defaultValue="password123"
                    readOnly
                  />
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  로그인
                </button>
                <p className="text-xs text-gray-500 text-center">
                  💡 시뮬레이션 모드: 실제 로그인 없이 진행됩니다
                </p>
              </div>
            </div>
          )}

          {/* 계좌 선택 */}
          {step === 'select-accounts' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">연동할 계좌를 선택하세요</h3>
              <div className="space-y-3 mb-6">
                {simulationAccounts.map((account) => (
                  <label
                    key={account.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedAccounts.includes(account.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAccounts.includes(account.id)}
                      onChange={() => handleToggleAccount(account.id)}
                      className="w-5 h-5 text-green-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{account.name}</div>
                      <div className="text-sm text-gray-500">
                        ••••{account.mask} | ${account.balance.toLocaleString()}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}
              <button
                onClick={handleConnect}
                disabled={loading || selectedAccounts.length === 0}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '연동 중...' : `${selectedAccounts.length}개 계좌 연동하기`}
              </button>
            </div>
          )}

          {/* 성공 */}
          {step === 'success' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">계좌 연동 완료!</h3>
              <p className="text-gray-500 mb-6">
                {selectedAccounts.length}개의 계좌가 연동되었습니다.
              </p>
              <p className="text-sm text-gray-400">통장 목록으로 이동 중...</p>
            </div>
          )}

          {/* 에러 */}
          {step === 'error' && error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">연동 실패</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button
                onClick={() => router.push('/accounts')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                돌아가기
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


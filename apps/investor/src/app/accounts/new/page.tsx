'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createCategoryAccount, getBankAccount, getBankAccounts, linkBankAccount, type UserBankAccount } from '@/lib/api/accounts'

const CATEGORIES = [
  { value: 'coffee', label: '카페/베이커리', icon: '☕' },
  { value: 'snack', label: '과자/간식', icon: '🍪' },
  { value: 'subscription', label: '구독 서비스', icon: '📱' },
  { value: 'entertainment', label: '엔터테인먼트', icon: '🎬' },
  { value: 'shopping', label: '쇼핑', icon: '🛍️' },
  { value: 'other', label: '기타', icon: '📝' },
]

function NewAccountForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bankAccountId = searchParams.get('bank_account_id')
  
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [autoSync, setAutoSync] = useState(true)
  const [selectedBankAccount, setSelectedBankAccount] = useState<{ id: number; name: string } | null>(null)
  const [bankAccounts, setBankAccounts] = useState<UserBankAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingBankAccount, setLoadingBankAccount] = useState(false)
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // bank_account_id가 있으면 해당 은행 계좌 정보 로드, 없으면 전체 목록 로드
  useEffect(() => {
    if (bankAccountId) {
      loadBankAccount(parseInt(bankAccountId))
    } else {
      loadBankAccounts()
    }
  }, [bankAccountId])

  const loadBankAccount = async (id: number) => {
    setLoadingBankAccount(true)
    try {
      const bankAccount = await getBankAccount(id)
      setSelectedBankAccount({
        id: bankAccount.id,
        name: `${bankAccount.bank_name} - ${bankAccount.account_name}`
      })
    } catch (err) {
      console.error('은행 계좌 로딩 실패:', err)
      setError('은행 계좌 정보를 불러올 수 없습니다.')
    } finally {
      setLoadingBankAccount(false)
    }
  }

  const loadBankAccounts = async () => {
    setLoadingBankAccounts(true)
    try {
      const accounts = await getBankAccounts()
      setBankAccounts(accounts)
    } catch (err) {
      console.error('은행 계좌 목록 로딩 실패:', err)
    } finally {
      setLoadingBankAccounts(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !category) {
      setError('통장명과 카테고리를 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const result = await createCategoryAccount({
        name,
        category,
        monthly_budget: monthlyBudget ? parseFloat(monthlyBudget) : undefined,
      })
      console.log('✅ 통장 생성 성공:', result)
      
      // selectedBankAccount가 있으면 자동으로 연결 (bank_account_id가 있거나 선택한 경우)
      if (selectedBankAccount) {
        try {
          await linkBankAccount(result.id, selectedBankAccount.id, autoSync)
          console.log('✅ 은행 계좌 연결 성공')
        } catch (linkErr: any) {
          console.error('❌ 은행 계좌 연결 실패:', linkErr)
          // 연결 실패해도 통장은 생성되었으므로 계속 진행
          setError('통장은 생성되었지만 은행 계좌 연결에 실패했습니다. 나중에 수동으로 연결해주세요.')
        }
      }
      
      // 통장 목록 페이지로 이동
      router.replace('/accounts')
    } catch (err: any) {
      console.error('❌ 통장 생성 실패:', err)
      setError(err.response?.data?.error || err.message || '통장 생성에 실패했습니다.')
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">새 통장 만들기</h2>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="space-y-6">
            {/* 은행 계좌 선택 (bank_account_id가 없을 때) */}
            {!bankAccountId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  은행 계좌 연결 (선택사항)
                </label>
                {loadingBankAccounts ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
                    은행 계좌 목록을 불러오는 중...
                  </div>
                ) : bankAccounts.length === 0 ? (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-sm text-gray-500 mb-3">연동된 은행 계좌가 없습니다.</p>
                    <button
                      type="button"
                      onClick={() => router.push('/accounts/link-bank')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      은행 계좌 연동하기
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="bank_account"
                          checked={!selectedBankAccount}
                          onChange={() => setSelectedBankAccount(null)}
                          className="w-5 h-5 text-green-600"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">연결하지 않음</div>
                          <div className="text-xs text-gray-500">나중에 연결할 수 있습니다.</div>
                        </div>
                      </label>
                    </div>
                    {bankAccounts.map((bankAccount) => (
                      <label
                        key={bankAccount.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
                          selectedBankAccount?.id === bankAccount.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="bank_account"
                          checked={selectedBankAccount?.id === bankAccount.id}
                          onChange={() => setSelectedBankAccount({
                            id: bankAccount.id,
                            name: `${bankAccount.bank_name} - ${bankAccount.account_name}`
                          })}
                          className="w-5 h-5 text-green-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {bankAccount.bank_name} - {bankAccount.account_name}
                            </span>
                            {bankAccount.is_simulation && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                                시뮬레이션
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            ••••{bankAccount.account_number_masked} | ${Number(bankAccount.current_balance || 0).toFixed(2)}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                {selectedBankAccount && (
                  <div className="mt-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSync}
                        onChange={(e) => setAutoSync(e.target.checked)}
                        className="w-5 h-5 text-green-600 rounded"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">자동 거래 동기화 활성화</div>
                        <div className="text-xs text-gray-500">
                          연결된 은행 계좌의 거래 내역을 자동으로 이 통장에 반영합니다.
                        </div>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* 은행 계좌 정보 (bank_account_id가 있을 때) */}
            {bankAccountId && selectedBankAccount && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-blue-900 mb-1">연결할 은행 계좌</div>
                    <div className="text-lg font-semibold text-blue-700">{selectedBankAccount.name}</div>
                  </div>
                  <div className="text-2xl">🏦</div>
                </div>
                <div className="mt-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSync}
                      onChange={(e) => setAutoSync(e.target.checked)}
                      className="w-5 h-5 text-green-600 rounded"
                    />
                    <div>
                      <div className="text-sm font-medium text-blue-900">자동 거래 동기화 활성화</div>
                      <div className="text-xs text-blue-700">
                        연결된 은행 계좌의 거래 내역을 자동으로 이 통장에 반영합니다.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}
            
            {bankAccountId && loadingBankAccount && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
                은행 계좌 정보를 불러오는 중...
              </div>
            )}
            {/* 통장명 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                통장명
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 카페/베이커리 통장"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`rounded-lg border-2 p-4 text-left transition ${
                      category === cat.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className="text-sm font-medium text-gray-900">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 월 예산 */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                월 예산 (선택사항)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="budget"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full rounded-lg border border-gray-300 pl-8 pr-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                월 예산을 설정하면 절약 금액을 자동으로 계산합니다.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/accounts')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '생성 중...' : '통장 만들기'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}


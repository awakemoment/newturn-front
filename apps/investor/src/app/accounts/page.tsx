'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCategoryAccounts, getBankAccounts, deleteBankAccount, deleteCategoryAccount, type CategoryAccount, type UserBankAccount } from '@/lib/api/accounts'

export default function AccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<CategoryAccount[]>([])
  const [bankAccounts, setBankAccounts] = useState<UserBankAccount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAccounts()
  }, [])

  // 페이지 포커스/가시성 변경 시 데이터 새로고침 (통장 생성 후 돌아왔을 때)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAccounts()
      }
    }
    const handleFocus = () => {
      loadAccounts()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadAccounts = async () => {
    try {
      console.log('📥 통장 목록 로딩 시작...')
      const [categoryData, bankData] = await Promise.all([
        getCategoryAccounts(),
        getBankAccounts(),
      ])
      console.log('✅ 카테고리 통장:', categoryData)
      console.log('✅ 은행 계좌:', bankData)
      setAccounts(Array.isArray(categoryData) ? categoryData : [])
      setBankAccounts(Array.isArray(bankData) ? bankData : [])
    } catch (error) {
      console.error('❌ 통장 목록 로딩 실패:', error)
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
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/')} className="text-gray-600 hover:text-gray-900 text-sm">
                홈
              </button>
              <button onClick={() => router.push('/accounts/link-bank')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                + 은행 계좌 연동
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">내 통장</h2>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : bankAccounts.length === 0 && accounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500 mb-4">아직 통장이 없습니다.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/accounts/new')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                카테고리 통장 만들기
              </button>
              <button
                onClick={() => router.push('/accounts/link-bank')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                은행 계좌 연동하기
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 연동된 은행 계좌 */}
            {bankAccounts.length > 0 && (
              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🏦 연동된 은행 계좌</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {bankAccounts.map((bankAccount) => (
                    <div
                      key={bankAccount.id}
                      className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm relative cursor-pointer hover:border-blue-300 hover:shadow-md transition"
                      onClick={() => router.push(`/accounts/bank-accounts/${bankAccount.id}`)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {bankAccount.bank_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{bankAccount.bank_name}</h4>
                            {bankAccount.is_simulation && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                                시뮬레이션
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{bankAccount.account_name}</p>
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (confirm('이 은행 계좌를 삭제하시겠습니까? 연동된 카테고리 통장이 있으면 삭제할 수 없습니다.')) {
                              try {
                                await deleteBankAccount(bankAccount.id)
                                loadAccounts()
                              } catch (err: any) {
                                alert(err.response?.data?.error || '삭제에 실패했습니다.')
                              }
                            }
                          }}
                          className="text-gray-400 hover:text-red-600 transition"
                          title="계좌 삭제"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">계좌번호:</span>
                          <span className="font-semibold">••••{bankAccount.account_number_masked}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">잔액:</span>
                          <span className="font-semibold">${Number(bankAccount.current_balance || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">타입:</span>
                          <span className="font-semibold capitalize">{bankAccount.account_type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 카테고리 통장 */}
            {accounts.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 카테고리 통장</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {accounts.map((account) => {
              const savings = Math.max(0, (account.monthly_budget || 0) - account.current_month_spent)
              return (
                <div
                  key={account.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm relative hover:border-green-300 hover:shadow-md transition"
                >
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      if (confirm('이 카테고리 통장을 삭제하시겠습니까? 투자 중인 절약 리워드가 있으면 삭제할 수 없습니다.')) {
                        try {
                          await deleteCategoryAccount(account.id)
                          loadAccounts()
                        } catch (err: any) {
                          alert(err.response?.data?.error || '삭제에 실패했습니다.')
                        }
                      }
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition"
                    title="통장 삭제"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <div
                    className="cursor-pointer"
                    onClick={() => router.push(`/accounts/${account.id}`)}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pr-8">{account.name}</h3>
                    <div className="space-y-2 text-sm">
                      {account.linked_bank_account_info && (
                        <div className="mb-2 pb-2 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">연동:</span>
                            <span className="text-xs font-medium text-blue-600">
                              {account.linked_bank_account_info.bank_name}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">잔액:</span>
                        <span className="font-semibold">${Number(account.balance || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">월 예산:</span>
                        <span className="font-semibold">${(account.monthly_budget || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">이번 달 사용:</span>
                        <span className="font-semibold">${Number(account.current_month_spent || 0).toFixed(2)}</span>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">절약:</span>
                          <span className="font-bold text-green-600">${savings.toFixed(2)} ✅</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}


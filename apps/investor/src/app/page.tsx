'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getCategoryAccounts, 
  getSavingsRewards,
  getBankAccounts,
  type CategoryAccount, 
  type SavingsReward,
  type UserBankAccount
} from '@/lib/api/accounts'
import DisclaimerFooter from '@/components/DisclaimerFooter'

export default function HomePage() {
  const router = useRouter()
  const [categoryAccounts, setCategoryAccounts] = useState<CategoryAccount[]>([])
  const [bankAccounts, setBankAccounts] = useState<UserBankAccount[]>([])
  const [rewards, setRewards] = useState<SavingsReward[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [accounts, bankAccountsData, rewardsData] = await Promise.all([
        getCategoryAccounts(),
        getBankAccounts(),
        getSavingsRewards(),
      ])
      // 배열인지 확인하고 기본값 설정
      setCategoryAccounts(Array.isArray(accounts) ? accounts : [])
      setBankAccounts(Array.isArray(bankAccountsData) ? bankAccountsData : [])
      setRewards(Array.isArray(rewardsData) ? rewardsData : [])
    } catch (error) {
      console.error('데이터 로딩 실패:', error)
      // 에러 발생 시 빈 배열로 설정
      setCategoryAccounts([])
      setBankAccounts([])
      setRewards([])
    } finally {
      setLoading(false)
    }
  }

  // 오늘 아낀 돈 계산 (모든 통장의 오늘 출금 합계)
  const todaySavings = Array.isArray(categoryAccounts) 
    ? categoryAccounts.reduce((sum, account) => {
        // 실제로는 오늘 날짜의 거래만 필터링해야 하지만, 여기서는 간단히 표시
        return sum + Math.max(0, (account.monthly_budget || 0) - account.current_month_spent)
      }, 0)
    : 0

  // 이번 주 누적 절약
  const weeklySavings = Array.isArray(categoryAccounts)
    ? categoryAccounts.reduce((sum, account) => {
        return sum + Math.max(0, (account.monthly_budget || 0) - account.current_month_spent)
      }, 0)
    : 0

  // 투자 중인 리워드
  const activeRewards = Array.isArray(rewards) 
    ? rewards.filter(r => r.status === 'invested' || r.status === 'pending')
    : []
  const totalInvestedValue = activeRewards.reduce((sum, r) => {
    const currentValue = Number(r.current_value || 0)
    return sum + currentValue
  }, 0)
  const totalReturn = activeRewards.reduce((sum, r) => {
    const purchasePrice = Number(r.purchase_price || 0)
    const shares = Number(r.shares || 0)
    const currentValue = Number(r.current_value || 0)
    const purchaseCost = purchasePrice * shares
    return sum + (currentValue - purchaseCost)
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1
              className="text-2xl font-bold text-green-600 cursor-pointer"
              onClick={() => router.push('/')}
            >
              Newturn
            </h1>

            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push('/screen')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                종목 탐색
              </button>
              <button
                onClick={() => router.push('/watchlist')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                관심종목
              </button>
              <button
                onClick={() => router.push('/accounts')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                내 통장
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                무료 시작하기
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* 오늘 아낀 돈 & 이번 주 누적 */}
            <section className="mb-12">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🎯</span>
                    <h2 className="text-xl font-semibold text-gray-900">오늘 아낀 돈</h2>
                  </div>
                  <p className="text-3xl font-bold text-green-600 mt-4">
                    ${todaySavings.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    이번 주 누적: ${weeklySavings.toFixed(2)}
                  </p>
                  <button
                    onClick={() => router.push('/accounts')}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50"
                  >
                    통장 관리
                  </button>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">📊</span>
                    <h2 className="text-xl font-semibold text-gray-900">내 투자 현황</h2>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mt-4">
                    ${totalInvestedValue.toFixed(2)}
                  </p>
                  <p className={`text-sm mt-2 ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    수익: ${totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}
                  </p>
                  <button
                    onClick={() => router.push('/investments')}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    투자 상세 보기
                  </button>
                </div>
              </div>
            </section>

            {/* 투자 중인 종목 */}
            {activeRewards.length > 0 && (
              <section className="mb-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 내 투자 현황</h3>
                <div className="space-y-4">
                  {activeRewards.map((reward) => {
                    const savingsAmount = Number(reward.savings_amount || 0)
                    const purchasePrice = Number(reward.purchase_price || 0)
                    const shares = Number(reward.shares || 0)
                    const currentValue = Number(reward.current_value || 0)
                    const purchaseCost = purchasePrice * shares
                    const profit = currentValue - purchaseCost
                    const profitRate = purchaseCost > 0 ? ((profit / purchaseCost) * 100) : 0

                    return (
                      <div
                        key={reward.id}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-semibold text-gray-900">
                                {reward.stock.stock_code}
                              </span>
                              <span className="text-gray-600">{reward.stock.stock_name}</span>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">투자 금액:</span>
                                <span className="ml-2 font-semibold">${savingsAmount.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">현재 가치:</span>
                                <span className="ml-2 font-semibold">
                                  ${(reward.current_value || 0).toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">수익률:</span>
                                <span className={`ml-2 font-semibold ${profitRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">수익:</span>
                                <span className={`ml-2 font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ${profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-6">
                            {reward.can_sell ? (
                              <button
                                onClick={() => router.push(`/investments/${reward.id}`)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                              >
                                매도하기 ✅
                              </button>
                            ) : (
                              <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                                보유 중 ⏸️
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* 연동된 은행 계좌 */}
            {bankAccounts.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">🏦 연동된 은행 계좌</h3>
                  <button
                    onClick={() => router.push('/accounts/link-bank')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    + 은행 계좌 연동
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {bankAccounts.map((bankAccount) => {
                    // 이 은행 계좌가 이미 연결된 카테고리 통장이 있는지 확인
                    const linkedAccount = categoryAccounts.find(
                      acc => acc.linked_bank_account === bankAccount.id
                    )
                    
                    return (
                      <div
                        key={bankAccount.id}
                        className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition"
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
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-500">계좌번호:</span>
                            <span className="font-semibold">••••{bankAccount.account_number_masked}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">잔액:</span>
                            <span className="font-semibold">${Number(bankAccount.current_balance || 0).toFixed(2)}</span>
                          </div>
                          {linkedAccount && (
                            <div className="pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-2 text-green-600">
                                <span className="text-xs">✅ 연결됨:</span>
                                <span className="text-xs font-medium">{linkedAccount.name}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {!linkedAccount ? (
                          <button
                            onClick={() => router.push(`/accounts/new?bank_account_id=${bankAccount.id}`)}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                          >
                            카테고리 통장 만들기
                          </button>
                        ) : (
                          <button
                            onClick={() => router.push(`/accounts/${linkedAccount.id}`)}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                          >
                            통장 보기
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* 카테고리 통장 */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">💰 카테고리 통장</h3>
                <div className="flex gap-2">
                  {bankAccounts.length === 0 && (
                    <button
                      onClick={() => router.push('/accounts/link-bank')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      + 은행 계좌 연동
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/accounts/new')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  >
                    + 통장 만들기
                  </button>
                </div>
              </div>
              {!Array.isArray(categoryAccounts) || categoryAccounts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                  <p className="text-gray-500 mb-4">아직 통장이 없습니다.</p>
                  <div className="flex gap-3 justify-center">
                    {bankAccounts.length > 0 ? (
                      <button
                        onClick={() => router.push('/accounts/new')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        카테고리 통장 만들기
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push('/accounts/link-bank')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        은행 계좌 연동하기
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryAccounts.map((account) => {
                    const savings = Math.max(0, (account.monthly_budget || 0) - account.current_month_spent)
                    const savingsRate = account.monthly_budget 
                      ? ((savings / account.monthly_budget) * 100) 
                      : 0

                    return (
                      <div
                        key={account.id}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm cursor-pointer hover:border-green-300 hover:shadow-md transition"
                        onClick={() => router.push(`/accounts/${account.id}`)}
                      >
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{account.name}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">잔액:</span>
                            <span className="font-semibold">${Number(account.balance || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">월 예산:</span>
                            <span className="font-semibold">${Number(account.monthly_budget || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">이번 달 사용:</span>
                            <span className="font-semibold">${Number(account.current_month_spent || 0).toFixed(2)}</span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">절약:</span>
                              <span className="font-bold text-green-600">
                                ${savings.toFixed(2)} ✅
                              </span>
                            </div>
                            {account.monthly_budget && (
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all"
                                  style={{ width: `${Math.min(savingsRate, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                          {savings > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/accounts/${account.id}/invest`)
                              }}
                              className="mt-3 w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                            >
                              절약 금액으로 투자하기
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* 빠른 액션 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">빠른 액션</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <button
                  onClick={() => router.push('/accounts/link-bank')}
                  className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm hover:border-green-300 hover:shadow-md transition"
                >
                  <div className="text-2xl mb-2">🏦</div>
                  <h4 className="font-semibold text-gray-900 mb-1">은행 계좌 연동</h4>
                  <p className="text-sm text-gray-500">Plaid를 통해 은행 계좌를 연동해요</p>
                </button>
                <button
                  onClick={() => router.push('/screen')}
                  className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm hover:border-green-300 hover:shadow-md transition"
                >
                  <div className="text-2xl mb-2">🔍</div>
                  <h4 className="font-semibold text-gray-900 mb-1">종목 탐색</h4>
                  <p className="text-sm text-gray-500">투자할 종목을 찾아보세요</p>
                </button>
                <button
                  onClick={() => router.push('/investments')}
                  className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm hover:border-green-300 hover:shadow-md transition"
                >
                  <div className="text-2xl mb-2">📈</div>
                  <h4 className="font-semibold text-gray-900 mb-1">투자 현황</h4>
                  <p className="text-sm text-gray-500">내 투자 포트폴리오 확인</p>
                </button>
              </div>
            </section>
          </>
        )}
      </main>

      <DisclaimerFooter />
    </div>
  )
}

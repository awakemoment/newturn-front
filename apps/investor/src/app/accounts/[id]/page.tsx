'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  getCategoryAccount,
  getTransactions, 
  getMonthlySavings,
  getBankAccounts,
  getSavingsRewards,
  linkBankAccount,
  unlinkBankAccount,
  syncTransactions,
  type CategoryAccount, 
  type Transaction,
  type UserBankAccount,
  type SavingsReward
} from '@/lib/api/accounts'

export default function AccountDetailPage() {
  const router = useRouter()
  const params = useParams()
  const accountId = parseInt(params.id as string)

  const [account, setAccount] = useState<CategoryAccount | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [savings, setSavings] = useState<number>(0)
  const [rewards, setRewards] = useState<SavingsReward[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (accountId) {
      loadData()
    }
  }, [accountId])

  const loadData = async () => {
    try {
      const [accountData, txs, savingsData, allRewards] = await Promise.all([
        getCategoryAccount(accountId),
        getTransactions(accountId),
        getMonthlySavings(accountId),
        getSavingsRewards(),
      ])
      setAccount(accountData)
      setTransactions(txs)
      setSavings(savingsData.savings)
      // 해당 통장의 리워드만 필터링
      const accountRewards = allRewards.filter((reward: SavingsReward) => reward.account === accountId)
      setRewards(accountRewards)
    } catch (error) {
      console.error('데이터 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncTransactions = async () => {
    if (!account?.linked_bank_account) {
      alert('먼저 은행 계좌를 연결해주세요.')
      return
    }

    setSyncing(true)
    try {
      const result = await syncTransactions(accountId)
      alert(result.message || '거래 내역이 동기화되었습니다.')
      loadData() // 데이터 새로고침
    } catch (error: any) {
      alert(error.response?.data?.error || '동기화에 실패했습니다.')
    } finally {
      setSyncing(false)
    }
  }

  const handleUnlinkBankAccount = async () => {
    if (!account?.linked_bank_account) {
      return
    }

    if (!confirm('은행 계좌 연동을 해제하시겠습니까? 거래 내역 자동 동기화가 중단됩니다.')) {
      return
    }

    try {
      await unlinkBankAccount(accountId)
      alert('은행 계좌 연동이 해제되었습니다.')
      loadData() // 데이터 새로고침
    } catch (error: any) {
      alert(error.response?.data?.error || '연동 해제에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">통장을 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push('/accounts')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            통장 목록으로
          </button>
        </div>
      </div>
    )
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
              통장 목록
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 통장 정보 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{account.name}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-500">잔액</div>
              <div className="text-xl font-semibold text-gray-900">${Number(account.balance || 0).toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">월 예산</div>
              <div className="text-xl font-semibold text-gray-900">
                ${Number(account.monthly_budget || 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">이번 달 사용</div>
              <div className="text-xl font-semibold text-gray-900">
                ${Number(account.current_month_spent || 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">절약</div>
              <div className="text-xl font-semibold text-green-600">${Number(savings || 0).toFixed(2)} ✅</div>
            </div>
          </div>

          {/* 은행 계좌 연결 상태 */}
          {account.linked_bank_account && account.linked_bank_account_info ? (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-900 mb-2">🏦 연동된 은행 계좌</div>
                  <div className="space-y-1">
                    <div className="text-base font-semibold text-blue-700">
                      {account.linked_bank_account_info.bank_name} - {account.linked_bank_account_info.account_name}
                    </div>
                    <div className="text-sm text-blue-600">
                      계좌번호: ••••{account.linked_bank_account_info.account_number_masked}
                    </div>
                    <div className="text-xs text-blue-700 mt-2">
                      {account.auto_sync_enabled ? '✅ 자동 동기화 활성화' : '⏸️ 자동 동기화 비활성화'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => router.push(`/accounts/bank-accounts/${account.linked_bank_account}`)}
                    className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 text-xs font-medium"
                  >
                    계좌 상세
                  </button>
                  <button
                    onClick={handleSyncTransactions}
                    disabled={syncing}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium disabled:opacity-50"
                  >
                    {syncing ? '동기화 중...' : '거래 내역 동기화'}
                  </button>
                  <button
                    onClick={handleUnlinkBankAccount}
                    className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-xs font-medium"
                  >
                    연동 해제
                  </button>
                </div>
              </div>
            </div>
          ) : account.linked_bank_account ? (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-blue-900">🏦 연동된 은행 계좌</div>
                  <div className="text-xs text-blue-700 mt-1">
                    {account.auto_sync_enabled ? '✅ 자동 동기화 활성화' : '⏸️ 자동 동기화 비활성화'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSyncTransactions}
                    disabled={syncing}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium disabled:opacity-50"
                  >
                    {syncing ? '동기화 중...' : '거래 내역 동기화'}
                  </button>
                  <button
                    onClick={handleUnlinkBankAccount}
                    className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-xs font-medium"
                  >
                    연동 해제
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">은행 계좌 미연동</div>
                  <div className="text-xs text-gray-600 mt-1">
                    은행 계좌를 연결하면 거래 내역을 자동으로 동기화할 수 있습니다.
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/accounts/${accountId}/link-bank`)}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                >
                  은행 계좌 연결
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {savings > 0 && (
              <button
                onClick={() => router.push(`/accounts/${accountId}/invest`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                절약 금액으로 투자하기
              </button>
            )}
          </div>
        </div>

        {/* 투자 중인 리워드 */}
        {rewards.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 투자 중인 리워드</h3>
            <div className="space-y-4">
              {rewards.map((reward) => (
                <div key={reward.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-bold text-lg">
                          {reward.stock?.stock_code?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {reward.stock?.stock_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reward.stock?.stock_code || ''} • {reward.shares}주
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      reward.status === 'invested' ? 'bg-blue-100 text-blue-700' :
                      reward.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      reward.status === 'sold' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {reward.status === 'invested' ? '투자 중' :
                       reward.status === 'pending' ? '대기 중' :
                       reward.status === 'sold' ? '매도 완료' :
                       '잠김'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">매수 가격</div>
                      <div className="font-semibold text-gray-900">
                        ${Number(reward.purchase_price || 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">현재 가격</div>
                      <div className="font-semibold text-gray-900">
                        ${reward.current_price ? Number(reward.current_price).toFixed(2) : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">투자 금액</div>
                      <div className="font-semibold text-gray-900">
                        ${Number(reward.savings_amount || 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">현재 가치</div>
                      <div className={`font-semibold ${
                        reward.current_value && reward.current_value > reward.savings_amount
                          ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        ${reward.current_value ? Number(reward.current_value).toFixed(2) : '-'}
                      </div>
                    </div>
                    {reward.return_rate !== null && (
                      <div className="col-span-2">
                        <div className="text-gray-500">수익률</div>
                        <div className={`font-semibold ${
                          Number(reward.return_rate) > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Number(reward.return_rate).toFixed(2)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 거래 내역 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">거래 내역</h3>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              거래 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {tx.transaction_type === 'deposit' ? '입금' :
                         tx.transaction_type === 'withdrawal' ? '출금' :
                         tx.transaction_type === 'bank_sync' ? '은행 동기화' :
                         tx.transaction_type === 'investment' ? '투자' :
                         tx.transaction_type === 'sale' ? '매도' :
                         tx.transaction_type}
                      </span>
                      {tx.is_synced_from_bank && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          자동
                        </span>
                      )}
                    </div>
                    {tx.merchant_name && (
                      <div className="text-sm text-gray-600 mt-1">{tx.merchant_name}</div>
                    )}
                    {tx.note && (
                      <div className="text-xs text-gray-500 mt-1">{tx.note}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(tx.transaction_date).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${
                      tx.transaction_type === 'deposit' || tx.transaction_type === 'sale' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {tx.transaction_type === 'deposit' || tx.transaction_type === 'sale' ? '+' : '-'}
                      ${Number(tx.amount || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      잔액: ${tx.balance_after.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


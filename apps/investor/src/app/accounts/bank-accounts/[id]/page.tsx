'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  getBankAccount,
  getBankAccountTransactions,
  deleteBankAccount,
  type UserBankAccount,
  type Transaction
} from '@/lib/api/accounts'

export default function BankAccountDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bankAccountId = parseInt(params.id as string)

  const [bankAccount, setBankAccount] = useState<UserBankAccount | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (bankAccountId) {
      loadData()
    }
  }, [bankAccountId])

  const loadData = async () => {
    try {
      const [accountData, txs] = await Promise.all([
        getBankAccount(bankAccountId),
        getBankAccountTransactions(bankAccountId),
      ])
      setBankAccount(accountData)
      setTransactions(txs)
    } catch (error) {
      console.error('데이터 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('이 은행 계좌를 삭제하시겠습니까? 연동된 카테고리 통장이 있으면 삭제할 수 없습니다.')) {
      return
    }

    try {
      await deleteBankAccount(bankAccountId)
      alert('은행 계좌가 삭제되었습니다.')
      router.push('/accounts')
    } catch (error: any) {
      alert(error.response?.data?.error || '삭제에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  if (!bankAccount) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">은행 계좌를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push('/accounts')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            계좌 목록으로
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
        <div className="mb-6">
          <button
            onClick={() => router.push('/accounts')}
            className="text-gray-600 hover:text-gray-900 text-sm mb-4"
          >
            ← 통장 목록으로
          </button>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{bankAccount.bank_name}</h2>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              계좌 삭제
            </button>
          </div>
        </div>

        {/* 계좌 정보 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
              {bankAccount.bank_name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{bankAccount.account_name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">계좌번호: ••••{bankAccount.account_number_masked}</span>
                {bankAccount.is_simulation && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                    시뮬레이션
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">계좌 유형</div>
              <div className="text-lg font-semibold text-gray-900 capitalize">{bankAccount.account_type}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">현재 잔액</div>
              <div className="text-lg font-semibold text-gray-900">
                ${Number(bankAccount.current_balance || 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">사용 가능 잔액</div>
              <div className="text-lg font-semibold text-gray-900">
                ${Number(bankAccount.available_balance || 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">마지막 동기화</div>
              <div className="text-lg font-semibold text-gray-900">
                {bankAccount.last_synced_at
                  ? new Date(bankAccount.last_synced_at).toLocaleDateString()
                  : '없음'}
              </div>
            </div>
          </div>
        </div>

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
                        {tx.merchant_name || tx.transaction_type}
                      </span>
                      {tx.is_synced_from_bank && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          자동
                        </span>
                      )}
                    </div>
                    {tx.category_detail && (
                      <div className="text-sm text-gray-600 mt-1">{tx.category_detail}</div>
                    )}
                    {tx.note && (
                      <div className="text-xs text-gray-500 mt-1">{tx.note}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {tx.bank_transaction_date
                        ? new Date(tx.bank_transaction_date).toLocaleDateString()
                        : new Date(tx.transaction_date).toLocaleDateString()}
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


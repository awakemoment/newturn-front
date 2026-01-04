'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCategoryAccount, getBankAccounts, linkBankAccount, deleteBankAccount, type CategoryAccount, type UserBankAccount } from '@/lib/api/accounts'

/**
 * 카테고리 통장과 은행 계좌 연결 페이지
 */
export default function LinkBankToCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const accountId = parseInt(params.id as string)
  
  const [account, setAccount] = useState<CategoryAccount | null>(null)
  const [bankAccounts, setBankAccounts] = useState<UserBankAccount[]>([])
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<number | null>(null)
  const [autoSync, setAutoSync] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [accountId])

  const loadData = async () => {
    try {
      const [accountData, bankData] = await Promise.all([
        getCategoryAccount(accountId),
        getBankAccounts(),
      ])
      setAccount(accountData)
      setBankAccounts(bankData)
      
      // 이미 연결된 계좌가 있으면 선택
      if (accountData.linked_bank_account) {
        setSelectedBankAccountId(accountData.linked_bank_account)
        setAutoSync(accountData.auto_sync_enabled)
      }
    } catch (err: any) {
      setError('데이터를 불러올 수 없습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedBankAccountId) {
      setError('은행 계좌를 선택해주세요.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await linkBankAccount(accountId, selectedBankAccountId, autoSync)
      router.push(`/accounts/${accountId}`)
    } catch (err: any) {
      setError(err.response?.data?.error || '연결에 실패했습니다.')
    } finally {
      setSaving(false)
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
        <p className="text-gray-500">통장을 찾을 수 없습니다.</p>
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
            <button onClick={() => router.push(`/accounts/${accountId}`)} className="text-gray-600 hover:text-gray-900 text-sm">
              취소
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {account.name} - 은행 계좌 연결
        </h2>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="space-y-6">
            {/* 현재 통장 정보 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">카테고리 통장</h3>
              <p className="text-lg font-semibold text-gray-900">{account.name}</p>
              <p className="text-sm text-gray-500 mt-1">카테고리: {account.category}</p>
            </div>

            {/* 은행 계좌 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연결할 은행 계좌 선택
              </label>
              {bankAccounts.length === 0 ? (
                <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-gray-500 mb-4">연동된 은행 계좌가 없습니다.</p>
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
                  {bankAccounts.map((bankAccount) => (
                    <label
                      key={bankAccount.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
                        selectedBankAccountId === bankAccount.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bank_account"
                        value={bankAccount.id}
                        checked={selectedBankAccountId === bankAccount.id}
                        onChange={() => setSelectedBankAccountId(bankAccount.id)}
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
            </div>

            {/* 자동 동기화 설정 */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900">자동 거래 동기화 활성화</div>
                  <div className="text-sm text-gray-500">
                    연결된 은행 계좌의 거래 내역을 자동으로 이 통장에 반영합니다.
                  </div>
                </div>
              </label>
            </div>

            {/* 카테고리 자동 분류 안내 */}
            {autoSync && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 자동 분류 기능</h4>
                <p className="text-sm text-blue-700">
                  거래 내역이 자동으로 이 카테고리 통장에 분류됩니다:
                </p>
                <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
                  <li>카페/베이커리: Starbucks, Dunkin, Coffee 등</li>
                  <li>과자/간식: 7-Eleven, CVS, Walgreens 등</li>
                  <li>구독 서비스: Netflix, Spotify, Amazon Prime 등</li>
                  <li>엔터테인먼트: 영화관, 극장 등</li>
                  <li>쇼핑: Amazon, Target, Walmart 등</li>
                </ul>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push(`/accounts/${accountId}`)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving || !selectedBankAccountId || bankAccounts.length === 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '연결 중...' : '연결하기'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}


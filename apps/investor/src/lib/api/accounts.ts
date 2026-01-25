/**
 * 계좌 관련 API
 */
import { apiClient } from '../axios'

export interface CategoryAccount {
  id: number
  name: string
  category: string
  balance: number
  total_deposited: number
  monthly_budget: number | null
  current_month_spent: number
  total_savings_reward: number
  pending_reward: number
  realized_reward: number
  linked_bank_account: number | null
  linked_bank_account_info?: {
    id: number
    bank_name: string
    account_name: string
    account_number_masked: string
  } | null
  auto_sync_enabled: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: number
  account: number
  transaction_type: 'deposit' | 'withdrawal' | 'reward' | 'investment' | 'sale' | 'bank_sync'
  amount: number
  balance_after: number
  merchant_name: string
  category_detail: string | string[]  // 배열일 수도 있음
  note: string
  transaction_date: string
  bank_transaction_date: string | null
  is_synced_from_bank: boolean
}

export interface SavingsReward {
  id: number
  account: number
  savings_amount: number
  period_start: string
  period_end: string
  budget: number
  actual_spent: number
  stock: {
    id: number
    stock_code: string
    stock_name: string
  }
  purchase_price: number
  purchase_date: string
  shares: number
  current_price: number | null
  current_value: number | null
  return_rate: number | null
  is_profitable: boolean
  can_sell: boolean
  sell_price: number | null
  sell_date: string | null
  commission: number
  net_proceeds: number | null
  status: 'pending' | 'invested' | 'sold' | 'locked'
  created_at: string
  updated_at: string
}

export interface DepositAccount {
  id: number
  account_number: string
  balance: number
  total_deposited: number
  total_withdrawn: number
  is_active: boolean
}

// 카테고리 통장 목록 조회
export async function getCategoryAccounts(): Promise<CategoryAccount[]> {
  try {
    const response = await apiClient.get('/api/accounts/category-accounts/')
    console.log('✅ 카테고리 통장 API 응답:', response)
    const data = response.data
    console.log('✅ 카테고리 통장 데이터:', data)
    // DRF ViewSet은 배열을 직접 반환하거나 results 필드에 담을 수 있음
    const accounts = Array.isArray(data) ? data : (data.results || [])
    console.log('✅ 파싱된 카테고리 통장 목록:', accounts)
    
    // ✅ Decimal 필드를 숫자로 변환 (백엔드에서 Decimal이 문자열로 올 수 있음)
    return accounts.map((account: any) => ({
      ...account,
      balance: Number(account.balance || 0),
      total_deposited: Number(account.total_deposited || 0),
      monthly_budget: account.monthly_budget ? Number(account.monthly_budget) : null,
      current_month_spent: Number(account.current_month_spent || 0),
      total_savings_reward: Number(account.total_savings_reward || 0),
      pending_reward: Number(account.pending_reward || 0),
      realized_reward: Number(account.realized_reward || 0),
    }))
  } catch (error: any) {
    console.error('❌ 통장 목록 조회 실패:', error)
    console.error('❌ 에러 응답:', error.response?.data)
    return []
  }
}

// 카테고리 통장 생성
export async function createCategoryAccount(params: {
  name: string
  category: string
  monthly_budget?: number
}): Promise<CategoryAccount> {
  try {
    const { data } = await apiClient.post('/api/accounts/category-accounts/', params)
    console.log('통장 생성 응답:', data)
    return data
  } catch (error: any) {
    console.error('통장 생성 API 에러:', error.response?.data || error.message)
    throw error
  }
}

// 카테고리 통장 상세 조회
export async function getCategoryAccount(accountId: number): Promise<CategoryAccount> {
  const { data } = await apiClient.get(`/api/accounts/category-accounts/${accountId}/`)
  // ✅ Decimal 필드를 숫자로 변환 (백엔드에서 Decimal이 문자열로 올 수 있음)
  return {
    ...data,
    balance: Number(data.balance || 0),
    total_deposited: Number(data.total_deposited || 0),
    monthly_budget: data.monthly_budget ? Number(data.monthly_budget) : null,
    current_month_spent: Number(data.current_month_spent || 0),
    total_savings_reward: Number(data.total_savings_reward || 0),
    pending_reward: Number(data.pending_reward || 0),
    realized_reward: Number(data.realized_reward || 0),
  }
}

// 카테고리 통장과 은행 계좌 연결
export async function linkBankAccount(
  accountId: number,
  bankAccountId: number,
  autoSyncEnabled: boolean = false
): Promise<CategoryAccount> {
  const { data } = await apiClient.post(`/api/accounts/category-accounts/${accountId}/link-bank-account/`, {
    bank_account_id: bankAccountId,
    auto_sync_enabled: autoSyncEnabled,
  })
  return data
}

// 카테고리 통장과 은행 계좌 연결 해제
export async function unlinkBankAccount(accountId: number): Promise<CategoryAccount> {
  const { data } = await apiClient.post(`/api/accounts/category-accounts/${accountId}/unlink-bank-account/`)
  return data
}

// 거래 내역 동기화
export async function syncTransactions(accountId: number): Promise<{ success: boolean; message: string; account: CategoryAccount }> {
  const { data } = await apiClient.post(`/api/accounts/category-accounts/${accountId}/sync-transactions/`)
  return data
}

// 카테고리 통장 입금
export async function depositToCategoryAccount(
  accountId: number,
  amount: number,
  note?: string
): Promise<CategoryAccount> {
  const { data } = await apiClient.post(`/api/accounts/category-accounts/${accountId}/deposit/`, {
    amount,
    note,
  })
  return data
}

// 카테고리 통장 출금
export async function withdrawFromCategoryAccount(
  accountId: number,
  amount: number,
  merchantName?: string,
  categoryDetail?: string,
  note?: string
): Promise<CategoryAccount> {
  const { data } = await apiClient.post(`/api/accounts/category-accounts/${accountId}/withdraw/`, {
    amount,
    merchant_name: merchantName,
    category_detail: categoryDetail,
    note,
  })
  return data
}

// 월간 절약 금액 계산
export async function getMonthlySavings(accountId: number): Promise<{ savings: number }> {
  const { data } = await apiClient.get(`/api/accounts/category-accounts/${accountId}/monthly-savings/`)
  return data
}

// 절약 금액으로 투자
export async function investSavings(
  accountId: number,
  stockId: number
): Promise<SavingsReward> {
  try {
    const { data } = await apiClient.post(`/api/accounts/category-accounts/${accountId}/invest-savings/`, {
      stock_id: stockId,
    })
    return data
  } catch (error: any) {
    console.error('❌ 투자 API 에러 전체:', error)
    console.error('❌ 투자 API 에러 응답:', error.response)
    console.error('❌ 투자 API 에러 데이터:', error.response?.data)
    console.error('❌ 투자 API 에러 메시지:', error.response?.data?.error || error.message)
    throw error
  }
}

// 절약 리워드 목록 조회
export async function getSavingsRewards(): Promise<SavingsReward[]> {
  try {
    const { data } = await apiClient.get('/api/accounts/savings-rewards/')
    console.log('✅ SavingsReward API 응답:', data)
    // DRF ViewSet은 배열을 직접 반환하거나 results 필드에 담을 수 있음
    const rewards = Array.isArray(data) ? data : (data.results || [])
    console.log('✅ 파싱된 리워드 목록:', rewards)
    
    // Decimal 필드를 숫자로 변환
    return rewards.map((reward: any) => ({
      ...reward,
      savings_amount: Number(reward.savings_amount || 0),
      budget: Number(reward.budget || 0),
      actual_spent: Number(reward.actual_spent || 0),
      purchase_price: Number(reward.purchase_price || 0),
      shares: Number(reward.shares || 0),
      current_price: reward.current_price ? Number(reward.current_price) : null,
      current_value: reward.current_value ? Number(reward.current_value) : null,
      return_rate: reward.return_rate ? Number(reward.return_rate) : null,
      sell_price: reward.sell_price ? Number(reward.sell_price) : null,
      commission: Number(reward.commission || 0),
      net_proceeds: reward.net_proceeds ? Number(reward.net_proceeds) : null,
    }))
  } catch (error) {
    console.error('❌ 투자 목록 조회 실패:', error)
    console.error('❌ 에러 상세:', error)
    return []
  }
}

// 절약 리워드 상세 조회
export async function getSavingsReward(rewardId: number): Promise<SavingsReward> {
  const { data } = await apiClient.get(`/api/accounts/savings-rewards/${rewardId}/`)
  // Decimal 필드를 숫자로 변환
  return {
    ...data,
    savings_amount: Number(data.savings_amount || 0),
    budget: Number(data.budget || 0),
    actual_spent: Number(data.actual_spent || 0),
    purchase_price: Number(data.purchase_price || 0),
    shares: Number(data.shares || 0),
    current_price: data.current_price ? Number(data.current_price) : null,
    current_value: data.current_value ? Number(data.current_value) : null,
    return_rate: data.return_rate ? Number(data.return_rate) : null,
    sell_price: data.sell_price ? Number(data.sell_price) : null,
    commission: Number(data.commission || 0),
    net_proceeds: data.net_proceeds ? Number(data.net_proceeds) : null,
  }
}

// 절약 리워드 매도
export async function sellSavingsReward(rewardId: number): Promise<SavingsReward> {
  const { data } = await apiClient.post(`/api/accounts/savings-rewards/${rewardId}/sell/`)
  return data
}

// 거래 내역 조회
export async function getTransactions(accountId: number): Promise<Transaction[]> {
  const { data } = await apiClient.get(`/api/accounts/category-accounts/${accountId}/transactions/`)
  return data
}

// 예치금 계좌 조회
export async function getDepositAccount(): Promise<DepositAccount> {
  const { data } = await apiClient.get('/api/accounts/deposit-account/')
  return data
}

// Plaid Link Token 생성
export async function createLinkToken(): Promise<{ link_token: string }> {
  const { data } = await apiClient.post('/api/accounts/plaid/link-token/')
  return data
}

// Public Token 교환
export async function exchangePublicToken(params: {
  public_token: string
  institution_id: string
  accounts: Array<{ id: string; name: string; mask: string }>
}): Promise<{ success: boolean; accounts: UserBankAccount[] }> {
  const { data } = await apiClient.post('/api/accounts/plaid/exchange-token/', params)
  return data
}

// 은행 계좌 목록 조회
export async function getBankAccounts(): Promise<UserBankAccount[]> {
  try {
    const response = await apiClient.get('/api/accounts/bank-accounts/')
    console.log('✅ 은행 계좌 API 응답:', response)
    const data = response.data
    console.log('✅ 은행 계좌 데이터:', data)
    // DRF ViewSet은 배열을 직접 반환하거나 results 필드에 담을 수 있음
    const accounts = Array.isArray(data) ? data : (data.results || [])
    console.log('✅ 파싱된 계좌 목록:', accounts)
    
    // Decimal 필드를 숫자로 변환
    return accounts.map((account: any) => ({
      ...account,
      current_balance: Number(account.current_balance || 0),
      available_balance: Number(account.available_balance || 0),
    }))
  } catch (error: any) {
    console.error('❌ 은행 계좌 목록 조회 실패:', error)
    console.error('❌ 에러 응답:', error.response?.data)
    return []
  }
}

// 은행 계좌 상세 조회
export async function getBankAccount(bankAccountId: number): Promise<UserBankAccount> {
  const { data } = await apiClient.get(`/api/accounts/bank-accounts/${bankAccountId}/`)
  return {
    ...data,
    current_balance: Number(data.current_balance || 0),
    available_balance: Number(data.available_balance || 0),
  }
}

// 은행 계좌 거래 내역 조회
export async function getBankAccountTransactions(bankAccountId: number): Promise<Transaction[]> {
  const { data } = await apiClient.get(`/api/accounts/bank-accounts/${bankAccountId}/transactions/`)
  return data
}

// 은행 계좌 삭제
export async function deleteBankAccount(bankAccountId: number): Promise<void> {
  await apiClient.delete(`/api/accounts/bank-accounts/${bankAccountId}/`)
}

// 카테고리 통장 삭제
export async function deleteCategoryAccount(accountId: number): Promise<void> {
  await apiClient.delete(`/api/accounts/category-accounts/${accountId}/`)
}

export interface UserBankAccount {
  id: number
  bank_name: string
  account_name: string
  account_type: string
  account_number_masked: string
  current_balance: number
  available_balance: number
  is_active: boolean
  is_primary: boolean
  is_simulation: boolean
  last_synced_at: string | null
  created_at: string
  updated_at: string
}


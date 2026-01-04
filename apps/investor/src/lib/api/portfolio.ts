import { apiClient } from '../axios'

// Types
export interface Portfolio {
  id: number
  stock: {
    id: number
    stock_code: string
    stock_name: string
  }
  purchase_date: string
  purchase_price: string
  shares: number
  memo?: string
  sell_criteria?: string
  is_sold: boolean
  sold_date?: string
  sold_price?: string
  created_at: string
  updated_at: string
  holding_signals?: HoldingSignalSimple[]
}

export interface HoldingSignalSimple {
  signal: string
  signal_display: string
  signal_date: string
}

export interface PortfolioCreate {
  stock_id: number
  purchase_date: string
  purchase_price: number
  shares: number
  memo?: string
  sell_criteria?: string
}

export interface HoldingSignalDetail {
  id: number
  signal_date: string
  signal: 'STRONG_HOLD' | 'HOLD' | 'REVIEW' | 'CONSIDER_SELL' | 'SELL'
  signal_display: string
  current_score?: number
  score_change?: number
  fcf_trend?: string
  warnings?: string
  recommendation?: string
  created_at: string
}

export interface PortfolioDetail extends Omit<Portfolio, 'holding_signals'> {
  snapshots: {
    snapshot_date: string
    total_score?: number
    fcf_margin?: string
    roe?: string
    debt_ratio?: string
  }[]
  holding_signals: HoldingSignalDetail[]
  current_price?: number
  current_return?: number
}

// API Functions
export const getPortfolios = async (): Promise<Portfolio[]> => {
  const response = await apiClient.get('/api/portfolio/')
  return response.data
}

export const getPortfolioDetail = async (id: number): Promise<PortfolioDetail> => {
  const response = await apiClient.get(`/api/portfolio/${id}/`)
  return response.data
}

export const createPortfolio = async (data: PortfolioCreate): Promise<Portfolio> => {
  const response = await apiClient.post('/api/portfolio/', data)
  return response.data
}

export const updatePortfolio = async (id: number, data: Partial<PortfolioCreate>): Promise<Portfolio> => {
  const response = await apiClient.patch(`/api/portfolio/${id}/`, data)
  return response.data
}

export const deletePortfolio = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/portfolio/${id}/`)
}

export const getHoldingDecision = async (id: number): Promise<HoldingSignalDetail> => {
  const response = await apiClient.get(`/api/portfolio/${id}/holding_decision/`)
  return response.data
}


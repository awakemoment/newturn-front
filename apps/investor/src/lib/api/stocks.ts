/**
 * 종목 API
 */
import { apiClient } from '../axios'

export interface Stock {
  id: number
  stock_code: string
  stock_name: string
  stock_name_en: string | null
  exchange: string
  sector: string | null
}

export interface StockDetail extends Stock {
  country: string
  industry: string | null
  description: string | null
  latest_financials: {
    year: number
    quarter: number
    date: string
    ocf: number | null
    fcf: number | null
    revenue: number | null
    net_income: number | null
  } | null
  created_at: string
  updated_at: string
}

export interface Financial {
  id: number
  disclosure_year: number
  disclosure_quarter: number
  disclosure_date: string
  ocf: number | null
  icf: number | null
  fcf: number | null
  capex: number | null
  revenue: number | null
  operating_profit: number | null
  net_income: number | null
  total_assets: number | null
  current_assets: number | null
  current_liabilities: number | null
  total_liabilities: number | null
  total_equity: number | null
  dividend: number | null
  fcf_margin: number | null
  roe: number | null
  debt_ratio: number | null
  current_ratio: number | null
  data_source: string
}

export interface Indicators {
  stock_code: string
  stock_name: string
  ttm_period: string
  ttm_ocf: number
  ttm_fcf: number
  ttm_capex: number
  ttm_revenue: number
  ttm_net_income: number
  total_assets: number
  total_liabilities: number
  total_equity: number
  fcf_margin: number
  roe: number
  debt_ratio: number
  current_ratio: number
  revenue_growth: number | null
  fcf_growth: number | null
  ocf_to_net_income: number | null
  fcf_positive_quarters: number
}

export interface ChartData {
  period: string
  date: string
  ocf: number | null
  fcf: number | null
  capex: number | null
  revenue: number | null
  net_income: number | null
}

/**
 * 종목 검색
 */
export async function searchStocks(query: string) {
  const { data } = await apiClient.get<{
    count: number
    results: Stock[]
  }>('/api/stocks/search/', {
    params: { q: query }
  })
  return data
}

/**
 * 종목 목록
 */
export async function getStocks(params?: {
  page?: number
  page_size?: number
  exchange?: string
  sector?: string
  search?: string
}) {
  const { data } = await apiClient.get<{
    count: number
    next: string | null
    previous: string | null
    results: Stock[]
  }>('/api/stocks/', { params })
  return data
}

/**
 * 종목 상세
 */
export async function getStock(id: number) {
  const { data } = await apiClient.get<StockDetail>(`/api/stocks/${id}/`)
  return data
}

/**
 * 재무 데이터
 */
export async function getFinancials(id: number, limit = 20) {
  const { data } = await apiClient.get<{
    stock_code: string
    stock_name: string
    count: number
    financials: Financial[]
  }>(`/api/stocks/${id}/financials/`, {
    params: { limit }
  })
  return data
}

/**
 * 핵심 지표 (TTM)
 */
export async function getIndicators(id: number) {
  const { data } = await apiClient.get<Indicators>(`/api/stocks/${id}/indicators/`)
  return data
}

/**
 * 차트 데이터
 */
export async function getChartData(id: number, limit = 20) {
  const { data } = await apiClient.get<{
    stock_code: string
    stock_name: string
    data: ChartData[]
  }>(`/api/stocks/${id}/chart/`, {
    params: { limit }
  })
  return data
}

/**
 * 스크리닝 (필터링)
 */
export async function screenStocks(params: {
  min_fcf?: number
  min_roe?: number
  max_debt_ratio?: number
  min_fcf_margin?: number
  min_revenue_growth?: number
  fcf_positive_quarters?: number
  mate?: string  // 메이트 타입 (benjamin, fisher, greenblatt, lynch)
  min_mate_score?: number  // 메이트 최소 점수
  sort?: 'fcf' | 'roe' | 'fcf_margin' | 'revenue_growth' | 'mate_score'
  page?: number
}) {
  const { data } = await apiClient.get('/api/stocks/screen/', { params })
  return data
}

/**
 * 종목 비교
 */
export async function compareStocks(stockIds: number[]) {
  const { data } = await apiClient.post('/api/stocks/compare/', {
    stock_ids: stockIds
  })
  return data
}

/**
 * 규칙 기반 점수
 */
export async function getScore(id: number) {
  const { data } = await apiClient.get(`/api/stocks/${id}/score/`)
  return data
}

/**
 * 메이트 분석 (4개 메이트 종합)
 */
export interface MateAnalysis {
  mate: string
  icon: string
  color: string
  score: number
  summary: string
  reasons: string[]
  cautions: string[]
  recommendation: string
  details?: any
}

export async function getMatesAnalysis(id: number) {
  const { data } = await apiClient.get<{
    stock_code: string
    stock_name: string
    mates: {
      benjamin: MateAnalysis
      fisher: MateAnalysis
      greenblatt: MateAnalysis
      lynch: MateAnalysis
    }
  }>(`/api/stocks/${id}/mates/`)
  return data
}

/**
 * 10-K 인사이트 조회
 */
export interface TenKInsight {
  id: number
  filing_date: string
  fiscal_year: number
  product_revenue: Record<string, any>
  geographic_revenue: Record<string, any>
  gross_margin: number | null
  operating_margin: number | null
  net_margin: number | null
  rd_investment: number | null
  rd_as_pct_revenue: number | null
  new_risks: string[]
  key_changes: Array<{type: string; item?: string; region?: string; value?: number; impact?: string}>
  created_at: string
}

export async function getTenKInsights(id: number) {
  const { data} = await apiClient.get<{
    stock_code: string
    stock_name: string
    insights: TenKInsight[]
  }>(`/api/stocks/${id}/tenk_insights/`)
  return data
}

/**
 * 스크리닝 테이블 (모든 메이트 점수)
 */
export interface ScreeningTableRow {
  stock: {
    id: number
    stock_code: string
    stock_name: string
  }
  benjamin: number
  fisher: number
  greenblatt: number
  lynch: number
  avg_score: number
}

export interface ScreeningTableParams {
  min_avg_score?: number
  min_all_mates?: number
  min_benjamin?: number
  min_fisher?: number
  min_greenblatt?: number
  min_lynch?: number
  sort_by?: 'benjamin' | 'fisher' | 'greenblatt' | 'lynch' | 'avg'
  page?: number
}

export async function getScreeningTable(params?: ScreeningTableParams) {
  const { data } = await apiClient.get<{
    count: number
    next: string | null
    previous: string | null
    results: ScreeningTableRow[]
  }>('/api/stocks/screening_table/', { params })
  return data
}


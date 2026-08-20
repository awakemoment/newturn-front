import { apiClient } from '../axios'

export type OpsAction = {
  id: number
  action: string
  sleeve: string
  code: string
  name: string
  stock_id: number | null
  stock_country: string | null
  reason_code: string
  reason: string
  target_weight_in_sleeve: number | null
  suggested_notional: number | null
  suggested_shares: number | null
  meta: Record<string, unknown>
  execution_status: string
}

export type BasketOptions = {
  aggressive_pct: number
  core_pct: number
  aggressive_slots: number
  min_dd1: number
  skip_bull: boolean
  bounce_wait: number
  extend_weeks: number
  core_observe: number
  core_hold: number
  core_band: number
  core_max_buys: number
  core_max_sells: number
  core_min_hold: number
  core_outside_days: number
  preset: string
}

export const DEFAULT_BASKET_OPTIONS: BasketOptions = {
  aggressive_pct: 0.3,
  core_pct: 0.7,
  aggressive_slots: 5,
  min_dd1: 0.35,
  skip_bull: true,
  bounce_wait: 2,
  extend_weeks: 10,
  core_observe: 10,
  core_hold: 7,
  core_band: 15,
  core_max_buys: 2,
  core_max_sells: 2,
  core_min_hold: 10,
  core_outside_days: 3,
  preset: 'default',
}

export const BASKET_PRESETS: Array<{
  id: string
  label: string
  hint: string
  options: Partial<BasketOptions>
}> = [
  {
    id: 'default',
    label: '기본으로 보기',
    hint: '반등해서 팔기 30% · 좋은 회사 모으기 70%',
    options: DEFAULT_BASKET_OPTIONS,
  },
  {
    id: 'more_short',
    label: '반등해서 팔기에 더 쓰기',
    hint: '반등해서 팔기 50% · 최대 7종목',
    options: {
      aggressive_pct: 0.5,
      core_pct: 0.5,
      aggressive_slots: 7,
      preset: 'more_short',
    },
  },
  {
    id: 'more_core',
    label: '좋은 회사 모으기에 더 쓰기',
    hint: '좋은 회사 모으기 80% · 반등해서 팔기 3종목',
    options: {
      aggressive_pct: 0.2,
      core_pct: 0.8,
      aggressive_slots: 3,
      preset: 'more_core',
    },
  },
  {
    id: 'aggressive',
    label: '더 적극적으로',
    hint: '25%만 빠져도 사고, 오르는 장에도 사기',
    options: {
      min_dd1: 0.25,
      skip_bull: false,
      bounce_wait: 1,
      preset: 'aggressive',
    },
  },
  {
    id: 'conservative',
    label: '더 천천히',
    hint: '45% 이상 빠진 것만, 더 오래 들고 가기',
    options: {
      min_dd1: 0.45,
      bounce_wait: 3,
      core_band: 20,
      core_min_hold: 15,
      preset: 'conservative',
    },
  },
]

export function mergeBasketOptions(partial?: Partial<BasketOptions> | null): BasketOptions {
  return { ...DEFAULT_BASKET_OPTIONS, ...(partial || {}) }
}

export function basketOptionsToParams(options: BasketOptions) {
  return {
    agg_pct: options.aggressive_pct,
    agg_slots: options.aggressive_slots,
    min_dd1: options.min_dd1,
    skip_bull: options.skip_bull ? 1 : 0,
    bounce_wait: options.bounce_wait,
    extend_weeks: options.extend_weeks,
    core_observe: options.core_observe,
    core_hold: options.core_hold,
    core_band: options.core_band,
    core_max_buys: options.core_max_buys,
    core_max_sells: options.core_max_sells,
    core_min_hold: options.core_min_hold,
    core_outside_days: options.core_outside_days,
    preset: options.preset,
  }
}

export type OpsToday = {
  plan_id: number
  as_of: string
  status: string
  payload: {
    regimes?: Record<string, { regime?: string; market?: string }>
    top10?: Array<Record<string, unknown>>
    top15?: Array<Record<string, unknown>>
    aggressive_open?: boolean
    notes?: string[]
    rank_churn?: {
      previous_as_of?: string | null
      entered?: string[]
      exited?: string[]
      stayed?: string[]
    }
    nav?: number
    options?: BasketOptions
    core_basket?: Array<{
      code: string
      name: string
      action: string
      reason_code?: string
      rank?: number | null
      attractiveness?: number | null
    }>
  }
  actions: OpsAction[]
  holdings: Array<Record<string, unknown>>
  strategy: Record<string, unknown>
  options?: BasketOptions
  defaults?: BasketOptions
}

export async function fetchOpsToday(
  nav = 100000,
  refresh = false,
  options?: Partial<BasketOptions>,
): Promise<OpsToday> {
  const { data } = await apiClient.get('/api/ops/today/', {
    params: {
      nav,
      refresh: refresh ? 1 : 0,
      ...basketOptionsToParams(mergeBasketOptions(options)),
      _ts: Date.now(),
    },
  })
  return data
}

export async function fetchOpsBacktest() {
  const { data } = await apiClient.get('/api/ops/backtest-summary/')
  return data
}

export async function syncOpsHoldings(body: {
  source?: string
  nav?: number
  holdings?: Array<Record<string, unknown>>
  sleeve?: string
  options?: Partial<BasketOptions>
}) {
  const { options, ...rest } = body
  const { data } = await apiClient.post('/api/ops/holdings/sync/', {
    ...rest,
    ...basketOptionsToParams(mergeBasketOptions(options)),
  })
  return data
}

export async function fetchTossStatus() {
  const { data } = await apiClient.get('/api/ops/toss/status/')
  return data as {
    configured: boolean
    live_trading_enabled: boolean
    base_url?: string
    account_seq_set?: boolean
    accounts?: Array<{ accountNo?: string; accountSeq?: number; accountType?: string }>
    suggested_account_seq?: number
    ok?: boolean
    error?: string
  }
}

export async function executeOpsPlan(body: {
  plan_id?: number
  dry_run?: boolean
  approve?: boolean
  confirm?: string
}) {
  const { data } = await apiClient.post('/api/ops/execute/', body)
  return data
}

'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BASKET_PRESETS,
  DEFAULT_BASKET_OPTIONS,
  executeOpsPlan,
  fetchOpsBacktest,
  fetchOpsToday,
  fetchTossStatus,
  mergeBasketOptions,
  type BasketOptions,
  type OpsAction,
  type OpsToday,
} from '@/lib/api/ops'
import DisclaimerFooter from '@/components/DisclaimerFooter'
import AppHeader from '@/components/AppHeader'
import PastResultReportModal, {
  type PastReportKind,
} from '@/components/PastResultReportModal'

type ActionFilter = 'all' | 'buy' | 'sell' | 'hold' | 'other'

const FAST_LABEL = '반등해서 팔기'
const SLOW_LABEL = '좋은 회사 모으기'

const ACTION_LABEL: Record<string, string> = {
  buy: '매수',
  sell: '매도',
  hold: '보유',
  rebalance: '비중 맞추기',
  review: '한번 더 보기',
  skip_entry: '오늘은 매수 안 함',
  wait: '다음에 담기',
}

const REASON_CODE_LABEL: Record<string, string> = {
  agg_signal: '많이 빠진 뒤 다시 오를 후보',
  top_fill: '오늘 담기',
  later_fill: '오늘은 아직, 다음에 담기',
  empty_slot: '자리는 있는데 조건 맞는 종목이 없어 현금',
  core_buy: '좋은 회사 모으기에 담기',
  core_sell: '좋은 회사 모으기에서 빼기',
  hold_band: '아직 괜찮아서 유지',
  min_hold: '너무 짧게 사서 아직 유지',
  min_hold_guard: '산 지 얼마 안 돼서 아직 유지',
  in_band: '상위권에 있어서 유지',
  outside_grace: '순위가 밀렸지만 조금 더 지켜봄',
  replace_delta: '더 좋은 종목으로 교체',
  weight_drift: '비중이 너무 어긋나서 맞춤',
  rebalance_drift: '비중이 너무 어긋나서 조정',
  bounce_d2: '올랐으니 이익 실현 매도',
  extend_soft_max: '너무 오래 들고 있어서 정리',
  first_green_today: '오늘 처음으로 매수 가격보다 올랐음',
  bounce_wait: '올랐으니 며칠 더 보고 매도',
  await_bounce: '아직 반등 기다리는 중',
  kospi_bull: '한국 장이 너무 달아올라서 오늘은 새로 사지 않음',
  kospi_bull_skip: '한국 장이 너무 달아올라서 오늘은 새로 사지 않음',
  no_candidates: '오늘 살 만한 반등 후보가 없음',
  skip_entry: '오늘은 새 종목을 매수하지 않음',
  review: '사람이 한번 더 확인',
}

function friendlyReason(text?: string) {
  if (!text) return ''
  return text
    .replace(/본전용 목표\s*(\d+)종/g, '좋은 회사 모으기에 담을 $1개 중')
    .replace(/본전용|본전 바구니/g, '좋은 회사 모으기')
    .replace(/단기 바구니|공격형/g, '반등해서 팔기')
    .replace(/\bKR\b/g, '한국 종목')
    .replace(/\bUS\b/g, '미국 종목')
    .replace(/익절/g, '이익 실현 매도')
    .replace(/손절/g, '손실 확정 매도')
    .replace(/거래일/g, '장이 열린 날')
    .replace(/매력\s*/g, '매력점수 ')
    .replace(/순위/g, '추천 순서')
    .replace(/목표\s*(\d+)%/g, '이 방식의 $1%')
    .replace(/dd1\s*≥\s*(\d+)%/gi, '1년 최고가보다 $1% 이상 하락')
    .replace(/DD1/gi, '1년 동안 빠진 정도')
    .replace(/top\s*(\d+)/gi, '상위 $1개')
    .replace(/슬리브/g, '방식')
    .replace(/레짐/g, '장 분위기')
    .replace(/백분위/g, '최근 가격 위치')
    .replace(/오버웨이트|overweight/gi, '너무 많이 담음')
    .replace(/언더웨이트|underweight/gi, '너무 적게 담음')
}

function friendlyThesis(text?: string) {
  if (!text) return ''
  return text
    .replace(/요구\s*품질/g, '필요한 튼튼함 점수')
    .replace(/시장대비/g, '장 기준')
    .replace(/매력도/g, '매력점수')
    .replace(/내러티브/g, '사업 이야기')
    .replace(/보조\s*신호/g, '참고 정보')
    .replace(/백분위/g, '최근 가격 위치')
}

// 왜 이 종목을 이렇게 하라는지, 근거 숫자를 초보용 문장으로 풀어줍니다.
function buildReasons(action: any, row?: any): string[] {
  const out: string[] = []
  const q = row?.quality_score
  const c = row?.cheapness_score
  const dd = row?.drawdown_1y
  const pct = row?.percentile_5y
  const attr = row?.attractiveness

  if (typeof q === 'number') {
    const label = q >= 80 ? '아주 튼튼해요' : q >= 60 ? '튼튼한 편이에요' : '보통이에요'
    out.push(`회사가 얼마나 튼튼한지 점수는 100점 만점에 ${Math.round(q)}점 — ${label}.`)
  }
  if (typeof c === 'number') {
    const label = c >= 80 ? '지금 많이 싸요' : c >= 50 ? '조금 싼 편이에요' : '아직 비싼 편이에요'
    out.push(`지금 가격이 얼마나 싼지 점수는 100점 만점에 ${Math.round(c)}점 — ${label}.`)
  }
  if (typeof dd === 'number') {
    out.push(`최근 1년 최고가보다 ${Math.round(dd * 100)}% 내려온 자리예요. 많이 빠졌을수록 반등 여지가 커요.`)
  }
  if (typeof pct === 'number') {
    out.push(`최근 5년 동안 지금보다 더 쌌던 날은 약 ${Math.round(pct * 100)}%뿐이에요. 즉, 역사적으로 싼 편이에요.`)
  }
  if (typeof attr === 'number') {
    out.push(`튼튼함과 싸진 정도를 합친 매력점수는 ${Math.round(attr)}점(100점 만점)이에요.`)
  }
  return out
}

// 앞으로 이 종목을 어떻게 관리하는지 알려줍니다.
function nextStepText(action: any, opt: BasketOptions = DEFAULT_BASKET_OPTIONS): string {
  if (action.action === 'sell') {
    return '매도한 뒤에는 이 종목을 잠시 지켜봅니다. 다시 조건에 맞으면 나중에 또 후보로 올라와요.'
  }
  if (action.sleeve === 'aggressive') {
    return `${FAST_LABEL}예요. 산 가격보다 오르면 ${opt.bounce_wait}일 뒤 이익을 실현하고, 안 오르면 약 ${opt.extend_weeks}주 뒤 자리를 비워 다음 후보에게 넘겨요.`
  }
  if (action.sleeve === 'core') {
    return `${SLOW_LABEL}예요. 상위 후보(약 ${opt.core_band}개) 안에 있는 동안은 계속 들고 가고, ${opt.core_outside_days}일 동안 추천 순서 밖으로 밀려나면 그때 팔아요.`
  }
  return '조건이 유지되는 동안 보유하고, 조건이 깨지면 정리합니다.'
}

const BASKET_STORAGE_KEY = 'newturn.ops.basketOptions.v1'

function loadStoredBasketOptions(): BasketOptions {
  if (typeof window === 'undefined') return DEFAULT_BASKET_OPTIONS
  try {
    const raw = window.localStorage.getItem(BASKET_STORAGE_KEY)
    if (!raw) return DEFAULT_BASKET_OPTIONS
    return mergeBasketOptions(JSON.parse(raw))
  } catch {
    return DEFAULT_BASKET_OPTIONS
  }
}

function persistBasketOptions(next: BasketOptions) {
  try {
    window.localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore quota / private mode */
  }
}

function planningEqual(a: BasketOptions, b: BasketOptions) {
  return (
    a.aggressive_pct === b.aggressive_pct &&
    a.aggressive_slots === b.aggressive_slots &&
    a.min_dd1 === b.min_dd1 &&
    a.skip_bull === b.skip_bull &&
    a.bounce_wait === b.bounce_wait &&
    a.extend_weeks === b.extend_weeks &&
    a.core_observe === b.core_observe &&
    a.core_hold === b.core_hold &&
    a.core_band === b.core_band &&
    a.core_max_buys === b.core_max_buys &&
    a.core_max_sells === b.core_max_sells &&
    a.core_min_hold === b.core_min_hold &&
    a.core_outside_days === b.core_outside_days
  )
}

function patchBasketOptions(prev: BasketOptions, patch: Partial<BasketOptions>): BasketOptions {
  const next = { ...prev, ...patch }
  if (patch.aggressive_pct != null) {
    next.core_pct = Math.round((1 - patch.aggressive_pct) * 1000) / 1000
  }
  if (next.core_hold > next.core_observe) next.core_observe = next.core_hold
  if (next.core_observe > next.core_band) next.core_band = next.core_observe
  if (patch.preset == null) next.preset = 'custom'
  return next
}

function NumberSettingsDrawer({
  open,
  options,
  busy,
  onClose,
  onPatch,
  onReset,
  onApply,
}: {
  open: boolean
  options: BasketOptions
  busy: boolean
  onClose: () => void
  onPatch: (patch: Partial<BasketOptions>) => void
  onReset: () => void
  onApply: () => void
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label="숫자 조절 닫기"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">숫자를 직접 조절하기</h3>
            <p className="mt-1 text-xs text-gray-500">
              슬라이더를 맞춘 뒤 아래에서 바로 다시 계산합니다. 추천 목록은 그대로 뒤에 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            닫기
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
          <section className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900">{FAST_LABEL}</h4>
              <p className="mt-1 text-xs text-gray-500">
                많이 빠진 종목을 사서, 다시 오르면 이익을 실현하는 돈입니다.
              </p>
            </div>
            <Knob
              label="이 방식에 쓸 돈"
              hint={`나머지는 ${SLOW_LABEL}에 씁니다.`}
              value={Math.round(options.aggressive_pct * 100)}
              display={`${Math.round(options.aggressive_pct * 100)}% / ${SLOW_LABEL} ${Math.round(options.core_pct * 100)}%`}
              min={10}
              max={90}
              step={5}
              onChange={(v) => onPatch({ aggressive_pct: v / 100 })}
            />
            <Knob
              label="한 번에 살 수 있는 종목 수"
              hint="자리를 10개로 늘려도, 오늘 조건에 맞는 종목이 3개면 3개만 사고 나머지는 현금입니다."
              value={options.aggressive_slots}
              display={`${options.aggressive_slots}개`}
              min={1}
              max={10}
              step={1}
              onChange={(v) => onPatch({ aggressive_slots: v })}
            />
            <Knob
              label="얼마나 빠진 종목만 볼까요?"
              hint="최근 1년 최고가보다 이만큼 내려온 한국 종목만 고릅니다."
              value={Math.round(options.min_dd1 * 100)}
              display={`${Math.round(options.min_dd1 * 100)}% 이상 빠짐`}
              min={15}
              max={70}
              step={5}
              onChange={(v) => onPatch({ min_dd1: v / 100 })}
            />
            <Knob
              label="다시 오른 뒤 며칠 기다릴까요?"
              hint="산 가격보다 오르면, 이 날이 지난 뒤에 팝니다."
              value={options.bounce_wait}
              display={`${options.bounce_wait}일`}
              min={1}
              max={10}
              step={1}
              onChange={(v) => onPatch({ bounce_wait: v })}
            />
            <Knob
              label="안 오르면 몇 주 뒤 정리할까요?"
              hint="반등이 없으면 자리를 비워 다음 후보에게 넘깁니다."
              value={options.extend_weeks}
              display={`${options.extend_weeks}주`}
              min={4}
              max={26}
              step={1}
              onChange={(v) => onPatch({ extend_weeks: v })}
            />
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={options.skip_bull}
                onChange={(e) => onPatch({ skip_bull: e.target.checked })}
                className="mt-0.5 accent-green-600"
              />
              <span>
                한국 장이 너무 달아올랐을 때는 새로 사지 않기
                <span className="block text-xs text-gray-500">
                  기본으로 보기는 이 규칙을 켭니다. 장이 과열됐을 때 추격 매수를 줄입니다.
                </span>
              </span>
            </label>
          </section>

          <section className="space-y-4 border-t border-gray-100 pt-6">
            <div>
              <h4 className="text-sm font-bold text-gray-900">{SLOW_LABEL}</h4>
              <p className="mt-1 text-xs text-gray-500">
                좋은 회사를 싸게 사서, 자주 사고팔지 않고 오래 들고 가는 돈입니다.
              </p>
            </div>
            <Knob
              label="매일 몇 위까지 눈여겨볼까요?"
              hint="실제로 사는 종목보다 조금 더 넓게 후보를 봅니다."
              value={options.core_observe}
              display={`상위 ${options.core_observe}개`}
              min={5}
              max={30}
              step={1}
              onChange={(v) => onPatch({ core_observe: v })}
            />
            <Knob
              label="오늘 담을 종목 수"
              hint="이 숫자만큼 오늘 추천에 바로 나옵니다. 다음에 담기는 만들지 않습니다."
              value={options.core_hold}
              display={`${options.core_hold}개`}
              min={3}
              max={15}
              step={1}
              onChange={(v) => onPatch({ core_hold: v })}
            />
            <Knob
              label="몇 위 안에 있으면 그냥 들고 갈까요?"
              hint="추천 순서가 조금 밀려도, 이 안에 있으면 바로 팔지 않습니다."
              value={options.core_band}
              display={`상위 ${options.core_band}개`}
              min={8}
              max={40}
              step={1}
              onChange={(v) => onPatch({ core_band: v })}
            />
            <Knob
              label="하루에 팔 수 있는 종목 수"
              hint="하루에 너무 많이 팔지 않게 막아 줍니다."
              value={options.core_max_sells}
              display={`${options.core_max_sells}개`}
              min={1}
              max={15}
              step={1}
              onChange={(v) => onPatch({ core_max_sells: v })}
            />
            <Knob
              label="산 뒤 최소 며칠은 들고 가기"
              hint="사자마자 바로 파는 일을 줄입니다."
              value={options.core_min_hold}
              display={`${options.core_min_hold}일`}
              min={1}
              max={40}
              step={1}
              onChange={(v) => onPatch({ core_min_hold: v })}
            />
            <Knob
              label="추천 순서 밖으로 밀리면 며칠 더 볼까요?"
              hint="이 날이 지나면 그때 팝니다."
              value={options.core_outside_days}
              display={`${options.core_outside_days}일`}
              min={1}
              max={10}
              step={1}
              onChange={(v) => onPatch({ core_outside_days: v })}
            />
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-white px-5 py-4">
          <button
            type="button"
            disabled={busy}
            onClick={onReset}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            기본으로 되돌리기
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onApply}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            이 숫자로 다시 보기
          </button>
        </div>
      </aside>
    </div>
  )
}

function Knob({
  label,
  hint,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  hint?: string
  value: number
  display: string
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-green-700">{display}</span>
      </div>
      {hint ? <p className="mt-0.5 text-xs text-gray-500">{hint}</p> : null}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-green-600"
      />
    </label>
  )
}

function MetricChip({
  label,
  value,
  suffix,
  highlight,
}: {
  label: string
  value?: number
  suffix?: string
  highlight?: boolean
}) {
  const has = typeof value === 'number' && !Number.isNaN(value)
  return (
    <div
      className={`rounded-lg border p-3 text-center ${
        highlight ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="text-xs text-gray-500">{label}</div>
      <div
        className={`mt-1 text-lg font-bold tabular-nums ${
          highlight ? 'text-green-700' : 'text-gray-900'
        }`}
      >
        {has ? `${Math.round(value as number)}${suffix || ''}` : '—'}
      </div>
    </div>
  )
}

function actionLabel(action: string) {
  return ACTION_LABEL[action] || action
}

function reasonCodeLabel(code?: string) {
  if (!code) return ''
  return REASON_CODE_LABEL[code] || ''
}

function actionBadge(action: string) {
  if (action === 'buy') return 'bg-green-50 text-green-700 border border-green-200'
  if (action === 'sell') return 'bg-red-50 text-red-600 border border-red-200'
  if (action === 'rebalance') return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
  if (action === 'hold') return 'bg-blue-50 text-blue-600 border border-blue-200'
  if (action === 'wait') return 'bg-amber-50 text-amber-700 border border-amber-200'
  return 'bg-gray-50 text-gray-600 border border-gray-200'
}

function actionIcon(action: string) {
  if (action === 'buy') return '🟢'
  if (action === 'sell') return '🔴'
  if (action === 'rebalance') return '🟡'
  if (action === 'hold') return '🔵'
  if (action === 'wait') return '⏳'
  return '⚪'
}

function basketLabel(sleeve: string) {
  if (sleeve === 'aggressive') return FAST_LABEL
  if (sleeve === 'core') return SLOW_LABEL
  return sleeve
}

function marketMoodLabel(regime?: string) {
  if (!regime) return '—'
  const raw = regime.replace(/^(KR|US)\s+/i, '').toLowerCase()
  if (raw === 'bull') return '오르는 장'
  if (raw === 'bear') return '내리는 장'
  if (raw === 'sideways') return '옆으로 가는 장'
  return regime
}

function marketMoodBadge(regime?: string) {
  const raw = (regime || '').replace(/^(KR|US)\s+/i, '').toLowerCase()
  if (raw === 'bull') return 'bg-green-50 text-green-700'
  if (raw === 'bear') return 'bg-red-50 text-red-600'
  if (raw === 'sideways') return 'bg-yellow-50 text-yellow-700'
  return 'bg-gray-50 text-gray-600'
}

function countryLabel(country?: string) {
  if (!country) return ''
  const c = country.toLowerCase()
  if (c === 'kr' || c === 'korea') return '한국'
  if (c === 'us' || c === 'usa') return '미국'
  return country
}

function friendlyChartName(name: string, kind: 'market' | 'mood' | 'wait') {
  const key = name.toLowerCase()
  if (kind === 'market') {
    return { both: '한국+미국', kr: '한국만', us: '미국만' }[key] || name
  }
  if (kind === 'mood') {
    return {
      kr_sideways_bear_only: '한국 횡보·하락',
      skip_bull: '상승장 제외',
      favor_non_bull: '횡보·하락 우선',
      all: '모든 장',
    }[key] || name
  }
  return { '0': '당일', '1': '하루 뒤', '2': '이틀 뒤' }[key] || name
}

function chartRows(
  obj: Record<string, number> | null | undefined,
  kind: 'market' | 'mood' | 'wait',
) {
  if (!obj) return []
  return Object.entries(obj).map(([name, value]) => ({
    name: friendlyChartName(name, kind),
    value: Number(value),
  }))
}

export default function OpsDeskPage() {
  const [today, setToday] = useState<OpsToday | null>(null)
  const [backtest, setBacktest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [execMsg, setExecMsg] = useState('')
  const [nav, setNav] = useState(100000)
  const [options, setOptions] = useState<BasketOptions>(DEFAULT_BASKET_OPTIONS)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pastReport, setPastReport] = useState<PastReportKind | null>(null)
  const [optionsReady, setOptionsReady] = useState(false)
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all')
  const [sleeveFilter, setSleeveFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [tossStatus, setTossStatus] = useState<{
    configured?: boolean
    live_trading_enabled?: boolean
    ok?: boolean
    error?: string
    accounts?: Array<{ accountSeq?: number; accountType?: string }>
  } | null>(null)
  const optionsRef = useRef(options)
  const navRef = useRef(nav)
  optionsRef.current = options
  navRef.current = nav

  const load = async (refresh = false, nextOptions?: BasketOptions) => {
    const used = nextOptions ?? optionsRef.current
    const usedNav = navRef.current
    setLoading(true)
    setError('')
    try {
      const t = await fetchOpsToday(usedNav, refresh, used)
      const [b, toss] = await Promise.all([
        fetchOpsBacktest().catch(() => null),
        fetchTossStatus().catch(() => null),
      ])
      setToday(t)
      setBacktest(b)
      setTossStatus(toss)
      if (t?.options) {
        const applied = mergeBasketOptions(t.options)
        persistBasketOptions(applied)
        setOptions(applied)
        optionsRef.current = applied
      }
      if (nextOptions) {
        const applied = t?.options || used
        setExecMsg(
          `이 숫자로 다시 계산했어요. ${FAST_LABEL} 최대 ${applied.aggressive_slots}개 · ${SLOW_LABEL} ${applied.core_hold}개`,
        )
      }
    } catch (e: any) {
      setError(e?.message || '불러오지 못했어요')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const stored = loadStoredBasketOptions()
    setOptions(stored)
    setOptionsReady(true)
  }, [])

  useEffect(() => {
    if (!optionsReady) return
    load(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsReady])

  const applyOptions = (next: BasketOptions, refresh = true) => {
    persistBasketOptions(next)
    setOptions(next)
    if (refresh) load(true, next)
  }

  const actions = (today?.actions || []).filter(
    (a) => a.reason_code !== 'later_fill' && a.reason_code !== 'empty_slot' && a.action !== 'wait',
  )

  const buys = useMemo(() => actions.filter((a) => a.action === 'buy'), [actions])
  const sells = useMemo(() => actions.filter((a) => a.action === 'sell'), [actions])
  const holds = useMemo(() => actions.filter((a) => a.action === 'hold'), [actions])
  const others = useMemo(
    () => actions.filter((a) => !['buy', 'sell', 'hold'].includes(a.action)),
    [actions],
  )

  const sleeves = useMemo(() => {
    const set = new Set(actions.map((a) => a.sleeve).filter(Boolean))
    return Array.from(set)
  }, [actions])

  const visibleActions = useMemo(() => {
    return actions.filter((a) => {
      const matchAction =
        actionFilter === 'all'
          ? true
          : actionFilter === 'other'
            ? !['buy', 'sell', 'hold'].includes(a.action)
            : a.action === actionFilter
      const matchSleeve = sleeveFilter === 'all' ? true : a.sleeve === sleeveFilter
      return matchAction && matchSleeve
    })
  }, [actions, actionFilter, sleeveFilter])

  const coreBasketRows = useMemo(() => {
    const fromPayload = today?.payload?.core_basket
    if (fromPayload && fromPayload.length) {
      return [...fromPayload]
        .filter((row) => row.action !== 'wait' && row.reason_code !== 'later_fill')
        .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
    }
    return (today?.payload?.top10 || []).slice(0, options.core_hold).map((row) => ({
      ...row,
      action: 'buy',
    }))
  }, [today, options.core_hold])

  const rankedByCode = useMemo(() => {
    const map = new Map<string, any>()
    const payload: any = today?.payload || {}
    for (const row of [...(payload.top15 || []), ...(payload.top10 || [])]) {
      if (row?.code) map.set(String(row.code), row)
    }
    return map
  }, [today])

  const marketChart = chartRows(backtest?.charts?.market_mode, 'market')
  const regimeChart = chartRows(backtest?.charts?.regime_mode, 'mood')
  const waitChart = chartRows(backtest?.charts?.wait_k, 'wait')

  const onDryRun = async () => {
    if (!today) return
    setBusy(true)
    setError('')
    try {
      const res = await executeOpsPlan({ plan_id: today.plan_id, dry_run: true, approve: true })
      setExecMsg(`연습 실행 완료 · ${res.results?.length || 0}건 확인함`)
    } catch (e: any) {
      setError(e?.message || '연습 실행에 실패했어요')
    } finally {
      setBusy(false)
    }
  }

  const onLiveRun = async () => {
    if (!today) return
    if (!tossStatus?.configured) {
      setError('토스 Open API 키가 아직 연결되지 않았어요. 서버 환경변수를 확인하세요.')
      return
    }
    if (!tossStatus?.live_trading_enabled) {
      setError('실주문이 꺼져 있어요. 서버에 TOSS_LIVE_TRADING_ENABLED=1 을 넣은 뒤 재시작하세요.')
      return
    }
    const ok = window.confirm(
      '뉴턴이 계좌를 대신 운용하는 서비스가 아닙니다.\n본인 토스 계좌로 직접 실험 주문을 넣습니다. 계속할까요?\n(확인 후 LIVE 입력이 한 번 더 필요합니다)',
    )
    if (!ok) return
    const confirmText = window.prompt('실주문을 위해 LIVE 를 입력하세요')
    if (confirmText !== 'LIVE') {
      setError('실주문이 취소되었습니다.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await executeOpsPlan({
        plan_id: today.plan_id,
        dry_run: false,
        approve: true,
        confirm: 'LIVE',
      })
      const submitted = (res.results || []).filter((r: any) => r.status === 'submitted').length
      const blocked = (res.results || []).filter((r: any) =>
        ['blocked', 'error', 'needs_price', 'skipped'].includes(r.status),
      ).length
      setExecMsg(`실주문 요청 완료 · 접수 ${submitted}건 · 보류/오류 ${blocked}건`)
      await load(true)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || '실주문에 실패했어요')
    } finally {
      setBusy(false)
    }
  }

  const applyPreset = (preset: (typeof BASKET_PRESETS)[number]) => {
    const next = mergeBasketOptions({ ...preset.options, preset: preset.id })
    applyOptions(next)
    setExecMsg(`${preset.label}으로 다시 계산했어요`)
  }

  const churn = today?.payload?.rank_churn
  const regimes = (today?.payload?.regimes || {}) as Record<string, { regime?: string }>

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        active="ops"
        right={
          <span className="hidden sm:inline-flex items-center rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">
            {today?.as_of || '—'}
          </span>
        }
      />

      {/* Title + Action Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">오늘의 투자 안내</h2>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                  오늘 해야 할 일
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 max-w-3xl">
                투자금의 {Math.round(options.aggressive_pct * 100)}%는{' '}
                <strong>{FAST_LABEL}</strong>에 씁니다. 많이 빠진 종목을 사서, 다시 오르면 빨리
                팝니다. 나머지 {Math.round(options.core_pct * 100)}%는{' '}
                <strong>{SLOW_LABEL}</strong>에 씁니다. 좋은 회사를 싸게 사서 오래 들고 갑니다.{' '}
                {FAST_LABEL}는 한 번에 최대 {options.aggressive_slots}종목만 사고, 빈 자리는 현금으로
                둡니다. {SLOW_LABEL}는 매일 상위 {options.core_observe}개를 눈으로만 보고, 상위{' '}
                {options.core_band}개 안에 있으면 바로 팔지 않아 너무 자주 사고팔지 않게 합니다.
                오늘 이 화면의 추천은 <strong>모든 이용자에게 같습니다</strong>.
                계좌 맞춤 상담은 하지 않습니다. 기본은 <strong>연습 실행</strong>입니다.
              </p>
              <div className="mt-3">
                <p className="text-xs text-gray-500">
                  아래 추천 조합을 누르면 바로 그 방식으로 다시 계산합니다.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BASKET_PRESETS.map((preset) => {
                    const active = options.preset === preset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        disabled={loading || busy}
                        className={`rounded-lg border px-3 py-2 text-left disabled:opacity-50 ${
                          active
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-semibold">{preset.label}</div>
                        <div className="text-xs text-gray-500">{preset.hint}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50"
                >
                  숫자를 직접 조절하기
                </button>
                {!planningEqual(options, DEFAULT_BASKET_OPTIONS) && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                    기본과 다른 방식으로 보는 중
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                뉴턴은 남의 계좌를 대신 사고팔지 않습니다. 토스 연동은 본인 실험용입니다.
                {tossStatus
                  ? ` · ${
                      tossStatus.configured
                        ? tossStatus.ok === false
                          ? `키는 있음 · 오류 ${tossStatus.error || ''}`
                          : '키 연결됨'
                        : '키 없음(연습만)'
                    }`
                  : ''}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                참고할 투자금(원)
                <input
                  type="number"
                  value={nav}
                  onChange={(e) => setNav(Number(e.target.value) || 0)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </label>
              <button
                onClick={() => applyOptions(options)}
                disabled={loading || busy}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 disabled:opacity-50"
              >
                오늘 추천 다시 보기
              </button>
              <details className="w-full sm:w-auto">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                  본인 실험 (서비스 아님)
                </summary>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={onDryRun}
                    disabled={loading || busy || !today}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    토스 연습 실행
                  </button>
                  <button
                    onClick={onLiveRun}
                    disabled={loading || busy || !today}
                    className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50"
                  >
                    토스 본인 계좌 실험
                  </button>
                </div>
              </details>
            </div>
          </div>

          {(execMsg || error) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {execMsg && (
                <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm">
                  {execMsg}
                </span>
              )}
              {error && (
                <span className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm">
                  {error}
                </span>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-600">오늘 추천을 만들고 있어요...</p>
          </div>
        ) : !today ? (
          <div className="text-center py-20 text-gray-500">오늘 추천이 아직 없어요.</div>
        ) : (
          <div className="space-y-8">
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
              지금 계산에 쓴 숫자:{' '}
              <strong>
                {FAST_LABEL} 최대 {today.options?.aggressive_slots ?? options.aggressive_slots}개
              </strong>
              {' · '}
              <strong>
                {SLOW_LABEL} {today.options?.core_hold ?? options.core_hold}개
              </strong>
              . 조건에 맞는 종목이 더 적으면 있는 만큼만 보여 줍니다.
            </div>
            {/* Stats */}
            <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <StatCard label="오늘 날짜" value={today.as_of} icon="🗓" />
              <StatCard
                label="한국 주식시장"
                value={marketMoodLabel(regimes.kr?.regime)}
                icon="🇰🇷"
                tone={marketMoodBadge(regimes.kr?.regime)}
              />
              <StatCard
                label="미국 주식시장"
                value={marketMoodLabel(regimes.us?.regime)}
                icon="🇺🇸"
                tone={marketMoodBadge(regimes.us?.regime)}
              />
              <StatCard
                label={FAST_LABEL}
                value={today.payload.aggressive_open ? '오늘 매수 가능' : '오늘은 쉬기'}
                icon={today.payload.aggressive_open ? '✅' : '⏸'}
                tone={
                  today.payload.aggressive_open
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-50 text-gray-600'
                }
              />
            </section>

            {/* Counts */}
            <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <CountCard title="매수" count={buys.length} items={buys} accent="text-green-600" />
              <CountCard title="매도" count={sells.length} items={sells} accent="text-red-600" />
              <CountCard title="보유" count={holds.length} items={holds} accent="text-blue-600" />
              <CountCard title="그 외" count={others.length} items={others} accent="text-gray-600" />
            </section>

            {/* Actions table */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-gray-900">왜 이렇게 하라는 거야?</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      { value: 'all', label: '전체', icon: '📋' },
                      { value: 'buy', label: '매수', icon: '🟢' },
                      { value: 'sell', label: '매도', icon: '🔴' },
                      { value: 'hold', label: '보유', icon: '🔵' },
                      { value: 'other', label: '그 외', icon: '⚪' },
                    ] as Array<{ value: ActionFilter; label: string; icon: string }>
                  ).map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActionFilter(tab.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        actionFilter === tab.value
                          ? 'bg-green-500 text-white shadow-sm font-semibold'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                  {sleeves.length > 1 && (
                    <select
                      value={sleeveFilter}
                      onChange={(e) => setSleeveFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white"
                    >
                      <option value="all">모든 방식</option>
                      {sleeves.map((s) => (
                        <option key={s} value={s}>
                          {basketLabel(s)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          할 일
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          종목
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          어느 방식
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          이유
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          얼마쯤 넣을까
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {visibleActions.map((action) => {
                        const isOpen = expandedId === action.id
                        const row = rankedByCode.get(String(action.code))
                        const reasons = buildReasons(action, row)
                        return (
                          <Fragment key={action.id}>
                            <tr
                              className={`transition-colors align-top cursor-pointer ${
                                isOpen ? 'bg-green-50/60' : 'hover:bg-gray-50'
                              }`}
                              onClick={() => setExpandedId(isOpen ? null : action.id)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${actionBadge(
                                    action.action,
                                  )}`}
                                >
                                  {actionIcon(action.action)} {actionLabel(action.action)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-gray-900">{action.name}</div>
                                <div className="text-sm text-gray-500">{action.code}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                                  {basketLabel(action.sleeve)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-800">
                                  {friendlyReason(action.reason)}
                                </div>
                                <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-green-700">
                                  {isOpen ? '▲ 접기' : '▼ 자세한 이유 보기'}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                {action.suggested_notional != null ? (
                                  <>
                                    <div className="font-semibold text-gray-900 tabular-nums">
                                      {Math.round(action.suggested_notional).toLocaleString()}원
                                    </div>
                                    {action.target_weight_in_sleeve != null && (
                                      <div className="text-xs text-gray-500">
                                        이 방식의 {(action.target_weight_in_sleeve * 100).toFixed(0)}%
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                            </tr>
                            {isOpen && (
                              <tr className="bg-green-50/40">
                                <td colSpan={5} className="px-6 pb-6 pt-1">
                                  <div className="rounded-lg border border-green-100 bg-white p-5 shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <h4 className="text-base font-bold text-gray-900">
                                        왜 “{action.name}”를 {actionLabel(action.action)}하라고 하나요?
                                      </h4>
                                      {action.stock_id != null ? (
                                        <a
                                          href={`/stocks/${action.stock_id}`}
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-xs font-medium text-green-700 hover:text-green-800 underline"
                                        >
                                          이 종목 상세 페이지로 이동 →
                                        </a>
                                      ) : (
                                        <a
                                          href="/screen"
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-xs font-medium text-green-700 hover:text-green-800 underline"
                                        >
                                          종목 탐색으로 이동 →
                                        </a>
                                      )}
                                    </div>

                                    {row && (
                                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        <MetricChip
                                          label="회사 튼튼함"
                                          value={row.quality_score}
                                          suffix="점"
                                        />
                                        <MetricChip
                                          label="싸진 정도"
                                          value={row.cheapness_score}
                                          suffix="점"
                                        />
                                        <MetricChip
                                          label="1년 낙폭"
                                          value={
                                            typeof row.drawdown_1y === 'number'
                                              ? Math.round(row.drawdown_1y * 100)
                                              : undefined
                                          }
                                          suffix="%"
                                        />
                                        <MetricChip
                                          label="매력점수"
                                          value={row.attractiveness}
                                          suffix="점"
                                          highlight
                                        />
                                      </div>
                                    )}

                                    {reasons.length > 0 && (
                                      <ul className="mt-4 space-y-2">
                                        {reasons.map((r, i) => (
                                          <li key={i} className="flex gap-2 text-sm text-gray-700">
                                            <span className="text-green-600">•</span>
                                            <span>{r}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}

                                    {row?.thesis && (
                                      <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm leading-relaxed text-gray-700">
                                        {friendlyThesis(row.thesis)}
                                      </div>
                                    )}

                                    <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3">
                                      <div className="text-xs font-semibold text-blue-700">
                                        앞으로 어떻게 하나요?
                                      </div>
                                      <div className="mt-1 text-sm text-blue-900">
                                        {nextStepText(action, options)}
                                      </div>
                                    </div>

                                    {!row && (
                                      <p className="mt-4 text-xs text-gray-400">
                                        이 종목의 상세 점수 데이터가 아직 없어요. 위 한 줄 이유와 규칙을 참고하세요.
                                      </p>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {visibleActions.length === 0 && (
                  <div className="text-center py-16 text-gray-500">조건에 맞는 안내가 없어요.</div>
                )}
              </div>
            </section>

            {/* Top10 + churn */}
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    {SLOW_LABEL} {options.core_hold}개
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    오늘 추천에 바로 담는 종목입니다. 매력점수는 튼튼함과 싸진 정도를 합친 100점 만점입니다.
                  </p>
                </div>
                <ul className="divide-y divide-gray-200">
                  {coreBasketRows.map((row: any, idx: number) => {
                    const ranked = rankedByCode.get(String(row.code))
                    const status = String(row.action || 'buy')
                    const attractiveness = row.attractiveness ?? ranked?.attractiveness
                    return (
                    <li
                      key={row.code}
                      className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-sm font-semibold text-gray-400 tabular-nums">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-gray-900">{row.name}</div>
                          <div className="text-sm text-gray-500">
                            {row.code}
                            {ranked?.country ? ` · ${countryLabel(String(ranked.country))}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionBadge(status)}`}>
                          {actionLabel(status)}
                        </span>
                        {attractiveness != null && (
                          <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-bold tabular-nums">
                            매력 {Number(attractiveness).toFixed(0)}점
                          </span>
                        )}
                      </div>
                    </li>
                    )
                  })}
                  {coreBasketRows.length === 0 && (
                    <li className="px-6 py-12 text-center text-gray-500">후보가 없어요.</li>
                  )}
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    어제와 비교하면
                  </h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <p className="text-sm text-gray-600">
                    지난번 날짜: {churn?.previous_as_of || '없음'}
                  </p>
                  <ChurnRow label="오늘 새로 담는 종목" codes={churn?.entered || []} tone="bg-green-50 text-green-700" />
                  <ChurnRow label="오늘 빼는 종목" codes={churn?.exited || []} tone="bg-red-50 text-red-600" />
                  <ChurnRow label="그대로 들고 가는 종목" codes={churn?.stayed || []} tone="bg-gray-100 text-gray-700" />
                  <p className="text-xs text-gray-500">
                    눈여겨볼 {options.core_observe}개에서 빠져도, {SLOW_LABEL}는 상위{' '}
                    {options.core_band}개 안에 있거나 산 지 얼마 안 됐으면 바로 팔지 않습니다.
                  </p>
                </div>
              </div>
            </section>

            {/* Backtest */}
            {backtest && (
              <section className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">과거 결과</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    한국 종목 중 1년 고점보다 35% 이상 떨어진 종목을 최대 5개 고르고,
                    매수 가격보다 오른 뒤 이틀 기다려 매도했을 때의 결과입니다.
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    과거 결과는 앞으로의 수익을 보장하지 않습니다.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <PlaybookCard
                    title={`${FAST_LABEL} 방식`}
                    book={backtest.aggressive}
                    onDetail={() => setPastReport('aggressive')}
                  />
                  <PlaybookCard
                    title="비교용 기본 방식"
                    book={backtest.baseline}
                    onDetail={() => setPastReport('baseline')}
                  />
                  <div className="flex flex-col bg-white rounded-lg shadow p-5">
                    <p className="text-sm font-semibold text-gray-900">과거에 결과가 나빴던 방법</p>
                    <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
                      {[
                        '미국 종목만 고르기',
                        '장이 많이 오른 날에도 무조건 매수',
                        '오른 당일 바로 매도',
                        '좋아 보이는 종목 수를 무작정 늘리기',
                      ].map((line) => (
                        <li key={line} className="flex gap-2">
                          <span className="text-red-500">✕</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => setPastReport('anti')}
                      className="mt-auto pt-4 text-left text-sm font-semibold text-green-700 hover:text-green-800"
                    >
                      상세 보기
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <MiniBar
                    title="어느 나라 종목을 골랐을 때"
                    data={marketChart}
                    onDetail={() => setPastReport('market')}
                  />
                  <MiniBar
                    title="어떤 장에서 매수했을 때"
                    data={regimeChart}
                    onDetail={() => setPastReport('mood')}
                  />
                  <MiniBar
                    title="오른 뒤 며칠 기다려 매도했을 때"
                    data={waitChart}
                    onDetail={() => setPastReport('wait')}
                  />
                </div>
              </section>
            )}
          </div>
        )}

        {/* Scroll to Top */}
        <div className="fixed bottom-8 right-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="맨 위로"
            className="w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </main>

      <PastResultReportModal
        kind={pastReport}
        data={backtest}
        onClose={() => setPastReport(null)}
      />

      <NumberSettingsDrawer
        open={settingsOpen}
        options={options}
        busy={loading || busy}
        onClose={() => setSettingsOpen(false)}
        onPatch={(patch) => setOptions((prev) => patchBasketOptions(prev, patch))}
        onReset={() => {
          applyOptions(DEFAULT_BASKET_OPTIONS)
          setExecMsg('기본으로 보기로 다시 계산했어요')
          setSettingsOpen(false)
        }}
        onApply={() => {
          applyOptions(options)
          setSettingsOpen(false)
        }}
      />

      <DisclaimerFooter />
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: string
  icon: string
  tone?: string
}) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span
          className={`px-2.5 py-1 rounded-lg text-lg font-bold ${tone || 'bg-gray-50 text-gray-900'}`}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

function CountCard({
  title,
  count,
  items,
  accent,
}: {
  title: string
  count: number
  items: OpsAction[]
  accent: string
}) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <p className={`text-3xl font-bold ${accent}`}>{count}</p>
      </div>
      <ul className="mt-3 space-y-1 text-xs text-gray-500">
        {items.slice(0, 12).map((a) => (
          <li key={a.id} className="truncate">
            {a.code}
            {reasonCodeLabel(a.reason_code) ? ` · ${reasonCodeLabel(a.reason_code)}` : ''}
          </li>
        ))}
        {items.length === 0 && <li className="text-gray-400">없음</li>}
      </ul>
    </div>
  )
}

function ChurnRow({ label, codes, tone }: { label: string; codes: string[]; tone: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {codes.length ? (
          codes.map((code) => (
            <span key={code} className={`px-2.5 py-1 rounded-full text-xs font-medium ${tone}`}>
              {code}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </div>
    </div>
  )
}

function PlaybookCard({
  title,
  book,
  onDetail,
}: {
  title: string
  book: any
  onDetail?: () => void
}) {
  if (!book) {
    return (
      <div className="bg-white rounded-lg shadow p-5 text-sm text-gray-500">
        {title}: 데이터 없음
      </div>
    )
  }
  const isShortBasket = title === `${FAST_LABEL} 방식`
  const averageReturn = book.expected_basket_pct ?? book.avg_basket_pct
  const profitableCount =
    book.name_win_pct == null ? null : Math.max(0, Math.min(10, Math.round(book.name_win_pct / 10)))
  const attempts = isShortBasket
    ? '66번의 기회 중 11번만 매수했어요 (약 17%)'
    : book.traded_entries != null
      ? `66번의 기회 중 ${book.traded_entries}번 매수했어요`
      : ''

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-600">
        {isShortBasket
          ? '한국 종목 중 크게 떨어진 5개까지만 매수하고, 반등한 뒤 이틀 기다리는 방법'
          : '나라와 장 분위기를 가리지 않고 상위 5개를 매수하는 비교용 방법'}
      </p>
      {averageReturn != null && (
        <p className="mt-3 text-sm text-gray-800 tabular-nums">
          한 번 살 때 평균{' '}
          <span className="font-bold text-green-600">
            {Number(averageReturn) >= 0 ? '+' : ''}
            {Number(averageReturn).toFixed(2)}%
          </span>{' '}
          {book.name_win_pct != null && `· 수익 난 종목 ${book.name_win_pct}%`}
        </p>
      )}
      {profitableCount != null && (
        <p className="mt-1 text-xs text-gray-500">
          쉽게 말하면 종목 10개 중 약 {profitableCount}개가 수익이었어요.
        </p>
      )}
      {isShortBasket && (
        <p className="mt-2 text-xs text-yellow-700">
          실제로 산 횟수가 적어서 결과를 너무 확신하면 안 됩니다.
        </p>
      )}
      {attempts && <p className="mt-1 text-xs text-gray-500">{attempts}</p>}
      {onDetail && (
        <button
          type="button"
          onClick={onDetail}
          className="mt-3 text-sm font-semibold text-green-700 hover:text-green-800"
        >
          상세 보기
        </button>
      )}
    </div>
  )
}

function MiniBar({
  title,
  data,
  onDetail,
}: {
  title: string
  data: Array<{ name: string; value: number }>
  onDetail?: () => void
}) {
  return (
    <div className="flex h-72 flex-col bg-white rounded-lg shadow p-4">
      <p className="mb-2 text-sm font-semibold text-gray-900">{title}</p>
      {data.length === 0 ? (
        <p className="text-xs text-gray-400">차트 데이터 없음</p>
      ) : (
        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-15}
                textAnchor="end"
                height={45}
                tick={{ fontSize: 9 }}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)}%`, '평균 수익']}
              />
              <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {onDetail && (
        <button
          type="button"
          onClick={onDetail}
          className="mt-2 text-left text-sm font-semibold text-green-700 hover:text-green-800"
        >
          상세 보기
        </button>
      )}
    </div>
  )
}

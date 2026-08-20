'use client'

import { useEffect, type ReactNode } from 'react'

export type PastReportKind = 'aggressive' | 'baseline' | 'anti' | 'market' | 'mood' | 'wait'

const TITLES: Record<PastReportKind, string> = {
  aggressive: '반등해서 팔기, 자세히 보기',
  baseline: '비교용 기본 방식, 자세히 보기',
  anti: '과거에 결과가 나빴던 방법',
  market: '어느 나라 종목을 골랐을 때',
  mood: '어떤 장에서 매수했을 때',
  wait: '오른 뒤 며칠 기다려 매도했을 때',
}

function pct(value: number | null | undefined, digits = 2) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  const n = Number(value)
  return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`
}

function num(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return String(value)
}

function winTen(winPct: number | null | undefined) {
  if (winPct == null) return null
  return Math.max(0, Math.min(10, Math.round(Number(winPct) / 10)))
}

function moodLabel(key: string) {
  return (
    {
      bull: '오르는 장',
      sideways: '옆으로 가는 장',
      bear: '내리는 장',
      kr_sideways_bear_only: '한국이 횡보·하락일 때만',
      skip_bull: '너무 달아오른 날은 쉬기',
      favor_non_bull: '횡보·하락을 더 보기',
      all: '모든 장에서 사기',
    }[key] || key
  )
}

function marketLabel(key: string) {
  return { kr: '한국만', us: '미국만', both: '한국+미국' }[key] || key
}

function waitLabel(key: string) {
  return { '0': '오른 당일', '1': '하루 뒤', '2': '이틀 뒤' }[key] || `${key}일 뒤`
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h4 className="text-sm font-bold text-gray-900">{title}</h4>
      <div className="text-sm leading-6 text-gray-700">{children}</div>
    </section>
  )
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      {children}
    </div>
  )
}

function Easy({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-900">
      {children}
    </div>
  )
}

function Stats({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="text-xs text-gray-500">{item.label}</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

function Rows({
  rows,
}: {
  rows: Array<{ name: string; value: string; note?: string }>
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {rows.map((row, i) => (
        <div
          key={row.name}
          className={`flex items-start justify-between gap-3 px-3 py-2 text-sm ${
            i % 2 ? 'bg-gray-50' : 'bg-white'
          }`}
        >
          <div>
            <p className="font-medium text-gray-800">{row.name}</p>
            {row.note ? <p className="text-xs text-gray-500">{row.note}</p> : null}
          </div>
          <p className="shrink-0 font-semibold tabular-nums text-gray-900">{row.value}</p>
        </div>
      ))}
    </div>
  )
}

function HowWeLooked({ study }: { study: any }) {
  const years = study?.lookback_years || 5
  const count = study?.entry_count || 66
  const first = study?.entry_first || '2021-07-27'
  const last = study?.entry_last || '2026-07-21'
  const tried = study?.configs_tried
  const gap = study?.spacing_days || 28
  return (
    <Section title="우리가 어떻게 살펴봤나요?">
      <p>
        {years}년치 주가를 가지고, 약 {gap}일마다 &quot;그날이었다면 무엇을 샀을까&quot;를 다시
        계산했습니다. {first}부터 {last}까지 모두 {count}번 살펴봤습니다.
      </p>
      {tried ? (
        <p className="mt-2">
          나라, 장 분위기, 몇 개를 살지, 얼마나 빠진 것만 볼지, 오른 뒤 며칠 기다릴지를 바꿔 가며
          조합을 {Number(tried).toLocaleString('ko-KR')}개 넘게 비교했습니다. 오늘 화면에 보이는
          숫자는 그중에서 실제로 쓸 만한 조합을 골라 정리한 것입니다.
        </p>
      ) : null}
      <p className="mt-2 text-xs text-gray-500">
        이 결과는 연습 계산입니다. 실제 수수료·세금·체결 가격은 넣지 않았고, 앞으로의 수익을
        약속하지 않습니다.
      </p>
    </Section>
  )
}

function AggressiveReport({ data }: { data: any }) {
  const book = data?.aggressive || {}
  const study = data?.study || {}
  const avg = book.expected_basket_pct ?? book.avg_basket_pct
  const win = book.name_win_pct
  const top = (data?.top_results || [])[0] || {}
  const traded = top.traded_entries ?? 11
  const entries = study.entry_count || 66
  const positive = top.basket_positive_entries
  const names = top.name_trials
  const median = top.median_basket_pct
  const baselineAvg = data?.baseline?.avg_basket_pct
  const vs = book.vs_baseline_pp
  const ten = winTen(win)

  return (
    <div className="space-y-6">
      <Easy>
        크게 빠진 한국 종목만, 장이 너무 달아오르지 않은 날에, 최대 5개까지 사고, 산 가격보다 오른
        뒤 이틀을 기다렸다가 파는 방법입니다. 한 번 살 때 평균 {pct(avg)}, 산 종목 10개 중 약{' '}
        {ten ?? 8}개가 수익이었습니다.
      </Easy>
      <HowWeLooked study={study} />
      <Section title="이 방식이 하는 일">
        <ul className="list-disc space-y-1 pl-5">
          <li>한국 주식만 봅니다.</li>
          <li>최근 1년 최고가보다 35% 이상 떨어진 종목만 후보에 넣습니다.</li>
          <li>한국 장이 너무 뜨거울 때는 새로 사지 않고 쉽니다.</li>
          <li>한 번에 최대 5개만 삽니다. 조건에 맞는 종목이 더 적으면 있는 만큼만 삽니다.</li>
          <li>산 가격보다 다시 오르면, 바로 팔지 않고 이틀을 더 기다립니다.</li>
        </ul>
      </Section>
      <Section title="숫자로 본 결과">
        <Stats
          items={[
            { label: '한 번 살 때 평균 수익', value: pct(avg) },
            { label: '가운데 값(중간 수익)', value: pct(median) },
            { label: '수익이 난 종목 비율', value: win != null ? `${win}%` : '—' },
            {
              label: '실제로 산 횟수',
              value: `${num(traded)} / ${num(entries)}번 (약 ${Math.round((traded / entries) * 100)}%)`,
            },
            {
              label: '묶음 전체가 플러스였던 날',
              value: positive != null ? `${positive} / ${traded}번` : '—',
            },
            { label: '실제로 산 종목 수', value: names != null ? `${names}개` : '—' },
          ]}
        />
      </Section>
      <Section title="쉽게 말하면">
        <p>
          {entries}번의 기회 중 {traded}번만 샀습니다. 자주 사는 방법이 아니라, 조건이 맞을 때만
          움직이는 방법입니다.
        </p>
        <p className="mt-2">
          산 뒤에는 종목 10개 중 약 {ten ?? 8}개가 돈을 벌었습니다. 한 번 살 때 평균 {pct(avg)}가
          났고, 가운데 값은 {pct(median)}입니다. 중간값이 평균보다 조금 더 좋다는 것은, 몇 번은
          덜 좋았지만 대체로 괜찮은 날이 더 많았다는 뜻입니다.
        </p>
        {baselineAvg != null && (
          <p className="mt-2">
            나라와 장 분위기를 가리지 않고 사는 비교용 방법({pct(baselineAvg)})보다{' '}
            {vs != null ? `${pct(vs)}포인트` : '꽤'} 더 좋았습니다.
          </p>
        )}
      </Section>
      <Note>
        산 횟수가 {traded}번뿐이라, 운이 섞였을 수 있습니다. 숫자를 너무 확신하면 안 됩니다. 과거
        결과가 앞으로의 수익을 보장하지 않습니다.
      </Note>
      <Section title="그래서 오늘 화면에 이렇게 씁니다">
        <p>
          오늘의 투자 안내에서 반등해서 팔기는 이 규칙을 기본으로 씁니다. 자리를 늘려도 조건에 맞는
          종목이 없으면 현금으로 남겨 두는 이유도 같습니다. 자주 사는 것보다, 싸게 떨어진 뒤에만
          사는 쪽이 과거에 더 나았습니다.
        </p>
      </Section>
    </div>
  )
}

function BaselineReport({ data }: { data: any }) {
  const book = data?.baseline || {}
  const study = data?.study || {}
  const avg = book.avg_basket_pct
  const win = book.name_win_pct
  const traded = book.traded_entries
  const entries = study.entry_count || 66
  const ten = winTen(win)
  const agg = data?.aggressive?.expected_basket_pct ?? data?.aggressive?.avg_basket_pct

  return (
    <div className="space-y-6">
      <Easy>
        이 칸은 &quot;우리 방식이 정말 나은가?&quot;를 보기 위한 비교입니다. 나라와 장 분위기를
        가리지 않고 상위 5개를 사고, 오른 뒤 하루 만에 팔았습니다. 한 번 살 때 평균 {pct(avg)},
        종목 10개 중 약 {ten ?? 6}개가 수익이었습니다.
      </Easy>
      <HowWeLooked study={study} />
      <Section title="비교용 방법이 하는 일">
        <ul className="list-disc space-y-1 pl-5">
          <li>한국과 미국을 함께 봅니다.</li>
          <li>장이 오르든 내리든 그날 상위 5개를 삽니다.</li>
          <li>얼마나 빠졌는지는 따로 보지 않습니다.</li>
          <li>산 가격보다 오르면 다음 날 팝니다.</li>
        </ul>
      </Section>
      <Section title="숫자로 본 결과">
        <Stats
          items={[
            { label: '한 번 살 때 평균 수익', value: pct(avg) },
            { label: '가운데 값(중간 수익)', value: pct(book.median_basket_pct) },
            { label: '수익이 난 종목 비율', value: win != null ? `${win}%` : '—' },
            {
              label: '실제로 산 횟수',
              value:
                traded != null
                  ? `${traded} / ${entries}번 (약 ${Math.round((traded / entries) * 100)}%)`
                  : '—',
            },
            {
              label: '묶음 전체가 플러스였던 날',
              value:
                book.basket_positive_entries != null && traded != null
                  ? `${book.basket_positive_entries} / ${traded}번`
                  : '—',
            },
            {
              label: '실제로 산 종목 수',
              value: book.name_trials != null ? `${book.name_trials}개` : '—',
            },
          ]}
        />
      </Section>
      <Section title="쉽게 말하면">
        <p>
          이 방법은 더 자주 삽니다. {entries}번 중 {traded ?? '—'}번이나 움직였습니다. 대신 한 번
          살 때 남는 돈이 작았습니다. 평균 {pct(avg)}이고, 종목 10개 중 약 {ten ?? 6}개만
          수익이었습니다.
        </p>
        <p className="mt-2">
          반등해서 팔기({pct(agg)})와 비교하면, 자주 사는 쪽이 반드시 더 좋은 것은 아니었습니다.
          그래서 오늘 화면의 기본은 &quot;아무 때나 사기&quot;가 아니라 &quot;크게 빠진 뒤에만
          사기&quot;입니다.
        </p>
      </Section>
      <Note>
        비교용 숫자는 &quot;아무것도 안 하는 것&quot;이 아니라, &quot;규칙을 느슨하게 했을 때&quot;의
        결과입니다. 이 숫자가 낮다고 시장 전체가 나빴다는 뜻은 아닙니다.
      </Note>
    </div>
  )
}

function AntiReport({ data }: { data: any }) {
  const levers = data?.lever_avgs_pct || data?.charts || {}
  const market = levers.market_mode || {}
  const mood = levers.regime_mode || {}
  const wait = levers.wait_k || {}
  const topN = levers.top_n || {}

  const items = [
    {
      title: '미국 종목만 고르기',
      result: `미국만 보면 평균 ${pct(market.us)}, 한국만 보면 ${pct(market.kr)}`,
      why: '지난 5년을 같은 규칙으로 돌려 보니, 미국만 고른 조합이 가장 적게 남았습니다. 미국이 계속 오르는 날에는 이미 비싼 자리를 쫓아가는 경우가 많았습니다.',
    },
    {
      title: '장이 많이 오른 날에도 무조건 매수',
      result: `모든 장에서 사면 평균 ${pct(mood.all)}, 너무 달아오른 날을 쉬면 ${pct(mood.skip_bull)}`,
      why: '장이 뜨거울 때 따라 사면, 이미 많이 오른 뒤에 들어가기 쉽습니다. 쉬는 날이 있어도, 과거에 남은 돈이 더 많았습니다.',
    },
    {
      title: '오른 당일 바로 매도',
      result: `당일 ${pct(wait['0'] ?? wait[0])}, 하루 뒤 ${pct(wait['1'] ?? wait[1])}, 이틀 뒤 ${pct(wait['2'] ?? wait[2])}`,
      why: '잠깐 올랐다가 바로 팔면, 그다음 날 이어지는 오름을 놓치는 경우가 많았습니다. 하루·이틀을 더 기다리는 쪽이 평균이 더 좋았습니다.',
    },
    {
      title: '좋아 보이는 종목 수를 무작정 늘리기',
      result: `3개만 고르면 평균 ${pct(topN['3'] ?? topN[3])}, 5개를 고르면 ${pct(topN['5'] ?? topN[5])}`,
      why: '종목을 많이 담는다고 수익이 커지지 않았습니다. 순위가 낮은 종목까지 넣으면 평균이 오히려 떨어졌습니다. 그래서 한 번에 사는 수를 작게 둡니다.',
    },
  ]

  return (
    <div className="space-y-6">
      <Easy>
        좋아 보이는 선택이라고 해서 과거에 항상 잘된 것은 아니었습니다. 아래 네 가지는 여러 조합을
        비교했을 때 결과가 나빴던 버릇입니다.
      </Easy>
      <HowWeLooked study={data?.study} />
      {items.map((item) => (
        <Section key={item.title} title={item.title}>
          <p className="font-medium text-gray-900">{item.result}</p>
          <p className="mt-2">{item.why}</p>
        </Section>
      ))}
      <Note>
        &quot;하지 말라&quot;는 말은 절대 금지라기보다, 과거에 평균이 나빴으니 기본값으로는 쓰지
        않는다는 뜻입니다. 숫자를 직접 조절하면 같은 선택을 다시 해볼 수는 있습니다.
      </Note>
    </div>
  )
}

function MarketReport({ data }: { data: any }) {
  const market = data?.charts?.market_mode || data?.lever_avgs_pct?.market_mode || {}
  const summary = data?.regime_summary || {}
  const playbook = data?.regime_playbook || []

  const rows = Object.entries(market).map(([key, value]) => ({
    name: marketLabel(key),
    value: pct(Number(value)),
    note:
      key === 'kr'
        ? '오늘 기본으로 쓰는 쪽'
        : key === 'us'
          ? '과거에 가장 적게 남음'
          : '둘을 섞으면 한국만보다 조금 낮음',
  }))

  const kr = summary.kr?.by_regime || {}
  const us = summary.us?.by_regime || {}

  return (
    <div className="space-y-6">
      <Easy>
        같은 규칙을 한국만, 미국만, 둘 다에 적용해 보았습니다. 평균 수익은 한국만{' '}
        {pct(market.kr)} , 한국+미국 {pct(market.both)} , 미국만 {pct(market.us)} 이었습니다.
      </Easy>
      <HowWeLooked study={data?.study} />
      <Section title="나라별로 한 번에 산 묶음의 평균">
        <Rows rows={rows} />
      </Section>
      <Section title="장 분위기까지 나눠 보면">
        <p className="mb-2">
          나라만 나누지 않고, 그 나라 장이 오르는지 내리는지도 같이 봤습니다.
        </p>
        <Rows
          rows={[
            {
              name: '한국 · 오르는 장',
              value: pct(kr.bull?.avg_basket_mix_pct),
              note: `${num(kr.bull?.entries)}번 살펴봄 · 수익 난 종목 ${num(kr.bull?.name_win_mix_pct)}%`,
            },
            {
              name: '한국 · 옆으로 가는 장',
              value: pct(kr.sideways?.avg_basket_mix_pct),
              note: `${num(kr.sideways?.entries)}번 살펴봄 · 수익 난 종목 ${num(kr.sideways?.name_win_mix_pct)}%`,
            },
            {
              name: '한국 · 내리는 장',
              value: pct(kr.bear?.avg_basket_mix_pct),
              note: `${num(kr.bear?.entries)}번 살펴봄 · 수익 난 종목 ${num(kr.bear?.name_win_mix_pct)}%`,
            },
            {
              name: '미국 · 오르는 장',
              value: pct(us.bull?.avg_basket_mix_pct),
              note: `${num(us.bull?.entries)}번 살펴봄 · 수익 난 종목 ${num(us.bull?.name_win_mix_pct)}%`,
            },
            {
              name: '미국 · 옆으로 가는 장',
              value: pct(us.sideways?.avg_basket_mix_pct),
              note: `${num(us.sideways?.entries)}번 살펴봄 · 횟수가 적어 확신하기 어려움`,
            },
          ]}
        />
      </Section>
      <Section title="쉽게 말하면">
        <p>
          한국은 장이 옆으로 가거나 내릴 때 더 잘 맞았습니다. 이미 오르는 장에서 따라 사면 거의
          남지 않았습니다. 미국은 오르는 날이 많았지만, 그때 산 결과는 한국 횡보·하락만 못
          했습니다.
        </p>
        {playbook.length > 0 && (
          <p className="mt-2">
            그래서 오늘 기본은 한국 종목을 중심으로 보고, 미국만 고집하지 않습니다.
          </p>
        )}
      </Section>
      <Note>
        미국 횡보·하락은 살펴본 날이 적습니다. 그 칸의 숫자만 보고 &quot;미국은 항상 나쁘다&quot;고
        단정하면 안 됩니다.
      </Note>
    </div>
  )
}

function MoodReport({ data }: { data: any }) {
  const mood = data?.charts?.regime_mode || data?.lever_avgs_pct?.regime_mode || {}
  const summary = data?.regime_summary || {}
  const krDays = summary.kr?.regime_day_counts || {}
  const usDays = summary.us?.regime_day_counts || {}

  return (
    <div className="space-y-6">
      <Easy>
        &quot;아무 날이나 살까, 장이 너무 뜨거울 때는 쉴까&quot;를 비교했습니다. 모든 장에서 사면
        평균 {pct(mood.all)}, 너무 달아오른 날을 쉬면 {pct(mood.skip_bull)} 이었습니다.
      </Easy>
      <HowWeLooked study={data?.study} />
      <Section title="장 분위기를 나누는 방법">
        <p>
          최근 주가가 꾸준히 오르면 오르는 장, 크게 움직이지 않으면 옆으로 가는 장, 내려가면
          내리는 장으로 나눴습니다. 어려운 말은 쓰지 않고, 오늘 화면의 배지와 같은 뜻입니다.
        </p>
      </Section>
      <Section title="어떤 날에 샀을 때 평균이 좋았나">
        <Rows
          rows={Object.entries(mood).map(([key, value]) => ({
            name: moodLabel(key),
            value: pct(Number(value)),
          }))}
        />
      </Section>
      <Section title="살펴본 날의 분위기">
        <Rows
          rows={[
            {
              name: '한국',
              value: `오름 ${num(krDays.bull)} · 옆 ${num(krDays.sideways)} · 내림 ${num(krDays.bear)}`,
              note: '한국은 옆으로 가거나 내리는 날이 더 많았습니다.',
            },
            {
              name: '미국',
              value: `오름 ${num(usDays.bull)} · 옆 ${num(usDays.sideways)} · 내림 ${num(usDays.bear)}`,
              note: '미국은 오르는 날이 훨씬 많았습니다.',
            },
          ]}
        />
      </Section>
      <Section title="쉽게 말하면">
        <p>
          장이 이미 달아오른 뒤에 따라 사면, 과거에 남는 돈이 작았습니다. 한국이 옆으로 가거나
          내릴 때 크게 빠진 종목을 고른 쪽이 더 나았습니다. 그래서 오늘 기본은 &quot;한국 장이
          너무 뜨거우면 반등해서 팔기를 쉬기&quot;입니다.
        </p>
      </Section>
      <Note>
        쉬는 날이 있으면 기회를 놓칠 수도 있습니다. 다만 지난 비교에서는, 쉬는 편이 평균 수익이
        더 좋았습니다.
      </Note>
    </div>
  )
}

function WaitReport({ data }: { data: any }) {
  const wait = data?.charts?.wait_k || data?.lever_avgs_pct?.wait_k || {}
  const v0 = wait['0'] ?? wait[0]
  const v1 = wait['1'] ?? wait[1]
  const v2 = wait['2'] ?? wait[2]

  return (
    <div className="space-y-6">
      <Easy>
        산 가격보다 다시 오른 뒤, 언제 팔지가 결과에 꽤 영향을 줬습니다. 당일 {pct(v0)}, 하루 뒤{' '}
        {pct(v1)}, 이틀 뒤 {pct(v2)} 이었습니다.
      </Easy>
      <HowWeLooked study={data?.study} />
      <Section title="이 숫자가 뜻하는 것">
        <p>
          종목을 산 뒤, 처음으로 산 가격보다 높아진 날을 &quot;다시 오른 날&quot;로 봅니다. 그
          날 바로 팔지, 하루 더 둘지, 이틀 더 둘지를 같은 종목·같은 날에 비교했습니다.
        </p>
      </Section>
      <Section title="기다린 날수별 평균">
        <Rows
          rows={Object.entries(wait)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([key, value]) => ({
              name: waitLabel(String(key)),
              value: pct(Number(value)),
              note:
                String(key) === '2'
                  ? '오늘 기본으로 쓰는 쪽'
                  : String(key) === '0'
                    ? '과거에 가장 적게 남음'
                    : undefined,
            }))}
        />
      </Section>
      <Section title="쉽게 말하면">
        <p>
          오르자마자 팔면 마음이 편할 수 있지만, 지난 계산에서는 하루·이틀을 더 두는 쪽이 평균이
          더 좋았습니다. 잠깐 올랐다가 끝나는 날도 있지만, 오름이 하루 이틀 더 이어지는 날이 더
          많았습니다.
        </p>
        <p className="mt-2">
          그래서 반등해서 팔기의 기본은 &quot;오른 뒤 이틀 기다리기&quot;입니다. 숫자를 직접
          조절하면 하루로 줄이거나 더 늘릴 수 있습니다.
        </p>
      </Section>
      <Note>
        오래 기다린다고 항상 더 좋은 것은 아닙니다. 여기서 비교한 것은 당일·하루·이틀입니다. 몇
        주씩 미루는 이야기는 다른 규칙(안 오르면 정리하기)입니다.
      </Note>
    </div>
  )
}

function ReportBody({ kind, data }: { kind: PastReportKind; data: any }) {
  if (kind === 'aggressive') return <AggressiveReport data={data} />
  if (kind === 'baseline') return <BaselineReport data={data} />
  if (kind === 'anti') return <AntiReport data={data} />
  if (kind === 'market') return <MarketReport data={data} />
  if (kind === 'mood') return <MoodReport data={data} />
  return <WaitReport data={data} />
}

export default function PastResultReportModal({
  kind,
  data,
  onClose,
}: {
  kind: PastReportKind | null
  data: any
  onClose: () => void
}) {
  useEffect(() => {
    if (!kind) return
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
  }, [kind, onClose])

  if (!kind) return null

  const asOf = data?.study?.as_of

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="레포트 닫기"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 top-8 mx-auto flex max-h-[calc(100vh-4rem)] w-[calc(100%-1.5rem)] max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:top-12">
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold text-green-700">과거 결과 레포트</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">{TITLES[kind]}</h3>
            {asOf ? (
              <p className="mt-1 text-xs text-gray-500">계산일 {asOf} · 용어는 쉬운 말로 적었습니다</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">용어는 쉬운 말로 적었습니다</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            닫기
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <ReportBody kind={kind} data={data} />
        </div>
        <div className="border-t border-gray-200 px-5 py-3 text-xs text-gray-500">
          과거 결과는 앞으로의 수익을 보장하지 않습니다. 투자 판단은 본인 몫입니다.
        </div>
      </div>
    </div>
  )
}

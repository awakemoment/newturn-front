'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

export type AppHeaderActive =
  | 'home'
  | 'ops'
  | 'screen'
  | 'watchlist'
  | 'portfolio'
  | 'compare'

const NAV: Array<{ id: AppHeaderActive; href: string; label: string }> = [
  { id: 'ops', href: '/ops', label: '오늘의 투자 안내' },
  { id: 'screen', href: '/screen', label: '종목 탐색' },
  { id: 'watchlist', href: '/watchlist', label: '관심 종목' },
  { id: 'portfolio', href: '/portfolio', label: '포트폴리오' },
]

export function PageBackLink({
  href,
  label = '뒤로',
}: {
  href?: string
  label?: string
}) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => (href ? router.push(href) : router.back())}
      className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  )
}

export default function AppHeader({
  active,
  right,
}: {
  active?: AppHeaderActive
  right?: ReactNode
}) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="shrink-0 text-2xl font-bold text-green-600"
          >
            newturn
          </button>
          <nav className="flex min-w-0 items-center gap-4 overflow-x-auto whitespace-nowrap sm:gap-5">
            {NAV.map((item) => {
              const isActive = active === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className={
                    isActive
                      ? 'text-sm font-semibold text-gray-900'
                      : 'text-sm text-gray-600 hover:text-gray-900'
                  }
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
        {right ? <div className="flex shrink-0 items-center gap-3">{right}</div> : null}
      </div>
    </header>
  )
}

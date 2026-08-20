'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AccountsRemovedLayout({
  children: _children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  useEffect(() => {
    router.replace('/')
  }, [router])
  return null
}

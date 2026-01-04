/**
 * 비교함 장바구니 훅
 * localStorage를 사용하여 종목 비교 목록 관리
 */
import { useState, useEffect } from 'react'

export interface ComparisonStock {
  id: number
  stock_code: string
  stock_name: string
  added_at: number
}

const STORAGE_KEY = 'newturn_comparison_cart'
const MAX_STOCKS = 5

export function useComparisonCart() {
  const [stocks, setStocks] = useState<ComparisonStock[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 초기 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          setStocks(JSON.parse(saved))
        } catch (error) {
          console.error('Failed to load comparison cart:', error)
          localStorage.removeItem(STORAGE_KEY)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // 변경 시 저장
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stocks))
    }
  }, [stocks, isLoaded])

  // 종목 추가
  const addStock = (stock: Omit<ComparisonStock, 'added_at'>): boolean => {
    // 이미 있는지 확인
    if (stocks.find(s => s.id === stock.id)) {
      return false
    }

    // 최대 개수 확인
    if (stocks.length >= MAX_STOCKS) {
      alert(`최대 ${MAX_STOCKS}개까지 비교할 수 있습니다`)
      return false
    }

    setStocks(prev => [...prev, { ...stock, added_at: Date.now() }])
    return true
  }

  // 종목 제거
  const removeStock = (id: number) => {
    setStocks(prev => prev.filter(s => s.id !== id))
  }

  // 전체 제거
  const clearAll = () => {
    setStocks([])
  }

  // 종목이 있는지 확인
  const hasStock = (id: number): boolean => {
    return stocks.some(s => s.id === id)
  }

  return {
    stocks,
    count: stocks.length,
    addStock,
    removeStock,
    clearAll,
    hasStock,
    isLoaded,
    isFull: stocks.length >= MAX_STOCKS,
  }
}


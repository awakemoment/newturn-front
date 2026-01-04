/**
 * 공통 타입 정의
 */

export interface Stock {
  id: number
  stock_code: string
  stock_name: string
  stock_name_en: string | null
  exchange: string
  sector: string | null
}

export interface HoldingSignalSimple {
  signal: string
  signal_display: string
  signal_date: string
}


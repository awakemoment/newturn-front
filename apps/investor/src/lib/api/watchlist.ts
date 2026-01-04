/**
 * 관심 종목(Watchlist) API
 */
import { apiClient } from '../axios'

export interface Watchlist {
  id: number
  stock: {
    id: number
    stock_code: string
    stock_name: string
  }
  memo?: string
  preferred_mate?: string
  is_holding: boolean
  purchase_date?: string
  purchase_price?: string
  quantity?: number
  alert_enabled: boolean
  alert_gap_ratio: number
  added_at: string
  last_checked_at: string
}

export interface WatchlistCreate {
  stock_id: number
  memo?: string
  preferred_mate?: string
}

export async function getWatchlist() {
  const { data } = await apiClient.get<Watchlist[]>('/api/watchlist/')
  return data
}

export async function addToWatchlist(params: WatchlistCreate) {
  const { data } = await apiClient.post<Watchlist>('/api/watchlist/', params)
  return data
}

export async function removeFromWatchlist(id: number) {
  await apiClient.delete(`/api/watchlist/${id}/`)
}

export async function updateWatchlist(id: number, params: Partial<WatchlistCreate>) {
  const { data } = await apiClient.patch<Watchlist>(`/api/watchlist/${id}/`, params)
  return data
}

export interface Signal {
  watchlist_id: number
  stock: {
    id: number
    stock_code: string
    stock_name: string
  }
  current_price: number
  proper_price: number
  gap_ratio: number
  signal: string
  icon: string
  mate: string
}

export interface SignalsResponse {
  buy_signals: Signal[]
  sell_signals: Signal[]
  hold_signals: Signal[]
  total: number
}

export async function getSignals() {
  const { data } = await apiClient.get<SignalsResponse>('/api/watchlist/signals/')
  return data
}

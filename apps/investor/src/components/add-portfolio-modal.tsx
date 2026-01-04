'use client'

import { useState } from 'react'
import { searchStocks, type Stock } from '@/lib/api/stocks'
import { createPortfolio, type PortfolioCreate } from '@/lib/api/portfolio'

interface AddPortfolioModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddPortfolioModal({ onClose, onSuccess }: AddPortfolioModalProps) {
  const [step, setStep] = useState<'search' | 'form'>('search')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Stock[]>([])
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: '',
    shares: '',
    memo: '',
    sell_criteria: '',
  })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (query.length < 2) {
      setError('검색어는 2글자 이상 입력해주세요')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const data = await searchStocks(query)
      setSearchResults(data.results)
      if (data.results.length === 0) {
        setError('검색 결과가 없습니다')
      }
    } catch (err) {
      setError('검색 중 오류가 발생했습니다')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock)
    setStep('form')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStock) return

    if (!formData.purchase_price || !formData.shares) {
      setError('매수가와 수량은 필수입니다')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const portfolioData: PortfolioCreate = {
        stock_id: selectedStock.id,
        purchase_date: formData.purchase_date,
        purchase_price: parseFloat(formData.purchase_price),
        shares: parseInt(formData.shares),
        memo: formData.memo || undefined,
        sell_criteria: formData.sell_criteria || undefined,
      }
      
      await createPortfolio(portfolioData)
      onSuccess()
    } catch (err) {
      setError('포트폴리오 추가 중 오류가 발생했습니다')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'search' ? '종목 검색' : '포트폴리오 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {step === 'search' && (
            <div>
              <form onSubmit={handleSearch} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종목명 또는 티커
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="예: Apple, AAPL"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? '검색 중...' : '검색'}
                  </button>
                </div>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((stock) => (
                    <button
                      key={stock.id}
                      onClick={() => handleSelectStock(stock)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-gray-900">
                              {stock.stock_code}
                            </span>
                            <span className="text-gray-600">
                              {stock.stock_name}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                            {stock.exchange && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded">
                                {stock.exchange.toUpperCase()}
                              </span>
                            )}
                            {stock.sector && (
                              <span>{stock.sector}</span>
                            )}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'form' && selectedStock && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selected Stock */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-blue-900">
                      {selectedStock.stock_code}
                    </div>
                    <div className="text-sm text-blue-700">
                      {selectedStock.stock_name}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('search')
                      setSelectedStock(null)
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    변경
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  매수일 *
                </label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  매수가 ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  placeholder="150.00"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  보유 수량 (주) *
                </label>
                <input
                  type="number"
                  value={formData.shares}
                  onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                  placeholder="10"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  매수 메모
                </label>
                <textarea
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  placeholder="매수 이유, 투자 논리 등을 기록하세요"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  매도 기준
                </label>
                <textarea
                  value={formData.sell_criteria}
                  onChange={(e) => setFormData({ ...formData, sell_criteria: e.target.value })}
                  placeholder="예: FCF가 2분기 연속 감소하면 매도"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? '추가 중...' : '포트폴리오 추가'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


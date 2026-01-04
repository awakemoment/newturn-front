'use client'

interface TenKInsight {
  fiscal_year: number
  product_revenue: any
  geographic_revenue: any
  new_risks: string[]
}

interface Props {
  insights: TenKInsight[]
  stockName: string
  stockCode: string
}

export default function TenKInsightsReport({ insights, stockName, stockCode }: Props) {
  if (!insights || insights.length === 0) {
    return null
  }

  const latest = insights[0]

  return (
    <div className="bg-white rounded-xl border-2 border-blue-200 shadow-lg overflow-hidden">
      {/* Report Header - 사업보고서 느낌 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold mb-1 opacity-90">
              FORM 10-K • ANNUAL REPORT
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {stockName} ({stockCode})
            </h2>
            <div className="text-sm opacity-90">
              Fiscal Year {latest.fiscal_year}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-75 mb-1">
              U.S. Securities and Exchange Commission
            </div>
            <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold">
              AI 분석 추출
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="p-6 space-y-6">
        {/* Product Revenue Section */}
        {latest.product_revenue && Object.keys(latest.product_revenue).length > 0 && (
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">■</span>
              Item 8: Product Revenue Breakdown
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 font-semibold text-gray-700">Product Category</th>
                    <th className="text-right py-2 font-semibold text-gray-700">Revenue</th>
                    <th className="text-right py-2 font-semibold text-gray-700">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(latest.product_revenue).map(([product, revenue]: [string, any]) => {
                    const total = Object.values(latest.product_revenue).reduce((sum: number, val: any) => sum + (val || 0), 0)
                    const percentage = total ? ((revenue / total) * 100).toFixed(1) : '0.0'
                    
                    return (
                      <tr key={product} className="border-b border-gray-200">
                        <td className="py-2 text-gray-800">{product}</td>
                        <td className="text-right py-2 font-mono text-gray-900">
                          ${(revenue / 1000000000).toFixed(1)}B
                        </td>
                        <td className="text-right py-2 text-gray-600">
                          {percentage}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-xs text-gray-500 italic">
              Source: Form 10-K, Part II, Item 8 - Financial Statements
            </div>
          </div>
        )}

        {/* Geographic Revenue Section */}
        {latest.geographic_revenue && Object.keys(latest.geographic_revenue).length > 0 && (
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-green-600">■</span>
              Item 8: Geographic Revenue Breakdown
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 font-semibold text-gray-700">Geographic Segment</th>
                    <th className="text-right py-2 font-semibold text-gray-700">Revenue</th>
                    <th className="text-right py-2 font-semibold text-gray-700">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(latest.geographic_revenue).map(([region, revenue]: [string, any]) => {
                    const total = Object.values(latest.geographic_revenue).reduce((sum: number, val: any) => sum + (val || 0), 0)
                    const percentage = total ? ((revenue / total) * 100).toFixed(1) : '0.0'
                    
                    return (
                      <tr key={region} className="border-b border-gray-200">
                        <td className="py-2 text-gray-800">{region}</td>
                        <td className="text-right py-2 font-mono text-gray-900">
                          ${(revenue / 1000000000).toFixed(1)}B
                        </td>
                        <td className="text-right py-2 text-gray-600">
                          {percentage}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-xs text-gray-500 italic">
              Source: Form 10-K, Part II, Item 8 - Financial Statements
            </div>
          </div>
        )}

        {/* Risk Factors Section */}
        {latest.new_risks && latest.new_risks.length > 0 && (
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-red-600">■</span>
              Item 1A: Risk Factors (New or Updated)
            </h3>
            <div className="bg-red-50 rounded-lg p-4">
              <ul className="space-y-3">
                {latest.new_risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-800 leading-relaxed">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2 text-xs text-gray-500 italic">
              Source: Form 10-K, Part I, Item 1A - Risk Factors
            </div>
          </div>
        )}
      </div>

      {/* Report Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div>
            <span className="font-semibold">Extracted by:</span> Newturn AI Engine
          </div>
          <div>
            <span className="font-semibold">Document:</span> SEC EDGAR 10-K Filing
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          이 정보는 SEC에 제출된 공식 사업보고서(10-K)에서 AI가 추출한 핵심 내용입니다.
          참고용이며 투자 권유가 아닙니다.
        </div>
      </div>
    </div>
  )
}


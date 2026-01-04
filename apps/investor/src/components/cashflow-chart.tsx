'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartData {
  period: string
  date: string
  ocf: number | null
  fcf: number | null
  capex: number | null
  revenue: number | null
  net_income: number | null
}

interface Props {
  data: ChartData[]
  stockName: string
}

export function CashflowChart({ data, stockName }: Props) {
  const formatCurrency = (value: number) => {
    const billion = value / 1_000_000_000
    return billion >= 1 ? `$${billion.toFixed(2)}B` : `$${(value / 1_000_000).toFixed(2)}M`
  }

  const chartData = data.map(item => ({
    period: item.period,
    OCF: item.ocf ? item.ocf / 1_000_000_000 : null,
    FCF: item.fcf ? item.fcf / 1_000_000_000 : null,
    매출: item.revenue ? item.revenue / 1_000_000_000 : null,
    순이익: item.net_income ? item.net_income / 1_000_000_000 : null,
  }))

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        현금흐름 트렌드 - {stockName}
      </h2>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="period" 
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            label={{ value: '억 달러 (B)', angle: -90, position: 'insideLeft' }}
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            formatter={(value: any) => value !== null ? `$${value.toFixed(2)}B` : 'N/A'}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="OCF" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ r: 3 }}
            name="영업 현금흐름"
          />
          <Line 
            type="monotone" 
            dataKey="FCF" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 3 }}
            name="잉여 현금흐름"
          />
          <Line 
            type="monotone" 
            dataKey="매출" 
            stroke="#6b7280" 
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={{ r: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="순이익" 
            stroke="#f59e0b" 
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">OCF (영업 현금흐름)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600">FCF (잉여 현금흐름)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
          <span className="text-sm text-gray-600">매출</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-sm text-gray-600">순이익</span>
        </div>
      </div>
    </div>
  )
}


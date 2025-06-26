'use client'

import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { ValuationMethod } from '@/types'

interface ValuationComparisonChartProps {
  data: ValuationMethod[]
  currentPrice: number
}

export function ValuationComparisonChart({ data, currentPrice }: ValuationComparisonChartProps) {
  const chartData = data.map(method => ({
    name: method.display_name,
    method: method.method,
    target_price: method.target_price,
    current_price: currentPrice,
    upside_potential: method.upside_potential,
    confidence: method.confidence_level * 100
  }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              目標價格: <span className="font-medium text-gray-900">{formatCurrency(data.target_price)}</span>
            </p>
            <p className="text-sm text-gray-600">
              當前價格: <span className="font-medium text-gray-900">{formatCurrency(data.current_price)}</span>
            </p>
            <p className="text-sm text-gray-600">
              上漲空間: <span className={`font-medium ${data.upside_potential >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(data.upside_potential)}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              信心水平: <span className="font-medium text-blue-600">{data.confidence.toFixed(0)}%</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">估值方法比較</h3>
        <p className="text-sm text-gray-600">
          不同估值方法的目標價格與當前股價對比分析
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="target_price" 
              fill="#3B82F6" 
              name="目標價格"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="current_price" 
              fill="#6B7280" 
              name="當前價格"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {chartData.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-gray-50 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">{item.name}</span>
              <span className={`text-sm font-semibold ${
                item.upside_potential >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercent(item.upside_potential)}
              </span>
            </div>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${item.confidence}%` }}
                />
              </div>
              <span className="ml-2 text-xs text-gray-600">{item.confidence.toFixed(0)}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
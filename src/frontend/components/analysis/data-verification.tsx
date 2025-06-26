'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  EyeIcon,
  EyeSlashIcon,
  CalculatorIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { AnalysisResponse, QuickAnalysisResponse } from '@/types'

interface DataVerificationProps {
  data: AnalysisResponse | QuickAnalysisResponse
  rawApiResponse?: any
}

export function DataVerification({ data, rawApiResponse }: DataVerificationProps) {
  const [showRawData, setShowRawData] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const isFullAnalysis = 'valuation_methods' in data

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'comparable_companies_analysis':
      case 'CCA相對估值法':
        return ChartBarIcon
      case 'discounted_cash_flow':
      case 'DCF現金流折現法':
        return ArrowTrendingUpIcon
      case 'precedent_transactions_analysis':
      case 'PTA交易比率法':
        return CurrencyDollarIcon
      case 'asset_based_valuation':
      case '資產基礎法':
        return SparklesIcon
      default:
        return CalculatorIcon
    }
  }

  const getMethodDisplayName = (method: string) => {
    const mapping: Record<string, string> = {
      'comparable_companies_analysis': 'CCA相對估值法',
      'discounted_cash_flow': 'DCF現金流折現法',
      'precedent_transactions_analysis': 'PTA交易比率法',
      'asset_based_valuation': '資產基礎法'
    }
    return mapping[method] || method
  }

  const keyDataPoints = [
    { label: '股票代號', value: data.symbol, highlight: true },
    { label: '公司名稱', value: data.company_name, highlight: true },
    { label: '當前價格', value: formatCurrency(data.current_price), highlight: true },
    { label: '目標價格', value: formatCurrency(data.target_price), highlight: true },
    { label: '潛在報酬', value: formatPercent(data.potential_return), highlight: data.potential_return > 0 },
    { label: '推薦等級', value: data.recommendation.display_name, highlight: true },
    { label: '風險等級', value: data.recommendation.risk_level || 'N/A', highlight: false }
  ]

  return (
    <div className="space-y-6">
      {/* 切換按鈕 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CalculatorIcon className="h-5 w-5 mr-2" />
          數據驗證與計算過程
        </h3>
        <button
          onClick={() => setShowRawData(!showRawData)}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {showRawData ? (
            <>
              <EyeSlashIcon className="h-4 w-4 mr-2" />
              隱藏原始數據
            </>
          ) : (
            <>
              <EyeIcon className="h-4 w-4 mr-2" />
              顯示原始數據
            </>
          )}
        </button>
      </div>

      {/* 關鍵數據高亮顯示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200"
      >
        <h4 className="text-md font-semibold text-gray-900 mb-4">📊 關鍵數據摘要</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {keyDataPoints.map((point, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                point.highlight 
                  ? 'bg-white border-blue-300 ring-2 ring-blue-100' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                {point.label}
              </div>
              <div className={`text-sm font-semibold mt-1 ${
                point.highlight ? 'text-blue-900' : 'text-gray-700'
              }`}>
                {point.value}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 估值方法計算過程 */}
      {isFullAnalysis && (data as AnalysisResponse).valuation_methods && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 flex items-center">
              <CalculatorIcon className="h-5 w-5 mr-2" />
              估值方法計算過程
            </h4>
          </div>
          
          <div className="divide-y divide-gray-200">
            {(data as AnalysisResponse).valuation_methods.map((method, index) => {
              const IconComponent = getMethodIcon(method.method)
              const isExpanded = expandedSections[method.method]
              
              return (
                <div key={index} className="bg-white">
                  <button
                    onClick={() => toggleSection(method.method)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <IconComponent className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getMethodDisplayName(method.method)}
                          </div>
                          <div className="text-xs text-gray-500">
                            目標價格: {formatCurrency(method.target_price)} | 
                            上漲潛力: {formatPercent(method.upside_potential)} | 
                            信心水準: {(method.confidence_level * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 bg-gray-50">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h5 className="text-sm font-semibold text-gray-900 mb-3">計算詳情</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">估值方法:</span>
                                <span className="font-medium">{method.display_name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">計算目標價格:</span>
                                <span className="font-medium text-blue-600">
                                  {formatCurrency(method.target_price)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">當前價格:</span>
                                <span className="font-medium">{formatCurrency(data.current_price)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">價格差距:</span>
                                <span className={`font-medium ${
                                  method.target_price > data.current_price ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {formatCurrency(method.target_price - data.current_price)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">上漲潛力:</span>
                                <span className={`font-medium ${
                                  method.upside_potential > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {formatPercent(method.upside_potential)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">信心水準:</span>
                                <span className="font-medium">
                                  {(method.confidence_level * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            
                            {/* 計算過程說明 */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h6 className="text-xs font-semibold text-gray-700 mb-2">計算方法說明:</h6>
                              <div className="text-xs text-gray-600 space-y-1">
                                {method.method === 'comparable_companies_analysis' && (
                                  <>
                                    <div>• 比較同業公司的估值倍數 (P/E, EV/EBITDA)</div>
                                    <div>• 基於行業平均倍數計算目標價格</div>
                                    <div>• 考慮公司規模和成長性調整</div>
                                  </>
                                )}
                                {method.method === 'discounted_cash_flow' && (
                                  <>
                                    <div>• 預測未來自由現金流</div>
                                    <div>• 計算加權平均資本成本 (WACC)</div>
                                    <div>• 折現未來現金流至現值</div>
                                  </>
                                )}
                                {method.method === 'precedent_transactions_analysis' && (
                                  <>
                                    <div>• 分析類似交易的估值倍數</div>
                                    <div>• 考慮交易溢價和市場條件</div>
                                    <div>• 基於歷史交易數據推算價值</div>
                                  </>
                                )}
                                {method.method === 'asset_based_valuation' && (
                                  <>
                                    <div>• 計算淨資產價值</div>
                                    <div>• 評估有形和無形資產</div>
                                    <div>• 考慮負債和或有負債</div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* 原始API響應數據 */}
      <AnimatePresence>
        {showRawData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900 rounded-lg overflow-hidden"
          >
            <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
              <h4 className="text-sm font-semibold text-white">API 原始響應數據</h4>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono">
                {JSON.stringify(rawApiResponse || data, null, 2)}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
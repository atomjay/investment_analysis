'use client'

import { motion } from 'framer-motion'
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { AnalysisResultProps, RecommendationType, ValuationMethod } from '@/types'

export function AnalysisResult({ data, type }: AnalysisResultProps) {
  const isPositive = data.potential_return >= 0
  
  const getRecommendationColor = (rec: RecommendationType) => {
    switch (rec) {
      case 'strong_buy': return 'bg-green-100 text-green-800 border-green-200'
      case 'buy': return 'bg-green-50 text-green-700 border-green-100'
      case 'hold': return 'bg-yellow-50 text-yellow-700 border-yellow-100'
      case 'sell': return 'bg-red-50 text-red-700 border-red-100'
      case 'strong_sell': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-100'
    }
  }

  const getMethodIcon = (method: ValuationMethod) => {
    switch (method) {
      case 'comparable_companies_analysis': return ChartBarIcon
      case 'discounted_cash_flow': return ArrowTrendingUpIcon
      case 'precedent_transactions_analysis': return CurrencyDollarIcon
      case 'asset_based_valuation': return SparklesIcon
      default: return InformationCircleIcon
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{data.company_name}</h2>
            <p className="text-gray-500">{data.symbol}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">當前股價</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.current_price)}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Target Price */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">目標價格</div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(data.target_price)}
            </div>
          </div>

          {/* Potential Return */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">潛在回報</div>
            <div className={`text-3xl font-bold flex items-center justify-center ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? (
                <ArrowTrendingUpIcon className="w-8 h-8 mr-2" />
              ) : (
                <ArrowTrendingDownIcon className="w-8 h-8 mr-2" />
              )}
              {formatPercent(data.potential_return)}
            </div>
          </div>

          {/* Recommendation */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">投資建議</div>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${
              getRecommendationColor(data.recommendation.type)
            }`}>
              {data.recommendation.display_name}
              {'overall_score' in data.recommendation && (
                <span className="ml-2 text-xs">
                  ({(data.recommendation.overall_score * 100).toFixed(0)})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis for Full Type */}
      {'valuation_methods' in data && data.valuation_methods && (
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">估值方法分析</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.valuation_methods.map((method, index) => {
              const IconComponent = getMethodIcon(method.method)
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex items-center mb-3">
                    <IconComponent className="w-5 h-5 text-primary-600 mr-2" />
                    <h4 className="font-medium text-gray-900">{method.display_name}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">目標價</div>
                      <div className="font-semibold">{formatCurrency(method.target_price)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">上漲空間</div>
                      <div className={`font-semibold ${
                        method.upside_potential >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercent(method.upside_potential)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-gray-500 text-xs">信心水平</div>
                    <div className="flex items-center mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${method.confidence_level * 100}%` }}
                        />
                      </div>
                      <span className="ml-2 text-xs text-gray-600">
                        {(method.confidence_level * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Investment Reasons for Full Analysis */}
      {'buy_reasons' in data && data.buy_reasons && data.sell_reasons && (
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buy Reasons */}
            <div>
              <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
                <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
                買入理由
              </h3>
              <div className="space-y-3">
                {data.buy_reasons.slice(0, 3).map((reason, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-3"
                  >
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-green-900 text-sm">
                          {reason.category}
                        </div>
                        <div className="text-green-700 text-sm mt-1">
                          {reason.description}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          權重: {(reason.weight * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sell Reasons */}
            <div>
              <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                風險因素
              </h3>
              <div className="space-y-3">
                {data.sell_reasons.slice(0, 3).map((reason, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-red-900 text-sm">
                          {reason.category}
                        </div>
                        <div className="text-red-700 text-sm mt-1">
                          {reason.description}
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                          權重: {(reason.weight * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Executive Summary for Full Analysis */}
      {'executive_summary' in data && data.executive_summary && (
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">執行摘要</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 leading-relaxed">{data.executive_summary}</p>
          </div>
        </div>
      )}

      {/* Quick Analysis Methods */}
      {'analysis_methods' in data && data.analysis_methods && (
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">分析方法</h3>
          <div className="flex flex-wrap gap-2">
            {data.analysis_methods.map((method, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Investment Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500">風險水平</div>
            <div className="font-semibold text-gray-900">
              {data.recommendation.risk_level}
            </div>
          </div>
          <div>
            <div className="text-gray-500">投資期限</div>
            <div className="font-semibold text-gray-900">
              {data.recommendation.time_horizon}
            </div>
          </div>
          <div>
            <div className="text-gray-500">分析類型</div>
            <div className="font-semibold text-gray-900">
              {type === 'full' ? '完整分析' : '快速分析'}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
        <div className="flex items-start">
          <InformationCircleIcon className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600">
            <strong>免責聲明：</strong>
            本分析僅供參考，不構成投資建議。投資有風險，請根據自身風險承受能力做出投資決策。
            過往表現不代表未來業績，任何投資都可能面臨本金損失的風險。
          </div>
        </div>
      </div>
    </motion.div>
  )
}
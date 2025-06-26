'use client'

import { motion } from 'framer-motion'
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  SparklesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { MarketOverview as MarketOverviewType } from '@/types'

interface MarketOverviewProps {
  data: MarketOverviewType
}

export function MarketOverview({ data }: MarketOverviewProps) {
  const isMarketOpen = data.market_status.status === '開盤中'
  const systemHealthy = data.system_status === '正常運行'

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const analysisMethodIcons = {
    '相對估值法 (CCA)': ChartBarIcon,
    '現金流折現法 (DCF)': TrendingUpIcon,
    '交易比率法 (PTA)': CurrencyDollarIcon,
    '資產基礎法': SparklesIcon
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Market Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">市場狀態</h3>
          <ClockIcon className="w-5 h-5 text-gray-400" />
        </div>

        <div className="space-y-4">
          {/* Market Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-500">美股市場</div>
              <div className="font-semibold text-gray-900">{data.market_status.US}</div>
            </div>
            <div className="flex items-center">
              {isMarketOpen ? (
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
              ) : (
                <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
              )}
              <span className={`text-sm font-medium ${
                isMarketOpen ? 'text-green-700' : 'text-red-700'
              }`}>
                {data.market_status.status}
              </span>
            </div>
          </div>

          {/* System Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-500">系統狀態</div>
              <div className="font-semibold text-gray-900">分析引擎</div>
            </div>
            <div className="flex items-center">
              {systemHealthy ? (
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
              ) : (
                <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
              )}
              <span className={`text-sm font-medium ${
                systemHealthy ? 'text-green-700' : 'text-red-700'
              }`}>
                {data.system_status}
              </span>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              最後更新: {formatTime(data.last_updated)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analysis Methods Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">分析方法</h3>
          <InformationCircleIcon className="w-5 h-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {data.analysis_methods.map((method, index) => {
            const IconComponent = analysisMethodIcons[method as keyof typeof analysisMethodIcons] || ChartBarIcon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center p-3 bg-primary-50 rounded-lg border border-primary-100"
              >
                <IconComponent className="w-5 h-5 text-primary-600 mr-3" />
                <span className="text-sm font-medium text-primary-900">{method}</span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Supported Symbols Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:col-span-2"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            支援股票 ({data.supported_symbols_count} 隻)
          </h3>
          <ChartBarIcon className="w-5 h-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {data.supported_symbols.map((symbol, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 text-center transition-colors cursor-pointer"
            >
              <div className="font-mono font-semibold text-gray-900">{symbol}</div>
            </motion.div>
          ))}
        </div>

        {data.supported_symbols_count > data.supported_symbols.length && (
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-500">
              顯示前 {data.supported_symbols.length} 隻，共支援 {data.supported_symbols_count} 隻股票
            </div>
          </div>
        )}
      </motion.div>

      {/* Performance Metrics Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:col-span-2"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">平台性能</h3>
          <TrendingUpIcon className="w-5 h-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{data.analysis_methods.length}</div>
            <div className="text-sm text-blue-700">估值方法</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{data.supported_symbols_count}</div>
            <div className="text-sm text-green-700">支援股票</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-purple-700">服務時間</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {systemHealthy ? '99.9%' : '維護中'}
            </div>
            <div className="text-sm text-orange-700">系統可用性</div>
          </div>
        </div>
      </motion.div>

      {/* Data Sources Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-200 p-6 lg:col-span-2"
      >
        <div className="flex items-center mb-4">
          <InformationCircleIcon className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-primary-900">數據來源</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-primary-600 font-bold">AV</span>
            </div>
            <div className="text-sm font-medium text-primary-900">Alpha Vantage</div>
            <div className="text-xs text-primary-700">專業金融數據</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-primary-600 font-bold">FMP</span>
            </div>
            <div className="text-sm font-medium text-primary-900">Financial Modeling Prep</div>
            <div className="text-xs text-primary-700">財務模型數據</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-primary-600 font-bold">YF</span>
            </div>
            <div className="text-sm font-medium text-primary-900">Yahoo Finance</div>
            <div className="text-xs text-primary-700">即時市場數據</div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-xs text-primary-700">
            智能切換數據源，確保分析準確性和可靠性
          </div>
        </div>
      </motion.div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { validateSymbol } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { StockSearchProps } from '@/types'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

export function StockSearch({ onAnalyze, loading }: StockSearchProps) {
  const [symbol, setSymbol] = useState('')
  const [selectedDataSource, setSelectedDataSource] = useState('yahoo_finance')
  const [dataSources, setDataSources] = useState<Record<string, any>>({})
  const [loadingDataSources, setLoadingDataSources] = useState(true)

  // 載入數據源
  useEffect(() => {
    const fetchDataSources = async () => {
      try {
        const sources = await api.getDataSources()
        setDataSources(sources)
        
        // 選擇第一個可用的數據源
        const availableSource = Object.keys(sources).find(key => sources[key].available)
        if (availableSource) {
          setSelectedDataSource(availableSource)
        }
      } catch (error) {
        console.error('Failed to fetch data sources:', error)
        toast.error('無法載入數據源')
      } finally {
        setLoadingDataSources(false)
      }
    }
    
    fetchDataSources()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const cleanSymbol = symbol.trim().toUpperCase()
    
    if (!cleanSymbol) {
      toast.error('請輸入股票代號')
      return
    }
    
    if (!validateSymbol(cleanSymbol)) {
      toast.error('股票代號格式不正確')
      return
    }
    
    if (!dataSources[selectedDataSource]?.available) {
      toast.error('選擇的數據源目前不可用')
      return
    }
    
    onAnalyze(cleanSymbol, 'full', selectedDataSource)
  }

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setSymbol(value)
  }

  return (
    <div id="stock-search" className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Symbol Input */}
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-2">
              股票代號
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="symbol"
                value={symbol}
                onChange={handleSymbolChange}
                placeholder="例如: AAPL, MSFT, GOOGL..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                disabled={loading}
                maxLength={10}
                autoComplete="off"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              請輸入美股代號，例如 AAPL (蘋果)、MSFT (微軟)
            </p>
          </div>

          {/* Data Source Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              選擇數據源
            </label>
            {loadingDataSources ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-gray-500">載入數據源...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(dataSources).map(([key, source]) => (
                  <motion.button
                    key={key}
                    type="button"
                    whileHover={{ scale: source.available ? 1.02 : 1 }}
                    whileTap={{ scale: source.available ? 0.98 : 1 }}
                    onClick={() => source.available && setSelectedDataSource(key)}
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      selectedDataSource === key
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : source.available
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                    disabled={loading || !source.available}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedDataSource === key
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedDataSource === key && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {source.name}
                          </h3>
                          {source.free && (
                            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                              免費
                            </span>
                          )}
                          {!source.available && (
                            <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                              不可用
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {source.description}
                        </p>
                        {source.rate_limit && (
                          <p className="text-xs text-red-500 mt-1">
                            限制: {source.rate_limit}
                          </p>
                        )}
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 font-medium mb-1">可用分析:</p>
                          <ul className="text-xs text-gray-500 space-y-0.5">
                            {source.features.map((feature, index) => (
                              <li key={index}>• {feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            disabled={loading || !symbol.trim()}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
              loading || !symbol.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-3">
                  分析中...
                </span>
              </div>
            ) : (
              <span>
                開始分析
              </span>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
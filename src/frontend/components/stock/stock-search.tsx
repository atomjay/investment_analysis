'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { validateSymbol } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { StockSearchProps } from '@/types'
import toast from 'react-hot-toast'

export function StockSearch({ onAnalyze, loading }: StockSearchProps) {
  const [symbol, setSymbol] = useState('')
  const [analysisType, setAnalysisType] = useState<'quick' | 'full'>('quick')

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
    
    onAnalyze(cleanSymbol, analysisType)
  }

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setSymbol(value)
  }

  const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'META']

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

          {/* Analysis Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              分析類型
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAnalysisType('quick')}
                className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                  analysisType === 'quick'
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={loading}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      analysisType === 'quick'
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {analysisType === 'quick' && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      快速分析
                    </h3>
                    <p className="text-sm text-gray-500">
                      基礎估值分析，約30秒完成
                    </p>
                    <ul className="mt-2 text-xs text-gray-400 space-y-1">
                      <li>• 相對估值法 (CCA)</li>
                      <li>• 基本投資建議</li>
                    </ul>
                  </div>
                </div>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAnalysisType('full')}
                className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                  analysisType === 'full'
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={loading}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      analysisType === 'full'
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {analysisType === 'full' && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      完整分析
                      <SparklesIcon className="w-4 h-4 ml-2 text-yellow-500" />
                    </h3>
                    <p className="text-sm text-gray-500">
                      全方位專業分析，約2-3分鐘完成
                    </p>
                    <ul className="mt-2 text-xs text-gray-400 space-y-1">
                      <li>• 四種估值方法 (CCA + DCF + PTA + 資產基礎法)</li>
                      <li>• 詳細投資建議與風險分析</li>
                      <li>• 執行摘要與催化因子</li>
                    </ul>
                  </div>
                </div>
              </motion.button>
            </div>
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
                  分析中... ({analysisType === 'quick' ? '約30秒' : '約2-3分鐘'})
                </span>
              </div>
            ) : (
              <span>
                開始{analysisType === 'quick' ? '快速' : '完整'}分析
              </span>
            )}
          </motion.button>
        </form>

        {/* Popular Symbols */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">熱門股票:</p>
          <div className="flex flex-wrap gap-2">
            {popularSymbols.map((popularSymbol) => (
              <motion.button
                key={popularSymbol}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSymbol(popularSymbol)}
                disabled={loading}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {popularSymbol}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
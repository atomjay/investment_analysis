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

// 估值方法數據卡片組件
function ValuationMethodsDataCard({ methods, expandedSections, toggleSection }: {
  methods: any[]
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
}) {
  const getMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      'comparable_companies_analysis': '📊',
      'discounted_cash_flow': '💰',
      'precedent_transactions_analysis': '🏢',
      'asset_based_valuation': '🏗️'
    }
    return icons[method] || '📈'
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

  return (
    <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-xl border border-purple-700 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <h5 className="text-white font-bold text-lg flex items-center">
          🧮 估值方法原始數據
          <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
            {methods.length} 個方法
          </span>
        </h5>
        <p className="text-purple-100 text-sm mt-1">
          詳細計算過程與數據來源追蹤
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {methods.map((method, idx) => {
            const sectionKey = `valuation_${method.method}`
            const isExpanded = expandedSections[sectionKey]
            const icon = getMethodIcon(method.method)
            const displayName = getMethodDisplayName(method.method)
            
            return (
              <div key={idx} className="bg-purple-800 rounded-lg border border-purple-600 overflow-hidden">
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className="w-full px-4 py-3 text-left hover:bg-purple-700 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{icon}</span>
                    <div>
                      <div className="text-white font-medium text-sm">{displayName}</div>
                      <div className="text-purple-300 text-xs">
                        目標價: ${method.target_price.toFixed(2)} | 
                        信心度: {(method.confidence_level * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDownIcon className="h-4 w-4 text-purple-400" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 text-purple-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 bg-purple-750">
                        {/* 基本指標 */}
                        <div className="bg-purple-700 rounded p-3 mb-3">
                          <h6 className="text-purple-200 font-semibold text-xs mb-2">📊 基本指標</h6>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-purple-300">目標價格:</span>
                              <span className="text-green-400 font-mono">${method.target_price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-purple-300">上漲潛力:</span>
                              <span className={`font-mono ${method.upside_potential > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {method.upside_potential.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-purple-300">信心水準:</span>
                              <span className="text-blue-400 font-mono">{(method.confidence_level * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-purple-300">方法類型:</span>
                              <span className="text-yellow-400 font-mono">{method.method}</span>
                            </div>
                          </div>
                        </div>

                        {/* 數據來源 */}
                        {(method as any).raw_data_sources && (
                          <div className="bg-purple-700 rounded p-3 mb-3">
                            <h6 className="text-purple-200 font-semibold text-xs mb-2">🔍 數據來源</h6>
                            <div className="space-y-1 text-xs">
                              {(method as any).raw_data_sources.data_sources?.map((source: string, i: number) => (
                                <div key={i} className="flex items-center">
                                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                  <span className="text-purple-200">{source}</span>
                                </div>
                              ))}
                              {(method as any).raw_data_sources.calculation_engine && (
                                <div className="flex items-center">
                                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                  <span className="text-purple-200">引擎: {(method as any).raw_data_sources.calculation_engine}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 計算詳情 */}
                        {(method as any).calculation_details && (
                          <div className="bg-purple-700 rounded p-3">
                            <h6 className="text-purple-200 font-semibold text-xs mb-2">🧮 計算詳情</h6>
                            <div className="space-y-2">
                              {Object.entries((method as any).calculation_details).map(([key, value]) => {
                                if (typeof value === 'object' && value !== null) {
                                  return (
                                    <details key={key} className="group">
                                      <summary className="cursor-pointer text-purple-300 hover:text-purple-200 text-xs font-medium">
                                        📁 {key.replace(/_/g, ' ').toUpperCase()}
                                      </summary>
                                      <div className="mt-1 ml-4 p-2 bg-purple-600 rounded text-xs">
                                        <pre className="text-purple-100 whitespace-pre-wrap font-mono">
                                          {JSON.stringify(value, null, 2)}
                                        </pre>
                                      </div>
                                    </details>
                                  )
                                } else {
                                  return (
                                    <div key={key} className="flex justify-between text-xs">
                                      <span className="text-purple-300">{key.replace(/_/g, ' ')}:</span>
                                      <span className="text-white font-mono">{String(value)}</span>
                                    </div>
                                  )
                                }
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Alpha Vantage + FMP 數據卡片組件
function AlphaVantageDataCard({ rawData, expandedSections, toggleSection, copyJsonToClipboard, copySuccess }: {
  rawData: any
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
  copyJsonToClipboard: (data: any, buttonId: string) => Promise<void>
  copySuccess: Record<string, boolean>
}) {
  const alphaVantageData = rawData.alpha_vantage_response || {}
  const fmpData = rawData.fmp_response || {}
  
  // 組織 Alpha Vantage 數據為不同類別
  const alphaDataCategories = {
    basic: {
      title: '📊 公司基本信息',
      icon: '📊',
      data: Object.entries(alphaVantageData)
        .filter(([key]) => ['Symbol', 'Name', 'AssetType', 'Exchange', 'Currency', 'Country', 'Sector', 'Industry'].includes(key))
    },
    financial: {
      title: '💰 財務指標',
      icon: '💰',
      data: Object.entries(alphaVantageData)
        .filter(([key]) => ['MarketCapitalization', 'EBITDA', 'RevenueTTM', 'GrossProfitTTM', 'EPS', 'BookValue'].includes(key))
    },
    valuation: {
      title: '📈 估值倍數',
      icon: '📈',
      data: Object.entries(alphaVantageData)
        .filter(([key]) => ['PERatio', 'PEGRatio', 'TrailingPE', 'ForwardPE', 'PriceToSalesRatioTTM', 'PriceToBookRatio', 'EVToRevenue', 'EVToEBITDA'].includes(key))
    },
    performance: {
      title: '🚀 營運績效',
      icon: '🚀',
      data: Object.entries(alphaVantageData)
        .filter(([key]) => ['ProfitMargin', 'OperatingMarginTTM', 'ReturnOnAssetsTTM', 'ReturnOnEquityTTM', 'QuarterlyEarningsGrowthYOY', 'QuarterlyRevenueGrowthYOY'].includes(key))
    },
    dividends: {
      title: '💎 股息信息',
      icon: '💎',
      data: Object.entries(alphaVantageData)
        .filter(([key]) => ['DividendPerShare', 'DividendYield', 'DividendDate', 'ExDividendDate'].includes(key))
    },
    technical: {
      title: '📊 技術指標',
      icon: '📊',
      data: Object.entries(alphaVantageData)
        .filter(([key]) => ['Beta', '52WeekHigh', '52WeekLow', '50DayMovingAverage', '200DayMovingAverage', 'SharesOutstanding', 'CurrentPrice'].includes(key))
    }
  }

  // 組織 FMP 數據為不同類別
  const fmpDataCategories = {
    profile: {
      title: '🏢 公司檔案',
      icon: '🏢',
      data: Object.entries(fmpData)
        .filter(([key]) => ['companyName', 'ceo', 'sector', 'industry', 'website', 'fullTimeEmployees', 'country'].includes(key))
    },
    pricing: {
      title: '💲 價格數據',
      icon: '💲',
      data: Object.entries(fmpData)
        .filter(([key]) => ['price', 'changes', 'range', 'volAvg', 'mktCap', 'lastDiv'].includes(key))
    },
    ratios: {
      title: '📈 財務比率',
      icon: '📈',
      data: Object.entries(fmpData)
        .filter(([key]) => ['peRatioTTM', 'pbRatioTTM', 'evToSalesTTM', 'enterpriseValueOverEBITDATTM', 'roeTTM', 'roicTTM', 'debtToEquityTTM'].includes(key))
    },
    financials: {
      title: '💰 財務數據',
      icon: '💰',
      data: Object.entries(fmpData)
        .filter(([key]) => ['revenue', 'netIncome', 'grossProfit', 'operatingIncome', 'ebitda', 'totalAssets', 'totalDebt', 'freeCashFlow'].includes(key))
    }
  }

  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'number') {
      // 市值、收入等大數字
      if (key.includes('Market') || key.includes('Revenue') || key.includes('Income') || key.includes('Assets') || key.includes('Debt') || key.includes('Cash') || key.includes('EBITDA') || key.includes('Profit')) {
        if (value > 1e9) return `$${(value / 1e9).toFixed(1)}B`
        if (value > 1e6) return `$${(value / 1e6).toFixed(1)}M`
        if (value > 1e3) return `$${(value / 1e3).toFixed(1)}K`
        return `$${value.toFixed(2)}`
      }
      // 比率和倍數
      if (key.includes('Ratio') || key.includes('PE') || key.includes('Beta') || key.includes('EV')) {
        return value.toFixed(2)
      }
      // 百分比數據
      if (key.includes('Margin') || key.includes('Return') || key.includes('Growth') || key.includes('Yield')) {
        if (value < 1) {
          return `${(value * 100).toFixed(2)}%`
        }
        return `${value.toFixed(2)}%`
      }
      // 股價和每股數據
      if (key.includes('Price') || key.includes('EPS') || key.includes('BookValue') || key.includes('Dividend')) {
        return `$${value.toFixed(2)}`
      }
      return value.toLocaleString()
    }
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...'
    }
    return String(value)
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 rounded-xl border border-purple-700 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-white font-bold text-lg flex items-center">
              🌐 Alpha Vantage + FMP 專業數據
              <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                Alpha: {Object.keys(alphaVantageData).length} | FMP: {Object.keys(fmpData).length}
              </span>
            </h5>
            <p className="text-purple-100 text-sm mt-1">
              專業級金融數據源 | 更新時間: {new Date(rawData.fetch_timestamp || new Date()).toLocaleString('zh-TW')}
            </p>
          </div>
          <button
            onClick={() => copyJsonToClipboard(rawData, 'alpha-header')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${
              copySuccess['alpha-header'] 
                ? 'bg-green-500 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
            }`}
          >
            {copySuccess['alpha-header'] ? (
              <>
                <span className="text-sm">✓</span>
                <span>已複製</span>
              </>
            ) : (
              <>
                <span className="text-sm">📋</span>
                <span>複製完整數據</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Alpha Vantage 數據分類卡片 */}
        <div className="space-y-4">
          <h6 className="text-purple-200 font-bold text-lg flex items-center">
            🔮 Alpha Vantage 數據
            <span className="ml-2 text-xs bg-purple-500/30 px-2 py-1 rounded-full">
              專業財務分析
            </span>
          </h6>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(alphaDataCategories).map(([categoryKey, category]) => {
              const sectionKey = `alpha_${categoryKey}`
              const isExpanded = expandedSections[sectionKey]
              const hasData = category.data.length > 0
              
              if (!hasData) return null
              
              return (
                <div key={categoryKey} className="bg-purple-800 rounded-lg border border-purple-600 overflow-hidden">
                  <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full px-4 py-3 text-left hover:bg-purple-700 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{category.icon}</span>
                      <div>
                        <div className="text-white font-medium text-sm">{category.title}</div>
                        <div className="text-purple-300 text-xs">{category.data.length} 個欄位</div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDownIcon className="h-4 w-4 text-purple-400" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-purple-400" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 bg-purple-750">
                          <div className="space-y-2">
                            {category.data.map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center py-1 border-b border-purple-600 last:border-b-0">
                                <span className="text-purple-300 text-xs font-medium">{key}:</span>
                                <span className="text-white text-xs font-mono ml-2 text-right">
                                  {formatValue(key, value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>

        {/* FMP 數據分類卡片 */}
        {Object.keys(fmpData).length > 0 && (
          <div className="space-y-4">
            <h6 className="text-purple-200 font-bold text-lg flex items-center">
              📊 Financial Modeling Prep 數據
              <span className="ml-2 text-xs bg-purple-500/30 px-2 py-1 rounded-full">
                詳細財務指標
              </span>
            </h6>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Object.entries(fmpDataCategories).map(([categoryKey, category]) => {
                const sectionKey = `fmp_${categoryKey}`
                const isExpanded = expandedSections[sectionKey]
                const hasData = category.data.length > 0
                
                if (!hasData) return null
                
                return (
                  <div key={categoryKey} className="bg-indigo-800 rounded-lg border border-indigo-600 overflow-hidden">
                    <button
                      onClick={() => toggleSection(sectionKey)}
                      className="w-full px-4 py-3 text-left hover:bg-indigo-700 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{category.icon}</span>
                        <div>
                          <div className="text-white font-medium text-sm">{category.title}</div>
                          <div className="text-indigo-300 text-xs">{category.data.length} 個欄位</div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDownIcon className="h-4 w-4 text-indigo-400" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4 text-indigo-400" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 bg-indigo-750">
                            <div className="space-y-2">
                              {category.data.map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center py-1 border-b border-indigo-600 last:border-b-0">
                                  <span className="text-indigo-300 text-xs font-medium">{key}:</span>
                                  <span className="text-white text-xs font-mono ml-2 text-right">
                                    {formatValue(key, value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 完整JSON數據展開器 */}
        <div className="bg-purple-800 rounded-lg border border-purple-600 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 hover:bg-purple-700 transition-colors">
            <button
              onClick={() => toggleSection('alpha_fmp_full_json')}
              className="flex items-center flex-1 text-left"
            >
              <span className="text-xl mr-2">🔍</span>
              <div>
                <div className="text-white font-medium text-sm">完整 Alpha Vantage + FMP JSON 數據</div>
                <div className="text-purple-300 text-xs">開發者模式 - 查看所有原始數據</div>
              </div>
            </button>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => copyJsonToClipboard(rawData, 'alpha-fmp-json')}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center space-x-1 ${
                  copySuccess['alpha-fmp-json'] 
                    ? 'bg-green-600 text-white' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {copySuccess['alpha-fmp-json'] ? (
                  <>
                    <span className="text-xs">✓</span>
                    <span>已複製</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs">📋</span>
                    <span>複製JSON</span>
                  </>
                )}
              </button>
              {expandedSections['alpha_fmp_full_json'] ? (
                <ChevronDownIcon className="h-4 w-4 text-purple-400" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-purple-400" />
              )}
            </div>
          </div>
          
          <AnimatePresence>
            {expandedSections['alpha_fmp_full_json'] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 bg-black">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-purple-400">Alpha Vantage + FMP 完整響應 ({Object.keys(rawData).length} 個主要字段)</span>
                    <button
                      onClick={() => copyJsonToClipboard(rawData, 'alpha-fmp-json-expand')}
                      className="text-xs text-purple-400 hover:text-purple-300 underline"
                    >
                      再次複製
                    </button>
                  </div>
                  <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono p-3 rounded border border-purple-700 bg-gray-900">
                    {JSON.stringify(rawData, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Yahoo Finance 數據卡片組件
function YahooFinanceDataCard({ rawData, expandedSections, toggleSection, copyJsonToClipboard, copySuccess }: {
  rawData: any
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
  copyJsonToClipboard: (data: any, buttonId: string) => Promise<void>
  copySuccess: Record<string, boolean>
}) {
  const infoData = rawData.yahoo_finance_info || {}
  const historyData = rawData.yahoo_finance_history || []
  
  // 組織數據為不同類別
  const dataCategories = {
    basic: {
      title: '📊 基本信息',
      icon: '📊',
      data: Object.entries(infoData)
        .filter(([key]) => ['longName', 'symbol', 'sector', 'industry', 'country', 'currency'].includes(key))
    },
    financial: {
      title: '💰 財務指標',
      icon: '💰',
      data: Object.entries(infoData)
        .filter(([key]) => ['currentPrice', 'marketCap', 'totalRevenue', 'netIncomeToCommon', 'totalAssets', 'totalDebt', 'freeCashflow'].includes(key))
    },
    valuation: {
      title: '📈 估值倍數',
      icon: '📈',
      data: Object.entries(infoData)
        .filter(([key]) => ['trailingPE', 'enterpriseToEbitda', 'priceToBook', 'priceToSalesTrailing12Months', 'pegRatio'].includes(key))
    },
    growth: {
      title: '🚀 成長性指標',
      icon: '🚀',
      data: Object.entries(infoData)
        .filter(([key]) => ['revenueGrowth', 'earningsGrowth', 'revenueQuarterlyGrowth', 'earningsQuarterlyGrowth'].includes(key))
    },
    dividends: {
      title: '💎 股息信息',
      icon: '💎',
      data: Object.entries(infoData)
        .filter(([key]) => ['dividendRate', 'dividendYield', 'payoutRatio', 'exDividendDate'].includes(key))
    },
    technical: {
      title: '📊 技術指標',
      icon: '📊',
      data: Object.entries(infoData)
        .filter(([key]) => ['beta', 'fiftyTwoWeekLow', 'fiftyTwoWeekHigh', 'averageVolume', 'volume'].includes(key))
    }
  }

  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'number') {
      if (key.includes('Price') || key.includes('Cap') || key.includes('Revenue') || key.includes('Income') || key.includes('Assets') || key.includes('Debt') || key.includes('Cash')) {
        if (value > 1e9) return `$${(value / 1e9).toFixed(1)}B`
        if (value > 1e6) return `$${(value / 1e6).toFixed(1)}M`
        if (value > 1e3) return `$${(value / 1e3).toFixed(1)}K`
        return `$${value.toFixed(2)}`
      }
      if (key.includes('Ratio') || key.includes('PE') || key.includes('Beta')) {
        return value.toFixed(2)
      }
      // 特殊處理股息相關字段
      if (key === 'dividendRate' || key === 'trailingAnnualDividendRate' || key === 'lastDividendValue') {
        return `$${value.toFixed(2)}`  // 股息金額，以美元顯示
      }
      if (key === 'dividendYield' || key === 'fiveYearAvgDividendYield') {
        return `${value.toFixed(2)}%`  // 已經是百分比形式，直接顯示
      }
      if (key === 'trailingAnnualDividendYield') {
        return `${(value * 100).toFixed(3)}%`  // 小數形式，需要轉換為百分比
      }
      // 其他成長率和比率（需要轉換為百分比）
      if (key.includes('Growth') || key.includes('Margin')) {
        return `${(value * 100).toFixed(1)}%`
      }
      return value.toLocaleString()
    }
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...'
    }
    return String(value)
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-white font-bold text-lg flex items-center">
              🔗 Yahoo Finance API 完整數據
              <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                {Object.keys(infoData).length} 個欄位
              </span>
            </h5>
            <p className="text-blue-100 text-sm mt-1">
              API 來源: {rawData.api_source} | 更新時間: {new Date(rawData.fetch_timestamp).toLocaleString('zh-TW')}
            </p>
          </div>
          <button
            onClick={() => copyJsonToClipboard(rawData, 'yahoo-header')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${
              copySuccess['yahoo-header'] 
                ? 'bg-green-500 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
            }`}
          >
            {copySuccess['yahoo-header'] ? (
              <>
                <span className="text-sm">✓</span>
                <span>已複製</span>
              </>
            ) : (
              <>
                <span className="text-sm">📋</span>
                <span>複製完整數據</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* 數據分類卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(dataCategories).map(([categoryKey, category]) => {
            const sectionKey = `yahoo_${categoryKey}`
            const isExpanded = expandedSections[sectionKey]
            const hasData = category.data.length > 0
            
            if (!hasData) return null
            
            return (
              <div key={categoryKey} className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{category.icon}</span>
                    <div>
                      <div className="text-white font-medium text-sm">{category.title}</div>
                      <div className="text-gray-400 text-xs">{category.data.length} 個欄位</div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 bg-gray-750">
                        <div className="space-y-2">
                          {category.data.map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center py-1 border-b border-gray-600 last:border-b-0">
                              <span className="text-gray-300 text-xs font-medium">{key}:</span>
                              <span className="text-white text-xs font-mono ml-2 text-right">
                                {formatValue(key, value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* 歷史價格數據 */}
        {historyData.length > 0 && (
          <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
            <button
              onClick={() => toggleSection('yahoo_history')}
              className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center">
                <span className="text-xl mr-2">📅</span>
                <div>
                  <div className="text-white font-medium text-sm">歷史價格數據</div>
                  <div className="text-gray-400 text-xs">{historyData.length} 天數據</div>
                </div>
              </div>
              {expandedSections['yahoo_history'] ? (
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedSections['yahoo_history'] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 bg-gray-750">
                    <div className="grid grid-cols-1 gap-2">
                      {historyData.slice(-10).reverse().map((day: any, idx: number) => (
                        <div key={idx} className="bg-gray-700 rounded p-3 border border-gray-600">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-yellow-400 font-medium text-sm">
                              {day.Date ? new Date(day.Date).toLocaleDateString('zh-TW') : `Day ${idx + 1}`}
                            </span>
                            <span className="text-gray-400 text-xs">
                              成交量: {day.Volume ? day.Volume.toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div>
                              <div className="text-gray-400">開盤</div>
                              <div className="text-green-400 font-mono">${day.Open?.toFixed(2) || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">最高</div>
                              <div className="text-red-400 font-mono">${day.High?.toFixed(2) || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">最低</div>
                              <div className="text-blue-400 font-mono">${day.Low?.toFixed(2) || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">收盤</div>
                              <div className="text-white font-mono font-bold">${day.Close?.toFixed(2) || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 完整JSON數據展開器 */}
        <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-700 transition-colors">
            <button
              onClick={() => toggleSection('yahoo_full_json')}
              className="flex items-center flex-1 text-left"
            >
              <span className="text-xl mr-2">🔍</span>
              <div>
                <div className="text-white font-medium text-sm">完整 JSON 原始數據</div>
                <div className="text-gray-400 text-xs">開發者模式 - 查看所有欄位</div>
              </div>
            </button>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => copyJsonToClipboard(rawData, 'yahoo-json')}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center space-x-1 ${
                  copySuccess['yahoo-json'] 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copySuccess['yahoo-json'] ? (
                  <>
                    <span className="text-xs">✓</span>
                    <span>已複製</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs">📋</span>
                    <span>複製JSON</span>
                  </>
                )}
              </button>
              {expandedSections['yahoo_full_json'] ? (
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
          
          <AnimatePresence>
            {expandedSections['yahoo_full_json'] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 bg-black">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">Yahoo Finance 完整響應 ({Object.keys(rawData).length} 個主要字段)</span>
                    <button
                      onClick={() => copyJsonToClipboard(rawData, 'yahoo-json-expand')}
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      再次複製
                    </button>
                  </div>
                  <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono p-3 rounded border border-gray-700 bg-gray-900">
                    {JSON.stringify(rawData, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export function DataVerification({ data, rawApiResponse }: DataVerificationProps) {
  const [showRawData, setShowRawData] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    // 默認展開Yahoo Finance的主要數據類別
    'yahoo_basic': true,
    'yahoo_financial': true,
    'yahoo_valuation': true,
    'yahoo_growth': true,
    'yahoo_dividends': true,
    'yahoo_technical': true
  })
  const [copySuccess, setCopySuccess] = useState<Record<string, boolean>>({})

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const copyJsonToClipboard = async (jsonData: any, buttonId: string = 'default') => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2))
      setCopySuccess(prev => ({ ...prev, [buttonId]: true }))
      setTimeout(() => setCopySuccess(prev => ({ ...prev, [buttonId]: false })), 2000)
    } catch (err) {
      console.error('複製失敗:', err)
      // fallback 方法
      const textArea = document.createElement('textarea')
      textArea.value = JSON.stringify(jsonData, null, 2)
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        setCopySuccess(prev => ({ ...prev, [buttonId]: true }))
        setTimeout(() => setCopySuccess(prev => ({ ...prev, [buttonId]: false })), 2000)
      } catch (fallbackErr) {
        console.error('Fallback 複製也失敗:', fallbackErr)
      }
      document.body.removeChild(textArea)
    }
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
                            
                            {/* 詳細計算過程 */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h6 className="text-xs font-semibold text-gray-700 mb-3">📊 詳細計算過程:</h6>
                              
                              {method.method === 'comparable_companies_analysis' && (
                                <div className="bg-blue-50 rounded-lg p-3 text-xs">
                                  <div className="font-semibold text-blue-800 mb-2">CCA相對估值法計算步驟:</div>
                                  <div className="space-y-2 text-blue-700">
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-blue-200 rounded-full text-center leading-6 text-blue-800 mr-2 flex-shrink-0">1</span>
                                      <div>
                                        <div className="font-medium">蒐集同業公司數據</div>
                                        <div className="text-blue-600 text-xs mt-1">• 同業公司數量: {(method as any).calculation_details?.peer_multiples_analysis?.peer_count || 'N/A'}家</div>
                                        <div className="text-blue-600 text-xs">• 計算各公司P/E, EV/EBITDA, P/B倍數</div>
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-blue-200 rounded-full text-center leading-6 text-blue-800 mr-2 flex-shrink-0">2</span>
                                      <div>
                                        <div className="font-medium">計算行業倍數統計</div>
                                        {(method as any).calculation_details?.peer_multiples_analysis?.pe_statistics && (
                                          <div className="bg-white p-2 rounded border mt-1">
                                            <div className="text-blue-600 text-xs">P/E倍數統計:</div>
                                            <div className="text-blue-600 text-xs">• 中位數 = {(method as any).calculation_details.peer_multiples_analysis.pe_statistics.median?.toFixed(1)}x</div>
                                            <div className="text-blue-600 text-xs">• 平均值 = {(method as any).calculation_details.peer_multiples_analysis.pe_statistics.mean?.toFixed(1)}x</div>
                                            <div className="text-blue-600 text-xs">• 75分位 = {(method as any).calculation_details.peer_multiples_analysis.pe_statistics['75th_percentile']?.toFixed(1)}x</div>
                                            <div className="text-blue-600 text-xs">• 25分位 = {(method as any).calculation_details.peer_multiples_analysis.pe_statistics['25th_percentile']?.toFixed(1)}x</div>
                                          </div>
                                        )}
                                        {(method as any).calculation_details?.peer_multiples_analysis?.ev_ebitda_statistics && (
                                          <div className="bg-white p-2 rounded border mt-1">
                                            <div className="text-blue-600 text-xs">EV/EBITDA倍數統計:</div>
                                            <div className="text-blue-600 text-xs">• 中位數 = {(method as any).calculation_details.peer_multiples_analysis.ev_ebitda_statistics.median?.toFixed(1)}x</div>
                                            <div className="text-blue-600 text-xs">• 平均值 = {(method as any).calculation_details.peer_multiples_analysis.ev_ebitda_statistics.mean?.toFixed(1)}x</div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-blue-200 rounded-full text-center leading-6 text-blue-800 mr-2 flex-shrink-0">3</span>
                                      <div>
                                        <div className="font-medium">應用倍數計算目標價</div>
                                        {(method as any).calculation_details?.target_company_metrics && (
                                          <div className="bg-white p-2 rounded border mt-1 font-mono text-xs">
                                            <div>目標公司指標:</div>
                                            <div>• EPS = ${(method as any).calculation_details.target_company_metrics.eps?.toFixed(2) || 'N/A'} ({(method as any).calculation_details.target_company_metrics.eps_source || 'N/A'})</div>
                                            <div>• EBITDA = {(() => {
                                              const metrics = (method as any).calculation_details.target_company_metrics;
                                              const actualEbitda = metrics.actual_ebitda;
                                              const estimatedEbitda = metrics.estimated_ebitda;
                                              
                                              if (actualEbitda && actualEbitda > 0) {
                                                return `$${(actualEbitda / 1e6).toFixed(0)}M (實際數據)`;
                                              } else if (estimatedEbitda && estimatedEbitda > 0) {
                                                return `$${(estimatedEbitda / 1e6).toFixed(0)}M (估算)`;
                                              } else {
                                                return 'N/A';
                                              }
                                            })()}</div>
                                            <div>• 每股淨值 = ${(method as any).calculation_details.target_company_metrics.book_value_per_share?.toFixed(2) || 'N/A'}</div>
                                          </div>
                                        )}
                                        {(method as any).calculation_details?.valuation_calculations?.method_prices && (
                                          <div className="bg-white p-2 rounded border mt-1 font-mono text-xs">
                                            <div>各方法計算結果:</div>
                                            {Object.entries((method as any).calculation_details.valuation_calculations.method_prices).map(([methodName, price]: [string, any]) => (
                                              <div key={methodName}>• {methodName}: ${price?.toFixed(2)}</div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-blue-200 rounded-full text-center leading-6 text-blue-800 mr-2 flex-shrink-0">4</span>
                                      <div>
                                        <div className="font-medium">加權平均計算</div>
                                        {(method as any).calculation_details?.valuation_calculations?.weighted_calculation && (
                                          <div className="bg-white p-2 rounded border mt-1 font-mono text-xs">
                                            {(method as any).calculation_details.valuation_calculations.weighted_calculation.map((calc: any, idx: number) => (
                                              <div key={idx}>
                                                • {calc.method}: ${calc.target_price?.toFixed(2)} × {(calc.normalized_weight * 100).toFixed(0)}% = ${calc.contribution?.toFixed(2)}
                                              </div>
                                            ))}
                                            <div className="border-t pt-1 mt-1 font-semibold">
                                              加權平均價格 = ${(method as any).calculation_details.valuation_calculations.final_weighted_price?.toFixed(2)}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {method.method === 'discounted_cash_flow' && (
                                <div className="bg-green-50 rounded-lg p-3 text-xs">
                                  <div className="font-semibold text-green-800 mb-2">DCF現金流折現法計算步驟:</div>
                                  <div className="space-y-2 text-green-700">
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-green-200 rounded-full text-center leading-6 text-green-800 mr-2 flex-shrink-0">1</span>
                                      <div>
                                        <div className="font-medium">預測未來現金流</div>
                                        <div className="text-green-600 text-xs mt-1">• 基準收入: ${((method as any).calculation_details?.projected_cash_flows?.base_revenue / 1e9)?.toFixed(1) || 'N/A'}B</div>
                                        {(method as any).calculation_details?.projected_cash_flows?.projections && (
                                          <div className="bg-white p-2 rounded border mt-1">
                                            <div className="text-green-600 text-xs font-semibold mb-1">年度現金流預測:</div>
                                            {(method as any).calculation_details.projected_cash_flows.projections.map((proj: any, idx: number) => (
                                              <div key={idx} className="text-green-600 text-xs">
                                                Year {proj.year}: FCF=${(proj.free_cash_flow / 1e6).toFixed(0)}M (PV=${(proj.present_value / 1e6).toFixed(0)}M)
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-green-200 rounded-full text-center leading-6 text-green-800 mr-2 flex-shrink-0">2</span>
                                      <div>
                                        <div className="font-medium">計算折現率 (WACC)</div>
                                        {(method as any).calculation_details?.wacc_calculation && (
                                          <div className="bg-white p-2 rounded border mt-1 text-xs">
                                            <div className="font-semibold text-green-700 mb-2">📐 WACC計算公式:</div>
                                            <div className="bg-gray-100 p-2 rounded mb-2 font-mono text-xs">
                                              WACC = (E/V × Re) + (D/V × Rd × (1-Tax))
                                            </div>
                                            <div className="text-green-600 font-medium mb-1">📊 實際數據 (Yahoo Finance):</div>
                                            <div className="ml-2 space-y-1">
                                              <div>• Beta = {(method as any).calculation_details.wacc_calculation.components.beta?.toFixed(3) || 'N/A'} <span className="text-gray-500">(系統性風險)</span></div>
                                              {(() => {
                                                const components = (method as any).calculation_details.wacc_calculation.components;
                                                const marketCap = ((method as any).raw_data_sources?.stock_data?.market_cap || 0) / 1e9;
                                                const totalDebt = (components.total_debt || 0) / 1e9;
                                                const totalValue = marketCap + totalDebt;
                                                return (
                                                  <>
                                                    <div>• 股權市值 (E) = ${marketCap.toFixed(1)}B</div>
                                                    <div>• 債務市值 (D) = ${totalDebt.toFixed(1)}B</div>
                                                    <div>• 企業總價值 (V) = ${totalValue.toFixed(1)}B</div>
                                                    <div>• 權益比重 (E/V) = {((components.equity_to_total_value * 100)?.toFixed(1) || 'N/A')}%</div>
                                                    <div>• 債務比重 (D/V) = {((components.debt_to_total_value * 100)?.toFixed(1) || 'N/A')}%</div>
                                                  </>
                                                );
                                              })()}
                                            </div>
                                            <div className="text-orange-600 font-medium mb-1 mt-2">📈 市場估算參數:</div>
                                            <div className="ml-2 space-y-1">
                                              <div>• 無風險利率 (Rf) = {((method as any).calculation_details.wacc_calculation.components.risk_free_rate * 100)?.toFixed(1) || 'N/A'}% <span className="text-gray-500">(美國10年期國債)</span></div>
                                              <div>• 市場風險溢價 = {((method as any).calculation_details.wacc_calculation.components.market_risk_premium * 100)?.toFixed(1) || 'N/A'}% <span className="text-gray-500">(歷史平均)</span></div>
                                              <div>• 債務成本 (Rd) = {((method as any).calculation_details.wacc_calculation.components.cost_of_debt * 100)?.toFixed(1) || 'N/A'}% <span className="text-gray-500">(信用風險估算)</span></div>
                                              <div>• 稅率 (Tax) = {((method as any).calculation_details.wacc_calculation.components.tax_rate * 100)?.toFixed(1) || 'N/A'}% <span className="text-gray-500">(美國企業稅率)</span></div>
                                            </div>
                                            <div className="bg-green-50 p-2 rounded mt-2">
                                              <div className="font-semibold text-green-800">💡 最終WACC = {((method as any).calculation_details.wacc_calculation.wacc * 100)?.toFixed(2) || 'N/A'}%</div>
                                              <div className="text-xs text-green-600 mt-1">
                                                股權成本: {(() => {
                                                  const rf = (method as any).calculation_details.wacc_calculation.components.risk_free_rate;
                                                  const beta = (method as any).calculation_details.wacc_calculation.components.beta;
                                                  const mrp = (method as any).calculation_details.wacc_calculation.components.market_risk_premium;
                                                  if (rf !== undefined && beta !== undefined && mrp !== undefined) {
                                                    return `${((rf + beta * mrp) * 100).toFixed(2)}%`;
                                                  }
                                                  return 'N/A';
                                                })()} (CAPM模型)
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-green-200 rounded-full text-center leading-6 text-green-800 mr-2 flex-shrink-0">3</span>
                                      <div>
                                        <div className="font-medium">計算終值 (Terminal Value)</div>
                                        {(method as any).calculation_details?.terminal_value_calculation && (
                                          <div className="bg-white p-2 rounded border mt-1 font-mono text-xs">
                                            <div>最終年FCF = ${((method as any).calculation_details.terminal_value_calculation.final_year_fcf / 1e6).toFixed(0)}M</div>
                                            <div>永續增長率 = {((method as any).calculation_details.terminal_value_calculation.terminal_growth_rate * 100).toFixed(1)}%</div>
                                            <div>終值FCF = ${((method as any).calculation_details.terminal_value_calculation.terminal_fcf / 1e6).toFixed(0)}M</div>
                                            <div>終值 = ${((method as any).calculation_details.terminal_value_calculation.terminal_value / 1e9).toFixed(1)}B</div>
                                            <div>終值現值 = ${((method as any).calculation_details.terminal_value_calculation.pv_terminal_value / 1e9).toFixed(1)}B</div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-green-200 rounded-full text-center leading-6 text-green-800 mr-2 flex-shrink-0">4</span>
                                      <div>
                                        <div className="font-medium">折現至現值</div>
                                        {(method as any).calculation_details?.valuation_summary && (
                                          <div className="bg-white p-2 rounded border mt-1 font-mono text-xs">
                                            <div>預測期現金流現值 = ${((method as any).calculation_details.valuation_summary.pv_projected_fcf / 1e9).toFixed(1)}B</div>
                                            <div>終值現值 = ${((method as any).calculation_details.valuation_summary.pv_terminal_value / 1e9).toFixed(1)}B</div>
                                            <div className="border-t pt-1 mt-1">
                                              <div>企業價值 = ${((method as any).calculation_details.valuation_summary.enterprise_value / 1e9).toFixed(1)}B</div>
                                              <div>淨債務 = ${((method as any).calculation_details.valuation_summary.net_debt / 1e6).toFixed(0)}M</div>
                                              <div>股權價值 = ${((method as any).calculation_details.valuation_summary.equity_value / 1e9).toFixed(1)}B</div>
                                              <div>流通股數 = {((method as any).calculation_details.valuation_summary.shares_outstanding / 1e6).toFixed(0)}M</div>
                                              <div className="font-semibold text-green-700">每股價值 = ${(method as any).calculation_details.valuation_summary.value_per_share?.toFixed(2)}</div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {method.method === 'precedent_transactions_analysis' && (
                                <div className="bg-purple-50 rounded-lg p-3 text-xs">
                                  <div className="font-semibold text-purple-800 mb-2">PTA交易比率法計算步驟:</div>
                                  <div className="space-y-2 text-purple-700">
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-purple-200 rounded-full text-center leading-6 text-purple-800 mr-2 flex-shrink-0">1</span>
                                      <div>
                                        <div className="font-medium">計算當前企業價值 (EV)</div>
                                        {(method as any).calculation_details?.current_valuation && (
                                          <div className="bg-white p-2 rounded border mt-1 font-mono text-xs">
                                            <div>市值 = ${((method as any).calculation_details.current_valuation.market_cap / 1e9).toFixed(1)}B</div>
                                            <div>總債務 = ${((method as any).calculation_details.current_valuation.total_debt / 1e9).toFixed(1)}B</div>
                                            <div>總現金 = ${((method as any).calculation_details.current_valuation.total_cash / 1e9).toFixed(1)}B</div>
                                            <div className="border-t pt-1 mt-1 font-semibold">
                                              當前EV = ${((method as any).calculation_details.current_valuation.current_ev / 1e9).toFixed(1)}B
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">
                                              公式: EV = Market Cap + Total Debt - Total Cash
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-purple-200 rounded-full text-center leading-6 text-purple-800 mr-2 flex-shrink-0">2</span>
                                      <div>
                                        <div className="font-medium">應用行業交易倍數</div>
                                        {(method as any).calculation_details?.transaction_multiples && (
                                          <div className="bg-white p-2 rounded border mt-1 font-mono text-xs">
                                            <div className="font-semibold text-purple-700 mb-1">行業: {(method as any).calculation_details.transaction_multiples.sector}</div>
                                            <div>EV/Revenue倍數 = {(method as any).calculation_details.transaction_multiples.ev_revenue_multiple?.toFixed(1)}x</div>
                                            <div>EV/EBITDA倍數 = {(method as any).calculation_details.transaction_multiples.ev_ebitda_multiple?.toFixed(1)}x</div>
                                            <div>P/E倍數 = {(method as any).calculation_details.transaction_multiples.pe_multiple?.toFixed(1)}x</div>
                                            <div className="text-xs text-gray-600 mt-1">
                                              (含{((method as any).calculation_details.transaction_multiples.transaction_premium * 100).toFixed(0)}%交易溢價)
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-purple-200 rounded-full text-center leading-6 text-purple-800 mr-2 flex-shrink-0">3</span>
                                      <div>
                                        <div className="font-medium">多重估值方法計算</div>
                                        {(method as any).calculation_details?.method_calculations && (
                                          <div className="bg-white p-2 rounded border mt-1 font-mono text-xs">
                                            {(method as any).calculation_details.method_calculations.map((calc: any, idx: number) => (
                                              <div key={idx} className="mb-1">
                                                <div className="font-medium">{(() => {
                                                  const methodNames: Record<string, string> = {
                                                    'ev_revenue': 'EV/Revenue法',
                                                    'ev_ebitda': 'EV/EBITDA法',
                                                    'pe_based': 'P/E倍數法'
                                                  };
                                                  return methodNames[calc.method] || calc.method;
                                                })()}:</div>
                                                <div className="ml-2">
                                                  目標EV = ${(calc.target_ev / 1e9).toFixed(1)}B (權重{(calc.weight * 100).toFixed(0)}%)
                                                </div>
                                                <div className="ml-2 text-gray-600">
                                                  貢獻 = ${(calc.contribution / 1e9).toFixed(1)}B
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-purple-200 rounded-full text-center leading-6 text-purple-800 mr-2 flex-shrink-0">4</span>
                                      <div>
                                        <div className="font-medium">計算最終目標價格</div>
                                        {(method as any).calculation_details?.final_calculation && (
                                          <div className="bg-white p-2 rounded border mt-1 font-mono text-xs">
                                            <div>加權目標EV = ${((method as any).calculation_details.final_calculation.weighted_target_ev / 1e9).toFixed(1)}B</div>
                                            <div>目標股權價值 = ${((method as any).calculation_details.final_calculation.target_equity_value / 1e9).toFixed(1)}B</div>
                                            <div>流通股數 = {((method as any).calculation_details.current_valuation.shares_outstanding / 1e6).toFixed(0)}M</div>
                                            <div className="border-t pt-1 mt-1 font-semibold text-purple-700">
                                              目標每股價格 = ${(method as any).calculation_details.final_calculation.target_price_per_share?.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">
                                              股權價值 = 目標EV - 總債務 + 總現金
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {(method as any).calculation_details?.underlying_metrics && (
                                      <div className="mt-3 p-2 bg-purple-100 rounded">
                                        <div className="font-medium text-purple-800 mb-1">📊 基礎財務數據:</div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div>Revenue: ${((method as any).calculation_details.underlying_metrics.revenue / 1e9).toFixed(1)}B</div>
                                          <div>EBITDA: ${((method as any).calculation_details.underlying_metrics.ebitda / 1e9).toFixed(1)}B</div>
                                          <div>Net Income: ${((method as any).calculation_details.underlying_metrics.net_income / 1e9).toFixed(1)}B</div>
                                          <div>Current EV/Revenue: {(method as any).calculation_details.underlying_metrics.current_ev_revenue?.toFixed(1)}x</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {method.method === 'asset_based_valuation' && (
                                <div className="bg-orange-50 rounded-lg p-3 text-xs">
                                  <div className="font-semibold text-orange-800 mb-2">資產基礎法計算步驟:</div>
                                  <div className="space-y-2 text-orange-700">
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-orange-200 rounded-full text-center leading-6 text-orange-800 mr-2 flex-shrink-0">1</span>
                                      <div>
                                        <div className="font-medium">評估資產價值</div>
                                        <div className="text-orange-600 text-xs mt-1">• 有形資產市場價值評估</div>
                                        <div className="text-orange-600 text-xs">• 無形資產價值評估</div>
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-orange-200 rounded-full text-center leading-6 text-orange-800 mr-2 flex-shrink-0">2</span>
                                      <div>
                                        <div className="font-medium">評估負債價值</div>
                                        <div className="text-orange-600 text-xs mt-1 font-mono bg-white p-2 rounded border">
                                          總負債 = 短期負債 + 長期負債<br/>
                                          或有負債 = 擔保、訴訟等風險
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-orange-200 rounded-full text-center leading-6 text-orange-800 mr-2 flex-shrink-0">3</span>
                                      <div>
                                        <div className="font-medium">計算淨資產價值</div>
                                        <div className="text-orange-600 text-xs mt-1 font-mono bg-white p-2 rounded border">
                                          淨資產價值 = 總資產市場價值 - 總負債<br/>
                                          調整項目 = 隱藏資產 - 或有負債
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-orange-200 rounded-full text-center leading-6 text-orange-800 mr-2 flex-shrink-0">4</span>
                                      <div>
                                        <div className="font-medium">計算每股價值</div>
                                        <div className="text-orange-600 text-xs mt-1 font-mono bg-white p-2 rounded border">
                                          每股資產價值 = 調整後淨資產價值 ÷ 流通股數<br/>
                                          考慮流動性折價 (通常10-30%)
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 數據來源追蹤 */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h6 className="text-xs font-semibold text-gray-700 mb-3">🔍 數據來源追蹤:</h6>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="grid grid-cols-1 gap-2 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">當前價格來源:</span>
                                    <span className="font-mono text-blue-600">Yahoo Finance API</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">財務數據來源:</span>
                                    <span className="font-mono text-blue-600">Alpha Vantage / FMP</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">行業倍數來源:</span>
                                    <span className="font-mono text-blue-600">同業公司分析</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">計算引擎:</span>
                                    <span className="font-mono text-blue-600">CapitalCore後端估值系統</span>
                                  </div>
                                </div>
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
            <div className="p-4">
              {/* 結構化顯示原始數據 */}
              {rawApiResponse ? (
                <div className="space-y-4">
                  <div className="bg-gray-800 p-3 rounded border border-gray-600">
                    <h5 className="text-yellow-400 font-semibold mb-2 text-sm">📡 API Request Info</h5>
                    <div className="text-xs text-gray-300 space-y-1">
                      <div>Endpoint: <span className="text-cyan-400">{rawApiResponse.endpoint || '/api/analyze'}</span></div>
                      <div>Method: <span className="text-cyan-400">{rawApiResponse.method || 'POST'}</span></div>
                      <div>Timestamp: <span className="text-cyan-400">{rawApiResponse.timestamp || new Date().toISOString()}</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded border border-gray-600">
                    <h5 className="text-yellow-400 font-semibold mb-2 text-sm">📊 Stock Data Sources</h5>
                    <div className="text-xs text-gray-300 space-y-1">
                      <div>Primary: <span className="text-green-400">Yahoo Finance</span></div>
                      <div>Backup: <span className="text-blue-400">Alpha Vantage</span></div>
                      <div>Financial: <span className="text-purple-400">FMP</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded border border-gray-600">
                    <h5 className="text-yellow-400 font-semibold mb-2 text-sm">🔢 Key Financial Metrics</h5>
                    <div className="text-xs text-gray-300 space-y-1">
                      <div>Current Price: <span className="text-green-400">${data.current_price}</span></div>
                      <div>Market Cap: <span className="text-blue-400">{(data as any).market_cap ? '$' + ((data as any).market_cap / 1e9).toFixed(1) + 'B' : 'N/A'}</span></div>
                      <div>P/E Ratio: <span className="text-purple-400">{(data as any).pe_ratio || 'N/A'}</span></div>
                      <div>Revenue: <span className="text-orange-400">{(data as any).revenue ? '$' + ((data as any).revenue / 1e9).toFixed(1) + 'B' : 'N/A'}</span></div>
                    </div>
                  </div>
                  
                  {/* Alpha Vantage + FMP API 原始響應數據 */}
                  {(data as any).raw_api_data?.raw_api_response?.alpha_vantage_response && (
                    <AlphaVantageDataCard 
                      rawData={(data as any).raw_api_data.raw_api_response}
                      expandedSections={expandedSections}
                      toggleSection={toggleSection}
                      copyJsonToClipboard={copyJsonToClipboard}
                      copySuccess={copySuccess}
                    />
                  )}

                  {/* Yahoo Finance API 原始響應數據 - 現代化設計 */}
                  {(data as any).raw_api_data?.raw_yahoo_finance_response && (
                    <YahooFinanceDataCard 
                      rawData={(data as any).raw_api_data.raw_yahoo_finance_response}
                      expandedSections={expandedSections}
                      toggleSection={toggleSection}
                      copyJsonToClipboard={copyJsonToClipboard}
                      copySuccess={copySuccess}
                    />
                  )}

                  {/* 估值方法原始數據 - 現代化設計 */}
                  {isFullAnalysis && (data as AnalysisResponse).valuation_methods && (
                    <ValuationMethodsDataCard 
                      methods={(data as AnalysisResponse).valuation_methods}
                      expandedSections={expandedSections}
                      toggleSection={toggleSection}
                    />
                  )}
                </div>
              ) : null}
              
              {/* 完整JSON數據 */}
              <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-700 transition-colors">
                  <button
                    onClick={() => toggleSection('complete_json')}
                    className="flex items-center flex-1 text-left"
                  >
                    <span className="text-xl mr-2">🔍</span>
                    <div>
                      <div className="text-white font-medium text-sm">完整 API 響應 JSON</div>
                      <div className="text-gray-400 text-xs">開發者模式 - 查看所有原始數據</div>
                    </div>
                  </button>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => copyJsonToClipboard(rawApiResponse || data, 'complete-api')}
                      className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center space-x-1 ${
                        copySuccess['complete-api'] 
                          ? 'bg-green-600 text-white' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {copySuccess['complete-api'] ? (
                        <>
                          <span className="text-xs">✓</span>
                          <span>已複製</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs">📋</span>
                          <span>複製JSON</span>
                        </>
                      )}
                    </button>
                    {expandedSections['complete_json'] ? (
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedSections['complete_json'] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 bg-black">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-400">JSON內容 ({Object.keys(rawApiResponse || data).length} 個主要字段)</span>
                          <button
                            onClick={() => copyJsonToClipboard(rawApiResponse || data, 'complete-api-expand')}
                            className="text-xs text-blue-400 hover:text-blue-300 underline"
                          >
                            再次複製
                          </button>
                        </div>
                        <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono p-3 rounded border border-gray-700 bg-gray-900">
                          {JSON.stringify(rawApiResponse || data, null, 2)}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
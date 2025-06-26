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
                                            <div>• EPS = ${(method as any).calculation_details.target_company_metrics.eps?.toFixed(2) || 'N/A'}</div>
                                            <div>• 估計EBITDA = ${((method as any).calculation_details.target_company_metrics.estimated_ebitda / 1e6)?.toFixed(0) || 'N/A'}M</div>
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
                                                • {calc.method}: ${calc.target_price?.toFixed(2)} × {(calc.weight * 100).toFixed(0)}% = ${calc.contribution?.toFixed(2)}
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
                                          <div className="bg-white p-2 rounded border mt-1 max-h-32 overflow-y-auto">
                                            <div className="text-green-600 text-xs font-semibold mb-1">年度現金流預測:</div>
                                            {(method as any).calculation_details.projected_cash_flows.projections.slice(0, 3).map((proj: any, idx: number) => (
                                              <div key={idx} className="text-green-600 text-xs">
                                                Year {proj.year}: FCF=${(proj.free_cash_flow / 1e6).toFixed(0)}M (PV=${(proj.present_value / 1e6).toFixed(0)}M)
                                              </div>
                                            ))}
                                            {(method as any).calculation_details.projected_cash_flows.projections.length > 3 && (
                                              <div className="text-green-500 text-xs">... +{(method as any).calculation_details.projected_cash_flows.projections.length - 3} more years</div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-green-200 rounded-full text-center leading-6 text-green-800 mr-2 flex-shrink-0">2</span>
                                      <div>
                                        <div className="font-medium">計算折現率 (WACC)</div>
                                        {(method as any).calculation_details?.wacc_calculation && (
                                          <div className="bg-white p-2 rounded border mt-1 font-mono text-xs">
                                            <div>WACC = {((method as any).calculation_details.wacc_calculation.wacc * 100).toFixed(1)}%</div>
                                            <div className="text-green-600 mt-1">組成部分:</div>
                                            <div>• 無風險利率 = {((method as any).calculation_details.wacc_calculation.components.risk_free_rate * 100).toFixed(1)}%</div>
                                            <div>• 市場風險溢價 = {((method as any).calculation_details.wacc_calculation.components.market_risk_premium * 100).toFixed(1)}%</div>
                                            <div>• Beta = {(method as any).calculation_details.wacc_calculation.components.beta}</div>
                                            <div>• 債務成本 = {((method as any).calculation_details.wacc_calculation.components.cost_of_debt * 100).toFixed(1)}%</div>
                                            <div>• 稅率 = {((method as any).calculation_details.wacc_calculation.components.tax_rate * 100).toFixed(1)}%</div>
                                            <div>• 債務比重 = {((method as any).calculation_details.wacc_calculation.components.debt_to_total_value * 100).toFixed(1)}%</div>
                                            <div>• 權益比重 = {((method as any).calculation_details.wacc_calculation.components.equity_to_total_value * 100).toFixed(1)}%</div>
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
                                        <div className="font-medium">蒐集類似交易數據</div>
                                        <div className="text-purple-600 text-xs mt-1">• 搜尋同行業併購交易</div>
                                        <div className="text-purple-600 text-xs">• 篩選規模相近的交易案例</div>
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-purple-200 rounded-full text-center leading-6 text-purple-800 mr-2 flex-shrink-0">2</span>
                                      <div>
                                        <div className="font-medium">計算交易倍數</div>
                                        <div className="text-purple-600 text-xs mt-1 font-mono bg-white p-2 rounded border">
                                          EV/Revenue倍數 = 交易價值 ÷ 年收入<br/>
                                          EV/EBITDA倍數 = 交易價值 ÷ EBITDA
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-purple-200 rounded-full text-center leading-6 text-purple-800 mr-2 flex-shrink-0">3</span>
                                      <div>
                                        <div className="font-medium">調整控制權溢價</div>
                                        <div className="text-purple-600 text-xs mt-1">• 考慮併購溢價 (通常20-40%)</div>
                                        <div className="text-purple-600 text-xs">• 調整市場條件差異</div>
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="inline-block w-6 h-6 bg-purple-200 rounded-full text-center leading-6 text-purple-800 mr-2 flex-shrink-0">4</span>
                                      <div>
                                        <div className="font-medium">應用倍數估值</div>
                                        <div className="text-purple-600 text-xs mt-1 font-mono bg-white p-2 rounded border">
                                          目標企業價值 = 目標公司財務指標 × 交易倍數<br/>
                                          每股價值 = (企業價值 - 淨債務) ÷ 股數
                                        </div>
                                      </div>
                                    </div>
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
                                    <span className="font-mono text-blue-600">iBank後端估值系統</span>
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
            <div className="p-4 max-h-96 overflow-y-auto">
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
                  
                  {/* 顯示每個估值方法的原始數據 */}
                  {isFullAnalysis && (data as AnalysisResponse).valuation_methods && (
                    <div className="bg-gray-800 p-3 rounded border border-gray-600">
                      <h5 className="text-yellow-400 font-semibold mb-2 text-sm">🧮 Valuation Methods Raw Data</h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(data as AnalysisResponse).valuation_methods.map((method, idx) => (
                          <div key={idx} className="border border-gray-600 rounded p-2">
                            <div className="text-cyan-400 text-xs font-semibold">{method.display_name}</div>
                            <div className="text-gray-300 text-xs mt-1">
                              <div>Target Price: <span className="text-green-400">${method.target_price.toFixed(2)}</span></div>
                              <div>Confidence: <span className="text-blue-400">{(method.confidence_level * 100).toFixed(0)}%</span></div>
                              {(method as any).raw_data_sources && (
                                <div className="mt-1">
                                  <div className="text-yellow-400 text-xs">Data Sources:</div>
                                  {(method as any).raw_data_sources.data_sources?.map((source: string, i: number) => (
                                    <div key={i} className="text-gray-400 text-xs">• {source}</div>
                                  ))}
                                  {(method as any).raw_data_sources.calculation_engine && (
                                    <div className="text-gray-400 text-xs">• Engine: {(method as any).raw_data_sources.calculation_engine}</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
              
              {/* 完整JSON數據 */}
              <div className="mt-4">
                <details className="group">
                  <summary className="cursor-pointer text-yellow-400 hover:text-yellow-300 text-sm font-semibold mb-2">
                    🔍 Show Full JSON Response
                  </summary>
                  <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono bg-black p-3 rounded border border-gray-700 mt-2">
                    {JSON.stringify(rawApiResponse || data, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
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

      {/* Weighted Average Calculation Logic */}
      {'valuation_methods' in data && data.valuation_methods && data.valuation_methods.length > 1 && (
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CurrencyDollarIcon className="w-5 h-5 text-blue-600 mr-2" />
            目標價格計算邏輯
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-900 mb-3">
              <strong>加權平均計算公式：</strong>
            </div>
            <div className="bg-white rounded p-3 mb-3 font-mono text-sm">
              最終目標價 = (CCA價格 × CCA權重) + (DCF價格 × DCF權重) + (PTA價格 × PTA權重)
            </div>
            <div className="space-y-2 text-sm">
              {data.valuation_methods.map((method, index) => {
                // 計算實際的標準化權重（與後端邏輯一致）
                const companyProfile = {
                  sector: ('raw_api_data' in data && data.raw_api_data && 'stock_data' in data.raw_api_data && (data.raw_api_data as any).stock_data?.sector) || 'Technology',
                  market_cap: ('raw_api_data' in data && data.raw_api_data && 'stock_data' in data.raw_api_data && (data.raw_api_data as any).stock_data?.market_cap) || 0,
                  isLargeCap: (('raw_api_data' in data && data.raw_api_data && 'stock_data' in data.raw_api_data && (data.raw_api_data as any).stock_data?.market_cap) || 0) > 10e9,
                  isMegaCap: (('raw_api_data' in data && data.raw_api_data && 'stock_data' in data.raw_api_data && (data.raw_api_data as any).stock_data?.market_cap) || 0) > 200e9
                }
                
                // 定義行業權重函數（所有計算都會用到）
                const getSectorSpecificWeights = (sector: string, method: string, isLargeCap: boolean, isMegaCap: boolean) => {
                  const sectorConfigs: Record<string, Record<string, number>> = {
                    'Technology': {
                      'discounted_cash_flow': isLargeCap ? 1.3 : 1.0,
                      'comparable_companies_analysis': 1.2,
                      'precedent_transactions_analysis': isMegaCap ? 0.8 : 1.1,
                      'asset_based_valuation': 0.3
                    },
                    'Financial Services': {
                      'discounted_cash_flow': 0.8,
                      'comparable_companies_analysis': 1.4,
                      'precedent_transactions_analysis': 1.2,
                      'asset_based_valuation': 1.1
                    },
                    'Healthcare': {
                      'discounted_cash_flow': 1.4,
                      'comparable_companies_analysis': 1.1,
                      'precedent_transactions_analysis': 1.0,
                      'asset_based_valuation': 0.7
                    },
                    'Utilities': {
                      'discounted_cash_flow': 1.6,
                      'comparable_companies_analysis': 1.0,
                      'precedent_transactions_analysis': 0.8,
                      'asset_based_valuation': 1.2
                    }
                  }
                  return sectorConfigs[sector]?.[method] || 1.0
                }
                
                // 計算所有方法的未標準化權重
                const allMethodWeights = data.valuation_methods.map(m => {
                  
                  const coefficient = getSectorSpecificWeights(companyProfile.sector, m.method, companyProfile.isLargeCap, companyProfile.isMegaCap)
                  return m.confidence_level * coefficient
                })
                
                const totalRawWeight = allMethodWeights.reduce((sum, w) => sum + w, 0)
                const currentMethodRawWeight = method.confidence_level * getSectorSpecificWeights(companyProfile.sector, method.method, companyProfile.isLargeCap, companyProfile.isMegaCap)
                const actualWeight = (currentMethodRawWeight / totalRawWeight) * 100
                
                const getMethodShortName = (methodName: string) => {
                  const mapping: Record<string, string> = {
                    'comparable_companies_analysis': 'CCA',
                    'discounted_cash_flow': 'DCF',
                    'precedent_transactions_analysis': 'PTA',
                    'asset_based_valuation': '資產基礎法'
                  }
                  return mapping[methodName] || methodName
                }
                
                return (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-blue-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="font-medium text-blue-900">
                        {getMethodShortName(method.method)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-900 font-medium">
                        {formatCurrency(method.target_price)}
                      </div>
                      <div className="text-xs text-blue-600">
                        實際權重: {actualWeight.toFixed(1)}% (信心度: {(method.confidence_level * 100).toFixed(0)}%)
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-900">最終計算結果：</span>
                <span className="text-lg font-bold text-blue-900">
                  {formatCurrency(data.target_price)}
                </span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                * 權重已標準化，總和=100%，基於信心度×行業係數計算
              </div>
              
              {/* Method Suitability Analysis */}
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <div className="text-xs text-blue-900 font-medium mb-2">
                  📊 估值方法適用性分析：
                </div>
                
                {/* Company Profile Display */}
                {('raw_api_data' in data && data.raw_api_data && 'stock_data' in data.raw_api_data && data.raw_api_data.stock_data) && (
                  <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="text-xs text-blue-800">
                      <strong>分析標的：</strong>
                      {(data.raw_api_data as any).stock_data.sector || 'Unknown'} 行業 | 
                      市值 ${(((data.raw_api_data as any).stock_data.market_cap || 0) / 1e9).toFixed(1)}B |
                      {((data.raw_api_data as any).stock_data.market_cap || 0) > 200e9 ? ' 超大型股' : 
                       ((data.raw_api_data as any).stock_data.market_cap || 0) > 10e9 ? ' 大型股' : ' 中小型股'}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2 text-xs text-blue-800">
                  {data.valuation_methods.map((method, idx) => {
                    const getSuitabilityAnalysis = (methodType: string) => {
                      // 動態獲取公司行業和規模信息
                      const companyProfile = {
                        sector: ('raw_api_data' in data && data.raw_api_data && 'stock_data' in data.raw_api_data && (data.raw_api_data as any).stock_data?.sector) || 'Technology',
                        market_cap: ('raw_api_data' in data && data.raw_api_data && 'stock_data' in data.raw_api_data && (data.raw_api_data as any).stock_data?.market_cap) || 0,
                        isLargeCap: (('raw_api_data' in data && data.raw_api_data && 'stock_data' in data.raw_api_data && (data.raw_api_data as any).stock_data?.market_cap) || 0) > 10e9,
                        isMegaCap: (('raw_api_data' in data && data.raw_api_data && 'stock_data' in data.raw_api_data && (data.raw_api_data as any).stock_data?.market_cap) || 0) > 200e9
                      }
                      
                      const getSectorSpecificWeights = (sector: string, method: string, isLargeCap: boolean, isMegaCap: boolean) => {
                        const sectorConfigs: Record<string, Record<string, any>> = {
                          'Technology': {
                            'discounted_cash_flow': { 
                              weight: isLargeCap ? '高權重 (1.3x)' : '標準權重 (1.0x)', 
                              reason: isLargeCap ? '大型科技公司現金流相對穩定，成長模式可預測' : '小型科技公司現金流較不穩定，成長不確定性高',
                              rationale: '科技業重視未來成長潛力，大型公司DCF更可靠'
                            },
                            'comparable_companies_analysis': { 
                              weight: '高權重 (1.2x)', 
                              reason: '科技股市場活躍，投資者關注度高，同業比較參考豐富',
                              rationale: '科技股估值倍數變化頻繁，市場情緒影響大'
                            },
                            'precedent_transactions_analysis': { 
                              weight: isMegaCap ? '低權重 (0.8x)' : '中高權重 (1.1x)', 
                              reason: isMegaCap ? '超大型科技公司少有整體併購案例' : '中小型科技公司併購較為活躍',
                              rationale: '科技業併購頻繁，但規模越大併購案例越稀少'
                            },
                            'asset_based_valuation': { 
                              weight: '極低權重 (0.3x)', 
                              reason: '科技公司價值主要來自品牌、技術、數據等無形資產',
                              rationale: '傳統資產估值無法反映科技公司核心價值'
                            }
                          },
                          'Financial Services': {
                            'discounted_cash_flow': { 
                              weight: '中權重 (0.8x)', 
                              reason: '金融業資本結構特殊，傳統DCF模型不完全適用',
                              rationale: '銀行業需要特殊的股息貼現模型或ROE模型'
                            },
                            'comparable_companies_analysis': { 
                              weight: '最高權重 (1.4x)', 
                              reason: '金融業同質性高，P/B、ROE等指標比較意義重大',
                              rationale: '監管統一，業務模式相似，同業比較最為有效'
                            },
                            'precedent_transactions_analysis': { 
                              weight: '高權重 (1.2x)', 
                              reason: '金融業併購重組頻繁，交易案例豐富',
                              rationale: '監管推動整合，併購估值參考價值高'
                            },
                            'asset_based_valuation': { 
                              weight: '中權重 (1.1x)', 
                              reason: '帳面價值在金融業相對重要，資產質量是關鍵',
                              rationale: '金融資產透明度高，帳面價值具有參考意義'
                            }
                          },
                          'Healthcare': {
                            'discounted_cash_flow': { 
                              weight: '高權重 (1.4x)', 
                              reason: '醫療公司現金流穩定，長期需求確定性高',
                              rationale: '人口老化趨勢明確，醫療需求具長期可預測性'
                            },
                            'comparable_companies_analysis': { 
                              weight: '中權重 (1.1x)', 
                              reason: '醫療細分領域差異大，完全可比公司較少',
                              rationale: '不同醫療領域商業模式和風險特性差異顯著'
                            },
                            'precedent_transactions_analysis': { 
                              weight: '標準權重 (1.0x)', 
                              reason: '醫療併購案例適中，技術和產品併購較多',
                              rationale: '大型製藥公司經常收購創新技術和產品'
                            },
                            'asset_based_valuation': { 
                              weight: '低權重 (0.7x)', 
                              reason: '醫療公司價值主要在研發成果和專利',
                              rationale: '智慧財產權和研發管線難以用傳統資產評估'
                            }
                          },
                          'Utilities': {
                            'discounted_cash_flow': { 
                              weight: '最高權重 (1.6x)', 
                              reason: '公用事業現金流極其穩定，是DCF估值的理想標的',
                              rationale: '受監管保護，收入穩定可預測，適合長期現金流分析'
                            },
                            'comparable_companies_analysis': { 
                              weight: '標準權重 (1.0x)', 
                              reason: '公用事業公司同質性高，但地域差異影響比較',
                              rationale: '業務模式相似但監管環境和服務區域不同'
                            },
                            'precedent_transactions_analysis': { 
                              weight: '低權重 (0.8x)', 
                              reason: '公用事業併購較少，多為監管主導的重組',
                              rationale: '高度監管行業，併購需要政府批准，案例有限'
                            },
                            'asset_based_valuation': { 
                              weight: '中權重 (1.2x)', 
                              reason: '資產密集型行業，基礎設施資產價值重要',
                              rationale: '發電廠、輸電網等實體資產構成主要價值基礎'
                            }
                          },
                          'Energy': {
                            'discounted_cash_flow': { 
                              weight: '低權重 (0.9x)', 
                              reason: '能源價格週期性強，長期現金流預測困難',
                              rationale: '商品價格波動大，地緣政治風險高'
                            },
                            'comparable_companies_analysis': { 
                              weight: '高權重 (1.3x)', 
                              reason: '能源公司估值高度依賴商品價格週期',
                              rationale: '週期性行業，同業比較能反映當前週期位置'
                            },
                            'precedent_transactions_analysis': { 
                              weight: '中權重 (1.2x)', 
                              reason: '能源行業整合活躍，併購案例較多',
                              rationale: '規模經濟重要，行業整合持續進行'
                            },
                            'asset_based_valuation': { 
                              weight: '高權重 (1.3x)', 
                              reason: '石油儲量、礦產資源等實物資產價值重要',
                              rationale: '自然資源和生產設施構成核心價值'
                            }
                          },
                          'Consumer Staples': {
                            'discounted_cash_flow': { 
                              weight: '高權重 (1.5x)', 
                              reason: '消費必需品需求穩定，現金流可預測性強',
                              rationale: '防禦性行業，經濟週期影響相對較小'
                            },
                            'comparable_companies_analysis': { 
                              weight: '中權重 (1.1x)', 
                              reason: '品牌差異化程度高，比較需謹慎選擇',
                              rationale: '雖然都是消費品，但品牌價值和市場定位差異大'
                            },
                            'precedent_transactions_analysis': { 
                              weight: '低權重 (0.9x)', 
                              reason: '大型消費品公司併購相對較少',
                              rationale: '成熟行業，大型公司多採內生成長策略'
                            },
                            'asset_based_valuation': { 
                              weight: '低權重 (0.8x)', 
                              reason: '品牌價值無法在傳統資產中完全體現',
                              rationale: '消費品牌的無形資產價值巨大'
                            }
                          }
                        }
                        
                        return sectorConfigs[sector]?.[method] || { 
                          weight: '標準權重 (1.0x)', 
                          reason: '一般行業採用標準權重配置',
                          rationale: '無特殊行業特性，使用均衡權重分配'
                        }
                      }
                      
                      const sectorWeight = getSectorSpecificWeights(companyProfile.sector, methodType, companyProfile.isLargeCap, companyProfile.isMegaCap)
                      
                      const methodSpecs: Record<string, any> = {
                        'discounted_cash_flow': {
                          pros: '理論最嚴謹，直接基於現金流產生能力',
                          cons: '對終值和折現率參數敏感性高'
                        },
                        'comparable_companies_analysis': {
                          pros: '快速簡便，反映當前市場情緒和共識',
                          cons: '難找到完全可比公司，受市場波動影響'
                        },
                        'precedent_transactions_analysis': {
                          pros: '基於實際交易價格，包含控制權溢價',
                          cons: '缺乏相應規模和行業的併購案例'
                        },
                        'asset_based_valuation': {
                          pros: '提供基礎資產價值參考底線',
                          cons: '通常忽略品牌、技術等無形資產價值'
                        }
                      }
                      
                      return {
                        weight: sectorWeight.weight,
                        reason: sectorWeight.reason,
                        rationale: sectorWeight.rationale,
                        pros: methodSpecs[methodType]?.pros || '提供估值參考',
                        cons: methodSpecs[methodType]?.cons || '方法有其局限性'
                      }
                    }
                    
                    const analysis = getSuitabilityAnalysis(method.method)
                    const getMethodShortName = (methodName: string) => {
                      const mapping: Record<string, string> = {
                        'comparable_companies_analysis': 'CCA',
                        'discounted_cash_flow': 'DCF',
                        'precedent_transactions_analysis': 'PTA',
                        'asset_based_valuation': '資產基礎法'
                      }
                      return mapping[methodName] || methodName
                    }
                    
                    return (
                      <div key={idx} className="bg-white rounded p-2 border border-blue-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-blue-900">
                            {getMethodShortName(method.method)}
                          </span>
                          <span className="text-blue-700 font-bold text-xs">
                            {analysis.weight}
                          </span>
                        </div>
                        <div className="text-xs text-blue-700 space-y-1">
                          <div><strong>權重原因：</strong>{analysis.reason}</div>
                          <div><strong>行業邏輯：</strong>{analysis.rationale}</div>
                          <div><strong>方法優勢：</strong>{analysis.pros}</div>
                          <div><strong>方法局限：</strong>{analysis.cons}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 pt-2 border-t border-blue-200 text-xs text-blue-700">
                  <strong>權重計算過程：</strong>
                  <div className="mt-1 space-y-1">
                    <div>1. 未標準化權重 = 信心度 × 行業適用性係數</div>
                    <div>2. 標準化權重 = 未標準化權重 ÷ 總權重 (確保總和=100%)</div>
                    <div>3. 最終目標價 = Σ(各方法價格 × 標準化權重)</div>
                  </div>
                </div>
                
                {/* Real-time Weight Calculation */}
                <div className="mt-3 p-2 bg-blue-25 rounded border border-blue-100">
                  <div className="text-xs text-blue-800 font-medium mb-2">
                    📋 實際權重計算過程 ({(('raw_api_data' in data && data.raw_api_data && 'stock_data' in data.raw_api_data && (data.raw_api_data as any).stock_data?.sector) || 'Technology')}行業):
                  </div>
                  
                  {(() => {
                    // 重新定義company profile for this scope
                    const currentCompanyProfile = {
                      sector: ('raw_api_data' in data && data.raw_api_data && 'stock_data' in data.raw_api_data && (data.raw_api_data as any).stock_data?.sector) || 'Technology',
                      market_cap: ('raw_api_data' in data && data.raw_api_data && 'stock_data' in data.raw_api_data && (data.raw_api_data as any).stock_data?.market_cap) || 0,
                      isLargeCap: (('raw_api_data' in data && data.raw_api_data && 'stock_data' in data.raw_api_data && (data.raw_api_data as any).stock_data?.market_cap) || 0) > 10e9,
                      isMegaCap: (('raw_api_data' in data && data.raw_api_data && 'stock_data' in data.raw_api_data && (data.raw_api_data as any).stock_data?.market_cap) || 0) > 200e9
                    }
                    
                    // 重新定義sector weights function for this scope
                    const localGetSectorSpecificWeights = (sector: string, method: string, isLargeCap: boolean, isMegaCap: boolean) => {
                      const sectorConfigs: Record<string, Record<string, number>> = {
                        'Technology': {
                          'discounted_cash_flow': isLargeCap ? 1.3 : 1.0,
                          'comparable_companies_analysis': 1.2,
                          'precedent_transactions_analysis': isMegaCap ? 0.8 : 1.1,
                          'asset_based_valuation': 0.3
                        },
                        'Financial Services': {
                          'discounted_cash_flow': 0.8,
                          'comparable_companies_analysis': 1.4,
                          'precedent_transactions_analysis': 1.2,
                          'asset_based_valuation': 1.1
                        }
                      }
                      return sectorConfigs[sector]?.[method] || 1.0
                    }
                    
                    // 計算實際的權重分配
                    const methodCalcs = data.valuation_methods.map(method => {
                      const sectorWeight = localGetSectorSpecificWeights(
                        currentCompanyProfile.sector, 
                        method.method, 
                        currentCompanyProfile.isLargeCap, 
                        currentCompanyProfile.isMegaCap
                      )
                      
                      // sectorWeight 本身就是係數值
                      const coefficient = sectorWeight
                      
                      // 未標準化權重 = 信心度 × 行業係數
                      const rawWeight = method.confidence_level * coefficient
                      
                      const getMethodShortName = (methodName: string) => {
                        const mapping: Record<string, string> = {
                          'comparable_companies_analysis': 'CCA',
                          'discounted_cash_flow': 'DCF',
                          'precedent_transactions_analysis': 'PTA',
                          'asset_based_valuation': '資產法'
                        }
                        return mapping[methodName] || methodName
                      }
                      
                      return {
                        name: getMethodShortName(method.method),
                        confidence: method.confidence_level,
                        coefficient,
                        rawWeight,
                        targetPrice: method.target_price
                      }
                    })
                    
                    // 計算總權重
                    const totalRawWeight = methodCalcs.reduce((sum, calc) => sum + calc.rawWeight, 0)
                    
                    // 計算標準化權重
                    const normalizedCalcs = methodCalcs.map(calc => ({
                      ...calc,
                      normalizedWeight: calc.rawWeight / totalRawWeight,
                      normalizedPercent: (calc.rawWeight / totalRawWeight) * 100
                    }))
                    
                    // 計算最終目標價驗證
                    const calculatedTargetPrice = normalizedCalcs.reduce(
                      (sum, calc) => sum + (calc.targetPrice * calc.normalizedWeight), 0
                    )
                    
                    return (
                      <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                        <div>
                          <div className="font-medium">Step 1: 係數 × 信心度</div>
                          {normalizedCalcs.map((calc, idx) => (
                            <div key={idx}>
                              {calc.name}: {calc.coefficient.toFixed(1)} × {(calc.confidence * 100).toFixed(0)}% = {calc.rawWeight.toFixed(2)}
                            </div>
                          ))}
                          <div className="border-t border-blue-200 mt-1 pt-1">
                            <strong>總和: {totalRawWeight.toFixed(2)}</strong>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Step 2: 標準化權重</div>
                          {normalizedCalcs.map((calc, idx) => (
                            <div key={idx}>
                              {calc.name}: {calc.rawWeight.toFixed(2)}÷{totalRawWeight.toFixed(2)} = {calc.normalizedPercent.toFixed(1)}%
                            </div>
                          ))}
                          <div className="border-t border-blue-200 mt-1 pt-1">
                            <strong>總計: {normalizedCalcs.reduce((sum, calc) => sum + calc.normalizedPercent, 0).toFixed(1)}%</strong>
                          </div>
                        </div>
                        <div className="col-span-2 mt-2 pt-2 border-t border-blue-200">
                          <div className="font-medium text-blue-800">Step 3: 最終目標價驗證</div>
                          <div className="text-xs">
                            計算結果: ${calculatedTargetPrice.toFixed(2)} 
                            <span className="ml-2 text-blue-600">
                              (系統目標價: ${data.target_price.toFixed(2)})
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                  
                  <div className="mt-2 text-xs text-blue-600">
                    💡 權重已標準化，總和嚴格等於100%，確保加權平均數學正確性
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confidence Level Calculation Logic */}
      {'valuation_methods' in data && data.valuation_methods && data.valuation_methods.length > 0 && (
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 text-green-600 mr-2" />
            信心水平計算方法
          </h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-900 mb-3">
              <strong>採用評分卡機制 (0-100分制)：</strong>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.valuation_methods.map((method, index) => {
                const getMethodName = (methodType: string) => {
                  const mapping: Record<string, string> = {
                    'comparable_companies_analysis': 'CCA相對估值法',
                    'discounted_cash_flow': 'DCF現金流折現法',
                    'precedent_transactions_analysis': 'PTA交易比率法',
                    'asset_based_valuation': '資產基礎法'
                  }
                  return mapping[methodType] || methodType
                }

                const getCCAFactors = () => (
                  <div className="space-y-2">
                    <div className="text-xs text-green-800">
                      <strong>CCA評分因子：</strong>
                    </div>
                    <div className="text-xs text-green-700 space-y-1">
                      <div>• 可比公司數量 (0-20分)</div>
                      <div>• 估值範圍窄度 (0-20分)</div>
                      <div>• 數據完整性 (0-15分)</div>
                      <div>• 行業穩定性 (0-15分)</div>
                      <div>• 規模匹配度 (0-15分)</div>
                      <div>• 方法可靠性 (0-15分)</div>
                    </div>
                  </div>
                )

                const getDCFFactors = () => (
                  <div className="space-y-2">
                    <div className="text-xs text-green-800">
                      <strong>DCF評分因子：</strong>
                    </div>
                    <div className="text-xs text-green-700 space-y-1">
                      <div>• 財務數據可靠性 (0-25分)</div>
                      <div>• 假設參數合理性 (0-25分)</div>
                      <div>• 敏感性分析 (0-20分)</div>
                      <div>• 交叉驗證 (0-15分)</div>
                      <div>• 行業適用性 (0-15分)</div>
                    </div>
                  </div>
                )

                const getPTAFactors = () => (
                  <div className="space-y-2">
                    <div className="text-xs text-green-800">
                      <strong>PTA評分標準：</strong>
                    </div>
                    <div className="text-xs text-green-700">
                      <div>• 固定信心度: 65%</div>
                      <div>• 基於多重方法驗證</div>
                    </div>
                  </div>
                )

                const getFactorDetails = (methodType: string) => {
                  switch (methodType) {
                    case 'comparable_companies_analysis':
                      return getCCAFactors()
                    case 'discounted_cash_flow':
                      return getDCFFactors()
                    case 'precedent_transactions_analysis':
                      return getPTAFactors()
                    default:
                      return (
                        <div className="text-xs text-green-700">
                          固定信心度評估
                        </div>
                      )
                  }
                }

                return (
                  <div key={index} className="bg-white border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-green-900 text-sm">
                        {getMethodName(method.method)}
                      </div>
                      <div className="text-green-700 font-bold">
                        {(method.confidence_level * 100).toFixed(0)}%
                      </div>
                    </div>
                    
                    {getFactorDetails(method.method)}
                    
                    <div className="mt-3 pt-2 border-t border-green-100">
                      <div className="text-xs text-green-600">
                        <strong>計算說明：</strong> 
                        {method.method === 'comparable_companies_analysis' || method.method === 'discounted_cash_flow' 
                          ? '動態評分 - 基於實際數據質量和方法適用性'
                          : '專家判斷 - 基於方法特性設定固定信心度'
                        }
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-4 pt-3 border-t border-green-200">
              <div className="text-xs text-green-700">
                <strong>信心水平影響：</strong> 信心度越高的估值方法在加權平均計算中權重越大，最終影響目標價格的確定。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overall Score Calculation Logic */}
      {'overall_score' in data.recommendation && data.recommendation.overall_score && (
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SparklesIcon className="w-5 h-5 text-purple-600 mr-2" />
            綜合評分計算邏輯
          </h3>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-900 mb-3">
              <strong>評分公式 (0-100分)：</strong>
            </div>
            <div className="bg-white rounded p-3 mb-3 font-mono text-sm">
              綜合評分 = 基礎評分(50) + 買入理由加分 - 賣出理由扣分 + 信心度調整
            </div>
            
            {/* 最終結果 */}
            <div className="mt-4 pt-3 border-t border-purple-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-purple-900">最終綜合評分:</span>
                <span className="text-xl font-bold text-purple-900">
                  {data.recommendation.overall_score.toFixed(0)}/100
                </span>
              </div>
              <div className="mt-2 text-xs text-purple-600">
                <strong>評分標準:</strong> 80+ 強烈買入 | 65+ 買入 | 35-65 持有 | 20-35 賣出 | 20- 強烈賣出
              </div>
            </div>
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
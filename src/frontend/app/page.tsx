'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  TrendingUpIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

import { api } from '@/lib/api-client'
import { Header } from '@/components/layout/header'
import { StockSearch } from '@/components/stock/stock-search'
import { AnalysisResult } from '@/components/analysis/analysis-result'
import { MarketOverview } from '@/components/market/market-overview'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AnalysisResponse, QuickAnalysisResponse } from '@/types'
import toast from 'react-hot-toast'

export default function HomePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | QuickAnalysisResponse | null>(null)
  const [analysisType, setAnalysisType] = useState<'quick' | 'full'>('quick')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // 獲取市場概況
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['market-overview'],
    queryFn: api.getMarketOverview,
    refetchInterval: 60000, // 每分鐘刷新
  })

  const handleAnalyze = async (symbol: string, type: 'quick' | 'full') => {
    setIsAnalyzing(true)
    setAnalysisType(type)
    
    try {
      const result = await api.analyzeStock({
        symbol: symbol.toUpperCase(),
        analysis_type: type
      })
      
      setAnalysisResult(result)
      toast.success(`${symbol} 分析完成！`)
      
      // 滾動到結果區域
      setTimeout(() => {
        const resultElement = document.getElementById('analysis-result')
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
      
    } catch (error: any) {
      console.error('Analysis failed:', error)
      toast.error(error.message || '分析失敗，請稍後再試')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 to-primary-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container-custom section-padding">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="heading-xl mb-6">
                外商投資銀行
                <span className="block text-blue-200">分析工具</span>
              </h1>
              <p className="body-lg text-blue-100 mb-8 max-w-3xl mx-auto">
                專業級投資分析平台，整合四種權威估值方法，為您提供精準的股票分析和智能投資建議
              </p>
            </motion.div>

            {/* 特色功能 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
            >
              {[
                { icon: ChartBarIcon, title: 'CCA相對估值', desc: '同業比較分析' },
                { icon: TrendingUpIcon, title: 'DCF現金流', desc: '內在價值評估' },
                { icon: CurrencyDollarIcon, title: 'PTA交易比率', desc: '市場交易分析' },
                { icon: SparklesIcon, title: '資產基礎法', desc: '淨資產評估' }
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <feature.icon className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                  <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-blue-300">{feature.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stock Search Section */}
      <section className="container-custom py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="heading-md mb-4">開始您的投資分析</h2>
            <p className="body-md">輸入股票代號，立即獲得專業分析報告</p>
          </div>
          
          <StockSearch
            onAnalyze={handleAnalyze}
            loading={isAnalyzing}
          />
        </motion.div>
      </section>

      {/* Analysis Result Section */}
      {analysisResult && (
        <section id="analysis-result" className="container-custom pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AnalysisResult
              data={analysisResult}
              type={analysisType}
            />
          </motion.div>
        </section>
      )}

      {/* Market Overview Section */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="heading-md mb-4">市場概況</h2>
              <p className="body-md">即時市場狀態和系統信息</p>
            </div>
            
            {marketLoading ? (
              <div className="flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : marketData ? (
              <MarketOverview data={marketData} />
            ) : (
              <div className="text-center text-gray-500">
                暫無市場數據
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container-custom section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <h2 className="heading-md mb-4">專業分析功能</h2>
            <p className="body-md">四種權威估值方法，全方位投資分析</p>
          </div>

          <div className="grid-responsive">
            {[
              {
                icon: ChartBarIcon,
                title: '相對估值法 (CCA)',
                description: '通過比較同業公司的估值倍數，評估目標公司的相對價值水平',
                features: ['同業P/E比較', 'EV/EBITDA分析', '行業估值區間']
              },
              {
                icon: TrendingUpIcon,
                title: '現金流折現法 (DCF)',
                description: '基於公司未來現金流預測，計算企業內在價值',
                features: ['現金流預測', 'WACC計算', '敏感性分析']
              },
              {
                icon: CurrencyDollarIcon,
                title: '交易比率法 (PTA)',
                description: '參考市場交易案例，評估公司在併購市場的價值',
                features: ['交易倍數分析', '併購溢價評估', '市場交易趨勢']
              },
              {
                icon: SparklesIcon,
                title: '資產基礎法',
                description: '基於公司淨資產價值，提供投資安全邊際參考',
                features: ['淨資產計算', '清算價值評估', '安全邊際分析']
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="feature-card group"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-500">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-900 text-white py-16">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="heading-md mb-4">立即開始專業投資分析</h2>
            <p className="body-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              加入數千名投資者的行列，使用專業級工具做出更明智的投資決策
            </p>
            <button
              onClick={() => {
                const searchElement = document.querySelector('#stock-search')
                if (searchElement) {
                  searchElement.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="inline-flex items-center bg-white text-primary-900 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              開始分析
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
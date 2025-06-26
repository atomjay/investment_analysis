'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api-client'
import { Header } from '@/components/layout/header'
import { StockSearch } from '@/components/stock/stock-search'
import { AnalysisResult } from '@/components/analysis/analysis-result'
import { AnalysisResponse, QuickAnalysisResponse } from '@/types'
import toast from 'react-hot-toast'

export default function HomePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | QuickAnalysisResponse | null>(null)
  const [analysisType, setAnalysisType] = useState<'quick' | 'full'>('quick')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async (symbol: string, type: 'quick' | 'full', dataSource: string) => {
    setIsAnalyzing(true)
    setAnalysisType(type)
    
    try {
      const result = await api.analyzeStock({
        symbol: symbol.toUpperCase(),
        analysis_type: type,
        data_source: dataSource
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Stock Search Section */}
      <section className="container-custom py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
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

    </div>
  )
}
// Frontend TypeScript types for iBank Investment Analysis Tool

export type RecommendationType = 
  | 'strong_buy' 
  | 'buy' 
  | 'hold' 
  | 'sell' 
  | 'strong_sell'

export type ValuationMethod = 
  | 'comparable_companies_analysis'
  | 'discounted_cash_flow'
  | 'precedent_transactions_analysis'
  | 'asset_based_valuation'

export interface StockData {
  symbol: string
  company_name: string
  sector: string
  market_cap: number
  price: number
  pe_ratio?: number
  ev_ebitda?: number
  revenue?: number
  net_income?: number
  total_assets?: number
  total_debt?: number
  free_cash_flow?: number
}

export interface RecommendationReason {
  category: string
  description: string
  weight: number
  impact: 'positive' | 'negative'
}

export interface ValuationResult {
  method: ValuationMethod
  display_name: string
  target_price: number
  upside_potential: number
  confidence_level: number
}

export interface InvestmentRecommendation {
  type: RecommendationType
  display_name: string
  overall_score: number
  risk_level: string
  time_horizon: string
}

export interface AnalysisResponse {
  symbol: string
  company_name: string
  analysis_date?: string
  current_price: number
  target_price: number
  potential_return: number
  recommendation: InvestmentRecommendation
  buy_reasons: RecommendationReason[]
  sell_reasons: RecommendationReason[]
  valuation_methods: ValuationResult[]
  executive_summary?: string
  key_risks?: string[]
  catalysts?: string[]
}

export interface QuickAnalysisResponse {
  symbol: string
  company_name: string
  current_price: number
  target_price: number
  potential_return: number
  recommendation: InvestmentRecommendation
  analysis_methods: string[]
}

export interface BatchAnalysisResult {
  symbol: string
  company_name?: string
  current_price?: number
  target_price?: number
  potential_return?: number
  recommendation?: string
  risk_level?: string
  error?: string
}

export interface MarketOverview {
  market_status: {
    status: string
    US: string
  }
  supported_symbols_count: number
  supported_symbols: string[]
  analysis_methods: string[]
  system_status: string
  last_updated: string
}

export interface ApiError {
  error: string
}

// UI Component Props Types
export interface StockSearchProps {
  onAnalyze: (symbol: string, type: 'quick' | 'full') => void
  loading: boolean
}

export interface AnalysisResultProps {
  data: AnalysisResponse | QuickAnalysisResponse
  type: 'quick' | 'full'
}

export interface RecommendationBadgeProps {
  recommendation: RecommendationType
  displayName: string
  score?: number
}

export interface ValuationChartProps {
  methods: ValuationResult[]
  currentPrice: number
}

export interface RiskFactorsProps {
  reasons: RecommendationReason[]
  type: 'buy' | 'sell'
}

// API Client Types
export interface ApiClientConfig {
  baseURL: string
  timeout?: number
}

export interface AnalysisRequest {
  symbol: string
  analysis_type: 'quick' | 'full'
}

export interface BatchAnalysisRequest {
  symbols: string[]
}
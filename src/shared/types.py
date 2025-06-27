"""
Shared types and data structures for investment analysis
投資分析共享類型定義
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Union
from enum import Enum

class ValuationMethod(Enum):
    """估值方法枚舉"""
    CCA = "comparable_companies_analysis"  # 相對估值法
    PTA = "precedent_transactions_analysis"  # 交易比率法
    DCF = "discounted_cash_flow"  # 現金流折現法
    ASSET_BASED = "asset_based_valuation"  # 資產基礎法

class RecommendationType(Enum):
    """推薦類型"""
    STRONG_BUY = "strong_buy"
    BUY = "buy"
    HOLD = "hold"
    SELL = "sell"
    STRONG_SELL = "strong_sell"

@dataclass
class StockData:
    """股票基本數據 - 支援完整財務指標"""
    # 基本信息
    symbol: str
    company_name: str
    sector: str
    
    # 基本財務數據 (USD)
    market_cap: float
    price: float
    revenue: Optional[float] = None
    net_income: Optional[float] = None
    total_assets: Optional[float] = None
    total_debt: Optional[float] = None
    total_cash: Optional[float] = None
    free_cash_flow: Optional[float] = None
    operating_cash_flow: Optional[float] = None
    total_equity: Optional[float] = None
    ebitda: Optional[float] = None
    gross_profit: Optional[float] = None
    operating_income: Optional[float] = None
    
    # 估值倍數
    pe_ratio: Optional[float] = None
    ev_ebitda: Optional[float] = None
    pb_ratio: Optional[float] = None
    ps_ratio: Optional[float] = None
    peg_ratio: Optional[float] = None
    price_to_cf: Optional[float] = None
    ev_to_sales: Optional[float] = None
    ev_to_fcf: Optional[float] = None
    
    # 獲利能力指標 (%)
    roe: Optional[float] = None
    roa: Optional[float] = None
    roic: Optional[float] = None
    gross_margin: Optional[float] = None
    operating_margin: Optional[float] = None
    net_margin: Optional[float] = None
    ebitda_margin: Optional[float] = None
    
    # 財務健康指標
    debt_to_equity: Optional[float] = None
    debt_to_assets: Optional[float] = None
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    interest_coverage: Optional[float] = None
    
    # 成長性指標 (%)
    revenue_growth: Optional[float] = None
    net_income_growth: Optional[float] = None
    eps_growth: Optional[float] = None
    dividend_yield: Optional[float] = None
    
    # 每股數據
    eps: Optional[float] = None
    book_value_per_share: Optional[float] = None
    dividend_per_share: Optional[float] = None
    shares_outstanding: Optional[float] = None
    
    # 風險指標
    beta: Optional[float] = None  # 系統性風險係數
    
    # 原始API數據 (用於數據驗證和調試)
    raw_api_data: Optional[Dict[str, any]] = None

@dataclass
class ValuationMetrics:
    """估值指標"""
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    ps_ratio: Optional[float] = None
    ev_ebitda: Optional[float] = None
    ev_revenue: Optional[float] = None
    roe: Optional[float] = None
    roa: Optional[float] = None
    debt_to_equity: Optional[float] = None

@dataclass
class ValuationResult:
    """估值結果"""
    method: ValuationMethod
    target_price: float
    current_price: float
    upside_potential: float  # 上漲潛力 (%)
    confidence_level: float  # 信心水平 (0-1)
    assumptions: Dict[str, Union[str, float]]
    detailed_analysis: str
    calculation_details: Optional[Dict[str, Union[str, float, Dict]]] = None  # 詳細計算數據
    raw_data_sources: Optional[Dict[str, any]] = None  # 原始數據源

@dataclass
class CompanyComparable:
    """可比公司數據"""
    symbol: str
    company_name: str
    market_cap: float
    metrics: ValuationMetrics

@dataclass
class TransactionData:
    """交易數據"""
    target_company: str
    acquirer: str
    transaction_value: float
    transaction_date: str
    premium_paid: float  # 溢價百分比
    metrics_at_transaction: ValuationMetrics

@dataclass
class WaccComponents:
    """WACC計算組件"""
    risk_free_rate: float
    market_risk_premium: float  
    beta: float
    cost_of_debt: float
    tax_rate: float
    weight_equity: float
    weight_debt: float
    debt_to_total_value: float
    equity_to_total_value: float

@dataclass
class DCFAssumptions:
    """DCF假設參數"""
    revenue_growth_rates: List[float]  # 收入增長率預測
    ebitda_margins: List[float]  # EBITDA利潤率預測
    tax_rate: float  # 稅率
    wacc: float  # 加權平均資本成本
    terminal_growth_rate: float  # 永續增長率
    projection_years: int = 5  # 預測年限
    wacc_components: Optional[WaccComponents] = None  # WACC計算詳情

@dataclass
class RecommendationReason:
    """推薦理由"""
    category: str  # 類別 (財務、估值、行業等)
    description: str  # 詳細描述
    weight: float  # 權重 (0-1)
    impact: str  # 正面/負面影響

@dataclass
class InvestmentRecommendation:
    """投資建議"""
    symbol: str
    recommendation: RecommendationType
    target_price: float
    current_price: float
    potential_return: float
    risk_level: str  # 風險等級
    time_horizon: str  # 投資時間範圍
    buy_reasons: List[RecommendationReason]
    sell_reasons: List[RecommendationReason]
    overall_score: float  # 綜合評分 (0-100)

@dataclass
class AnalysisReport:
    """分析報告"""
    symbol: str
    company_name: str
    analysis_date: str
    stock_data: StockData
    valuation_results: List[ValuationResult]
    recommendation: InvestmentRecommendation
    executive_summary: str
    key_risks: List[str]
    catalysts: List[str]  # 催化因子
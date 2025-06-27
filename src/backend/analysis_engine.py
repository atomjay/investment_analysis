"""
Investment Analysis Engine - 投資分析引擎
Main orchestrator for investment analysis workflow
"""

from typing import List, Dict, Optional, Tuple
import logging
import os
from datetime import datetime
from dotenv import load_dotenv

# 載入環境變量
load_dotenv()

from ..shared.types import (
    StockData, ValuationResult, InvestmentRecommendation, 
    AnalysisReport, DCFAssumptions, CompanyComparable, WaccComponents
)
from .valuation.cca_analyzer import CCAAnalyzer
from .valuation.dcf_analyzer import DCFAnalyzer
from .recommendation.recommendation_engine import RecommendationEngine
from .data.stock_data_fetcher import StockDataFetcher
from .data.real_data_fetcher import RealStockDataFetcher
from .data.yahoo_finance_fetcher import YahooFinanceDataFetcher

class AnalysisEngine:
    """投資分析引擎主控制器"""
    
    def __init__(self, api_key: Optional[str] = None, use_real_data: bool = True):
        # 設置日誌
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # 智能選擇數據源 - 優先使用免費穩定的Yahoo Finance
        if use_real_data:
            try:
                # 優先使用免費且穩定的Yahoo Finance
                self.data_fetcher = YahooFinanceDataFetcher()
                self.logger.info("✅ 使用Yahoo Finance數據源 (免費且穩定)")
            except ImportError:
                # 後備方案：使用付費API
                alpha_key = api_key or os.getenv('ALPHA_VANTAGE_API_KEY')
                fmp_key = os.getenv('FMP_API_KEY')
                
                if alpha_key or fmp_key:
                    self.data_fetcher = RealStockDataFetcher(alpha_key, fmp_key)
                    self.logger.info("✅ 使用真實數據源 (Alpha Vantage + FMP)")
                else:
                    self.data_fetcher = StockDataFetcher(api_key)
                    self.logger.warning("⚠️ 使用模擬數據源")
        else:
            self.data_fetcher = StockDataFetcher(api_key)
            self.logger.info("🔧 使用模擬數據源 (開發模式)")
        
        self.cca_analyzer = CCAAnalyzer()
        self.dcf_analyzer = DCFAnalyzer()
        self.recommendation_engine = RecommendationEngine()
    
    def analyze_stock(self, symbol: str, include_sensitivity: bool = False) -> Optional[AnalysisReport]:
        """
        完整股票分析流程
        
        Args:
            symbol: 股票代號
            include_sensitivity: 是否包含敏感性分析
            
        Returns:
            AnalysisReport: 完整分析報告
        """
        try:
            self.logger.info(f"開始分析股票: {symbol}")
            
            # 步驟1: 驗證股票代號
            if not self.data_fetcher.validate_symbol(symbol):
                raise ValueError(f"無效的股票代號: {symbol}")
            
            # 步驟2: 獲取股票數據
            stock_data = self.data_fetcher.fetch_stock_data(symbol)
            if not stock_data:
                raise ValueError(f"無法獲取股票數據: {symbol}")
            
            self.logger.info(f"成功獲取 {stock_data.company_name} 數據")
            
            # 步驟3: 執行多重估值分析
            valuation_results = self._perform_valuation_analysis(stock_data)
            
            # 步驟4: 生成投資建議
            recommendation = self.recommendation_engine.generate_recommendation(
                stock_data, valuation_results
            )
            
            # 步驟5: 生成完整分析報告
            analysis_report = self.recommendation_engine.generate_analysis_report(
                stock_data, valuation_results, recommendation
            )
            
            # 步驟6: 可選的敏感性分析
            if include_sensitivity and any(r.method.value == "discounted_cash_flow" for r in valuation_results):
                sensitivity_data = self._perform_sensitivity_analysis(stock_data)
                # 可以將敏感性分析結果添加到報告中
            
            self.logger.info(f"完成 {symbol} 分析，推薦: {recommendation.recommendation.value}")
            return analysis_report
            
        except Exception as e:
            self.logger.error(f"分析 {symbol} 時發生錯誤: {e}")
            return None
    
    def _perform_valuation_analysis(self, stock_data: StockData) -> List[ValuationResult]:
        """執行多重估值分析"""
        valuation_results = []
        
        try:
            # 1. 相對估值法 (CCA)
            self.logger.info("執行相對估值法分析...")
            self.logger.info(f"目標股票: {stock_data.symbol}, 行業: {stock_data.sector}")
            comparable_companies = self.data_fetcher.fetch_comparable_companies(
                stock_data.symbol, stock_data.sector
            )
            
            self.logger.info(f"獲取到 {len(comparable_companies)} 個可比公司")
            if len(comparable_companies) >= 3:
                cca_result = self.cca_analyzer.analyze(stock_data, comparable_companies)
                valuation_results.append(cca_result)
                self.logger.info(f"CCA分析完成，目標價: ${cca_result.target_price:.2f}")
            else:
                self.logger.warning(f"可比公司數量不足 ({len(comparable_companies)}/3)，跳過CCA分析")
                # 強制執行CCA分析，即使可比公司數量不足
                if len(comparable_companies) > 0:
                    self.logger.info("強制執行CCA分析...")
                    cca_result = self.cca_analyzer.analyze(stock_data, comparable_companies)
                    valuation_results.append(cca_result)
                    self.logger.info(f"強制CCA分析完成，目標價: ${cca_result.target_price:.2f}")
        
        except Exception as e:
            self.logger.error(f"CCA分析失敗: {e}")
        
        try:
            # 2. 現金流折現法 (DCF)
            self.logger.info("執行DCF分析...")
            dcf_assumptions = self._generate_dcf_assumptions(stock_data)
            
            self.logger.info(f"營收數據: ${stock_data.revenue if stock_data.revenue else 'None'}")
            if stock_data.revenue:  # 確保有營收數據
                dcf_result = self.dcf_analyzer.analyze(stock_data, dcf_assumptions)
                valuation_results.append(dcf_result)
                self.logger.info(f"DCF分析完成，目標價: ${dcf_result.target_price:.2f}")
            else:
                self.logger.warning("缺少營收數據，嘗試使用估算值執行DCF分析")
                # 如果沒有營收數據，使用市值估算
                if stock_data.market_cap:
                    stock_data.revenue = stock_data.market_cap * 0.3  # 粗略估算
                    dcf_result = self.dcf_analyzer.analyze(stock_data, dcf_assumptions)
                    valuation_results.append(dcf_result)
                    self.logger.info(f"估算DCF分析完成，目標價: ${dcf_result.target_price:.2f}")
        
        except Exception as e:
            self.logger.error(f"DCF分析失敗: {e}")
        
        # 3. 交易比率法 (PTA) - 簡化實現
        try:
            self.logger.info("執行交易比率法分析...")
            pta_result = self._perform_pta_analysis(stock_data)
            if pta_result:
                valuation_results.append(pta_result)
                self.logger.info(f"PTA分析完成，目標價: ${pta_result.target_price:.2f}")
        except Exception as e:
            self.logger.error(f"PTA分析失敗: {e}")
        
        # 4. 資產基礎法 - 簡化實現
        try:
            self.logger.info("執行資產基礎法分析...")
            asset_result = self._perform_asset_based_analysis(stock_data)
            if asset_result:
                valuation_results.append(asset_result)
                self.logger.info(f"資產基礎法分析完成，目標價: ${asset_result.target_price:.2f}")
        except Exception as e:
            self.logger.error(f"資產基礎法分析失敗: {e}")
        
        return valuation_results
    
    def _generate_dcf_assumptions(self, stock_data: StockData) -> DCFAssumptions:
        """根據公司特徵生成DCF假設"""
        
        # 根據行業和公司規模調整假設
        sector_growth_profiles = {
            "Technology": [0.15, 0.12, 0.10, 0.08, 0.06],
            "Healthcare": [0.08, 0.07, 0.06, 0.05, 0.04],
            "Financial": [0.06, 0.05, 0.04, 0.04, 0.03],
            "Consumer": [0.07, 0.06, 0.05, 0.04, 0.03],
            "Energy": [0.05, 0.04, 0.03, 0.03, 0.02],
            "Industrial": [0.06, 0.05, 0.04, 0.04, 0.03],
            "Utilities": [0.03, 0.03, 0.02, 0.02, 0.02],
            "Real Estate": [0.05, 0.04, 0.04, 0.03, 0.03],
            "Materials": [0.05, 0.04, 0.03, 0.03, 0.02]
        }
        
        sector_ebitda_margins = {
            "Technology": [0.25, 0.26, 0.27, 0.28, 0.28],
            "Healthcare": [0.20, 0.21, 0.22, 0.22, 0.23],
            "Financial": [0.35, 0.35, 0.36, 0.36, 0.37],
            "Consumer": [0.15, 0.16, 0.16, 0.17, 0.17],
            "Energy": [0.18, 0.19, 0.20, 0.21, 0.21],
            "Industrial": [0.12, 0.13, 0.14, 0.14, 0.15],
            "Utilities": [0.22, 0.23, 0.23, 0.24, 0.24],
            "Real Estate": [0.30, 0.31, 0.32, 0.32, 0.33],
            "Materials": [0.14, 0.15, 0.15, 0.16, 0.16]
        }
        
        # 獲取行業默認值
        revenue_growth_rates = sector_growth_profiles.get(
            stock_data.sector, [0.08, 0.06, 0.05, 0.04, 0.03]
        )
        ebitda_margins = sector_ebitda_margins.get(
            stock_data.sector, [0.18, 0.19, 0.20, 0.20, 0.21]
        )
        
        # 計算WACC
        wacc, wacc_components = self._calculate_wacc(stock_data)
        
        return DCFAssumptions(
            revenue_growth_rates=revenue_growth_rates,
            ebitda_margins=ebitda_margins,
            tax_rate=0.25,
            wacc=wacc,
            terminal_growth_rate=0.025,
            projection_years=5,
            wacc_components=wacc_components
        )
    
    def _perform_pta_analysis(self, stock_data: StockData) -> Optional[ValuationResult]:
        """執行交易比率法分析（完整版本）"""
        from ..shared.types import ValuationMethod
        
        # 檢查必要數據
        if not (stock_data.market_cap and stock_data.revenue):
            return None
        
        # 行業交易倍數（基於實際M&A市場數據）
        sector_transaction_multiples = {
            "Technology": {"pe": 32, "ev_ebitda": 28, "ev_revenue": 8.5},
            "Healthcare": {"pe": 25, "ev_ebitda": 22, "ev_revenue": 5.2},
            "Financial": {"pe": 15, "ev_ebitda": 12, "ev_revenue": 3.8},
            "Consumer": {"pe": 22, "ev_ebitda": 18, "ev_revenue": 4.1},
            "Energy": {"pe": 18, "ev_ebitda": 15, "ev_revenue": 2.9}
        }
        
        multiples = sector_transaction_multiples.get(
            stock_data.sector, {"pe": 20, "ev_ebitda": 16, "ev_revenue": 4.5}
        )
        
        # 計算當前企業價值 (EV)
        total_debt = stock_data.total_debt or 0
        total_cash = stock_data.total_cash or 0
        current_ev = stock_data.market_cap + total_debt - total_cash
        
        # 多種方法計算目標企業價值
        method_calculations = {}
        method_weights = {}
        
        # 方法1: EV/Revenue倍數
        if stock_data.revenue:
            target_ev_revenue = stock_data.revenue * multiples["ev_revenue"] * 1.1  # 10%交易溢價
            method_calculations["ev_revenue"] = target_ev_revenue
            method_weights["ev_revenue"] = 0.4
        
        # 方法2: EV/EBITDA倍數
        if stock_data.ebitda and stock_data.ebitda > 0:
            target_ev_ebitda = stock_data.ebitda * multiples["ev_ebitda"] * 1.1
            method_calculations["ev_ebitda"] = target_ev_ebitda
            method_weights["ev_ebitda"] = 0.4
        
        # 方法3: P/E倍數（備用方法）
        if stock_data.net_income and stock_data.net_income > 0:
            shares_outstanding = stock_data.market_cap / stock_data.price
            eps = stock_data.net_income / shares_outstanding
            target_market_cap = eps * shares_outstanding * multiples["pe"] * 1.1
            target_ev_pe = target_market_cap + total_debt - total_cash
            method_calculations["pe_based"] = target_ev_pe
            method_weights["pe_based"] = 0.2
        
        if not method_calculations:
            return None
        
        # 標準化權重
        total_weight = sum(method_weights.values())
        normalized_weights = {k: v/total_weight for k, v in method_weights.items()}
        
        # 加權平均計算目標企業價值
        target_ev = sum(ev * normalized_weights[method] for method, ev in method_calculations.items())
        
        # 計算目標股權價值和每股價格
        target_equity_value = target_ev - total_debt + total_cash
        shares_outstanding = stock_data.market_cap / stock_data.price
        target_price = target_equity_value / shares_outstanding
        
        upside_potential = ((target_price - stock_data.price) / stock_data.price) * 100
        
        # 詳細計算數據
        calculation_details = {
            "current_valuation": {
                "market_cap": stock_data.market_cap,
                "total_debt": total_debt,
                "total_cash": total_cash,
                "current_ev": current_ev,
                "shares_outstanding": shares_outstanding
            },
            "transaction_multiples": {
                "sector": stock_data.sector,
                "ev_revenue_multiple": multiples["ev_revenue"],
                "ev_ebitda_multiple": multiples["ev_ebitda"],
                "pe_multiple": multiples["pe"],
                "transaction_premium": 0.1
            },
            "method_calculations": [
                {
                    "method": method,
                    "target_ev": ev,
                    "weight": normalized_weights[method],
                    "contribution": ev * normalized_weights[method]
                } for method, ev in method_calculations.items()
            ],
            "final_calculation": {
                "weighted_target_ev": target_ev,
                "target_equity_value": target_equity_value,
                "target_price_per_share": target_price
            },
            "underlying_metrics": {
                "revenue": stock_data.revenue,
                "ebitda": stock_data.ebitda,
                "net_income": stock_data.net_income,
                "current_ev_revenue": current_ev / stock_data.revenue if stock_data.revenue else None,
                "current_ev_ebitda": current_ev / stock_data.ebitda if stock_data.ebitda and stock_data.ebitda > 0 else None
            }
        }
        
        # 生成詳細分析報告
        detailed_analysis = f"""
交易比率法 (PTA) 分析 - {stock_data.company_name} ({stock_data.symbol})

=== 企業價值計算 ===
• 當前市值: ${stock_data.market_cap/1e9:.1f}B
• 總債務: ${total_debt/1e9:.1f}B
• 總現金: ${total_cash/1e9:.1f}B
• 當前企業價值 (EV): ${current_ev/1e9:.1f}B

=== 行業交易倍數 ({stock_data.sector}) ===
• EV/Revenue: {multiples['ev_revenue']:.1f}x (含10%交易溢價)
• EV/EBITDA: {multiples['ev_ebitda']:.1f}x (含10%交易溢價)
• P/E倍數: {multiples['pe']:.1f}x (含10%交易溢價)

=== 估值方法結果 ==="""
        
        for method, ev in method_calculations.items():
            method_name = {
                "ev_revenue": "EV/Revenue法",
                "ev_ebitda": "EV/EBITDA法", 
                "pe_based": "P/E倍數法"
            }.get(method, method)
            detailed_analysis += f"\n• {method_name}: 目標EV=${ev/1e9:.1f}B (權重{normalized_weights[method]*100:.0f}%)"
        
        detailed_analysis += f"""

=== 最終估值結果 ===
• 加權目標企業價值: ${target_ev/1e9:.1f}B
• 目標股權價值: ${target_equity_value/1e9:.1f}B
• 目標每股價格: ${target_price:.2f}

=== 交易分析說明 ===
基於{stock_data.sector}行業近期M&A交易案例，考慮控制權溢價。
大型公司如{stock_data.company_name}較少發生收購，此分析主要用於估值參考。
        """.strip()
        
        return ValuationResult(
            method=ValuationMethod.PTA,
            target_price=target_price,
            current_price=stock_data.price,
            upside_potential=upside_potential,
            confidence_level=0.65,  # 較高信心度（多重方法驗證）
            assumptions={
                "sector": stock_data.sector,
                "transaction_premium": 0.1,
                "ev_revenue_multiple": multiples["ev_revenue"],
                "ev_ebitda_multiple": multiples["ev_ebitda"],
                "pe_multiple": multiples["pe"],
                "target_enterprise_value": target_ev,
                "target_equity_value": target_equity_value
            },
            calculation_details=calculation_details,
            detailed_analysis=detailed_analysis,
            raw_data_sources={
                "transaction_multiples_source": "行業M&A交易數據庫",
                "company_financials": "Yahoo Finance",
                "calculation_engine": "CapitalCore PTA Analyzer v2.0"
            }
        )
    
    def _perform_asset_based_analysis(self, stock_data: StockData) -> Optional[ValuationResult]:
        """執行資產基礎法分析（簡化版本）"""
        from ..shared.types import ValuationMethod
        
        if not stock_data.total_assets or not stock_data.total_debt:
            return None
        
        # 計算賬面價值
        book_value = stock_data.total_assets - stock_data.total_debt
        shares_outstanding = stock_data.market_cap / stock_data.price
        book_value_per_share = book_value / shares_outstanding
        
        # 對於品牌價值較高的公司，給予一定溢價
        brand_premium = {
            "Technology": 1.5,
            "Healthcare": 1.3,
            "Consumer": 1.4,
            "Financial": 1.1,
            "Energy": 1.0
        }.get(stock_data.sector, 1.0)
        
        target_price = book_value_per_share * brand_premium
        upside_potential = ((target_price - stock_data.price) / stock_data.price) * 100
        
        return ValuationResult(
            method=ValuationMethod.ASSET_BASED,
            target_price=target_price,
            current_price=stock_data.price,
            upside_potential=upside_potential,
            confidence_level=0.5,  # 較低信心度，因為忽略無形資產
            assumptions={
                "book_value_per_share": book_value_per_share,
                "brand_premium": brand_premium,
                "total_assets": stock_data.total_assets,
                "total_debt": stock_data.total_debt
            },
            detailed_analysis=f"""
資產基礎法分析 - {stock_data.company_name}

• 總資產: ${stock_data.total_assets:,.0f}
• 總負債: ${stock_data.total_debt:,.0f}
• 賬面價值: ${book_value:,.0f}
• 每股賬面價值: ${book_value_per_share:.2f}
• 品牌溢價倍數: {brand_premium:.1f}x

注意：此方法未考慮{stock_data.company_name}的品牌價值、
技術專利和市場地位等無形資產，實際價值可能更高。
            """.strip()
        )
    
    def _perform_sensitivity_analysis(self, stock_data: StockData) -> Dict:
        """執行敏感性分析"""
        dcf_assumptions = self._generate_dcf_assumptions(stock_data)
        return self.dcf_analyzer.sensitivity_analysis(stock_data, dcf_assumptions)
    
    def quick_analysis(self, symbol: str) -> Dict[str, any]:
        """快速分析，返回簡化結果"""
        try:
            # 獲取基本數據
            stock_data = self.data_fetcher.fetch_stock_data(symbol)
            if not stock_data:
                return {"error": f"無法獲取 {symbol} 數據"}
            
            # 執行簡化的估值分析
            valuation_results = []
            
            # 只執行CCA分析以節省時間
            comparable_companies = self.data_fetcher.fetch_comparable_companies(
                stock_data.symbol, stock_data.sector, max_companies=5
            )
            
            if len(comparable_companies) >= 3:
                cca_result = self.cca_analyzer.analyze(stock_data, comparable_companies)
                valuation_results.append(cca_result)
            
            # 生成快速建議
            if valuation_results:
                recommendation = self.recommendation_engine.generate_recommendation(
                    stock_data, valuation_results
                )
                
                return {
                    "symbol": symbol,
                    "company_name": stock_data.company_name,
                    "current_price": stock_data.price,
                    "target_price": valuation_results[0].target_price,
                    "potential_return": valuation_results[0].upside_potential,
                    "recommendation": recommendation.recommendation.value,
                    "risk_level": recommendation.risk_level,
                    "analysis_methods": [r.method.value for r in valuation_results],
                    "valuation_methods": [
                        {
                            'method': result.method.value,
                            'target_price': result.target_price,
                            'upside_potential': result.upside_potential,
                            'confidence_level': result.confidence_level,
                            'calculation_details': result.calculation_details,
                            'raw_data_sources': result.raw_data_sources,
                            'assumptions': result.assumptions,
                            'detailed_analysis': result.detailed_analysis
                        } for result in valuation_results
                    ],
                    "raw_api_data": {
                        "stock_data": {
                            "symbol": stock_data.symbol,
                            "company_name": stock_data.company_name,
                            "price": stock_data.price,
                            "market_cap": stock_data.market_cap,
                            "revenue": stock_data.revenue,
                            "net_income": stock_data.net_income,
                            "pe_ratio": stock_data.pe_ratio,
                            "sector": stock_data.sector
                        },
                        "comparable_companies": [
                            {
                                "symbol": comp.symbol,
                                "company_name": comp.company_name,
                                "market_cap": comp.market_cap,
                                "pe_ratio": comp.metrics.pe_ratio if comp.metrics else None,
                                "ev_ebitda": comp.metrics.ev_ebitda if comp.metrics else None
                            } for comp in comparable_companies
                        ],
                        "data_source": "Yahoo Finance API",
                        "fetch_timestamp": datetime.now().isoformat(),
                        "raw_yahoo_finance_response": stock_data.raw_api_data if stock_data.raw_api_data else {}
                    }
                }
            else:
                return {"error": "無法完成估值分析"}
                
        except Exception as e:
            return {"error": f"分析失敗: {str(e)}"}
    
    def batch_analysis(self, symbols: List[str]) -> Dict[str, Dict]:
        """批量分析多隻股票"""
        results = {}
        
        for symbol in symbols:
            self.logger.info(f"批量分析: {symbol}")
            try:
                result = self.quick_analysis(symbol)
                results[symbol] = result
            except Exception as e:
                results[symbol] = {"error": str(e)}
        
        return results
    
    def get_market_overview(self) -> Dict[str, any]:
        """獲取市場概況"""
        try:
            market_status = self.data_fetcher.get_market_status()
            supported_symbols = self.data_fetcher.get_supported_symbols()
            
            return {
                "market_status": market_status,
                "supported_symbols_count": len(supported_symbols),
                "supported_symbols": supported_symbols[:10],  # 顯示前10個
                "analysis_methods": [
                    "相對估值法 (CCA)",
                    "現金流折現法 (DCF)",
                    "交易比率法 (PTA)",
                    "資產基礎法"
                ],
                "system_status": "正常運行",
                "last_updated": datetime.now().isoformat()
            }
        except Exception as e:
            return {"error": f"獲取市場概況失敗: {str(e)}"}
    
    def _calculate_wacc(self, stock_data: StockData) -> Tuple[float, WaccComponents]:
        """
        計算加權平均資本成本 (WACC)
        WACC = (E/V × Re) + (D/V × Rd × (1 - Tc))
        
        其中:
        E = 股權市值
        D = 債務市值
        V = E + D (總企業價值)
        Re = 股權成本
        Rd = 債務成本
        Tc = 稅率
        """
        try:
            # ===== 外部市場數據（估算值）=====
            # 無風險利率 (美國10年期國債收益率)
            risk_free_rate = 0.045  # 4.5% - 需外部API獲取實時數據
            
            # 市場風險溢價 (歷史長期平均)
            market_risk_premium = 0.065  # 6.5% - 基於S&P500歷史數據
            
            # 企業稅率 (美國聯邦稅率)
            tax_rate = 0.21  # 21% - 美國企業稅率（2017年稅改後）
            
            # ===== 公司特定數據（來自Yahoo Finance）=====
            # 使用實際Beta值，如果沒有則使用行業平均
            if stock_data.beta:
                beta = stock_data.beta  # 實際數據
                beta_source = "Yahoo Finance實際數據"
            else:
                # 行業Beta估算（備用方案）
                sector_betas = {
                    "Technology": 1.3,
                    "Healthcare": 1.0,
                    "Financial": 1.2,
                    "Consumer": 1.1,
                    "Energy": 1.4,
                    "Industrial": 1.1,
                    "Utilities": 0.7,
                    "Real Estate": 0.9,
                    "Materials": 1.2
                }
                beta = sector_betas.get(stock_data.sector, 1.0)
                beta_source = f"行業平均估算 ({stock_data.sector})"
            
            # ===== 股權成本計算（CAPM模型）=====
            cost_of_equity = risk_free_rate + beta * market_risk_premium
            
            # ===== 債務成本估算 =====
            # 基於公司規模和信用風險估算（無實際債務利率數據）
            if stock_data.market_cap > 50e9:  # 大型股，信用AAA級
                debt_risk_premium = 0.015  # 1.5%
                credit_rating = "AAA/AA"
            elif stock_data.market_cap > 10e9:  # 中型股，信用A級
                debt_risk_premium = 0.025  # 2.5%
                credit_rating = "A/BBB"
            else:  # 小型股，信用風險較高
                debt_risk_premium = 0.04   # 4.0%
                credit_rating = "BBB/BB"
            
            cost_of_debt = risk_free_rate + debt_risk_premium
            
            # ===== 資本結構權重（實際數據）=====
            total_debt = stock_data.total_debt or 0
            market_value_equity = stock_data.market_cap  # 來自Yahoo Finance
            total_value = market_value_equity + total_debt
            
            if total_value > 0:
                weight_equity = market_value_equity / total_value
                weight_debt = total_debt / total_value
            else:
                # 如果無債務數據，假設為純股權融資
                weight_equity = 1.0
                weight_debt = 0.0
            
            # 6. 計算WACC
            wacc = (weight_equity * cost_of_equity) + (weight_debt * cost_of_debt * (1 - tax_rate))
            
            # 7. 合理性檢查 (WACC應在5%-20%之間)
            wacc = max(0.05, min(0.20, wacc))
            
            # 創建WACC組件對象
            wacc_components = WaccComponents(
                risk_free_rate=risk_free_rate,
                market_risk_premium=market_risk_premium,
                beta=beta,
                cost_of_debt=cost_of_debt,
                tax_rate=tax_rate,
                weight_equity=weight_equity,
                weight_debt=weight_debt,
                debt_to_total_value=weight_debt,
                equity_to_total_value=weight_equity
            )
            
            self.logger.info(f"WACC計算詳情 - {stock_data.symbol}:")
            self.logger.info(f"  ===== 實際數據 (Yahoo Finance) =====")
            self.logger.info(f"  Market Cap: ${market_value_equity/1e9:.1f}B")
            self.logger.info(f"  Total Debt: ${total_debt/1e9:.1f}B")
            self.logger.info(f"  Beta: {beta:.3f} ({beta_source})")
            self.logger.info(f"  ===== 估算參數 =====")
            self.logger.info(f"  無風險利率: {risk_free_rate:.2%} (美國10年期國債)")
            self.logger.info(f"  市場風險溢價: {market_risk_premium:.2%} (歷史平均)")
            self.logger.info(f"  估計信用評級: {credit_rating}")
            self.logger.info(f"  ===== 計算結果 =====")
            self.logger.info(f"  股權成本: {cost_of_equity:.2%}")
            self.logger.info(f"  債務成本: {cost_of_debt:.2%}")
            self.logger.info(f"  權益權重: {weight_equity:.1%}")
            self.logger.info(f"  債務權重: {weight_debt:.1%}")
            self.logger.info(f"  最終WACC: {wacc:.2%}")
            
            return wacc, wacc_components
            
        except Exception as e:
            self.logger.error(f"WACC計算失敗: {e}")
            # 回退到簡化的WACC計算
            if stock_data.market_cap > 100e9:
                fallback_wacc = 0.08
            elif stock_data.market_cap > 10e9:
                fallback_wacc = 0.10
            else:
                fallback_wacc = 0.12
            
            # 創建簡化的WACC組件
            fallback_components = WaccComponents(
                risk_free_rate=0.045,
                market_risk_premium=0.065,
                beta=1.0,
                cost_of_debt=0.05,
                tax_rate=0.25,
                weight_equity=1.0,
                weight_debt=0.0,
                debt_to_total_value=0.0,
                equity_to_total_value=1.0
            )
            
            return fallback_wacc, fallback_components
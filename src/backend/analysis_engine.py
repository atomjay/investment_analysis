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
    AnalysisReport, DCFAssumptions, CompanyComparable
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
            comparable_companies = self.data_fetcher.fetch_comparable_companies(
                stock_data.symbol, stock_data.sector
            )
            
            if len(comparable_companies) >= 3:
                cca_result = self.cca_analyzer.analyze(stock_data, comparable_companies)
                valuation_results.append(cca_result)
                self.logger.info(f"CCA分析完成，目標價: ${cca_result.target_price:.2f}")
            else:
                self.logger.warning("可比公司數量不足，跳過CCA分析")
        
        except Exception as e:
            self.logger.error(f"CCA分析失敗: {e}")
        
        try:
            # 2. 現金流折現法 (DCF)
            self.logger.info("執行DCF分析...")
            dcf_assumptions = self._generate_dcf_assumptions(stock_data)
            
            if stock_data.revenue:  # 確保有營收數據
                dcf_result = self.dcf_analyzer.analyze(stock_data, dcf_assumptions)
                valuation_results.append(dcf_result)
                self.logger.info(f"DCF分析完成，目標價: ${dcf_result.target_price:.2f}")
            else:
                self.logger.warning("缺少營收數據，跳過DCF分析")
        
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
        
        # 根據公司規模調整WACC
        if stock_data.market_cap > 100e9:  # 大型股
            wacc = 0.08
        elif stock_data.market_cap > 10e9:  # 中型股
            wacc = 0.10
        else:  # 小型股
            wacc = 0.12
        
        return DCFAssumptions(
            revenue_growth_rates=revenue_growth_rates,
            ebitda_margins=ebitda_margins,
            tax_rate=0.25,
            wacc=wacc,
            terminal_growth_rate=0.025,
            projection_years=5
        )
    
    def _perform_pta_analysis(self, stock_data: StockData) -> Optional[ValuationResult]:
        """執行交易比率法分析（簡化版本）"""
        from ..shared.types import ValuationMethod
        
        # 模擬行業交易倍數
        sector_transaction_multiples = {
            "Technology": {"pe": 32, "ev_ebitda": 28},
            "Healthcare": {"pe": 25, "ev_ebitda": 22},
            "Financial": {"pe": 15, "ev_ebitda": 12},
            "Consumer": {"pe": 22, "ev_ebitda": 18},
            "Energy": {"pe": 18, "ev_ebitda": 15}
        }
        
        multiples = sector_transaction_multiples.get(
            stock_data.sector, {"pe": 20, "ev_ebitda": 16}
        )
        
        # 基於P/E倍數計算目標價
        if stock_data.pe_ratio and stock_data.net_income:
            eps = stock_data.net_income / (stock_data.market_cap / stock_data.price)
            target_price = eps * multiples["pe"] * 1.1  # 交易溢價10%
            
            upside_potential = ((target_price - stock_data.price) / stock_data.price) * 100
            
            return ValuationResult(
                method=ValuationMethod.PTA,
                target_price=target_price,
                current_price=stock_data.price,
                upside_potential=upside_potential,
                confidence_level=0.6,  # 中等信心度
                assumptions={
                    "transaction_pe_multiple": multiples["pe"],
                    "transaction_premium": 0.1,
                    "sector": stock_data.sector
                },
                detailed_analysis=f"""
交易比率法 (PTA) 分析 - {stock_data.company_name}

基於{stock_data.sector}行業近期交易案例：
• 交易P/E倍數: {multiples['pe']:.1f}x
• 交易溢價: 10%
• 目標價格: ${target_price:.2f}

注意：大型公司如{stock_data.company_name}較少發生收購，
此分析主要提供估值參考，實際交易可能性較低。
                """.strip()
            )
        
        return None
    
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
                    "analysis_methods": [r.method.value for r in valuation_results]
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
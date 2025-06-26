"""
Real Stock Data Fetcher - 真實股票數據獲取器
Integrates with Alpha Vantage and Financial Modeling Prep APIs
"""

import os
import time
import json
import requests
from typing import Dict, List, Optional, Any
from dataclasses import asdict
from datetime import datetime, timedelta
import logging

from ...shared.types import StockData, CompanyComparable, ValuationMetrics
from ...shared.constants import (
    API_TIMEOUT, MAX_RETRIES, RATE_LIMIT_DELAY, 
    ERROR_CODES, SUPPORTED_CURRENCIES
)
from .data_normalizer import DataNormalizer

logger = logging.getLogger(__name__)

class RealStockDataFetcher:
    """真實股票數據獲取器 - 整合多個數據源"""
    
    def __init__(self, alpha_vantage_key: Optional[str] = None, fmp_key: Optional[str] = None):
        self.alpha_vantage_key = alpha_vantage_key or os.getenv('ALPHA_VANTAGE_API_KEY')
        self.fmp_key = fmp_key or os.getenv('FMP_API_KEY')
        
        self.session = requests.Session()
        self.session.timeout = API_TIMEOUT
        self.last_request_time = 0
        
        # API 基礎 URLs
        self.alpha_vantage_base = "https://www.alphavantage.co/query"
        self.fmp_base = "https://financialmodelingprep.com/api/v3"
        
        # 初始化數據標準化器
        self.normalizer = DataNormalizer()
        
        logger.info(f"初始化真實數據獲取器")
        logger.info(f"Alpha Vantage Key: {'已配置' if self.alpha_vantage_key else '未配置'}")
        logger.info(f"FMP Key: {'已配置' if self.fmp_key else '未配置'}")
        logger.info(f"數據標準化器: 已啟用")
    
    def fetch_stock_data(self, symbol: str) -> Optional[StockData]:
        """
        獲取股票基本數據 - 整合多個數據源
        
        Args:
            symbol: 股票代號
            
        Returns:
            StockData: 整合後的股票數據
        """
        try:
            logger.info(f"開始獲取 {symbol} 的真實數據")
            
            # 優先使用 Alpha Vantage 獲取基本信息
            alpha_data = self._fetch_from_alpha_vantage(symbol)
            
            # 使用 FMP 獲取詳細財務數據
            fmp_data = self._fetch_from_fmp(symbol)
            
            # 合併數據
            stock_data = self._merge_stock_data(symbol, alpha_data, fmp_data)
            
            if stock_data:
                logger.info(f"成功獲取 {stock_data.company_name} ({symbol}) 數據")
                return stock_data
            else:
                logger.warning(f"無法獲取 {symbol} 的完整數據")
                return None
                
        except Exception as e:
            logger.error(f"獲取 {symbol} 數據時發生錯誤: {e}")
            return None
    
    def _fetch_from_alpha_vantage(self, symbol: str) -> Optional[Dict]:
        """從 Alpha Vantage 獲取數據"""
        if not self.alpha_vantage_key:
            logger.warning("Alpha Vantage API key 未配置")
            return None
        
        try:
            self._rate_limit()
            
            # 獲取公司概覽
            params = {
                "function": "OVERVIEW",
                "symbol": symbol,
                "apikey": self.alpha_vantage_key
            }
            
            response = self.session.get(self.alpha_vantage_base, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if "Error Message" in data:
                logger.error(f"Alpha Vantage 錯誤: {data['Error Message']}")
                return None
            
            if "Note" in data:
                logger.warning(f"Alpha Vantage 速率限制: {data['Note']}")
                return None
            
            # 獲取即時股價
            quote_data = self._fetch_alpha_vantage_quote(symbol)
            if quote_data:
                data['CurrentPrice'] = quote_data.get('05. price', data.get('Price', 0))
            
            return data
            
        except Exception as e:
            logger.error(f"Alpha Vantage 獲取失敗: {e}")
            return None
    
    def _fetch_alpha_vantage_quote(self, symbol: str) -> Optional[Dict]:
        """獲取 Alpha Vantage 即時報價"""
        try:
            self._rate_limit()
            
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": self.alpha_vantage_key
            }
            
            response = self.session.get(self.alpha_vantage_base, params=params)
            response.raise_for_status()
            
            data = response.json()
            return data.get("Global Quote", {})
            
        except Exception as e:
            logger.error(f"獲取 Alpha Vantage 報價失敗: {e}")
            return None
    
    def _fetch_from_fmp(self, symbol: str) -> Optional[Dict]:
        """從 Financial Modeling Prep 獲取數據"""
        if not self.fmp_key:
            logger.warning("FMP API key 未配置")
            return None
        
        try:
            # 獲取公司資料
            company_data = self._fetch_fmp_company_profile(symbol)
            
            # 獲取財務指標
            metrics_data = self._fetch_fmp_key_metrics(symbol)
            
            # 獲取財務報表數據
            financials_data = self._fetch_fmp_financials(symbol)
            
            # 合併 FMP 數據
            merged_data = {}
            if company_data:
                merged_data.update(company_data)
            if metrics_data:
                merged_data.update(metrics_data)
            if financials_data:
                merged_data.update(financials_data)
            
            return merged_data if merged_data else None
            
        except Exception as e:
            logger.error(f"FMP 獲取失敗: {e}")
            return None
    
    def _fetch_fmp_company_profile(self, symbol: str) -> Optional[Dict]:
        """獲取 FMP 公司資料"""
        try:
            self._rate_limit()
            
            url = f"{self.fmp_base}/profile/{symbol}"
            params = {"apikey": self.fmp_key}
            
            response = self.session.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            return data[0] if data and isinstance(data, list) else data
            
        except Exception as e:
            logger.error(f"獲取 FMP 公司資料失敗: {e}")
            return None
    
    def _fetch_fmp_key_metrics(self, symbol: str) -> Optional[Dict]:
        """獲取 FMP 關鍵指標"""
        try:
            self._rate_limit()
            
            url = f"{self.fmp_base}/key-metrics-ttm/{symbol}"
            params = {"apikey": self.fmp_key}
            
            response = self.session.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            return data[0] if data and isinstance(data, list) else data
            
        except Exception as e:
            logger.error(f"獲取 FMP 關鍵指標失敗: {e}")
            return None
    
    def _fetch_fmp_financials(self, symbol: str) -> Optional[Dict]:
        """獲取 FMP 財務報表數據"""
        try:
            self._rate_limit()
            
            # 獲取損益表數據
            income_url = f"{self.fmp_base}/income-statement/{symbol}"
            balance_url = f"{self.fmp_base}/balance-sheet-statement/{symbol}"
            cashflow_url = f"{self.fmp_base}/cash-flow-statement/{symbol}"
            
            params = {"limit": 1, "apikey": self.fmp_key}
            
            # 獲取最新年度數據
            income_response = self.session.get(income_url, params=params)
            income_data = income_response.json()
            
            balance_response = self.session.get(balance_url, params=params)
            balance_data = balance_response.json()
            
            cashflow_response = self.session.get(cashflow_url, params=params)
            cashflow_data = cashflow_response.json()
            
            # 合併財務數據
            financials = {}
            if income_data and isinstance(income_data, list):
                financials.update(income_data[0])
            if balance_data and isinstance(balance_data, list):
                financials.update(balance_data[0])
            if cashflow_data and isinstance(cashflow_data, list):
                financials.update(cashflow_data[0])
            
            return financials if financials else None
            
        except Exception as e:
            logger.error(f"獲取 FMP 財務數據失敗: {e}")
            return None
    
    def _merge_stock_data(self, symbol: str, alpha_data: Optional[Dict], 
                         fmp_data: Optional[Dict]) -> Optional[StockData]:
        """合併不同數據源的股票數據 - 使用數據標準化器"""
        try:
            if not alpha_data and not fmp_data:
                return None
            
            # 標準化各數據源
            normalized_sources = []
            
            if alpha_data:
                normalized_alpha = self.normalizer.normalize_data(alpha_data, 'alpha_vantage')
                if normalized_alpha:
                    normalized_sources.append(normalized_alpha)
                    logger.info(f"Alpha Vantage 數據標準化完成: {len(normalized_alpha)} 字段")
            
            if fmp_data:
                normalized_fmp = self.normalizer.normalize_data(fmp_data, 'fmp')
                if normalized_fmp:
                    normalized_sources.append(normalized_fmp)
                    logger.info(f"FMP 數據標準化完成: {len(normalized_fmp)} 字段")
            
            if not normalized_sources:
                logger.warning("沒有成功標準化的數據源")
                return None
            
            # 合併標準化數據
            merged_data = self.normalizer.merge_normalized_data(*normalized_sources)
            
            # 驗證關鍵字段
            validation_results = self.normalizer.validate_critical_fields(merged_data)
            completeness_score = self.normalizer.get_data_completeness_score(merged_data)
            
            logger.info(f"數據完整性評分: {completeness_score:.2f}")
            logger.info(f"關鍵字段驗證: {validation_results}")
            
            # 如果數據質量太低，記錄警告
            if completeness_score < 0.5:
                logger.warning(f"{symbol} 數據完整性較低 ({completeness_score:.2f})")
            
            # 創建 StockData 對象（使用完整的標準化數據）
            stock_data = StockData(
                # 基本信息
                symbol=symbol.upper(),
                company_name=self._get_company_name_from_raw(alpha_data, fmp_data),
                sector=self._get_sector_from_raw(alpha_data, fmp_data),
                
                # 基本財務數據
                market_cap=merged_data.get('market_cap'),
                price=merged_data.get('price'),
                revenue=merged_data.get('revenue'),
                net_income=merged_data.get('net_income'),
                total_assets=merged_data.get('total_assets'),
                total_debt=merged_data.get('total_debt'),
                free_cash_flow=merged_data.get('free_cash_flow'),
                operating_cash_flow=merged_data.get('operating_cash_flow'),
                total_equity=merged_data.get('total_equity'),
                ebitda=merged_data.get('ebitda'),
                gross_profit=merged_data.get('gross_profit'),
                operating_income=merged_data.get('operating_income'),
                
                # 估值倍數
                pe_ratio=merged_data.get('pe_ratio'),
                ev_ebitda=merged_data.get('ev_ebitda'),
                pb_ratio=merged_data.get('pb_ratio'),
                ps_ratio=merged_data.get('ps_ratio'),
                peg_ratio=merged_data.get('peg_ratio'),
                price_to_cf=merged_data.get('price_to_cf'),
                ev_to_sales=merged_data.get('ev_to_sales'),
                ev_to_fcf=merged_data.get('ev_to_fcf'),
                
                # 獲利能力指標
                roe=merged_data.get('roe'),
                roa=merged_data.get('roa'),
                roic=merged_data.get('roic'),
                gross_margin=merged_data.get('gross_margin'),
                operating_margin=merged_data.get('operating_margin'),
                net_margin=merged_data.get('net_margin'),
                ebitda_margin=merged_data.get('ebitda_margin'),
                
                # 財務健康指標
                debt_to_equity=merged_data.get('debt_to_equity'),
                debt_to_assets=merged_data.get('debt_to_assets'),
                current_ratio=merged_data.get('current_ratio'),
                quick_ratio=merged_data.get('quick_ratio'),
                interest_coverage=merged_data.get('interest_coverage'),
                
                # 成長性指標
                revenue_growth=merged_data.get('revenue_growth'),
                net_income_growth=merged_data.get('net_income_growth'),
                eps_growth=merged_data.get('eps_growth'),
                dividend_yield=merged_data.get('dividend_yield'),
                
                # 每股數據
                eps=merged_data.get('eps'),
                book_value_per_share=merged_data.get('book_value_per_share'),
                dividend_per_share=merged_data.get('dividend_per_share'),
                shares_outstanding=merged_data.get('shares_outstanding')
            )
            
            # 記錄數據來源信息
            logger.info(f"最終數據來源: {merged_data.get('_merged_sources', [])}")
            
            return stock_data
            
        except Exception as e:
            logger.error(f"合併數據時發生錯誤: {e}")
            return None
    
    def _get_company_name_from_raw(self, alpha_data: Optional[Dict], fmp_data: Optional[Dict]) -> str:
        """從原始數據中提取公司名稱"""
        # 嘗試從 Alpha Vantage 獲取
        if alpha_data:
            name = alpha_data.get("Name")
            if name:
                return name
        
        # 嘗試從 FMP 獲取
        if fmp_data:
            name = (fmp_data.get("companyName") or 
                   fmp_data.get("shortName"))
            if name:
                return name
        
        return "Unknown Company"
    
    def _get_sector_from_raw(self, alpha_data: Optional[Dict], fmp_data: Optional[Dict]) -> str:
        """從原始數據中提取行業分類"""
        # 嘗試從 Alpha Vantage 獲取
        if alpha_data:
            sector = alpha_data.get("Sector")
            if sector:
                return sector
        
        # 嘗試從 FMP 獲取
        if fmp_data:
            sector = (fmp_data.get("sector") or 
                     fmp_data.get("industry"))
            if sector:
                return sector
        
        return "Unknown"
    
    # 舊的數據提取方法已被數據標準化器取代
    
    def fetch_comparable_companies(self, target_symbol: str, sector: str, 
                                 max_companies: int = 10) -> List[CompanyComparable]:
        """獲取可比公司數據"""
        try:
            if not self.fmp_key:
                logger.warning("FMP API key 未配置，無法獲取可比公司")
                return []
            
            # 使用 FMP 獲取行業內公司列表
            comparable_symbols = self._fetch_sector_companies(sector, max_companies + 5)
            
            # 過濾掉目標公司並限制數量
            comparable_symbols = [s for s in comparable_symbols if s.upper() != target_symbol.upper()]
            comparable_symbols = comparable_symbols[:max_companies]
            
            comparables = []
            for symbol in comparable_symbols:
                try:
                    stock_data = self.fetch_stock_data(symbol)
                    if stock_data:
                        metrics = ValuationMetrics(
                            pe_ratio=stock_data.pe_ratio,
                            ev_ebitda=stock_data.ev_ebitda,
                            pb_ratio=None,  # 可以後續添加
                            ps_ratio=None,  # 可以後續添加
                        )
                        
                        comparable = CompanyComparable(
                            symbol=stock_data.symbol,
                            company_name=stock_data.company_name,
                            market_cap=stock_data.market_cap,
                            metrics=metrics
                        )
                        comparables.append(comparable)
                        
                except Exception as e:
                    logger.warning(f"獲取可比公司 {symbol} 數據失敗: {e}")
                    continue
            
            logger.info(f"成功獲取 {len(comparables)} 家可比公司數據")
            return comparables
            
        except Exception as e:
            logger.error(f"獲取可比公司失敗: {e}")
            return []
    
    def _fetch_sector_companies(self, sector: str, limit: int = 20) -> List[str]:
        """獲取特定行業的公司列表"""
        try:
            self._rate_limit()
            
            # 使用 FMP 的股票篩選器
            url = f"{self.fmp_base}/stock-screener"
            params = {
                "marketCapMoreThan": 1000000000,  # 市值大於10億
                "sector": sector,
                "limit": limit,
                "apikey": self.fmp_key
            }
            
            response = self.session.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if isinstance(data, list):
                return [company.get("symbol", "") for company in data if company.get("symbol")]
            else:
                logger.warning("FMP 篩選器返回格式異常")
                return []
                
        except Exception as e:
            logger.error(f"獲取行業公司列表失敗: {e}")
            # 返回預設的熱門股票作為後備
            return ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA"]
    
    def _rate_limit(self):
        """實施API速率限制"""
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        
        if time_since_last_request < RATE_LIMIT_DELAY:
            time.sleep(RATE_LIMIT_DELAY - time_since_last_request)
        
        self.last_request_time = time.time()
    
    def validate_symbol(self, symbol: str) -> bool:
        """驗證股票代號格式"""
        if not symbol or not isinstance(symbol, str):
            return False
        
        clean_symbol = symbol.upper().strip()
        
        if len(clean_symbol) < 1 or len(clean_symbol) > 10:
            return False
        
        return clean_symbol.replace(".", "").isalnum()
    
    def get_supported_symbols(self) -> List[str]:
        """獲取支援的股票代號列表
        
        注意：Alpha Vantage 和 FMP 支援所有美股股票代號，
        這裡返回熱門股票作為示例，實際上可以輸入任何有效的美股代號
        """
        return [
            "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA",
            "JPM", "JNJ", "PFE", "WMT", "PG", "HD", "DIS", "NFLX",
            "CRM", "ORCL", "INTC", "CSCO", "IBM", "ADBE", "COP"
        ]
    
    def get_market_status(self) -> Dict[str, str]:
        """獲取市場狀態"""
        try:
            now = datetime.now()
            
            # 簡化的市場時間判斷 (美東時間 9:30-16:00)
            # 實際應用中應該考慮時區轉換和節假日
            is_trading_hours = 9 <= now.hour <= 16
            
            return {
                "US": "9:30-16:00 EST",
                "status": "開盤中" if is_trading_hours else "休市",
                "last_updated": now.isoformat(),
                "data_sources": {
                    "alpha_vantage": "已連接" if self.alpha_vantage_key else "未配置",
                    "fmp": "已連接" if self.fmp_key else "未配置"
                }
            }
            
        except Exception as e:
            logger.error(f"獲取市場狀態失敗: {e}")
            return {
                "status": "未知",
                "error": str(e)
            }
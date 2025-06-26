"""
Stock Data Fetcher - 股票數據獲取器
Fetches stock data from various financial data sources
"""

import time
import json
from typing import Dict, List, Optional, Any
from dataclasses import asdict
import requests
from urllib.parse import urlencode

from ...shared.types import StockData, CompanyComparable, ValuationMetrics
from ...shared.constants import (
    API_TIMEOUT, MAX_RETRIES, RATE_LIMIT_DELAY, 
    DATA_SOURCES, ERROR_CODES, SUPPORTED_CURRENCIES
)

class StockDataFetcher:
    """股票數據獲取器"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.session = requests.Session()
        self.session.timeout = API_TIMEOUT
        self.last_request_time = 0
        
    def fetch_stock_data(self, symbol: str) -> Optional[StockData]:
        """
        獲取股票基本數據
        
        Args:
            symbol: 股票代號
            
        Returns:
            StockData: 股票數據對象，如果獲取失敗則返回None
        """
        try:
            # 實現速率限制
            self._rate_limit()
            
            # 嘗試多個數據源
            for source in [DATA_SOURCES["primary"]] + DATA_SOURCES["backup"]:
                try:
                    if source == "alpha_vantage":
                        return self._fetch_from_alpha_vantage(symbol)
                    elif source == "yahoo_finance":
                        return self._fetch_from_yahoo_finance(symbol)
                    elif source == "quandl":
                        return self._fetch_from_quandl(symbol)
                except Exception as e:
                    print(f"數據源 {source} 獲取失敗: {e}")
                    continue
            
            return None
            
        except Exception as e:
            print(f"獲取股票數據失敗 {symbol}: {e}")
            return None
    
    def fetch_comparable_companies(self, target_symbol: str, sector: str, 
                                 max_companies: int = 10) -> List[CompanyComparable]:
        """
        獲取可比公司數據
        
        Args:
            target_symbol: 目標股票代號
            sector: 行業分類
            max_companies: 最大可比公司數量
            
        Returns:
            List[CompanyComparable]: 可比公司列表
        """
        # 模擬數據 - 實際應用中需要從數據源獲取
        comparable_companies = self._get_mock_comparable_companies(sector)
        
        # 過濾掉目標公司本身
        comparable_companies = [
            comp for comp in comparable_companies 
            if comp.symbol.upper() != target_symbol.upper()
        ]
        
        return comparable_companies[:max_companies]
    
    def _rate_limit(self):
        """實施API速率限制"""
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        
        if time_since_last_request < RATE_LIMIT_DELAY:
            time.sleep(RATE_LIMIT_DELAY - time_since_last_request)
        
        self.last_request_time = time.time()
    
    def _fetch_from_alpha_vantage(self, symbol: str) -> Optional[StockData]:
        """從Alpha Vantage獲取數據"""
        if not self.api_key:
            # 返回模擬數據供演示使用
            return self._get_mock_stock_data(symbol)
        
        # Alpha Vantage API實現
        base_url = "https://www.alphavantage.co/query"
        
        # 獲取基本信息
        params = {
            "function": "OVERVIEW",
            "symbol": symbol,
            "apikey": self.api_key
        }
        
        response = self.session.get(base_url, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        if "Error Message" in data:
            raise ValueError(f"Alpha Vantage錯誤: {data['Error Message']}")
        
        return self._parse_alpha_vantage_data(symbol, data)
    
    def _fetch_from_yahoo_finance(self, symbol: str) -> Optional[StockData]:
        """從Yahoo Finance獲取數據（簡化實現）"""
        # 注意：Yahoo Finance不提供官方API，這裡僅為演示
        # 實際應用中建議使用yfinance庫或其他合法方式
        return self._get_mock_stock_data(symbol)
    
    def _fetch_from_quandl(self, symbol: str) -> Optional[StockData]:
        """從Quandl獲取數據"""
        # Quandl API實現 - 簡化版本
        return self._get_mock_stock_data(symbol)
    
    def _parse_alpha_vantage_data(self, symbol: str, data: Dict[str, Any]) -> StockData:
        """解析Alpha Vantage返回的數據"""
        try:
            return StockData(
                symbol=symbol,
                company_name=data.get("Name", "Unknown"),
                sector=data.get("Sector", "Unknown"),
                market_cap=float(data.get("MarketCapitalization", 0)),
                price=float(data.get("Price", 0)),
                pe_ratio=float(data.get("PERatio", 0)) if data.get("PERatio") != "None" else None,
                ev_ebitda=float(data.get("EVToEBITDA", 0)) if data.get("EVToEBITDA") != "None" else None,
                revenue=float(data.get("RevenueTTM", 0)) if data.get("RevenueTTM") else None,
                net_income=float(data.get("NetIncomeTTM", 0)) if data.get("NetIncomeTTM") else None,
                total_assets=float(data.get("TotalAssets", 0)) if data.get("TotalAssets") else None,
                total_debt=float(data.get("TotalDebt", 0)) if data.get("TotalDebt") else None,
            )
        except (ValueError, KeyError) as e:
            raise ValueError(f"數據解析錯誤: {e}")
    
    def _get_mock_stock_data(self, symbol: str) -> StockData:
        """獲取模擬股票數據供演示使用"""
        
        # 預定義的模擬數據
        mock_data = {
            "AAPL": StockData(
                symbol="AAPL",
                company_name="Apple Inc.",
                sector="Technology",
                market_cap=3000000000000,  # 3T
                price=180.00,
                pe_ratio=28.5,
                ev_ebitda=22.1,
                revenue=394328000000,  # 394B
                net_income=99803000000,  # 99.8B
                total_assets=352755000000,
                total_debt=111109000000,
                free_cash_flow=111443000000
            ),
            "MSFT": StockData(
                symbol="MSFT",
                company_name="Microsoft Corporation",
                sector="Technology",
                market_cap=2800000000000,  # 2.8T
                price=375.00,
                pe_ratio=32.1,
                ev_ebitda=25.3,
                revenue=211915000000,  # 211.9B
                net_income=72361000000,  # 72.4B
                total_assets=411976000000,
                total_debt=97717000000,
                free_cash_flow=65149000000
            ),
            "GOOGL": StockData(
                symbol="GOOGL",
                company_name="Alphabet Inc.",
                sector="Technology",
                market_cap=1800000000000,  # 1.8T
                price=145.00,
                pe_ratio=25.8,
                ev_ebitda=18.9,
                revenue=282836000000,  # 282.8B
                net_income=73795000000,  # 73.8B
                total_assets=365264000000,
                total_debt=28748000000,
                free_cash_flow=69495000000
            ),
            "TSLA": StockData(
                symbol="TSLA",
                company_name="Tesla, Inc.",
                sector="Consumer",
                market_cap=800000000000,  # 800B
                price=250.00,
                pe_ratio=65.2,
                ev_ebitda=45.7,
                revenue=96773000000,  # 96.8B
                net_income=15000000000,  # 15B
                total_assets=106618000000,
                total_debt=9556000000,
                free_cash_flow=5000000000
            )
        }
        
        # 如果有預定義數據則返回，否則生成隨機數據
        if symbol.upper() in mock_data:
            return mock_data[symbol.upper()]
        else:
            return self._generate_random_stock_data(symbol)
    
    def _generate_random_stock_data(self, symbol: str) -> StockData:
        """生成隨機股票數據"""
        import random
        
        # 隨機生成合理範圍內的財務數據
        market_cap = random.uniform(1e9, 500e9)  # 10億到5000億
        price = random.uniform(10, 500)
        pe_ratio = random.uniform(10, 50)
        revenue = market_cap * random.uniform(0.5, 2.0)
        net_income = revenue * random.uniform(0.05, 0.25)
        
        sectors = ["Technology", "Healthcare", "Financial", "Consumer", "Energy"]
        
        return StockData(
            symbol=symbol.upper(),
            company_name=f"{symbol.upper()} Company",
            sector=random.choice(sectors),
            market_cap=market_cap,
            price=price,
            pe_ratio=pe_ratio,
            ev_ebitda=random.uniform(8, 30),
            revenue=revenue,
            net_income=net_income,
            total_assets=revenue * random.uniform(1.2, 3.0),
            total_debt=revenue * random.uniform(0.1, 0.8),
            free_cash_flow=net_income * random.uniform(0.8, 1.5)
        )
    
    def _get_mock_comparable_companies(self, sector: str) -> List[CompanyComparable]:
        """獲取模擬可比公司數據"""
        
        # 按行業分類的可比公司
        sector_companies = {
            "Technology": [
                ("AAPL", "Apple Inc.", 3000e9),
                ("MSFT", "Microsoft Corporation", 2800e9),
                ("GOOGL", "Alphabet Inc.", 1800e9),
                ("AMZN", "Amazon.com Inc.", 1500e9),
                ("META", "Meta Platforms Inc.", 800e9),
                ("NVDA", "NVIDIA Corporation", 1200e9),
                ("ORCL", "Oracle Corporation", 300e9),
                ("CRM", "Salesforce Inc.", 200e9),
                ("ADBE", "Adobe Inc.", 250e9),
                ("INTC", "Intel Corporation", 200e9)
            ],
            "Healthcare": [
                ("JNJ", "Johnson & Johnson", 450e9),
                ("PFE", "Pfizer Inc.", 280e9),
                ("ABBV", "AbbVie Inc.", 320e9),
                ("MRK", "Merck & Co.", 290e9),
                ("TMO", "Thermo Fisher Scientific", 200e9)
            ],
            "Financial": [
                ("JPM", "JPMorgan Chase & Co.", 450e9),
                ("BAC", "Bank of America Corp", 320e9),
                ("WFC", "Wells Fargo & Company", 180e9),
                ("GS", "Goldman Sachs Group", 120e9),
                ("MS", "Morgan Stanley", 150e9)
            ]
        }
        
        companies_data = sector_companies.get(sector, sector_companies["Technology"])
        comparables = []
        
        for symbol, name, market_cap in companies_data:
            # 生成模擬的估值指標
            import random
            metrics = ValuationMetrics(
                pe_ratio=random.uniform(15, 35),
                pb_ratio=random.uniform(2, 8),
                ps_ratio=random.uniform(3, 12),
                ev_ebitda=random.uniform(12, 25),
                ev_revenue=random.uniform(4, 15),
                roe=random.uniform(0.10, 0.25),
                roa=random.uniform(0.05, 0.15),
                debt_to_equity=random.uniform(0.2, 1.5)
            )
            
            comparables.append(CompanyComparable(
                symbol=symbol,
                company_name=name,
                market_cap=market_cap,
                metrics=metrics
            ))
        
        return comparables
    
    def validate_symbol(self, symbol: str) -> bool:
        """驗證股票代號格式"""
        if not symbol or not isinstance(symbol, str):
            return False
        
        # 清理代號
        clean_symbol = symbol.upper().strip()
        
        # 基本格式檢查
        if len(clean_symbol) < 1 or len(clean_symbol) > 10:
            return False
        
        # 只允許字母和數字
        if not clean_symbol.replace(".", "").isalnum():
            return False
        
        return True
    
    def get_supported_symbols(self) -> List[str]:
        """獲取支援的股票代號列表"""
        return ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "JPM", "JNJ", "PFE"]
    
    def get_market_status(self) -> Dict[str, str]:
        """獲取市場狀態"""
        # 簡化實現 - 實際應用中需要根據時區和交易日曆判斷
        import datetime
        
        now = datetime.datetime.now()
        market_hours = {
            "US": "9:30-16:00 EST",
            "status": "開盤中" if 9 <= now.hour <= 16 else "休市"
        }
        
        return market_hours
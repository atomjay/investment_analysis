"""
Yahoo Finance Data Fetcher - Yahoo Finance 數據獲取器
Alternative data source using yfinance library
"""

import yfinance as yf
import pandas as pd
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime, timedelta

from ...shared.types import StockData, CompanyComparable, ValuationMetrics
from .data_normalizer import DataNormalizer

logger = logging.getLogger(__name__)

class YahooFinanceDataFetcher:
    """Yahoo Finance 數據獲取器 - 免費數據源"""
    
    def __init__(self):
        self.name = "Yahoo Finance Data Fetcher"
        self.normalizer = DataNormalizer()
        self.raw_api_response = None  # 存儲最新的原始API響應
        logger.info("初始化 Yahoo Finance 數據獲取器")
        logger.info("數據標準化器: 已啟用")
    
    def fetch_stock_data(self, symbol: str) -> Optional[StockData]:
        """
        從 Yahoo Finance 獲取股票數據
        
        Args:
            symbol: 股票代號
            
        Returns:
            StockData: 股票數據對象
        """
        try:
            logger.info(f"從 Yahoo Finance 獲取 {symbol} 數據")
            
            # 創建 yfinance Ticker 對象
            ticker = yf.Ticker(symbol)
            
            # 獲取股票信息
            info = ticker.info
            
            if not info or 'symbol' not in info:
                logger.warning(f"Yahoo Finance 無法找到 {symbol} 的數據")
                return None
            
            # 獲取歷史價格數據（用於計算自由現金流等）
            hist = ticker.history(period="1y")
            
            if hist.empty:
                logger.warning(f"{symbol} 無歷史價格數據")
                current_price = info.get('currentPrice', info.get('regularMarketPrice', 0))
            else:
                current_price = hist['Close'].iloc[-1] if not hist.empty else 0
            
            # 為這次特定請求保存原始API響應數據
            current_raw_response = {
                'yahoo_finance_info': info,
                'yahoo_finance_history': hist.to_dict('records') if not hist.empty else [],
                'fetch_timestamp': datetime.now().isoformat(),
                'api_source': 'yfinance library',
                'requested_symbol': symbol.upper()  # 明確記錄請求的股票代號
            }
            
            # 更新類別變數（保持向後兼容）
            self.raw_api_response = current_raw_response
            
            # 準備原始數據進行標準化
            raw_data = {
                'currentPrice': current_price,
                'marketCap': info.get('marketCap'),
                'totalRevenue': info.get('totalRevenue'),
                'netIncomeToCommon': info.get('netIncomeToCommon'),
                'totalAssets': info.get('totalAssets'),
                'totalDebt': info.get('totalDebt'),
                'freeCashflow': info.get('freeCashflow'),
                'trailingPE': info.get('trailingPE'),
                'enterpriseToEbitda': info.get('enterpriseToEbitda'),
                'priceToBook': info.get('priceToBook'),
                'priceToSalesTrailing12Months': info.get('priceToSalesTrailing12Months')
            }
            
            # 使用數據標準化器
            normalized_data = self.normalizer.normalize_data(raw_data, 'yahoo_finance')
            
            # 驗證數據質量
            validation_results = self.normalizer.validate_critical_fields(normalized_data)
            completeness_score = self.normalizer.get_data_completeness_score(normalized_data)
            
            logger.info(f"Yahoo Finance {symbol} 數據完整性: {completeness_score:.2f}")
            logger.info(f"關鍵字段驗證: {validation_results}")
            
            # 創建 StockData 對象
            stock_data = StockData(
                symbol=symbol.upper(),
                company_name=info.get('longName', info.get('shortName', f"{symbol} Company")),
                sector=info.get('sector', 'Unknown'),
                market_cap=normalized_data.get('market_cap'),
                price=normalized_data.get('price'),
                pe_ratio=normalized_data.get('pe_ratio'),
                ev_ebitda=normalized_data.get('ev_ebitda'),
                revenue=normalized_data.get('revenue'),
                net_income=normalized_data.get('net_income'),
                total_assets=normalized_data.get('total_assets'),
                total_debt=normalized_data.get('total_debt'),
                free_cash_flow=normalized_data.get('free_cash_flow'),
                raw_api_data=current_raw_response  # 附加原始API數據
            )
            
            logger.info(f"成功獲取 {stock_data.company_name} 數據")
            return stock_data
            
        except Exception as e:
            logger.error(f"Yahoo Finance 獲取 {symbol} 數據失敗: {e}")
            return None
    
    def fetch_comparable_companies(self, target_symbol: str, sector: str, 
                                 max_companies: int = 10) -> List[CompanyComparable]:
        """
        獲取可比公司數據
        
        注意：Yahoo Finance 沒有直接的行業篩選功能，
        這裡使用預定義的同行業股票列表
        """
        try:
            # 預定義的行業股票映射
            sector_companies = self._get_sector_companies(sector)
            
            # 過濾掉目標公司並限制數量
            comparable_symbols = [s for s in sector_companies if s.upper() != target_symbol.upper()]
            comparable_symbols = comparable_symbols[:max_companies]
            
            comparables = []
            for symbol in comparable_symbols:
                try:
                    stock_data = self.fetch_stock_data(symbol)
                    if stock_data:
                        metrics = ValuationMetrics(
                            pe_ratio=stock_data.pe_ratio,
                            ev_ebitda=stock_data.ev_ebitda,
                            pb_ratio=None,  # Yahoo Finance 有 priceToBook，可以添加
                            ps_ratio=None,  # 可以從 priceToSalesTrailing12Months 計算
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
            
            logger.info(f"從 Yahoo Finance 獲取 {len(comparables)} 家可比公司數據")
            return comparables
            
        except Exception as e:
            logger.error(f"獲取可比公司失敗: {e}")
            return []
    
    def _get_sector_companies(self, sector: str) -> List[str]:
        """獲取行業內的主要公司列表"""
        sector_mapping = {
            "Technology": [
                "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "ORCL", 
                "CRM", "ADBE", "INTC", "CSCO", "IBM", "QCOM", "TXN"
            ],
            "Healthcare": [
                "JNJ", "PFE", "ABBV", "MRK", "TMO", "ABT", "ISRG", 
                "DHR", "BMY", "AMGN", "GILD", "VRTX", "REGN"
            ],
            "Financial": [
                "JPM", "BAC", "WFC", "GS", "MS", "C", "AXP", 
                "BLK", "SCHW", "USB", "TFC", "PNC"
            ],
            "Consumer": [
                "AMZN", "TSLA", "HD", "WMT", "PG", "KO", "PEP", 
                "NKE", "MCD", "SBUX", "TGT", "LOW"
            ],
            "Energy": [
                "XOM", "CVX", "COP", "EOG", "SLB", "MPC", "VLO", 
                "PSX", "KMI", "OKE", "WMB", "EPD"
            ],
            "Industrial": [
                "BA", "CAT", "GE", "MMM", "HON", "UPS", "LMT", 
                "RTX", "DE", "FDX", "EMR", "ETN"
            ],
            "Utilities": [
                "NEE", "SO", "DUK", "AEP", "EXC", "XEL", "PEG", 
                "SRE", "PPL", "ES", "AWK", "ATO"
            ],
            "Real Estate": [
                "AMT", "PLD", "CCI", "EQIX", "WELL", "DLR", "PSA", 
                "O", "CBRE", "AVB", "EQR", "ESS"
            ],
            "Materials": [
                "LIN", "APD", "SHW", "FCX", "NEM", "DOW", "DD", 
                "PPG", "ECL", "IFF", "MLM", "VMC"
            ]
        }
        
        return sector_mapping.get(sector, sector_mapping["Technology"])
    
    def _safe_float(self, value: Any) -> Optional[float]:
        """安全地轉換為浮點數"""
        try:
            if value is None or value == "N/A":
                return None
            return float(value)
        except (ValueError, TypeError):
            return None
    
    def validate_symbol(self, symbol: str) -> bool:
        """驗證股票代號格式
        
        Yahoo Finance 支援全球股票：
        - 美股: AAPL, MSFT, GOOGL
        - 台股: 2330.TW, 2454.TW
        - 港股: 0700.HK, 0941.HK
        - 中股 ADR: BABA, JD, BIDU
        """
        if not symbol or not isinstance(symbol, str):
            return False
        
        clean_symbol = symbol.upper().strip()
        
        # 基本長度檢查 (包含交易所後綴)
        if len(clean_symbol) < 1 or len(clean_symbol) > 15:
            return False
        
        # 允許字母數字和常見的格式（如 BRK.A, 2330.TW, 0700.HK）
        return clean_symbol.replace(".", "").replace("-", "").isalnum()
    
    def get_supported_symbols(self) -> List[str]:
        """獲取支援的股票代號列表
        
        注意：Yahoo Finance 支援全球股票：
        - 美股: AAPL, MSFT 等
        - 台股: 2330.TW (台積電), 2454.TW (聯發科) 等
        - 港股: 0700.HK (騰訊), 0941.HK (中國移動) 等
        - 中股 ADR: BABA (阿里巴巴), JD (京東) 等
        
        以下為熱門股票示例，實際上可以輸入任何有效的股票代號
        """
        return [
            # 美股
            "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA",
            "JPM", "JNJ", "PFE", "WMT", "PG", "HD", "DIS", "NFLX",
            "CRM", "ORCL", "INTC", "CSCO", "IBM", "ADBE", "COP",
            "XOM", "CVX", "BA", "CAT", "GE", "MMM", "HON", "UPS",
            # 台股示例
            "2330.TW", "2454.TW", "2317.TW", "1303.TW", "3008.TW",
            # 港股示例
            "0700.HK", "0941.HK", "1299.HK",
            # 中股 ADR
            "BABA", "JD", "BIDU", "NIO", "XPEV"
        ]
    
    def get_market_status(self) -> Dict[str, str]:
        """獲取市場狀態"""
        try:
            now = datetime.now()
            
            # 使用 yfinance 獲取市場狀態（簡化版本）
            is_trading_hours = 9 <= now.hour <= 16
            
            return {
                "US": "9:30-16:00 EST",
                "status": "開盤中" if is_trading_hours else "休市",
                "last_updated": now.isoformat(),
                "data_source": "Yahoo Finance"
            }
            
        except Exception as e:
            logger.error(f"獲取市場狀態失敗: {e}")
            return {
                "status": "未知",
                "error": str(e)
            }
    
    def get_raw_api_response(self) -> Dict[str, Any]:
        """獲取最新的原始API響應數據"""
        return self.raw_api_response or {}
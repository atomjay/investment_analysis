"""
Data Normalizer - 數據標準化器
Ensures consistent units and formats across different data sources
"""

import logging
from typing import Dict, Any, Optional, Union
from decimal import Decimal
import re

logger = logging.getLogger(__name__)

class DataNormalizer:
    """數據標準化器 - 統一不同數據源的單位和格式"""
    
    def __init__(self):
        self.name = "Data Normalizer"
        
        # 標準單位定義
        self.STANDARD_UNITS = {
            'market_cap': 'USD',           # 市值：美元
            'price': 'USD',                # 股價：美元
            'revenue': 'USD',              # 營收：美元
            'net_income': 'USD',           # 淨利潤：美元
            'total_assets': 'USD',         # 總資產：美元
            'total_debt': 'USD',           # 總債務：美元
            'free_cash_flow': 'USD',       # 自由現金流：美元
            'pe_ratio': 'ratio',           # 市盈率：倍數
            'ev_ebitda': 'ratio',          # EV/EBITDA：倍數
            'pb_ratio': 'ratio',           # 市淨率：倍數
            'ps_ratio': 'ratio',           # 市銷率：倍數
        }
        
        # 數據源單位映射
        self.DATA_SOURCE_UNITS = {
            'alpha_vantage': {
                'MarketCapitalization': ('market_cap', 'USD', 1),
                'Price': ('price', 'USD', 1),
                'CurrentPrice': ('price', 'USD', 1),
                'RevenueTTM': ('revenue', 'USD', 1),
                'NetIncomeTTM': ('net_income', 'USD', 1),
                'TotalAssets': ('total_assets', 'USD', 1),
                'TotalDebt': ('total_debt', 'USD', 1),
                'OperatingCashflowTTM': ('free_cash_flow', 'USD', 1),
                'PERatio': ('pe_ratio', 'ratio', 1),
                'EVToEBITDA': ('ev_ebitda', 'ratio', 1),
            },
            'fmp': {
                'marketCap': ('market_cap', 'USD', 1),
                'price': ('price', 'USD', 1),
                'revenue': ('revenue', 'USD', 1),
                'netIncome': ('net_income', 'USD', 1),
                'totalAssets': ('total_assets', 'USD', 1),
                'totalDebt': ('total_debt', 'USD', 1),
                'freeCashFlow': ('free_cash_flow', 'USD', 1),
                'peRatio': ('pe_ratio', 'ratio', 1),
                'peRatioTTM': ('pe_ratio', 'ratio', 1),
                'enterpriseValueOverEBITDA': ('ev_ebitda', 'ratio', 1),
                'evToEbitda': ('ev_ebitda', 'ratio', 1),
                'priceToBookRatio': ('pb_ratio', 'ratio', 1),
                'priceToSalesRatio': ('ps_ratio', 'ratio', 1),
            },
            'yahoo_finance': {
                'marketCap': ('market_cap', 'USD', 1),
                'currentPrice': ('price', 'USD', 1),
                'regularMarketPrice': ('price', 'USD', 1),
                'totalRevenue': ('revenue', 'USD', 1),
                'netIncomeToCommon': ('net_income', 'USD', 1),
                'totalAssets': ('total_assets', 'USD', 1),
                'totalDebt': ('total_debt', 'USD', 1),
                'freeCashflow': ('free_cash_flow', 'USD', 1),
                'trailingPE': ('pe_ratio', 'ratio', 1),
                'enterpriseToEbitda': ('ev_ebitda', 'ratio', 1),
                'priceToBook': ('pb_ratio', 'ratio', 1),
                'priceToSalesTrailing12Months': ('ps_ratio', 'ratio', 1),
            }
        }
        
        logger.info("數據標準化器初始化完成")
    
    def normalize_data(self, raw_data: Dict[str, Any], data_source: str) -> Dict[str, Any]:
        """
        標準化來自特定數據源的原始數據
        
        Args:
            raw_data: 原始數據字典
            data_source: 數據源名稱 ('alpha_vantage', 'fmp', 'yahoo_finance')
            
        Returns:
            標準化後的數據字典
        """
        try:
            logger.info(f"開始標準化 {data_source} 數據源的數據")
            
            normalized_data = {}
            source_mapping = self.DATA_SOURCE_UNITS.get(data_source, {})
            
            for raw_key, raw_value in raw_data.items():
                if raw_key in source_mapping:
                    field_name, unit, multiplier = source_mapping[raw_key]
                    
                    # 標準化數值
                    normalized_value = self._normalize_value(
                        raw_value, unit, multiplier, raw_key, data_source
                    )
                    
                    if normalized_value is not None:
                        normalized_data[field_name] = normalized_value
                        logger.debug(f"標準化 {raw_key}: {raw_value} -> {field_name}: {normalized_value}")
            
            # 添加數據源信息
            normalized_data['_data_source'] = data_source
            normalized_data['_normalized_at'] = self._get_timestamp()
            
            logger.info(f"完成 {data_source} 數據標準化，共 {len(normalized_data)} 個字段")
            return normalized_data
            
        except Exception as e:
            logger.error(f"數據標準化失敗: {e}")
            return {}
    
    def _normalize_value(self, value: Any, unit: str, multiplier: float, 
                        field_name: str, data_source: str) -> Optional[float]:
        """標準化單個數值"""
        try:
            if value is None or value == "" or value == "None" or value == "N/A":
                return None
            
            # 處理字符串格式的數字
            if isinstance(value, str):
                # 移除逗號、貨幣符號等
                cleaned_value = re.sub(r'[,$%]', '', value.strip())
                
                # 處理單位後綴 (K, M, B, T)
                cleaned_value = self._parse_unit_suffix(cleaned_value)
                
                if not cleaned_value or cleaned_value in ['N/A', 'None', '-']:
                    return None
                
                try:
                    numeric_value = float(cleaned_value)
                except ValueError:
                    logger.warning(f"無法轉換數值: {field_name}={value} from {data_source}")
                    return None
            else:
                numeric_value = float(value)
            
            # 應用乘數轉換
            normalized_value = numeric_value * multiplier
            
            # 數據合理性檢查
            if not self._is_reasonable_value(normalized_value, field_name):
                logger.warning(f"數值可能異常: {field_name}={normalized_value} from {data_source}")
            
            return normalized_value
            
        except Exception as e:
            logger.error(f"標準化數值失敗 {field_name}={value}: {e}")
            return None
    
    def _parse_unit_suffix(self, value_str: str) -> str:
        """解析帶單位後綴的數值 (如 1.2B -> 1200000000)"""
        try:
            value_str = value_str.strip().upper()
            
            if value_str.endswith('T'):  # Trillion
                return str(float(value_str[:-1]) * 1e12)
            elif value_str.endswith('B'):  # Billion
                return str(float(value_str[:-1]) * 1e9)
            elif value_str.endswith('M'):  # Million
                return str(float(value_str[:-1]) * 1e6)
            elif value_str.endswith('K'):  # Thousand
                return str(float(value_str[:-1]) * 1e3)
            else:
                return value_str
                
        except Exception as e:
            logger.error(f"解析單位後綴失敗: {value_str}, {e}")
            return value_str
    
    def _is_reasonable_value(self, value: float, field_name: str) -> bool:
        """檢查數值是否在合理範圍內"""
        try:
            # 定義合理範圍
            reasonable_ranges = {
                'market_cap': (1e6, 5e12),      # 100萬到5萬億美元
                'price': (0.01, 10000),         # 1分到1萬美元
                'revenue': (0, 1e12),           # 0到1萬億美元
                'net_income': (-1e11, 1e11),    # -1000億到1000億美元
                'total_assets': (0, 5e12),      # 0到5萬億美元
                'total_debt': (0, 2e12),        # 0到2萬億美元
                'free_cash_flow': (-1e11, 1e11), # -1000億到1000億美元
                'pe_ratio': (0, 1000),          # 0到1000倍
                'ev_ebitda': (0, 500),          # 0到500倍
                'pb_ratio': (0, 100),           # 0到100倍
                'ps_ratio': (0, 1000),          # 0到1000倍
            }
            
            if field_name in reasonable_ranges:
                min_val, max_val = reasonable_ranges[field_name]
                return min_val <= value <= max_val
            
            return True  # 未定義範圍的字段默認為合理
            
        except Exception:
            return True
    
    def _get_timestamp(self) -> str:
        """獲取當前時間戳"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def merge_normalized_data(self, *data_sources: Dict[str, Any]) -> Dict[str, Any]:
        """
        合併多個已標準化的數據源
        
        Args:
            *data_sources: 多個標準化數據字典
            
        Returns:
            合併後的數據字典
        """
        try:
            merged_data = {}
            source_priority = ['alpha_vantage', 'fmp', 'yahoo_finance']  # 數據源優先級
            
            # 按優先級合併數據
            for source_name in source_priority:
                for data_dict in data_sources:
                    if data_dict.get('_data_source') == source_name:
                        for key, value in data_dict.items():
                            if not key.startswith('_') and value is not None:
                                # 只有當前沒有該字段或當前字段為None時才覆蓋
                                if key not in merged_data or merged_data[key] is None:
                                    merged_data[key] = value
                                    logger.debug(f"合併字段 {key}: {value} (來源: {source_name})")
            
            # 添加合併信息
            merged_data['_merged_sources'] = [
                d.get('_data_source') for d in data_sources 
                if d.get('_data_source')
            ]
            merged_data['_merged_at'] = self._get_timestamp()
            
            logger.info(f"完成數據合併，共 {len([k for k in merged_data.keys() if not k.startswith('_')])} 個有效字段")
            return merged_data
            
        except Exception as e:
            logger.error(f"數據合併失敗: {e}")
            return {}
    
    def validate_critical_fields(self, data: Dict[str, Any]) -> Dict[str, bool]:
        """
        驗證關鍵字段是否存在且合理
        
        Returns:
            驗證結果字典
        """
        critical_fields = {
            'market_cap': data.get('market_cap'),
            'price': data.get('price'),
            'revenue': data.get('revenue'),
            'net_income': data.get('net_income'),
        }
        
        validation_results = {}
        
        for field, value in critical_fields.items():
            is_valid = (
                value is not None and 
                isinstance(value, (int, float)) and 
                value > 0 and
                self._is_reasonable_value(value, field)
            )
            validation_results[field] = is_valid
            
            if not is_valid:
                logger.warning(f"關鍵字段 {field} 驗證失敗: {value}")
        
        return validation_results
    
    def get_data_completeness_score(self, data: Dict[str, Any]) -> float:
        """
        計算數據完整性評分 (0-1)
        
        Returns:
            完整性評分
        """
        try:
            required_fields = [
                'market_cap', 'price', 'revenue', 'net_income',
                'total_assets', 'pe_ratio', 'ev_ebitda'
            ]
            
            valid_fields = 0
            for field in required_fields:
                value = data.get(field)
                if value is not None and isinstance(value, (int, float)) and value > 0:
                    valid_fields += 1
            
            completeness_score = valid_fields / len(required_fields)
            logger.info(f"數據完整性評分: {completeness_score:.2f} ({valid_fields}/{len(required_fields)})")
            
            return completeness_score
            
        except Exception as e:
            logger.error(f"計算數據完整性評分失敗: {e}")
            return 0.0
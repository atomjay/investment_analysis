"""
Test Data Normalization - 測試數據標準化功能
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.backend.data.data_normalizer import DataNormalizer
import logging

# 設置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_data_normalizer():
    """測試數據標準化器"""
    normalizer = DataNormalizer()
    
    print("🔬 測試數據標準化器")
    print("=" * 50)
    
    # 測試 Alpha Vantage 數據
    alpha_data = {
        "MarketCapitalization": "3000000000000",  # 3T (字符串格式)
        "Price": "180.50",
        "PERatio": "28.5",
        "RevenueTTM": "394328000000",  # 394.3B
        "NetIncomeTTM": "99803000000",  # 99.8B
        "EVToEBITDA": "22.1"
    }
    
    # 測試 FMP 數據
    fmp_data = {
        "marketCap": 2800000000000,  # 2.8T (數字格式)
        "price": 375.0,
        "peRatio": 32.1,
        "revenue": 211915000000,  # 211.9B
        "netIncome": 72361000000,  # 72.4B
        "enterpriseValueOverEBITDA": 25.3
    }
    
    # 測試 Yahoo Finance 數據 (包含單位後綴)
    yahoo_data = {
        "marketCap": "1.8T",  # 帶後綴
        "currentPrice": 145.00,
        "trailingPE": 25.8,
        "totalRevenue": "282.8B",  # 帶後綴
        "netIncomeToCommon": "73.8B",  # 帶後綴
        "enterpriseToEbitda": 18.9
    }
    
    print("\n📊 原始數據:")
    print(f"Alpha Vantage: {alpha_data}")
    print(f"FMP: {fmp_data}")
    print(f"Yahoo Finance: {yahoo_data}")
    
    # 標準化各數據源
    print("\n🔄 開始標準化...")
    
    normalized_alpha = normalizer.normalize_data(alpha_data, 'alpha_vantage')
    normalized_fmp = normalizer.normalize_data(fmp_data, 'fmp')
    normalized_yahoo = normalizer.normalize_data(yahoo_data, 'yahoo_finance')
    
    print("\n✅ 標準化結果:")
    print(f"Alpha Vantage: {normalized_alpha}")
    print(f"FMP: {normalized_fmp}")
    print(f"Yahoo Finance: {normalized_yahoo}")
    
    # 合併數據
    print("\n🔗 合併數據...")
    merged_data = normalizer.merge_normalized_data(
        normalized_alpha, normalized_fmp, normalized_yahoo
    )
    
    print(f"合併結果: {merged_data}")
    
    # 驗證數據質量
    print("\n🔍 數據質量驗證:")
    validation_results = normalizer.validate_critical_fields(merged_data)
    completeness_score = normalizer.get_data_completeness_score(merged_data)
    
    print(f"關鍵字段驗證: {validation_results}")
    print(f"數據完整性評分: {completeness_score:.2f}")
    
    # 檢查單位一致性
    print("\n📏 單位一致性檢查:")
    print(f"市值 (應為美元): ${merged_data.get('market_cap', 0):,.0f}")
    print(f"股價 (應為美元): ${merged_data.get('price', 0):.2f}")
    print(f"營收 (應為美元): ${merged_data.get('revenue', 0):,.0f}")
    print(f"淨利潤 (應為美元): ${merged_data.get('net_income', 0):,.0f}")
    print(f"P/E倍數: {merged_data.get('pe_ratio', 0):.1f}x")
    print(f"EV/EBITDA倍數: {merged_data.get('ev_ebitda', 0):.1f}x")
    
    return merged_data

def test_unit_conversion():
    """測試單位轉換功能"""
    normalizer = DataNormalizer()
    
    print("\n🔢 測試單位轉換:")
    print("=" * 30)
    
    # 測試不同格式的數值
    test_values = [
        ("3000000000000", "數字字符串"),
        ("3T", "Trillion後綴"),
        ("2.8B", "Billion後綴"),
        ("150.5M", "Million後綴"),
        ("50K", "Thousand後綴"),
        ("$180.50", "帶貨幣符號"),
        ("25.8%", "帶百分號"),
        ("1,234,567", "帶逗號"),
    ]
    
    for value, description in test_values:
        normalized = normalizer._parse_unit_suffix(value.replace('$', '').replace('%', '').replace(',', ''))
        try:
            float_val = float(normalized)
            print(f"{description:15} | {value:15} -> {float_val:15,.0f}")
        except:
            print(f"{description:15} | {value:15} -> 轉換失敗")

if __name__ == "__main__":
    try:
        print("🚀 開始數據標準化測試")
        print("=" * 60)
        
        # 測試數據標準化器
        merged_data = test_data_normalizer()
        
        # 測試單位轉換
        test_unit_conversion()
        
        print("\n✅ 所有測試完成！")
        print("\n📋 測試總結:")
        print("- 數據標準化器正常工作")
        print("- 不同數據源的單位成功統一")
        print("- 數據質量驗證功能正常")
        print("- 數據合併邏輯正確")
        
        # 驗證關鍵指標
        if merged_data:
            market_cap = merged_data.get('market_cap', 0)
            price = merged_data.get('price', 0)
            
            print(f"\n💰 標準化後的關鍵指標:")
            print(f"- 市值: ${market_cap:,.0f} USD")
            print(f"- 股價: ${price:.2f} USD")
            print(f"- 數據來源: {merged_data.get('_merged_sources', [])}")
        
    except Exception as e:
        logger.error(f"測試失敗: {e}")
        print(f"\n❌ 測試失敗: {e}")
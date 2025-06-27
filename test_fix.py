#!/usr/bin/env python3
"""
測試CCA和DCF修復結果
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.backend.analysis_engine import AnalysisEngine

def test_cca_dcf_fixes():
    """測試CCA和DCF修復結果"""
    print("🔧 測試CCA和DCF計算修復...")
    
    try:
        engine = AnalysisEngine(use_real_data=True)
        result = engine.analyze_stock('AAPL')
        
        if not result or not result.valuation_results:
            print("❌ 無法獲取分析結果")
            return False
            
        # 測試CCA修復
        cca_result = None
        dcf_result = None
        
        for val in result.valuation_results:
            if val.method.value == 'comparable_companies_analysis':
                cca_result = val
            elif val.method.value == 'discounted_cash_flow':
                dcf_result = val
        
        # 驗證CCA修復
        if cca_result:
            print("\n=== CCA估值結果修復驗證 ===")
            print(f"目標價格: ${cca_result.target_price:.2f}")
            print(f"當前價格: ${cca_result.current_price:.2f}")
            print(f"上漲潛力: {cca_result.upside_potential:.1f}%")
            
            if cca_result.calculation_details:
                calc = cca_result.calculation_details.get('valuation_calculations', {})
                weighted_calc = calc.get('weighted_calculation', [])
                total_weight = calc.get('total_normalized_weight', 0)
                
                print(f"\n=== 權重計算驗證 ===")
                print(f"總權重: {total_weight:.1%}")
                
                nan_found = False
                for item in weighted_calc:
                    method = item.get('method', 'Unknown')
                    price = item.get('target_price', 0)
                    weight = item.get('normalized_weight', 0)
                    contribution = item.get('contribution', 0)
                    
                    # 檢查NaN
                    if weight != weight or price != price:  # NaN檢查
                        print(f"❌ NaN發現: {method} - price:{price}, weight:{weight}")
                        nan_found = True
                    else:
                        print(f"✅ {method}: ${price:.2f} × {weight:.1%} = ${contribution:.2f}")
                
                if not nan_found:
                    print("✅ CCA權重計算修復成功！")
                else:
                    print("❌ CCA仍有NaN問題")
                    
                final_price = calc.get('final_weighted_price', 0)
                print(f"最終加權價格: ${final_price:.2f}")
            else:
                print("❌ 缺少CCA計算詳情")
        else:
            print("❌ 未找到CCA分析結果")
        
        # 驗證DCF修復
        if dcf_result:
            print("\n=== DCF估值結果驗證 ===")
            print(f"目標價格: ${dcf_result.target_price:.2f}")
            
            if dcf_result.calculation_details:
                projections = dcf_result.calculation_details.get('projected_cash_flows', {}).get('projections', [])
                print(f"\n=== 年度現金流預測 (共{len(projections)}年) ===")
                
                for proj in projections:
                    year = proj.get('year', 0)
                    fcf = proj.get('free_cash_flow', 0)
                    pv = proj.get('present_value', 0)
                    print(f"Year {year}: FCF=${fcf/1e6:.0f}M (PV=${pv/1e6:.0f}M)")
                
                if len(projections) == 5:
                    print("✅ DCF年份修復成功 - 顯示5年預測")
                else:
                    print(f"❌ DCF年份錯誤 - 應為5年，實際{len(projections)}年")
                
                wacc_info = dcf_result.calculation_details.get('wacc_calculation', {})
                wacc = wacc_info.get('wacc', 0)
                net_debt = wacc_info.get('components', {}).get('net_debt', 0)
                
                print(f"\nWACC: {wacc:.1%}")
                print(f"淨債務: ${net_debt/1e9:.1f}B")
                print(f"計算說明: {wacc_info.get('calculation_note', '')}")
                
                if 'net_debt' in wacc_info.get('components', {}):
                    print("✅ DCF淨債務計算修復成功")
                else:
                    print("❌ DCF淨債務計算未更新")
            else:
                print("❌ 缺少DCF計算詳情")
        else:
            print("❌ 未找到DCF分析結果")
            
        return True
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_cca_dcf_fixes()
"""
Comparable Companies Analysis (CCA) - 相對估值法
Implementation of relative valuation methodology
"""

import statistics
from typing import List, Dict, Optional
from dataclasses import dataclass

from ...shared.types import (
    StockData, ValuationResult, ValuationMethod, 
    CompanyComparable, ValuationMetrics
)
from ...shared.constants import PE_BENCHMARKS, EV_EBITDA_BENCHMARKS

class CCAAnalyzer:
    """相對估值法分析器"""
    
    def __init__(self):
        self.name = "Comparable Companies Analysis"
        self.description = "相對估值法：通過比較同業公司的估值倍數來評估目標公司價值"
    
    def analyze(self, target_stock: StockData, comparables: List[CompanyComparable]) -> ValuationResult:
        """
        執行相對估值分析
        
        Args:
            target_stock: 目標股票數據
            comparables: 可比公司列表
            
        Returns:
            ValuationResult: 估值結果
        """
        if len(comparables) < 3:
            raise ValueError("至少需要3家可比公司進行分析")
        
        # 計算同業估值倍數統計
        peer_multiples = self._calculate_peer_multiples(comparables)
        
        # 根據不同倍數計算目標價格
        target_prices = self._calculate_target_prices(target_stock, peer_multiples)
        
        # 計算加權平均目標價格
        weighted_target_price = self._calculate_weighted_target_price(target_prices)
        
        # 計算上漲潛力
        upside_potential = ((weighted_target_price - target_stock.price) / target_stock.price) * 100
        
        # 評估信心水平
        confidence_level = self._assess_confidence_level(target_stock, comparables, peer_multiples)
        
        # 生成詳細分析
        detailed_analysis = self._generate_detailed_analysis(
            target_stock, comparables, peer_multiples, target_prices
        )
        
        # 準備詳細計算數據
        calculation_details = {
            "peer_multiples_analysis": {
                "peer_count": len(comparables),
                "pe_statistics": {
                    "median": peer_multiples.get("pe_median", 0),
                    "mean": peer_multiples.get("pe_mean", 0),
                    "75th_percentile": peer_multiples.get("pe_75th", 0),
                    "25th_percentile": peer_multiples.get("pe_25th", 0)
                } if "pe_median" in peer_multiples else None,
                "ev_ebitda_statistics": {
                    "median": peer_multiples.get("ev_ebitda_median", 0),
                    "mean": peer_multiples.get("ev_ebitda_mean", 0),
                    "75th_percentile": peer_multiples.get("ev_ebitda_75th", 0),
                    "25th_percentile": peer_multiples.get("ev_ebitda_25th", 0)
                } if "ev_ebitda_median" in peer_multiples else None
            },
            "target_company_metrics": {
                "eps": target_stock.eps if target_stock.eps else (target_stock.net_income / (target_stock.market_cap / target_stock.price) if target_stock.net_income else None),
                "eps_source": "數據源提供 (Trailing EPS)" if target_stock.eps else "計算值 (淨利潤/股數)",
                "actual_ebitda": target_stock.ebitda if hasattr(target_stock, 'ebitda') and target_stock.ebitda else None,
                "estimated_ebitda": target_stock.revenue * 0.2 if target_stock.revenue else None,
                "book_value_per_share": target_stock.book_value_per_share if hasattr(target_stock, 'book_value_per_share') and target_stock.book_value_per_share else ((target_stock.total_assets - (target_stock.total_debt or 0)) / (target_stock.market_cap / target_stock.price) if target_stock.total_assets else None)
            },
            "valuation_calculations": {
                "method_prices": target_prices,
                "weights": {
                    "pe_based": 0.5,
                    "ev_ebitda_based": 0.3,
                    "pb_based": 0.2
                },
                "weighted_calculation": []
            }
        }
        
        # 填充加權計算詳情 - 使用與_calculate_weighted_target_price相同的邏輯
        default_weights = {"pe_based": 0.5, "ev_ebitda_based": 0.3, "pb_based": 0.2}
        
        # 獲取適用的權重 - 只包含有效價格的方法
        applicable_weights = {}
        valid_methods = []
        
        for method, price in target_prices.items():
            # 檢查價格是否有效（不是0、NaN或None）
            if price and price > 0 and not (isinstance(price, float) and (price != price)):
                valid_methods.append(method)
                if method in default_weights:
                    applicable_weights[method] = default_weights[method]
        
        # 標準化權重確保總和為100%
        if applicable_weights:
            total_default_weight = sum(applicable_weights.values())
            if total_default_weight > 0:
                normalized_weights = {method: weight / total_default_weight 
                                    for method, weight in applicable_weights.items()}
            else:
                # 如果權重總和為0，平均分配
                normalized_weights = {method: 1.0 / len(valid_methods) 
                                    for method in valid_methods}
        else:
            # 如果沒有預設權重的方法，平均分配有效方法的權重
            if valid_methods:
                normalized_weights = {method: 1.0 / len(valid_methods) 
                                    for method in valid_methods}
            else:
                normalized_weights = {}
        
        # 填充計算詳情
        final_weighted_sum = 0.0
        for method, price in target_prices.items():
            if method in normalized_weights and price > 0:
                weight = normalized_weights[method]
                contribution = price * weight
                final_weighted_sum += contribution
                
                # 計算EV/EBITDA的詳細步驟記錄
                if method == "ev_ebitda_based":
                    # 使用與主計算相同的EBITDA邏輯
                    if hasattr(target_stock, 'ebitda') and target_stock.ebitda:
                        used_ebitda = target_stock.ebitda
                        ebitda_source = "實際EBITDA數據"
                    elif target_stock.revenue:
                        used_ebitda = target_stock.revenue * 0.2
                        ebitda_source = "估算EBITDA (Revenue × 20%)"
                    else:
                        used_ebitda = None
                        ebitda_source = "無EBITDA數據"
                    
                    if used_ebitda:
                        ev_multiple = peer_multiples.get("ev_ebitda_median", 0)
                        implied_ev = used_ebitda * ev_multiple
                        total_debt = target_stock.total_debt or 0
                        total_cash = target_stock.total_cash or 0
                        net_debt = total_debt - total_cash
                        implied_equity = implied_ev - net_debt
                        shares_outstanding = target_stock.market_cap / target_stock.price
                        
                        ev_calculation_steps = {
                            "ebitda_used": used_ebitda,
                            "ebitda_source": ebitda_source,
                            "ev_ebitda_multiple": ev_multiple,
                            "implied_enterprise_value": implied_ev,
                            "total_debt": total_debt,
                            "total_cash": total_cash,
                            "net_debt": net_debt,
                            "implied_equity_value": implied_equity,
                            "shares_outstanding": shares_outstanding,
                            "price_per_share": price
                        }
                    else:
                        ev_calculation_steps = None
                else:
                    ev_calculation_steps = None
                
                calculation_details["valuation_calculations"]["weighted_calculation"].append({
                    "method": method,
                    "target_price": price,
                    "normalized_weight": weight,
                    "original_weight": default_weights.get(method, 1.0 / len(target_prices)),
                    "contribution": contribution,
                    "multiple_used": peer_multiples.get(method.replace("_based", "_median"), "N/A"),
                    "ev_calculation_details": ev_calculation_steps
                })
        
        calculation_details["valuation_calculations"]["final_weighted_price"] = final_weighted_sum
        calculation_details["valuation_calculations"]["total_normalized_weight"] = sum(normalized_weights.values())

        return ValuationResult(
            method=ValuationMethod.CCA,
            target_price=weighted_target_price,
            current_price=target_stock.price,
            upside_potential=upside_potential,
            confidence_level=confidence_level,
            assumptions={
                "peer_count": len(comparables),
                "median_pe": peer_multiples.get("pe_median", 0),
                "median_ev_ebitda": peer_multiples.get("ev_ebitda_median", 0),
                "sector": target_stock.sector
            },
            detailed_analysis=detailed_analysis,
            calculation_details=calculation_details,
            raw_data_sources={
                "comparable_companies": [
                    {
                        "symbol": comp.symbol,
                        "company_name": comp.company_name,
                        "market_cap": comp.market_cap,
                        "pe_ratio": comp.metrics.pe_ratio,
                        "ev_ebitda": comp.metrics.ev_ebitda,
                        "pb_ratio": comp.metrics.pb_ratio
                    } for comp in comparables
                ],
                "target_company_data": {
                    "symbol": target_stock.symbol,
                    "market_cap": target_stock.market_cap,
                    "revenue": target_stock.revenue,
                    "net_income": target_stock.net_income,
                    "total_assets": target_stock.total_assets
                },
                "data_sources": ["Yahoo Finance", "Alpha Vantage", "FMP"],
                "calculation_engine": "CapitalCore CCA Analyzer v1.0"
            }
        )
    
    def _calculate_peer_multiples(self, comparables: List[CompanyComparable]) -> Dict[str, float]:
        """計算同業估值倍數統計"""
        pe_ratios = [comp.metrics.pe_ratio for comp in comparables if comp.metrics.pe_ratio]
        ev_ebitda_ratios = [comp.metrics.ev_ebitda for comp in comparables if comp.metrics.ev_ebitda]
        pb_ratios = [comp.metrics.pb_ratio for comp in comparables if comp.metrics.pb_ratio]
        ps_ratios = [comp.metrics.ps_ratio for comp in comparables if comp.metrics.ps_ratio]
        
        multiples = {}
        
        if pe_ratios:
            multiples.update({
                "pe_median": statistics.median(pe_ratios),
                "pe_mean": statistics.mean(pe_ratios),
                "pe_75th": statistics.quantiles(pe_ratios, n=4)[2] if len(pe_ratios) > 3 else max(pe_ratios),
                "pe_25th": statistics.quantiles(pe_ratios, n=4)[0] if len(pe_ratios) > 3 else min(pe_ratios)
            })
        
        if ev_ebitda_ratios:
            multiples.update({
                "ev_ebitda_median": statistics.median(ev_ebitda_ratios),
                "ev_ebitda_mean": statistics.mean(ev_ebitda_ratios),
                "ev_ebitda_75th": statistics.quantiles(ev_ebitda_ratios, n=4)[2] if len(ev_ebitda_ratios) > 3 else max(ev_ebitda_ratios),
                "ev_ebitda_25th": statistics.quantiles(ev_ebitda_ratios, n=4)[0] if len(ev_ebitda_ratios) > 3 else min(ev_ebitda_ratios)
            })
        
        if pb_ratios:
            multiples.update({
                "pb_median": statistics.median(pb_ratios),
                "pb_mean": statistics.mean(pb_ratios)
            })
        
        if ps_ratios:
            multiples.update({
                "ps_median": statistics.median(ps_ratios),
                "ps_mean": statistics.mean(ps_ratios)
            })
        
        return multiples
    
    def _calculate_target_prices(self, target_stock: StockData, peer_multiples: Dict[str, float]) -> Dict[str, float]:
        """根據不同倍數計算目標價格"""
        target_prices = {}
        
        # 基於P/E倍數的目標價格
        if "pe_median" in peer_multiples:
            # 優先使用數據源提供的EPS，如果沒有則計算
            if target_stock.eps:
                eps = target_stock.eps
            elif target_stock.net_income:
                eps = target_stock.net_income / (target_stock.market_cap / target_stock.price)
            else:
                eps = None
            
            if eps:
                target_prices["pe_based"] = eps * peer_multiples["pe_median"]
        
        # 基於EV/EBITDA倍數的目標價格
        if "ev_ebitda_median" in peer_multiples:
            # 步驟1: 使用實際EBITDA，若無則估算
            if hasattr(target_stock, 'ebitda') and target_stock.ebitda:
                # 優先使用真實EBITDA數據
                actual_ebitda = target_stock.ebitda
                ebitda_source = "實際EBITDA數據"
            elif target_stock.revenue:
                # 備用：估算EBITDA (使用20%的EBITDA Margin作為行業平均)
                actual_ebitda = target_stock.revenue * 0.2
                ebitda_source = "估算EBITDA (Revenue × 20%)"
            else:
                actual_ebitda = None
                ebitda_source = "無EBITDA數據"
            
            if actual_ebitda:
                # 步驟2: 計算隱含企業價值 (EV = EBITDA × EV/EBITDA倍數)
                implied_enterprise_value = actual_ebitda * peer_multiples["ev_ebitda_median"]
                
                # 步驟3: 轉換為股權價值 (Equity Value = EV - Net Debt)
                # Net Debt = Total Debt - Total Cash (正確的企業估值公式)
                total_debt = target_stock.total_debt or 0
                total_cash = target_stock.total_cash or 0
                net_debt = total_debt - total_cash
                implied_equity_value = implied_enterprise_value - net_debt
                
                # 步驟4: 計算每股價格 (Price per Share = Equity Value / Shares Outstanding)
                shares_outstanding = target_stock.market_cap / target_stock.price
                target_prices["ev_ebitda_based"] = implied_equity_value / shares_outstanding
        
        # 基於P/B倍數的目標價格
        if "pb_median" in peer_multiples and target_stock.total_assets:
            # 簡化：假設賬面價值 = 總資產 - 總負債
            book_value = target_stock.total_assets - (target_stock.total_debt or 0)
            bvps = book_value / (target_stock.market_cap / target_stock.price)
            target_prices["pb_based"] = bvps * peer_multiples["pb_median"]
        
        return target_prices
    
    def _calculate_weighted_target_price(self, target_prices: Dict[str, float]) -> float:
        """計算加權平均目標價格"""
        if not target_prices:
            return 0.0
        
        # 預設權重：P/E倍數權重最高
        default_weights = {
            "pe_based": 0.5,
            "ev_ebitda_based": 0.3,
            "pb_based": 0.2
        }
        
        # 只使用有效的估值方法權重
        applicable_weights = {}
        valid_methods = []
        
        for method, price in target_prices.items():
            # 檢查價格是否有效（不是0、NaN或None）
            if price and price > 0 and not (isinstance(price, float) and (price != price)):
                valid_methods.append(method)
                if method in default_weights:
                    applicable_weights[method] = default_weights[method]
        
        # 重新標準化權重，確保總和為100%
        if applicable_weights:
            total_default_weight = sum(applicable_weights.values())
            if total_default_weight > 0:
                normalized_weights = {method: weight / total_default_weight 
                                    for method, weight in applicable_weights.items()}
            else:
                # 如果權重總和為0，平均分配
                normalized_weights = {method: 1.0 / len(valid_methods) 
                                    for method in valid_methods}
        else:
            # 如果沒有預設權重的方法，平均分配有效方法的權重
            if valid_methods:
                normalized_weights = {method: 1.0 / len(valid_methods) 
                                    for method in valid_methods}
            else:
                normalized_weights = {}
        
        # 計算加權平均
        weighted_sum = 0.0
        for method, price in target_prices.items():
            if method in normalized_weights and price > 0:
                weighted_sum += price * normalized_weights[method]
        
        return weighted_sum if normalized_weights else statistics.mean([p for p in target_prices.values() if p > 0])
    
    def _assess_confidence_level(self, target_stock: StockData, comparables: List[CompanyComparable], 
                               peer_multiples: Dict[str, float]) -> float:
        """
        評估分析的信心水平 - 採用評分卡機制
        基於估值範圍窄度和多因子加權評分
        """
        # 評分卡機制 - 總分100分
        total_score = 0
        
        # 1. 可比公司數量 (0-20分)
        peer_count = len(comparables)
        if peer_count >= 10:
            peer_score = 20
        elif peer_count >= 7:
            peer_score = 16
        elif peer_count >= 5:
            peer_score = 12
        elif peer_count >= 3:
            peer_score = 8
        else:
            peer_score = 4
        total_score += peer_score
        
        # 2. 倍數分散度 (0-20分) - 基於估值範圍窄度
        range_score = 0
        if "pe_median" in peer_multiples:
            pe_ratios = [comp.metrics.pe_ratio for comp in comparables if comp.metrics.pe_ratio]
            if len(pe_ratios) > 1:
                pe_min, pe_max = min(pe_ratios), max(pe_ratios)
                pe_median = peer_multiples["pe_median"]
                
                # 計算目標價範圍
                current_price = target_stock.price
                target_price_min = current_price * pe_min / target_stock.pe_ratio if target_stock.pe_ratio else current_price
                target_price_max = current_price * pe_max / target_stock.pe_ratio if target_stock.pe_ratio else current_price
                target_price_median = current_price * pe_median / target_stock.pe_ratio if target_stock.pe_ratio else current_price
                
                # 範圍窄度評分 - 範圍越窄信心越高
                if target_price_median > 0:
                    price_range_ratio = (target_price_max - target_price_min) / target_price_median
                    if price_range_ratio <= 0.1:  # 範圍在10%以內
                        range_score = 20
                    elif price_range_ratio <= 0.2:  # 範圍在20%以內
                        range_score = 16
                    elif price_range_ratio <= 0.3:  # 範圍在30%以內
                        range_score = 12
                    elif price_range_ratio <= 0.5:  # 範圍在50%以內
                        range_score = 8
                    else:
                        range_score = 4
        total_score += range_score
        
        # 3. 數據完整性 (0-15分)
        data_items = [
            target_stock.pe_ratio,
            target_stock.revenue,
            target_stock.net_income,
            target_stock.total_assets,
            target_stock.market_cap
        ]
        data_completeness = sum(1 for item in data_items if item is not None and item != 0)
        data_score = (data_completeness / len(data_items)) * 15
        total_score += data_score
        
        # 4. 行業穩定性 (0-15分) - 基於行業類型
        sector_stability_map = {
            "Consumer Staples": 15,      # 消費必需品 - 高穩定性
            "Utilities": 14,             # 公用事業
            "Healthcare": 13,            # 醫療保健
            "Industrials": 12,           # 工業
            "Consumer Discretionary": 10, # 消費可選
            "Financial Services": 9,     # 金融服務
            "Materials": 8,              # 原材料
            "Technology": 7,             # 科技 - 高波動性
            "Energy": 6,                 # 能源
            "Real Estate": 8             # 房地產
        }
        sector_score = sector_stability_map.get(target_stock.sector, 10)  # 默認10分
        total_score += sector_score
        
        # 5. 市場環境一致性 (0-15分)
        # 基於目標公司與可比公司的規模匹配度
        market_cap_score = 0
        if target_stock.market_cap and comparables:
            comparable_market_caps = [comp.metrics.market_cap for comp in comparables 
                                    if comp.metrics.market_cap]
            if comparable_market_caps:
                avg_comparable_cap = statistics.mean(comparable_market_caps)
                size_ratio = min(target_stock.market_cap / avg_comparable_cap, 
                               avg_comparable_cap / target_stock.market_cap)
                
                if size_ratio >= 0.8:      # 規模匹配度80%以上
                    market_cap_score = 15
                elif size_ratio >= 0.6:    # 規模匹配度60%以上
                    market_cap_score = 12
                elif size_ratio >= 0.4:    # 規模匹配度40%以上
                    market_cap_score = 8
                else:
                    market_cap_score = 4
        total_score += market_cap_score
        
        # 6. 分析方法可靠性 (0-15分) - CCA方法本身的可靠性
        method_reliability_score = 12  # CCA是相對成熟的估值方法
        total_score += method_reliability_score
        
        # 將總分轉換為信心水平 (0-1)
        confidence_level = min(total_score / 100.0, 1.0)
        
        return confidence_level
    
    def _generate_detailed_analysis(self, target_stock: StockData, comparables: List[CompanyComparable],
                                  peer_multiples: Dict[str, float], target_prices: Dict[str, float]) -> str:
        """生成詳細分析報告"""
        analysis = f"""
相對估值法 (CCA) 分析報告 - {target_stock.company_name} ({target_stock.symbol})

=== 分析概述 ===
• 分析方法：比較同業公司估值倍數
• 可比公司數量：{len(comparables)}家
• 主要行業：{target_stock.sector}

=== 同業估值倍數統計 ===
"""
        
        if "pe_median" in peer_multiples:
            analysis += f"• P/E倍數中位數：{peer_multiples['pe_median']:.1f}x\n"
            analysis += f"• P/E倍數平均值：{peer_multiples['pe_mean']:.1f}x\n"
        
        if "ev_ebitda_median" in peer_multiples:
            analysis += f"• EV/EBITDA中位數：{peer_multiples['ev_ebitda_median']:.1f}x\n"
            analysis += f"• EV/EBITDA平均值：{peer_multiples['ev_ebitda_mean']:.1f}x\n"
        
        analysis += "\n=== 目標價格計算 ===\n"
        for method, price in target_prices.items():
            method_name = {
                "pe_based": "基於P/E倍數",
                "ev_ebitda_based": "基於EV/EBITDA倍數",
                "pb_based": "基於P/B倍數"
            }.get(method, method)
            analysis += f"• {method_name}：${price:.2f}\n"
        
        analysis += f"\n=== 可比公司列表 ===\n"
        for comp in comparables[:5]:  # 只顯示前5家
            pe_str = f"{comp.metrics.pe_ratio:.1f}x" if comp.metrics.pe_ratio else "N/A"
            analysis += f"• {comp.company_name} ({comp.symbol}): P/E = {pe_str}\n"
        
        return analysis
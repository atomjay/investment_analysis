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
                "eps": target_stock.net_income / (target_stock.market_cap / target_stock.price) if target_stock.net_income else None,
                "estimated_ebitda": target_stock.revenue * 0.2 if target_stock.revenue else None,
                "book_value_per_share": (target_stock.total_assets - (target_stock.total_debt or 0)) / (target_stock.market_cap / target_stock.price) if target_stock.total_assets else None
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
        
        # 填充加權計算詳情
        total_weight = 0.0
        weighted_sum = 0.0
        weights = {"pe_based": 0.5, "ev_ebitda_based": 0.3, "pb_based": 0.2}
        
        for method, price in target_prices.items():
            if method in weights and price > 0:
                weight = weights[method]
                contribution = price * weight
                weighted_sum += contribution
                total_weight += weight
                
                calculation_details["valuation_calculations"]["weighted_calculation"].append({
                    "method": method,
                    "target_price": price,
                    "weight": weight,
                    "contribution": contribution,
                    "multiple_used": peer_multiples.get(method.replace("_based", "_median"), "N/A")
                })
        
        calculation_details["valuation_calculations"]["final_weighted_price"] = weighted_sum / total_weight if total_weight > 0 else 0

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
        if target_stock.net_income and "pe_median" in peer_multiples:
            eps = target_stock.net_income / (target_stock.market_cap / target_stock.price)
            target_prices["pe_based"] = eps * peer_multiples["pe_median"]
        
        # 基於EV/EBITDA倍數的目標價格（需要更複雜計算）
        if "ev_ebitda_median" in peer_multiples:
            # 簡化計算，實際應用中需要更精確的EBITDA和企業價值計算
            estimated_ebitda = target_stock.revenue * 0.2 if target_stock.revenue else None
            if estimated_ebitda:
                estimated_ev = estimated_ebitda * peer_multiples["ev_ebitda_median"]
                # 簡化：假設企業價值等於市值（忽略淨債務）
                target_prices["ev_ebitda_based"] = (estimated_ev / target_stock.market_cap) * target_stock.price
        
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
        
        # 設定權重：P/E倍數權重最高
        weights = {
            "pe_based": 0.5,
            "ev_ebitda_based": 0.3,
            "pb_based": 0.2
        }
        
        weighted_sum = 0.0
        total_weight = 0.0
        
        for method, price in target_prices.items():
            if method in weights and price > 0:
                weighted_sum += price * weights[method]
                total_weight += weights[method]
        
        return weighted_sum / total_weight if total_weight > 0 else statistics.mean(target_prices.values())
    
    def _assess_confidence_level(self, target_stock: StockData, comparables: List[CompanyComparable], 
                               peer_multiples: Dict[str, float]) -> float:
        """評估分析的信心水平"""
        confidence_factors = []
        
        # 因子1: 可比公司數量
        peer_count_score = min(len(comparables) / 10, 1.0)  # 10家或以上為滿分
        confidence_factors.append(peer_count_score * 0.3)
        
        # 因子2: 估值倍數的一致性（標準差越小，信心越高）
        if "pe_median" in peer_multiples:
            pe_ratios = [comp.metrics.pe_ratio for comp in comparables if comp.metrics.pe_ratio]
            if len(pe_ratios) > 1:
                pe_std = statistics.stdev(pe_ratios)
                pe_cv = pe_std / statistics.mean(pe_ratios)  # 變異係數
                consistency_score = max(0, 1 - pe_cv)  # 變異係數越小，一致性越高
                confidence_factors.append(consistency_score * 0.4)
        
        # 因子3: 目標公司數據完整性
        data_completeness = sum([
            1 if target_stock.pe_ratio else 0,
            1 if target_stock.revenue else 0,
            1 if target_stock.net_income else 0,
            1 if target_stock.total_assets else 0
        ]) / 4
        confidence_factors.append(data_completeness * 0.3)
        
        return sum(confidence_factors)
    
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
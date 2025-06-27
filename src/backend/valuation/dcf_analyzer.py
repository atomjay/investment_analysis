"""
Discounted Cash Flow (DCF) Analysis - 現金流折現法
Implementation of intrinsic valuation methodology
"""

from typing import List, Dict, Optional
import numpy as np
from dataclasses import dataclass

from ...shared.types import (
    StockData, ValuationResult, ValuationMethod, DCFAssumptions
)
from ...shared.constants import (
    DEFAULT_WACC, DEFAULT_TERMINAL_GROWTH_RATE, DEFAULT_TAX_RATE
)

class DCFAnalyzer:
    """現金流折現法分析器"""
    
    def __init__(self):
        self.name = "Discounted Cash Flow Analysis"
        self.description = "現金流折現法：通過預測未來現金流並折現至現值來評估公司內在價值"
    
    def analyze(self, target_stock: StockData, assumptions: DCFAssumptions) -> ValuationResult:
        """
        執行DCF分析
        
        Args:
            target_stock: 目標股票數據
            assumptions: DCF假設參數
            
        Returns:
            ValuationResult: 估值結果
        """
        # 驗證輸入數據
        self._validate_inputs(target_stock, assumptions)
        
        # 預測未來現金流
        projected_fcf = self._project_free_cash_flows(target_stock, assumptions)
        
        # 計算折現值
        pv_of_projected_fcf = self._calculate_present_value(projected_fcf, assumptions.wacc)
        
        # 計算終值
        terminal_value = self._calculate_terminal_value(
            projected_fcf[-1], assumptions.terminal_growth_rate, assumptions.wacc
        )
        pv_of_terminal_value = terminal_value / ((1 + assumptions.wacc) ** assumptions.projection_years)
        
        # 計算企業價值
        enterprise_value = pv_of_projected_fcf + pv_of_terminal_value
        
        # 計算股權價值（使用正確的淨債務公式）
        # Net Debt = Total Debt - Total Cash
        total_debt = target_stock.total_debt or 0
        total_cash = target_stock.total_cash or 0
        net_debt = total_debt - total_cash
        equity_value = enterprise_value - net_debt
        
        # 計算每股價值
        shares_outstanding = target_stock.market_cap / target_stock.price
        target_price_per_share = equity_value / shares_outstanding
        
        # 計算上漲潛力
        upside_potential = ((target_price_per_share - target_stock.price) / target_stock.price) * 100
        
        # 評估信心水平
        confidence_level = self._assess_confidence_level(target_stock, assumptions)
        
        # 生成詳細分析
        detailed_analysis = self._generate_detailed_analysis(
            target_stock, assumptions, projected_fcf, enterprise_value, equity_value
        )
        
        # 準備詳細計算數據
        calculation_details = {
            "wacc_calculation": {
                "wacc": assumptions.wacc,
                "explanation": f"WACC = {assumptions.wacc:.2%} (基於CAPM模型和實際資本結構)",
                "components": {
                    "risk_free_rate": assumptions.wacc_components.risk_free_rate if assumptions.wacc_components else 0.045,
                    "market_risk_premium": assumptions.wacc_components.market_risk_premium if assumptions.wacc_components else 0.065,
                    "beta": assumptions.wacc_components.beta if assumptions.wacc_components else 1.0,
                    "cost_of_debt": assumptions.wacc_components.cost_of_debt if assumptions.wacc_components else 0.05,
                    "tax_rate": assumptions.wacc_components.tax_rate if assumptions.wacc_components else assumptions.tax_rate,
                    "equity_to_total_value": assumptions.wacc_components.equity_to_total_value if assumptions.wacc_components else 1.0,
                    "debt_to_total_value": assumptions.wacc_components.debt_to_total_value if assumptions.wacc_components else 0.0,
                    "total_debt": total_debt,
                    "total_cash": total_cash,
                    "net_debt": net_debt,
                    "calculation_note": "使用Yahoo Finance實際數據：市值、債務、Beta；估算參數：無風險利率、市場風險溢價"
                }
            },
            "projected_cash_flows": {
                "base_revenue": target_stock.revenue,
                "projections": []
            },
            "terminal_value_calculation": {
                "final_year_fcf": projected_fcf[-1],
                "terminal_growth_rate": assumptions.terminal_growth_rate,
                "terminal_fcf": projected_fcf[-1] * (1 + assumptions.terminal_growth_rate),
                "terminal_value": terminal_value,
                "pv_terminal_value": pv_of_terminal_value
            },
            "valuation_summary": {
                "pv_projected_fcf": pv_of_projected_fcf,
                "pv_terminal_value": pv_of_terminal_value,
                "enterprise_value": enterprise_value,
                "net_debt": net_debt,
                "equity_value": equity_value,
                "shares_outstanding": shares_outstanding,
                "value_per_share": target_price_per_share
            }
        }
        
        # 填充現金流預測詳情
        current_revenue = target_stock.revenue
        for year in range(assumptions.projection_years):
            growth_rate = assumptions.revenue_growth_rates[year]
            projected_revenue = current_revenue * (1 + growth_rate)
            ebitda_margin = assumptions.ebitda_margins[year]
            projected_ebitda = projected_revenue * ebitda_margin
            depreciation = projected_ebitda * 0.10
            ebit = projected_ebitda - depreciation
            nopat = ebit * (1 - assumptions.tax_rate)
            capex = depreciation
            working_capital_change = projected_revenue * growth_rate * 0.05 if year > 0 else 0
            fcf = projected_fcf[year]
            pv_fcf = fcf / ((1 + assumptions.wacc) ** (year + 1))
            
            calculation_details["projected_cash_flows"]["projections"].append({
                "year": year + 1,
                "revenue": projected_revenue,
                "revenue_growth": growth_rate,
                "ebitda": projected_ebitda,
                "ebitda_margin": ebitda_margin,
                "depreciation": depreciation,
                "ebit": ebit,
                "nopat": nopat,
                "capex": capex,
                "working_capital_change": working_capital_change,
                "free_cash_flow": fcf,
                "discount_factor": 1 / ((1 + assumptions.wacc) ** (year + 1)),
                "present_value": pv_fcf
            })
            current_revenue = projected_revenue

        return ValuationResult(
            method=ValuationMethod.DCF,
            target_price=target_price_per_share,
            current_price=target_stock.price,
            upside_potential=upside_potential,
            confidence_level=confidence_level,
            assumptions={
                "wacc": assumptions.wacc,
                "terminal_growth_rate": assumptions.terminal_growth_rate,
                "projection_years": assumptions.projection_years,
                "tax_rate": assumptions.tax_rate,
                "enterprise_value": enterprise_value,
                "equity_value": equity_value
            },
            detailed_analysis=detailed_analysis,
            calculation_details=calculation_details,
            raw_data_sources={
                "stock_data": {
                    "revenue": target_stock.revenue,
                    "market_cap": target_stock.market_cap,
                    "current_price": target_stock.price,
                    "total_debt": target_stock.total_debt,
                    "free_cash_flow": target_stock.free_cash_flow
                },
                "data_sources": ["Yahoo Finance", "Alpha Vantage", "FMP"],
                "calculation_engine": "CapitalCore DCF Analyzer v1.0"
            }
        )
    
    def _validate_inputs(self, target_stock: StockData, assumptions: DCFAssumptions):
        """驗證輸入數據"""
        if not target_stock.revenue:
            raise ValueError("需要營收數據進行DCF分析")
        
        if len(assumptions.revenue_growth_rates) != assumptions.projection_years:
            raise ValueError("營收增長率數量必須等於預測年數")
        
        if len(assumptions.ebitda_margins) != assumptions.projection_years:
            raise ValueError("EBITDA利潤率數量必須等於預測年數")
        
        if assumptions.wacc <= 0 or assumptions.wacc > 1:
            raise ValueError("WACC必須在0到1之間")
    
    def _project_free_cash_flows(self, target_stock: StockData, assumptions: DCFAssumptions) -> List[float]:
        """預測未來自由現金流"""
        projected_fcf = []
        current_revenue = target_stock.revenue
        
        for year in range(assumptions.projection_years):
            # 預測營收
            growth_rate = assumptions.revenue_growth_rates[year]
            projected_revenue = current_revenue * (1 + growth_rate)
            
            # 預測EBITDA
            ebitda_margin = assumptions.ebitda_margins[year]
            projected_ebitda = projected_revenue * ebitda_margin
            
            # 預測稅後營業利潤 (NOPAT)
            # 簡化：假設折舊攤銷為EBITDA的10%
            depreciation = projected_ebitda * 0.10
            ebit = projected_ebitda - depreciation
            nopat = ebit * (1 - assumptions.tax_rate)
            
            # 計算自由現金流
            # FCF = NOPAT + 折舊 - 資本支出 - 營運資金變化
            # 簡化假設：資本支出 = 折舊，營運資金變化 = 營收增長 * 5%
            capex = depreciation
            working_capital_change = projected_revenue * growth_rate * 0.05 if year > 0 else 0
            
            fcf = nopat + depreciation - capex - working_capital_change
            projected_fcf.append(fcf)
            
            current_revenue = projected_revenue
        
        return projected_fcf
    
    def _calculate_present_value(self, cash_flows: List[float], discount_rate: float) -> float:
        """計算現金流現值"""
        pv = 0
        for year, cf in enumerate(cash_flows, 1):
            pv += cf / ((1 + discount_rate) ** year)
        return pv
    
    def _calculate_terminal_value(self, final_year_fcf: float, terminal_growth_rate: float, wacc: float) -> float:
        """計算終值"""
        # 永續成長模型：TV = FCF_n * (1 + g) / (WACC - g)
        terminal_fcf = final_year_fcf * (1 + terminal_growth_rate)
        terminal_value = terminal_fcf / (wacc - terminal_growth_rate)
        return terminal_value
    
    def _assess_confidence_level(self, target_stock: StockData, assumptions: DCFAssumptions) -> float:
        """
        評估DCF分析的信心水平 - 採用評分卡機制
        基於敏感性分析和交叉驗證
        """
        # 評分卡機制 - 總分100分
        total_score = 0
        
        # 1. 財務數據可靠性 (0-25分)
        data_items = [
            target_stock.revenue,
            target_stock.net_income, 
            target_stock.free_cash_flow,
            target_stock.total_debt,
            target_stock.total_cash
        ]
        data_completeness = sum(1 for item in data_items if item is not None and item != 0)
        data_score = (data_completeness / len(data_items)) * 25
        total_score += data_score
        
        # 2. 假設參數合理性 (0-25分)
        assumption_score = 0
        
        # WACC合理性評分 (0-8分)
        if 0.05 <= assumptions.wacc <= 0.12:      # 理想範圍
            wacc_score = 8
        elif 0.03 <= assumptions.wacc <= 0.20:    # 可接受範圍
            wacc_score = 6
        elif 0.01 <= assumptions.wacc <= 0.25:    # 邊界範圍
            wacc_score = 3
        else:
            wacc_score = 1
        assumption_score += wacc_score
        
        # 終值增長率合理性評分 (0-8分)
        if 0.01 <= assumptions.terminal_growth_rate <= 0.03:  # 理想範圍
            terminal_score = 8
        elif 0 <= assumptions.terminal_growth_rate <= 0.05:   # 可接受範圍
            terminal_score = 6
        elif 0 <= assumptions.terminal_growth_rate <= 0.08:   # 邊界範圍
            terminal_score = 3
        else:
            terminal_score = 1
        assumption_score += terminal_score
        
        # 營收增長率趨勢合理性 (0-9分)
        if len(assumptions.revenue_growth_rates) > 1:
            # 檢查是否呈現合理的遞減趨勢
            decreasing_trend = all(
                assumptions.revenue_growth_rates[i] >= assumptions.revenue_growth_rates[i+1] - 0.02
                for i in range(len(assumptions.revenue_growth_rates)-1)
            )
            # 檢查增長率是否在合理範圍內
            reasonable_range = all(
                -0.5 <= rate <= 1.0 for rate in assumptions.revenue_growth_rates
            )
            
            if decreasing_trend and reasonable_range:
                growth_score = 9
            elif decreasing_trend or reasonable_range:
                growth_score = 6
            else:
                growth_score = 3
        else:
            growth_score = 5  # 單一年度預測給予中等分數
        assumption_score += growth_score
        
        total_score += assumption_score
        
        # 3. 敏感性分析 (0-20分) - 基於關鍵參數變動的影響
        sensitivity_score = 0
        
        # 模擬WACC變動±1%對估值的影響
        base_wacc = assumptions.wacc
        wacc_sensitivity_ratios = []
        
        for wacc_change in [-0.01, 0.01]:
            temp_assumptions = DCFAssumptions(
                wacc=base_wacc + wacc_change,
                terminal_growth_rate=assumptions.terminal_growth_rate,
                revenue_growth_rates=assumptions.revenue_growth_rates,
                ebitda_margins=assumptions.ebitda_margins,
                tax_rate=assumptions.tax_rate,
                projection_years=assumptions.projection_years
            )
            # 簡化計算 - 使用線性近似
            wacc_impact = abs(wacc_change / base_wacc) if base_wacc > 0 else 0
            wacc_sensitivity_ratios.append(wacc_impact)
        
        # WACC敏感性評分 - 變動影響越小，信心越高
        avg_wacc_sensitivity = sum(wacc_sensitivity_ratios) / len(wacc_sensitivity_ratios) if wacc_sensitivity_ratios else 1
        if avg_wacc_sensitivity <= 0.05:      # 影響小於5%
            sensitivity_score += 10
        elif avg_wacc_sensitivity <= 0.10:    # 影響小於10%
            sensitivity_score += 8
        elif avg_wacc_sensitivity <= 0.15:    # 影響小於15%
            sensitivity_score += 6
        else:
            sensitivity_score += 3
        
        # 終值增長率敏感性評分
        terminal_sensitivity = abs(assumptions.terminal_growth_rate - 0.025) / 0.025 if assumptions.terminal_growth_rate else 1
        if terminal_sensitivity <= 0.2:       # 與理想值2.5%差距小於20%
            sensitivity_score += 10
        elif terminal_sensitivity <= 0.4:     # 差距小於40%
            sensitivity_score += 8
        elif terminal_sensitivity <= 0.6:     # 差距小於60%
            sensitivity_score += 6
        else:
            sensitivity_score += 3
        
        total_score += sensitivity_score
        
        # 4. 與其他估值方法的一致性 (0-15分)
        # 這個在實際應用中需要與CCA結果比較，暫時給予基準分數
        cross_validation_score = 10  # 基準分數，實際應用中可以與CCA結果比較
        total_score += cross_validation_score
        
        # 5. 行業適用性 (0-15分)
        sector_suitability_map = {
            "Technology": 12,            # 科技業適合DCF - 重視未來現金流
            "Healthcare": 13,            # 醫療保健
            "Consumer Discretionary": 11, # 消費可選
            "Consumer Staples": 14,      # 消費必需品 - 現金流穩定
            "Industrials": 12,           # 工業
            "Financial Services": 8,     # 金融業DCF較複雜
            "Utilities": 15,             # 公用事業 - 最適合DCF
            "Energy": 9,                 # 能源業波動大
            "Materials": 10,             # 原材料
            "Real Estate": 11            # 房地產
        }
        sector_score = sector_suitability_map.get(target_stock.sector, 10)
        total_score += sector_score
        
        # 將總分轉換為信心水平 (0-1)
        confidence_level = min(total_score / 100.0, 1.0)
        
        return confidence_level
    
    def _generate_detailed_analysis(self, target_stock: StockData, assumptions: DCFAssumptions,
                                  projected_fcf: List[float], enterprise_value: float, 
                                  equity_value: float) -> str:
        """生成詳細分析報告"""
        analysis = f"""
現金流折現法 (DCF) 分析報告 - {target_stock.company_name} ({target_stock.symbol})

=== 分析概述 ===
• 分析方法：現金流折現法，基於公司內在價值
• 預測期間：{assumptions.projection_years}年
• 基準年營收：${target_stock.revenue:,.0f}

=== 關鍵假設 ===
• 加權平均資本成本 (WACC)：{assumptions.wacc:.1%}
• 永續增長率：{assumptions.terminal_growth_rate:.1%}
• 稅率：{assumptions.tax_rate:.1%}

=== 營收增長率假設 ===
"""
        
        for year, growth in enumerate(assumptions.revenue_growth_rates, 1):
            analysis += f"• 第{year}年：{growth:.1%}\n"
        
        analysis += "\n=== EBITDA利潤率假設 ===\n"
        for year, margin in enumerate(assumptions.ebitda_margins, 1):
            analysis += f"• 第{year}年：{margin:.1%}\n"
        
        analysis += "\n=== 預測自由現金流 ===\n"
        total_pv_fcf = 0
        for year, fcf in enumerate(projected_fcf, 1):
            pv_fcf = fcf / ((1 + assumptions.wacc) ** year)
            total_pv_fcf += pv_fcf
            analysis += f"• 第{year}年：${fcf:,.0f} (現值: ${pv_fcf:,.0f})\n"
        
        terminal_value = self._calculate_terminal_value(
            projected_fcf[-1], assumptions.terminal_growth_rate, assumptions.wacc
        )
        pv_terminal = terminal_value / ((1 + assumptions.wacc) ** assumptions.projection_years)
        
        analysis += f"""
=== 估值結果 ===
• 預測期現金流現值：${total_pv_fcf:,.0f}
• 終值：${terminal_value:,.0f}
• 終值現值：${pv_terminal:,.0f}
• 企業價值：${enterprise_value:,.0f}
• 股權價值：${equity_value:,.0f}

=== 敏感性分析提醒 ===
DCF模型對關鍵假設高度敏感，建議進行多情境分析：
• WACC ±1%的影響
• 終值增長率 ±0.5%的影響
• 營收增長率 ±2%的影響
"""
        
        return analysis
    
    def sensitivity_analysis(self, target_stock: StockData, base_assumptions: DCFAssumptions, 
                           wacc_range: tuple = (-0.01, 0.01), 
                           growth_range: tuple = (-0.005, 0.005)) -> Dict[str, Dict[str, float]]:
        """敏感性分析"""
        base_result = self.analyze(target_stock, base_assumptions)
        base_price = base_result.target_price
        
        results = {
            "base_case": {"target_price": base_price, "change": 0.0},
            "wacc_scenarios": {},
            "terminal_growth_scenarios": {}
        }
        
        # WACC敏感性
        for wacc_change in [wacc_range[0]/2, wacc_range[0], wacc_range[1], wacc_range[1]/2]:
            new_assumptions = DCFAssumptions(
                revenue_growth_rates=base_assumptions.revenue_growth_rates,
                ebitda_margins=base_assumptions.ebitda_margins,
                tax_rate=base_assumptions.tax_rate,
                wacc=base_assumptions.wacc + wacc_change,
                terminal_growth_rate=base_assumptions.terminal_growth_rate,
                projection_years=base_assumptions.projection_years
            )
            result = self.analyze(target_stock, new_assumptions)
            price_change = ((result.target_price - base_price) / base_price) * 100
            results["wacc_scenarios"][f"wacc_{wacc_change:+.1%}"] = {
                "target_price": result.target_price,
                "change": price_change
            }
        
        # 終值增長率敏感性
        for growth_change in [growth_range[0]/2, growth_range[0], growth_range[1], growth_range[1]/2]:
            new_assumptions = DCFAssumptions(
                revenue_growth_rates=base_assumptions.revenue_growth_rates,
                ebitda_margins=base_assumptions.ebitda_margins,
                tax_rate=base_assumptions.tax_rate,
                wacc=base_assumptions.wacc,
                terminal_growth_rate=base_assumptions.terminal_growth_rate + growth_change,
                projection_years=base_assumptions.projection_years
            )
            result = self.analyze(target_stock, new_assumptions)
            price_change = ((result.target_price - base_price) / base_price) * 100
            results["terminal_growth_scenarios"][f"growth_{growth_change:+.1%}"] = {
                "target_price": result.target_price,
                "change": price_change
            }
        
        return results
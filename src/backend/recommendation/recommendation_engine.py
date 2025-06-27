"""
Investment Recommendation Engine - 投資建議引擎
Generates buy/sell recommendations based on valuation analysis
"""

from typing import List, Dict, Optional
import statistics
from dataclasses import dataclass

from ...shared.types import (
    StockData, ValuationResult, InvestmentRecommendation, 
    RecommendationType, RecommendationReason, AnalysisReport
)
from ...shared.constants import RECOMMENDATION_WEIGHTS, RISK_LEVELS, TIME_HORIZONS

class RecommendationEngine:
    """投資建議引擎"""
    
    def __init__(self):
        self.name = "Investment Recommendation Engine"
        self.description = "基於多重估值方法和風險分析生成投資建議"
    
    def generate_recommendation(self, stock_data: StockData, 
                              valuation_results: List[ValuationResult]) -> InvestmentRecommendation:
        """
        生成投資建議
        
        Args:
            stock_data: 股票基本數據
            valuation_results: 估值分析結果列表
            
        Returns:
            InvestmentRecommendation: 投資建議
        """
        # 計算綜合目標價格
        consensus_target_price = self._calculate_consensus_target_price(valuation_results, stock_data)
        
        # 計算潛在回報
        potential_return = ((consensus_target_price - stock_data.price) / stock_data.price) * 100
        
        # 評估風險等級
        risk_level = self._assess_risk_level(stock_data, valuation_results)
        
        # 確定投資時間範圍
        time_horizon = self._determine_time_horizon(potential_return, risk_level)
        
        # 生成買入理由
        buy_reasons = self._generate_buy_reasons(stock_data, valuation_results, potential_return)
        
        # 生成賣出理由
        sell_reasons = self._generate_sell_reasons(stock_data, valuation_results, potential_return)
        
        # 計算綜合評分
        overall_score = self._calculate_overall_score(
            stock_data, valuation_results, buy_reasons, sell_reasons
        )
        
        # 確定推薦類型
        recommendation_type = self._determine_recommendation_type(
            potential_return, overall_score, risk_level
        )
        
        return InvestmentRecommendation(
            symbol=stock_data.symbol,
            recommendation=recommendation_type,
            target_price=consensus_target_price,
            current_price=stock_data.price,
            potential_return=potential_return,
            risk_level=risk_level,
            time_horizon=time_horizon,
            buy_reasons=buy_reasons,
            sell_reasons=sell_reasons,
            overall_score=overall_score
        )
    
    def _calculate_consensus_target_price(self, valuation_results: List[ValuationResult], stock_data: StockData = None) -> float:
        """
        計算共識目標價格 - 基於方法適用性的智能權重分配
        考慮公司特性和估值方法的適用性
        """
        if not valuation_results:
            return 0.0
        
        # 獲取第一個結果中的股票信息來確定公司特性
        if valuation_results:
            # 基於方法適用性調整權重
            adjusted_weights = self._calculate_method_suitability_weights(valuation_results, stock_data)
            
            weighted_sum = 0.0
            total_weight = 0.0
            
            # 第一步：計算所有方法的未標準化權重
            raw_weights = {}
            for result in valuation_results:
                # 結合信心水平和方法適用性係數
                base_confidence = result.confidence_level
                suitability_coefficient = adjusted_weights.get(result.method.value, 1.0)
                
                # 未標準化權重 = 信心水平 × 行業適用性係數
                raw_weight = base_confidence * suitability_coefficient
                raw_weights[result.method.value] = raw_weight
                total_weight += raw_weight
            
            # 第二步：標準化權重（使總和為1）
            normalized_weights = {}
            if total_weight > 0:
                for method_name, raw_weight in raw_weights.items():
                    normalized_weights[method_name] = raw_weight / total_weight
            
            # 第三步：使用標準化權重計算加權平均目標價
            for result in valuation_results:
                normalized_weight = normalized_weights.get(result.method.value, 0)
                weighted_sum += result.target_price * normalized_weight
            
            return weighted_sum if total_weight > 0 else statistics.mean(
                [r.target_price for r in valuation_results]
            )
        
        # 備用方案：簡單的信心水平加權
        weighted_sum = 0.0
        total_weight = 0.0
        
        for result in valuation_results:
            weight = result.confidence_level
            weighted_sum += result.target_price * weight
            total_weight += weight
        
        return weighted_sum / total_weight if total_weight > 0 else statistics.mean(
            [r.target_price for r in valuation_results]
        )
    
    def _calculate_method_suitability_weights(self, valuation_results: List[ValuationResult], stock_data: StockData = None) -> Dict[str, float]:
        """
        基於行業特性和公司特徵計算估值方法適用性權重
        針對不同行業提供專門的權重分配策略
        """
        method_weights = {}
        
        # 獲取行業信息
        sector = getattr(stock_data, 'sector', 'Unknown') if stock_data else 'Unknown'
        market_cap = getattr(stock_data, 'market_cap', 0) if stock_data else 0
        
        # 行業特定權重分配矩陣
        sector_weights = self._get_sector_specific_weights(sector, market_cap)
        
        # 檢查現有的估值方法
        existing_methods = {result.method.value for result in valuation_results}
        
        # 為每個存在的方法分配權重
        for method in existing_methods:
            method_weights[method] = sector_weights.get(method, 1.0)
        
        return method_weights
    
    def _get_sector_specific_weights(self, sector: str, market_cap: float) -> Dict[str, float]:
        """
        獲取行業特定的估值方法權重
        基於不同行業的特性和商業模式調整權重
        """
        # 定義公司規模係數
        is_large_cap = market_cap > 10e9  # 大於100億美元
        is_mega_cap = market_cap > 200e9  # 大於2000億美元
        
        # 行業特定權重配置
        sector_weight_config = {
            "Technology": {
                # 科技業：重視未來成長和創新，但現金流可能不穩定
                "discounted_cash_flow": 1.3 if is_large_cap else 1.0,
                "comparable_companies_analysis": 1.2,  # 科技股比較活躍
                "precedent_transactions_analysis": 0.8 if is_mega_cap else 1.1,  # 大型科技公司併購較少，小型較多
                "asset_based_valuation": 0.3  # 科技公司無形資產為主
            },
            
            "Healthcare": {
                # 醫療保健：現金流穩定，但研發週期長
                "discounted_cash_flow": 1.4,
                "comparable_companies_analysis": 1.1,
                "precedent_transactions_analysis": 1.0,  # 醫療併購較常見
                "asset_based_valuation": 0.7
            },
            
            "Financial Services": {
                # 金融服務：特殊的商業模式，DCF較複雜
                "discounted_cash_flow": 0.8,  # 金融業DCF模型複雜
                "comparable_companies_analysis": 1.4,  # 同業比較最重要
                "precedent_transactions_analysis": 1.2,  # 金融併購案例豐富
                "asset_based_valuation": 1.1  # 帳面價值重要
            },
            
            "Utilities": {
                # 公用事業：現金流極穩定，適合DCF
                "discounted_cash_flow": 1.6,  # 最適合DCF的行業
                "comparable_companies_analysis": 1.0,
                "precedent_transactions_analysis": 0.8,
                "asset_based_valuation": 1.2  # 資產密集型行業
            },
            
            "Energy": {
                # 能源：週期性強，現金流波動大
                "discounted_cash_flow": 0.9,  # 現金流難預測
                "comparable_companies_analysis": 1.3,  # 週期性比較重要
                "precedent_transactions_analysis": 1.2,  # 能源併購活躍
                "asset_based_valuation": 1.3  # 資源和資產價值重要
            },
            
            "Consumer Staples": {
                # 消費必需品：現金流穩定，防禦性強
                "discounted_cash_flow": 1.5,
                "comparable_companies_analysis": 1.1,
                "precedent_transactions_analysis": 0.9,
                "asset_based_valuation": 0.8
            },
            
            "Consumer Discretionary": {
                # 消費可選：週期性，依賴經濟環境
                "discounted_cash_flow": 1.2,
                "comparable_companies_analysis": 1.3,  # 市場情緒影響大
                "precedent_transactions_analysis": 1.0,
                "asset_based_valuation": 0.7
            },
            
            "Industrials": {
                # 工業：現金流相對穩定，資產重要
                "discounted_cash_flow": 1.3,
                "comparable_companies_analysis": 1.1,
                "precedent_transactions_analysis": 1.0,
                "asset_based_valuation": 1.0
            },
            
            "Materials": {
                # 原材料：商品週期性強
                "discounted_cash_flow": 0.9,
                "comparable_companies_analysis": 1.3,
                "precedent_transactions_analysis": 1.1,
                "asset_based_valuation": 1.2
            },
            
            "Real Estate": {
                # 房地產：資產價值和現金流並重
                "discounted_cash_flow": 1.2,
                "comparable_companies_analysis": 1.2,
                "precedent_transactions_analysis": 1.1,
                "asset_based_valuation": 1.4  # 資產價值最重要
            }
        }
        
        # 獲取行業特定權重，如果行業不在配置中則使用默認權重
        if sector in sector_weight_config:
            return sector_weight_config[sector]
        else:
            # 默認權重 - 適用於一般公司
            return {
                "discounted_cash_flow": 1.2,
                "comparable_companies_analysis": 1.0,
                "precedent_transactions_analysis": 0.8,
                "asset_based_valuation": 0.7
            }
    
    def _assess_risk_level(self, stock_data: StockData, valuation_results: List[ValuationResult]) -> str:
        """評估風險等級"""
        risk_factors = []
        
        # 因子1: 估值結果分歧度
        if len(valuation_results) > 1:
            target_prices = [r.target_price for r in valuation_results]
            price_std = statistics.stdev(target_prices)
            price_mean = statistics.mean(target_prices)
            coefficient_of_variation = price_std / price_mean if price_mean > 0 else 1
            
            # 變異係數越高，風險越大
            valuation_risk = min(coefficient_of_variation * 100, 100)
            risk_factors.append(valuation_risk * 0.3)
        
        # 因子2: 財務槓桿風險
        if stock_data.total_debt and stock_data.total_assets:
            debt_ratio = stock_data.total_debt / stock_data.total_assets
            leverage_risk = min(debt_ratio * 100, 100)
            risk_factors.append(leverage_risk * 0.25)
        
        # 因子3: 估值倍數風險
        if stock_data.pe_ratio:
            # P/E倍數過高表示估值風險
            pe_risk = min(max(stock_data.pe_ratio - 15, 0) * 2, 100)
            risk_factors.append(pe_risk * 0.2)
        
        # 因子4: 市值規模風險（小市值風險較高）
        if stock_data.market_cap:
            # 市值低於10億美元視為高風險
            size_risk = max(0, (10e9 - stock_data.market_cap) / 10e9 * 100) if stock_data.market_cap < 10e9 else 0
            risk_factors.append(size_risk * 0.15)
        
        # 因子5: 行業風險（簡化處理）
        sector_risk_mapping = {
            "Technology": 60,
            "Healthcare": 50,
            "Financial": 40,
            "Consumer": 35,
            "Energy": 70,
            "Industrial": 45,
            "Telecom": 30,
            "Utilities": 25,
            "Real Estate": 55,
            "Materials": 65
        }
        sector_risk = sector_risk_mapping.get(stock_data.sector, 50)
        risk_factors.append(sector_risk * 0.1)
        
        # 計算綜合風險評分
        total_risk_score = sum(risk_factors) if risk_factors else 50
        
        # 根據評分確定風險等級
        for level, config in RISK_LEVELS.items():
            if config["score_range"][0] <= total_risk_score < config["score_range"][1]:
                return config["description"]
        
        return "中等風險"  # 默認值
    
    def _determine_time_horizon(self, potential_return: float, risk_level: str) -> str:
        """確定投資時間範圍"""
        if abs(potential_return) > 50 or "高風險" in risk_level:
            return TIME_HORIZONS["SHORT_TERM"]
        elif abs(potential_return) > 20:
            return TIME_HORIZONS["MEDIUM_TERM"]
        else:
            return TIME_HORIZONS["LONG_TERM"]
    
    def _generate_buy_reasons(self, stock_data: StockData, valuation_results: List[ValuationResult], 
                            potential_return: float) -> List[RecommendationReason]:
        """生成買入理由"""
        buy_reasons = []
        
        # 估值角度的買入理由
        if potential_return > 15:
            buy_reasons.append(RecommendationReason(
                category="估值分析",
                description=f"多重估值模型顯示股價被低估{abs(potential_return):.1f}%，具有顯著上漲潛力",
                weight=0.4,
                impact="正面"
            ))
        
        # 基本面買入理由
        if stock_data.pe_ratio and stock_data.pe_ratio < 20:
            buy_reasons.append(RecommendationReason(
                category="基本面分析",
                description=f"P/E倍數為{stock_data.pe_ratio:.1f}，相對合理，估值不高",
                weight=0.3,
                impact="正面"
            ))
        
        # 財務健康度買入理由
        if stock_data.total_debt and stock_data.total_assets:
            debt_ratio = stock_data.total_debt / stock_data.total_assets
            if debt_ratio < 0.3:
                buy_reasons.append(RecommendationReason(
                    category="財務健康",
                    description=f"負債比率{debt_ratio:.1%}，財務結構健康，槓桿適中",
                    weight=0.2,
                    impact="正面"
                ))
        
        # 現金流買入理由
        if stock_data.free_cash_flow and stock_data.free_cash_flow > 0:
            buy_reasons.append(RecommendationReason(
                category="現金流分析",
                description="公司具有正向自由現金流，經營活動產生現金能力強",
                weight=0.25,
                impact="正面"
            ))
        
        # 市場地位買入理由
        if stock_data.market_cap and stock_data.market_cap > 10e9:  # 大於100億美元
            buy_reasons.append(RecommendationReason(
                category="市場地位",
                description="大型股票，市場地位穩固，流動性佳",
                weight=0.15,
                impact="正面"
            ))
        
        return buy_reasons
    
    def _generate_sell_reasons(self, stock_data: StockData, valuation_results: List[ValuationResult], 
                             potential_return: float) -> List[RecommendationReason]:
        """生成賣出理由"""
        sell_reasons = []
        
        # 估值角度的賣出理由
        if potential_return < -10:
            sell_reasons.append(RecommendationReason(
                category="估值分析",
                description=f"多重估值模型顯示股價被高估{abs(potential_return):.1f}%，下跌風險較大",
                weight=0.4,
                impact="負面"
            ))
        
        # 基本面賣出理由
        if stock_data.pe_ratio and stock_data.pe_ratio > 40:
            sell_reasons.append(RecommendationReason(
                category="基本面分析",
                description=f"P/E倍數高達{stock_data.pe_ratio:.1f}，估值過高，泡沫風險",
                weight=0.35,
                impact="負面"
            ))
        
        # 財務風險賣出理由
        if stock_data.total_debt and stock_data.total_assets:
            debt_ratio = stock_data.total_debt / stock_data.total_assets
            if debt_ratio > 0.6:
                sell_reasons.append(RecommendationReason(
                    category="財務風險",
                    description=f"負債比率高達{debt_ratio:.1%}，財務槓桿過高，償債風險大",
                    weight=0.3,
                    impact="負面"
                ))
        
        # 現金流賣出理由
        if stock_data.free_cash_flow and stock_data.free_cash_flow < 0:
            sell_reasons.append(RecommendationReason(
                category="現金流分析",
                description="自由現金流為負，公司燒錢速度快，資金壓力大",
                weight=0.3,
                impact="負面"
            ))
        
        # 估值分歧賣出理由
        if len(valuation_results) > 1:
            target_prices = [r.target_price for r in valuation_results]
            if len(target_prices) > 1:
                price_std = statistics.stdev(target_prices)
                price_mean = statistics.mean(target_prices)
                cv = price_std / price_mean if price_mean > 0 else 0
                
                if cv > 0.2:  # 變異係數大於20%
                    sell_reasons.append(RecommendationReason(
                        category="估值分歧",
                        description="不同估值方法結果分歧較大，估值不確定性高",
                        weight=0.2,
                        impact="負面"
                    ))
        
        return sell_reasons
    
    def _calculate_overall_score(self, stock_data: StockData, valuation_results: List[ValuationResult],
                               buy_reasons: List[RecommendationReason], 
                               sell_reasons: List[RecommendationReason]) -> float:
        """計算綜合評分 (0-100)"""
        
        # 基礎評分從50開始
        base_score = 50.0
        
        # 買入理由加分
        buy_score_add = sum(reason.weight * 20 for reason in buy_reasons)  # 最多加40分
        
        # 賣出理由扣分
        sell_score_deduct = sum(reason.weight * 20 for reason in sell_reasons)  # 最多扣40分
        
        # 估值結果信心度調整
        if valuation_results:
            avg_confidence = statistics.mean([r.confidence_level for r in valuation_results])
            confidence_adjustment = (avg_confidence - 0.5) * 20  # -10到+10分
        else:
            confidence_adjustment = 0
        
        # 計算最終評分
        final_score = base_score + buy_score_add - sell_score_deduct + confidence_adjustment
        
        # 確保評分在0-100範圍內
        return max(0, min(100, final_score))
    
    def _determine_recommendation_type(self, potential_return: float, overall_score: float, 
                                     risk_level: str) -> RecommendationType:
        """確定推薦類型"""
        
        # 基於潛在回報和綜合評分的推薦邏輯
        if overall_score >= 80 and potential_return >= 25:
            return RecommendationType.STRONG_BUY
        elif overall_score >= 65 and potential_return >= 15:
            return RecommendationType.BUY
        elif overall_score <= 20 or potential_return <= -25:
            return RecommendationType.STRONG_SELL
        elif overall_score <= 35 or potential_return <= -15:
            return RecommendationType.SELL
        else:
            return RecommendationType.HOLD
    
    def generate_analysis_report(self, stock_data: StockData, valuation_results: List[ValuationResult],
                               recommendation: InvestmentRecommendation) -> AnalysisReport:
        """生成完整分析報告"""
        
        # 生成執行摘要
        executive_summary = self._generate_executive_summary(stock_data, recommendation)
        
        # 識別關鍵風險
        key_risks = self._identify_key_risks(stock_data, valuation_results)
        
        # 識別催化因子
        catalysts = self._identify_catalysts(stock_data, recommendation)
        
        return AnalysisReport(
            symbol=stock_data.symbol,
            company_name=stock_data.company_name,
            analysis_date="2025-06-26",  # 實際應用中應使用當前日期
            stock_data=stock_data,
            valuation_results=valuation_results,
            recommendation=recommendation,
            executive_summary=executive_summary,
            key_risks=key_risks,
            catalysts=catalysts
        )
    
    def _generate_executive_summary(self, stock_data: StockData, recommendation: InvestmentRecommendation) -> str:
        """生成執行摘要"""
        rec_text = {
            RecommendationType.STRONG_BUY: "強烈買入",
            RecommendationType.BUY: "買入",
            RecommendationType.HOLD: "持有",
            RecommendationType.SELL: "賣出",
            RecommendationType.STRONG_SELL: "強烈賣出"
        }.get(recommendation.recommendation, "持有")
        
        return f"""
我們對{stock_data.company_name} ({stock_data.symbol})給予「{rec_text}」評級，目標價${recommendation.target_price:.2f}，
較當前股價${stock_data.price:.2f}具有{recommendation.potential_return:+.1f}%的潛在回報空間。

基於多重估值分析，該股票綜合評分為{recommendation.overall_score:.0f}分，風險等級為{recommendation.risk_level}，
建議投資時間範圍為{recommendation.time_horizon}。

主要投資亮點包括：{', '.join([r.description[:50] + '...' for r in recommendation.buy_reasons[:2]])}

主要風險因素包括：{', '.join([r.description[:50] + '...' for r in recommendation.sell_reasons[:2]])}
        """.strip()
    
    def _identify_key_risks(self, stock_data: StockData, valuation_results: List[ValuationResult]) -> List[str]:
        """識別關鍵風險"""
        risks = []
        
        # 估值風險
        if len(valuation_results) > 1:
            target_prices = [r.target_price for r in valuation_results]
            if statistics.stdev(target_prices) / statistics.mean(target_prices) > 0.2:
                risks.append("估值模型結果分歧，估值不確定性較高")
        
        # 財務風險
        if stock_data.total_debt and stock_data.total_assets:
            if stock_data.total_debt / stock_data.total_assets > 0.5:
                risks.append("財務槓桿較高，償債能力需關注")
        
        # 估值風險
        if stock_data.pe_ratio and stock_data.pe_ratio > 30:
            risks.append("估值倍數偏高，回調風險存在")
        
        # 行業風險
        high_risk_sectors = ["Technology", "Energy", "Materials"]
        if stock_data.sector in high_risk_sectors:
            risks.append(f"{stock_data.sector}行業波動性較大，需密切關注行業動態")
        
        return risks
    
    def _identify_catalysts(self, stock_data: StockData, recommendation: InvestmentRecommendation) -> List[str]:
        """識別催化因子"""
        catalysts = []
        
        # 正面催化因子
        if recommendation.potential_return > 0:
            catalysts.append("估值修復驅動股價上漲")
            
        if stock_data.sector == "Technology":
            catalysts.append("科技創新和數位轉型趨勢")
            
        # 基本面催化因子
        if stock_data.free_cash_flow and stock_data.free_cash_flow > 0:
            catalysts.append("強勁現金流支撐股息和回購")
            
        # 市場催化因子
        if stock_data.market_cap and stock_data.market_cap > 50e9:
            catalysts.append("大盤股獲得機構資金青睞")
            
        return catalysts
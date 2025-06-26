"""
Investment Analysis Web Application - 投資分析Web應用
Flask-based web interface for stock analysis
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
import sys
from datetime import datetime

# 添加父目錄到路徑以便導入後端模組
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from src.backend.analysis_engine import AnalysisEngine
from src.shared.types import RecommendationType

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # 在生產環境中應使用環境變量

# 初始化分析引擎
analysis_engine = AnalysisEngine()

@app.route('/')
def index():
    """主頁"""
    return render_template('index.html')

@app.route('/analysis')
def analysis_page():
    """分析頁面"""
    return render_template('analysis.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_stock():
    """股票分析API端點"""
    try:
        data = request.get_json()
        symbol = data.get('symbol', '').upper().strip()
        
        if not symbol:
            return jsonify({'error': '請輸入股票代號'}), 400
        
        # 驗證股票代號
        if not analysis_engine.data_fetcher.validate_symbol(symbol):
            return jsonify({'error': '無效的股票代號格式'}), 400
        
        # 執行分析
        analysis_type = data.get('analysis_type', 'quick')
        
        if analysis_type == 'full':
            # 完整分析
            report = analysis_engine.analyze_stock(symbol, include_sensitivity=True)
            if not report:
                return jsonify({'error': f'無法分析股票 {symbol}'}), 500
            
            # 轉換為API響應格式
            response = {
                'symbol': report.symbol,
                'company_name': report.company_name,
                'analysis_date': report.analysis_date,
                'current_price': report.stock_data.price,
                'target_price': report.recommendation.target_price,
                'potential_return': report.recommendation.potential_return,
                'recommendation': {
                    'type': report.recommendation.recommendation.value,
                    'display_name': get_recommendation_display_name(report.recommendation.recommendation),
                    'overall_score': report.recommendation.overall_score,
                    'risk_level': report.recommendation.risk_level,
                    'time_horizon': report.recommendation.time_horizon
                },
                'buy_reasons': [
                    {
                        'category': reason.category,
                        'description': reason.description,
                        'weight': reason.weight,
                        'impact': reason.impact
                    } for reason in report.recommendation.buy_reasons
                ],
                'sell_reasons': [
                    {
                        'category': reason.category,
                        'description': reason.description,
                        'weight': reason.weight,
                        'impact': reason.impact
                    } for reason in report.recommendation.sell_reasons
                ],
                'valuation_methods': [
                    {
                        'method': result.method.value,
                        'display_name': get_method_display_name(result.method.value),
                        'target_price': result.target_price,
                        'upside_potential': result.upside_potential,
                        'confidence_level': result.confidence_level
                    } for result in report.valuation_results
                ],
                'executive_summary': report.executive_summary,
                'key_risks': report.key_risks,
                'catalysts': report.catalysts
            }
        else:
            # 快速分析
            result = analysis_engine.quick_analysis(symbol)
            if 'error' in result:
                return jsonify({'error': result['error']}), 500
            
            response = {
                'symbol': result['symbol'],
                'company_name': result['company_name'],
                'current_price': result['current_price'],
                'target_price': result['target_price'],
                'potential_return': result['potential_return'],
                'recommendation': {
                    'type': result['recommendation'],
                    'display_name': get_recommendation_display_name_from_string(result['recommendation']),
                    'risk_level': result['risk_level']
                },
                'analysis_methods': [get_method_display_name(method) for method in result['analysis_methods']]
            }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': f'分析過程中發生錯誤: {str(e)}'}), 500

@app.route('/api/batch_analyze', methods=['POST'])
def batch_analyze():
    """批量分析API端點"""
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])
        
        if not symbols or not isinstance(symbols, list):
            return jsonify({'error': '請提供股票代號列表'}), 400
        
        # 清理和驗證股票代號
        clean_symbols = []
        for symbol in symbols:
            clean_symbol = symbol.upper().strip()
            if analysis_engine.data_fetcher.validate_symbol(clean_symbol):
                clean_symbols.append(clean_symbol)
        
        if not clean_symbols:
            return jsonify({'error': '沒有有效的股票代號'}), 400
        
        # 執行批量分析
        results = analysis_engine.batch_analysis(clean_symbols)
        
        # 格式化結果
        formatted_results = []
        for symbol, result in results.items():
            if 'error' not in result:
                formatted_results.append({
                    'symbol': symbol,
                    'company_name': result['company_name'],
                    'current_price': result['current_price'],
                    'target_price': result['target_price'],
                    'potential_return': result['potential_return'],
                    'recommendation': get_recommendation_display_name_from_string(result['recommendation']),
                    'risk_level': result['risk_level']
                })
            else:
                formatted_results.append({
                    'symbol': symbol,
                    'error': result['error']
                })
        
        return jsonify({'results': formatted_results})
        
    except Exception as e:
        return jsonify({'error': f'批量分析失敗: {str(e)}'}), 500

@app.route('/api/market_overview')
def market_overview():
    """市場概況API端點"""
    try:
        overview = analysis_engine.get_market_overview()
        return jsonify(overview)
    except Exception as e:
        return jsonify({'error': f'獲取市場概況失敗: {str(e)}'}), 500

@app.route('/api/supported_symbols')
def supported_symbols():
    """獲取支援的股票代號"""
    try:
        symbols = analysis_engine.data_fetcher.get_supported_symbols()
        return jsonify({'symbols': symbols})
    except Exception as e:
        return jsonify({'error': f'獲取支援股票列表失敗: {str(e)}'}), 500

def get_recommendation_display_name(rec_type: RecommendationType) -> str:
    """獲取推薦類型的顯示名稱"""
    mapping = {
        RecommendationType.STRONG_BUY: "強烈買入",
        RecommendationType.BUY: "買入",
        RecommendationType.HOLD: "持有",
        RecommendationType.SELL: "賣出",
        RecommendationType.STRONG_SELL: "強烈賣出"
    }
    return mapping.get(rec_type, "持有")

def get_recommendation_display_name_from_string(rec_string: str) -> str:
    """從字符串獲取推薦類型的顯示名稱"""
    mapping = {
        "strong_buy": "強烈買入",
        "buy": "買入",
        "hold": "持有",
        "sell": "賣出",
        "strong_sell": "強烈賣出"
    }
    return mapping.get(rec_string, "持有")

def get_method_display_name(method: str) -> str:
    """獲取估值方法的顯示名稱"""
    mapping = {
        "comparable_companies_analysis": "相對估值法 (CCA)",
        "discounted_cash_flow": "現金流折現法 (DCF)",
        "precedent_transactions_analysis": "交易比率法 (PTA)",
        "asset_based_valuation": "資產基礎法"
    }
    return mapping.get(method, method)

@app.errorhandler(404)
def not_found(error):
    return render_template('error.html', error="頁面不存在"), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('error.html', error="內部服務器錯誤"), 500

if __name__ == '__main__':
    # 創建templates目錄如果不存在
    templates_dir = os.path.join(os.path.dirname(__file__), 'templates')
    static_dir = os.path.join(os.path.dirname(__file__), 'static')
    
    if not os.path.exists(templates_dir):
        os.makedirs(templates_dir)
    if not os.path.exists(static_dir):
        os.makedirs(static_dir)
    
    # 開發模式運行
    app.run(debug=True, host='0.0.0.0', port=5000)
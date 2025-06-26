"""
Investment Analysis API Server - 投資分析API服務器
Flask-based REST API for React frontend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import sys
from datetime import datetime
import logging
from dotenv import load_dotenv

# 載入環境變量
load_dotenv()

# 添加父目錄到路徑以便導入後端模組
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from src.backend.analysis_engine import AnalysisEngine
from src.backend.data.real_data_fetcher import RealStockDataFetcher
from src.backend.data.yahoo_finance_fetcher import YahooFinanceDataFetcher
from src.shared.types import RecommendationType

# 配置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# 啟用CORS以支援React前端
CORS(app, origins=[
    "http://localhost:3000",  # Next.js dev server
    "http://127.0.0.1:3000",
    "http://localhost:3001",  # Alternative port
])

# 初始化分析引擎
analysis_engine = AnalysisEngine()

def create_analysis_engine_with_source(data_source: str):
    """根據指定數據源創建分析引擎"""
    try:
        if data_source == 'yahoo_finance':
            engine = AnalysisEngine(use_real_data=False)  # 使用預設
            engine.data_fetcher = YahooFinanceDataFetcher()
            return engine
        elif data_source == 'alpha_vantage':
            alpha_key = os.getenv('ALPHA_VANTAGE_API_KEY')
            engine = AnalysisEngine(use_real_data=False)
            engine.data_fetcher = RealStockDataFetcher(alpha_key, None)
            return engine
        elif data_source == 'fmp':
            fmp_key = os.getenv('FMP_API_KEY')
            engine = AnalysisEngine(use_real_data=False)
            engine.data_fetcher = RealStockDataFetcher(None, fmp_key)
            return engine
        else:
            return analysis_engine
    except Exception as e:
        logger.error(f'創建數據源引擎失敗: {e}')
        return analysis_engine

@app.before_request
def log_request_info():
    """記錄請求信息"""
    logger.info(f'{request.method} {request.path} - {request.remote_addr}')

@app.after_request
def after_request(response):
    """設置響應頭"""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/')
def index():
    """API根路徑"""
    return jsonify({
        'message': 'iBank Investment Analysis API',
        'version': '1.0.0',
        'status': 'operational',
        'endpoints': {
            'analyze': '/api/analyze',
            'batch_analyze': '/api/batch_analyze', 
            'market_overview': '/api/market_overview',
            'supported_symbols': '/api/supported_symbols',
            'health': '/api/health'
        }
    })

@app.route('/api/health')
def health_check():
    """API健康檢查"""
    try:
        # 簡單測試分析引擎是否正常
        market_overview = analysis_engine.get_market_overview()
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'services': {
                'analysis_engine': 'operational',
                'data_fetcher': 'operational',
                'api_server': 'operational'
            }
        })
    except Exception as e:
        logger.error(f'Health check failed: {e}')
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }), 500

@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze_stock():
    """股票分析API端點"""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': '缺少請求數據'}), 400
            
        symbol = data.get('symbol', '').upper().strip()
        
        if not symbol:
            return jsonify({'error': '請輸入股票代號'}), 400
        
        # 驗證股票代號
        if not analysis_engine.data_fetcher.validate_symbol(symbol):
            return jsonify({'error': '無效的股票代號格式'}), 400
        
        # 執行分析
        analysis_type = data.get('analysis_type', 'quick')
        data_source = data.get('data_source', 'yahoo_finance')
        logger.info(f'開始分析 {symbol} - 類型: {analysis_type} - 數據源: {data_source}')
        
        # 根據指定的數據源創建分析引擎
        temp_engine = create_analysis_engine_with_source(data_source)
        
        if analysis_type == 'full':
            # 完整分析
            report = temp_engine.analyze_stock(symbol, include_sensitivity=True)
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
            result = temp_engine.quick_analysis(symbol)
            if 'error' in result:
                logger.error(f'快速分析失敗 {symbol}: {result["error"]}')
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
        
        logger.info(f'分析完成 {symbol} - 推薦: {response["recommendation"]["display_name"]}')
        return jsonify(response)
        
    except Exception as e:
        logger.error(f'分析API錯誤: {str(e)}')
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
        popular_symbols = analysis_engine.data_fetcher.get_supported_symbols()
        return jsonify({
            'symbols': popular_symbols,
            'note': '支援所有美股股票代號，可以輸入任何有效的美股代號進行分析',
            'popular_only': '以上為熱門股票示例，非全部支援清單'
        })
    except Exception as e:
        return jsonify({'error': f'獲取支援股票列表失敗: {str(e)}'}), 500

@app.route('/api/data_sources')
def data_sources():
    """獲取可用的數據源狀態"""
    try:
        from src.backend.data.real_data_fetcher import RealStockDataFetcher
        from src.backend.data.yahoo_finance_fetcher import YahooFinanceDataFetcher
        import os
        
        sources = {}
        
        # Yahoo Finance - 永遠可用
        sources['yahoo_finance'] = {
            'name': 'Yahoo Finance',
            'available': True,
            'free': True,
            'rate_limit': None,
            'features': ['基本估值', 'CCA分析', '快速分析'],
            'description': '免費且穩定的數據源'
        }
        
        # Alpha Vantage - 檢查API key和限制
        alpha_key = os.getenv('ALPHA_VANTAGE_API_KEY')
        if alpha_key:
            # 簡單測試API是否可用
            try:
                fetcher = RealStockDataFetcher(alpha_key, None)
                test_data = fetcher._fetch_from_alpha_vantage('AAPL')
                alpha_available = test_data and 'Information' not in test_data
            except:
                alpha_available = False
                
            sources['alpha_vantage'] = {
                'name': 'Alpha Vantage',
                'available': alpha_available,
                'free': False,
                'rate_limit': '25 requests/day' if not alpha_available else None,
                'features': ['完整財務數據', '所有估值方法', '完整分析'],
                'description': '專業財務數據源'
            }
        
        # FMP - 檢查API key
        fmp_key = os.getenv('FMP_API_KEY')
        if fmp_key:
            try:
                fetcher = RealStockDataFetcher(None, fmp_key)
                test_data = fetcher._fetch_from_fmp('AAPL')
                fmp_available = test_data is not None
            except:
                fmp_available = False
                
            sources['fmp'] = {
                'name': 'Financial Modeling Prep',
                'available': fmp_available,
                'free': False,
                'rate_limit': None,
                'features': ['專業財務指標', '所有估值方法', '完整分析'],
                'description': '專業投資分析數據'
            }
        
        return jsonify({'sources': sources})
        
    except Exception as e:
        logger.error(f'獲取數據源狀態失敗: {e}')
        return jsonify({'error': f'獲取數據源狀態失敗: {str(e)}'}), 500

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
    return jsonify({'error': 'API端點不存在'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f'Internal server error: {error}')
    return jsonify({'error': '內部服務器錯誤'}), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': '請求格式錯誤'}), 400

if __name__ == '__main__':
    # 獲取端口配置
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f'Starting iBank API Server on port {port}')
    logger.info(f'Debug mode: {debug}')
    
    # 啟動API服務器
    app.run(
        debug=debug,
        host='0.0.0.0', 
        port=port,
        threaded=True  # 支援多線程以提高性能
    )
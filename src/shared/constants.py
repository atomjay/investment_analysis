"""
Constants for investment analysis system
投資分析系統常量定義
"""

# API相關常量
API_TIMEOUT = 30
MAX_RETRIES = 3
RATE_LIMIT_DELAY = 1.0

# 估值相關常量
DEFAULT_WACC = 0.10  # 默認加權平均資本成本 10%
DEFAULT_TERMINAL_GROWTH_RATE = 0.025  # 默認永續增長率 2.5%
DEFAULT_TAX_RATE = 0.25  # 默認稅率 25%

# 行業分類映射
SECTOR_MAPPING = {
    "Technology": ["軟體", "硬體", "半導體", "雲端服務"],
    "Healthcare": ["製藥", "生物技術", "醫療器材"],
    "Financial": ["銀行", "保險", "證券", "金融科技"],
    "Consumer": ["零售", "消費品", "電商"],
    "Energy": ["石油", "天然氣", "新能源"],
    "Industrial": ["製造業", "航空", "物流"],
    "Telecom": ["電信", "網路服務"],
    "Utilities": ["電力", "水務", "公用事業"],
    "Real Estate": ["房地產", "REITs"],
    "Materials": ["化工", "鋼鐵", "原材料"]
}

# P/E比率基準值（按行業）
PE_BENCHMARKS = {
    "Technology": {"low": 15, "median": 25, "high": 40},
    "Healthcare": {"low": 12, "median": 20, "high": 35},
    "Financial": {"low": 8, "median": 12, "high": 18},
    "Consumer": {"low": 10, "median": 18, "high": 30},
    "Energy": {"low": 8, "median": 15, "high": 25},
    "Industrial": {"low": 10, "median": 16, "high": 25},
    "Telecom": {"low": 8, "median": 14, "high": 20},
    "Utilities": {"low": 12, "median": 18, "high": 25},
    "Real Estate": {"low": 10, "median": 15, "high": 25},
    "Materials": {"low": 8, "median": 14, "high": 22}
}

# EV/EBITDA基準值（按行業）
EV_EBITDA_BENCHMARKS = {
    "Technology": {"low": 10, "median": 18, "high": 30},
    "Healthcare": {"low": 8, "median": 15, "high": 25},
    "Financial": {"low": 5, "median": 8, "high": 12},
    "Consumer": {"low": 6, "median": 12, "high": 20},
    "Energy": {"low": 4, "median": 8, "high": 15},
    "Industrial": {"low": 6, "median": 10, "high": 16},
    "Telecom": {"low": 5, "median": 9, "high": 14},
    "Utilities": {"low": 7, "median": 11, "high": 16},
    "Real Estate": {"low": 8, "median": 14, "high": 22},
    "Materials": {"low": 5, "median": 9, "high": 15}
}

# 推薦評分權重
RECOMMENDATION_WEIGHTS = {
    "valuation": 0.35,  # 估值權重
    "financial_health": 0.25,  # 財務健康度權重
    "growth_prospects": 0.20,  # 成長前景權重
    "market_position": 0.15,  # 市場地位權重
    "management_quality": 0.05  # 管理品質權重
}

# 風險等級定義
RISK_LEVELS = {
    "LOW": {"score_range": (0, 30), "description": "低風險"},
    "MEDIUM": {"score_range": (30, 60), "description": "中等風險"},
    "HIGH": {"score_range": (60, 80), "description": "高風險"},
    "VERY_HIGH": {"score_range": (80, 100), "description": "極高風險"}
}

# 投資時間範圍
TIME_HORIZONS = {
    "SHORT_TERM": "3-12個月",
    "MEDIUM_TERM": "1-3年",
    "LONG_TERM": "3年以上"
}

# 可比公司數量限制
MAX_COMPARABLE_COMPANIES = 10
MIN_COMPARABLE_COMPANIES = 3

# DCF預測參數限制
MAX_PROJECTION_YEARS = 10
MIN_PROJECTION_YEARS = 3

# 數據源配置
DATA_SOURCES = {
    "primary": "alpha_vantage",
    "backup": ["yahoo_finance", "quandl"],
    "real_time": "websocket_feed"
}

# 貨幣代碼
SUPPORTED_CURRENCIES = ["USD", "EUR", "JPY", "GBP", "CNY", "TWD"]

# 市場代碼
SUPPORTED_MARKETS = {
    "US": ["NYSE", "NASDAQ"],
    "EU": ["LSE", "EURONEXT"],
    "ASIA": ["TSE", "HKEX", "SSE", "SZSE", "TWSE"]
}

# 錯誤代碼
ERROR_CODES = {
    "INVALID_SYMBOL": "E001",
    "DATA_NOT_AVAILABLE": "E002",
    "API_RATE_LIMIT": "E003",
    "CALCULATION_ERROR": "E004",
    "INSUFFICIENT_DATA": "E005"
}
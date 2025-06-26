"""
Utility functions for investment analysis
投資分析工具實用函數
"""

def format_currency(amount, currency="USD"):
    """Format amount as currency"""
    return f"{currency} {amount:,.2f}"

def calculate_percentage_change(old_value, new_value):
    """Calculate percentage change between two values"""
    if old_value == 0:
        return 0
    return ((new_value - old_value) / old_value) * 100

def validate_ticker_symbol(symbol):
    """Validate stock ticker symbol format"""
    if not symbol or not isinstance(symbol, str):
        return False
    return symbol.upper().replace(" ", "").isalpha()

class ConfigManager:
    """Configuration management for the application"""
    
    def __init__(self):
        self.config = {
            "api_timeout": 30,
            "max_retries": 3,
            "default_currency": "USD"
        }
    
    def get(self, key, default=None):
        return self.config.get(key, default)
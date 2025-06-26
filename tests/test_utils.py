"""
Test cases for utility functions
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from utils import format_currency, calculate_percentage_change, validate_ticker_symbol, ConfigManager

def test_format_currency():
    """Test currency formatting"""
    assert format_currency(1000) == "USD 1,000.00"
    assert format_currency(1234.56, "EUR") == "EUR 1,234.56"

def test_calculate_percentage_change():
    """Test percentage change calculation"""
    assert calculate_percentage_change(100, 110) == 10.0
    assert calculate_percentage_change(100, 90) == -10.0
    assert calculate_percentage_change(0, 10) == 0

def test_validate_ticker_symbol():
    """Test ticker symbol validation"""
    assert validate_ticker_symbol("AAPL") == True
    assert validate_ticker_symbol("MSFT") == True
    assert validate_ticker_symbol("123") == False
    assert validate_ticker_symbol("") == False
    assert validate_ticker_symbol(None) == False

def test_config_manager():
    """Test configuration manager"""
    config = ConfigManager()
    assert config.get("api_timeout") == 30
    assert config.get("nonexistent", "default") == "default"
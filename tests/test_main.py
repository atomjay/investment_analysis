"""
Test cases for main module
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from main import main

def test_main_function():
    """Test main function runs without error"""
    try:
        main()
        assert True
    except Exception as e:
        assert False, f"Main function failed: {e}"
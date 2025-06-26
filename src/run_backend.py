#!/usr/bin/env python3
"""
CapitalCore Backend Server Launcher
啟動投資分析後端服務器
"""

import os
import sys
import logging
from pathlib import Path

# 添加項目根目錄到Python路徑
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# 設置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('logs/backend.log') if os.path.exists('logs') else logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def main():
    """啟動後端服務器"""
    try:
        logger.info("正在啟動 CapitalCore 投資分析後端服務器...")
        
        # 檢查Python版本
        if sys.version_info < (3, 8):
            logger.error("需要 Python 3.8 或更高版本")
            sys.exit(1)
        
        # 設置環境變量
        os.environ.setdefault('FLASK_ENV', 'development')
        os.environ.setdefault('PORT', '8000')
        
        # 導入並啟動Flask應用
        from src.frontend.web_app import app
        
        # 獲取配置
        port = int(os.environ.get('PORT', 8000))
        debug = os.environ.get('FLASK_ENV') == 'development'
        
        logger.info(f"服務器配置:")
        logger.info(f"  - 端口: {port}")
        logger.info(f"  - 調試模式: {debug}")
        logger.info(f"  - API地址: http://localhost:{port}")
        logger.info(f"  - 健康檢查: http://localhost:{port}/api/health")
        
        # 啟動服務器
        app.run(
            debug=debug,
            host='0.0.0.0',
            port=port,
            threaded=True
        )
        
    except ImportError as e:
        logger.error(f"導入錯誤: {e}")
        logger.error("請確保已安裝所有依賴: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        logger.error(f"啟動失敗: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
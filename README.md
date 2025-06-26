# iBank - 外商投資銀行分析工具

> 專業級投資分析平台，整合四種權威估值方法，為您提供精準的股票分析和智能投資建議

## 🚀 快速開始

### 系統要求
- Python 3.8+
- Node.js 18+
- npm 或 yarn

### 1. 克隆項目
```bash
git clone <your-repo-url>
cd ibank
```

### 2. 安裝後端依賴
```bash
pip install -r requirements.txt
```

### 3. 安裝前端依賴
```bash
cd src/frontend
npm install
```

### 4. 啟動後端服務器
```bash
# 從項目根目錄
python src/run_backend.py
```
後端將在 http://localhost:8000 啟動

### 5. 啟動前端開發服務器
```bash
# 在 src/frontend 目錄
npm run dev
```
前端將在 http://localhost:3000 啟動

## 📊 核心功能

### 四種專業估值方法

1. **相對估值法 (CCA)**
   - 同業公司比較分析
   - P/E、EV/EBITDA 倍數分析
   - 行業估值區間評估

2. **現金流折現法 (DCF)**
   - 未來現金流預測
   - WACC 計算
   - 敏感性分析

3. **交易比率法 (PTA)**
   - 市場交易案例分析
   - 併購溢價評估
   - 交易倍數比較

4. **資產基礎法**
   - 淨資產價值計算
   - 清算價值評估
   - 安全邊際分析

### 智能投資建議
- **五級推薦系統**: 強烈買入 / 買入 / 持有 / 賣出 / 強烈賣出
- **風險評估**: 多維度風險分析
- **投資理由**: 詳細的買入/賣出理由說明
- **時間範圍**: 短期、中期、長期投資建議

## 🏗️ 技術架構

### 後端 (Python)
- **框架**: Flask + Flask-CORS
- **分析引擎**: 自研多重估值算法
- **數據處理**: NumPy, Pandas
- **API設計**: RESTful API

### 前端 (React)
- **框架**: Next.js 14 + TypeScript
- **UI庫**: TailwindCSS + Headless UI
- **狀態管理**: TanStack Query
- **動畫**: Framer Motion
- **圖表**: Recharts

## 📁 項目結構

```
ibank/
├── src/
│   ├── backend/
│   │   ├── analysis_engine.py       # 主分析引擎
│   │   ├── valuation/              # 估值方法模組
│   │   │   ├── cca_analyzer.py     # 相對估值法
│   │   │   └── dcf_analyzer.py     # 現金流折現法
│   │   ├── recommendation/         # 推薦引擎
│   │   └── data/                   # 數據獲取
│   ├── frontend/
│   │   ├── app/                    # Next.js App Router
│   │   ├── components/             # React 組件
│   │   ├── lib/                    # 工具函數
│   │   └── types/                  # TypeScript 類型
│   ├── shared/
│   │   ├── types.py                # 共享數據類型
│   │   └── constants.py            # 系統常量
│   └── run_backend.py              # 後端啟動器
├── tests/                          # 測試文件
├── requirements.txt                # Python 依賴
└── CLAUDE.md                      # 開發規範
```

## 🔧 開發指南

### 後端開發
1. 遵循 `CLAUDE.md` 中的開發規範
2. 所有新功能需要添加測試
3. 使用類型提示 (Type Hints)
4. API 端點需要適當的錯誤處理

### 前端開發
1. 使用 TypeScript 確保類型安全
2. 遵循 React 最佳實踐
3. 組件需要適當的 prop 類型定義
4. 使用 TailwindCSS 進行樣式設計

### 測試
```bash
# 運行後端測試
python -m pytest tests/

# 運行前端測試 (當添加後)
cd src/frontend
npm test
```

## 📊 API 文檔

### 主要端點

- `GET /api/health` - 健康檢查
- `POST /api/analyze` - 股票分析
- `POST /api/batch_analyze` - 批量分析  
- `GET /api/market_overview` - 市場概況
- `GET /api/supported_symbols` - 支援股票列表

### 分析請求示例
```json
{
  "symbol": "AAPL",
  "analysis_type": "full"
}
```

### 響應示例
```json
{
  "symbol": "AAPL",
  "company_name": "Apple Inc.",
  "current_price": 180.00,
  "target_price": 195.50,
  "potential_return": 8.6,
  "recommendation": {
    "type": "buy",
    "display_name": "買入",
    "overall_score": 75.2,
    "risk_level": "中等風險"
  }
}
```

## 🎯 投資分析流程

1. **輸入股票代號** (如 AAPL, MSFT)
2. **選擇分析類型** (快速/完整)
3. **執行多重估值** - 系統自動運行四種估值方法
4. **生成智能建議** - AI 整合分析結果
5. **查看詳細報告** - 包含風險因素和催化因子

## ⚠️ 重要聲明

- **僅供教育和研究用途**
- **投資有風險，決策需謹慎**
- **所有分析結果僅作參考，不構成投資建議**
- **請在做出投資決定前諮詢專業投資顧問**

## 🤝 貢獻指南

1. Fork 本倉庫
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📄 許可證

本項目僅供教育和研究用途。請參閱項目中的許可證文件了解詳情。

## 📞 支持

如有問題或建議，請：
1. 查看項目文檔
2. 創建 GitHub Issue
3. 參考 `CLAUDE.md` 開發指南

---

**Built with ❤️ using Claude Code**
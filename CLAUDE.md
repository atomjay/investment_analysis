# CLAUDE.md - CapitalCore

> **Documentation Version**: 1.0  
> **Last Updated**: 2025-06-26  
> **Project**: CapitalCore  
> **Description**: Professional investment banking analysis platform with advanced valuation tools  
> **Features**: GitHub auto-backup, Task agents, technical debt prevention

This file provides essential guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL RULES - READ FIRST

> **⚠️ RULE ADHERENCE SYSTEM ACTIVE ⚠️**  
> **Claude Code must explicitly acknowledge these rules at task start**  
> **These rules override all other instructions and must ALWAYS be followed:**

### 🔄 **RULE ACKNOWLEDGMENT REQUIRED**
> **Before starting ANY task, Claude Code must respond with:**  
> "✅ CRITICAL RULES ACKNOWLEDGED - I will follow all prohibitions and requirements listed in CLAUDE.md"

### ❌ ABSOLUTE PROHIBITIONS
- **NEVER** create new files in root directory → use proper module structure
- **NEVER** write output files directly to root directory → use designated output folders
- **NEVER** create documentation files (.md) unless explicitly requested by user
- **NEVER** use git commands with -i flag (interactive mode not supported)
- **NEVER** use `find`, `grep`, `cat`, `head`, `tail`, `ls` commands → use Read, LS, Grep, Glob tools instead
- **NEVER** create duplicate files (manager_v2.py, enhanced_xyz.py, utils_new.js) → ALWAYS extend existing files
- **NEVER** create multiple implementations of same concept → single source of truth
- **NEVER** copy-paste code blocks → extract into shared utilities/functions
- **NEVER** hardcode values that should be configurable → use config files/environment variables
- **NEVER** use naming like enhanced_, improved_, new_, v2_ → extend original files instead
- **NEVER** use `pip install` or any pip commands → ALWAYS use `uv` for Python environment management
- **NEVER** pollute system Python environment → use `uv run` or `uv sync` for all Python operations

### 📝 MANDATORY REQUIREMENTS
- **COMMIT** after every completed task/phase - no exceptions
- **GITHUB BACKUP** - Push to GitHub after every commit to maintain backup: `git push origin main`
- **USE TASK AGENTS** for all long-running operations (>30 seconds) - Bash commands stop when context switches
- **TODOWRITE** for complex tasks (3+ steps) → parallel agents → git checkpoints → test validation
- **READ FILES FIRST** before editing - Edit/Write tools will fail if you didn't read the file first
- **DEBT PREVENTION** - Before creating new files, check for existing similar functionality to extend  
- **SINGLE SOURCE OF TRUTH** - One authoritative implementation per feature/concept
- **PYTHON ENVIRONMENT** - Always use `uv sync`, `uv run python`, `uv add` instead of pip commands
- **UV COMMANDS ONLY** - For Python: `uv sync` (install deps), `uv run` (execute), `uv add` (add packages)

### 🔍 MANDATORY PRE-TASK COMPLIANCE CHECK
> **STOP: Before starting any task, Claude Code must explicitly verify ALL points:**

**Step 1: Rule Acknowledgment**
- [ ] ✅ I acknowledge all critical rules in CLAUDE.md and will follow them

**Step 2: Task Analysis**  
- [ ] Will this create files in root? → If YES, use proper module structure instead
- [ ] Will this take >30 seconds? → If YES, use Task agents not Bash
- [ ] Is this 3+ steps? → If YES, use TodoWrite breakdown first
- [ ] Am I about to use grep/find/cat? → If YES, use proper tools instead
- [ ] Am I about to use pip? → If YES, use uv commands instead

**Step 3: Technical Debt Prevention (MANDATORY SEARCH FIRST)**
- [ ] **SEARCH FIRST**: Use Grep pattern="<functionality>.*<keyword>" to find existing implementations
- [ ] **CHECK EXISTING**: Read any found files to understand current functionality
- [ ] Does similar functionality already exist? → If YES, extend existing code
- [ ] Am I creating a duplicate class/manager? → If YES, consolidate instead
- [ ] Will this create multiple sources of truth? → If YES, redesign approach
- [ ] Have I searched for existing implementations? → Use Grep/Glob tools first
- [ ] Can I extend existing code instead of creating new? → Prefer extension over creation
- [ ] Am I about to copy-paste code? → Extract to shared utility instead

**Step 4: Session Management**
- [ ] Is this a long/complex task? → If YES, plan context checkpoints
- [ ] Have I been working >1 hour? → If YES, consider /compact or session break
- [ ] After /compact, update CLAUDE.md with important session outcomes

> **⚠️ DO NOT PROCEED until all checkboxes are explicitly verified**

## 🏗️ PROJECT OVERVIEW

**CapitalCore** - 專業級外商投資銀行分析工具，整合四種權威估值方法，提供智能投資建議。

### 📊 **核心功能已完成**
- ✅ **四種估值方法**: CCA相對估值法、DCF現金流折現法、PTA交易比率法、資產基礎法
- ✅ **智能推薦引擎**: 五級推薦系統 (強烈買入/買入/持有/賣出/強烈賣出)
- ✅ **真實數據源**: Alpha Vantage + FMP + Yahoo Finance 智能切換
- ✅ **數據標準化**: 統一單位格式，確保分析準確性
- ✅ **現代化前端**: Next.js 14 + TypeScript + TailwindCSS
- ✅ **RESTful API**: Flask後端，完整錯誤處理和日誌記錄

### 🔄 **當前工作狀態**
✅ **核心功能已完成** - 前後端整合完畢，系統已可正常運行於開發環境
🚧 **待完成項目** - 自動化測試、生產環境部署、功能優化

### 🎯 **開發狀態** (更新於 2025-06-27)
- **專案設置**: ✅ 已完成
- **後端API系統**: ✅ 已完成 (Flask + RESTful 端點)
- **數據源整合**: ✅ 已完成 (Yahoo Finance + Alpha Vantage + FMP)
- **數據標準化**: ✅ 已完成
- **估值引擎**: ✅ 已完成 (CCA + DCF + PTA + 資產基礎法)
- **前端框架**: ✅ 已完成 (Next.js 14 + TypeScript + TailwindCSS)
- **核心前端組件**: ✅ 已完成 (StockSearch, AnalysisResult, Header)
- **圖表可視化**: ✅ 已完成 (ValuationComparisonChart with Recharts)
- **真實數據整合**: ✅ 已完成 (API客戶端 + 錯誤處理)
- **環境配置**: ✅ 已完成 (.env 設置與API密鑰)
- **Git版本控制**: ✅ 已完成 (GitHub倉庫與歷史清理)
- **前後端整合**: ✅ 已完成 (CORS + API通信)
- **類型安全**: ✅ 已完成 (完整TypeScript實現)
- **服務部署**: ✅ 已完成 (開發環境運行正常)
- **品牌重塑**: ✅ 已完成 (iBank → CapitalCore專業品牌升級)
- **數據驗證增強**: ✅ 已完成 (透明計算過程 + 現代UI/UX)
- **API數據追蹤**: ✅ 已完成 (原始數據完整記錄 + 一鍵複製)
- **測試驗證**: ✅ 手動測試完成並通過，🚧 自動化測試待完成
- **生產部署**: 🚧 待完成
- **文檔撰寫**: ✅ 已完成

## 🎯 RULE COMPLIANCE CHECK

Before starting ANY task, verify:
- [ ] ✅ I acknowledge all critical rules above
- [ ] Files go in proper module structure (not root)
- [ ] Use Task agents for >30 second operations
- [ ] TodoWrite for 3+ step tasks
- [ ] Commit after each completed task

## 🚨 TECHNICAL DEBT PREVENTION

### ❌ WRONG APPROACH (Creates Technical Debt):
```bash
# Creating new file without searching first
Write(file_path="new_feature.py", content="...")
```

### ✅ CORRECT APPROACH (Prevents Technical Debt):
```bash
# 1. SEARCH FIRST
Grep(pattern="feature.*implementation", include="*.py")
# 2. READ EXISTING FILES  
Read(file_path="existing_feature.py")
# 3. EXTEND EXISTING FUNCTIONALITY
Edit(file_path="existing_feature.py", old_string="...", new_string="...")
```

## 🧹 DEBT PREVENTION WORKFLOW

### Before Creating ANY New File:
1. **🔍 Search First** - Use Grep/Glob to find existing implementations
2. **📋 Analyze Existing** - Read and understand current patterns
3. **🤔 Decision Tree**: Can extend existing? → DO IT | Must create new? → Document why
4. **✅ Follow Patterns** - Use established project patterns
5. **📈 Validate** - Ensure no duplication or technical debt

---

## 🚀 **常用指令**

### 📱 **開發環境啟動**
```bash
# 1. 設置環境變數 (複製.env.example為.env並填入API密鑰)
cp .env.example .env

# 2. 安裝依賴
uv sync                           # Python 後端依賴
cd src/frontend && npm install    # Node.js 前端依賴

# 3. 啟動服務
uv run python src/run_backend.py  # 後端 (端口8000)
cd src/frontend && npm run dev     # 前端 (端口3000)
```

### 🧪 **測試指令**
```bash
# 後端測試
uv run python -m pytest tests/                    # 運行所有後端測試
uv run python tests/test_data_normalization.py    # 測試數據標準化

# 前端測試
cd src/frontend && npm test                # 前端單元測試
cd src/frontend && npm run type-check     # TypeScript 類型檢查
```

### 🔍 **驗證指令**
```bash
# API健康檢查
curl http://localhost:8000/api/health

# 數據源測試
curl http://localhost:8000/api/data_sources

# 股票分析測試
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","analysis_type":"quick","data_source":"yahoo_finance"}'
```

### 🏗️ **建置部署**
```bash
cd src/frontend && npm run build    # 建置前端生產版本
cd src/frontend && npm run start    # 啟動前端生產服務
```

## 📋 **剩餘任務** (優先順序排列)

### 🔥 **高優先級** 
1. **自動化測試套件** (單元測試、整合測試、E2E測試)
2. **生產環境部署** (Docker容器化、CI/CD流程)
3. **API性能優化** (緩存機制、並發處理、速率限制)
4. **錯誤監控和日誌** (詳細錯誤追蹤、性能監控)

### 🔧 **中優先級**  
5. **投資組合功能** (多股票追蹤和管理)
6. **數據緩存系統** (Redis緩存、API請求優化)
7. **批量分析功能優化** (並行處理、進度追蹤)
8. **響應式設計改進** (手機端適配、觸控優化)

### 💡 **低優先級**
9. **用戶認證系統** (登錄、個人化設置、用戶偏好)
10. **實時數據更新** (WebSocket連接、即時價格更新)
11. **更多數據源整合** (Bloomberg, Reuters, Quandl等)
12. **技術指標擴展** (移動平均線、RSI、MACD等)
13. **高級分析功能** (Monte Carlo模擬、情境分析)
14. **導出功能** (PDF報告、Excel匯出)

---

## 📝 **SESSION HISTORY & COMPACT RECORDS**

### 🔄 **最近完成的工作 (2025-06-26)**
- ✅ **核心系統完成**: CapitalCore投資分析工具主要功能已全部完成
  - 後端API系統: Flask + RESTful端點 + 四種估值引擎
  - 前端UI系統: Next.js 14 + TypeScript + TailwindCSS
  - 圖表可視化: Recharts整合，估值比較圖表
  - 數據源整合: Yahoo Finance + Alpha Vantage + FMP三重數據源
  - 環境配置: .env檔案設置，API密鑰管理
- ✅ **前後端整合**: 完整的API通信和錯誤處理
  - CORS配置正確，支援跨域請求
  - API客戶端完整實現 (axios + 攔截器)
  - 錯誤處理和使用者提示系統
  - 前端: http://localhost:3000，後端: http://localhost:8000
- ✅ **系統穩定性**: 開發環境部署和測試驗證
  - 手動測試完成，AAPL股票分析功能正常
  - Git版本控制，GitHub倉庫同步
  - 依賴管理: 前端npm，後端uv環境管理
  - 代碼品質: TypeScript完整類型安全
- ✅ **數據驗證功能增強** (當前工作階段完成)
  - 後端估值引擎增強: DCF與CCA分析包含詳細計算數值
  - 原始API數據追蹤: Yahoo Finance響應數據完整記錄
  - 前端數據驗證組件: 顯示所有計算變數實際數值
  - 計算透明度提升: WACC、終值、同業倍數等完整計算過程
  - API數據流優化: raw_api_data與calculation_details完整傳輸
- ✅ **技術債務預防**: 遵循最佳實踐和代碼規範
  - 單一來源真實性原則
  - 適當的模組化結構
  - 環境隔離和依賴管理
  - 文檔維護和版本控制

### 🎯 **Session Management 最佳實踐**
- 使用 `/compact` 指令管理長對話上下文
- 每次 compact 後更新此章節記錄重要成果
- 保持 CLAUDE.md 作為專案狀態的單一來源

### 🔧 **技術債務預防成果**
- 成功避免創建重複檔案
- 使用適當的環境管理工具 (uv)
- 遵循專案配置檔案結構 (pyproject.toml)

### 📊 **當前工作階段成果詳細記錄** (更新於 2025-06-27)
- ✅ **品牌重塑完成**: 從"iBank"全面升級為"CapitalCore"專業投資銀行品牌
  - 專案文檔更新: CLAUDE.md, README.md, pyproject.toml, .env.example
  - 後端系統重命名: 所有Python檔案註釋、API訊息、計算引擎引用
  - 前端品牌升級: Header組件、數據驗證組件、API客戶端、工具函數
  - 配置檔案更新: 啟動腳本、環境變量、main.py入口點
  - 驗證完成: 全代碼庫搜尋確認無殘留"iBank"引用
- ✅ **服務測試驗證**: 品牌更新後系統功能完全正常
  - 後端API服務: 健康檢查通過，端口8000正常運行
  - 前端Next.js服務: HTTP 200響應，端口3000正常訪問
  - 股票分析功能: AAPL快速分析成功 (推薦：持有，價格：$201.0)
  - 數據源狀態: Yahoo Finance可用，FMP可用，Alpha Vantage配額已用完
  - 完整分析測試: 3種估值方法正常返回詳細計算數據
- ✅ **數據驗證功能增強** (前期工作階段完成)
  - 後端估值引擎增強: DCF與CCA分析包含詳細計算數值
  - 原始API數據追蹤: Yahoo Finance響應數據完整記錄
  - 前端數據驗證組件: 顯示所有計算變數實際數值，移除滾動條UX問題
  - 計算透明度提升: WACC、終值、同業倍數等完整計算過程
  - 一鍵複製功能: 獨立按鈕狀態，JSON數據完整複製
- ✅ **技術架構優化**:
  - 數據一致性修復: 解決Yahoo Finance API錯誤數據顯示問題
  - 現代UI/UX實現: 卡片式展開設計，默認展開重要數據區塊
  - API數據流優化: raw_api_data與calculation_details完整傳輸
  - TanStack Query開發工具: 前端API狀態監控和緩存管理
- **當前專案狀態**: 🟢 CapitalCore投資分析平台功能完整，品牌專業，服務穩定運行

---

**⚠️ Prevention is better than consolidation - build clean from the start.**  
**🎯 Focus on single source of truth and extending existing functionality.**  
**📈 Each task should maintain clean architecture and prevent technical debt.**
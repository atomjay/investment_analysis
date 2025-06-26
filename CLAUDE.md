# CLAUDE.md - ibank

> **Documentation Version**: 1.0  
> **Last Updated**: 2025-06-26  
> **Project**: ibank  
> **Description**: Simple banking project with proper structure  
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

### 📝 MANDATORY REQUIREMENTS
- **COMMIT** after every completed task/phase - no exceptions
- **GITHUB BACKUP** - Push to GitHub after every commit to maintain backup: `git push origin main`
- **USE TASK AGENTS** for all long-running operations (>30 seconds) - Bash commands stop when context switches
- **TODOWRITE** for complex tasks (3+ steps) → parallel agents → git checkpoints → test validation
- **READ FILES FIRST** before editing - Edit/Write tools will fail if you didn't read the file first
- **DEBT PREVENTION** - Before creating new files, check for existing similar functionality to extend  
- **SINGLE SOURCE OF TRUTH** - One authoritative implementation per feature/concept

### 🔍 MANDATORY PRE-TASK COMPLIANCE CHECK
> **STOP: Before starting any task, Claude Code must explicitly verify ALL points:**

**Step 1: Rule Acknowledgment**
- [ ] ✅ I acknowledge all critical rules in CLAUDE.md and will follow them

**Step 2: Task Analysis**  
- [ ] Will this create files in root? → If YES, use proper module structure instead
- [ ] Will this take >30 seconds? → If YES, use Task agents not Bash
- [ ] Is this 3+ steps? → If YES, use TodoWrite breakdown first
- [ ] Am I about to use grep/find/cat? → If YES, use proper tools instead

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

**iBank** - 專業級外商投資銀行分析工具，整合四種權威估值方法，提供智能投資建議。

### 📊 **核心功能已完成**
- ✅ **四種估值方法**: CCA相對估值法、DCF現金流折現法、PTA交易比率法、資產基礎法
- ✅ **智能推薦引擎**: 五級推薦系統 (強烈買入/買入/持有/賣出/強烈賣出)
- ✅ **真實數據源**: Alpha Vantage + FMP + Yahoo Finance 智能切換
- ✅ **數據標準化**: 統一單位格式，確保分析準確性
- ✅ **現代化前端**: Next.js 14 + TypeScript + TailwindCSS
- ✅ **RESTful API**: Flask後端，完整錯誤處理和日誌記錄

### 🔄 **當前工作狀態**
正在完成React前端剩餘組件和圖表可視化功能。

### 🎯 **DEVELOPMENT STATUS**
- **Project Setup**: ✅ Complete
- **Backend API**: ✅ Complete
- **Data Sources**: ✅ Complete  
- **Data Normalization**: ✅ Complete
- **Valuation Engines**: ✅ Complete
- **Frontend Framework**: ✅ Complete
- **Real Data Integration**: ✅ Complete
- **Frontend Components**: 🚧 In Progress
- **Testing**: 🚧 Pending
- **Documentation**: ✅ Complete

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

## 🚀 COMMON COMMANDS

```bash
# 啟動開發環境
python src/run_backend.py          # 後端 (端口8000)
cd src/frontend && npm run dev     # 前端 (端口3000)

# 測試命令
python -m pytest tests/                    # 運行後端測試
python tests/test_data_normalization.py    # 測試數據標準化
cd src/frontend && npm test                # 前端測試

# 數據驗證
python -c "from src.backend.data.real_data_fetcher import RealStockDataFetcher; f = RealStockDataFetcher(); print(f.fetch_stock_data('AAPL'))"

# 構建部署
cd src/frontend && npm run build    # 構建前端
pip install -r requirements.txt     # 安裝依賴
```

## 📋 **REMAINING TASKS (Priority Order)**

### 🔥 **HIGH PRIORITY**
1. **完成React前端組件** (AnalysisResult, MarketOverview, 圖表組件)
2. **添加圖表可視化** (估值比較圖、趨勢分析圖)
3. **優化API性能** (緩存機制、並發處理)

### 🔧 **MEDIUM PRIORITY**  
4. **創建投資組合功能** (多股票追蹤和管理)
5. **部署到雲端平台** (AWS/GCP/Azure 配置)
6. **完善測試覆蓋** (單元測試、集成測試、E2E測試)

### 💡 **LOW PRIORITY**
7. **用戶認證系統** (登錄、個人化設置)
8. **實時數據更新** (WebSocket連接)
9. **集成更多數據源** (Bloomberg, Reuters等)
10. **添加技術指標** (移動平均線、RSI等)

---

## 📝 **SESSION HISTORY & COMPACT RECORDS**

### 🔄 **最近完成的工作 (2025-06-26)**
- ✅ **MCP Playwright 功能移除**: 成功從專案中移除所有 Playwright 相關依賴
  - 移除的套件: `@playwright/mcp`, `@playwright/test`, `playwright`
  - 清理並重新安裝 frontend 依賴
  - 使用 `uv` 管理 Python 環境，避免影響系統環境
- ✅ **系統測試驗證**: 確認前後端服務正常運行
  - 後端: 運行於 port 8000，API 端點正常
  - 前端: 運行於 port 3002，服務正常
  - 整合測試: AAPL 股票分析 API 測試成功

### 🎯 **Session Management 最佳實踐**
- 使用 `/compact` 指令管理長對話上下文
- 每次 compact 後更新此章節記錄重要成果
- 保持 CLAUDE.md 作為專案狀態的單一來源

### 🔧 **技術債務預防成果**
- 成功避免創建重複檔案
- 使用適當的環境管理工具 (uv vs pip)
- 遵循專案配置檔案結構 (pyproject.toml vs requirements.txt)

---

**⚠️ Prevention is better than consolidation - build clean from the start.**  
**🎯 Focus on single source of truth and extending existing functionality.**  
**📈 Each task should maintain clean architecture and prevent technical debt.**
# FuFood 食物庫存管理（前端）

一個以 **React + .NET + Node.js AI 微服務** 建構的食材管理應用，幫助使用者透過「拍照或手動登錄」管理冰箱食材、追蹤到期日、接收 LINE 通知，未來可擴充 AI 功能（影像辨識 / OCR / 食譜生成）。

---

## 🧭 專案簡介

此專案為食物管理平台 MVP 版本，整合 **LINE 登入 + 自家註冊登入 + PWA 推播通知 + Gemini AI Code Review**，使用者可上傳食材照片、追蹤有效期限，並自動接收提醒與食譜建議。以前後端分離架構開發，並支援 AI 擴充與雲端部署。

---

## 🔹 前端技術棧

| 項目      | 技術                         | 說明                       |
| --------- | ---------------------------- | -------------------------- |
| 主框架    | React 18 + TypeScript + Vite | 高效 SPA 架構              |
| 樣式系統  | Tailwind CSS + Shadcn UI     | 統一設計系統、支援暗色主題 |
| 狀態管理  | Redux Toolkit                | 管理使用者與 UI 狀態       |
| 資料快取  | React Query                  | API 快取與重新整理         |
| 表單驗證  | React Hook Form + Zod        | 驗證與錯誤顯示             |
| API 通訊  | Axios + Interceptor          | 自動帶憑證與錯誤攔截       |
| 登入系統  | LINE OAuth 2.0 + 自家帳號    | 雙登入機制                 |
| 推播通知  | LINE Bot 綁定設定頁          | 控制提醒頻率               |
| PWA       | Service Worker + Manifest    | 可安裝至手機桌面           |
| 金流      | NewebPay SDK                 | 串接付款、會員訂閱         |
| AI Review | Gemini Code Assist           | 自動 Code Review 與建議    |

---

## 📂 專案資料夾結構

```
.
└── FuFood/
    ├── .github/
    │   └── workflows/
    │       ├── auto-pr.yml         → 雙 PR 自動建立工作流
    │       ├── release.yml         → 自動版本發佈工作流
    │       └── gemini-review.yml   → Gemini Code Review 工作流
    ├── src/
    │   ├── components/
    │   │   ├── pages/           → 頁面元件
    │   │   ├── shared/          → 共用元件
    │   │   └── [PageName]/      → 頁面資料夾
    │   │       ├── Section.tsx
    │   │       ├── Part.tsx
    │   │       └── index.tsx    → 主元件
    │   ├── assets/              → 圖片、icon、字型
    │   ├── index.css            → 全域樣式或 Tailwind 設定
    │   ├── Router.tsx           → 路由檔案
    │   └── main.tsx             → 入口檔案
    ├── vite.config.ts           → Vite 設定檔
    ├── package.json             → 專案依賴與指令
    ├── index.html               → 專案入口 HTML
    ├── .gemini-code-review.json → Gemini Code Review 設定檔
    └── README.md
```

---

## 🌱 Git Flow 規範

### 主分支

| 分支     | 用途         | 部署環境            |
| -------- | ------------ | ------------------- |
| **main** | 正式版本     | GCP / AWS           |
| **qa**   | 測試版本     | Vercel / 測試伺服器 |
| **dev**  | 開發整合分支 | 本地 / 暫存環境     |

### 副分支

| 分支        | 用途             | 範例                |
| ----------- | ---------------- | ------------------- |
| **Feature** | 新功能開發       | Feature-home-page   |
| **Fix**     | 錯誤修正         | Fix-api-bug         |
| **Update**  | 文件或設定更新   | Update-project-spec |
| **Hotfix**  | 緊急修正上線問題 | Hotfix-payment-bug  |

---

## 📝 Commit 規範

請遵循以下前綴：

| 前綴        | 用途             |
| ----------- | ---------------- |
| `feat:`     | 新增功能         |
| `fix:`      | 修正 bug         |
| `style:`    | 樣式調整         |
| `docs:`     | 文件更新         |
| `refactor:` | 重構程式碼       |
| `chore:`    | 設定檔、依賴更新 |

**範例：**

```bash
feat: add LINE OAuth 2.0 login
fix: correct expiry date calculation
```

---

## 🚀 開發流程

### 1️⃣ 從 dev 建立新分支

```bash
git checkout dev
git pull origin dev
git checkout -b Feature-功能名稱
```

**建議命名格式：**

- `Feature-login-page`
- `Fix-api-error`
- `Update-readme-doc`

### 2️⃣ 開發與提交 Commit

```bash
git add .
git commit -m "feat: 新增登入頁面"
git push origin Feature-功能名稱
```

**請遵守前綴規範**：`feat` / `fix` / `refactor` / `docs` / `chore`

### 3️⃣ 發送 Pull Request（自動雙 PR 流程）

完成開發後，透過 GitHub Actions 的自動 PR 工作流程建立兩個 PR。

#### ⚙️ 自動 PR 工作流程 (`auto-pr.yml`)

使用 **GitHub Actions 手動觸發** 快速建立 QA 與 DEV 的雙 PR：

**步驟：**

1. 進入 Repository → **Actions** 分頁
2. 左側選擇 **Manual Dual Pull Requests** 工作流程
3. 點選 **Run workflow**
4. 填入下列參數：

   | 參數       | 說明                 | 範例                  |
   | ---------- | -------------------- | --------------------- |
   | **branch** | 要建立 PR 的分支名稱 | `Feature-login-page`  |
   | **title**  | PR 標題              | `Feature: login page` |

5. 點選 **Run workflow** 執行

**工作流程會自動：**

- 建立 → `[QA] Feature: login page` PR（目標分支：`qa`）
- 建立 → `[DEV] Feature: login page` PR（目標分支：`dev`）
- 在兩個 PR 中自動包含測試檢查清單與備註說明
- 每個 PR 均會觸發 **Gemini AI Code Review**

#### 📋 PR 描述模板（自動產生）

工作流程會自動在 PR 中附加以下內容：

```markdown
## 🧩 功能摘要

- 自動建立 QA 測試用 PR
- 來源分支：Feature-login-page

## 🧪 測試項目

- [ ] 功能可在 Vercel QA 環境正常運作

## 📎 備註

- 此 PR 為自動建立的測試版本
```

### 4️⃣ QA 測試階段

1. QA 人員在 `qa` 分支的 PR 上進行測試
2. 使用 `/gemini review` 指令觸發 **Gemini AI Code Review**
3. 提出改善建議或審核通過
4. 測試完成後，QA 應批准此 PR

### 5️⃣ 整合至開發環境

1. 測試通過後，`qa` 分支的 PR 應被 **merge**
2. 相應的 `dev` 分支 PR 也應被 **merge**
3. 此時 `dev` 分支已包含最新功能

### 6️⃣ 自動版本發佈流程

當開發完成並準備上線時，使用 **GitHub Actions 自動發佈工作流程**。

#### ⚙️ 自動版本發佈工作流程 (`release.yml`)

此工作流程自動處理版本標記與發佈流程：

**觸發方式：**

- **方式 1 - 自動觸發**：代碼 push 至 `main` 分支時自動執行
- **方式 2 - 手動觸發**：進入 **Actions** → **Auto Release Version** → **Run workflow**

**工作流程執行流程：**

1. **簽出代碼** (Checkout code)

   ```
   ✓ 從 main 分支拉取最新代碼
   ```

2. **提取版本號** (Get version)

   ```
   ✓ 從 package.json 讀取版本（React 前端）
   或
   ✓ 從 .csproj 讀取版本（.NET 後端）
   ```

3. **建立 Git Tag** (Create Git Tag)

   ```
   ✓ 建立 git tag（例如：v0.1.0）
   ✓ 自動 push tag 至 GitHub
   ```

4. **產生 Release Notes** (Generate Release Notes)

   ```
   ✓ 從 CHANGELOG.md 讀取版本說明
   ✓ 自動在 GitHub Releases 建立新版本發佈
   ```

**工作流程會自動產生：**

- 📌 **Git Tag**（例如：`v0.1.0`）
- 📄 **GitHub Release**（含版本號與發佈備註）
- 🔗 **下載連結**（供使用者下載該版本）

---

## 📊 完整開發與發佈流程圖

```
新功能分支 (Feature-xxx)
│
├─ 在 GitHub Actions 中執行
│  "Manual Dual Pull Requests"
│
├─ 自動建立 → QA PR ─────→ Gemini AI Review ─→ QA 測試
│            └── [QA] Feature: xxx
│
└─ 自動建立 → DEV PR ────→ Gemini AI Review ─→ Dev 測試
             └── [DEV] Feature: xxx
│
▼
QA 測試通過 + DEV 整合完成
│
├─ Merge QA PR → qa 分支
│
├─ Merge DEV PR → dev 分支
│
▼
準備上線：建立上線分支
│
└─ git checkout -b dev-v001
   git merge dev → dev-v001
   git push origin dev-v001
│
▼
在 GitHub Actions 中執行
"Auto Release Version"
│
├─ 簽出 main 分支代碼
│
├─ 從 package.json / .csproj 讀取版本
│
├─ 建立 Git Tag (v0.1.0)
│
├─ Push Tag 至 GitHub
│
└─ 自動產生 GitHub Release

▼
✅ 正式上線完成！
```

---

## 🤖 Gemini Code Assist Code Review 整合

本專案已整合 **Gemini Code Assist** 進行自動化 AI Code Review，幫助團隊提升程式碼品質與審查效率。

### 🔧 Gemini Code Assist 設定步驟

#### 1. 安裝 Gemini Code Assist GitHub App

1. 訪問 [Gemini Code Assist GitHub Marketplace](https://github.com/apps/gemini-code-assist)
2. 點選「Install」並選擇此專案的 Repository
3. 授予必要的權限（PR 評論、程式碼審查等）
4. 完成授權後，App 會自動關聯至此 GitHub 組織或個人帳號

#### 2. 設定風格指南（選用）

在專案根目錄建立 `.gemini-code-review.json` 設定檔：

```json
{
  "reviewRules": {
    "severity": ["Critical", "High", "Medium", "Low"],
    "focusAreas": ["security", "performance", "best-practices", "code-style"],
    "customInstructions": "遵循 React 最佳實踐，優先檢查 TypeScript 型別安全"
  },
  "autoReview": {
    "enabled": true,
    "reviewOnNewPR": true,
    "reviewOnUpdate": true
  },
  "styleGuide": {
    "language": "zh-TW",
    "framework": "React",
    "codeStyle": "Airbnb"
  }
}
```

### 📋 在 PR 中使用 Gemini Code Assist

#### 自動審查

當建立新 PR 時，Gemini Code Assist 會自動：

- 產生提取要求（PR）摘要
- 掃描程式碼尋找潛在問題
- 提供改善建議與程式碼片段
- 自動加入為 PR 審查人員

#### 手動叫用指令

在 PR 的任何評論區塊中使用以下指令：

| 指令              | 說明                       | 範例                           |
| ----------------- | -------------------------- | ------------------------------ |
| `/gemini summary` | 產生 PR 變更摘要           | 在評論中輸入 `/gemini summary` |
| `/gemini review`  | 進行詳細程式碼審查         | 在評論中輸入 `/gemini review`  |
| `/gemini`         | 根據 PR 提出自訂問題或建議 | 在評論中輸入 `/gemini`         |
| `/gemini help`    | 查看所有可用指令           | 在評論中輸入 `/gemini help`    |

#### 與 AI 持續互動

- **追問細節**：對 Gemini 的評論提出後續問題，AI 會進一步解釋
- **要求改進**：請 Gemini 針對特定程式碼段提供改善建議
- **尋求最佳實踐**：詢問如何實現更優雅或高效的解決方案

### 📊 Gemini Code Review 工作流程

專案已配置 GitHub Actions 工作流程 `gemini-review.yml`，可在以下情況自動觸發 Gemini Code Review：

```yaml
name: Gemini Code Assist Auto Review

on:
  pull_request:
    types: [opened, synchronize]
  workflow_dispatch:

jobs:
  gemini-review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Trigger Gemini Code Review
        uses: google-gemini/gemini-code-assist-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
```

### 🔐 設定 API 金鑰

1. 在 GitHub Settings → Secrets 中新增 `GEMINI_API_KEY`
2. 取得 API Key：[Google AI Studio](https://aistudio.google.com/app/apikey)
3. 複製 API Key 至 GitHub Secret

### 💡 Code Review 最佳實踐

1. **定期檢查 Gemini 的評論**：不是所有建議都必須接納，但都值得考慮
2. **整合團隊反饋**：結合 Gemini 的自動審查與人工審查
3. **建立團隊規範**：根據團隊風格調整 `.gemini-code-review.json`
4. **持續改進**：記錄常見問題，更新審查規則以預防未來的缺陷

### 📚 Gemini Code Assist 文件

- [官方教學 - 使用 Gemini Code Assist 檢查 GitHub 程式碼](https://developers.google.com/gemini-code-assist/docs/review-github-code?hl=zh-tw)
- [Gemini CLI GitHub Actions 介紹](https://blog.google/technology/developers/introducing-gemini-cli-github-actions/)
- [Gemini Code Review Extension](https://github.com/gemini-cli-extensions/code-review)

---

## 📦 快速開始

### 安裝依賴

```bash
npm install
```

### 開發環境啟動

```bash
npm run dev
```

### 測試

```bash
npm run test
```

### 構建正式版本

```bash
npm run build
```

### 預覽構建結果

```bash
npm run preview
```

---

## 🔗 相關連結

- **Gemini Code Assist**: https://developers.google.com/gemini-code-assist
- **GitHub App**: https://github.com/apps/gemini-code-assist
- **API 金鑰申請**: https://aistudio.google.com/app/apikey

---

## 📝 貢獻指南

1. 遵循本 README 的 Git Flow 與 Commit 規範
2. 建立 Feature 分支進行開發
3. 透過 GitHub Actions **Manual Dual Pull Requests** 自動建立 QA 與 DEV PR
4. 等待 Gemini AI Code Review 與人工審查
5. 測試通過後由管理者進行上線發佈
6. 自動執行 **Auto Release Version** 工作流程完成版本標記與發佈

---

## 📄 授權

此專案採用 MIT License，詳見 LICENSE 檔案。

---

**最後更新**: 2025-11-03  
**版本**: v0.1.0 (MVP)

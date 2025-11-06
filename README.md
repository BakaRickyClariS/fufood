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
    │       ├── auto-pr.yml              → 自動 PR 建立工作流
    │       ├── publish-trigger.yml      → 自動版本發佈工作流
    │       └── unified-release.yml      → 統一版本釋出工作流
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

**建議命名格式：** `Feature-login-page`、`Fix-api-error`、`Update-readme-doc`

### 2️⃣ 開發與提交 Commit

```bash
git add .
git commit -m "feat: 新增登入頁面"
git push origin Feature-功能名稱
```

### 3️⃣ 自動產生 PR（GitHub Actions）

完成開發後，進入 Repository → **Actions** 分頁，選擇 **Auto PR by Branch Naming**，點選 **Run workflow** 自動建立：

- **QA PR**：`[QA] Feature xxx` → 合併至 `qa` 分支
- **DEV PR**：`[DEV] Feature xxx` → 合併至 `dev` 分支

**工作流程會自動：**

- 偵測分支名稱（Feature/Fix/Update/Hotfix）
- 加入適當 Label（feature/bug/documentation/hotfix）
- 整理 Commit 訊息至 PR 描述
- 觸發 **Gemini AI Code Review**（中文反饋）

### 4️⃣ QA 測試與審查

1. QA 人員在 `qa` 分支 PR 測試功能
2. **Gemini AI 自動審查**（已自動用中文回饋，無需手動觸發）
3. 根據回饋進行修正或通過審查
4. QA 批准後 Merge PR

### 5️⃣ 整合至開發環境

1. `qa` 分支 PR 合併後
2. 相應的 `dev` 分支 PR 也應合併
3. `dev` 分支現已包含最新功能

### 6️⃣ 上線版本釋出

當準備上線時，進入 Repository → **Actions** → **Unified Release Workflow**，點選 **Run workflow**，選擇版本升級型態：

**支援版本升級：**

- **patch**（0.0.1 → 0.0.2）：小改進、bug 修復
- **minor**（0.0.2 → 0.1.0）：新功能
- **major**（0.1.0 → 1.0.0）：重大更新

**自動執行流程：**

- 讀取當前版本（package.json / .csproj）
- 升級版本號
- 更新 CHANGELOG.md
- 建立 release 分支（dev-v001 等）
- 產生 Release PR 至 main 分支

### 7️⃣ 最後發佈步驟

Release PR 合併至 main 後，自動觸發 **publish-trigger.yml**：

- 建立 Git tag（v0.1.0）
- 推送 tag 至 GitHub
- 自動產生 GitHub Release
- 完成版本發佈

---

## 🤖 GitHub Actions 自動化工作流程

### 三大核心 Workflow

| Workflow                | 觸發方式                   | 用途                                  |
| ----------------------- | -------------------------- | ------------------------------------- |
| **auto-pr.yml**         | 手動觸發（Actions）        | 自動產生 QA/DEV PR，自動 Label 與摘要 |
| **unified-release.yml** | 手動觸發（Actions）        | 統一版本升級與 Release PR 產生        |
| **publish-trigger.yml** | 自動觸發（PR 合併至 main） | 自動建立 Git tag 與 GitHub Release    |

### 自動化優勢

- ✅ **節省時間**：減少手動 PR、tag、release 操作
- ✅ **降低錯誤**：統一規範、自動驗證分支與版本
- ✅ **加強追蹤**：完整的版本歷史與 Release Notes
- ✅ **提升效率**：團隊協作更順暢，合併流程標準化

---

## 🤖 Gemini AI Code Review 整合（中文審查）

本專案已整合 **Gemini Code Assist** 進行自動化 AI Code Review，所有反饋均**自動用中文呈現**，幫助團隊提升程式碼品質。

### ⚙️ Gemini Code Assist 設定步驟

#### 1. 安裝 GitHub App

1. 訪問 [Gemini Code Assist GitHub Marketplace](https://github.com/apps/gemini-code-assist)
2. 點擊 **Install**
3. 選擇你的專案

#### 2. 新增中文設定檔（已完成 ✅）

在 repo 根目錄已建立 `.gemini-code-review.json`：

```json
{
  "language": "中文",
  "focusAreas": ["正確性", "效能優化", "可維護性", "安全性"]
}
```

此設定自動讓 Gemini 用**中文**進行審查，無需手動觸發任何指令。

#### 3. 完成！全自動運作

- ✅ 建立新 PR → 自動審查
- ✅ 用中文回饋審查意見
- ✅ 約 5 分鐘內產生初步評論
- ✅ 無需手動輸入任何指令

### 📋 手動命令（可選）

如需額外評論或重新審查，可在 PR 留言使用：

| 指令              | 用途             |
| ----------------- | ---------------- |
| `/gemini review`  | 重新進行詳細審查 |
| `/gemini summary` | 產生變更摘要     |
| `/gemini help`    | 查看所有指令     |

### 💡 Gemini Code Review 最佳實踐

1. **定期檢查 Gemini 的中文評論**：理解為何提出該建議
2. **整合團隊反饋**：結合 AI 自動審查與人工審查
3. **記錄常見問題**：改進程式碼習慣
4. **持續改進**：根據團隊風格調整 `.gemini-code-review.json`

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

## 📝 貢獻指南

1. 遵循本 README 的 Git Flow 與 Commit 規範
2. 建立 Feature 分支進行開發
3. 透過 GitHub Actions 自動建立 PR
4. 等待 Gemini AI 中文審查與人工審查
5. 測試通過後由管理者進行上線發佈

---

## 📄 授權

此專案採用 MIT License，詳見 LICENSE 檔案。

---

**最後更新**: 2025-11-06  
**版本**: v0.1.0 (MVP)

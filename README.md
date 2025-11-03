# FuFood 食物庫存管理（前端）

一個以 **React + .NET + Node.js AI 微服務** 建構的食材管理應用，幫助使用者透過「拍照或手動登錄」管理冰箱食材、追蹤到期日、接收 LINE 通知，未來可擴充 AI 功能（影像辨識 / OCR / 食譜生成）。

---

## 🧭 專案簡介

此專案為食物管理平台 MVP 版本，整合 **LINE 登入 + 自家註冊登入 + PWA 推播通知**，使用者可上傳食材照片、追蹤有效期限，並自動接收提醒與食譜建議。以前後端分離架構開發，並支援 AI 擴充與雲端部署。

---

## 🔹 前端技術棧

| 項目     | 技術                         | 說明                       |
| -------- | ---------------------------- | -------------------------- |
| 主框架   | React 18 + TypeScript + Vite | 高效 SPA 架構              |
| 樣式系統 | Tailwind CSS + Shadcn UI     | 統一設計系統、支援暗色主題 |
| 狀態管理 | Redux Toolkit                | 管理使用者與 UI 狀態       |
| 資料快取 | React Query                  | API 快取與重新整理         |
| 表單驗證 | React Hook Form + Zod        | 驗證與錯誤顯示             |
| API 通訊 | Axios + Interceptor          | 自動帶憑證與錯誤攔截       |
| 登入系統 | LINE OAuth 2.0 + 自家帳號    | 雙登入機制                 |
| 推播通知 | LINE Bot 綁定設定頁          | 控制提醒頻率               |
| PWA      | Service Worker + Manifest    | 可安裝至手機桌面           |
| 金流     | NewebPay SDK                 | 串接付款、會員訂閱         |

---

## 📂 專案資料夾結構

```
.
└── FuFood/
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

### 3️⃣ 發送 Pull Request（雙 PR 制）

每支開發分支完成後，需建立 **兩個 PR**：

| 目的     | 目標分支 | PR 標題範例                 | 用途                     |
| -------- | -------- | --------------------------- | ------------------------ |
| 測試驗證 | `qa`     | `[QA] Feature: login page`  | 部署至 Vercel 供 QA 測試 |
| 開發整合 | `dev`    | `[DEV] Feature: login page` | 保持開發分支與測試同步   |

#### PR 描述建議模板

```markdown
## 🧩 功能內容

- 新增登入頁面 UI
- 串接 LINE OAuth 登入流程
- 新增登入失敗錯誤提示

## 🧪 測試項目

- [ ] 登入成功後能正確導向主頁
- [ ] 無效帳號能顯示錯誤訊息
- [ ] 登入後會產生正確的 cookie

## 🧰 相關變更

- 調整 Login API 路由
- 更新 Auth Context 狀態流程

## 📎 備註

- 若對應 Issue，請在此標記：`closes #issue-number`
- 部署後請確認 QA 環境登入功能正常
```

### 4️⃣ 合併與上線流程

**第一步：先合併至 `qa` 進行測試**

**第二步：測試通過後，再合併至 `dev`**

**第三步：管理者從 `dev` 建立上線版本分支**

```bash
git checkout dev
git pull origin dev
git checkout -b dev-v001
git push origin dev-v001
```

**第四步：將版本分支合併至 `main` 進行正式部署**

```bash
git checkout main
git pull origin main
git merge dev-v001
git push origin main
```

---

## 🏷️ 版本標記（Tag）

Tag 用於標記「每次正式上線的版本」，讓團隊能明確追蹤發版記錄。一般會在 **版本合併至 main 並上線後** 使用。

### 建立與推送 Tag

```bash
# 建立一個新標籤
git tag -a v0.1.0 -m "MVP Release"

# 推上 GitHub
git push origin v0.1.0
```

### 查看所有標籤

```bash
git tag
```

### 切換回特定版本

```bash
git checkout v0.1.0
```

### 使用時機建議

✅ 當某次版本（例如 `dev-v001`）已完成並合併至 `main` 時

✅ 上線部署前或剛上線後立即打 Tag

✅ CI/CD 可設定偵測新 Tag 自動部署（例如：`on: push: tags:`）

---

## ✅ 整體流程摘要

```
Feature 分支
│
├─ PR → qa    # 測試環境 (Vercel)
├─ PR → dev   # 整合開發環境
│
▼
qa 測試完成 → dev 整合完成
│
▼
建立 dev-v001 → 合併 main → 打上 Tag → 正式上線
```

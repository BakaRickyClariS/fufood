# Frontend QR Code 掃描登入/註冊機制規劃書

## 1. 系統目標

讓使用者掃描 QR Code 後，在未登入狀態下先暫存其「掃描意圖（動作與目標項目）」，引導其選擇 LINE 或 Email 登入。待登入成功後，自動恢復原意圖並進行後續動作。

## 2. 路由與畫面設計

- **`/scan`**: 掃描 QR Code 的落地頁或攔截元件。
  - 根據 Query Parameter 解析意圖 (例如：`?action=join_group&id=123`)。
- **`/auth/choice`**: 登入方式選擇頁面。
  - 顯示「LINE 登入」與「電子郵件登入」按鈕/介面。
- **`/auth/login`**: 既有的電子郵件登入頁（若選擇信箱登入）。
- **`/auth/success`**: 登入成功後的中繼過渡頁。
  - 後端 `LINE Callback` 完成後，透過 302 Redirection 導向此頁，前端用以處理接續流轉。

## 3. 核心狀態管理 (State Management)

利用 `sessionStorage` 儲存掃描意圖，避免在 OAuth 第三方網頁跳轉過程中遺失：

- `sessionStorage.setItem('returnTo', '/scan?action=join_group&id=123')`

## 4. 操作流程

1. **掃描攔截 (`/scan`)**:
   - `useEffect` 檢查目前的登入狀態 (`isAuthenticated`)。
   - **已登入**: 直接發送 API 執行加入群組/清單等動作，或導向目標詳細頁面。
   - **未登入**: 將當前 URL 的核心意圖存入 `sessionStorage.getItem('returnTo')`，接著導向 `/auth/choice`。
2. **選擇登入方式 (`/auth/choice`)**:
   - **選 Email 登入**: 導向 `/auth/login`。
   - **選 LINE 登入**: 點擊後，以 `window.location.href` 或 `<a>` 標籤直接跳轉至後端的 `/api/auth/line/login` (由後端重導向至 LINE 授權頁)。
3. **驗證成功與意圖恢復**:
   - **Email 登入完成**: 呼叫 API 成功且設定登入狀態後，檢查 `sessionStorage` 是否有 `returnTo` 的值。有則 `navigate(returnTo)` 進行後續流程，無則回 `/home` 首頁。
   - **LINE 登入完成**: 後端處理完 Callback 並利用 `Set-Cookie` 寫入 Token 後，重導向至前端的 `/auth/success`。
   - **中繼頁 (`/auth/success`)**: 負責檢查 `sessionStorage.getItem('returnTo')`，清除暫存並導向該路徑。同時觸發全域 Auth Store 更新登入狀態，表示已驗證通過。

## 5. 資安與實作細節 (遵循 security-review 規範)

1. **Token 獲取限制**: 前端不再從 API Response 或 URL 中拿取 Token 存入 `localStorage`，而是依賴後端塞入的 HttpOnly Cookie。前端向 API 發 Request 時需確保帶入 Cookie (設定 axios/fetch 的 `withCredentials: true` 等)。
2. **XSS 防護**: 若 QR Code 帶有 `name` 等可視參數字串，在畫面渲染時需經 React 的脫逸機制確保安全，不得直接使用 `dangerouslySetInnerHTML`。

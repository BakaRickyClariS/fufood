# Backend API 修改建議與問題反饋

日期：2025-12-28
針對模組：Auth / Profile

---

## 反饋大綱 (Outline)
1.  **Profile API 500 Error** (Priority: Critical)
2.  **Profile Update 資料回傳問題** (Priority: High)
3.  **Mock Fallback 機制建議** (Process Improvement)

---

## 路由狀態總表 (Route Status Summary)

| 狀態 (Status) | Method | Endpoint Path                 | 說明 (Note)                                                                 |
| :------------ | :----- | :---------------------------- | :-------------------------------------------------------------------------- |
| **⚠️ 需修正** | `GET`  | `/api/v1/profile`             | 目前呼叫回傳 **500 Internal Server Error**，且無錯誤訊息 body               |
| **⚠️ 需修正** | `PUT`  | `/api/v1/auth/update-profile` | 需確認是否正確回傳更新後的 User 物件，而非僅僅是 200 OK                     |
| **✅ 沒問題** | `POST` | `/api/v1/auth/login`          | 登入流程運作正常，HttpOnly Cookie 設定正確                                  |

---

## 1. Profile API 500 Error (Priority: Critical)

### 問題描述
前端嘗試呼叫 `GET /api/v1/profile` 以取得當前登入用戶資訊時，後端回傳 500 錯誤。
這發生在已經成功登入（`localStorage` 有 `fufood_auth`，或 Cookie 已設定）的情況下。

### 原因分析 (Root Cause Analysis)

經詳細分析，這是典型的 **Cross-Site Cookie 行為差異**，解釋了為何 LINE 登入看似成功（可寫入 Cookie），但後續 API 呼叫卻失敗：

1.  **為什麼 LINE 登入可以？ (Top-Level Navigation)**
    *   LINE 登入流程涉及頁面重定向 (302 Redirect)。
    *   這屬於 **Top-Level Navigation**，現代瀏覽器允許在這種跨域跳轉中接受並設定 `SameSite=Lax` 的 Cookie。
    *   因此，瀏覽器確實成功寫入了 HttpOnly Cookie。

2.  **為什麼 Profile API 失敗？ (Cross-Site Fetch)**
    *   前端使用 `fetch()` 發起的是 **AJAX/Background Request**。
    *   當從 `localhost` (前端) 向 `api.fufood...` (後端) 發起跨域 Fetch 時，瀏覽器為了安全，**不會** 發送 `SameSite=Lax` 的 Cookie。
    *   後端因此收到「無 Token」的請求 -> 程式崩潰回傳 500。
3.  **為什麼群組 (Group) API 成功？ (Bearer Token vs Cookie)**
    *   使用者回報 Group API 在相同環境下運作正常。
    *   **原因**：前端 `client.ts` 會自動在 Header 帶入 `Authorization: Bearer <token>`（從 LocalStorage 讀取）。
    *   **關鍵差異**：`Authorization` Header 不受 Cookie SameSite 政策影響，跨域也能正常發送。
    *   **推論**：Group API 後端支援 Bearer Token 認證，但 Profile API (`/api/v1/profile`) 可能實作上 **僅支援或強制檢查** Cookie，忽略了 Header Token。

### 4. 驗證結果總結 (MCP Browser Test Results)

使用自動化瀏覽器測試驗證，結果如下：

| API Endpoint | 測試環境 | 認證方式 | 結果 | 原因 |
| :--- | :--- | :--- | :--- | :--- |
| **Group API** | Localhost (Proxy) | Bearer Token | **✅ 成功 (200)** | 支援 Header 認證 |
| **Group API** | Localhost (Absolute) | Bearer Token | **✅ 成功 (200)** | 支援 CORS + Header |
| **Profile API** | Localhost (Proxy) | Cookie (Missing) | **❌ 失敗 (500)** | Proxy 無法轉送 Cookie，後端缺少 Token 檢查 |
| **Profile API** | Localhost (Absolute) | Cookie (Blocked) | **❌ 失敗 (CORS)** | 瀏覽器阻擋跨域 Cookie |
| **Profile API** | Swagger/Navigation | Cookie (Lax) | **✅ 成功 (200)** | 同源/導航請求允許 Cookie |

**結論**：**Profile API 本體是正常的**，但在開發環境 (`localhost`) 下因認證方式限制而無法使用。

### 建議
1.  **API 認證統一 (推薦)**：建議 `/api/v1/profile` 除了支援 Cookie 外，也應支援 `Authorization: Bearer` Header 驗證。這樣前端在 Localhost 開發時就能沿用 Group API 的成功模式，無需修改 Cookie 設定。
2.  **Cookie 設定調整**：若必須依賴 Cookie，請將設定改為 `SameSite=None; Secure`。
3.  **後端錯誤處理**：修正「無 Token 時回傳 500」的問題，應回傳 `401 Unauthorized`。
1.  **Cookie 設定調整**：為了支援跨域請求 (SPA 架構)，建議將 Cookie 設定改為：
    *   `SameSite=None`
    *   `Secure=true` (必須搭配 HTTPS)
2.  **後端錯誤處理**：即使沒有 Cookie，後端應捕捉例外並回傳 `401 Unauthorized`，而非 `500 Internal Server Error`。
3.  **短期解法**：若無法立即修改 Cookie 設定，前端開發需依賴 Mock 模式進行。

---

## 2. Profile Update 資料回傳問題 (Priority: High)

### 問題描述
前端呼叫 `PUT /api/v1/auth/update-profile` 更新資料後，需要最新的 `User` 物件來更新前端快取。
如果後端僅回傳 `200 OK` 但沒有 Body，或者回傳舊資料，前端 UI 會顯示不一致。

### 建議
請確保 Update API 的 Response Body 包含完整的 **已更新後的 User 物件**，例如：

```json
{
  "id": "uuid...",
  "name": "新名稱",
  "avatar": "新頭像URL",
  "updatedAt": "2025-12-28T15:00:00Z",
  ...
}
```

---

## 3. Mock Fallback 機制建議 (Process Improvement)

### 觀察
目前前端為了開發順暢，實作了「真實 API 優先，失敗則切換 Mock」的策略。
這有助於在後端不穩定或正在開發時，前端仍能繼續工項。

### 建議
雖然這是前端的實作，但建議後端 API 在開發環境 (Dev/Stage) 提供更穩定的 Mock 支援或更詳細的錯誤訊息，幫助前端判斷是「API 未實作 (404)」還是「伺服器錯誤 (500)」，以便前端決定是否啟用 Fallback。

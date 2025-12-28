# Backend API 修改建議與問題反饋

日期：2025-12-27
針對模組：Groups (Refrigerators)

## 反饋大綱 (Outline)
1. **群組成員列表初始狀態** (Priority: High)
2. **群組建立 API 回傳值** (Priority: Medium)
3. **回傳格式標準化** (Architectural)
4. **邀請與加入流程** (Design Review)
5. **權限與刪除成員** (Security Note)
6. **新增需求 (Feature Requests)**: 包含搜尋好友、條碼邀請、發送邀請
7. **錯誤回報 (Bug Reports)**: 包含成員列表 404、Mock 功能依賴

---

## 路由狀態總表 (Route Status Summary)

| 狀態 (Status) | Method | Endpoint Path | 說明 (Note) |
| :--- | :--- | :--- | :--- |
| **⚠️ 需修改** | `POST` | `/api/v1/refrigerators` | 需回傳完整 Group DTO (含 ID)，並自動加入建立者 |
| **⚠️ 需修改** | `GET` | `/api/v1/refrigerators/{id}` | 建立後 `members` 陣列不應為空 |
| **⚠️ 需修改** | `GET` | `/api/v1/refrigerators/{id}/members` | 目前部分群組回傳 404，需修正空資料處理 |
| **⚠️ 需修改** | `POST` | `/api/v1/refrigerators/{id}/members` | 建議拆分為「邀請」與「加入」不同用途 |
| **🆕 需新增** | `GET` | `/api/v1/users/friends` | 邀請畫面：搜尋好友名單 (keyword search) |
| **🆕 需新增** | `POST` | `/api/v1/refrigerators/{id}/invite-code` | 邀請畫面：產生邀請碼/QR Code |
| **🆕 需新增** | `POST` | `/api/v1/refrigerators/{id}/invitations` | 邀請畫面：發送入群邀請通知 |
| **✅ 沒問題** | `GET` | `/api/v1/refrigerators` | 群組列表讀取正常 |
| **✅ 沒問題** | `GET` | `/api/v1/users/profile` | (或 `/me`) 用戶資訊讀取正常 |

---

## 1. 群組成員列表初始狀態 (Priority: High)

### 問題描述
當使用者建立一個新群組 (`POST /api/v1/refrigerators`) 後，系統回傳的 Group 物件或是隨後呼叫 `GET /api/v1/refrigerators/{id}` 取得的資料中，`members` 陣列預設為空 `[]`。

### 影響
前端在顯示成員列表時，會誤判該群組沒有任何成員（甚至不包含建立者自己）。目前前端必須實作 fallback 邏輯（如：若列表為空且我是建立者，則手動顯示自己），這增加了前端的複雜度與潛在的不一致性。

### 建議修改
後端在建立群組時，應自動將「建立者 (Creator)」加入 `members` 關聯表，並在 API 回傳的 `Group` 物件中包含該成員資訊。

**預期 Response 範例**：
```json
{
  "id": "new-group-id",
  "name": "新群組名稱",
  "adminId": "user-id",
  "members": [
    {
      "id": "user-id",
      "name": "User Name",
      "avatar": "url",
      "role": "admin"
    }
  ],
  ...
}
```

---

## 2. 群組建立 API 回傳值 (Priority: Medium)

### 問題描述
目前建立群組後的回傳資料結構需確保包含完整的 Group 資訊（特別是 `id`）。前端依賴此 `id` 來進行建立後的自動切換 (Auto-switch)。

### 建議修改
確保 `POST` 請求成功後回傳完整的 Group DTO，避免只回傳 `200 OK` 或部分欄位。

---

## 3. 錯誤代碼規範 (Priority: Low)

### 建議修改
確保 `POST` 請求成功後回傳完整的 Group DTO，避免只回傳 `200 OK` 或部分欄位。

---

## 3. 回傳格式標準化 (Architectural)

### 現狀 наблюдения
目前前端程式碼中必須針對不同 API 進行雙重檢查（Dual Check）：
```typescript
if (response && typeof response === 'object' && 'data' in response) { ... }
else { ... }
```
這意味著後端 API 可能存在「有時回傳 `{ data: ... }` 包裝，有時直接回傳陣列/物件」的不一致情況，或者是為了相容還在開發中的變更。

### 建議
全站統一 API Response 格式。建議採用信封模式（Envelope Pattern）：
```json
{
  "status": "success",
  "data": { ... }, // 或 [...]
  "message": ""
}
```
並確保所有 Endpoints 遵循此規範，讓前端能移除冗餘的格式檢查邏輯。

---

## 4. 邀請與加入流程 (Design Review)

### 現狀
目前 `inviteMember` 與 `join` 似乎共用 `POST /api/v1/refrigerators/{groupId}/members` Endpoint，僅透過 Payload 區分：
- 邀請：`{ email, role }`
- 加入：`{ inviteCode }`

### 潛在問題
1.  **端點職責模糊**：RESTful 設計中，`POST /members` 通常隱含「建立成員關係」。雖然語意尚可，但混合了「管理員邀請」與「訪客主動加入」兩種完全不同的權限與業務邏輯。
2.  **Join 依賴 GroupID**：目前的 Join 不需要 `groupId` 已經知道的前提下嗎？
    - 如果 `join` 需要 `groupId`，則使用者必須先知道群組 ID 才能加入。
    - 實務上常見的 Invite Link 流程通常是 `POST /api/join` (Body: `{ code }`)，由後端透過 Code 查找 Group 並建立關係。若目前的設計強制 URL 包含 `groupId`，可能會限制未來「透過短連結直接加入」的功能擴充性。

### 建議
考慮將 Endpoint 拆分以明確職責：
- **邀請 (Admin Action)**: `POST /refrigerators/{id}/invitations` (產生邀請) 或 `POST /refrigerators/{id}/members` (直接加人)
- **加入 (User Action)**: `POST /refrigerators/join` (Body: `{ code, groupId? }`)，若 Code 本身具唯一性則不需 GroupID。

---

## 5. 權限與刪除成員 (Security Note)

### 觀察
`leave` (離開) 與 `removeMember` (踢人) 共用 `DELETE /api/v1/refrigerators/{groupId}/members/{memberId}`。

### 提醒
後端務必嚴格驗證權限：
- 若 `request.user.id === memberId`：允許 (自行離開)。
- 若 `request.user.id !== memberId`：必須驗證操作者是否為 Admin。
這是常見的資安漏洞點（IDOR），建議後端在單元測試中覆蓋此場景。

---

## 6. 新增需求 (Feature Requests)

### 邀請好友功能 (Invite Friend)
為了支援「搜尋 LINE 好友」與「條碼邀請」功能，需要以下新 API：

#### 6.1 搜尋好友
- **Endpoint**: `GET /api/v1/users/friends`
- **Query Params**: `?q={keyword}` (搜尋關鍵字，如名稱或 ID)
- **Response**: User 列表 `[{ id, name, avatar, lineId, ... }]`
- **備註**: 需整合 LINE Social API 或本地儲存的好友名單。

#### 6.2 條碼邀請
- **Endpoint**: `POST /api/v1/refrigerators/{id}/invite-code`
- **Response**: `{ code: "...", expiry: "Timestamp", qrUrl?: "..." }`
- **流程**:
    1. 前端呼叫此 API 取得邀請碼或專屬連結。
    2. 前端可自行生成 QR Code (若後端只給 Code/URL)，或直接顯示後端回傳的 `qrUrl`。
    3. 有效期建議設為 24 小時。


### 6.3 邀請好友 (Send Invitation)
- **Endpoint**: `POST /api/v1/refrigerators/{id}/invitations`
- **Body**: `{ targetUserId: "..." }` 或 `{ email: "..." }`
- **Response**: `200 OK` (或 `201 Created`)
- **備註**: 用於直接對特定使用者發送入群邀請通知。

---

## 7. 錯誤回報 (Bug Reports)

### 7.1 成員列表 404 錯誤
- **Endpoint**: `GET /api/v1/refrigerators/{id}/members`
- **狀況**: 在某些群組 ID 下，前端請求成員列表時收到 `404 Not Found`。
- **推測原因**: 該群組 ID 可能無效，或是後端未正確處理「有群組但無成員資料」的 Edge Case（應回傳 空陣列 `[]` 而非 404）。請後端確認 `members` 關聯是否存在。

### 7.2 邀請功能目前為 Mock
- **現狀**: 前端 `InviteFriendModal` 中的「搜尋好友」與「產生邀請碼」目前為純前端 Mock 實作。
- **需求**: 請盡快提供 Section 6 所述的 API (`GET /mobile/search-users`, `POST /invite-code` 等)，以便前端串接真實資料。

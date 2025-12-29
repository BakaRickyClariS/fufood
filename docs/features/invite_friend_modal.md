# Feature: 邀請好友 Modal (Invite Friend Modal)

## 1. 概述
提供使用者邀請好友加入群組（冰箱）的功能。支援「搜尋好友」與「條碼邀請」兩種方式。

## 2. UI/UX 設計規範
- **容器樣式**：參考 `src/modules/groups/components/modals/HomeModal.tsx`。
  - 使用 Bottom Sheet 形式（從下方滑入）。
  - 使用 GSAP 動畫（`power2.out`, `back.out(1.2)`）。
  - 背景遮罩 (`backdrop-blur-sm`)。
- **Tabs 切換**：頂部切換「搜尋成員」與「條碼邀請」。
- **Design System**：
  - 主色調：`#EE5D50` (按鈕、Highlight)。
  - 文字：`stone-900` (標題), `stone-500` (次要)。
  - 輸入框：圓角框，帶搜尋 icon。

## 3. 功能模組

### 3.1 搜尋成員 (Search Tab)
- **參考元件**：`src/modules/inventory/components/ui/modal/SearchModal.tsx`
- **流程**：
  1. 輸入關鍵字（信箱或 LINE ID/名稱）。
  2. 呼叫 `GET /api/v1/users/friends?q=...` (Debounce 搜尋)。
  3. 顯示結果列表（頭像、名稱）。
  4. 選取後點擊「邀請」按鈕。
  5. 呼叫 `POST /api/v1/refrigerators/{id}/invitations`。

### 3.2 條碼邀請 (QR Code Tab)
- **參考元件**：Inventory/Planning 中的 Barcode/QR 相關元件（若有）。
- **流程**：
  1. 切換至此 Tab 時，呼叫 `POST /api/v1/refrigerators/{id}/invite-code` 取得最新邀請資訊。
  2. **顯示 QR Code**：
     - 若後端回傳 URL，直接顯示圖片。
     - 若回傳 Code/Link，前端使用 `qrcode.react` (或類似套件) 生成 QR Code。
     - 顯示文字：「掃描 QRCode 即可加入」、「24小時內有效」。
  3. **分享連結**：底部按鈕「分享邀請連結」，使用 Web Share API 或複製到剪貼簿。

## 4. 技術實作計畫

### 4.1 新增 Redux Actions
在 `groupsSlice.ts` 新增：
- `searchFriends(query)`: AsyncThunk
- `generateInviteCode(groupId)`: AsyncThunk
- `inviteFriend(groupId, userId)`: AsyncThunk

### 4.2 API Client 更新
更新 `groupsApi.ts`：
- `searchFriends(query)`
- `getInviteCode(groupId)`

### 4.3 元件開發
建立 `src/modules/groups/components/modals/InviteFriendModal.tsx`：
- 使用 `tab` 狀態控制顯示內容。
- 整合 `useGroups` hook 取得 API Actions。

## 5. 待確認事項
- 掃描端的實作：是使用 App 內建相機掃描？還是依賴 LINE/OS 相機掃描後開啟 Deep Link？
  - *建議*：QR Code 內容為 Deep Link (`fufood://join?code=...`) 或 Web Link (`https://fufood.app/join?code=...`)，讓使用者可用任意掃描器開啟。

## 6. 後端需求 (Backend Request)
已更新至 `docs/backend/feedback/api_feedback_20251227.md`，主要包含：
1. `GET /api/v1/users/friends`
2. `POST /api/v1/refrigerators/{id}/invite-code`

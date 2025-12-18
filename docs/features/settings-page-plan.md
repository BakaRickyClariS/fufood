# Settings Page 實施計畫

## 已完成項目
- [x] Phase 1 - 基礎結構與主頁面
- [x] Phase 2 - 編輯個人檔案
- [x] Phase 3 - 編輯飲食喜好

## Phase 4 - 快捷功能與其他 (Quick Actions & Others)

### 功能需求

#### 1. 會員方案 (`/settings/subscription`)
- 顯示當前方案 (Mock data: Free/Premium/VIP)
- 顯示方案權益清單
- 升級/取消訂閱按鈕 (Mock action)

#### 2. 購買紀錄 (`/settings/purchase-history`)
- 顯示歷史訂單列表 (Mock data)
- 訂單狀態 (完成/取消)
- 點擊查看詳情 (Optional)

#### 3. 推播通知 (`/settings/notifications`) [已刪除，需重建]
- 開關：接收推播通知
- 開關：接收行銷訊息
- 開關：即將過期提醒
- 儲存設定 (Local storage or Mock API)

#### 4. LINE 綁定
- 顯示綁定狀態 (已綁定/未綁定)
- 若未綁定：點擊觸發 LINE Login (導向 `/auth/line-login`)
- 若已綁定：顯示「解除綁定」按鈕 (Mock action)
- *注意*: 目前 QuickActions 只有一個按鈕，需要與後端狀態連動。

### 實作步驟
1. **建立頁面元件**：
   - `Subscription.tsx` (完善現有)
   - `PurchaseHistory.tsx` (新增)
   - `Notifications.tsx` (新增)
2. **更新路由**：
   - 在 `Settings/index.tsx` 註冊新路由。
3. **實作邏輯**：
   - 使用 Mock Data 展示內容。
   - `QuickActions` 元件需根據 User 狀態顯示不同文字 (e.g. "LINE未綁定" vs "已綁定")。

### 驗證
- 點擊各個快捷按鈕，確認導航正確。
- 頁面內容顯示正確 Mock Data。

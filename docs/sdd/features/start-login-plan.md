# 實作開始與登入畫面

本計畫概述了根據提供的設計實作開始（Splash）畫面、登入畫面和頭貼選擇畫面的步驟。

## 需要使用者審查

> [!IMPORTANT]
> 由於目前程式碼庫中沒有實際的素材，我將使用佔位圖片/顏色作為背景和 3D 角色。
> 我假設「使用 LINE 應用程式登入」和「使用電子郵件帳號登入」按鈕最初只是導航到下一個畫面或在控制台輸出日誌，因為此任務未指定後端整合。

## 預計變更

### 路由 (Routes)

#### [MODIFY] [routes/index.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/index.tsx)
- 新增 `/start` 路由用於開始畫面。
- 新增 `/auth/avatar-selection` 路由用於頭貼選擇。
- 更新預設路由 `/` 重定向到 `/start`（或保持 Dashboard 受保護，若未登入則重定向到 Start - 目前我將讓 `/start` 可訪問）。

### 開始畫面 (Start Screen)

#### [NEW] [routes/Start/index.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Start/index.tsx)
- 實作 Splash 畫面，包含：
    - 背景圖片/顏色。
    - Logo ("FOOD 冰箱 — 庫存管理")。
    - 3D 角色插圖（佔位符）。
    - 超時或點擊後導航至登入畫面。

### 登入畫面 (Login Screen)

#### [MODIFY] [routes/Auth/Login.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Auth/Login.tsx)
- 更新 UI 以符合設計：
    - "..." 分隔符。
    - "使用 LINE 應用程式登入" 按鈕（紅色）。
    - "使用電子郵件帳號登入" 按鈕（白色/外框）。
    - "忘記密碼？" 連結。

### 頭貼選擇 (Avatar Selection)

#### [NEW] [routes/Auth/AvatarSelection.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Auth/AvatarSelection.tsx)
- 實作頭貼選擇畫面：
    - 標題 "選擇頭貼"。
    - 頭貼網格（佔位符）。
    - "確認" 按鈕。

## 驗證計畫

### 手動驗證
1.  **開始畫面**：
    -   導航至 `/start`。
    -   驗證佈局是否符合設計（Logo、角色）。
    -   驗證導航至登入畫面。
2.  **登入畫面**：
    -   導航至 `/auth/login`。
    -   驗證按鈕和佈局。
    -   點擊 "使用電子郵件帳號登入" -> 驗證導航（或控制台日誌）。
3.  **頭貼選擇**：
    -   導航至 `/auth/avatar-selection`。
    -   驗證網格和確認按鈕。

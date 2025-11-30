# 實作群組設定與成員編輯畫面

本計畫概述了根據提供的設計圖，實作「群組設定」與「編輯成員」畫面的步驟。

## 需求分析

根據提供的設計圖，我們需要實作兩個主要頁面，並將其連結至 Dashboard：

1.  **群組設定 (Group Settings)**：
    -   由 Dashboard 左上角的「My Home」下拉選單進入。
    -   顯示群組列表。
    -   提供「建立群組」按鈕。
    -   針對當前群組顯示「編輯成員」與「修改群組內容」按鈕。
2.  **編輯成員 (Edit Members)**：
    -   由 Dashboard 右上角的「首頁」圖示，或群組設定頁面的「編輯成員」按鈕進入。
    -   顯示群組資訊（名稱、管理員、3D 形象）。
    -   顯示成員列表。
    -   提供「邀請好友」按鈕與「刪除成員」連結。

## 預計變更

### 路由 (Routes)

#### [MODIFY] [routes/index.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/index.tsx)
- 新增 `/group/settings` 路由。
- 新增 `/group/members` 路由 (或 `/group/:groupId/members`)。

### 群組功能 (Group Features)

#### [NEW] [routes/Group/Settings.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Group/Settings.tsx)
- 實作群組設定頁面。
- 使用 Mock Data 顯示群組列表。
- 實作「建立群組」按鈕 UI。
- 點擊「編輯成員」導向至成員編輯頁面。

#### [NEW] [routes/Group/Members.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Group/Members.tsx)
- 實作成員編輯頁面。
- 使用 Mock Data 顯示成員列表。
- 實作「邀請好友」按鈕 UI。

### Dashboard 整合

#### [MODIFY] [routes/Dashboard/index.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Dashboard/index.tsx)
- 修改 Header 區域。
- 將左上角「My Home」下拉選單連結至 `/group/settings`。
- 將右上角「首頁」圖示連結至 `/group/members`。

## 驗證計畫

### 手動驗證
1.  **群組設定流程**：
    -   在 Dashboard 點擊左上角「My Home」。
    -   驗證是否跳轉至「群組設定」頁面。
    -   驗證群組列表顯示是否正確。
2.  **成員編輯流程**：
    -   在 Dashboard 點擊右上角「首頁」圖示。
    -   驗證是否跳轉至「編輯成員」頁面。
    -   驗證成員列表顯示是否正確。
    -   點擊「邀請好友」按鈕（確認 UI 互動）。
3.  **交互流程**：
    -   在「群組設定」頁面點擊「編輯成員」。
    -   驗證是否跳轉至「編輯成員」頁面。

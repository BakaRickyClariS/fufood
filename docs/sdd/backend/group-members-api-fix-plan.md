# 冰箱（群組）成員 API 修復規劃書

## 目標說明

目前前端 UI（群組設定、編輯成員）高度依賴 v2 API 的回傳資料，但目前的 API 缺少了顯示介面所必須的資訊，導致 UI 顯示異常。

1. `GET /api/v2/groups`：回傳的群組列表缺乏成員數量摘要，導致前端群組卡片永遠顯示「成員 (0)」且無法顯示疊加的頭像 UI。
2. `GET /api/v2/groups/{groupId}`：回傳的 `members` 陣列中，每個成員物件只包含關聯 ID（`membershipId`, `userId`）、角色（`role`）以及加入時間（`joinedAt`）。**缺少了使用者的顯示名稱（`userName` 或 `name`）與頭像圖片網址（`profilePictureUrl` 或 `avatar`）**。這導致前端「編輯成員」的列表上只能顯示預設頭像與名稱為「未知」。

本次修復的目標是更新後端 Controller 或 Service，在查詢群組與成員關係時，透過 Join 等方式將 User collection/table 的名稱與頭像資訊一併打包回傳。

## 待確認細節（須提報決策者或相關負責人）

> [!IMPORTANT]
> 必須先確認以下 API 結構異動是否符合目前的資料庫設計：
>
> 1. **針對 `GET /api/v2/groups` (列表)：**
>    為了渲染 UI，我們是否要在這裡**計算並回傳一個 `memberCount` (整數)**？另外是否需要回傳 `previewAvatars` (字串陣列) 提供前 4 名成員的頭像預覽？或者是乾脆像 v1 一樣回傳完整的 `members` 陣列？
> 2. **針對 `GET /api/v2/groups/{groupId}` (詳細資料)：**
>    目前查詢 members 關聯表時，缺乏 User 的資料。後端目前的架構（Sequelize, Mongoose 或 Prisma 尤佳）是否可以直接在關聯查詢時引入 / populate User 資料表上的 `name` 與 `profilePictureUrl` 欄位？

## 提議的變更

### 後端 API Controllers / Services

#### [MODIFY] `GET /api/v2/groups` 處理邏輯

- 確保回傳的物件中包含 `memberCount`。
- 如果效能允許，請加入 `memberAvatars` 欄位（或是包含頭像的最前 4 筆 `members` 物件），讓前端可以渲染卡片右下角的交疊頭像。

#### [MODIFY] `GET /api/v2/groups/:groupId` 處理邏輯

- 修改取得群組詳情以及 memberships 的資料庫查詢。
- 透過 `userId` 將 membership 紀錄與負責存儲使用者資訊的表格（如 Users）進行 Join 或 Populate。
- 將取得的資料做 Mapping，確保回傳的 `members` 陣列中，每個物件都長這樣：
  ```json
  {
    "membershipId": "...",
    "userId": "...",
    "role": "owner",
    "joinedAt": "...",
    "name": "使用者名稱",
    "avatar": "https://url.to/avatar.png"
  }
  ```

_(確切的檔案路徑取決於目前的後端結構，例如 `src/controllers/GroupController.ts` 或是 `src/services/GroupService.ts` 等等)_

## 驗證流程

### 自動化測試

- 建立或修改針對 v2 群組端點的單元測試/整合測試，檢查回傳的 JSON response 是否確實包含新加的欄位 (`name`, `avatar`/`profilePictureUrl`, `memberCount`)。

### 人工驗證步驟

1. 同時啟動後端與前端伺服器 (Local)。
2. 前往 `http://localhost:5173/groups` （或是任何觸發 `群組設定` Modal 的地方）。
3. 確認群組卡片上的文字顯示為「成員 (X)」(X 需正確計算該群組人數)，而且旁邊的小頭像也有正確帶出對應的圖片。
4. 點擊該群組卡片的「編輯成員」按鈕，打開 `GroupMembers` 彈出視窗。
5. 確認成員列表上，每個成員都有正確顯示他們自己的**名稱 (Name)**與**大頭貼 (Avatar)**，而不是出現「未知」或沒頭像的情形。

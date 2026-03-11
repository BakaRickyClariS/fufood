# 後端註冊建立預設群組分析報告

在排查新註冊使用者為何無法取得預設「我的冰箱」以及相關的 403 錯誤時，我詳細檢閱了後端 API 原始碼（`D:\Work\Course\HexSchool\AI_test\gemini_test\recipe-api`），包含 `authService.ts`、`v2GroupService.ts`、`groupService.ts` 與 `groupRepository.ts`。

## 現有後端邏輯分析

我發現後端程式碼 **已經具備了完整的自動建立群組防呆機制**：

1. **註冊當下自動建立**：
   在 `src/services/authService.ts` 內的一般註冊 (`register`) 邏輯中，確實有呼叫群組建立：
   ```typescript
   // 3. Create user
   const user = await userRepository.create({ ... });

   // 4. Ensure default group exists
   const { groupService } = await import("./groupService.js");
   await groupService.create("我的冰箱", user.id);
   ```
   而在 `groupService.create` 中，不僅會建立群組與 `groupMemberships` (設定為 owner)，甚至還內建了迎賓牛奶 (`createInventoryItem`) 設定。

2. **讀取列表時再次檢查防呆**：
   若退一萬步來說，就算註冊時發生非預期錯誤導致群組沒建成功，在 `GET /api/v2/groups` 路由負責處理的邏輯裡（`src/services/v2GroupService.ts`），也有防呆：
   ```typescript
   async listByUser(userId: string) {
     let groups = await v2GroupRepository.findGroupsByUserId(userId);
     if (!groups || groups.length === 0) {
       // Auto-create a default group if the user has none
       await groupRepository.create({ name: "我的冰箱", ownerId: userId });
       groups = await v2GroupRepository.findGroupsByUserId(userId);
     }
     return groups;
   }
   ```

## 真正的問題根源

既然**後端完全沒有少建預設群組**，為何前端會發生無限跳出 403 (Access denied: You are not a member of this group) 的錯誤或發生 `undefined`?

真正的元兇其實就是**前端的本地與記憶體快取 (React Query) 在切換帳號或登出時沒有被徹底清理** （這也就是我們在**上一階段前端修復**中徹底解決的問題）。

具體流程如下：
1. 先前登入 `dd@dd.com`，本地的 `localStorage.activeGroupId` 和 Redux/React Query 裡面存滿了屬於 `dd@dd.com` 的群組 ID (例如 `b761757...`)。
2. 進行註冊 (或是重新登入 `tt2@tt.com`)。在這途中，前端舊的寫法只清除了部分儲存，卻**沒有中斷記憶體中舊帳號的 React Query 快取輪詢**。
3. 登入新帳號後，前端元件立刻啟動，拿到了殘留的舊有群組 ID (`b761757...`)，並且用新帳號的 token 對後端發出查詢該群組庫存與設定的請求 (`getSettings` 或 `getInventory`)。
4. **後端正確發揮作用**，驗證發現 `tt2@tt.com` 根本不是 `b761757...` 群組的成員，於是回傳正當的 `403 Forbidden`。
5. 前端因為元件錯誤處理沒有包好 `groupId` 為異常的空狀態防呆，導致無限重發或介面白屏。

## 結論與後續行動

**後端專案不需要做任何修改。** 自動建立預設群組的功能已經寫得很完整。

先前的錯誤（包含登出又登不進去、畫面一直卡在載入或出錯）都是憑藉著「前端防呆」與「清理快取 (`queryClient.clear()`)」就可以被完全解決的問題。現在您只要在前端執行流程，就不會再遭遇這個惱人的幽靈 403 錯誤了。您隨時可以新建一組帳號測試看看這流暢的運作！

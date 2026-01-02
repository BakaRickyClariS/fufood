現在有幾個問題需要修正
ai後端的inventory api
1. 食品詳細卡片裡面的分頁名稱以及分類名稱應該要是對應的中文 我在後端做正規化的時候應該有處理這部分 幫我調整
2. 食品卡片以及食品詳細卡片的日期時間似乎沒有正常 應該要只顯示日期 例如:2025/12/30

群組api更新問題
1. 我的群組切換時 庫存狀態與設定不會自動刷新重新讀取 要手動刷新才可以 是不是redux狀態沒設好?

planning頁面 shopping list api問題
1. 共享清單 如果我用當天的日期創建計畫會直接變已完成 應該是要預計採買日期的隔天才會跑到已完成才對
2. 共享清單裡面的建立貼文現在有問題 看起來是創建貼文的api路由錯了 應該為/api/v1/shopping_lists/{shoppingListId}/items
3. 共享清單的編輯頁面點進去 會跳到404 網址像這樣http://localhost:5173/planning/list/019b6ca3-7ebb-769f-8f3d-8fc31a378683/edit 看起來是前端頁面邏輯問題
4. 共享清單的刪除功能也失敗 看起來像是json格是錯誤
installHook.js:1 [BACKEND API] Request Failed: SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input

食譜頁面問題
1. ai生成食譜目前會直接吐整包回傳json檔給我顯示在上面 但食譜卡片還是有出來 不過看起來像假資料 我的照片也都長一樣 很怪 幫我檢查是ai後端問題還是前端問題

Dashboard頁面問題
1. 庫存數量沒有同步我的庫存總攬 是我的api問題嗎? 這邊的api好像都沒有幫我更新庫存 要不然就是他給我的資料就是這樣 請幫我檢查
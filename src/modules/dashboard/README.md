# Dashboard Module (儀表板)

## 目錄
- [概述](#概述)
- [目錄結構](#目錄結構)
- [關鍵功能](#關鍵功能)
- [元件總覽](#元件總覽)
- [資料來源與 API](#資料來源與-api)
- [整合備註](#整合備註)

---

## 概述
儀表板提供跨模組的快速總覽，聚合庫存摘要、推薦食譜與 AI 入口，協助使用者在首頁直接看到待辦與建議。

## 目錄結構
- `components/`：儀表板卡片與橫幅元件（`InventorySection`, `RecipeSection`, `InventoryCard`, `AiRecommendCard`）

## 關鍵功能
- 庫存摘要：總庫存、低庫存、即將到期的快速數字卡
- 近效期提示：從庫存模組引導查看到期食材
- 推薦食譜：走馬燈呈現熱門/推薦食譜
- AI 快速入口：導向 AI 助理（FuFood.AI）開始互動

## 元件總覽
| 元件 | 說明 |
|------|------|
| `InventorySection` | 顯示三張庫存摘要卡，預期串接庫存 stats/summary |
| `InventoryCard` | 單一卡片，顯示數值與狀態圖示 |
| `RecipeSection` | 食譜走馬燈，點擊導向食譜詳細；底部附 AI CTA |
| `AiRecommendCard` | AI 橫幅 CTA，導向 AI 體驗入口 |

## 資料來源與 API
- 對照 [API_REFERENCE_V2.md](../API_REFERENCE_V2.md)：
  - 庫存摘要：`GET /api/v1/inventory?include=summary,stats`（#18、#27）取得總數、低庫存與到期統計；列表可用 `status=expired|expiring-soon|low-stock`。
  - 食譜推薦：`GET /api/v1/recipes`（#33）取熱門/推薦清單；收藏與規劃沿用 #35-#40。
  - 本模組無獨立 API，僅消費其他模組資料。

## 整合備註
- 目前數值與食譜列表為靜態 mock，接後端時請改用 Inventory/Recipe services 或 Redux store。
- 如需顯示「最後同步時間」，可沿用 Inventory API 回應時間或 store 狀態。
- 首頁快捷按鈕建議導向各模組既有路由（inventory、recipe、planning 等），保持與其它 README 的路由描述一致。

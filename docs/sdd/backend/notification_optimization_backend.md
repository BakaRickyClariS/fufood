# FuFood 通知系統優化方案 - 後端實作規範

本文件基於專案內建 Skills (`security-review`, `clean-code`) 制定，確保後端通知系統與 API 設計符合安全性與高維護性標準。

## 1. 資料庫設計 (完全相容現有架構)

為確保向前相容與減少重構成本，此優化方案完全沿用目前系統已定義的 `NotificationMessage` 結構，**不新增或更動現有 Schema**，而是將附屬變數與跳轉規則正確放進已有的欄位：

```typescript
// 完全相容現有資料庫結構 (Prisma/TypeORM 參考)
model Notification {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  type        String   // 'inventory', 'group', 'shopping', 'system', 'recipe'
  subType     String?  // 'generate', 'stock', 'consume', etc.
  title       String
  message     String   // 負責儲存組合好的語句，推播時使用此欄位
  action      Json?    // 相容現有結構，存放 { type: 'inventory', payload: { itemId: '123' } }
  groupName   String?  @map("group_name")
  actorName   String?  @map("actor_name")
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

**Clean Code 要求**：不在 Controller 層撰寫複雜的組裝邏輯，應建立專屬的 `NotificationFactory` 或 `NotificationService` 來生成對應的 Action JSON 與 `message`。

## 2. 觸發字典、階段與推播內容 (相容版 Trigger Dictionary)

以下業務不應由前端發起通知，必須在後端對應的「觸發階段」即時產生並發送推播 (Push Notification)。**此處的 Type 與 SubType 皆來自現有規格**：

| 觸發業務         | `type` / `subType`      | 觸發階段 (執行時機)                                                                                 | 推播標題 (`title`) | 推播內文 (`message`)                               |
| :--------------- | :---------------------- | :-------------------------------------------------------------------------------------------------- | :----------------- | :------------------------------------------------- |
| **食材消耗完成** | `inventory` / `consume` | **業務階段**：在處理 `consumeItem` 的 Transaction 完成後，若 DB 查詢剩餘量 `< 2` (且近期未發送過)。 | 🛒 補貨提醒        | 「{foodName}」快用完囉。已自動加入購物清單。       |
| **食材即將過期** | `inventory` / `stock`   | **排程階段**：每日 `08:00 AM` Cron Job，掃描 `expiry_date` 為 (Today + 1) 的食材。                  | 🚨 食物過期警告    | 「{foodName}」快過期了！點此查看如何處理。         |
| **食材已過期**   | `inventory` / `stock`   | **排程階段**：每日 `08:00 AM` Cron Job，掃描 `expiry_date` < Today 的食材。                         | 😭 食物救援失敗    | 很遺憾「{foodName}」已過期，下次記得早點吃掉喔。   |
| **AI 食譜完成**  | `recipe` / `generate`   | **背景階段**：AI 食譜生成的非同步 Queue 任務完成，並寫入資料庫後。                                  | ✨ 食譜準備好了    | 你的專屬食譜「{recipeName}」已生成完成，即刻開煮！ |
| **被加入新群組** | `group` / `member`      | **業務階段**：處理 `joinGroup` API，使用者成功加入群組後。                                          | 👥 歡迎加入新冰箱  | 你已被加入「{groupName}」，點此與室友共享庫存。    |

## 3. 安全性審查 (Security Review Guidelines)

依據專案 `security-review` 規範要求：

1. **FCM Token 儲存安全**：使用者的 FCM Token 不應明碼暴露於 API 回傳中。儲存 Token 的 API 必須加上 Rate Limiting 防止惡意寫入。
2. **越權防護 (IDOR)**：
   - 在調用 `batch-read` 或 `batch-delete` 時，**絕對不可僅憑傳入的 notification ID 進行更新**。
   - 必須在 `WHERE` 條件中強制加上 `AND user_id = req.user.id`。
3. **防禦性程式設計 (Defensive Programming)**：
   - Cron Job 執行發送過期通知時，必須記錄該天/該食材的 `LastAlertSentAt`，防止系統重啟導致同一天發出數萬封重複通知 (Thundering Herd Problem)。

## 4. 效能與推播佇列 (Queueing)

- **異步推播**：推送至 Firebase 的 HTTP 請求耗時不可控，必須將 FCM Task 投入 Redis/BullMQ 中背景執行。Controller 應在寫入 DB 成功後立刻回傳 HTTP 200，不等待 FCM 回應。

```

```

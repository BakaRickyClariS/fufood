# LINE 登入 PWA 跳轉問題 - 分析與修正報告

> **日期**: 2025-12-20  
> **問題**: PWA standalone 模式下 LINE 登入無法正確跳轉

---

## 問題現象

1. LINE 登入後停留在 `/auth/line/callback`
2. 回到 Login 頁面卡在「登入中...」狀態
3. 無法偵測到已登入

---

## 根因分析

### 問題 1：`handlePopupMessage` origin 檢查錯誤

**舊版**：接收同源訊息  
**新版**：預期後端 API origin → 訊息被忽略

**修正**：恢復同源檢查

```typescript
if (e.origin !== window.location.origin) return;
```

### 問題 2：`getUserProfile` 在 Mock 模式下無法偵測 LINE 登入

**原因**：

- LINE 登入使用 HttpOnly Cookie
- Mock 模式檢查 `localStorage.authToken`（LINE 不會設定此值）
- 導致 `getUserProfile` 返回 `null`

**修正**：重構邏輯，讓 LINE 登入與 Mock 獨立運作

---

## 修改檔案

| 檔案         | 變更                                         |
| ------------ | -------------------------------------------- |
| `Login.tsx`  | 修正 `handlePopupMessage` origin 檢查        |
| `queries.ts` | 重構 `getUserProfile`，LINE 優先使用真實 API |

---

## 新架構

```
getUserProfile() 邏輯：

1. 檢查登出標記 → 有則返回 null
2. 呼叫真實 API（/api/v1/profile with Cookie）
   └── 成功 → 返回用戶資料（LINE 登入）
   └── 失敗 → 繼續步驟 3
3. 檢查 Mock token（localStorage.authToken）
   └── 有 mock_ 前綴 → 返回 Mock 用戶（電子郵件登入）
4. 返回 null（未登入）
```

---

## 驗證步驟

1. 用 PWA standalone 模式測試 LINE 登入
2. 確認成功跳轉回首頁
3. 測試電子郵件登入（Mock）仍正常運作

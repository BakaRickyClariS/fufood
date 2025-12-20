# LINE 登入 PWA 跳轉問題分析報告

> **日期**: 2025-12-20  
> **問題**: 在 PWA standalone 模式下，LINE 登入後停留在 `/auth/line/callback` 頁面，無法跳轉回首頁

---

## 問題現象

1. 使用者在 PWA standalone 模式下點擊「使用 LINE 應用程式登入」
2. 完成 LINE 授權後，頁面停留在 `/auth/line/callback`
3. 無法自動跳轉回首頁

---

## 根因分析

### 比較 commit `0ff1138`（可運作）與目前版本

#### 關鍵問題：`Login.tsx` 的 `handlePopupMessage` origin 檢查邏輯被反轉

**舊版（commit `0ff1138`，可運作）:**

```typescript
const handlePopupMessage = useCallback(
  (e: MessageEvent) => {
    if (e.origin === location.origin) {
      return; // 忽略來自相同 origin 的訊息
    }
    // 處理 postMessage...
  },
  [refetch],
);
```

**被改成（有問題）:**

```typescript
const handlePopupMessage = useCallback(
  (e: MessageEvent) => {
    const expectedOrigin = new URL(LineLoginUrl).origin;
    if (e.origin !== expectedOrigin) {
      return; // 只接收來自後端 API origin 的訊息
    }
    // 處理 postMessage...
  },
  [refetch],
);
```

### 問題說明

| 項目                   | 說明                                                                      |
| ---------------------- | ------------------------------------------------------------------------- |
| **postMessage 來源**   | `LineLoginCallback.tsx` 發送，origin 為前端（如 `http://localhost:5173`） |
| **錯誤的 origin 檢查** | 預期訊息來自後端 API origin（如 `https://api.fufood.jocelynh.me`）        |
| **結果**               | 訊息被忽略，`refetch()` 不會被呼叫，登入狀態無法更新                      |

---

## 解決方案

### 修正 `Login.tsx` 的 `handlePopupMessage`

```typescript
const handlePopupMessage = useCallback(
  (e: MessageEvent) => {
    // 只接收來自同源的 postMessage（LineLoginCallback 發送的）
    if (e.origin !== window.location.origin) {
      return;
    }
    // ... 處理登入成功
  },
  [refetch],
);
```

---

## 變更檔案

| 檔案                        | 變更內容                                     |
| --------------------------- | -------------------------------------------- |
| `src/routes/Auth/Login.tsx` | 修正 `handlePopupMessage` 的 origin 檢查邏輯 |

---

## 驗證步驟

1. 開啟 PWA standalone 模式
2. 點擊「使用 LINE 應用程式登入」
3. 完成 LINE 授權
4. 確認成功跳轉回首頁

---

## 額外說明

本次修改同時保留了先前新增的功能：

- `VITE_LINE_LOGIN_MODE` 環境變數開關（`popup` / `redirect` / `auto`）
- `LineLoginCallback.tsx` 的成功訊息 UI

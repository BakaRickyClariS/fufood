# 認證模組前端同步與錯誤處理優化規劃 (Frontend Auth Module Sync SDD)

## 1. 概述 (Overview)
配合後端 API 欄位統一化（`displayName` → `name`），前端認證模組需進行相對應的型別校正與錯誤處理邏輯抽離，以符合 `frontend-dev-guidelines` 的模組化規範。

## 2. 修正目標 (Objectives)
- **型別一致化**：移除所有 API 定義中的 `displayName` 贅字，回歸單一 `name` 屬性。
- **邏輯抽離 (Refactor)**：將 `Register.tsx` 中的深度錯誤規則解析抽離至共享的 `api/client.ts` 或 `utils` 中。

## 3. 具體變更方案 (Proposed Changes)

### 3.1 型別定義更新 (Type Updates)
- 在 `src/modules/auth/types/api.types.ts` 中修正：
  ```diff
  export type RegisterRequest = {
    email: string;
    password: string;
-   displayName?: string;
+   name?: string;
  };
  ```

### 3.2 錯誤解析 Helper 提取 (SRP 原則)
目前錯誤解析邏輯直接寫在 `Register.tsx` 中，建議提取至 `src/api/utils.ts`：

```typescript
// 建議提取的 Helper
export const parseApiErrorMessage = (err: unknown, fallback = '操作失敗'): string => {
  if (err instanceof ApiError) {
    const data = err.data;
    // 支援深入解析 backend error structure
    return data?.error?.details?.[0]?.message || data?.message || err.message || fallback;
  }
  return (err as Error)?.message || fallback;
};
```

## 4. 符合規範說明 (Compliance)
- **Clean Code**: 遵循 **SRP (Single Responsibility Principle)**，將 UI 顯示與錯誤解析邏輯分離。
- **Frontend Guidelines**: 遵循 **Feature-based structure**，確保 API 型別定義精確且無遺留命名。

## 5. 結論 (Conclusion)
透過此同步規劃，能徹底消除「欄位名稱不符」導致的 422 錯誤黑箱，並減輕 UI 元件的維護負擔。

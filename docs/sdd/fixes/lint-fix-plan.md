# Lint 錯誤修復計畫 (更新版)

## 1. 問題分析

根據 `npm run lint` 的輸出與您的需求，我們將採取以下策略：

1.  **建置檔案未被忽略 (`dev-dist`)**:
    *   大量的錯誤來自自動產生的 `dev-dist` 資料夾。
    *   **策略**: 在 `eslint.config.ts` 中正確忽略此目錄。

2.  **shadcn/ui 元件 (`src/shared/components/ui`)**:
    *   這些是第三方 UI 庫的自動生成代碼 (`button.tsx`, `input.tsx` 等)，不應強制套用我們的 Lint 規則。
    *   **策略**: 在 `eslint.config.ts` 中完全忽略 `src/shared/components/ui` 目錄。

3.  **React Hooks 依賴 (`CategoryPage.tsx`)**:
    *   `The 'items' conditional could make the dependencies of useMemo Hook change...`
    *   這是應用程式邏輯代碼，必須修復。
    *   **策略**: 重構程式碼以符合 Hooks 規則。

## 2. 執行步驟

### 步驟 1: 修正 `eslint.config.ts` (忽略設定)
更新 `ignores` 設定，加入 `dev-dist` 與 `src/shared/components/ui`。

```typescript
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/dev-dist/**',
      '**/coverage/**',
      '**/src/shared/components/ui/**' // 忽略 shadcn/ui 元件
    ],
  },
  // ... 其他設定
]
```

### 步驟 2: 修正 `src/routes/Inventory/CategoryPage.tsx`
檢查並重構 `items` 與 `useMemo` 的關係，確保 Hooks 依賴穩定。

## 3. 驗證
執行 `npm run lint` 確認所有錯誤已解決。

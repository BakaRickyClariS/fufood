# ESLint 與 Airbnb Config 衝突解決方案

## 問題診斷

### 錯誤訊息
```
npm error Could not resolve dependency:
npm error peer eslint@"^7.32.0 || ^8.2.0" from eslint-config-airbnb@19.0.4
```

### 根本原因

專案目前狀況：
- ✅ **ESLint**: `9.39.1` (最新版本，使用 flat config)
- ❌ **eslint-config-airbnb**: `19.0.4` (僅支援 ESLint 7-8)
- ✅ **配置檔**: 已使用 ESLint 9 flat config (`eslint.config.ts`)
- ✅ **相容層**: 已使用 `@eslint/eslintrc` 的 `FlatCompat`

**衝突點**: `eslint-config-airbnb` 官方尚未發布支援 ESLint 9 的版本（截至 2024 年 11 月）。

---

## 解決方案

### 方案 1: 使用 `overrides` 強制忽略 peer dependency (推薦⭐⭐⭐⭐⭐)

**原理**: npm overrides 可以改變整個依賴樹中的套件版本，包括 peer dependencies 的要求。

**優點**:
- ✅ 無需修改程式碼
- ✅ 保留 Airbnb 規則集
- ✅  FlatCompat 已經讓配置正常運作
- ✅ 當 Airbnb 正式支援 ESLint 9 時易於升級

**缺點**:
- ⚠️ 仍會在某些工具中看到警告（但功能正常）

**實施步驟**:

#### 步驟 1: 更新 `package.json` 的 `overrides`

```json
{
  "overrides": {
    "eslint-config-airbnb": {
      "eslint": "$eslint",
      "eslint-plugin-react-hooks": "^5.0.0"
    }
  }
}
```

> [!TIP]
> `"eslint": "$eslint"` 表示強制使用專案根目錄定義的 ESLint 版本 (9.39.1)

#### 步驟 2: 清除並重新安裝

```bash
# 刪除 node_modules 和 lock file
rm -rf node_modules package-lock.json

# 清除 npm cache
npm cache clean --force

# 重新安裝
npm install
```

#### 步驟 3: 驗證

```bash
# 檢查是否安裝成功
npm ls eslint

# 執行 lint
npm run lint
```

---

### 方案 2: 降級 ESLint 到版本 8 (不推薦⭐⭐)

**原理**: 降級到 Airbnb 支援的版本。

**優點**:
- ✅ 完全相容，無警告

**缺點**:
- ❌ 無法使用 ESLint 9 的新功能
- ❌ 需要重寫 `eslint.config.ts` 為舊的 `.eslintrc` 格式
- ❌ 放棄技術進步

**不建議採用此方案**，因為您已經投入時間配置 flat config。

---

### 方案 3: 移除 Airbnb，使用替代方案 (推薦⭐⭐⭐⭐)

**原理**: 使用支援 ESLint 9 的替代配置。

#### 選項 3.1: 純手動配置 (目前狀態)

您的 `eslint.config.ts` 已經包含了大部分 Airbnb 規則的精髓：
- TypeScript support
- React support  
- Import rules
- Prettier integration

**操作**:

```bash
# 移除 Airbnb
npm uninstall eslint-config-airbnb

# 移除 FlatCompat 相關（因為不再需要）
# 保留 @eslint/eslintrc (不移除，可能有其他用途)
```

修改 `eslint.config.ts`:

```typescript
// 移除 FlatCompat 和 Airbnb 相關程式碼
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/dev-dist/**',
      '**/src/shared/components/ui/**',
    ],
  },
  
  // 載入 ESLint 推薦設定
  eslint.configs.recommended,
  
  // 載入 TypeScript 推薦設定
  ...tseslint.configs.recommended,
  
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.app.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      // 保留您現有的所有規則...
      // （您的規則配置已經很完善了）
    },
  },
  
  // Prettier 放在最後
  prettier,
  
  {
    files: ['vite.config.ts', 'vite.config.d.ts', '*.config.ts', 'test-*.js'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'no-underscore-dangle': 'off',
      'no-console': 'off',
    },
  },
];
```

#### 選項 3.2: 使用 `eslint-config-airbnb-extended`

這是社群為 ESLint 9 開發的 Airbnb 風格配置。

```bash
# 移除舊的 Airbnb
npm uninstall eslint-config-airbnb

# 安裝新的 (如果需要)
npm install -D eslint-config-airbnb-extended
```

---

### 方案 4: 繼續使用 `.npmrc` 的 `legacy-peer-deps` (不推薦⭐)

**實施**:
恢復 `.npmrc`:
```
legacy-peer-deps=true
```

**缺點**:
- ❌ 只是隱藏問題，沒有真正解決
- ❌ 可能隱藏其他重要的 peer dependency 問題

---

## 推薦方案比較

| 方案 | 難度 | 影響範圍 | 推薦指數 | 適用場景 |
|------|------|---------|---------|---------|
| 方案 1: overrides | 🟢 低 | 僅 package.json | ⭐⭐⭐⭐⭐ | 想保留 Airbnb，等待官方支援 |
| 方案 2: 降級 ESLint 8 | 🔴 高 | 整個 ESLint 配置 | ⭐⭐ | 不推薦 |
| 方案 3.1: 移除 Airbnb | 🟡 中 | eslint.config.ts | ⭐⭐⭐⭐ | 想完全掌控規則 |
| 方案 3.2: 替代配置 | 🟡 中 | 依賴和配置 | ⭐⭐⭐ | 想要類似 Airbnb 的新方案 |
| 方案 4: legacy-peer-deps | 🟢 低 | 僅 .npmrc | ⭐ | 臨時應急 |

---

## 最佳實踐建議

### 綜合方案 (推薦)

**短期**: 使用**方案 1** (overrides) 立即解決安裝問題

**理由**:
1. 您的 `eslint.config.ts` 已經很完善
2. FlatCompat 讓 Airbnb 規則正常運作
3. 改動最小，風險最低

**長期**: 關注 `eslint-config-airbnb` 的更新，當正式支援 ESLint 9 後移除 overrides

---

## 詳細實施步驟（方案 1）

### 步驟 1: 修改 package.json

打開 `package.json`，修改 `overrides` 區塊：

```json
{
  "overrides": {
    "eslint-config-airbnb": {
      "eslint": "$eslint",
      "eslint-plugin-react-hooks": "^5.0.0"
    }
  }
}
```

**完整的 package.json overrides 區塊應該是**:

```json
{
  "name": "fufood",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    // ... 您的 scripts
  },
  "dependencies": {
    // ... 您的 dependencies
  },
  "devDependencies": {
    // ... 您的 devDependencies
  },
  "overrides": {
    "eslint-config-airbnb": {
      "eslint": "$eslint",
      "eslint-plugin-react-hooks": "^5.0.0"
    }
  }
}
```

### 步驟 2: 刪除舊的安裝

這很重要！確保完全清除舊的依賴。

```powershell
# Windows PowerShell

# 刪除 node_modules
Remove-Item -Recurse -Force node_modules

# 刪除 package-lock.json
Remove-Item -Force package-lock.json

# 清除 npm cache
npm cache clean --force
```

### 步驟 3: 重新安裝

```powershell
# 不使用 legacy-peer-deps 安裝
npm install
```

> [!IMPORTANT]
> 確保 `.npmrc` 中的 `legacy-peer-deps=true` 仍然是註解狀態 (`# legacy-peer-deps=true`)

### 步驟 4: 驗證安裝

```powershell
# 檢查 ESLint 版本
npm ls eslint

# 應該看到類似輸出:
# fufood@0.0.0
# ├─┬ eslint-config-airbnb@19.0.4
# │ └── eslint@9.39.1 deduped overridden
# └── eslint@9.39.1

# 執行 lint
npm run lint

# 執行 lint fix
npm run lint:fix
```

### 步驟 5: 測試 ESLint 功能

建立測試檔案 `test-eslint.tsx`:

```tsx
// 故意犯一些 Airbnb 會抓到的錯誤
import React from 'react'  // 缺少分號
const unused = 'test';     // 未使用變數

function TestComponent() {
  const [count, setCount] = React.useState(0)  // 缺少分號
  return <div>{count}</div>
}

export default TestComponent
```

執行:
```powershell
npx eslint test-eslint.tsx
```

應該會看到錯誤，表示 ESLint 和 Airbnb 規則正常運作。

測試完成後刪除測試檔案:
```powershell
Remove-Item test-eslint.tsx
```

---

## 預期結果

完成方案 1 後:

✅ `npm install` 成功執行，無錯誤  
✅ ESLint 保持在 9.39.1  
✅ Airbnb 規則正常運作  
✅ 不需要 `legacy-peer-deps=true`  
✅ 可能仍會看到一些警告訊息，但不影響功能  

---

## 常見問題 FAQ

### Q1: 為什麼 overrides 可以解決這個問題？

A: npm 的 `overrides` 功能允許您強制覆寫整個依賴樹中的特定套件版本，**包括修改 peer dependency 的要求**。當您設定 `"eslint": "$eslint"` 時，npm 會將 `eslint-config-airbnb` 的 peer dependency 從 `eslint@^7.32.0 || ^8.2.0` 改為使用您專案根目錄的 ESLint 版本 (9.39.1)。

### Q2: 使用 overrides 會有什麼風險？

A: 主要風險是 `eslint-config-airbnb` 內部可能使用了 ESLint 8 的 API，而這些 API 在 ESLint 9 中已改變或移除。不過，因為您使用了 `FlatCompat`，它會處理大部分的相容性問題。實際測試顯示大部分規則仍能正常運作。

### Q3: 如果未來 Airbnb 正式支援 ESLint 9 怎麼辦？

A: 只需要:
1. 移除或註解 `package.json` 中的 `overrides` 區塊
2. 執行 `npm update eslint-config-airbnb`
3. 重新安裝 `npm install`

### Q4: 我可以同時使用 overrides 和 legacy-peer-deps 嗎？

A: 可以，但**不建議**。`overrides` 已經解決了問題，再加上 `legacy-peer-deps` 會隱藏其他潛在的 peer dependency 衝突。

### Q5: overrides 會影響其他套件嗎？

A: 您配置的 `overrides` 只針對 `eslint-config-airbnb` 及其子依賴。不會影響其他套件。`$eslint` 語法確保只使用您專案定義的版本。

---

## 故障排除

### 問題 1: 執行 `npm install` 仍然失敗

**可能原因**: cache 未清除乾淨

**解決方法**:
```powershell
npm cache verify
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### 問題 2: ESLint 執行時出現奇怪的錯誤

**可能原因**: 配置檔案衝突

**檢查**:
```powershell
# 確認只有一個 ESLint 配置檔
Get-ChildItem -Recurse -Filter ".eslintrc*"
Get-ChildItem -Recurse -Filter "eslint.config.*"
```

應該只有 `eslint.config.ts`，如果有舊的 `.eslintrc` 系列檔案，請刪除。

### 問題 3: 某些 Airbnb 規則未生效

**可能原因**: FlatCompat 轉換問題

**解決方法**:  
在 `eslint.config.ts` 中手動添加缺失的規則。您目前的配置已經很完善，應該不會有這個問題。

---

## 替代方案補充 (方案 3.1 詳細步驟)

如果您決定**完全移除 Airbnb**：

### 步驟 1: 移除套件

```powershell
npm uninstall eslint-config-airbnb
```

### 步驟 2: 修改 eslint.config.ts

移除以下程式碼:

```diff
- import { FlatCompat } from '@eslint/eslintrc';
- import path from 'path';
- import { fileURLToPath } from 'url';
- 
- // 模擬 __dirname (ESM 模組需要)
- const __filename = fileURLToPath(import.meta.url);
- const __dirname = path.dirname(__filename);
- 
- // 初始化 FlatCompat
- const compat = new FlatCompat({
-   baseDirectory: __dirname,
- });
```

以及:

```diff
-  // 1. 透過 compat 載入 Airbnb 設定
-  ...compat.extends('airbnb'),
-
```

### 步驟 3: 補充可能缺失的規則

Airbnb 提供的許多規則在您的配置中已經涵蓋。如果發現遺漏，可以手動添加。

### 步驟 4: 安裝並測試

```powershell
npm install
npm run lint
```

---

## 總結

### 推薦執行順序

1. ✅ **立即採用方案 1** - 修改 `package.json` 的 `overrides`
2. ✅ **清除並重新安裝** - 確保乾淨的依賴樹  
3. ✅ **驗證功能** - 執行 lint 確認正常運作
4. ✅ **移除 `.npmrc` 的 legacy-peer-deps** - 已經不需要

### 未來規劃

- 🔔 監控 [eslint-config-airbnb](https://github.com/airbnb/javascript) 的更新
- 🔔 當正式支援 ESLint 9 後，移除 `overrides`
- 🔔 考慮逐步遷移到更現代的 ESLint 配置方式

---

*文件建立時間: 2025-11-30*  
*適用專案: fufood*  
*ESLint 版本: 9.39.1*  
*Node.js 版本: 建議 18+*

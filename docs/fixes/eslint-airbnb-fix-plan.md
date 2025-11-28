# ESLint Airbnb 安裝與設定修復計畫

## 1. 問題分析
- **錯誤原因**: `npm error ERESOLVE unable to resolve dependency tree`
- **詳細說明**: 目前專案使用 **ESLint v9** (最新版)，但 `eslint-config-airbnb` (v19.0.4) 的 `peerDependencies` 仍然要求 **ESLint ^7.32.0 || ^8.2.0**。這是因為 Airbnb 設定檔尚未正式發布支援 ESLint 9 的版本。
- **影響**: npm 預設會阻擋這種版本不相容的安裝，導致 `ERESOLVE` 錯誤。

## 2. 解決方案
我們將採取 **"強制相容模式"** 來解決此問題。這包含兩個部分：
1.  **安裝層面**: 使用 `--legacy-peer-deps` 參數繞過 npm 的嚴格依賴檢查。這會允許安裝 ESLint 9 即使 Airbnb 聲稱它不支援。
2.  **設定層面**: 使用 `@eslint/eslintrc` 的 `FlatCompat` 工具，讓舊版 Airbnb 設定 (`.eslintrc` 風格) 能在 ESLint 9 的 Flat Config (`eslint.config.ts`) 系統中運作。

## 3. 執行步驟

### 步驟 1: 安裝依賴 (修正指令)
請使用以下指令安裝，重點是加入了 `--legacy-peer-deps`：

```bash
npm install -D eslint-config-airbnb eslint-plugin-import eslint-plugin-jsx-a11y @eslint/eslintrc eslint-import-resolver-typescript --legacy-peer-deps
```

> **說明**: `eslint-plugin-react` 和 `eslint-plugin-react-hooks` 已經在您的專案中，無需重複安裝。

### 步驟 2: 設定 `eslint.config.ts`
由於 Airbnb 規則與 TypeScript 及新的 Flat Config 格式不直接相容，我們需要大幅調整 `eslint.config.ts`。

**主要修改點：**
1.  引入 `FlatCompat` 來載入 `airbnb` 設定。
2.  設定 `import/resolver` 讓 Airbnb 的 import 規則能看懂 TypeScript 的路徑別名 (`@/*`)。
3.  修正 Airbnb 與 TypeScript 的規則衝突 (如 `no-use-before-define`)。

**建議的 `eslint.config.ts` 內容：**

```typescript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

// 模擬 __dirname (ESM 模組需要)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化 FlatCompat
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: ['node_modules', 'dist', 'build', 'coverage', 'dev-dist'],
  },
  // 1. 透過 compat 載入 Airbnb 設定
  ...compat.extends('airbnb'),
  
  // 2. 載入 ESLint 推薦設定
  eslint.configs.recommended,
  
  // 3. 載入 TypeScript 推薦設定
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
      // 關鍵：設定 import resolver 支援 TS 路徑別名
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
      // --- React 規則調整 ---
      'react/react-in-jsx-scope': 'off', // React 17+ 不需引入 React
      'react/prop-types': 'off', // TS 專案不需 prop-types
      'react/display-name': 'warn',
      'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx'] }], // 允許 tsx

      // --- Hooks 規則 ---
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',

      // --- TypeScript 規則調整 ---
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // --- 解決 Airbnb 與 TypeScript 的衝突 ---
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': ['error'],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': ['error'],
      
      // 關閉 import/extensions 強制副檔名檢查
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],

      // --- 其他 ---
      'prettier/prettier': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
    },
  },
  // Prettier 放在最後以覆蓋衝突
  prettier,
];
```

### 步驟 3: 驗證
執行以下指令確認安裝與設定是否成功：

```bash
npm run lint
```

## 4. 風險評估與後續
- **相容性**: 雖然透過 `FlatCompat` 可以運作，但 ESLint 9 架構變動大，Airbnb 規則偶爾可能會有誤報（特別是 import 相關），上述設定已針對常見問題進行修正。
- **未來維護**: 待 Airbnb 官方推出正式支援 ESLint 9 的版本（通常會是 `eslint-config-airbnb-vNext` 或類似名稱）後，建議移除 `FlatCompat` 並更新依賴。

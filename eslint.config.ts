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
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/dev-dist/**',
      'dev-dist/**',
      '**/src/shared/components/ui/**',
    ],
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

      // --- Airbnb 規則調整（適應 TypeScript + 現代 React）---
      'react/function-component-definition': 'off', // 允許箭頭函數組件
      'react/require-default-props': 'off', // TypeScript 不需要 defaultProps
      'react/button-has-type': 'off', // 按鈕類型由 TypeScript 處理
      'react/jsx-props-no-spreading': 'off', // 允許屬性展開（常用於 UI 庫）
      'import/prefer-default-export': 'off', // 允許 named exports
      'no-plusplus': 'off', // 允許 ++ 運算符
      'no-continue': 'off', // 允許 continue 語句
      'no-nested-ternary': 'off', // 允許嵌套三元運算符
      'no-promise-executor-return': 'off', // 允許 Promise executor 返回值
      'import/no-unresolved': ['error', { ignore: ['^virtual:'] }], // 忽略 Vite 虛擬模組
      'jsx-a11y/alt-text': 'warn', // 降級為警告
      'jsx-a11y/click-events-have-key-events': 'warn', // 降級為警告
      'jsx-a11y/no-static-element-interactions': 'warn', // 降級為警告
      'jsx-a11y/control-has-associated-label': 'warn', // 降級為警告
      'jsx-a11y/label-has-associated-control': 'warn', // 降級為警告
      'react/no-array-index-key': 'warn', // 降級為警告
    },
  },
  // Prettier 放在最後以覆蓋衝突
  prettier,
  {
    files: ['vite.config.ts', 'vite.config.d.ts', '*.config.ts', 'test-*.js'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'no-underscore-dangle': 'off',
      'no-console': 'off', // 測試檔案允許 console
    },
  },
];

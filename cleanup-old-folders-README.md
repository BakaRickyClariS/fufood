# 舊資料夾清理腳本使用說明

## 🚀 執行方式

### 方法 1：在專案根目錄執行
```powershell
cd d:\User\Ricky\HexSchool\finalProject\fufood
.\cleanup-old-folders.ps1
```

### 方法 2：在 VSCode 終端機執行
1. 開啟 VSCode 終端機（Ctrl + `）
2. 確認在專案根目錄
3. 執行：
```powershell
.\cleanup-old-folders.ps1
```

## ⚠️ 執行前檢查清單

- [ ] **已完成 import 路徑更新**
  - 所有 `@/data/*` 已改為 `@/features/*` 或 `@/shared/*`
  - 所有 `@/components/ui/*` 已改為 `@/shared/components/ui/*`
  - 所有 `@/api/*` 已改為 `@/features/*/services/*`

- [ ] **開發伺服器正常運行**
  - `npm run dev` 沒有編譯錯誤
  - 頁面可以正常瀏覽

- [ ] **已使用 Git 儲存變更**
  ```bash
  git add .
  git commit -m "feat: 完成專案架構重組和 import 路徑更新"
  ```

## 📋 腳本功能

此腳本會自動執行：

### 1. 刪除空資料夾
- `src/api/`
- `src/components/ui/`

### 2. 遷移資料常數
- `src/data/layoutPattern.ts` → `src/shared/constants/layoutPattern.ts`

### 3. 遷移工具函式
- `src/functions/*.ts` → `src/shared/utils/layout/`

### 4. 遷移共用元件
- `src/components/feedback/SWPrompt.tsx` → `src/shared/components/feedback/`
- `src/components/global/AppContainer.tsx` → `src/shared/components/layout/`
- `src/components/forms/*.tsx` → `src/shared/components/forms/`

### 5. 遷移功能專屬元件
- `src/components/layout/InventorySection.tsx` → `src/features/inventory/components/`
- `src/components/layout/RecipeSection.tsx` → `src/features/recipe/components/`
- `src/components/layout/MemberList.tsx` → `src/shared/components/layout/`
- `src/components/layout/inventory/*.tsx` → `src/features/inventory/components/`

### 6. 清理舊結構
- 刪除所有空的舊資料夾
- 嘗試刪除整個 `src/components/` (如果已空)

## 🔍 執行後驗證

腳本執行完成後，請：

1. **檢查終端機輸出**
   - 確認所有檔案都已成功移動
   - 注意任何警告訊息

2. **查看 Git 變更**
   ```bash
   git status
   ```

3. **檢查開發伺服器**
   - 確認沒有新的編譯錯誤
   - 測試主要頁面功能

4. **查看新結構**
   ```bash
   tree src /F
   ```

## 🆘 如果遇到問題

### 腳本執行失敗
- 檢查是否有檔案正被使用（關閉編輯器）
- 確認 PowerShell 有足夠權限

### 遷移後出現 Import 錯誤
需要更新以下 import：

```typescript
// layoutPattern
from '@/data/layoutPattern' → '@/shared/constants/layoutPattern'

// autoLayoutEngine
from '@/functions/autoLayoutEngine' → '@/shared/utils/layout/autoLayoutEngine'

// SWPrompt
from '@/components/feedback/SWPrompt' → '@/shared/components/feedback/SWPrompt'

// AppContainer
from '@/components/global/AppContainer' → '@/shared/components/layout/AppContainer'

// FormSection, InputGroup
from '@/components/forms/*' → '@/shared/components/forms/*'

// InventorySection
from '@/components/layout/InventorySection' → '@/features/inventory/components/InventorySection'

// RecipeSection
from '@/components/layout/RecipeSection' → '@/features/recipe/components/RecipeSection'

// MemberList
from '@/components/layout/MemberList' → '@/shared/components/layout/MemberList'

// inventory 子資料夾元件
from '@/components/layout/inventory/*' → '@/features/inventory/components/*'
```

### 回復到執行前狀態
```bash
git reset --hard HEAD
```

## 💡 提示

- 腳本會在執行前要求確認
- 會顯示詳細的執行進度
- 可選擇在結束後顯示清理後的結構樹

---

**最後更新**: 2025-11-26

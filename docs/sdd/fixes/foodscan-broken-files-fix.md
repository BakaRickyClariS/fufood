# Food Scan 破壞修復計劃

## 🚨 問題概述

在執行設計修復過程中，由於 `replace_file_content` 工具的錯誤使用，導致以下檔案被破壞：

1. **ScanResultEditor.tsx** - 檔案頭部被截斷，缺少主要組件邏輯
2. **ScanResultEditForm.tsx** - 缺少必要的 import 語句
3. **InstructionsModal.tsx** - 缺少 `noticeImg` import

## 📋 錯誤詳情

### 錯誤 1: ScanResultEditor.tsx 破損

**當前狀態**：
```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import ScanResultEditForm from '../forms/ScanResultEditForm';
import {type FoodItemInput } from '../../types';
        </button>  // <-- 錯誤！缺少組件定義
        <h1 className="text-lg font-bold">確認食材資訊</h1>
      </div>
      // ... 其餘代碼
```

**問題**：
- 缺少 `type ScanResultEditorProps`
- 缺少 `export const ScanResultEditor` 主組件定義
- 缺少 `useForm` 和相關 hooks 的使用
- 缺少 `onSubmit` 函數

---

### 錯誤 2: ScanResultEditForm.tsx 缺少 Imports

**當前狀態**：
```tsx
import { Check, Tag, Box, FileText, Camera, Image as ImageIcon } from 'lucide-react';
// ... imports  // <-- 註解而非實際 import！

type ScanResultEditFormProps = {
  imageUrl: string;
  register: UseFormRegister<FoodItemInput>;  // <-- 型別未定義
  // ...
```

**問題**：
- 缺少 `React` import
- 缺少 `react-hook-form` 型別 imports: `UseFormRegister`, `Control`, `FieldErrors`
- 缺少 `FoodItemInput` 型別 import
- 缺少所有 Form 組件 imports: `FormInput`, `FormSelect`, `FormQuantity`, `FormDatePicker`, `FormToggle`, `FormTextarea`

---

### 錯誤 3: InstructionsModal.tsx 未完成修改

**當前狀態**：
```tsx
import React from 'react';
import { Info, Check } from 'lucide-react';  // <-- Info 未使用但引入

// ... 在組件內
<img src={noticeImg} alt="Instructions" ... />  // <-- noticeImg 未定義
```

**問題**：
- 缺少 `noticeImg` import
- `Info` icon 被引入但未使用（應該被移除）

---

## 🔧 修復方案

### 方案 1：完整重寫破損檔案 ⭐ 推薦

直接重建完整的正確檔案，確保所有功能正常。

#### A. ScanResultEditor.tsx

```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useFoodItemSubmit } from '../../hooks/useFoodItemSubmit';
import ScanResultEditForm from '../forms/ScanResultEditForm';
import { type FoodItemInput } from '../../types';

type ScanResultEditorProps = {
  initialData: FoodItemInput;
  imageUrl?: string;
  onSuccess: () => void;
  onBack: () => void;
  onRetake?: () => void;
  onPickImage?: () => void;
};

export const ScanResultEditor: React.FC<ScanResultEditorProps> = ({
  initialData,
  imageUrl,
  onSuccess,
  onBack,
  onRetake,
  onPickImage,
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FoodItemInput>({
    defaultValues: initialData,
  });

  const { submitFoodItem, isSubmitting, error } = useFoodItemSubmit();

  const onSubmit = async (data: FoodItemInput) => {
    const result = await submitFoodItem(data);
    if (result && result.success) {
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="text-gray-600 mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="text-lg font-bold">確認食材資訊</h1>
      </div>
      
      <div className="p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScanResultEditForm 
            imageUrl={imageUrl || ''}
            register={register}
            control={control}
            errors={errors}
            onRetake={onRetake}
            onPickImage={onPickImage}
          />
          
          <div className="mt-6 flex gap-4">
            <button 
              type="button" 
              onClick={onBack}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium"
            >
              取消
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium shadow-lg shadow-red-500/30 disabled:opacity-50"
            >
              {isSubmitting ? '處理中...' : '確認歸納'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
```

#### B. ScanResultEditForm.tsx

在檔案頂部添加完整 imports：

```tsx
import React from 'react';
import { Check, Tag, Box, FileText, Camera, Image as ImageIcon } from 'lucide-react';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import type { FoodItemInput } from '../../types';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormQuantity from './FormQuantity';
import FormDatePicker from './FormDatePicker';
import FormToggle from './FormToggle';
import FormTextarea from './FormTextarea';

// 其餘代碼保持不變...
```

#### C. InstructionsModal.tsx

修正 import：

```tsx
import React from 'react';
import { Check } from 'lucide-react';  // 移除 Info
import noticeImg from '@/assets/images/food-scan/notice.png';  // 新增

// 其餘代碼保持不變...
```

---

## 📝 逐步修復指令

### 步驟 1: 備份當前狀態（可選）

```bash
git status  # 檢查變更
git stash   # 暫存變更（如需要）
```

### 步驟 2: 修復 ScanResultEditor.tsx

```typescript
// 完全重寫檔案為上述完整版本
```

### 步驟 3: 修復 ScanResultEditForm.tsx

```typescript
// 在檔案開頭添加完整的 import 語句
// 確保移除 "// ... imports" 註解
```

### 步驟 4: 修復 InstructionsModal.tsx

```typescript
// 更新 import 語句
// 移除未使用的 Info icon
// 添加 noticeImg import
```

### 步驟 5: 驗證

```bash
npm run dev  # 重啟開發伺服器
```

---

## ✅ 驗證清單

- [ ] `ScanResultEditor.tsx` 可正常編譯
- [ ] `ScanResultEditForm.tsx` 沒有型別錯誤
- [ ] `InstructionsModal.tsx` 圖片正常顯示
- [ ] 所有 imports 正確
- [ ] 開發伺服器正常啟動
- [ ] 頁面可正常訪問

---

## 🎯 預防措施

為避免未來再次出現此類問題：

1. **使用 `write_to_file` 而非 `replace_file_content`**：對於複雜修改，完整重寫更安全
2. **小步修改**：一次只修改一個檔案，立即驗證
3. **版本控制**：修改前先 commit，方便回滾
4. **語法檢查**：編輯後立即檢查語法錯誤

---

## 📌 後續行動

1. **立即執行**：按照上述方案修復三個檔案
2. **測試**：確保所有功能正常運作
3. **提交**：修復完成後提交變更
4. **繼續**：完成剩餘的設計修復工作

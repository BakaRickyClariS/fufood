# Food Scan 設計稿修正規劃

## 📋 設計稿分析

### 提供的設計稿

![設計稿 1 - 掃描流程](/C:/Users/USER/.gemini/antigravity/brain/a3bbce02-bbc5-401a-a828-bdd27b0f0abc/uploaded_image_0_1764483877377.png)

![設計稿 2 - 掃描結果](/C:/Users/USER/.gemini/antigravity/brain/a3bbce02-bbc5-401a-a828-bdd27b0f0abc/uploaded_image_1_1764483877377.png)

![設計稿 3 - 編輯草稿](/C:/Users/USER/.gemini/antigravity/brain/a3bbce02-bbc5-401a-a828-bdd27b0f0abc/uploaded_image_2_1764483877377.png)

---

## 🔍 差異分析

### 1. 注意事項 Modal (InstructionsModal)

#### 設計稿要求：
- ✅ 白色圓角卡片背景
- ❌ **缺少插圖** - 應使用 `notice.png`
- ✅ 4個勾選項目
- ✅ 紅色「我知道了」按鈕
- ✅ 「下次不再顯示提醒」選項

#### 當前實現：
```tsx
// 使用了 Info icon placeholder
<div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center">
  <Info size={48} className="text-slate-300" />
</div>
```

#### 需要修改：
- 替換 placeholder 為實際的 `notice.png` 圖片
- 確保圖片樣式符合設計（圓角、大小）

---

### 2. 掃描結果頁面 (ScanResult) - **重大差異** ⚠️

#### 設計稿要求（預覽模式）：
```
掃描結果（標題）
├── 產品圖片（大圖，帶綠色勾選標記）
├── 辨識產品名：鮮奶（帶圖示）
├── 詳細說明區塊
│   ├── 產品分類：乳製品飲料類
│   ├── 產品屬性：鮮奶類
│   ├── 單位數量：1 / 罐
│   ├── 入庫日期：2026/01/01
│   ├── 保存期限：約10天（計算得出）
│   ├── 過期日期：2026/01/10
│   └── 備註：常備品
└── 兩個按鈕
    ├── 編輯草稿（紅色填充）
    └── 確認歸納（白色邊框）
```

#### 當前實現：
- ❌ **直接跳到編輯模式**
- ❌ 使用 `ScanResultEditor` 而不是預覽卡片
- ❌ 沒有「預覽 → 編輯」的流程

#### 需要修改：
1. **創建新的預覽組件** `ScanResultPreview.tsx`
2. **修改 `ScanResult.tsx` 流程**：
   - 預設顯示預覽模式
   - 點擊「編輯草稿」才進入編輯模式
   - 點擊「確認歸納」直接提交

---

### 3. 編輯草稿頁面

#### 設計稿要求：
- ✅ 頂部顯示產品圖片
- ❌ **右上角缺少相機和圖庫按鈕**
- ✅ 表單結構正確
- ✅ 歸納數量使用 +/- 按鈕
- ✅ 日期選擇器
- ✅ Toggle 開關
- ✅ 備註字數限制（0/20）
- ✅ 底部「確認歸納」按鈕

#### 需要修改：
- 在圖片區域右上角添加相機和圖庫圖示按鈕
- 確保所有樣式符合設計稿

---

### 4. 細節差異

#### 產品名稱顯示
- **設計稿**：「辨識產品名」+ 圖示
- **當前**：只有文字標籤

#### 詳細說明區塊
- **設計稿**：「詳細說明」標題，無圖示
- **當前**：每個欄位都有圖示

#### 日期顯示
- **設計稿**：
  - 入庫日期：2026/01/01
  - 保存期限：約10天（**新增欄位**）
  - 過期日期：2026/01/10
- **當前**：
  - 購物日期
  - 過期日期
  - 缺少「保存期限」計算

#### 欄位文字
- **設計稿**：「入庫日期」、「歸納數量」
- **當前**：「購物日期」、「購物數量」

---

## 🎯 修改方案

### 方案 A：完整重構（推薦） ⭐

**優點**：完全符合設計稿，用戶體驗最佳
**缺點**：工作量較大

#### 實施步驟：

1. **創建新組件** `ScanResultPreview.tsx`
   - 顯示大圖片 + 綠色勾選標記
   - 顯示辨識產品名（帶圖示）
   - 詳細說明列表（純文字，無圖示）
   - 計算並顯示「保存期限」（天數）
   - 兩個按鈕：「編輯草稿」、「確認歸納」

2. **修改 `ScanResult.tsx`**
   - 增加狀態 `mode: 'preview' | 'edit'`
   - 預設顯示 `ScanResultPreview`
   - 點擊「編輯草稿」切換到 `ScanResultEditor`

3. **修改 `InstructionsModal.tsx`**
   - 使用 `notice.png` 圖片
   - 調整圖片樣式

4. **修改 `ScanResultEditor.tsx`**
   - 圖片區域添加相機/圖庫按鈕
   - 調整文字標籤（「入庫日期」、「歸納數量」）

5. **創建輔助函數**
   - 計算保存期限天數（過期日期 - 入庫日期）

---

### 方案 B：最小修改

**優點**：工作量小
**缺點**：不完全符合設計稿

#### 實施步驟：

1. 只修改 `InstructionsModal` 圖片
2. 調整文字標籤
3. 不改變流程（保持編輯優先）

---

## 📂 需要的資源文件

### 圖片資源

1. **notice.png**
   - 路徑：`src/assets/images/food-scan/notice.png`
   - 用途：注意事項 Modal 插圖
   - 尺寸建議：256x256px 或 512x512px

2. **result.png**
   - 路徑：`src/assets/images/food-scan/result.png`
   - 用途：**掃描結果頁面頂部背景圖/裝飾圖**
   - 顯示位置：在產品圖片上方或作為頁面頂部視覺元素
   - 尺寸建議：根據設計稿調整

---

## 🗂️ 文件修改清單

### 新增文件

```
src/modules/food-scan/
├── components/
│   ├── features/
│   │   └── ScanResultPreview.tsx        [NEW] 預覽組件
│   └── ui/
│       └── ProductImageWithActions.tsx   [NEW] 圖片+按鈕組件
└── utils/
    └── dateHelpers.ts                    [NEW] 日期計算工具
```

### 修改文件

```
src/modules/food-scan/
├── components/
│   ├── ui/
│   │   ├── InstructionsModal.tsx         [MODIFY] 添加圖片
│   │   └── ScanResultCard.tsx            [MODIFY] 調整樣式
├── routes/FoodScan/
│   └── ScanResult.tsx                    [MODIFY] 添加預覽/編輯模式切換
└── components/features/
    └── ScanResultEditor.tsx              [MODIFY] 添加圖片操作按鈕
```

---

## 💻 核心代碼規劃

### 1. `ScanResultPreview.tsx` (新增)

```tsx
type ScanResultPreviewProps = {
  result: FoodItemInput;
  imageUrl: string;
  onEdit: () => void;
  onConfirm: () => void;
};

export const ScanResultPreview: React.FC<ScanResultPreviewProps> = ({
  result,
  imageUrl,
  onEdit,
  onConfirm,
}) => {
  // 計算保存期限
  const shelfLifeDays = calculateShelfLife(result.purchaseDate, result.expiryDate);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-center text-lg font-bold">掃描結果</h1>
      </div>

      {/* 頂部裝飾圖片 - result.png */}
      <div className="relative">
        <img 
          src="/src/assets/images/food-scan/result.png" 
          alt="Result decoration" 
          className="w-full h-auto"
        />
      </div>

      {/* 產品圖片 */}
      <div className="relative px-6 py-8">
        <img src={imageUrl} className="w-full rounded-3xl" />
        {/* 綠色勾選標記 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <Check size={48} className="text-white" strokeWidth={4} />
          </div>
        </div>
      </div>

      {/* 產品名稱 */}
      <div className="px-6">
        <div className="bg-white rounded-2xl p-4 mb-4 flex items-center gap-3">
          <Image size={24} className="text-red-500" />
          <div>
            <p className="text-sm text-slate-500">辨識產品名</p>
            <h2 className="text-xl font-bold">{result.productName}</h2>
          </div>
        </div>

        {/* 詳細說明 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold mb-4 text-red-500 border-l-4 border-red-500 pl-2">
            詳細說明
          </h3>
          <div className="space-y-3">
            <DetailRow label="產品分類" value={result.category} />
            <DetailRow label="產品屬性" value={result.attributes} />
            <DetailRow label="單位數量" value={`${result.purchaseQuantity} / ${result.unit}`} />
            <DetailRow label="入庫日期" value={result.purchaseDate} />
            <DetailRow label="保存期限" value={`約${shelfLifeDays}天`} />
            <DetailRow label="過期日期" value={result.expiryDate} />
            <DetailRow label="備註" value={result.notes || '-'} />
          </div>
        </div>
      </div>

      {/* 按鈕 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-3">
        <button onClick={onEdit} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold">
          編輯草稿
        </button>
        <button onClick={onConfirm} className="flex-1 border-2 border-slate-300 text-slate-700 py-3 rounded-xl font-bold">
          確認歸納
        </button>
      </div>
    </div>
  );
};
```

### 2. `ScanResult.tsx` (修改)

```tsx
const ScanResult: React.FC = () => {
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const { result, imageUrl } = useLocation().state || {};

  const handleEdit = () => setMode('edit');
  const handleConfirm = async () => {
    // 直接提交
    await foodScanApi.submitFoodItem(result);
    navigate('/inventory');
  };

  if (mode === 'preview') {
    return (
      <ScanResultPreview
        result={result}
        imageUrl={imageUrl}
        onEdit={handleEdit}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <ScanResultEditor
      initialData={result}
      imageUrl={imageUrl}
      onSuccess={() => navigate('/inventory')}
      onBack={() => setMode('preview')}
    />
  );
};
```

### 3. 日期計算工具函數

```typescript
// utils/dateHelpers.ts
export const calculateShelfLife = (purchaseDate: string, expiryDate: string): number => {
  const purchase = new Date(purchaseDate);
  const expiry = new Date(expiryDate);
  const diffTime = Math.abs(expiry.getTime() - purchase.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
```

---

## ✅ 驗證清單

### 注意事項 Modal
- [ ] 使用 `notice.png` 圖片
- [ ] 圖片大小適中
- [ ] 4個勾選項目顯示正確
- [ ] 按鈕樣式正確

### 掃描結果（預覽模式）
- [ ] 顯示大圖片
- [ ] 綠色勾選標記居中
- [ ] 產品名稱帶圖示
- [ ] 「詳細說明」標題顯示
- [ ] 計算並顯示保存期限
- [ ] 兩個按鈕樣式和功能正確

### 編輯模式
- [ ] 圖片右上角有相機/圖庫按鈕
- [ ] 文字標籤使用「入庫日期」、「歸納數量」
- [ ] 所有表單元素正常運作

---

## 📝 實施建議

### 優先級

1. **P0 (必須)**: 修改 InstructionsModal 圖片
2. **P1 (高)**: 創建 ScanResultPreview，實現預覽模式
3. **P2 (中)**: 添加圖片操作按鈕到編輯頁
4. **P3 (低)**: 調整文字標籤和細節樣式

### 時間估算

- 方案 A（完整重構）：4-6 小時
- 方案 B（最小修改）：1-2 小時

### 風險評估

- ⚠️ 修改流程可能影響現有導航邏輯
- ⚠️ 需要確保狀態管理正確（預覽 ↔ 編輯切換）
- ⚠️ 圖片資源需要確認尺寸和格式

---

## 🔗 相關文件

- 設計稿圖片：已上傳到 artifacts
- 現有實現：`src/modules/food-scan/components/`
- 路由配置：`src/routes/FoodScan/`

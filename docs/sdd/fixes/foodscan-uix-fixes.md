# Food Scan UI/UX 修正計劃

## 📸 用戶提供的設計稿

![掃描結果設計稿](/C:/Users/USER/.gemini/antigravity/brain/a3bbce02-bbc5-401a-a828-bdd27b0f0abc/uploaded_image_0_1764486293882.png)

![相機畫面設計稿](/C:/Users/USER/.gemini/antigravity/brain/a3bbce02-bbc5-401a-a828-bdd27b0f0abc/uploaded_image_1_1764486293882.png)

---

## 🔍 問題分析

### 問題 1: 掃描結果的兩個按鈕不見了 ⚠️

**當前狀態**：
- `ScanResultPreview.tsx` 中按鈕已存在（編輯草稿、確認歸納）
- 按鈕使用 `fixed bottom-0`，應該可見

**可能原因**：
- 內容區域的 `pb-24` padding 可能不足
- 如果內容過長，滾動時可能看不到按鈕
- 需要確保有足夠的底部空間

**設計稿要求**：
- 兩個按鈕：「編輯草稿」（紅色填充）、「確認歸納」（白色邊框）
- 按鈕必須固定在底部，且內容區域要有足夠的 padding

---

### 問題 2: 相機畫面不對 ⚠️⚠️

**設計稿要求**：
```
相機全屏畫面
├── 頂部提示：「沒問題，掃描即將完成」（綠色背景）
├── 中央：實時相機預覽（全屏）
├── 左下角：圖庫按鈕（圓形白底icon）
├── 右下角：關閉/取消按鈕（X icon，圓形白底）
└── 底部中央：拍照按鈕（大紅圓圈）
    └── Bottom Navigation的此頁連結變成拍照鍵
```

**當前實現**：
```
相機畫面
├── 頂部：黃色狀態提示「請將食材放入框內」
├── 中央：掃描框 + 角落裝飾
├── 底部控制：
│   ├── 左：圖庫按鈕
│   ├── 中：拍照按鈕
│   └── 右：空白（用於平衡）
```

**差異**：
1. ❌ Icon 位置錯誤 - 應該在左下和右下，而非底部中央區域
2. ❌ 缺少關閉按鈕（X icon）
3. ❌ 拍完照後沒有「確認圖片」的步驟
4. ❌ Bottom Navigation 的連結未整合

**需要修改**：
1. 重新設計 `CameraOverlay` 的佈局
2. Icon 移至絕對定位：左下和右下
3. 添加「圖片預覽確認」模式
4. 整合 Bottom Navigation

---

### 問題 3: 產品圖片位置不對 ⚠️

**設計稿要求**：
```
辨識產品名 區塊
├── 左側紅色標籤：「辨識產品名」
├── 中央：產品名稱（例如「鮮奶」）
└── 右側：縮小的產品圖片（圓形，約40-50px）
```

**當前實現**：
```tsx
<div className="bg-white rounded-2xl p-4 mb-4 flex items-center gap-3">
  <div className="w-10 h-10 rounded-full bg-red-100 ...">
     <Image size={20} className="text-red-500" />  // ← 使用 icon 而非實際圖片
  </div>
  <div>
    <p>辨識產品名</p>
    <h2>{result.productName}</h2>
  </div>
</div>
```

**差異**：
- ❌ 使用 icon 而非實際產品圖片
- ❌ 圖片位置在左側，應該在右側
- ❌ 佈局結構不符合設計

---

## 🎯 修正方案

### 方案 1: 修正掃描結果按鈕顯示

**目標**：確保按鈕始終可見，內容區域有足夠滾動空間

**修改文件**：`ScanResultPreview.tsx`

**具體修改**：
```tsx
// 1. 增加內容區域的底部 padding
<div className="px-6 -mt-12 relative z-10 pb-32">  {/* pb-24 → pb-32 */}
  {/* ... 內容 ... */}
</div>

// 2. 確保按鈕容器使用正確的 z-index 和樣式
<div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex gap-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
  {/* ... 按鈕 ... */}
</div>
```

---

### 方案 2: 重新設計相機畫面 UI ⭐ 重點

**目標**：
1. 全屏相機預覽（移除掃描框）
2. Icon 絕對定位於左下和右下
3. 添加「圖片確認」流程
4. 整合 Bottom Navigation

#### A. 新增「圖片確認」狀態

在 `CameraCapture.tsx` 或 `useWebcam.ts` 中添加新狀態：

```typescript
type CameraMode = 'live' | 'preview';  // live: 實時預覽, preview: 圖片確認
const [mode, setMode] = useState<CameraMode>('live');
const [capturedImage, setCapturedImage] = useState<string | null>(null);
```

#### B. 修改 `CameraOverlay` 佈局

**新佈局**：
```tsx
<div className="absolute inset-0 z-10 pointer-events-none">
  {/* 頂部提示 */}
  {mode === 'preview' && (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20">
      <div className="bg-green-500/90 text-white px-6 py-2 rounded-full font-bold text-sm">
        沒問題，掃描即將完成
      </div>
    </div>
  )}

  {/* 左下角：圖庫按鈕 */}
  <button
    onClick={onGallerySelect}
    className="absolute bottom-24 left-6 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-auto"
  >
    <ImageIcon size={24} className="text-gray-700" />
  </button>

  {/* 右下角：關閉按鈕 */}
  <button
    onClick={onClose}
    className="absolute bottom-24 right-6 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-auto"
  >
    <X size={24} className="text-gray-700" />
  </button>

  {/* 底部中央：拍照/確認按鈕 */}
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
    {mode === 'live' ? (
      <button
        onClick={onCapture}
        className="w-20 h-20 bg-red-500 rounded-full border-4 border-white shadow-xl"
      />
    ) : (
      <div className="flex gap-4">
        <button onClick={onRetake} className="w-14 h-14 bg-white rounded-full ...">
          <RotateCcw />
        </button>
        <button onClick={onConfirm} className="w-20 h-20 bg-green-500 rounded-full ...">
          <Check />
        </button>
      </div>
    )}
  </div>
</div>
```

#### C. 整合 Bottom Navigation

**問題**：Bottom Navigation 的「掃/拍」頁面連結需要變成拍照按鈕

**方案選擇**：

1. **方案 A（推薦）**：在掃描頁面隱藏 Bottom Navigation
   ```tsx
   // Upload.tsx
   return (
     <div className="fixed inset-0 w-full h-[100dvh] bg-black">
       <CameraCapture />
       {/* Bottom Nav 自動隱藏，因為 handle: { footer: false } */}
     </div>
   );
   ```

2. **方案 B**：修改 Bottom Navigation 在此頁的行為
   - 需要修改 `AppContainer.tsx` 或 Bottom Navigation 組件
   - 在掃描頁面時，中央按鈕觸發拍照而非導航

**推薦使用方案 A**，因為全屏相機體驗更佳。

---

### 方案 3: 修正產品圖片位置

**目標**：在「辨識產品名」區塊右側顯示縮小的產品圖片

**修改文件**：`ScanResultPreview.tsx`

**修改前**：
```tsx
<div className="bg-white rounded-2xl p-4 mb-4 flex items-center gap-3">
  <div className="w-10 h-10 rounded-full bg-red-100 ...">
     <Image size={20} />  // Icon
  </div>
  <div>
    <p>辨識產品名</p>
    <h2>{result.productName}</h2>
  </div>
</div>
```

**修改後**：
```tsx
<div className="bg-white rounded-2xl p-4 mb-4 flex items-center gap-3">
  <div className="flex-1">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-1 h-5 bg-red-500 rounded-full"></div>
      <p className="text-xs text-slate-500">辨識產品名</p>
    </div>
    <h2 className="text-xl font-bold text-slate-800">{result.productName}</h2>
  </div>
  
  {/* 產品圖片（縮小，右側） */}
  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-100 flex-shrink-0">
    <img src={imageUrl} alt={result.productName} className="w-full h-full object-cover" />
  </div>
</div>
```

---

## 📂 需要修改的文件

### 1. `ScanResultPreview.tsx`
- [ ] 增加內容底部 padding（pb-32）
- [ ] 修改「辨識產品名」區塊佈局，圖片移至右側
- [ ] 確保按鈕 z-index 正確

### 2. `CameraOverlay/index.tsx`
- [ ] 移除中央掃描框
- [ ] Icon 移至絕對定位：左下和右下
- [ ] 添加關閉按鈕（X icon）
- [ ] 支持 `mode` prop（live/preview）

### 3. `CameraCapture.tsx` 或 `useWebcam.ts`
- [ ] 添加 `mode` 狀態（live/preview）
- [ ] 拍照後進入 preview 模式
- [ ] 在 preview 模式顯示捕獲的圖片
- [ ] 添加「重拍」和「確認」邏輯
- [ ] 確認後才開始上傳和辨識

### 4. `Upload.tsx`
- [ ] 確認 `handle: { footer: false }` 已設置

---

## 🔧 實施步驟

### 步驟 1: 快速修復（優先）

1. **修正產品圖片位置** - `ScanResultPreview.tsx`
2. **增加底部 padding** - 確保按鈕可見

### 步驟 2: 相機 UI 重構（重點）

1. **修改 CameraOverlay 佈局**
2. **添加圖片預覽模式**
3. **整合確認流程**

### 步驟 3: 測試驗證

1. 測試相機拍照流程
2. 測試圖庫選擇流程
3. 測試圖片確認和重拍
4. 測試掃描結果顯示

---

## ✅ 驗證清單

### 掃描結果頁
- [ ] 產品圖片顯示在辨識產品名右側（圓形，約50px）
- [ ] 兩個按鈕（編輯草稿、確認歸納）固定在底部可見
- [ ] 內容可完整滾動，不被按鈕遮擋

### 相機頁面
- [ ] 全屏相機預覽（無掃描框）
- [ ] 左下角圓形圖庫按鈕
- [ ] 右下角圓形關閉按鈕
- [ ] 底部中央紅色拍照按鈕
- [ ] 拍照後顯示圖片預覽
- [ ] 預覽模式顯示「沒問題，掃描即將完成」提示
- [ ] 預覽模式有重拍和確認按鈕
- [ ] 確認後才開始上傳和辨識
- [ ] Bottom Navigation 在此頁隱藏或整合

---

## 🎨 設計細節

### 相機 UI 規格

```
圖庫按鈕（左下）:
- 位置: bottom-24 left-6
- 尺寸: w-14 h-14
- 樣式: bg-white rounded-full shadow-lg

關閉按鈕（右下）:
- 位置: bottom-24 right-6
- 尺寸: w-14 h-14
- 樣式: bg-white rounded-full shadow-lg

拍照按鈕（底部中央）:
- 位置: bottom-8 left-1/2 -translate-x-1/2
- 尺寸: w-20 h-20
- 樣式: bg-red-500 rounded-full border-4 border-white

預覽確認按鈕:
- 重拍: w-14 h-14, 白色圓形
- 確認: w-20 h-20, 綠色圓形
```

### 產品圖片規格

```
辨識產品名區塊:
- 容器: bg-white rounded-2xl p-4
- 佈局: flex items-center
  ├── 左：標題和產品名（flex-1）
  └── 右：產品圖片（w-14 h-14 rounded-full）
```

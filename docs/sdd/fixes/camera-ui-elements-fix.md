# 相機頁面拍照按鈕與 UI 元素位置修復計畫

## 問題描述

在相機掃描頁面中，拍照按鈕消失了，且提示 toast 和其他 UI 元素可能進入掃描框內部，影響使用體驗。

## 根本原因分析

### 1. 拍照按鈕消失的原因 ⚠️

檢查 [CameraOverlay/index.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/components/ui/CameraOverlay/index.tsx#L80-L106)：

```tsx
// Line 80-106: 底部中央按鈕區域
<div className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-auto z-50">
  {!isCapturing && (
    <div className="flex gap-6 items-center">
      {/* Retake Button (X) */}
      <button onClick={onRetake} ...>
        <X size={24} strokeWidth={3} />
      </button>

      {/* Confirm Button */}
      <button onClick={onConfirm} ...>
        {isProcessing ? (...) : (<Check size={24} strokeWidth={3} />)}
      </button>
    </div>
  )}
</div>
```

**問題：** 拍照按鈕只在 `!isCapturing` 時顯示（即預覽模式），但在 `isCapturing` 狀態（拍照模式）下沒有對應的拍照按鈕！

### 2. UI 元素與掃描框的位置衝突

根據設計稿分析：

![設計稿](file:///C:/Users/User/.gemini/antigravity/brain/ec326a7e-d83d-4820-96c8-16d4b921ad70/uploaded_image_1764659751749.png)

**設計稿顯示的 UI 布局：**

1. **頂部 Toast**（黃色）：位於螢幕上方，在掃描框之外
2. **掃描框**：中央的圓角矩形框，顯示食材掃描區域
3. **底部按鈕**：
   - 左側：相簿按鈕（相框圖示）
   - 中央：**拍照按鈕**（粉紅色大圓按鈕）← **這個按鈕目前消失了！**
   - 右側：關閉按鈕（X 圖示）

**目前的問題：**
- 拍照按鈕在 `isCapturing` 狀態下沒有渲染
- Toast 位置在 `top-28` (7rem)，可能太低了
- 按鈕位置需要調整以確保不與掃描框重疊

### 3. 掃描框尺寸分析

[ScanFrame.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/components/ui/ScanFrame.tsx#L6-L32) 設定：
- 寬度：最多 80% viewport 或 400px
- 高度：最多 65% viewport
- 比例：3:4

這意味著掃描框會占據螢幕中央大部分區域，UI 元素需要放在框外。

## 修復方案

### 方案：調整 CameraOverlay 元件 ✅

**優點：**
- 只需修改一個檔案
- 明確的 UI 狀態管理
- 符合設計稿規格

**實作步驟：**

#### 1. 新增拍照按鈕到 Capturing 狀態

在 [CameraOverlay/index.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/components/ui/CameraOverlay/index.tsx#L80-L106) 的底部中央區域，新增 capturing 狀態下的拍照按鈕：

```tsx
<div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto z-50">
  {isCapturing ? (
    // Capturing Mode: Show Capture Button
    <button
      onClick={onCapture}
      disabled={isProcessing}
      className="w-20 h-20 bg-gradient-to-b from-[#f58274] to-[#ec5b4a] rounded-full flex items-center justify-center shadow-2xl text-white hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 border-4 border-white"
    >
      <div className="w-16 h-16 border-4 border-white rounded-full" />
    </button>
  ) : (
    // Preview Mode: Show Retake and Confirm Buttons
    <div className="flex gap-6 items-center">
      {/* ... existing retake and confirm buttons */}
    </div>
  )}
</div>
```

#### 2. 調整 Toast 位置避開掃描框

修改 Toast 位置從 `top-28` 改為 `top-20`，確保在掃描框之上：

```tsx
{/* Top Status for Capturing - Yellow Pill */}
{isCapturing && (
  <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
    <div className="bg-yellow-400/90 text-black px-6 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-sm">
      請將食材放入框內
    </div>
  </div>
)}

{/* Top Status - Preview/Processing */}
{!isCapturing && (
  <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
    {/* ... existing status messages */}
  </div>
)}
```

#### 3. 調整左右按鈕位置

確保相簿和關閉按鈕在掃描框外：

```tsx
{/* Left Bottom: Gallery Button */}
{isCapturing && (
  <button
    onClick={onGallerySelect}
    disabled={isProcessing}
    className="absolute bottom-8 left-8 w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg pointer-events-auto text-slate-700 hover:bg-white transition-all disabled:opacity-50"
  >
    <ImageIcon size={24} />
  </button>
)}

{/* Right Bottom: Close Button */}
{isCapturing && (
  <button
    onClick={onClose}
    disabled={isProcessing}
    className="absolute bottom-8 right-8 w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg pointer-events-auto text-slate-700 hover:bg-white transition-all disabled:opacity-50"
  >
    <X size={24} />
  </button>
)}
```

## 修改檔案清單

### 必須修改

#### [CameraOverlay/index.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/components/ui/CameraOverlay/index.tsx)

**變更內容：**
1. 新增 capturing 模式下的拍照按鈕 (Line 80-106)
2. 調整 Toast 位置從 `top-28` 到 `top-20` (Line 32, 49)
3. 調整左右按鈕位置從 `bottom-24` 到 `bottom-8` (Line 62, 73)
4. 修復 `onCapture` 參數使用（目前被重命名為 `_onCapture`）

## 設計規格

根據設計稿，UI 元素的規格如下：

| 元素 | 位置 | 樣式 |
|------|------|------|
| **Toast 提示** | `top-20` | 黃色圓角藥丸，半透明背景 |
| **拍照按鈕** | `bottom-8` 中央 | 粉紅色漸層圓形，直徑 80px，白色邊框 |
| **相簿按鈕** | `bottom-8` 左側 | 白色圓形，直徑 56px |
| **關閉按鈕** | `bottom-8` 右側 | 白色圓形，直徑 56px |
| **掃描框** | 螢幕中央 | 圓角矩形，3:4 比例，65% viewport 高度 |

## 驗證計畫

### 手動驗證 ✅

> [!TIP]
> **測試步驟：**

1. **檢查拍照按鈕顯示**
   - 訪問 `/upload` 頁面
   - ✅ 確認中央有粉紅色的拍照按鈕
   - ✅ 按鈕樣式符合設計稿（漸層色、白色邊框）
   
2. **檢查按鈕位置**
   - ✅ Toast 提示在掃描框上方，不重疊
   - ✅ 拍照按鈕在掃描框下方，不重疊
   - ✅ 相簿和關閉按鈕在掃描框外側
   
3. **測試拍照流程**
   - 點擊拍照按鈕
   - ✅ 成功拍照並進入預覽模式
   - ✅ 預覽模式下顯示重拍（X）和確認（✓）按鈕
   - ✅ 拍照按鈕正確切換為預覽按鈕
   
4. **測試其他功能**
   - ✅ 相簿按鈕可以打開圖片選擇器
   - ✅ 關閉按鈕可以返回首頁
   - ✅ 重拍按鈕可以返回拍照模式
   - ✅ 確認按鈕可以開始上傳和分析

5. **響應式測試**
   - 在不同螢幕尺寸下測試
   - ✅ 小螢幕（手機）：按鈕不重疊，位置合理
   - ✅ 大螢幕（平板/桌面）：按鈕位置仍然正確

### 預期結果

- ✅ 拍照按鈕在 capturing 模式下正常顯示
- ✅ 所有 UI 元素不與掃描框重疊
- ✅ Toast 提示位於掃描框上方
- ✅ 按鈕位置符合設計稿規格
- ✅ 拍照流程順暢，狀態切換正確

## 其他注意事項

### Z-index 層級

確認元素的堆疊順序：
- ScanFrame: `z-10` (掃描框)
- CameraOverlay Toast: `z-20` (提示訊息)
- CameraOverlay 按鈕: `z-50` (按鈕，最上層)

### 設計一致性

> [!IMPORTANT]
> 拍照按鈕使用與 BottomNav FAB 按鈕相同的漸層色：
> ```css
> background: radial-gradient(circle at 30% 30%, #f58274, #ec5b4a)
> ```
> 改用 Tailwind 的漸層：`from-[#f58274] to-[#ec5b4a]`

### 效能考量

- 按鈕使用 `transition-transform` 而非 `transition-all`，避免不必要的重繪
- 使用 `pointer-events-auto` 只在需要互動的元素上啟用指標事件

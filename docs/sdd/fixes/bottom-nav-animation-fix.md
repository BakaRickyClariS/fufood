# BottomNav 隱藏動畫修復計畫

## 問題描述

在進入 food scan 頁面（`/upload`）時，`CameraCapture.tsx` 中的 GSAP 動畫應該將 `BottomNav.tsx` 往下隱藏，但目前動畫沒有正確觸發。

## 根本原因分析

經過檢查兩個檔案的程式碼，發現以下關鍵問題：

### 1. Class 選擇器不匹配 ⚠️

[CameraCapture.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/components/features/CameraCapture.tsx#L46-L78) 中的 GSAP 動畫嘗試操作：
```tsx
// Line 49-52: 頂部導航動畫
gsap.to('.top-nav-wrapper', { 
  yPercent: -100, 
  duration: 0.5, 
  ease: 'power3.inOut' 
});

// Line 54-58: 底部導航動畫
gsap.to('.bottom-nav-wrapper', { 
  yPercent: 100, 
  duration: 0.5, 
  ease: 'power3.inOut' 
});
```

但 [BottomNav.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/shared/components/layout/BottomNav.tsx) 的最外層 div **沒有** `.bottom-nav-wrapper` class：

```tsx
// Line 80: BottomNav 的最外層 div
<div className="fixed bottom-0 left-0 right-0 z-40">
  {/* ... */}
</div>
```

### 2. 缺少必要的 class 標記

GSAP 動畫需要目標元素有對應的 class 才能正確操作，目前 `BottomNav.tsx` 缺少 `bottom-nav-wrapper` class，導致 GSAP 找不到目標元素。

### 3. 可能還缺少頂部導航的 wrapper

雖然問題描述只提到 `BottomNav.tsx`，但 `CameraCapture.tsx` 同時也嘗試隱藏 `.top-nav-wrapper`。需要確認專案中是否也有頂部導航元件，並確保它也有正確的 class。

## 修復方案

### 方案 A：在 BottomNav 新增 wrapper class（推薦）✅

**優點：**
- 不需要修改 GSAP 動畫邏輯
- 維持 GSAP 動畫的一致性
- 未來其他頁面也可以使用相同的動畫機制

**缺點：**
- 需要確保其他使用 BottomNav 的頁面不會受到影響

**實作步驟：**

1. 修改 [BottomNav.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/shared/components/layout/BottomNav.tsx#L80):
```diff
-    <div className="fixed bottom-0 left-0 right-0 z-40">
+    <div className="bottom-nav-wrapper fixed bottom-0 left-0 right-0 z-40">
       {/* 外層容器：陰影 + 圓角只在上方 + 裁切 */}
```

2. 檢查是否有頂部導航元件（例如 `TopNav.tsx` 或 `Header.tsx`），並確保它也有 `top-nav-wrapper` class

### 方案 B：修改 GSAP 選擇器

**優點：**
- 不需要修改 BottomNav 的結構
- 可以使用現有的 class 或其他選擇器

**缺點：**
- 需要修改 CameraCapture 的邏輯
- 選擇器可能不夠明確，可能會影響到其他元素

**實作步驟：**

1. 修改 [CameraCapture.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/components/features/CameraCapture.tsx#L46-L78) 的 GSAP 選擇器：
```diff
-      gsap.to('.bottom-nav-wrapper', {
+      gsap.to('.fixed.bottom-0', {
         yPercent: 100,
         duration: 0.5,
         ease: 'power3.inOut'
       });
```

但這個方案**不推薦**，因為 `.fixed.bottom-0` 可能會選到頁面上其他固定在底部的元素。

## 建議修復方案

> [!IMPORTANT]
> **推薦使用方案 A**，原因如下：
> 1. 更明確的語意化 class 名稱
> 2. 不會影響到其他元素
> 3. 維持 GSAP 動畫邏輯的一致性
> 4. 未來擴展性更好

## 修改檔案清單

### 必須修改

#### [BottomNav.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/shared/components/layout/BottomNav.tsx#L80)
- 在最外層 div 新增 `bottom-nav-wrapper` class

### 需要檢查（可能修改）

#### 頂部導航元件
- 需要找到頂部導航元件（可能是 `TopNav.tsx`、`Header.tsx` 或類似的檔案）
- 確認是否有 `top-nav-wrapper` class
- 如果沒有，需要新增

## 驗證計畫

### 自動測試

目前專案中可能沒有針對動畫的自動化測試，建議先進行手動測試。

### 手動驗證

> [!TIP]
> **測試步驟：**

1. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

2. **測試動畫觸發**
   - 打開瀏覽器並訪問 `http://localhost:5173`
   - 點擊底部導航的掃描按鈕（中間的 FAB 按鈕）
   - 觀察頁面跳轉到 `/upload` 時：
     - ✅ 底部導航應該以動畫方式向下滑出螢幕（0.5 秒）
     - ✅ 如果有頂部導航，應該向上滑出螢幕（0.5 秒）
   
3. **測試動畫還原**
   - 在相機頁面點擊關閉按鈕或返回
   - 觀察頁面跳轉回其他頁面時：
     - ✅ 底部導航應該以動畫方式向上滑入螢幕（0.5 秒）
     - ✅ 如果有頂部導航，應該向下滑入螢幕（0.5 秒）

4. **檢查控制台**
   - 打開瀏覽器開發者工具（F12）
   - 確認沒有 GSAP 相關的錯誤或警告
   - 確認沒有找不到元素的警告

5. **測試其他頁面**
   - 訪問其他頁面（首頁、庫存、設定等）
   - ✅ 確認底部導航正常顯示且沒有異常

### 預期結果

- ✅ 進入相機頁面時，底部導航順暢地向下滑出
- ✅ 離開相機頁面時，底部導航順暢地向上滑入
- ✅ 動畫持續時間約 0.5 秒，使用 `power3.inOut` 緩動
- ✅ 其他頁面的導航功能不受影響
- ✅ 沒有控制台錯誤

## 其他注意事項

### Z-index 層級檢查

確認 `BottomNav.tsx` 的 `z-40` 和相機頁面的元素層級不會衝突。目前看起來：
- BottomNav: `z-40`
- FAB 按鈕: `z-50`
- CameraOverlay 可能也需要適當的 z-index

### 效能考量

GSAP 動畫使用 `yPercent` 而不是 `transform: translateY()`，這是很好的做法，因為：
- 使用百分比相對值，不需要計算固定像素
- 觸發 GPU 加速，效能更好

### 後續優化建議

> [!NOTE]
> 如果未來需要更複雜的動畫控制，可以考慮：
> 
> 1. **建立一個專門的動畫 hook**
>    - 例如 `useNavigationAnimation()`
>    - 集中管理導航動畫邏輯
> 
> 2. **使用 React Context 共享動畫狀態**
>    - 讓不同元件可以協調動畫
> 
> 3. **新增動畫配置選項**
>    - 允許不同頁面自訂動畫行為

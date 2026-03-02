# 拍照頁面重構規劃

## 概述

本次重構旨在改善食物掃描（拍照）頁面的使用者體驗，修復現有問題並實現更沉浸式的拍照介面。

## 參考設計

![設計參考](file:///C:/Users/User/.gemini/antigravity/brain/bcc16fc5-c061-4f21-871d-6974550a3b96/uploaded_image_1764655853100.png)

---

## 現有問題分析

### 問題 1: 錯誤的返回導航

**現象**：
- 點擊拍照畫面的叉叉（關閉按鈕）會導向 `/upload/scan-result`
- 該頁面不應該有資料但卻顯示了資料
- 預期行為應該是返回首頁

**原因分析**：
- `CameraCapture.tsx` 中的 `onClose` 使用 `navigate(-1)`，這會返回到瀏覽器歷史記錄的上一頁
- 如果使用者的導航歷史異常，可能會導向錯誤的頁面
- 資料可能來自於 `location.state`，而 state 可能在某些情況下被保留

**解決方案**：
```typescript
// 將 navigate(-1) 改為明確導向首頁
onClose={() => navigate('/')}
```

### 問題 2: 確認畫面按鈕過多

**現象**：
- 圖片上傳完成後的確認畫面有多餘的按鈕（如：選擇相簿、關閉等）
- 應該只保留「重拍」（叉叉）和「確認」（勾勾）兩個按鈕

**原因分析**：
- `CameraOverlay` 元件在所有狀態下都顯示相同的按鈕配置
- 沒有根據當前狀態（capturing vs done vs processing）來控制按鈕顯示

**解決方案**：
- 在 `CameraOverlay` 中根據 `status` 條件性顯示按鈕
- 當 `!isCapturing` 時，只顯示重拍和確認按鈕

---

## 重構方向

### 1. 全螢幕沉浸式拍照體驗

**目標**：進入拍照頁面時，整個畫面變為相機預覽，移除所有其他 UI 元素。

**實作要點**：
- 拍照頁面應該覆蓋整個視口（viewport）
- 移除 TopNav 和 BottomNav（通過動畫隱藏）
- 相機預覽填滿整個畫面

### 2. 掃描框與遮罩效果

**目標**：在相機預覽上疊加一個掃描框，框外區域顯示半透明黑色遮罩。

**設計規格**：
- 掃描框：自適應視窗大小，保持合適的長寬比（建議 3:4 或 9:16）
- 遮罩：`rgba(0, 0, 0, 0.5)` 半透明黑色
- 掃描框應該有邊角指示器（如設計圖所示）
- 響應式設計：在不同裝置上自動調整大小

**實作方案**：
```tsx
<div className="scan-frame-overlay">
  {/* 四個遮罩區塊（上、下、左、右） */}
  <div className="mask mask-top" />
  <div className="scan-frame">
    {/* 四個邊角 */}
    <div className="corner corner-tl" />
    <div className="corner corner-tr" />
    <div className="corner corner-bl" />
    <div className="corner corner-br" />
  </div>
  <div className="mask mask-bottom" />
</div>
```

### 3. Navigation 動畫（GSAP）

**目標**：進入/離開拍照頁面時，TopNav 向上滑出，BottomNav 向下滑出。

**動畫規格**：
- **進入動畫**（進入拍照頁面）：
  - TopNav：`translateY: -100%`，duration: 0.3s
  - BottomNav：`translateY: 100%`，duration: 0.3s
  - Easing: `power2.out`
  
- **退出動畫**（離開拍照頁面）：
  - TopNav：`translateY: 0`，duration: 0.3s
  - BottomNav：`translateY: 0`，duration: 0.3s

**實作策略**：
- 在 `CameraCapture` 元件中使用 `useEffect` 監聽掛載/卸載
- 使用 GSAP 的 `timeline` 同步動畫
- 確保在元件卸載前動畫完成

**移除現有邏輯**：
- 檢查並移除 `cameraSlice.ts` 中關於 FAB 按鈕切換的邏輯
- 清理相關的 Redux state 和 action

### 4. 初始畫面按鈕配置

**目標**：按照設計圖配置初始畫面的按鈕（如附圖）。

**按鈕配置**：
- **底部中央**：拍照按鈕（大圓形，珊瑚色 `#FF6B6B` 或類似）
- **左下角**：選擇相簿按鈕（小圓形，白色背景，圖片 icon）
- **右下角**：關閉按鈕（小圓形，白色背景，X icon）
- **頂部中央**：提示文字「請將食材放入框內」（黃色背景橢圓形標籤）

**保留功能**：
- 提示視窗（InstructionsModal）：首次進入時顯示使用說明
- 開發者測試按鈕（僅開發環境）

---

## 檔案修改清單

### 核心元件

#### [MODIFY] [CameraCapture.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/components/features/CameraCapture.tsx)
- 修復 `onClose` 導航問題（改為 `navigate('/')` ）
- 添加進入/離開動畫（GSAP）
- 整合新的掃描框元件

#### [MODIFY] [CameraOverlay/index.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/components/ui/CameraOverlay/index.tsx)
- 根據狀態條件性顯示按鈕（確認畫面只顯示重拍和確認）
- 調整按鈕樣式以符合設計圖
- 移除不必要的按鈕

#### [NEW] ScanFrame.tsx
- 創建掃描框元件
- 包含邊角指示器和遮罩效果
- 響應式設計

### Redux State

#### [MODIFY] [cameraSlice.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/food-scan/store/cameraSlice.ts)
- 移除與 FAB 按鈕切換相關的邏輯（如果有）
- 簡化 state 管理

### 佈局相關

#### [MODIFY] MainLayout.tsx 或對應的佈局元件
- 添加用於 GSAP 動畫的 ref
- 確保 TopNav 和 BottomNav 可以被動畫控制

---

## 實作步驟

### Phase 1: 修復現有問題
1. **修復返回導航**
   - [x] 在 `CameraCapture.tsx` 中將 `navigate(-1)` 改為 `navigate('/')`
   - [x] 測試返回功能是否正確

2. **優化確認畫面按鈕**
   - [ ] 在 `CameraOverlay` 中添加條件判斷
   - [ ] 當 `status === 'done' || status === 'error' || isProcessing` 時，隱藏相簿和關閉按鈕
   - [ ] 測試確認畫面是否只顯示重拍和確認

### Phase 2: 創建掃描框元件
1. **設計與實作**
   - [ ] 創建 `ScanFrame.tsx` 元件
   - [ ] 實作遮罩效果（四個方向的半透明黑色）
   - [ ] 實作邊角指示器
   - [ ] 添加響應式邏輯（根據視窗大小調整）

2. **樣式調整**
   - [ ] 使用 Tailwind CSS 或 CSS Modules
   - [ ] 確保在不同裝置上顯示正常

### Phase 3: Navigation 動畫
1. **設定動畫目標**
   - [ ] 在 MainLayout 中為 TopNav 和 BottomNav 添加 ref
   - [ ] 確保這些元素可以被 GSAP 選取

2. **實作進入動畫**
   - [ ] 在 `CameraCapture` 的 `useEffect` 中添加 GSAP 動畫
   - [ ] TopNav 向上滑出
   - [ ] BottomNav 向下滑出

3. **實作退出動畫**
   - [ ] 在元件卸載時執行反向動畫
   - [ ] 確保動畫流暢

4. **清理 Redux**
   - [ ] 移除 `triggerToken` 相關邏輯（如果僅用於 FAB 切換）
   - [ ] 簡化 cameraSlice

### Phase 4: 整合與測試
1. **整合所有元件**
   - [ ] 將 `ScanFrame` 整合到 `CameraCapture`
   - [ ] 確保所有功能正常運作

2. **測試**
   - [ ] 測試進入/離開動畫
   - [ ] 測試掃描框在不同裝置上的顯示
   - [ ] 測試按鈕顯示邏輯
   - [ ] 測試返回導航
   - [ ] 測試提示視窗

3. **優化與調整**
   - [ ] 調整動畫時間和 easing
   - [ ] 調整掃描框大小和位置
   - [ ] 確保按鈕樣式符合設計

---

## 技術細節

### 掃描框尺寸計算

```typescript
const useScanFrameSize = () => {
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // 保持 3:4 比例，並留出適當邊距
      const maxWidth = viewportWidth * 0.8;
      const maxHeight = viewportHeight * 0.6;
      
      let width = maxWidth;
      let height = width * 4 / 3;
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height * 3 / 4;
      }
      
      setFrameSize({ width, height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return frameSize;
};
```

### GSAP 動畫範例

```typescript
useEffect(() => {
  const tl = gsap.timeline();
  
  // 進入動畫
  tl.to('.top-nav', { y: '-100%', duration: 0.3, ease: 'power2.out' })
    .to('.bottom-nav', { y: '100%', duration: 0.3, ease: 'power2.out' }, '<');

  return () => {
    // 退出動畫
    gsap.to('.top-nav', { y: 0, duration: 0.3, ease: 'power2.out' });
    gsap.to('.bottom-nav', { y: 0, duration: 0.3, ease: 'power2.out' });
  };
}, []);
```

---

## 設計規格

### 顏色
- 掃描框邊角：`#FFFFFF` (白色)
- 遮罩：`rgba(0, 0, 0, 0.5)` (半透明黑)
- 拍照按鈕：`#FF6B6B` 或設計指定顏色
- 提示標籤背景：`#FBBF24` (黃色)

### 尺寸
- 掃描框邊角長度：`24px`
- 掃描框邊角粗細：`3px`
- 拍照按鈕直徑：`64px`
- 小按鈕直徑：`48px`

### 動畫
- 進入/退出動畫時長：`0.3s`
- Easing：`power2.out`

---

## 風險與注意事項

1. **GSAP 動畫與 React Router 的配合**
   - 需要確保在路由切換時動畫能正確執行
   - 可能需要延遲路由切換以等待動畫完成

2. **掃描框在不同裝置上的顯示**
   - 需要在多種螢幕尺寸下測試
   - 考慮橫屏模式的處理

3. **效能考量**
   - GSAP 動畫應該不會有效能問題
   - 掃描框的 resize 監聽應該使用防抖（debounce）

---

## 驗證清單

完成後需要驗證以下項目：

- [ ] 點擊關閉按鈕正確返回首頁
- [ ] 確認畫面只顯示重拍和確認按鈕
- [ ] 掃描框正確顯示且自適應
- [ ] 遮罩效果正確
- [ ] TopNav 和 BottomNav 動畫流暢
- [ ] 在 iOS Safari 上測試
- [ ] 在 Android Chrome 上測試
- [ ] 在桌面瀏覽器上測試
- [ ] 提示視窗正常顯示
- [ ] 拍照功能正常
- [ ] 圖片上傳功能正常

---

## 更新記錄

- **2025-12-02**: 初始規劃文件建立

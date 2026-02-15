# PWA 與 LocalStorage 問題分析報告與解決方案

## 1. 問題概述

在手機 PWA 模式下測試時，遇到以下問題：

1. **Mock Data 狀態異常**：因 `localStorage` 保留了舊格式或錯誤資料，導致 UI 顯示不完整，且手機上難以清除快取重置。
2. **PWA 資產更新延遲**：Logo 或樣式更新後，手機 PWA 仍顯示舊版。
3. **iOS 支援不足**：iPhone 主畫面未顯示正確 App Icon。
4. **Splash Screen 背景色不協調**：預設白色背景與 Logo 可能不搭。

## 2. 解決方案 (Mock Data)

為了在不影響正式 API 架構的前提下解決測試問題，我們實作了 **Mock Data 專用的除錯機制**。

### 核心機制

我們建立了一個 `MockRequestHandlers` 工具，所有 Mock API 服務都會透過它來決定資料初始化的策略。

### 兩種模式

1.  **強制重置模式 (Reset Mode)**
    - **觸發方式**：在網址加上 `?reset_mock=true`
    - **行為**：所有 Mock API 在初始化時會自動清除對應的 `localStorage` Key，重新寫入預設資料。
    - **適用場景**：資料跑掉、格式錯誤、想回復到「剛安裝」的狀態時。

2.  **記憶體模式 (Memory Only)**
    - **觸發方式**：在網址加上 `?memory_only=true`
    - **行為**：完全不讀寫 `localStorage`，所有資料變更僅存在於當前 Session (記憶體) 中。重新整理網頁後資料即消失。
    - **適用場景**：公開 Demo、業務展示、自動化測試，確保每次開啟都是乾淨且一致的完美狀態。

## 3. 解決方案 (PWA & UI)

### iOS Icon 支援

iOS Safari 不支援 Web Manifest 的 `icons` 欄位，必須在 `index.html` 中明確宣告 `apple-touch-icon`。
已新增：`<link rel="apple-touch-icon" href="..." />`

### Splash Screen 與顏色變數

調整了 `vite.config.ts` 中的 PWA 設定：

- `theme_color`: 設定瀏覽器網址列顏色。
- `background_color`: 設定 Splash Screen 背景色（建議配合 Logo 底色）。

## 4. 如何測試

### 手機端重置 Mock 資料

1. 開啟 App。
2. 如果發現資料有誤，或想重置所有資料。
3. 透過連結或網址列輸入：`https://your-domain.com/?reset_mock=true`
4. App 會重新載入並還原預設資料。

### iOS PWA 安裝

1. 使用 Safari 開啟網站。
2. 點擊「分享」按鈕 ->「加入主畫面」。
3. 確認 Icon 是否正確顯示。

# Planning Module Fixes

## 1. 原本的假資料消失

**問題描述**：使用者回報假資料消失。
**分析**：可能原因包含：

1. `localStorage` 清除後 `MockSharedListApi` 初始化邏輯未正確執行。
2. 月份篩選邏輯導致在當前月份看不到部分資料。
3. `useSharedLists` 初始資料為空，且與 UI 渲染時機有關。

**修正方案**：

- 在 `MockSharedListApi` 中加入防呆機制，確保 `localStorage` 空值時會寫入預設資料。
- 檢查 `useSharedLists` 的錯誤處理與狀態更新。

## 2. 新增清單按鈕顯示在 Loading 畫面

**問題描述**：新增清單的紅色按鈕會顯示在 loading 畫面上。
**分析**：

- `useSharedLists` 的 `isLoading` 初始值為 `false`。
- 元件初次渲染時 `isLoading` 為 `false`，導致 `SharedPlanningList` 渲染出 FloatingActionButton。

# Planning Module Fixes

## 1. 原本的假資料消失

**問題描述**：使用者回報假資料消失。
**分析**：可能原因包含：

1. `localStorage` 清除後 `MockSharedListApi` 初始化邏輯未正確執行。
2. 月份篩選邏輯導致在當前月份看不到部分資料。
3. `useSharedLists` 初始資料為空，且與 UI 渲染時機有關。

**修正方案**：

- 在 `MockSharedListApi` 中加入防呆機制，確保 `localStorage` 空值時會寫入預設資料。
- 檢查 `useSharedLists` 的錯誤處理與狀態更新。

## 2. 新增清單按鈕顯示在 Loading 畫面

**問題描述**：新增清單的紅色按鈕會顯示在 loading 畫面上。
**分析**：

- `useSharedLists` 的 `isLoading` 初始值為 `false`。
- 元件初次渲染時 `isLoading` 為 `false`，導致 `SharedPlanningList` 渲染出 FloatingActionButton。
- `useEffect` 觸發 `fetchLists` 後 `isLoading` 才變為 `true`，造成閃爍或重疊顯示。

**修正方案**：

- 將 `useSharedLists` 的 `isLoading` 初始值改為 `true`，確保 hooks 在初始抓取資料前處於 Loading 狀態。

## 3. 新增清單頁面按鈕顯示問題

**問題描述**：使用者表示看不到建立按鈕，並要求使用 margin 將其推上來，不要使用定位。
**分析**：

- 目前按鈕使用 `fixed bottom-0` 固定在底部，可能被其他元素遮擋或切版不如預期。
- 使用者希望按鈕跟隨內容流動，確保可見性。

**修正方案**：

- 移除底部按鈕容器的 `fixed` 定位。
- 使用 `mt-8` 或類似 margin 屬性，將按鈕放置於表單內容下方。
- 調整頁面底部的 padding 以確保按鈕下方有足夠呼吸空間。
